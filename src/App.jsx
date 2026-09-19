import { useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import Modal from './components/common/Modal';
import TaskForm from './components/tasks/TaskForm';
import ConfirmDialog from './components/common/ConfirmDialog';
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

  const [editingTask, setEditingTask] = useState(null); // null when modal closed, object when open
  const [query, setQuery] = useState('');
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  const handleOpenAdd = (prefill = {}) => {
    setEditingTask({
      title: '',
      description: '',
      priority: settings.defaultPriority || 'Medium',
      category: settings.defaultCategory || 'Personal',
      dueDate: new Date().toISOString().slice(0, 10),
      ...prefill,
    });
  };

  const handleOpenEdit = (task) => {
    setEditingTask(task);
  };

  const handleCloseModal = () => {
    setEditingTask(null);
  };

  const handleSaveTask = (taskData) => {
    if (editingTask?.id) {
      todos.updateTask(editingTask.id, taskData);
    } else {
      todos.addTask(taskData);
    }
    handleCloseModal();
  };

  const handleResetData = () => {
    clearStore();
    window.location.reload();
  };

  const completedCount = todos.tasks.filter((t) => t.completed).length;

  return (
    <AppShell
      tasks={todos.tasks}
      onAdd={() => handleOpenAdd()}
      query={query}
      onQueryChange={setQuery}
    >
      <Routes>
        <Route
          path="/"
          element={
            <Dashboard
              todos={todos}
              onAdd={handleOpenAdd}
              onEdit={handleOpenEdit}
              settings={settings}
            />
          }
        />
        <Route
          path="/tasks"
          element={
            <Tasks
              todos={todos}
              onAdd={handleOpenAdd}
              onEdit={handleOpenEdit}
              query={query}
              onQueryChange={setQuery}
              settings={settings}
              onClearCompleted={() => setConfirmClearOpen(true)}
            />
          }
        />
        <Route
          path="/today"
          element={
            <Today
              todos={todos}
              onAdd={handleOpenAdd}
              onEdit={handleOpenEdit}
              settings={settings}
            />
          }
        />
        <Route
          path="/upcoming"
          element={
            <Upcoming
              todos={todos}
              onAdd={handleOpenAdd}
              onEdit={handleOpenEdit}
              settings={settings}
            />
          }
        />
        <Route
          path="/settings"
          element={
            <Settings
              settings={settings}
              updateSettings={updateSettings}
              clearCompleted={todos.clearCompleted}
              resetData={handleResetData}
              completedCount={completedCount}
            />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Task Creation & Editing Modal */}
      <Modal
        open={editingTask !== null}
        onClose={handleCloseModal}
        title={editingTask?.id ? 'Edit task' : 'Add a new task'}
      >
        <TaskForm
          task={editingTask?.id ? editingTask : editingTask}
          defaults={settings}
          onSave={handleSaveTask}
          onCancel={handleCloseModal}
        />
      </Modal>

      {/* Confirmation modal for clearing completed tasks from tasks page */}
      <ConfirmDialog
        open={confirmClearOpen}
        title="Clear completed tasks?"
        message={`Are you sure you want to remove all ${completedCount} completed tasks? Active tasks will remain untouched.`}
        confirmLabel="Clear tasks"
        cancelLabel="Cancel"
        isDanger={false}
        onConfirm={() => {
          todos.clearCompleted();
          setConfirmClearOpen(false);
        }}
        onCancel={() => setConfirmClearOpen(false)}
      />
    </AppShell>
  );
}
