import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Flame, CheckCircle2, TrendingUp, Timer, Award, Calendar, Layers, Sparkles } from 'lucide-react';
import { useAchievements } from '../hooks/useAchievements';
import { categories, priorityOptions } from '../utils/task';
import ProductivityInsights from '../components/analytics/ProductivityInsights';

const eyebrowCls = 'text-xs font-semibold tracking-wider text-[var(--color-muted)] uppercase';

export default function Analytics({ todos, pomodoro }) {
  const { tasks, stats, streak } = todos;
  const { history, totalFocusMinutes, totalFocusSessions } = pomodoro;
  const { achievements, unlockedCount, totalCount, percentUnlocked } = useAchievements(tasks, history, streak);

  const sevenDayActivity = useMemo(() => {
    const days = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const dateStr = d.toISOString().slice(0, 10);
      const dayLabel = d.toLocaleDateString(undefined, { weekday: 'narrow' });
      const count = tasks.filter((t) => {
        if (!t.completed || !t.completedAt) return false;
        try { return new Date(t.completedAt).toISOString().slice(0, 10) === dateStr; } catch { return false; }
      }).length;
      days.push({ dateStr, dayLabel, count });
    }
    const maxCount = Math.max(1, ...days.map((d) => d.count));
    return { days, maxCount };
  }, [tasks]);

  const categoryStats = useMemo(() => categories.map((cat) => {
    const catTasks = tasks.filter((t) => t.category === cat);
    const total = catTasks.length;
    const completed = catTasks.filter((t) => t.completed).length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { category: cat, total, completed, percent };
  }), [tasks]);

  return (
    <motion.div
      className="max-w-4xl xl:max-w-5xl 2xl:max-w-6xl mx-auto flex flex-col gap-8"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      {/* Title */}
      <div>
        <p className={eyebrowCls}>Insights & Milestones</p>
        <div className="flex items-center gap-3 mt-1">
          <h1 className="font-['Fraunces'] text-3xl font-semibold text-[var(--color-ink)]">Productivity Analytics</h1>
          <span className="ml-auto px-2.5 py-1 rounded-full text-[11px] bg-[var(--color-paper-deep)] text-[var(--color-ink-secondary)] font-medium">Real-time metrics</span>
        </div>
      </div>

      {/* Streak hero */}
      <div className="flex items-center gap-4 p-5 rounded-2xl bg-[var(--color-butter-subtle)] border border-[rgba(222,178,60,0.3)]">
        <div className="w-14 h-14 flex items-center justify-center rounded-full bg-[var(--color-butter)] text-white shrink-0">
          <Flame size={28} />
        </div>
        <div>
          <h2 className="font-['Fraunces'] text-xl font-semibold text-[var(--color-ink)]">{streak} Day Streak</h2>
          <p className="text-sm text-[var(--color-ink-secondary)] mt-0.5 leading-relaxed">
            {streak > 0 ? `You've completed tasks ${streak} consecutive day${streak === 1 ? '' : 's'}. Keep the steady momentum!` : 'Complete a task today to start your streak!'}
          </p>
        </div>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Completed Tasks', value: stats.complete, sub: `${stats.total} total created`, icon: <CheckCircle2 size={17} className="text-[var(--color-leaf)]" /> },
          { label: 'Completion Rate', value: `${stats.percent}%`, sub: `${stats.remaining} active remaining`, icon: <TrendingUp size={17} className="text-[var(--color-coral)]" /> },
          { label: 'Focus Time', value: `${totalFocusMinutes}m`, sub: `${totalFocusSessions} Pomodoro sessions`, icon: <Timer size={17} className="text-[var(--color-butter)]" /> },
          { label: 'Achievements', value: `${unlockedCount}/${totalCount}`, sub: `${percentUnlocked}% unlocked`, icon: <Award size={17} className="text-[var(--color-coral)]" /> },
        ].map(({ label, value, sub, icon }) => (
          <div key={label} className="flex flex-col gap-2 p-4 rounded-xl border border-[var(--color-line)] bg-[var(--color-paper-card)] shadow-[var(--shadow-sm)]">
            <span className="text-[11px] font-semibold text-[var(--color-muted)] uppercase tracking-wide">{label}</span>
            <div className="flex items-center justify-between gap-2">
              <strong className="text-2xl font-bold font-['Fraunces'] text-[var(--color-ink)]">{value}</strong>
              {icon}
            </div>
            <small className="text-[11px] text-[var(--color-muted)]">{sub}</small>
          </div>
        ))}
      </div>

      {/* 7-day chart */}
      <section className="flex flex-col gap-4 p-5 rounded-xl border border-[var(--color-line)] bg-[var(--color-paper-card)] shadow-[var(--shadow-sm)]">
        <div className="flex items-center gap-2">
          <Calendar size={17} className="text-[var(--color-muted)]" />
          <h2 className="font-['Fraunces'] font-semibold text-base text-[var(--color-ink)]">7-Day Completion Activity</h2>
        </div>
        <div className="flex items-end gap-3 h-32">
          {sevenDayActivity.days.map((item) => {
            const heightPercent = Math.max(12, Math.round((item.count / sevenDayActivity.maxCount) * 100));
            return (
              <div key={item.dateStr} className="flex flex-col items-center gap-1 flex-1">
                <span className="text-[10px] text-[var(--color-muted)] font-medium">{item.count > 0 ? item.count : ''}</span>
                <div className="flex-1 w-full flex items-end">
                  <motion.div
                    className={`w-full rounded-t-lg ${item.count > 0 ? 'bg-[var(--color-coral)]' : 'bg-[var(--color-paper-deep)]'}`}
                    style={{ height: `${heightPercent}%` }}
                    initial={{ height: 0 }}
                    animate={{ height: `${heightPercent}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                </div>
                <span className="text-[10px] text-[var(--color-muted)]">{item.dayLabel}</span>
              </div>
            );
          })}
        </div>
        <p className="text-[11px] text-[var(--color-muted)]">Number of tasks completed per day over the past week</p>
      </section>

      {/* Productivity Insights */}
      <section aria-label="Productivity insights">
        <ProductivityInsights tasks={tasks} focusHistory={history} />
      </section>

      {/* Category breakdown */}
      <section className="flex flex-col gap-4 p-5 rounded-xl border border-[var(--color-line)] bg-[var(--color-paper-card)] shadow-[var(--shadow-sm)]">
        <div className="flex items-center gap-2">
          <Layers size={17} className="text-[var(--color-muted)]" />
          <h2 className="font-['Fraunces'] font-semibold text-base text-[var(--color-ink)]">Tasks by Category</h2>
        </div>
        <div className="flex flex-col gap-3">
          {categoryStats.map((cat) => (
            <div key={cat.category}>
              <div className="flex items-center justify-between text-xs mb-1">
                <strong className="text-[var(--color-ink)]">{cat.category}</strong>
                <span className="text-[var(--color-muted)]">{cat.completed} of {cat.total} done ({cat.percent}%)</span>
              </div>
              <div className="h-2 rounded-full bg-[var(--color-paper-deep)] overflow-hidden">
                <motion.div className="h-full rounded-full bg-[var(--color-coral)]" initial={{ width: 0 }} animate={{ width: `${cat.percent}%` }} transition={{ duration: 0.4 }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Achievements */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Award size={17} className="text-[var(--color-muted)]" />
          <h2 className="font-['Fraunces'] font-semibold text-base text-[var(--color-ink)]">Unlocked Achievements ({unlockedCount}/{totalCount})</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {achievements.map((item) => (
            <div key={item.id}
              className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                item.unlocked
                  ? 'border-[rgba(220,107,84,0.3)] bg-[var(--color-coral-subtle)]'
                  : 'border-[var(--color-line-subtle)] bg-[var(--color-paper-card)] opacity-50'
              }`}
            >
              <span className="text-2xl">{item.icon}</span>
              <div className="flex-1 min-w-0">
                <strong className="text-sm text-[var(--color-ink)]">{item.title}</strong>
                <p className="text-[11px] text-[var(--color-muted)] leading-snug">{item.description}</p>
              </div>
              {item.unlocked && (
                <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--color-coral)] text-white">Unlocked</span>
              )}
            </div>
          ))}
        </div>
      </section>
    </motion.div>
  );
}
