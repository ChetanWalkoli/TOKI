import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import TaskList from '../components/tasks/TaskList';
import QuickAddInput from '../components/tasks/QuickAddInput';
import { getUpcomingBuckets } from '../utils/task';

const eyebrowCls = 'text-xs font-semibold tracking-wider text-[var(--color-muted)] uppercase';

export default function Upcoming({ todos, onEdit, onAdd, settings, onStartFocus }) {
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const buckets = getUpcomingBuckets(todos.tasks);

  const tomorrowDateFormatted = new Date(Date.now() + 86400000).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  const totalUpcomingCount = buckets.tomorrow.length + buckets.thisWeek.length + buckets.later.length;

  const GroupHeader = ({ label, count, alert }) => (
    <div className={`flex items-center gap-2 px-3 py-2.5 rounded-lg ${alert ? 'bg-[var(--color-red-subtle)]' : 'bg-[var(--color-paper-subtle)]'}`}>
      {alert && <AlertCircle size={14} className="text-[var(--color-red)]" />}
      <p className={`${eyebrowCls} ${alert ? 'text-[var(--color-red)]' : ''} flex-1`}>{label}</p>
      {count > 0 && (
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${alert ? 'bg-[var(--color-red)] text-white' : 'bg-[var(--color-paper-deep)] text-[var(--color-muted)]'}`}>{count}</span>
      )}
    </div>
  );

  return (
    <motion.div
      className="max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto flex flex-col gap-6"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div>
        <p className={eyebrowCls}>Give future you a hand</p>
        <div className="flex items-center gap-3 mt-1">
          <h1 className="font-['Fraunces'] text-3xl font-semibold text-[var(--color-ink)]">Upcoming</h1>
          <span className="ml-auto px-2.5 py-1 rounded-full text-[11px] bg-[var(--color-paper-deep)] text-[var(--color-ink-secondary)] font-medium">{totalUpcomingCount} planned</span>
        </div>
      </div>

      <QuickAddInput onAdd={todos.addTask} onOpenDetailed={onAdd} defaults={settings} defaultDueDate={tomorrowStr} placeholder="Add a task for tomorrow… (press Enter to save)" />

      {buckets.overdue.length > 0 && (
        <section className="flex flex-col gap-2">
          <GroupHeader label={`Past Due (${buckets.overdue.length})`} count={buckets.overdue.length} alert />
          <TaskList
            tasks={buckets.overdue}
            allTasks={todos.tasks}
            projects={todos.projects}
            onToggle={todos.toggleTask}
            onEdit={onEdit}
            onDelete={todos.deleteTask}
            onToggleSubtask={todos.toggleSubtask}
            onAddSubtask={todos.addSubtask}
            onSetStatus={todos.setTaskStatus}
            onStartFocus={onStartFocus}
          />
        </section>
      )}

      {[
        { label: `Tomorrow · ${tomorrowDateFormatted}`, tasks: buckets.tomorrow, emptyTitle: 'Nothing scheduled for tomorrow', emptySubtitle: 'Future you has open space. Add something if you want to prepare.' },
        { label: 'This Week', tasks: buckets.thisWeek, emptyTitle: 'No tasks later this week', emptySubtitle: 'Everything is calm for the next few days.' },
        { label: 'Later', tasks: buckets.later, emptyTitle: 'No tasks planned further out', emptySubtitle: 'Long term backlog is clear.' },
      ].map(({ label, tasks, emptyTitle, emptySubtitle }) => (
        <section key={label} className="flex flex-col gap-2">
          <GroupHeader label={label} count={tasks.length} />
          <TaskList
            tasks={tasks}
            allTasks={todos.tasks}
            projects={todos.projects}
            onToggle={todos.toggleTask}
            onEdit={onEdit}
            onDelete={todos.deleteTask}
            onToggleSubtask={todos.toggleSubtask}
            onAddSubtask={todos.addSubtask}
            onSetStatus={todos.setTaskStatus}
            onStartFocus={onStartFocus}
            emptyTitle={emptyTitle}
            emptySubtitle={emptySubtitle}
          />
        </section>
      ))}

      {buckets.noDueDate.length > 0 && (
        <section className="flex flex-col gap-2">
          <GroupHeader label="Someday / No Due Date" count={buckets.noDueDate.length} />
          <TaskList
            tasks={buckets.noDueDate}
            allTasks={todos.tasks}
            projects={todos.projects}
            onToggle={todos.toggleTask}
            onEdit={onEdit}
            onDelete={todos.deleteTask}
            onToggleSubtask={todos.toggleSubtask}
            onAddSubtask={todos.addSubtask}
            onSetStatus={todos.setTaskStatus}
            onStartFocus={onStartFocus}
          />
        </section>
      )}
    </motion.div>
  );
}
