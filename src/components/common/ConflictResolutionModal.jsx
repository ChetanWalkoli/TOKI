import { useState } from 'react';
import { GitMerge, ArrowLeftRight, Check, ShieldAlert } from 'lucide-react';
import Modal from './Modal';

export default function ConflictResolutionModal({
  open,
  onClose,
  conflict, // { localTask, remoteTask, fields }
  onResolve,
}) {
  if (!conflict || !conflict.localTask || !conflict.remoteTask) return null;

  const { localTask, remoteTask, fields = [] } = conflict;

  // Selected values per field: defaults to local
  const [resolvedChoices, setResolvedChoices] = useState(() => {
    const initial = {};
    fields.forEach(({ field }) => {
      initial[field] = 'local';
    });
    return initial;
  });

  const handleFieldPick = (field, source) => {
    setResolvedChoices((prev) => ({
      ...prev,
      [field]: source,
    }));
  };

  const handleKeepAll = (source) => {
    const all = {};
    fields.forEach(({ field }) => {
      all[field] = source;
    });
    setResolvedChoices(all);
  };

  const handleSaveResolution = () => {
    const merged = { ...remoteTask };
    fields.forEach(({ field }) => {
      const choice = resolvedChoices[field] || 'local';
      merged[field] = choice === 'local' ? localTask[field] : remoteTask[field];
    });
    merged.updatedAt = Date.now();

    onResolve(merged);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Resolve Sync Conflict">
      <div className="flex flex-col gap-4 text-sm text-[var(--color-ink)]">
        <div className="flex items-start gap-3 p-3 rounded-xl bg-[var(--color-butter-subtle)] border border-[rgba(245,158,11,0.3)] text-xs text-[var(--color-butter)]">
          <ShieldAlert size={18} className="shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5 text-[var(--color-ink)]">
            <span className="font-semibold">Simultaneous edits detected</span>
            <span className="text-[11px] text-[var(--color-ink-secondary)]">
              This task was edited both on this device and on the cloud. Choose which values to keep.
            </span>
          </div>
        </div>

        {/* Bulk Action Buttons */}
        <div className="flex items-center justify-between gap-2 pb-2 border-b border-[var(--color-line-subtle)] text-xs">
          <span className="text-[var(--color-muted)] font-medium">Quick options:</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleKeepAll('local')}
              className="px-2.5 py-1 rounded-lg border border-[var(--color-line)] text-xs text-[var(--color-ink-secondary)] hover:bg-[var(--color-paper-deep)]"
            >
              Keep all local
            </button>
            <button
              type="button"
              onClick={() => handleKeepAll('remote')}
              className="px-2.5 py-1 rounded-lg border border-[var(--color-line)] text-xs text-[var(--color-ink-secondary)] hover:bg-[var(--color-paper-deep)]"
            >
              Use all cloud
            </button>
          </div>
        </div>

        {/* Conflicting Fields Comparison */}
        <div className="flex flex-col gap-3 max-h-60 overflow-y-auto pr-1">
          {fields.map(({ field, localValue, remoteValue }) => {
            const isLocalChosen = resolvedChoices[field] === 'local';

            return (
              <div
                key={field}
                className="flex flex-col gap-1.5 p-2.5 rounded-xl border border-[var(--color-line)] bg-[var(--color-paper-card)] text-xs"
              >
                <span className="font-semibold capitalize text-[var(--color-ink)]">
                  {field.replace(/([A-Z])/g, ' $1')}
                </span>

                <div className="grid grid-cols-2 gap-2">
                  {/* Local choice card */}
                  <button
                    type="button"
                    onClick={() => handleFieldPick(field, 'local')}
                    className={`flex flex-col items-start p-2 rounded-lg border text-left transition-all ${
                      isLocalChosen
                        ? 'border-[var(--color-coral)] bg-[var(--color-coral-subtle)] font-medium'
                        : 'border-[var(--color-line)] bg-[var(--color-paper-deep)] opacity-70 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-muted)]">
                        Local (This Device)
                      </span>
                      {isLocalChosen && <Check size={12} className="text-[var(--color-coral)]" />}
                    </div>
                    <span className="text-xs break-words text-[var(--color-ink)]">
                      {String(localValue || '(empty)')}
                    </span>
                  </button>

                  {/* Cloud choice card */}
                  <button
                    type="button"
                    onClick={() => handleFieldPick(field, 'remote')}
                    className={`flex flex-col items-start p-2 rounded-lg border text-left transition-all ${
                      !isLocalChosen
                        ? 'border-[var(--color-coral)] bg-[var(--color-coral-subtle)] font-medium'
                        : 'border-[var(--color-line)] bg-[var(--color-paper-deep)] opacity-70 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-muted)]">
                        Cloud Version
                      </span>
                      {!isLocalChosen && <Check size={12} className="text-[var(--color-coral)]" />}
                    </div>
                    <span className="text-xs break-words text-[var(--color-ink)]">
                      {String(remoteValue || '(empty)')}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-3 border-t border-[var(--color-line-subtle)]">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border border-[var(--color-line)] text-xs text-[var(--color-ink-secondary)] hover:bg-[var(--color-paper-deep)]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveResolution}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[var(--color-coral)] text-white text-xs font-semibold hover:bg-[var(--color-coral-hover)] transition-colors"
          >
            <GitMerge size={13} />
            <span>Apply Selected Merge</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
