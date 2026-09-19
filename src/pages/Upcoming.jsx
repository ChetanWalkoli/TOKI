import { motion } from 'framer-motion';
import { AlertCircle, Calendar, Sparkles } from 'lucide-react';
import TaskList from '../components/tasks/TaskList';
import QuickAddInput from '../components/tasks/QuickAddInput';
import { getUpcomingBuckets, getTodayString } from '../utils/task';

export default function Upcoming({ todos, onEdit, onAdd, settings }) {
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const buckets = getUpcomingBuckets(todos.tasks);

  const tomorrowDateFormatted = new Date(Date.now() + 86400000).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const totalUpcomingCount =
    buckets.tomorrow.length + buckets.thisWeek.length + buckets.later.length;

  return (
    <motion.div
      className="page tasks-page"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="page-title">
        <p className="eyebrow">Give future you a hand</p>
        <div className="title-row">
          <h1>Upcoming</h1>
          <span className="count-pill">{totalUpcomingCount} planned</span>
        </div>
      </div>

      {/* Quick Add for Upcoming (defaults to Tomorrow) */}
      <div className="tasks-quick-add">
        <QuickAddInput
          onAdd={todos.addTask}
          onOpenDetailed={onAdd}
          defaults={settings}
          defaultDueDate={tomorrowStr}
          placeholder="Add a task for tomorrow… (press Enter to save)"
        />
      </div>

      {/* Overdue Section */}
      {buckets.overdue.length > 0 && (
        <section className="task-group overdue-group">
          <div className="group-header overdue-header">
            <div className="group-header-title">
              <AlertCircle size={16} />
              <p className="eyebrow eyebrow-alert">Past Due ({buckets.overdue.length})</p>
            </div>
          </div>
          <TaskList
            tasks={buckets.overdue}
            onToggle={todos.toggleTask}
            onEdit={onEdit}
            onDelete={todos.deleteTask}
          />
        </section>
      )}

      {/* Tomorrow Section */}
      <section className="task-group">
        <div className="group-header">
          <div className="group-header-title">
            <p className="eyebrow">Tomorrow · {tomorrowDateFormatted}</p>
          </div>
          <span className="group-count-badge">{buckets.tomorrow.length}</span>
        </div>
        <TaskList
          tasks={buckets.tomorrow}
          onToggle={todos.toggleTask}
          onEdit={onEdit}
          onDelete={todos.deleteTask}
          emptyTitle="Nothing scheduled for tomorrow"
          emptySubtitle="Future you has open space. Add something if you want to prepare."
        />
      </section>

      {/* This Week Section */}
      <section className="task-group">
        <div className="group-header">
          <p className="eyebrow">This Week</p>
          <span className="group-count-badge">{buckets.thisWeek.length}</span>
        </div>
        <TaskList
          tasks={buckets.thisWeek}
          onToggle={todos.toggleTask}
          onEdit={onEdit}
          onDelete={todos.deleteTask}
          emptyTitle="No tasks later this week"
          emptySubtitle="Everything is calm for the next few days."
        />
      </section>

      {/* Later Section */}
      <section className="task-group">
        <div className="group-header">
          <p className="eyebrow">Later</p>
          <span className="group-count-badge">{buckets.later.length}</span>
        </div>
        <TaskList
          tasks={buckets.later}
          onToggle={todos.toggleTask}
          onEdit={onEdit}
          onDelete={todos.deleteTask}
          emptyTitle="No tasks planned further out"
          emptySubtitle="Long term backlog is clear."
        />
      </section>

      {/* No Due Date Section (if any) */}
      {buckets.noDueDate.length > 0 && (
        <section className="task-group">
          <div className="group-header">
            <p className="eyebrow">Someday / No Due Date</p>
            <span className="group-count-badge">{buckets.noDueDate.length}</span>
          </div>
          <TaskList
            tasks={buckets.noDueDate}
            onToggle={todos.toggleTask}
            onEdit={onEdit}
            onDelete={todos.deleteTask}
          />
        </section>
      )}
    </motion.div>
  );
}
