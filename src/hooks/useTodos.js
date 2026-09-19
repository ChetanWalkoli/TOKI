import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { initialTasks, initialProjects } from '../data/seed';
import {
  readStore,
  writeStore,
  sanitizeTask,
  clearStore,
  readProjects,
  writeProjects,
  sanitizeProject,
  readActivityLog,
  logActivityItem,
  readOfflineQueue,
  pushOfflineQueue,
  clearOfflineQueue,
  detectTaskConflict,
} from '../services/storage';
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

  // Projects state
  const [projects, setProjects] = useState(() => {
    return readProjects(initialProjects);
  });

  // Activity Log state
  const [activityLog, setActivityLog] = useState(() => {
    return readActivityLog(50);
  });

  // Conflict Resolution state
  const [pendingConflict, setPendingConflict] = useState(null);

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

      // Check for conflicts against local modified tasks
      const localStore = readStore({ tasks: [] }).tasks || [];
      for (const ct of cloudTasks) {
        const localMatch = localStore.find((lt) => lt.id === ct.id);
        if (localMatch) {
          const conflict = detectTaskConflict(localMatch, ct);
          if (conflict && conflict.hasConflict) {
            setPendingConflict(conflict);
            break;
          }
        }
      }

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
      loadCloudTasks();
    });

    return () => {
      sub.unsubscribe();
    };
  }, [user, isConfigured, loadCloudTasks]);

  // Local storage persistence for tasks
  useEffect(() => {
    if (!user) {
      const currentStore = readStore({});
      writeStore({ ...currentStore, tasks });
    }
  }, [tasks, user]);

  // Local storage persistence for projects
  useEffect(() => {
    writeProjects(projects);
  }, [projects]);

  // Migrate local tasks into Supabase
  const migrateLocalToCloud = async () => {
    if (!user || !isConfigured) return 0;
    const localTasks = readStore({ tasks: [] }).tasks || [];
    if (localTasks.length === 0) return 0;

    setLoading(true);
    try {
      const importedCount = await migrateLocalTasks(localTasks, user.id);
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
  // TASK CRUD WITH OPTIMISTIC UPDATES & ACTIVITY LOGGING
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
        dueTime: parsed.dueTime,
        priority: parsed.priority,
        estimatedMinutes: parsed.estimatedMinutes,
        projectId: parsed.projectId,
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
      dueTime: initialProps.dueTime || '',
      estimatedMinutes: initialProps.estimatedMinutes || 0,
      projectId: initialProps.projectId || null,
      dependsOn: initialProps.dependsOn || [],
      attachments: initialProps.attachments || [],
      comments: initialProps.comments || [],
      subtasks: initialProps.subtasks || [],
      tags: initialProps.tags || [],
      focusSessions: 0,
      focusMinutes: 0,
      completed: false,
      createdAt: now,
      updatedAt: now,
      completedAt: null,
    });

    prevTasksRef.current = tasks;
    setTasks((prev) => [optimisticTask, ...prev]);
    setLastAction('created');

    // Meaningful activity logging
    const logged = logActivityItem({
      action: 'created',
      entityType: 'task',
      entityTitle: optimisticTask.title,
      userName: user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'You',
    });
    if (logged) setActivityLog((prev) => [logged, ...prev]);

    if (user && isConfigured) {
      try {
        const cloudTask = await createCloudTask(optimisticTask, user.id);
        if (cloudTask) {
          setTasks((prev) =>
            prev.map((t) => (t.id === optimisticId ? cloudTask : t))
          );
        }
      } catch (err) {
        console.error('Toki: Failed to save task to cloud, queueing offline:', err);
        pushOfflineQueue({ type: 'create', task: optimisticTask });
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
        console.error('Toki: Failed to update cloud task, queueing offline:', err);
        pushOfflineQueue({ type: 'update', id, changes });
      }
    }
  };

  const deleteTask = async (id) => {
    const taskToDelete = tasks.find((t) => t.id === id);
    prevTasksRef.current = tasks;
    setTasks((prev) => prev.filter((task) => task.id !== id));
    setLastAction('deleted');

    if (taskToDelete) {
      const logged = logActivityItem({
        action: 'deleted',
        entityType: 'task',
        entityTitle: taskToDelete.title,
        userName: user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'You',
      });
      if (logged) setActivityLog((prev) => [logged, ...prev]);
    }

    if (user && isConfigured) {
      try {
        await deleteCloudTask(id);
      } catch (err) {
        console.error('Toki: Failed to delete cloud task, queueing offline:', err);
        pushOfflineQueue({ type: 'delete', id });
      }
    }
  };

  const toggleTask = async (id) => {
    let nextStatus = false;
    let toggledTaskTitle = '';
    prevTasksRef.current = tasks;

    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== id) return task;
        nextStatus = !task.completed;
        toggledTaskTitle = task.title;
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

    if (toggledTaskTitle) {
      const logged = logActivityItem({
        action: nextStatus ? 'completed' : 'reopened',
        entityType: 'task',
        entityTitle: toggledTaskTitle,
        userName: user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'You',
      });
      if (logged) setActivityLog((prev) => [logged, ...prev]);
    }

    if (user && isConfigured) {
      try {
        await toggleCloudTask(id, nextStatus);
      } catch (err) {
        console.error('Toki: Failed to toggle cloud task, queueing offline:', err);
        pushOfflineQueue({ type: 'toggle', id, completed: nextStatus });
      }
    }
  };

  const setTaskStatus = async (id, newStatus) => {
    const isDone = newStatus === 'done';
    let targetTitle = '';
    prevTasksRef.current = tasks;

    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== id) return task;
        targetTitle = task.title;
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
    setLastAction(`moved_to_${newStatus}`);

    if (targetTitle) {
      const logged = logActivityItem({
        action: `moved to ${newStatus.replace('_', ' ')}`,
        entityType: 'task',
        entityTitle: targetTitle,
        userName: user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'You',
      });
      if (logged) setActivityLog((prev) => [logged, ...prev]);
    }

    if (user && isConfigured) {
      try {
        await setCloudStatusApi(id, newStatus, isDone);
      } catch (err) {
        console.error('Toki: Failed to update status on cloud, queueing offline:', err);
        pushOfflineQueue({ type: 'setStatus', id, status: newStatus, completed: isDone });
      }
    }
  };

  const addSubtask = async (taskId, title) => {
    const cleanTitle = typeof title === 'string' ? title.trim() : '';
    if (!cleanTitle) return;

    const newSubtask = {
      id: crypto.randomUUID(),
      title: cleanTitle,
      completed: false,
    };

    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== taskId) return task;
        return sanitizeTask({
          ...task,
          subtasks: [...(task.subtasks || []), newSubtask],
          updatedAt: Date.now(),
        });
      })
    );

    if (user && isConfigured) {
      try {
        await addCloudSubtask(taskId, newSubtask, user.id);
      } catch (err) {
        console.warn('Toki: Failed to add subtask to cloud:', err);
      }
    }
  };

  const toggleSubtask = async (taskId, subtaskId) => {
    let nextStatus = false;
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== taskId) return task;
        const subtasks = (task.subtasks || []).map((st) => {
          if (st.id !== subtaskId) return st;
          nextStatus = !st.completed;
          return { ...st, completed: nextStatus };
        });
        return sanitizeTask({ ...task, subtasks, updatedAt: Date.now() });
      })
    );

    if (user && isConfigured) {
      try {
        await toggleCloudSubtask(subtaskId, nextStatus);
      } catch (err) {
        console.warn('Toki: Failed to toggle subtask on cloud:', err);
      }
    }
  };

  const deleteSubtask = async (taskId, subtaskId) => {
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
        console.warn('Toki: Failed to delete subtask from cloud:', err);
      }
    }
  };

  const addTag = (taskId, tag) => {
    const clean = tag.trim().replace(/^#/, '').toLowerCase();
    if (!clean) return;
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== taskId) return task;
        const existingTags = task.tags || [];
        if (existingTags.includes(clean)) return task;
        return sanitizeTask({
          ...task,
          tags: [...existingTags, clean],
          updatedAt: Date.now(),
        });
      })
    );
  };

  const removeTag = (taskId, tagToRemove) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== taskId) return task;
        return sanitizeTask({
          ...task,
          tags: (task.tags || []).filter((t) => t !== tagToRemove),
          updatedAt: Date.now(),
        });
      })
    );
  };

  const logFocusSession = (taskId, minutes) => {
    if (!taskId || !minutes) return;
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== taskId) return task;
        return sanitizeTask({
          ...task,
          focusSessions: (task.focusSessions || 0) + 1,
          focusMinutes: (task.focusMinutes || 0) + minutes,
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

  // ---------------------------------------------------------------------------
  // V4: PROJECT MANAGEMENT
  // ---------------------------------------------------------------------------
  const createProject = (projectData) => {
    const sanitized = sanitizeProject({
      ...projectData,
      id: crypto.randomUUID(),
      ownerId: user?.id || 'local-user',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    setProjects((prev) => [sanitized, ...prev]);

    const logged = logActivityItem({
      action: 'created',
      entityType: 'project',
      entityTitle: sanitized.name,
      userName: user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'You',
    });
    if (logged) setActivityLog((prev) => [logged, ...prev]);

    return sanitized;
  };

  const updateProject = (projectId, changes) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        return sanitizeProject({
          ...p,
          ...changes,
          updatedAt: Date.now(),
        });
      })
    );
  };

  const deleteProject = (projectId) => {
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
    // Disassociate tasks from deleted project
    setTasks((prev) =>
      prev.map((t) => (t.projectId === projectId ? { ...t, projectId: null } : t))
    );
  };

  // ---------------------------------------------------------------------------
  // V4: CONFLICT RESOLUTION
  // ---------------------------------------------------------------------------
  const resolveConflict = async (mergedTask) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === mergedTask.id ? mergedTask : t))
    );
    setPendingConflict(null);

    if (user && isConfigured) {
      try {
        await updateCloudTask(mergedTask.id, mergedTask);
      } catch (err) {
        console.warn('Toki: Failed to persist conflict resolution to cloud:', err);
      }
    }
  };

  // Metrics
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
    projects,
    activityLog,
    stats,
    todayStats,
    streak,
    loading,
    error,
    lastAction,
    hasLocalTasksToMigrate,
    pendingConflict,
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
    createProject,
    updateProject,
    deleteProject,
    resolveConflict,
    setPendingConflict,
    migrateLocalToCloud,
    dismissMigration,
    refreshTasks: loadCloudTasks,
    setTasks,
  };
}
