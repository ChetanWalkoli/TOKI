import Modal from './Modal';

export default function KeyboardShortcutsModal({ open, onClose }) {
  const shortcuts = [
    { key: 'N', description: 'Create a new task' },
    { key: '/', description: 'Quick search / filter' },
    { key: 'Cmd / Ctrl + K', description: 'Open command palette' },
    { key: 'F', description: 'Go to Focus Mode (Pomodoro)' },
    { key: 'D', description: 'Go to Dashboard' },
    { key: 'T', description: 'Go to Today view' },
    { key: 'B', description: 'Go to Kanban Board' },
    { key: 'C', description: 'Go to Calendar view' },
    { key: 'A', description: 'Go to Analytics & Streaks' },
    { key: '?', description: 'Show keyboard shortcuts' },
    { key: 'Esc', description: 'Close modals & menus' },
  ];

  return (
    <Modal open={open} onClose={onClose} title="Keyboard Shortcuts">
      <div className="flex flex-col gap-4">
        <p className="text-sm text-[var(--color-muted)] leading-relaxed">
          Fly through Toki without taking your fingers off the keyboard.
        </p>

        <div className="flex flex-col divide-y divide-[var(--color-line-subtle)]">
          {shortcuts.map(({ key, description }) => (
            <div key={key} className="flex items-center justify-between py-2.5 gap-4">
              <span className="text-sm text-[var(--color-ink-secondary)]">{description}</span>
              <kbd className="shrink-0 px-2.5 py-1 rounded-lg bg-[var(--color-paper-deep)] border border-[var(--color-line)] text-[11px] font-mono font-semibold text-[var(--color-ink)] whitespace-nowrap">
                {key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-1 border-t border-[var(--color-line-subtle)]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[var(--color-coral)] text-white text-sm font-semibold hover:bg-[var(--color-coral-hover)] transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </Modal>
  );
}
