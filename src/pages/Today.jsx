import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import TaskList from '../components/tasks/TaskList';
import QuickAddInput from '../components/tasks/QuickAddInput';
import { isOverdue, getTodayString } from '../utils/task';

const eyebrowCls = 'text-xs font-semibold tracking-wider text-[var(--color-muted)] uppercase';

export default function Today({ todos, onEdit, onAdd, settings, onStartFocus, onOpenPlanMyDay }) {
  const [showCompleted, setShowCompleted] = useState(true);
  const todayStr = getTodayString();
  const projects = todos.projects || [];

  const overdueTasks   = todos.tasks.filter(isOverdue);
  const todayRemaining = todos.tasks.filter((t) => !t.completed && t.dueDate === todayStr);
  const todayCompleted = todos.tasks.filter((t) => t.completed && t.dueDate === todayStr);

  const totalToday          = todayRemaining.length + todayCompleted.length;
  const completedTodayCount = todayCompleted.length;
  const remainingTodayCount = todayRemaining.length;
  const todayPercent        = totalToday > 0 ? Math.round((completedTodayCount / totalToday) * 100) : 0;

  const dateFormatted = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });

  const groupHeaderCls = 'px-3 py-2.5 rounded-lg flex items-center gap-2';

  return (
    <motion.div
      className="max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto flex flex-col gap-6"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      {/* Page title */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <p className={eyebrowCls}>{dateFormatted}</p>
          {onOpenPlanMyDay && (
            <button
              type="button"
              onClick={onOpenPlanMyDay}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[var(--color-coral-subtle)] text-[var(--color-coral)] text-xs font-semibold hover:bg-[#f8dfd8] transition-colors"
            >
              <Sparkles size={13} />
              <span>Plan my day</span>
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
          <h1 className="font-['Fraunces'] text-3xl font-semibold text-[var(--color-ink)]">Today</h1>
          <div className="flex items-center gap-2 ml-auto">
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[var(--color-leaf-subtle)] text-[var(--color-leaf)]">{completedTodayCount} done</span>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-[var(--color-paper-deep)] text-[var(--color-ink-secondary)]">{remainingTodayCount} left</span>
          </div>
        </div>

        {totalToday > 0 && (
          <div className="flex items-center gap-3 mt-1">
            <div className="flex-1 h-1.5 rounded-full bg-[var(--color-paper-deep)] overflow-hidden" role="progressbar" aria-valuenow={todayPercent} aria-valuemin="0" aria-valuemax="100">
              <motion.i className="block h-full rounded-full bg-[var(--color-leaf)]" initial={{ width: 0 }} animate={{ width: `${todayPercent}%` }} transition={{ duration: 0.4 }} />
            </div>
            <span className="text-[11px] text-[var(--color-muted)] shrink-0">{todayPercent}% finished</span>
          </div>
        )}
      </div>

      {/* Quick add */}
      <QuickAddInput onAdd={todos.addTask} onOpenDetailed={onAdd} defaults={settings} defaultDueDate={todayStr} placeholder="Add a task for today… (press Enter to save)" />

      {/* Overdue */}
      {overdueTasks.length > 0 && (
        <section>
          <div className={`${groupHeaderCls} bg-[var(--color-red-subtle)]`}>
            <AlertCircle size={15} className="text-[var(--color-red)]" />
            <p className={`${eyebrowCls} text-[var(--color-red)]`}>Needs Attention ({overdueTasks.length})</p>
          </div>
          <div className="mt-2">
            <TaskList
              tasks={overdueTasks}
              allTasks={todos.tasks}
              projects={projects}
              onToggle={todos.toggleTask}
              onEdit={onEdit}
              onDelete={todos.deleteTask}
              onToggleSubtask={todos.toggleSubtask}
              onAddSubtask={todos.addSubtask}
              onSetStatus={todos.setTaskStatus}
              onStartFocus={onStartFocus}
            />
          </div>
        </section>
      )}

      {/* Remaining today */}
      <section>
        <div className={`${groupHeaderCls} bg-[var(--color-paper-subtle)]`}>
          <p className={eyebrowCls}>To Do Today ({remainingTodayCount})</p>
        </div>
        <div className="mt-2">
          <TaskList
            tasks={todayRemaining}
            allTasks={todos.tasks}
            projects={projects}
            onToggle={todos.toggleTask}
            onEdit={onEdit}
            onDelete={todos.deleteTask}
            onToggleSubtask={todos.toggleSubtask}
            onAddSubtask={todos.addSubtask}
            onSetStatus={todos.setTaskStatus}
            onStartFocus={onStartFocus}
            emptyTitle={totalToday > 0 && remainingTodayCount === 0 ? 'Your list is clear. Nice!' : 'No tasks scheduled for today'}
            emptySubtitle={totalToday > 0 && remainingTodayCount === 0 ? 'You have completed all your tasks for today. Rest easy or add more if you like.' : 'Enjoy a free day or plan something gentle using the input above.'}
          />
        </div>
      </section>

      {/* Completed today */}
      {todayCompleted.length > 0 && (
        <section>
          <button
            type="button"
            onClick={() => setShowCompleted((prev) => !prev)}
            aria-expanded={showCompleted}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[var(--color-leaf-subtle)] hover:bg-[var(--color-leaf-subtle)] transition-colors"
          >
            <CheckCircle2 size={15} className="text-[var(--color-leaf)]" />
            <p className={`${eyebrowCls} text-[var(--color-leaf)] flex-1 text-left`}>Completed Today ({completedTodayCount})</p>
            {showCompleted ? <ChevronUp size={15} className="text-[var(--color-leaf)]" /> : <ChevronDown size={15} className="text-[var(--color-leaf)]" />}
          </button>
          {showCompleted && (
            <div className="mt-2">
              <TaskList
                tasks={todayCompleted}
                allTasks={todos.tasks}
                projects={projects}
                onToggle={todos.toggleTask}
                onEdit={onEdit}
                onDelete={todos.deleteTask}
                onToggleSubtask={todos.toggleSubtask}
                onAddSubtask={todos.addSubtask}
                onSetStatus={todos.setTaskStatus}
                onStartFocus={onStartFocus}
              />
            </div>
          )}
        </section>
      )}
    </motion.div>
  );
}
