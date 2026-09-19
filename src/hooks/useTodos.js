import { useEffect, useMemo, useState } from 'react';
import { initialTasks } from '../data/seed';
import { readStore, writeStore, sanitizeTask } from '../services/storage';
import { getTodayStats } from '../utils/task';

export function useTodos() {
  const [tasks, setTasks] = useState(() => {
    const stored = readStore({ tasks: initialTasks }).tasks;
    if (Array.isArray(stored) && stored.length > 0) {
      return stored.map(sanitizeTask).filter(Boolean);
    }
    return initialTasks.map(sanitizeTask).filter(Boolean);
  });

  const [lastAction, setLastAction] = useState('idle');

  // Persist tasks whenever they change
  useEffect(() => {
    const currentStore = readStore({});
    writeStore({ ...currentStore, tasks });
  }, [tasks]);

  const addTask = (taskData) => {
    const now = Date.now();
    const newTask = sanitizeTask({
      id: crypto.randomUUID(),
      title: taskData.title,
      description: taskData.description || '',
      priority: taskData.priority || 'Medium',
      category: taskData.category || 'Personal',
      dueDate: taskData.dueDate || new Date().toISOString().slice(0, 10),
      completed: false,
      createdAt: now,
      updatedAt: now,
      completedAt: null,
    });

    if (newTask) {
      setTasks((prev) => [newTask, ...prev]);
      setLastAction('created');
      return newTask;
    }
    return null;
  };

  const updateTask = (id, changes) => {
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
  };

  const deleteTask = (id) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
    setLastAction('deleted');
  };

  const toggleTask = (id) => {
    let nextStatus = false;
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== id) return task;
        nextStatus = !task.completed;
        const now = Date.now();
        return {
          ...task,
          completed: nextStatus,
          completedAt: nextStatus ? now : null,
          updatedAt: now,
        };
      })
    );
    setLastAction(nextStatus ? 'completed' : 'reopened');
  };

  const clearCompleted = () => {
    setTasks((prev) => prev.filter((task) => !task.completed));
    setLastAction('cleared');
  };

  // Overall metrics across all tasks
  const stats = useMemo(() => {
    const total = tasks.length;
    const complete = tasks.filter((t) => t.completed).length;
    const remaining = total - complete;
    const percent = total > 0 ? Math.round((complete / total) * 100) : 0;
    return { total, complete, remaining, percent };
  }, [tasks]);

  // Today specific metrics
  const todayStats = useMemo(() => {
    return getTodayStats(tasks);
  }, [tasks]);

  return {
    tasks,
    stats,
    todayStats,
    lastAction,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    clearCompleted,
    setTasks,
  };
}
