import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from 'lucide-react';
import TaskList from '../components/tasks/TaskList';
import { getTodayString } from '../utils/task';

const dotColors = { high: 'bg-[var(--color-red)]', medium: 'bg-[var(--color-butter)]', low: 'bg-[var(--color-leaf)]' };

export default function CalendarView({ todos, onAdd, onEdit, settings }) {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDateStr, setSelectedDateStr] = useState(() => getTodayString());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = currentDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  const tasksByDate = useMemo(() => {
    const map = {};
    todos.tasks.forEach((task) => {
      if (task.dueDate) { if (!map[task.dueDate]) map[task.dueDate] = []; map[task.dueDate].push(task); }
    });
    return map;
  }, [todos.tasks]);

  const selectedDayTasks = tasksByDate[selectedDateStr] || [];
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const calendarCells = [];
  for (let i = 0; i < firstDayIndex; i++) calendarCells.push({ key: `empty-${i}`, day: null, dateStr: null });
  for (let d = 1; d <= daysInMonth; d++) {
    const m = String(month + 1).padStart(2, '0');
    const dy = String(d).padStart(2, '0');
    calendarCells.push({ key: `day-${d}`, day: d, dateStr: `${year}-${m}-${dy}` });
  }

  const selectedDateFormatted = new Date(
    parseInt(selectedDateStr.split('-')[0]),
    parseInt(selectedDateStr.split('-')[1]) - 1,
    parseInt(selectedDateStr.split('-')[2])
  ).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <motion.div
      className="flex flex-col gap-6 h-full"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="flex items-center gap-3">
        <div>
          <p className="text-xs font-semibold tracking-wider text-[var(--color-muted)] uppercase">Timeline & Schedule</p>
          <h1 className="font-['Fraunces'] text-3xl font-semibold text-[var(--color-ink)]">Calendar</h1>
        </div>
        <button type="button" onClick={() => onAdd({ dueDate: selectedDateStr })}
          className="ml-auto flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--color-coral)] text-white text-sm font-semibold hover:bg-[var(--color-coral-hover)] transition-colors">
          <Plus size={15} /> Task for this day
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-5 flex-1 min-h-0">
        {/* Calendar grid */}
        <div className="flex flex-col gap-3 lg:w-[55%] shrink-0">
          {/* Nav bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarIcon size={18} className="text-[var(--color-muted)]" />
              <h2 className="font-['Fraunces'] font-semibold text-base text-[var(--color-ink)]">{monthName}</h2>
            </div>
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
                className="px-3 py-1.5 text-xs rounded-lg border border-[var(--color-line)] text-[var(--color-ink-secondary)] hover:bg-[var(--color-paper-deep)] transition-colors">Today</button>
              {[
                { action: () => setCurrentDate(new Date(year, month - 1, 1)), Icon: ChevronLeft, label: 'Previous month' },
                { action: () => setCurrentDate(new Date(year, month + 1, 1)), Icon: ChevronRight, label: 'Next month' },
              ].map(({ action, Icon, label }) => (
                <button key={label} type="button" onClick={action} aria-label={label}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--color-muted)] hover:bg-[var(--color-paper-deep)] transition-colors">
                  <Icon size={17} />
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-7 rounded-xl border border-[var(--color-line)] bg-[var(--color-paper-card)] overflow-hidden shadow-[var(--shadow-sm)]">
            {daysOfWeek.map((d) => (
              <div key={d} className="py-2 text-center text-[10px] font-bold tracking-wider text-[var(--color-muted)] uppercase border-b border-[var(--color-line-subtle)]">{d}</div>
            ))}
            {calendarCells.map((cell) => {
              if (!cell.day) return <div key={cell.key} className="h-14 border-b border-r border-[var(--color-line-subtle)] last:border-r-0 bg-[var(--color-paper-subtle)]" />;
              const isToday = cell.dateStr === getTodayString();
              const isSelected = cell.dateStr === selectedDateStr;
              const dayTasks = tasksByDate[cell.dateStr] || [];
              const activeDayTasks = dayTasks.filter((t) => !t.completed);
              return (
                <button key={cell.key} type="button" onClick={() => setSelectedDateStr(cell.dateStr)}
                  className={`h-14 flex flex-col items-center pt-2 gap-1 border-b border-r border-[var(--color-line-subtle)] last:border-r-0 transition-colors ${
                    isSelected ? 'bg-[var(--color-coral)] text-white' : isToday ? 'bg-[var(--color-coral-subtle)] text-[var(--color-coral)]' : 'hover:bg-[var(--color-paper-deep)] text-[var(--color-ink)]'
                  }`}>
                  <span className={`text-xs font-bold ${isSelected ? 'text-white' : ''}`}>{cell.day}</span>
                  <div className="flex gap-0.5 flex-wrap justify-center px-1">
                    {activeDayTasks.slice(0, 3).map((task) => (
                      <span key={task.id} className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white/70' : dotColors[task.priority?.toLowerCase() || 'medium']}`} title={task.title} />
                    ))}
                    {dayTasks.length > 3 && <span className={`text-[8px] font-bold ${isSelected ? 'text-white/70' : 'text-[var(--color-muted)]'}`}>+{dayTasks.length - 3}</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Day panel */}
        <div className="flex-1 flex flex-col gap-3 min-h-0">
          <div className="px-4 py-3 rounded-xl border border-[var(--color-line)] bg-[var(--color-paper-card)] shadow-[var(--shadow-sm)]">
            <p className="text-[10px] font-semibold tracking-wider text-[var(--color-muted)] uppercase">Scheduled Tasks</p>
            <h3 className="font-['Fraunces'] font-semibold text-base text-[var(--color-ink)] mt-0.5">{selectedDateFormatted}</h3>
            <span className="text-[11px] text-[var(--color-muted)]">
              {selectedDayTasks.filter((t) => !t.completed).length} to do · {selectedDayTasks.filter((t) => t.completed).length} completed
            </span>
          </div>
          <div className="flex-1 overflow-y-auto">
            <TaskList
              tasks={selectedDayTasks}
              allTasks={todos.tasks}
              projects={todos.projects}
              onToggle={todos.toggleTask}
              onEdit={onEdit}
              onDelete={todos.deleteTask}
              emptyTitle="No tasks for this date"
              emptySubtitle="Click the button above to add something for this day."
              emptyAction={
                <button type="button" onClick={() => onAdd({ dueDate: selectedDateStr })}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[var(--color-line)] text-sm text-[var(--color-ink-secondary)] hover:bg-[var(--color-paper-deep)] transition-colors">
                  <Plus size={14} /> Add task
                </button>
              }
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
