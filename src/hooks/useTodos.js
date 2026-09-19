import { useEffect, useMemo, useState } from 'react';
import { initialTasks } from '../data/seed';
import { readStore, writeStore } from '../services/storage';

export function useTodos() {
  const [tasks, setTasks] = useState(() => {
    const stored = readStore({ tasks: initialTasks }).tasks;
    return Array.isArray(stored) ? stored.filter((task) => task && typeof task.title === 'string') : initialTasks;
  });
  const [lastAction, setLastAction] = useState('idle');

  const addTask = (task) => {
    setTasks((items) => [{ ...task, id: crypto.randomUUID(), completed: false, createdAt: Date.now(), updatedAt: Date.now() }, ...items]);
    setLastAction('created');
  };
  const updateTask = (id, changes) => {
    setTasks((items) => items.map((task) => task.id === id ? { ...task, ...changes, updatedAt: Date.now() } : task));
    setLastAction('edited');
  };
  const deleteTask = (id) => {
    setTasks((items) => items.filter((task) => task.id !== id));
    setLastAction('deleted');
  };
  const toggleTask = (id) => {
    setTasks((items) => items.map((task) => task.id === id ? { ...task, completed: !task.completed, completedAt: task.completed ? null : Date.now(), updatedAt: Date.now() } : task));
    const task = tasks.find((item) => item.id === id);
    setLastAction(task?.completed ? 'reopened' : 'completed');
  };
  const stats = useMemo(() => {
    const total = tasks.length;
    const complete = tasks.filter((task) => task.completed).length;
    return { total, complete, percent: total ? Math.round((complete / total) * 100) : 0 };
  }, [tasks]);

  useEffect(() => { writeStore({ ...readStore({}), tasks }); }, [tasks]);

  return { tasks, stats, lastAction, addTask, updateTask, deleteTask, toggleTask, clearCompleted: () => { setTasks((items) => items.filter((task) => !task.completed)); setLastAction('cleared'); } };
}
