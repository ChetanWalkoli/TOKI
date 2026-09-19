import { AlertTriangle, ArrowRight, CheckCircle2, X } from 'lucide-react';
import Modal from '../common/Modal';

export default function DependencyWarningModal({
  open,
  onClose,
  task,
  blockers = [],
  onConfirmCompleteAnyway,
  onViewBlocker,
}) {
  if (!task) return null;

  return (
    <Modal open={open} onClose={onClose} title="Task Dependency Warning">
      <div className="flex flex-col gap-4 text-sm text-[var(--color-ink)]">
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[var(--color-butter-subtle)] border border-[rgba(245,158,11,0.3)] text-xs text-[var(--color-butter)]">
          <AlertTriangle size={18} className="shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1 text-[var(--color-ink)]">
            <span className="font-semibold text-xs text-[var(--color-ink)]">
              "{task.title}" has incomplete prerequisites
            </span>
            <span className="text-[11px] text-[var(--color-ink-secondary)]">
              Completing this task early might mean prerequisite steps were skipped.
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold text-[var(--color-ink-secondary)]">
            Open prerequisite {blockers.length === 1 ? 'task' : 'tasks'}:
          </span>
          <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto">
            {blockers.map((blocker) => (
              <div
                key={blocker.id}
                className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--color-paper-deep)] border border-[var(--color-line)] text-xs"
              >
                <div className="flex items-center gap-2 truncate mr-2">
                  <span className="w-2 h-2 rounded-full bg-[var(--color-red)]" />
                  <span className="font-medium truncate text-[var(--color-ink)]">{blocker.title}</span>
                </div>
                {onViewBlocker && (
                  <button
                    type="button"
                    onClick={() => {
                      onViewBlocker(blocker);
                      onClose();
                    }}
                    className="flex items-center gap-1 text-[11px] font-semibold text-[var(--color-coral)] hover:underline shrink-0"
                  >
                    <span>View</span>
                    <ArrowRight size={12} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--color-line-subtle)]">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 rounded-lg border border-[var(--color-line)] text-xs font-medium text-[var(--color-ink-secondary)] hover:bg-[var(--color-paper-deep)] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirmCompleteAnyway(task.id);
              onClose();
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[var(--color-coral)] text-white text-xs font-semibold hover:bg-[var(--color-coral-hover)] transition-colors shadow-sm"
          >
            <CheckCircle2 size={14} />
            <span>Complete anyway</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
