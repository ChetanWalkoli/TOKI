import { useState } from 'react';
import { motion } from 'framer-motion';
import { Palette, Sliders, Database, Trash2, RotateCcw } from 'lucide-react';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { categories, priorityOptions } from '../utils/task';

export default function Settings({ settings, updateSettings, clearCompleted, resetData, completedCount = 0 }) {
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  const handleSelect = (key) => (event) => {
    updateSettings({ [key]: event.target.value });
  };

  const handleClearConfirm = () => {
    clearCompleted();
    setConfirmClearOpen(false);
  };

  const handleResetConfirm = () => {
    resetData();
    setConfirmResetOpen(false);
  };

  return (
    <motion.div
      className="page settings-page"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="page-title">
        <p className="eyebrow">Make Toki feel like home</p>
        <h1>Settings</h1>
      </div>

      {/* Appearance */}
      <section className="settings-section">
        <div className="settings-section-title">
          <Palette size={18} />
          <h2>Appearance</h2>
        </div>

        <div className="settings-row">
          <div className="settings-label-wrap">
            <strong>Color Theme</strong>
            <small>Choose how Toki looks. System will match your OS settings automatically.</small>
          </div>
          <div className="theme-toggle-group" role="radiogroup" aria-label="Color theme">
            {[
              { id: 'system', label: 'System' },
              { id: 'light', label: 'Light' },
              { id: 'dark', label: 'Dark' },
            ].map(({ id, label }) => (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={settings.theme === id}
                className={`theme-pill ${settings.theme === id ? 'active' : ''}`}
                onClick={() => updateSettings({ theme: id })}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* New Task Defaults */}
      <section className="settings-section">
        <div className="settings-section-title">
          <Sliders size={18} />
          <h2>Task Defaults</h2>
        </div>

        <label className="settings-row">
          <div className="settings-label-wrap">
            <strong>Default Priority</strong>
            <small>Automatically assigned when you quick-add a task.</small>
          </div>
          <select
            value={settings.defaultPriority}
            onChange={handleSelect('defaultPriority')}
            aria-label="Default priority"
          >
            {priorityOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label className="settings-row">
          <div className="settings-label-wrap">
            <strong>Default Category</strong>
            <small>Default folder or context for newly captured items.</small>
          </div>
          <select
            value={settings.defaultCategory}
            onChange={handleSelect('defaultCategory')}
            aria-label="Default category"
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      </section>

      {/* Data Management */}
      <section className="settings-section">
        <div className="settings-section-title">
          <Database size={18} />
          <h2>Data & Storage</h2>
        </div>

        <div className="settings-row">
          <div className="settings-label-wrap">
            <strong>Clear Completed Tasks</strong>
            <small>
              Removes finished tasks from your database ({completedCount} completed tasks currently stored).
            </small>
          </div>
          <button
            type="button"
            className="button button-ghost"
            onClick={() => setConfirmClearOpen(true)}
            disabled={completedCount === 0}
          >
            <Trash2 size={15} />
            <span>Clear completed</span>
          </button>
        </div>

        <div className="settings-row">
          <div className="settings-label-wrap">
            <strong>Reset Local Data</strong>
            <small>Restores the initial sample tasks and resets settings to default.</small>
          </div>
          <button
            type="button"
            className="button button-danger"
            onClick={() => setConfirmResetOpen(true)}
          >
            <RotateCcw size={15} />
            <span>Reset data</span>
          </button>
        </div>
      </section>

      {/* About Toki */}
      <section className="settings-section settings-about">
        <p className="eyebrow">About Toki</p>
        <p className="about-text">
          Toki is designed with warmth and care to make progress feel good. All your tasks are stored safely on your own device in local storage.
        </p>
        <p className="version-tag">Toki v1.0.0 · Indie Productivity</p>
      </section>

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        open={confirmClearOpen}
        title="Clear completed tasks?"
        message={`Are you sure you want to remove all ${completedCount} completed tasks? Active tasks will remain untouched.`}
        confirmLabel="Clear tasks"
        cancelLabel="Keep them"
        isDanger={false}
        onConfirm={handleClearConfirm}
        onCancel={() => setConfirmClearOpen(false)}
      />

      <ConfirmDialog
        open={confirmResetOpen}
        title="Reset all local data?"
        message="This will wipe your stored tasks and restore the starter set. This cannot be undone. Are you sure?"
        confirmLabel="Yes, reset everything"
        cancelLabel="Cancel"
        isDanger={true}
        onConfirm={handleResetConfirm}
        onCancel={() => setConfirmResetOpen(false)}
      />
    </motion.div>
  );
}
