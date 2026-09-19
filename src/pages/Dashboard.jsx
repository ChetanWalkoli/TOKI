import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Flame, FolderGit2, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import Companion from '../components/companion/Companion';
import TaskList from '../components/tasks/TaskList';
import QuickAddInput from '../components/tasks/QuickAddInput';
import ActivityFeed from '../components/common/ActivityFeed';
import ProductivityInsights from '../components/analytics/ProductivityInsights';
import { getGreeting, getTodayString, isOverdue } from '../utils/task';
import { getSmartMicrocopy } from '../utils/smartMicrocopy';

const eyebrowCls = 'text-xs font-semibold tracking-wider text-[var(--color-muted)] uppercase';

export default function Dashboard({
  todos,
  onAdd,
  onEdit,
  settings,
  onStartFocus,
  onOpenPlanMyDay,
}) {
  const {
    tasks,
    projects = [],
    activityLog = [],
    todayStats,
    stats,
    streak,
    lastAction,
    toggleTask,
    deleteTask,
    addTask,
    toggleSubtask,
    addSubtask,
    setTaskStatus,
  } = todos;
  const greeting = getGreeting();
  const todayStr = getTodayString();
  const smartCopy = getSmartMicrocopy({ tasks, lastAction, todayStats, streak });

  const todayTasks = tasks.filter((t) => t.dueDate === todayStr);
  const priorityTasks = tasks.filter((t) => {
    if (t.completed) return false;
    const isTodayTask = t.dueDate === todayStr;
    const overdue = isOverdue(t);
    return (isTodayTask && (t.priority === 'High' || t.priority === 'Medium')) || overdue;
  });
  const upcomingTasks = tasks.filter((t) => !t.completed && t.dueDate && t.dueDate > todayStr).slice(0, 3);

  let productivitySummary = '';
  if (todayStats.total === 0) productivitySummary = 'No tasks scheduled for today yet. Add one below or enjoy the free time.';
  else if (todayStats.remaining === 0) productivitySummary = `All ${todayStats.total} tasks completed today! Take a moment to celebrate.`;
  else if (todayStats.completed > 0) productivitySummary = `${todayStats.completed} of ${todayStats.total} tasks completed today (${todayStats.percent}%). ${todayStats.remaining} remaining.`;
  else productivitySummary = `${todayStats.total} ${todayStats.total === 1 ? 'task' : 'tasks'} waiting for today. Ready when you are.`;

  const currentDateDisplay = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <motion.div
      className="max-w-3xl mx-auto flex flex-col gap-8"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      {/* Intro section */}
      <section className="flex items-start justify-between gap-6 pb-2">
        <div className="flex flex-col gap-2">
          <p className={eyebrowCls}>{currentDateDisplay}</p>
          <p className="text-sm font-medium text-[var(--color-coral)]">{greeting.title} {greeting.icon}</p>
          <h1 className="font-['Fraunces'] text-3xl sm:text-4xl font-semibold text-[var(--color-ink)] leading-tight">
            Let's make some<br /><em>progress.</em>
          </h1>
          <p className="text-sm text-[var(--color-ink-secondary)] leading-relaxed max-w-sm">{smartCopy.message}</p>
        </div>
        <div className="flex flex-col items-center gap-1.5 shrink-0">
          <Companion mood={smartCopy.mood} />
          <span className="text-[11px] text-[var(--color-muted)] text-center whitespace-nowrap">
            {streak >= 2 ? `🔥 ${streak}-day streak` : 'Toki is cheering for you'}
          </span>
        </div>
      </section>

      {/* Progress bar with Plan My Day button */}
      <section className="flex flex-col sm:flex-row gap-4 p-5 rounded-xl border border-[var(--color-line)] bg-[var(--color-paper-card)] shadow-[var(--shadow-sm)]" aria-label="Today productivity summary">
        <div className="flex-1 flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <p className={eyebrowCls}>Today's Metrics</p>
            {onOpenPlanMyDay && (
              <button
                type="button"
                onClick={onOpenPlanMyDay}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--color-coral-subtle)] text-[var(--color-coral)] text-xs font-semibold hover:bg-[#f8dfd8] transition-colors"
              >
                <Sparkles size={12} />
                <span>Plan my day</span>
              </button>
            )}
          </div>
          <p className="text-sm font-semibold text-[var(--color-ink)]">
            <strong>{todayStats.completed}</strong> completed · <strong>{todayStats.remaining}</strong> remaining
          </p>
          <p className="text-xs text-[var(--color-muted)] leading-relaxed">{productivitySummary}</p>
        </div>
        <div className="flex flex-col gap-1.5 min-w-[160px]">
          <div className="flex items-center justify-between text-xs text-[var(--color-ink-secondary)]">
            <span>Today's completion</span>
            <strong>{todayStats.percent}%</strong>
          </div>
          <div className="h-2 rounded-full bg-[var(--color-paper-deep)] overflow-hidden" role="progressbar" aria-valuenow={todayStats.percent} aria-valuemin="0" aria-valuemax="100">
            <motion.i
              className="block h-full rounded-full bg-[var(--color-coral)]"
              initial={{ width: 0 }}
              animate={{ width: `${todayStats.percent}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>
          <span className="text-[11px] text-[var(--color-muted)]">{todayStats.completed} of {todayStats.total} tasks</span>
        </div>
      </section>

      {/* Quick Add */}
      <section aria-label="Quick add task">
        <QuickAddInput
          onAdd={addTask}
          onOpenDetailed={onAdd}
          defaults={settings}
          defaultDueDate={todayStr}
          placeholder="Add a task for today… try 'Finish deck tomorrow at 6pm high priority ~2h'"
        />
      </section>

      {/* Priority Tasks */}
      {priorityTasks.length > 0 && (
        <section className="flex flex-col gap-3">
          <div className="flex items-end justify-between">
            <div>
              <p className={`${eyebrowCls} text-[var(--color-coral)] flex items-center gap-1`}><Flame size={12} /> Focus</p>
              <h2 className="font-['Fraunces'] font-semibold text-lg text-[var(--color-ink)]">Today's priority tasks</h2>
            </div>
            <span className="text-[11px] px-2.5 py-1 rounded-full bg-[var(--color-coral-subtle)] text-[var(--color-coral)] font-semibold">{priorityTasks.length} active</span>
          </div>
          <TaskList
            tasks={priorityTasks}
            allTasks={tasks}
            projects={projects}
            onToggle={toggleTask}
            onEdit={onEdit}
            onDelete={deleteTask}
            onToggleSubtask={toggleSubtask}
            onAddSubtask={addSubtask}
            onSetStatus={setTaskStatus}
            onStartFocus={onStartFocus}
            emptyTitle="No priority items left"
            emptySubtitle="You're caught up on urgent tasks."
          />
        </section>
      )}

      {/* Today's full list */}
      <section className="flex flex-col gap-3">
        <div className="flex items-end justify-between">
          <div>
            <p className={eyebrowCls}>Today</p>
            <h2 className="font-['Fraunces'] font-semibold text-lg text-[var(--color-ink)]">What's on the list</h2>
          </div>
          <button type="button" onClick={() => onAdd({ dueDate: todayStr })}
            className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-coral)] hover:underline transition-colors">
            <Sparkles size={13} /> Add with details
          </button>
        </div>
        <TaskList
          tasks={todayTasks}
          allTasks={tasks}
          projects={projects}
          onToggle={toggleTask}
          onEdit={onEdit}
          onDelete={deleteTask}
          onToggleSubtask={toggleSubtask}
          onAddSubtask={addSubtask}
          onSetStatus={setTaskStatus}
          onStartFocus={onStartFocus}
          emptyTitle="Nothing on the list for today"
          emptySubtitle="Type a task above to quickly get started."
        />
      </section>

      {/* Productivity Insights (Real User Data Only) */}
      <section aria-label="Productivity insights">
        <ProductivityInsights tasks={tasks} />
      </section>

      {/* Recent Activity Log */}
      <section aria-label="Recent activity log">
        <ActivityFeed activities={activityLog} />
      </section>

      {/* Upcoming preview */}
      {upcomingTasks.length > 0 && (
        <section className="flex flex-col gap-3 opacity-90">
          <div className="flex items-end justify-between">
            <div>
              <p className={eyebrowCls}>Looking Ahead</p>
              <h2 className="font-['Fraunces'] font-semibold text-lg text-[var(--color-ink)]">Upcoming tasks</h2>
            </div>
            <Link to="/upcoming" className="flex items-center gap-1 text-xs font-medium text-[var(--color-coral)] hover:underline">
              See all <ArrowRight size={13} />
            </Link>
          </div>
          <TaskList
            tasks={upcomingTasks}
            allTasks={tasks}
            projects={projects}
            onToggle={toggleTask}
            onEdit={onEdit}
            onDelete={deleteTask}
            onToggleSubtask={toggleSubtask}
            onAddSubtask={addSubtask}
            onSetStatus={setTaskStatus}
            onStartFocus={onStartFocus}
          />
        </section>
      )}
    </motion.div>
  );
}
