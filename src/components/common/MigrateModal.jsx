import { useState } from 'react';
import Modal from './Modal';
import { CloudUpload, ArrowRight, Check } from 'lucide-react';

export default function MigrateModal({ open, onConfirm, onDismiss }) {
  const [migrating, setMigrating] = useState(false);
  const [doneCount, setDoneCount] = useState(null);

  const handleMigrate = async () => {
    setMigrating(true);
    try {
      const count = await onConfirm();
      setDoneCount(count);
      setTimeout(() => { onDismiss(); }, 1400);
    } catch (err) {
      console.error('Migration failed:', err);
    } finally {
      setMigrating(false);
    }
  };

  return (
    <Modal open={open} onClose={onDismiss} title="Sync Local Tasks to Cloud">
      <div className="flex flex-col gap-4">
        {doneCount !== null ? (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[var(--color-leaf-subtle)] border border-[rgba(82,133,98,0.3)] text-[var(--color-leaf)]">
            <Check size={20} />
            <p className="text-sm font-medium">
              Successfully imported <strong>{doneCount}</strong> tasks to your Toki Cloud account!
            </p>
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center gap-3 py-2 text-center">
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-[var(--color-paper-deep)] text-[var(--color-muted)]" aria-hidden="true">
                <CloudUpload size={24} />
              </div>
              <p className="text-sm font-semibold text-[var(--color-ink)]">Move your existing local tasks to Toki Cloud?</p>
              <p className="text-sm text-[var(--color-ink-secondary)] leading-relaxed max-w-sm">
                We detected tasks stored in your local browser from previous sessions. Would you like to upload and sync them with your new account so you can access them from any device?
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-[var(--color-line-subtle)]">
              <button type="button" onClick={onDismiss} disabled={migrating}
                className="px-4 py-2 rounded-lg border border-[var(--color-line)] text-[var(--color-ink-secondary)] text-sm font-medium hover:bg-[var(--color-paper-deep)] transition-colors disabled:opacity-50">
                Keep separate
              </button>
              <button type="button" onClick={handleMigrate} disabled={migrating}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--color-coral)] text-white text-sm font-semibold hover:bg-[var(--color-coral-hover)] transition-colors disabled:opacity-50">
                {migrating ? <span>Importing tasks…</span> : <><span>Upload to Cloud</span><ArrowRight size={14} /></>}
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
