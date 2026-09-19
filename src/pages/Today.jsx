import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import TaskList from '../components/tasks/TaskList';
import QuickAddInput from '../components/tasks/QuickAddInput';
import { isOverdue, getTodayString } from '../utils/task';

export default function Today({ todos, onEdit, onAdd, settings }) {
  const [showCompleted, setShowCompleted] = useState(true);
  const todayStr = getTodayString();

  // Overdue active tasks
  const overdueTasks = todos.tasks.filter(isOverdue);

  // Today's active tasks
  const todayRemaining = todos.tasks.filter((t) => !t.completed && t.dueDate === todayStr);

  // Today's completed tasks
  const todayCompleted = todos.tasks.filter((t) => t.completed && t.dueDate === todayStr);

  const totalToday = todayRemaining.length + todayCompleted.length;
  const completedTodayCount = todayCompleted.length;
  const remainingTodayCount = todayRemaining.length;
  const todayPercent = totalToday > 0 ? Math.round((completedTodayCount / totalToday) * 100) : 0;

  const dateFormatted = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <motion.div
      className="page tasks-page"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="page-title">
        <p className="eyebrow">{dateFormatted}</p>
        <div className="title-row">
          <h1>Today</h1>
          <div className="today-counts-badge">
            <span className="count-pill-highlight">{completedTodayCount} done</span>
            <span className="count-pill">{remainingTodayCount} left</span>
          </div>
        </div>

        {totalToday > 0 && (
          <div className="today-progress-inline">
            <div className="progress-track" role="progressbar" aria-valuenow={todayPercent} aria-valuemin="0" aria-valuemax="100">
              <motion.i
                className="progress-fill"
                initial={{ width: 0 }}
                animate={{ width: `${todayPercent}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
            <span className="today-percent-label">{todayPercent}% finished</span>
          </div>
        )}
      </div>

      {/* Quick Add for Today */}
      <div className="tasks-quick-add">
        <QuickAddInput
          onAdd={todos.addTask}
          onOpenDetailed={onAdd}
          defaults={settings}
          defaultDueDate={todayStr}
          placeholder="Add a task for today… (press Enter to save)"
        />
      </div>

      {/* Overdue Section */}
      {overdueTasks.length > 0 && (
        <section className="task-group overdue-group">
          <div className="group-header overdue-header">
            <div className="group-header-title">
              <AlertCircle size={16} />
              <p className="eyebrow eyebrow-alert">Needs Attention ({overdueTasks.length})</p>
            </div>
          </div>
          <TaskList
            tasks={overdueTasks}
            onToggle={todos.toggleTask}
            onEdit={onEdit}
            onDelete={todos.deleteTask}
          />
        </section>
      )}

      {/* Remaining Tasks Due Today */}
      <section className="task-group">
        <div className="group-header">
          <p className="eyebrow">To Do Today ({remainingTodayCount})</p>
        </div>
        <TaskList
          tasks={todayRemaining}
          onToggle={todos.toggleTask}
          onEdit={onEdit}
          onDelete={todos.deleteTask}
          emptyTitle={
            totalToday > 0 && remainingTodayCount === 0
              ? 'Your list is clear. Nice!'
              : 'No tasks scheduled for today'
          }
          emptySubtitle={
            totalToday > 0 && remainingTodayCount === 0
              ? 'You have completed all your tasks for today. Rest easy or add more if you like.'
              : 'Enjoy a free day or plan something gentle using the input above.'
          }
        />
      </section>

      {/* Completed Today Section */}
      {todayCompleted.length > 0 && (
        <section className="task-group completed-group">
          <button
            type="button"
            className="group-collapse-btn"
            onClick={() => setShowCompleted((prev) => !prev)}
            aria-expanded={showCompleted}
          >
            <div className="group-header-title">
              <CheckCircle2 size={16} className="text-leaf" />
              <p className="eyebrow">Completed Today ({completedTodayCount})</p>
            </div>
            {showCompleted ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {showCompleted && (
            <TaskList
              tasks={todayCompleted}
              onToggle={todos.toggleTask}
              onEdit={onEdit}
              onDelete={todos.deleteTask}
            />
          )}
        </section>
      )}
    </motion.div>
  );
}
