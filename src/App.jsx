import { useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import Modal from './components/common/Modal';
import TaskForm from './components/tasks/TaskForm';
import { useTodos } from './hooks/useTodos';
import { useSettings } from './hooks/useSettings';
import { useTheme } from './hooks/useTheme';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Today from './pages/Today';
import Upcoming from './pages/Upcoming';
import Settings from './pages/Settings';
import { clearStore } from './services/storage';

export default function App() {
  const todos = useTodos();
  const { settings, updateSettings } = useSettings();
  useTheme(settings.theme);
  const [editing, setEditing] = useState(null);
  const [query, setQuery] = useState('');
  const close = () => setEditing(null);
  const save = (task) => { if (editing?.id) todos.updateTask(editing.id, task); else todos.addTask(task); close(); };
  const resetData = () => { clearStore(); window.location.reload(); };
  return <AppShell onAdd={() => setEditing({})} query={query} onQueryChange={setQuery}><Routes>
    <Route path="/" element={<Dashboard todos={todos} onAdd={() => setEditing({})} onEdit={setEditing} />} />
    <Route path="/tasks" element={<Tasks todos={todos} onEdit={setEditing} query={query} onQueryChange={setQuery} />} />
    <Route path="/today" element={<Today todos={todos} onEdit={setEditing} />} />
    <Route path="/upcoming" element={<Upcoming todos={todos} onEdit={setEditing} />} />
    <Route path="/settings" element={<Settings settings={settings} updateSettings={updateSettings} clearCompleted={todos.clearCompleted} resetData={resetData} />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes><Modal open={editing !== null} onClose={close} title={editing?.id ? 'Edit your task' : 'A small step, a real win'}><TaskForm task={editing?.id ? editing : null} defaults={settings} onSave={save} onCancel={close} /></Modal></AppShell>;
}
