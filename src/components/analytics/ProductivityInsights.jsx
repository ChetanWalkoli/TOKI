import { useMemo } from 'react';
import { Sparkles, TrendingUp, Clock, CheckCircle, AlertCircle, Compass } from 'lucide-react';
import { calculateProductivityInsights } from '../../utils/insights';

export default function ProductivityInsights({ tasks = [], focusHistory = [] }) {
  const insights = useMemo(
    () => calculateProductivityInsights(tasks, focusHistory),
    [tasks, focusHistory]
  );

  if (insights.length === 0) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-xl border border-[var(--color-line)] bg-[var(--color-paper-card)] text-xs text-[var(--color-muted)]">
        <Compass size={18} className="text-[var(--color-coral)] shrink-0" />
        <span>Complete a few tasks and log focus sessions to unlock personalized productivity observations.</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-[var(--color-coral)]" />
          <h3 className="font-semibold text-sm text-[var(--color-ink)]">Productivity Insights</h3>
        </div>
        <span className="text-[11px] text-[var(--color-muted)]">Derived from authentic activity</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {insights.map((item) => (
          <div
            key={item.id}
            className="flex items-start gap-3 p-3.5 rounded-xl border border-[var(--color-line)] bg-[var(--color-paper-card)] shadow-[var(--shadow-sm)] hover:border-[var(--color-line-strong)] transition-all"
          >
            <span className="text-xl shrink-0 select-none">{item.icon}</span>
            <div className="flex flex-col gap-1 flex-1">
              <h4 className="font-semibold text-xs text-[var(--color-ink)] leading-snug">
                {item.title}
              </h4>
              <p className="text-[11px] text-[var(--color-ink-secondary)] leading-relaxed">
                {item.description}
              </p>

              {item.metadata && (
                <div className="flex items-center gap-3 mt-1 pt-1.5 border-t border-[var(--color-line-subtle)] text-[10px] text-[var(--color-muted)] font-mono">
                  <span>Est: {item.metadata.totalEst}m</span>
                  <span>Actual: {item.metadata.totalActual}m</span>
                  <span className="font-bold text-[var(--color-coral)]">Ratio: {item.metadata.ratio}x</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
