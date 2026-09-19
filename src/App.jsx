import { useState, useEffect } from 'react';
import { Navigate, Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import Modal from './components/common/Modal';
import TaskForm from './components/tasks/TaskForm';
import ConfirmDialog from './components/common/ConfirmDialog';
import CommandPalette from './components/common/CommandPalette';
import KeyboardShortcutsModal from './components/common/KeyboardShortcutsModal';
import MigrateModal from './components/common/MigrateModal';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useTodos } from './hooks/useTodos';
import { useSettings } from './hooks/useSettings';
import { useTheme } from './hooks/useTheme';
import { usePomodoro } from './hooks/usePomodoro';
import { logCloudFocusSession } from './services/focus';
import { sendBrowserNotification } from './services/notifications';

import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Kanban from './pages/Kanban';
import Today from './pages/Today';
import Upcoming from './pages/Upcoming';
import CalendarView from './pages/CalendarView';
import FocusMode from './pages/FocusMode';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import PlanMyDayModal from './components/tasks/PlanMyDayModal';
import AIAssistantModal from './components/common/AIAssistantModal';
import ConflictResolutionModal from './components/common/ConflictResolutionModal';
import { clearStore } from './services/storage';

function AppContent() {
  const { user, profile, isConfigured } = useAuth();
  const todos = useTodos(user, isConfigured);
  const { settings, updateSettings } = useSettings();
  useTheme(profile?.themePreference || settings.theme);

  const navigate = useNavigate();
  const location = useLocation();

  const pomodoro = usePomodoro((taskId, minutes) => {
    todos.logFocusSession(taskId, minutes);
    if (user && isConfigured) {
      logCloudFocusSession(user.id, taskId, minutes);
    }
    // Browser notification when focus completes
    if (profile?.notificationsEnabled ?? true) {
      sendBrowserNotification('Focus session complete! 🎉', {
        body: 'Great work. Take a 5-minute breather or celebrate the progress.',
      });
    }
  });

  const [editingTask, setEditingTask] = useState(null);
  const [query, setQuery] = useState('');
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [shortcutsModalOpen, setShortcutsModalOpen] = useState(false);
  const [planMyDayOpen, setPlanMyDayOpen] = useState(false);
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const [aiTargetTask, setAiTargetTask] = useState(null);

  const handleOpenPlanMyDay = () => setPlanMyDayOpen(true);
  const handleOpenAIAssistant = (task = null) => {
    setAiTargetTask(task);
    setAiAssistantOpen(true);
  };

  const handleOpenAdd = (prefill = {}) => {
    setEditingTask({
      title: '',
      description: '',
      priority: profile?.defaultPriority || settings.defaultPriority || 'Medium',
      category: profile?.defaultCategory || settings.defaultCategory || 'Personal',
      dueDate: new Date().toISOString().slice(0, 10),
      status: 'todo',
      subtasks: [],
      tags: [],
      ...prefill,
    });
  };

  const handleOpenEdit = (task) => {
    setEditingTask(task);
  };

  const handleCloseModal = () => {
    setEditingTask(null);
  };

  const handleSaveTask = async (taskData) => {
    if (editingTask?.id) {
      await todos.updateTask(editingTask.id, taskData);
    } else {
      await todos.addTask(taskData);
    }
    handleCloseModal();
  };

  const handleResetData = () => {
    clearStore();
    window.location.reload();
  };

  const handleToggleTheme = () => {
    const nextTheme = settings.theme === 'dark' ? 'light' : 'dark';
    updateSettings({ theme: nextTheme });
  };

  const handleStartFocusForTask = (taskId) => {
    pomodoro.setSelectedTaskId(taskId);
    navigate(`/focus?taskId=${taskId}`);
  };

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
        return;
      }

      const activeTag = document.activeElement?.tagName;
      const isInputActive =
        activeTag === 'INPUT' ||
        activeTag === 'TEXTAREA' ||
        activeTag === 'SELECT' ||
        document.activeElement?.isContentEditable;

      if (isInputActive) return;

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        handleOpenAdd();
      } else if (e.key === '/') {
        e.preventDefault();
        setCommandPaletteOpen(true);
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        navigate('/focus');
      } else if (e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        navigate('/');
      } else if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        navigate('/today');
      } else if (e.key === 'b' || e.key === 'B') {
        e.preventDefault();
        navigate('/board');
      } else if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        navigate('/calendar');
      } else if (e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        navigate('/analytics');
      } else if (e.key === '?') {
        e.preventDefault();
        setShortcutsModalOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  const completedCount = todos.tasks.filter((t) => t.completed).length;

  // Render standalone auth pages when on auth routes
  const isAuthRoute =
    location.pathname === '/login' ||
    location.pathname === '/signup' ||
    location.pathname === '/forgot-password';

  if (isAuthRoute) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <AppShell
      tasks={todos.tasks}
      projects={todos.projects}
      streak={todos.streak}
      user={user}
      profile={profile}
      onAdd={() => handleOpenAdd()}
      query={query}
      onQueryChange={setQuery}
      onOpenCommandPalette={() => setCommandPaletteOpen(true)}
      onOpenShortcuts={() => setShortcutsModalOpen(true)}
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
              onStartFocus={handleStartFocusForTask}
              onOpenPlanMyDay={handleOpenPlanMyDay}
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
              onStartFocus={handleStartFocusForTask}
            />
          }
        />
        <Route
          path="/projects"
          element={
            <Projects
              projects={todos.projects}
              tasks={todos.tasks}
              onCreateProject={todos.createProject}
              onDeleteProject={todos.deleteProject}
            />
          }
        />
        <Route
          path="/projects/:id"
          element={
            <ProjectDetail
              projects={todos.projects}
              tasks={todos.tasks}
              todos={todos}
              onAdd={handleOpenAdd}
              onEdit={handleOpenEdit}
              onStartFocus={handleStartFocusForTask}
              onUpdateProject={todos.updateProject}
              onDeleteProject={todos.deleteProject}
            />
          }
        />
        <Route
          path="/board"
          element={
            <Kanban
              todos={todos}
              onAdd={handleOpenAdd}
              onEdit={handleOpenEdit}
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
              onStartFocus={handleStartFocusForTask}
              onOpenPlanMyDay={handleOpenPlanMyDay}
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
              onStartFocus={handleStartFocusForTask}
            />
          }
        />
        <Route
          path="/calendar"
          element={
            <CalendarView
              todos={todos}
              onAdd={handleOpenAdd}
              onEdit={handleOpenEdit}
              settings={settings}
            />
          }
        />
        <Route
          path="/focus"
          element={
            <FocusMode
              todos={todos}
              pomodoro={pomodoro}
            />
          }
        />
        <Route
          path="/analytics"
          element={
            <Analytics
              todos={todos}
              pomodoro={pomodoro}
            />
          }
        />
        <Route
          path="/profile"
          element={<Profile />}
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
          task={editingTask}
          defaults={settings}
          projects={todos.projects}
          allTasks={todos.tasks}
          currentUser={user}
          onSave={handleSaveTask}
          onCancel={handleCloseModal}
          onOpenAIAssistant={(formState) => {
            handleOpenAIAssistant({ ...editingTask, ...formState });
          }}
        />
      </Modal>

      {/* Confirmation modal for clearing completed tasks */}
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

      {/* Command Palette */}
      <CommandPalette
        open={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        tasks={todos.tasks}
        projects={todos.projects}
        onOpenAdd={handleOpenAdd}
        onEditTask={handleOpenEdit}
        onOpenPlanMyDay={handleOpenPlanMyDay}
        onOpenAIAssistant={() => handleOpenAIAssistant(null)}
        theme={settings.theme}
        onToggleTheme={handleToggleTheme}
        onOpenShortcuts={() => setShortcutsModalOpen(true)}
      />

      {/* Keyboard Shortcuts Cheat Sheet */}
      <KeyboardShortcutsModal
        open={shortcutsModalOpen}
        onClose={() => setShortcutsModalOpen(false)}
      />

      {/* Local Storage Migration Prompt Modal */}
      <MigrateModal
        open={todos.hasLocalTasksToMigrate}
        onConfirm={todos.migrateLocalToCloud}
        onDismiss={todos.dismissMigration}
      />

      {/* Plan My Day Modal */}
      <PlanMyDayModal
        open={planMyDayOpen}
        onClose={() => setPlanMyDayOpen(false)}
        tasks={todos.tasks}
        onApplyPlan={() => {
          setPlanMyDayOpen(false);
        }}
      />

      {/* AI Task Assistant Modal */}
      <AIAssistantModal
        open={aiAssistantOpen}
        onClose={() => {
          setAiAssistantOpen(false);
          setAiTargetTask(null);
        }}
        initialTask={aiTargetTask}
        projects={todos.projects}
        allTasks={todos.tasks}
        onApplySubtasks={(chosen) => {
          if (editingTask) {
            setEditingTask((prev) => ({
              ...prev,
              subtasks: [
                ...(prev?.subtasks || []),
                ...chosen.map((c) => ({ id: crypto.randomUUID(), title: c.title, completed: false })),
              ],
            }));
          } else if (aiTargetTask?.id) {
            chosen.forEach((st) => todos.addSubtask(aiTargetTask.id, st.title));
          }
        }}
        onApplyEstimates={(est) => {
          if (editingTask) {
            setEditingTask((prev) => ({
              ...prev,
              estimatedMinutes: est.estimatedMinutes,
              priority: est.priority,
            }));
          } else if (aiTargetTask?.id) {
            todos.updateTask(aiTargetTask.id, {
              estimatedMinutes: est.estimatedMinutes,
              priority: est.priority,
            });
          }
        }}
        onApplyDescription={(desc) => {
          if (editingTask) {
            setEditingTask((prev) => ({
              ...prev,
              description: desc,
            }));
          } else if (aiTargetTask?.id) {
            todos.updateTask(aiTargetTask.id, {
              description: desc,
            });
          }
        }}
      />

      {/* Conflict Resolution Modal */}
      <ConflictResolutionModal
        open={todos.pendingConflict !== null}
        conflict={todos.pendingConflict}
        onClose={() => todos.setPendingConflict(null)}
        onResolve={todos.resolveConflict}
      />
    </AppShell>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
