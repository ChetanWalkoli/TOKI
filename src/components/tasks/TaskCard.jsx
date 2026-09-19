import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarDays,
  Check,
  MoreHorizontal,
  Pencil,
  Trash2,
  AlertCircle,
  CheckSquare,
  ChevronDown,
  ChevronUp,
  Plus,
  Timer,
  Hash,
  ArrowRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDueDate, isOverdue } from '../../utils/task';

export default function TaskCard({
  task,
  onToggle,
  onEdit,
  onDelete,
  onToggleSubtask,
  onAddSubtask,
  onSetStatus,
  onTagClick,
  onStartFocus,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [subtasksOpen, setSubtasksOpen] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [showAddSubtask, setShowAddSubtask] = useState(false);

  const menuRef = useRef(null);
  const navigate = useNavigate();
  const overdue = isOverdue(task);

  const subtasks = task.subtasks || [];
  const completedSubtasks = subtasks.filter((st) => st.completed).length;
  const totalSubtasks = subtasks.length;

  useEffect(() => {
    if (!menuOpen) return;
    const handleDocumentClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    const handleKeyDown = (e) => { if (e.key === 'Escape') setMenuOpen(false); };
    document.addEventListener('mousedown', handleDocumentClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleDocumentClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuOpen]);

  const handleAddSubtaskSubmit = (e) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim() || !onAddSubtask) return;
    onAddSubtask(task.id, newSubtaskTitle.trim());
    setNewSubtaskTitle('');
    setShowAddSubtask(false);
  };

  const handleFocusClick = () => {
    if (onStartFocus) onStartFocus(task.id);
    else navigate(`/focus?taskId=${task.id}`);
  };

  const priorityColors = {
    high:   'bg-[var(--color-red-subtle)] text-[var(--color-red)]',
    medium: 'bg-[var(--color-butter-subtle)] text-[var(--color-butter)]',
    low:    'bg-[var(--color-leaf-subtle)] text-[var(--color-leaf)]',
  };
  const priorityDots = {
    high: 'bg-[var(--color-red)]',
    medium: 'bg-[var(--color-butter)]',
    low: 'bg-[var(--color-leaf)]',
  };
  const pKey = task.priority?.toLowerCase() || 'medium';

  return (
    <motion.article
      layout
      className={`flex items-start gap-3 p-4 rounded-xl border bg-[var(--color-paper-card)] shadow-[var(--shadow-sm)] transition-all ${
        task.completed
          ? 'opacity-60 border-[var(--color-line-subtle)]'
          : overdue
          ? 'border-[var(--color-red)] border-opacity-40'
          : 'border-[var(--color-line)] hover:border-[var(--color-line-strong)] hover:shadow-[var(--shadow-md)]'
      }`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      {/* Checkbox */}
      <button
        type="button"
        onClick={() => onToggle(task.id)}
        aria-label={task.completed ? `Mark "${task.title}" incomplete` : `Mark "${task.title}" complete`}
        className="shrink-0 mt-0.5"
      >
        <motion.span
          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
            task.completed
              ? 'bg-[var(--color-leaf)] border-[var(--color-leaf)]'
              : 'border-[var(--color-line-strong)] hover:border-[var(--color-coral)]'
          }`}
          initial={false}
          animate={task.completed ? { scale: [0.6, 1.25, 1] } : { scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          {task.completed && <Check size={12} strokeWidth={3} className="text-white" />}
        </motion.span>
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className={`text-sm font-semibold text-[var(--color-ink)] leading-snug mb-1.5 ${
          task.completed ? 'line-through text-[var(--color-muted)]' : ''
        }`}>{task.title}</h3>

        {task.description && (
          <p className="text-xs text-[var(--color-muted)] mb-2 leading-relaxed">{task.description}</p>
        )}

        {/* Meta pills */}
        <div className="flex flex-wrap items-center gap-1.5 mb-1">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${priorityColors[pKey]}`}>
            <i className={`w-1.5 h-1.5 rounded-full ${priorityDots[pKey]}`} />
            <span>{task.priority}</span>
          </span>

          {task.dueDate && (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${
              overdue
                ? 'bg-[var(--color-red-subtle)] text-[var(--color-red)]'
                : 'bg-[var(--color-paper-deep)] text-[var(--color-ink-secondary)]'
            }`}>
              {overdue ? <AlertCircle size={11} /> : <CalendarDays size={11} />}
              <span>{formatDueDate(task.dueDate)}</span>
            </span>
          )}

          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-[var(--color-paper-deep)] text-[var(--color-muted)]">
            {task.category}
          </span>

          {totalSubtasks > 0 && (
            <button
              type="button"
              onClick={() => setSubtasksOpen((prev) => !prev)}
              aria-label="Toggle subtasks checklist"
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-[var(--color-paper-deep)] text-[var(--color-ink-secondary)] hover:bg-[var(--color-line)] transition-colors"
            >
              <CheckSquare size={11} />
              <span>{completedSubtasks}/{totalSubtasks}</span>
              {subtasksOpen ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
            </button>
          )}

          {!task.completed && (
            <button
              type="button"
              onClick={handleFocusClick}
              title="Start Pomodoro focus session on this task"
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-[var(--color-paper-deep)] text-[var(--color-muted)] hover:bg-[var(--color-coral-subtle)] hover:text-[var(--color-coral)] transition-colors"
            >
              <Timer size={11} />
              <span>{task.focusSessions > 0 ? `${task.focusMinutes}m` : 'Focus'}</span>
            </button>
          )}
        </div>

        {/* Tags */}
        {Array.isArray(task.tags) && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {task.tags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => onTagClick && onTagClick(tag)}
                title={`Filter by #${tag}`}
                className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] bg-[var(--color-paper-subtle)] text-[var(--color-muted)] hover:bg-[var(--color-paper-deep)] hover:text-[var(--color-ink)] transition-colors border border-[var(--color-line-subtle)]"
              >
                <Hash size={9} />
                <span>{tag}</span>
              </button>
            ))}
          </div>
        )}

        {/* Subtasks */}
        <AnimatePresence>
          {subtasksOpen && (
            <motion.div
              className="mt-2 overflow-hidden"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex flex-col gap-1 pt-2 border-t border-[var(--color-line-subtle)]">
                {subtasks.map((st) => (
                  <label key={st.id} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={st.completed}
                      onChange={() => onToggleSubtask && onToggleSubtask(task.id, st.id)}
                      className="w-3.5 h-3.5 rounded accent-[var(--color-coral)]"
                    />
                    <span className={`text-xs leading-snug ${
                      st.completed ? 'line-through text-[var(--color-muted)]' : 'text-[var(--color-ink)]'
                    }`}>{st.title}</span>
                  </label>
                ))}
              </div>

              {showAddSubtask ? (
                <form onSubmit={handleAddSubtaskSubmit} className="flex gap-2 mt-2">
                  <input
                    type="text"
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    placeholder="Subtask description…"
                    autoFocus
                    className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-[var(--color-line)] bg-[var(--color-paper-card)] text-[var(--color-ink)] outline-none focus:border-[var(--color-coral)]"
                  />
                  <button type="submit"
                    className="px-3 py-1.5 rounded-lg bg-[var(--color-coral)] text-white text-xs font-semibold hover:bg-[var(--color-coral-hover)] transition-colors">
                    Add
                  </button>
                  <button type="button" onClick={() => setShowAddSubtask(false)}
                    className="px-3 py-1.5 rounded-lg border border-[var(--color-line)] text-[var(--color-ink-secondary)] text-xs hover:bg-[var(--color-paper-deep)] transition-colors">
                    Cancel
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowAddSubtask(true)}
                  className="flex items-center gap-1 mt-2 text-[11px] text-[var(--color-muted)] hover:text-[var(--color-ink)] transition-colors"
                >
                  <Plus size={12} /> Add subtask
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Actions menu */}
      <div className="relative shrink-0" ref={menuRef}>
        <button
          type="button"
          aria-label={`Options for "${task.title}"`}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((prev) => !prev)}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--color-muted)] hover:bg-[var(--color-paper-deep)] transition-colors"
        >
          <MoreHorizontal size={17} />
        </button>

        {menuOpen && (
          <div
            className="absolute right-0 top-9 z-20 w-44 bg-[var(--color-paper-card)] border border-[var(--color-line)] rounded-xl shadow-[var(--shadow-lg)] overflow-hidden"
            role="menu"
          >
            {[
              { icon: Pencil, label: 'Edit task', action: () => { setMenuOpen(false); onEdit(task); } },
              onSetStatus && {
                icon: ArrowRight,
                label: task.status === 'in_progress' ? 'Mark as Todo' : 'Set In Progress',
                action: () => { setMenuOpen(false); onSetStatus(task.id, task.status === 'in_progress' ? 'todo' : 'in_progress'); },
              },
              {
                icon: CheckSquare,
                label: 'Add subtask',
                action: () => { setMenuOpen(false); setSubtasksOpen(true); setShowAddSubtask(true); },
              },
            ].filter(Boolean).map(({ icon: Icon, label, action }) => (
              <button key={label} type="button" role="menuitem" onClick={action}
                className="flex items-center gap-2.5 w-full px-3 py-2.5 text-xs text-[var(--color-ink)] hover:bg-[var(--color-paper-subtle)] transition-colors text-left">
                <Icon size={13} />
                <span>{label}</span>
              </button>
            ))}
            <button type="button" role="menuitem"
              onClick={() => { setMenuOpen(false); onDelete(task.id); }}
              className="flex items-center gap-2.5 w-full px-3 py-2.5 text-xs text-[var(--color-red)] hover:bg-[var(--color-red-subtle)] transition-colors text-left">
              <Trash2 size={13} />
              <span>Delete</span>
            </button>
          </div>
        )}
      </div>
    </motion.article>
  );
}
