import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ArrowRight, ArrowLeft, CheckSquare, CalendarDays } from 'lucide-react';
import { formatDueDate, isOverdue } from '../utils/task';

const priorityColors = { high: 'bg-[var(--color-red-subtle)] text-[var(--color-red)]', medium: 'bg-[var(--color-butter-subtle)] text-[var(--color-butter)]', low: 'bg-[var(--color-leaf-subtle)] text-[var(--color-leaf)]' };
const priorityDots  = { high: 'bg-[var(--color-red)]', medium: 'bg-[var(--color-butter)]', low: 'bg-[var(--color-leaf)]' };

export default function Kanban({ todos, onAdd, onEdit }) {
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);
  const [quickAddColumn, setQuickAddColumn] = useState(null);
  const [quickAddTitle, setQuickAddTitle] = useState('');
  const [mobileTab, setMobileTab] = useState('all');

  const columns = [
    { id: 'todo',        title: 'To Do',       color: 'var(--color-butter)' },
    { id: 'in_progress', title: 'In Progress',  color: 'var(--color-coral)' },
    { id: 'done',        title: 'Done',         color: 'var(--color-leaf)' },
  ];

  const handleDragStart = (e, taskId) => { e.dataTransfer.setData('text/plain', taskId); e.dataTransfer.effectAllowed = 'move'; setDraggedTaskId(taskId); };
  const handleDragOver  = (e, colId) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; if (dragOverColumn !== colId) setDragOverColumn(colId); };
  const handleDragLeave = (e, colId) => { if (dragOverColumn === colId) setDragOverColumn(null); };
  const handleDrop = (e, targetColumnId) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    setDragOverColumn(null); setDraggedTaskId(null);
    if (taskId && todos.setTaskStatus) todos.setTaskStatus(taskId, targetColumnId);
  };

  const handleQuickAddSubmit = (colId) => {
    if (!quickAddTitle.trim()) return;
    todos.addTask({ title: quickAddTitle.trim(), status: colId, completed: colId === 'done' });
    setQuickAddTitle(''); setQuickAddColumn(null);
  };

  const visibleColumns = mobileTab === 'all' ? columns : columns.filter((c) => c.id === mobileTab);

  return (
    <motion.div
      className="flex flex-col gap-5 h-full max-w-7xl 2xl:max-w-[1600px] mx-auto w-full"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-wider text-[var(--color-muted)] uppercase">Flow & Momentum</p>
          <h1 className="font-['Fraunces'] text-2xl sm:text-3xl font-semibold text-[var(--color-ink)]">Kanban Board</h1>
        </div>
        <button type="button" onClick={() => onAdd({ status: mobileTab !== 'all' ? mobileTab : 'todo' })}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[var(--color-coral)] text-white text-sm font-semibold hover:bg-[var(--color-coral-hover)] transition-colors">
          <Plus size={15} /> New task
        </button>
      </div>

      {/* Mobile column switcher pills */}
      <div className="flex md:hidden items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        <button
          type="button"
          onClick={() => setMobileTab('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
            mobileTab === 'all'
              ? 'bg-[var(--color-coral)] text-white'
              : 'bg-[var(--color-paper-card)] border border-[var(--color-line)] text-[var(--color-ink-secondary)]'
          }`}
        >
          All Columns
        </button>
        {columns.map((col) => {
          const count = todos.tasks.filter((t) => (t.status || (t.completed ? 'done' : 'todo')) === col.id).length;
          return (
            <button
              key={col.id}
              type="button"
              onClick={() => setMobileTab(col.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                mobileTab === col.id
                  ? 'bg-[var(--color-coral)] text-white'
                  : 'bg-[var(--color-paper-card)] border border-[var(--color-line)] text-[var(--color-ink-secondary)]'
              }`}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: col.color }} />
              <span>{col.title}</span>
              <span className="text-[10px] opacity-75">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 min-h-0">
        {visibleColumns.map((col) => {
          const colTasks = todos.tasks.filter((t) => (t.status || (t.completed ? 'done' : 'todo')) === col.id);
          const isOver = dragOverColumn === col.id;

          return (
            <div
              key={col.id}
              className={`flex flex-col rounded-xl border bg-[var(--color-paper-subtle)] min-h-[200px] transition-all ${
                isOver ? 'border-[var(--color-coral)] ring-2 ring-[var(--color-coral-subtle)]' : 'border-[var(--color-line)]'
              }`}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={(e) => handleDragLeave(e, col.id)}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              {/* Column header */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--color-line-subtle)]">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: col.color }} />
                <h2 className="font-semibold text-sm text-[var(--color-ink)] flex-1">{col.title}</h2>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[var(--color-paper-deep)] text-[var(--color-muted)]">{colTasks.length}</span>
                <button type="button" onClick={() => setQuickAddColumn(quickAddColumn === col.id ? null : col.id)}
                  aria-label={`Add task to ${col.title}`}
                  className="w-6 h-6 flex items-center justify-center rounded-lg text-[var(--color-muted)] hover:bg-[var(--color-paper-deep)] transition-colors">
                  <Plus size={14} />
                </button>
              </div>

              {/* Quick add */}
              {quickAddColumn === col.id && (
                <div className="px-3 py-2 border-b border-[var(--color-line-subtle)] bg-[var(--color-paper-card)]">
                  <input type="text" value={quickAddTitle} onChange={(e) => setQuickAddTitle(e.target.value)}
                    placeholder="Task name…" autoFocus
                    onKeyDown={(e) => { if (e.key === 'Enter') handleQuickAddSubmit(col.id); if (e.key === 'Escape') setQuickAddColumn(null); }}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[var(--color-line)] text-sm text-[var(--color-ink)] bg-[var(--color-paper-card)] outline-none focus:border-[var(--color-coral)] transition-all mb-2" />
                  <div className="flex gap-1.5">
                    <button type="button" onClick={() => handleQuickAddSubmit(col.id)}
                      className="px-3 py-1 rounded-lg bg-[var(--color-coral)] text-white text-xs font-semibold hover:bg-[var(--color-coral-hover)] transition-colors">Add</button>
                    <button type="button" onClick={() => setQuickAddColumn(null)}
                      className="px-3 py-1 rounded-lg border border-[var(--color-line)] text-xs text-[var(--color-ink-secondary)] hover:bg-[var(--color-paper-deep)] transition-colors">Cancel</button>
                  </div>
                </div>
              )}

              {/* Cards */}
              <div className="flex-1 p-3 flex flex-col gap-2 overflow-y-auto">
                <AnimatePresence mode="popLayout">
                  {colTasks.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-8 text-center">
                      <p className="text-sm text-[var(--color-muted)]">No tasks in {col.title}</p>
                      <small className="text-[11px] text-[var(--color-muted)] mt-0.5">Drop a card here</small>
                    </div>
                  ) : colTasks.map((task) => {
                    const overdue = isOverdue(task);
                    const subtasks = task.subtasks || [];
                    const completedSt = subtasks.filter((st) => st.completed).length;
                    const pKey = task.priority?.toLowerCase() || 'medium';

                    return (
                      <motion.div
                        key={task.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`p-3 rounded-xl border bg-[var(--color-paper-card)] cursor-grab active:cursor-grabbing shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-all ${
                          task.completed ? 'opacity-60' : overdue ? 'border-[var(--color-red)] border-opacity-40' : 'border-[var(--color-line)]'
                        }`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                      >
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${priorityColors[pKey]}`}>
                            <i className={`w-1.5 h-1.5 rounded-full ${priorityDots[pKey]}`} />{task.priority}
                          </span>
                          <div className="flex gap-0.5">
                            {col.id !== 'todo' && (
                              <button type="button" onClick={() => todos.setTaskStatus(task.id, col.id === 'done' ? 'in_progress' : 'todo')} title="Move left"
                                className="w-6 h-6 flex items-center justify-center rounded text-[var(--color-muted)] hover:bg-[var(--color-paper-deep)] transition-colors">
                                <ArrowLeft size={11} />
                              </button>
                            )}
                            {col.id !== 'done' && (
                              <button type="button" onClick={() => todos.setTaskStatus(task.id, col.id === 'todo' ? 'in_progress' : 'done')} title="Move right"
                                className="w-6 h-6 flex items-center justify-center rounded text-[var(--color-muted)] hover:bg-[var(--color-paper-deep)] transition-colors">
                                <ArrowRight size={11} />
                              </button>
                            )}
                          </div>
                        </div>

                        <h3 className={`text-sm font-semibold leading-snug mb-2 cursor-pointer hover:text-[var(--color-coral)] transition-colors ${task.completed ? 'line-through text-[var(--color-muted)]' : 'text-[var(--color-ink)]'}`}
                          onClick={() => onEdit(task)} title="Click to edit task">{task.title}</h3>

                        {task.description && <p className="text-[11px] text-[var(--color-muted)] mb-2 leading-snug line-clamp-2">{task.description}</p>}

                        <div className="flex flex-wrap gap-1 items-center">
                          {task.dueDate && (
                            <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] ${overdue ? 'bg-[var(--color-red-subtle)] text-[var(--color-red)]' : 'bg-[var(--color-paper-deep)] text-[var(--color-muted)]'}`}>
                              <CalendarDays size={10} />{formatDueDate(task.dueDate)}
                            </span>
                          )}
                          {subtasks.length > 0 && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] bg-[var(--color-paper-deep)] text-[var(--color-muted)]">
                              <CheckSquare size={10} />{completedSt}/{subtasks.length}
                            </span>
                          )}
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-[var(--color-paper-deep)] text-[var(--color-muted)]">{task.category}</span>
                        </div>

                        {Array.isArray(task.tags) && task.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {task.tags.map((t) => (
                              <span key={t} className="px-1.5 py-0.5 rounded text-[10px] bg-[var(--color-paper-subtle)] text-[var(--color-muted)] border border-[var(--color-line-subtle)]">#{t}</span>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
