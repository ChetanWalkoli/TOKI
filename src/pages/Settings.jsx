import { useState } from 'react';
import { motion } from 'framer-motion';
import { Palette, Sliders, Database, Trash2, RotateCcw } from 'lucide-react';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { categories, priorityOptions } from '../utils/task';

const eyebrowCls = 'text-xs font-semibold tracking-wider text-[var(--color-muted)] uppercase';
const sectionCls = 'flex flex-col gap-4 p-5 rounded-xl border border-[var(--color-line)] bg-[var(--color-paper-card)] shadow-[var(--shadow-sm)]';
const rowCls = 'flex items-center justify-between gap-4 py-3 border-b border-[var(--color-line-subtle)] last:border-b-0';
const selectCls = 'px-3 py-2 rounded-lg border border-[var(--color-line)] bg-[var(--color-paper-subtle)] text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-coral)] transition-all';

export default function Settings({ settings, updateSettings, clearCompleted, resetData, completedCount = 0 }) {
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  const handleSelect = (key) => (event) => updateSettings({ [key]: event.target.value });

  return (
    <motion.div
      className="max-w-2xl mx-auto flex flex-col gap-6"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div>
        <p className={eyebrowCls}>Make Toki feel like home</p>
        <h1 className="font-['Fraunces'] text-3xl font-semibold text-[var(--color-ink)] mt-1">Settings</h1>
      </div>

      {/* Appearance */}
      <section className={sectionCls}>
        <div className="flex items-center gap-2 mb-1">
          <Palette size={17} className="text-[var(--color-muted)]" />
          <h2 className="font-['Fraunces'] font-semibold text-base text-[var(--color-ink)]">Appearance</h2>
        </div>
        <div className={rowCls}>
          <div className="flex flex-col gap-0.5">
            <strong className="text-sm text-[var(--color-ink)]">Color Theme</strong>
            <small className="text-[11px] text-[var(--color-muted)]">Choose how Toki looks. System will match your OS settings automatically.</small>
          </div>
          <div className="flex items-center gap-1 shrink-0" role="radiogroup" aria-label="Color theme">
            {[{ id: 'system', label: 'System' }, { id: 'light', label: 'Light' }, { id: 'dark', label: 'Dark' }].map(({ id, label }) => (
              <button key={id} type="button" role="radio" aria-checked={settings.theme === id}
                onClick={() => updateSettings({ theme: id })}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  settings.theme === id ? 'bg-[var(--color-coral)] text-white' : 'border border-[var(--color-line)] text-[var(--color-ink-secondary)] hover:bg-[var(--color-paper-deep)]'
                }`}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Task Defaults */}
      <section className={sectionCls}>
        <div className="flex items-center gap-2 mb-1">
          <Sliders size={17} className="text-[var(--color-muted)]" />
          <h2 className="font-['Fraunces'] font-semibold text-base text-[var(--color-ink)]">Task Defaults</h2>
        </div>
        {[
          { key: 'defaultPriority', label: 'Default Priority', sub: 'Automatically assigned when you quick-add a task.', options: priorityOptions },
          { key: 'defaultCategory', label: 'Default Category', sub: 'Default folder or context for newly captured items.', options: categories },
        ].map(({ key, label, sub, options }) => (
          <label key={key} className={rowCls}>
            <div className="flex flex-col gap-0.5">
              <strong className="text-sm text-[var(--color-ink)]">{label}</strong>
              <small className="text-[11px] text-[var(--color-muted)]">{sub}</small>
            </div>
            <select value={settings[key]} onChange={handleSelect(key)} aria-label={label} className={selectCls}>
              {options.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
        ))}
      </section>

      {/* Data */}
      <section className={sectionCls}>
        <div className="flex items-center gap-2 mb-1">
          <Database size={17} className="text-[var(--color-muted)]" />
          <h2 className="font-['Fraunces'] font-semibold text-base text-[var(--color-ink)]">Data & Storage</h2>
        </div>
        {[
          {
            label: 'Clear Completed Tasks',
            sub: `Removes finished tasks from your database (${completedCount} completed tasks currently stored).`,
            buttonLabel: 'Clear completed', icon: Trash2, danger: false,
            action: () => setConfirmClearOpen(true), disabled: completedCount === 0,
          },
          {
            label: 'Reset Local Data',
            sub: 'Restores the initial sample tasks and resets settings to default.',
            buttonLabel: 'Reset data', icon: RotateCcw, danger: true,
            action: () => setConfirmResetOpen(true), disabled: false,
          },
        ].map(({ label, sub, buttonLabel, icon: Icon, danger, action, disabled }) => (
          <div key={label} className={rowCls}>
            <div className="flex flex-col gap-0.5">
              <strong className="text-sm text-[var(--color-ink)]">{label}</strong>
              <small className="text-[11px] text-[var(--color-muted)]">{sub}</small>
            </div>
            <button type="button" onClick={action} disabled={disabled}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors shrink-0 disabled:opacity-40 disabled:cursor-not-allowed ${
                danger
                  ? 'bg-[var(--color-red)] text-white hover:brightness-90'
                  : 'border border-[var(--color-line)] text-[var(--color-ink-secondary)] hover:bg-[var(--color-paper-deep)]'
              }`}>
              <Icon size={13} />{buttonLabel}
            </button>
          </div>
        ))}
      </section>

      {/* About */}
      <section className="px-5 py-4 rounded-xl border border-[var(--color-line-subtle)] bg-[var(--color-paper-subtle)]">
        <p className={`${eyebrowCls} mb-2`}>About Toki</p>
        <p className="text-sm text-[var(--color-ink-secondary)] leading-relaxed">
          Toki is designed with warmth and care to make progress feel good. All your tasks are stored safely on your own device in local storage.
        </p>
        <p className="text-[11px] text-[var(--color-muted)] mt-2 font-mono">Toki v1.0.0 · Indie Productivity</p>
      </section>

      <ConfirmDialog open={confirmClearOpen} title="Clear completed tasks?" message={`Are you sure you want to remove all ${completedCount} completed tasks? Active tasks will remain untouched.`} confirmLabel="Clear tasks" cancelLabel="Keep them" isDanger={false} onConfirm={() => { clearCompleted(); setConfirmClearOpen(false); }} onCancel={() => setConfirmClearOpen(false)} />
      <ConfirmDialog open={confirmResetOpen} title="Reset all local data?" message="This will wipe your stored tasks and restore the starter set. This cannot be undone. Are you sure?" confirmLabel="Yes, reset everything" cancelLabel="Cancel" isDanger={true} onConfirm={() => { resetData(); setConfirmResetOpen(false); }} onCancel={() => setConfirmResetOpen(false)} />
    </motion.div>
  );
}
