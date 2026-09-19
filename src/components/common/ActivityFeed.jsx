import { Activity, CheckCircle2, PlusCircle, ArrowRight, FolderGit2 } from 'lucide-react';

function formatRelativeTime(timestamp) {
  if (!timestamp) return '';
  const diffSeconds = Math.floor((Date.now() - timestamp) / 1000);

  if (diffSeconds < 60) return 'Just now';
  if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
  if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
  return `${Math.floor(diffSeconds / 86400)}d ago`;
}

export default function ActivityFeed({ activities = [] }) {
  if (activities.length === 0) {
    return (
      <div className="flex items-center gap-2.5 p-4 rounded-xl border border-[var(--color-line)] bg-[var(--color-paper-card)] text-xs text-[var(--color-muted)]">
        <Activity size={15} className="text-[var(--color-coral)] shrink-0" />
        <span>Meaningful milestones, completions, and progress updates will appear here.</span>
      </div>
    );
  }

  const getActionIcon = (action) => {
    if (action.includes('completed')) return <CheckCircle2 size={13} className="text-[var(--color-leaf)]" />;
    if (action.includes('created')) return <PlusCircle size={13} className="text-[var(--color-coral)]" />;
    if (action.includes('moved')) return <ArrowRight size={13} className="text-[var(--color-butter)]" />;
    return <Activity size={13} className="text-[var(--color-muted)]" />;
  };

  return (
    <div className="flex flex-col gap-2 p-4 rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper-card)] shadow-[var(--shadow-sm)]">
      <div className="flex items-center justify-between pb-2 border-b border-[var(--color-line-subtle)]">
        <div className="flex items-center gap-2">
          <Activity size={15} className="text-[var(--color-coral)]" />
          <h3 className="font-semibold text-xs text-[var(--color-ink)]">Recent Activity</h3>
        </div>
        <span className="text-[11px] text-[var(--color-muted)] font-mono">{activities.length} entries</span>
      </div>

      <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
        {activities.slice(0, 15).map((act) => (
          <div
            key={act.id}
            className="flex items-center justify-between gap-3 p-2 rounded-lg hover:bg-[var(--color-paper-deep)] transition-colors text-xs"
          >
            <div className="flex items-center gap-2 truncate">
              {getActionIcon(act.action)}
              <div className="truncate">
                <span className="font-medium text-[var(--color-ink)]">{act.userName || 'You'}</span>{' '}
                <span className="text-[var(--color-ink-secondary)]">{act.action}</span>{' '}
                <strong className="text-[var(--color-ink)] font-semibold">"{act.entityTitle}"</strong>
              </div>
            </div>
            <span className="text-[10px] text-[var(--color-muted)] font-mono shrink-0">
              {formatRelativeTime(act.timestamp)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
