import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, CheckCircle2, Flame } from 'lucide-react';
import { Link } from 'react-router-dom';
import Companion from '../components/companion/Companion';
import TaskList from '../components/tasks/TaskList';
import QuickAddInput from '../components/tasks/QuickAddInput';
import { getGreeting, getTodayString, isOverdue } from '../utils/task';

const companionPhrases = {
  idle: 'One small step at a time.',
  created: 'Captured. Your mind is a bit clearer now.',
  completed: 'Nice work. Take a second to feel that win.',
  edited: 'Refined and ready.',
  deleted: 'Removed. Onward.',
  reopened: 'Brought back. No problem at all.',
  cleared: 'A clean slate feels wonderful.',
};

export default function Dashboard({ todos, onAdd, onEdit, settings }) {
  const { tasks, todayStats, stats, lastAction, toggleTask, deleteTask, addTask } = todos;
  const greeting = getGreeting();
  const todayStr = getTodayString();

  const mood =
    lastAction === 'completed'
      ? 'celebrating'
      : lastAction === 'created'
      ? 'excited'
      : 'idle';

  // Real today's tasks
  const todayTasks = tasks.filter((t) => t.dueDate === todayStr);

  // Today's priority tasks: active tasks due today with High or Medium priority, or overdue tasks
  const priorityTasks = tasks.filter((t) => {
    if (t.completed) return false;
    const isTodayTask = t.dueDate === todayStr;
    const overdue = isOverdue(t);
    return (isTodayTask && (t.priority === 'High' || t.priority === 'Medium')) || overdue;
  });

  // Upcoming tasks preview (due tomorrow or later, active)
  const upcomingTasks = tasks
    .filter((t) => !t.completed && t.dueDate && t.dueDate > todayStr)
    .slice(0, 3);

  // Productivity summary sentence strictly from actual data
  let productivitySummary = '';
  if (todayStats.total === 0) {
    productivitySummary = 'No tasks scheduled for today yet. Add one below or enjoy the free time.';
  } else if (todayStats.remaining === 0) {
    productivitySummary = `All ${todayStats.total} tasks completed today! Take a moment to celebrate.`;
  } else if (todayStats.completed > 0) {
    productivitySummary = `${todayStats.completed} of ${todayStats.total} tasks completed today (${todayStats.percent}%). ${todayStats.remaining} remaining.`;
  } else {
    productivitySummary = `${todayStats.total} ${todayStats.total === 1 ? 'task' : 'tasks'} waiting for today. Ready when you are.`;
  }

  const currentDateDisplay = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <motion.div
      className="page dashboard"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      {/* Intro section */}
      <section className="notebook-intro">
        <div className="intro-text">
          <p className="eyebrow">{currentDateDisplay}</p>
          <p className="greeting">
            {greeting.title} {greeting.icon}
          </p>
          <h1>
            Let’s make some
            <br />
            <em>progress.</em>
          </h1>
          <p className="companion-message">{companionPhrases[lastAction] || companionPhrases.idle}</p>
        </div>

        <div className="toki-corner">
          <Companion mood={mood} />
          <span className="toki-caption">Toki is cheering for you</span>
        </div>
      </section>

      {/* Actual Data Metrics Bar */}
      <section className="daily-progress" aria-label="Today productivity summary">
        <div className="progress-stat-group">
          <span className="eyebrow">Today’s Metrics</span>
          <p className="stat-headline">
            <strong>{todayStats.completed}</strong> completed · <strong>{todayStats.remaining}</strong> remaining
          </p>
          <p className="stat-summary">{productivitySummary}</p>
        </div>

        <div className="progress-indicator-box">
          <div className="progress-track-header">
            <span>Today’s completion</span>
            <strong>{todayStats.percent}%</strong>
          </div>
          <div
            className="progress-track"
            role="progressbar"
            aria-valuenow={todayStats.percent}
            aria-valuemin="0"
            aria-valuemax="100"
          >
            <motion.i
              className="progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${todayStats.percent}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>
          <span className="progress-caption">
            {todayStats.completed} of {todayStats.total} tasks
          </span>
        </div>
      </section>

      {/* Quick Add Input for Today */}
      <section className="quick-add-section" aria-label="Quick add task">
        <QuickAddInput
          onAdd={addTask}
          onOpenDetailed={onAdd}
          defaults={settings}
          defaultDueDate={todayStr}
          placeholder="Add a task for today… (press Enter to save)"
        />
      </section>

      {/* Priority Tasks Section */}
      {priorityTasks.length > 0 && (
        <section className="tasks-section priority-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow eyebrow-accent">
                <Flame size={12} className="inline-icon" /> Focus
              </p>
              <h2>Today’s priority tasks</h2>
            </div>
            <span className="badge-pill">{priorityTasks.length} active</span>
          </div>

          <TaskList
            tasks={priorityTasks}
            onToggle={toggleTask}
            onEdit={onEdit}
            onDelete={deleteTask}
            emptyTitle="No priority items left"
            emptySubtitle="You’re caught up on urgent tasks."
          />
        </section>
      )}

      {/* Today's Full List */}
      <section className="tasks-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Today</p>
            <h2>What’s on the list</h2>
          </div>
          <button
            type="button"
            className="text-button"
            onClick={() => onAdd({ dueDate: todayStr })}
          >
            <Sparkles size={14} /> Add with details
          </button>
        </div>

        <TaskList
          tasks={todayTasks}
          onToggle={toggleTask}
          onEdit={onEdit}
          onDelete={deleteTask}
          emptyTitle="Nothing on the list for today"
          emptySubtitle="Type a task above to quickly get started."
        />
      </section>

      {/* Upcoming Section */}
      {upcomingTasks.length > 0 && (
        <section className="tasks-section up-next">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Looking Ahead</p>
              <h2>Upcoming tasks</h2>
            </div>
            <Link to="/upcoming" className="text-button link-button">
              See all upcoming <ArrowRight size={14} />
            </Link>
          </div>

          <TaskList
            tasks={upcomingTasks}
            onToggle={toggleTask}
            onEdit={onEdit}
            onDelete={deleteTask}
          />
        </section>
      )}
    </motion.div>
  );
}
