import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { initialTasks } from '../data/seed';
import { readStore, writeStore, sanitizeTask, clearStore } from '../services/storage';
import {
  fetchTasks,
  createCloudTask,
  updateCloudTask,
  deleteCloudTask,
  toggleCloudTask,
  setCloudTaskStatus as setCloudStatusApi,
  addCloudSubtask,
  toggleCloudSubtask,
  deleteCloudSubtask,
  migrateLocalTasks,
  subscribeToTaskChanges,
} from '../services/tasks';
import { getTodayStats, calculateStreak, parseTaskInput } from '../utils/task';

export function useTodos(user = null, isConfigured = false) {
  // Read local store initially
  const [tasks, setTasks] = useState(() => {
    const stored = readStore({ tasks: initialTasks }).tasks;
    if (Array.isArray(stored) && stored.length > 0) {
      return stored.map(sanitizeTask).filter(Boolean);
    }
    return initialTasks.map(sanitizeTask).filter(Boolean);
  });

  const [loading, setLoading] = useState(Boolean(user));
  const [error, setError] = useState(null);
  const [lastAction, setLastAction] = useState('idle');
  const [hasLocalTasksToMigrate, setHasLocalTasksToMigrate] = useState(false);

  const prevTasksRef = useRef(tasks);

  // Check if there are local tasks to migrate when a user logs in
  useEffect(() => {
    if (user && isConfigured) {
      const stored = readStore({ tasks: [] }).tasks;
      if (Array.isArray(stored) && stored.length > 0) {
        setHasLocalTasksToMigrate(true);
      }
    } else {
      setHasLocalTasksToMigrate(false);
    }
  }, [user, isConfigured]);

  // Load tasks from Supabase when user changes
  const loadCloudTasks = useCallback(async () => {
    if (!user || !isConfigured) return;
    setLoading(true);
    setError(null);
    try {
      const cloudTasks = await fetchTasks(user.id);
      setTasks(cloudTasks);
    } catch (err) {
      console.error('Toki: Cloud task load failed:', err);
      setError('Failed to sync tasks from cloud. Showing cached tasks.');
    } finally {
      setLoading(false);
    }
  }, [user, isConfigured]);

  useEffect(() => {
    if (user && isConfigured) {
      loadCloudTasks();
    }
  }, [user, isConfigured, loadCloudTasks]);

  // Realtime subscription for multi-tab / multi-device sync
  useEffect(() => {
    if (!user || !isConfigured) return;

    const sub = subscribeToTaskChanges(user.id, () => {
      // Reload on remote changes
      loadCloudTasks();
    });

    return () => {
      sub.unsubscribe();
    };
  }, [user, isConfigured, loadCloudTasks]);

  // Local storage persistence when not logged in
  useEffect(() => {
    if (!user) {
      const currentStore = readStore({});
      writeStore({ ...currentStore, tasks });
    }
  }, [tasks, user]);

  // Migrate local tasks into Supabase
  const migrateLocalToCloud = async () => {
    if (!user || !isConfigured) return 0;
    const localTasks = readStore({ tasks: [] }).tasks || [];
    if (localTasks.length === 0) return 0;

    setLoading(true);
    try {
      const importedCount = await migrateLocalTasks(localTasks, user.id);
      // Clear local store after successful migration so they aren't duplicate imported
      clearStore();
      setHasLocalTasksToMigrate(false);
      await loadCloudTasks();
      return importedCount;
    } catch (err) {
      console.error('Toki: Migration failed:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const dismissMigration = () => {
    setHasLocalTasksToMigrate(false);
  };

  // ---------------------------------------------------------------------------
  // CRUD OPERATIONS WITH OPTIMISTIC UPDATES
  // ---------------------------------------------------------------------------

  const addTask = async (taskData) => {
    const now = Date.now();
    let initialProps = { ...taskData };

    if (typeof taskData.rawInput === 'string') {
      const parsed = parseTaskInput(taskData.rawInput);
      initialProps = {
        ...initialProps,
        title: parsed.title,
        dueDate: parsed.dueDate,
        priority: parsed.priority,
        tags: parsed.tags.length > 0 ? parsed.tags : initialProps.tags || [],
      };
    }

    const optimisticId = crypto.randomUUID();
    const optimisticTask = sanitizeTask({
      id: optimisticId,
      title: initialProps.title,
      description: initialProps.description || '',
      priority: initialProps.priority || 'Medium',
      category: initialProps.category || 'Personal',
      status: initialProps.status || 'todo',
      dueDate: initialProps.dueDate || new Date().toISOString().slice(0, 10),
      subtasks: initialProps.subtasks || [],
      tags: initialProps.tags || [],
      focusSessions: 0,
      focusMinutes: 0,
      completed: false,
      createdAt: now,
      updatedAt: now,
      completedAt: null,
    });

    // Optimistic state update
    prevTasksRef.current = tasks;
    setTasks((prev) => [optimisticTask, ...prev]);
    setLastAction('created');

    if (user && isConfigured) {
      try {
        const cloudTask = await createCloudTask(optimisticTask, user.id);
        if (cloudTask) {
          setTasks((prev) =>
            prev.map((t) => (t.id === optimisticId ? cloudTask : t))
          );
        }
      } catch (err) {
        console.error('Toki: Failed to save task to cloud, rolling back:', err);
        setTasks(prevTasksRef.current);
        setError('Failed to create task on the cloud.');
      }
    }

    return optimisticTask;
  };

  const updateTask = async (id, changes) => {
    prevTasksRef.current = tasks;
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== id) return task;
        return sanitizeTask({
          ...task,
          ...changes,
          updatedAt: Date.now(),
        });
      })
    );
    setLastAction('edited');

    if (user && isConfigured) {
      try {
        await updateCloudTask(id, changes);
      } catch (err) {
        console.error('Toki: Failed to update cloud task, rolling back:', err);
        setTasks(prevTasksRef.current);
        setError('Failed to save changes to cloud.');
      }
    }
  };

  const deleteTask = async (id) => {
    prevTasksRef.current = tasks;
    setTasks((prev) => prev.filter((task) => task.id !== id));
    setLastAction('deleted');

    if (user && isConfigured) {
      try {
        await deleteCloudTask(id);
      } catch (err) {
        console.error('Toki: Failed to delete cloud task, rolling back:', err);
        setTasks(prevTasksRef.current);
        setError('Failed to delete task from cloud.');
      }
    }
  };

  const toggleTask = async (id) => {
    let nextStatus = false;
    prevTasksRef.current = tasks;

    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== id) return task;
        nextStatus = !task.completed;
        const now = Date.now();
        return sanitizeTask({
          ...task,
          completed: nextStatus,
          status: nextStatus ? 'done' : 'todo',
          completedAt: nextStatus ? now : null,
          updatedAt: now,
        });
      })
    );
    setLastAction(nextStatus ? 'completed' : 'reopened');

    if (user && isConfigured) {
      try {
        await toggleCloudTask(id, nextStatus);
      } catch (err) {
        console.error('Toki: Failed to toggle cloud task, rolling back:', err);
        setTasks(prevTasksRef.current);
        setError('Failed to update task completion on cloud.');
      }
    }
  };

  const setTaskStatus = async (id, newStatus) => {
    const isDone = newStatus === 'done';
    prevTasksRef.current = tasks;

    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== id) return task;
        const now = Date.now();
        return sanitizeTask({
          ...task,
          status: newStatus,
          completed: isDone,
          completedAt: isDone ? (task.completedAt || now) : null,
          updatedAt: now,
        });
      })
    );
    setLastAction(isDone ? 'completed' : 'edited');

    if (user && isConfigured) {
      try {
        await setCloudStatusApi(id, newStatus);
      } catch (err) {
        console.error('Toki: Failed to update status on cloud, rolling back:', err);
        setTasks(prevTasksRef.current);
        setError('Failed to update task status on cloud.');
      }
    }
  };

  // Subtasks
  const addSubtask = async (taskId, title) => {
    if (!title || !title.trim()) return;
    const tempId = crypto.randomUUID();
    prevTasksRef.current = tasks;

    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== taskId) return task;
        const subtasks = [
          ...(task.subtasks || []),
          { id: tempId, title: title.trim(), completed: false },
        ];
        return sanitizeTask({ ...task, subtasks, updatedAt: Date.now() });
      })
    );

    if (user && isConfigured) {
      try {
        const cloudSubtask = await addCloudSubtask(taskId, user.id, title.trim());
        if (cloudSubtask) {
          setTasks((prev) =>
            prev.map((task) => {
              if (task.id !== taskId) return task;
              const subtasks = (task.subtasks || []).map((st) =>
                st.id === tempId ? { ...st, id: cloudSubtask.id } : st
              );
              return { ...task, subtasks };
            })
          );
        }
      } catch (err) {
        console.error('Toki: Failed to add subtask to cloud:', err);
      }
    }
  };

  const toggleSubtask = async (taskId, subtaskId) => {
    let nextCompleted = false;
    prevTasksRef.current = tasks;

    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== taskId) return task;
        const subtasks = (task.subtasks || []).map((st) => {
          if (st.id === subtaskId) {
            nextCompleted = !st.completed;
            return { ...st, completed: nextCompleted };
          }
          return st;
        });
        return sanitizeTask({ ...task, subtasks, updatedAt: Date.now() });
      })
    );

    if (user && isConfigured) {
      try {
        await toggleCloudSubtask(subtaskId, nextCompleted);
      } catch (err) {
        console.error('Toki: Failed to toggle subtask on cloud:', err);
      }
    }
  };

  const deleteSubtask = async (taskId, subtaskId) => {
    prevTasksRef.current = tasks;
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== taskId) return task;
        const subtasks = (task.subtasks || []).filter((st) => st.id !== subtaskId);
        return sanitizeTask({ ...task, subtasks, updatedAt: Date.now() });
      })
    );

    if (user && isConfigured) {
      try {
        await deleteCloudSubtask(subtaskId);
      } catch (err) {
        console.error('Toki: Failed to delete subtask on cloud:', err);
      }
    }
  };

  // Tags
  const addTag = (taskId, tag) => {
    const cleanTag = tag.trim().replace(/^#/, '').toLowerCase();
    if (!cleanTag) return;
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== taskId) return task;
        const tags = [...new Set([...(task.tags || []), cleanTag])];
        return sanitizeTask({ ...task, tags, updatedAt: Date.now() });
      })
    );
  };

  const removeTag = (taskId, tagToRemove) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== taskId) return task;
        const tags = (task.tags || []).filter((t) => t !== tagToRemove);
        return sanitizeTask({ ...task, tags, updatedAt: Date.now() });
      })
    );
  };

  const logFocusSession = async (taskId, durationMinutes = 25) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== taskId) return task;
        return sanitizeTask({
          ...task,
          focusSessions: (task.focusSessions || 0) + 1,
          focusMinutes: (task.focusMinutes || 0) + durationMinutes,
          updatedAt: Date.now(),
        });
      })
    );
  };

  const clearCompleted = async () => {
    const completedTasks = tasks.filter((t) => t.completed);
    setTasks((prev) => prev.filter((task) => !task.completed));
    setLastAction('cleared');

    if (user && isConfigured) {
      for (const t of completedTasks) {
        try {
          await deleteCloudTask(t.id);
        } catch (err) {
          console.warn('Toki: Cloud delete error during clear completed:', err);
        }
      }
    }
  };

  // Overall metrics
  const stats = useMemo(() => {
    const total = tasks.length;
    const complete = tasks.filter((t) => t.completed).length;
    const remaining = total - complete;
    const percent = total > 0 ? Math.round((complete / total) * 100) : 0;
    return { total, complete, remaining, percent };
  }, [tasks]);

  const todayStats = useMemo(() => {
    return getTodayStats(tasks);
  }, [tasks]);

  const streak = useMemo(() => {
    return calculateStreak(tasks);
  }, [tasks]);

  return {
    tasks,
    stats,
    todayStats,
    streak,
    loading,
    error,
    lastAction,
    hasLocalTasksToMigrate,
    setLastAction,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    setTaskStatus,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
    addTag,
    removeTag,
    logFocusSession,
    clearCompleted,
    migrateLocalToCloud,
    dismissMigration,
    refreshTasks: loadCloudTasks,
    setTasks,
  };
}
