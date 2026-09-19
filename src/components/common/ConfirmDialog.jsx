import Modal from './Modal';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDanger = false,
  onConfirm,
  onCancel,
}) {
  return (
    <Modal open={open} onClose={onCancel} title={title}>
      <div className="flex flex-col gap-4">
        {isDanger && (
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[var(--color-red-subtle)] text-[var(--color-red)] mx-auto" aria-hidden="true">
            <AlertTriangle size={22} />
          </div>
        )}
        <p className="text-sm text-[var(--color-ink-secondary)] leading-relaxed text-center">{message}</p>
        <div className="flex justify-end gap-2 pt-2 border-t border-[var(--color-line-subtle)]">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-[var(--color-line)] text-[var(--color-ink-secondary)] text-sm font-medium hover:bg-[var(--color-paper-deep)] transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors ${
              isDanger
                ? 'bg-[var(--color-red)] hover:brightness-90'
                : 'bg-[var(--color-coral)] hover:bg-[var(--color-coral-hover)]'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
