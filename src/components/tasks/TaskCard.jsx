import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, Check, MoreHorizontal, Pencil, Trash2, AlertCircle } from 'lucide-react';
import { formatDueDate, isOverdue } from '../../utils/task';

export default function TaskCard({ task, onToggle, onEdit, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const overdue = isOverdue(task);

  // Close menu on click outside or escape key
  useEffect(() => {
    if (!menuOpen) return;

    const handleDocumentClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleDocumentClick);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleDocumentClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuOpen]);

  const handleEdit = () => {
    setMenuOpen(false);
    onEdit(task);
  };

  const handleDelete = () => {
    setMenuOpen(false);
    onDelete(task.id);
  };

  return (
    <motion.article
      layout
      className={`task-card ${task.completed ? 'is-complete' : ''} ${overdue ? 'task-overdue' : ''}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <button
        type="button"
        className="task-check"
        onClick={() => onToggle(task.id)}
        aria-label={task.completed ? `Mark "${task.title}" incomplete` : `Mark "${task.title}" complete`}
      >
        <motion.span
          className="check-icon-wrap"
          initial={false}
          animate={task.completed ? { scale: [0.6, 1.2, 1] } : { scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          {task.completed && <Check size={14} strokeWidth={3} />}
        </motion.span>
      </button>

      <div className="task-content">
        <div className="task-header-row">
          <h3 className="task-title">{task.title}</h3>
        </div>

        {task.description && <p className="task-description">{task.description}</p>}

        <div className="task-meta">
          <span className={`priority-pill priority-${task.priority.toLowerCase()}`}>
            <i className="priority-dot" />
            <span>{task.priority}</span>
          </span>

          {task.dueDate && (
            <span className={`due-pill ${overdue ? 'due-overdue' : ''}`}>
              {overdue ? <AlertCircle size={13} /> : <CalendarDays size={13} />}
              <span>{formatDueDate(task.dueDate)}</span>
            </span>
          )}

          <span className="category-pill">{task.category}</span>
        </div>
      </div>

      <div className="task-actions" ref={menuRef}>
        <button
          type="button"
          className="icon-button menu-trigger"
          aria-label={`Options for "${task.title}"`}
          aria-expanded={menuOpen}
          aria-haspopup="true"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          <MoreHorizontal size={18} />
        </button>

        {menuOpen && (
          <div className="menu-popover" role="menu">
            <button type="button" role="menuitem" onClick={handleEdit}>
              <Pencil size={14} />
              <span>Edit</span>
            </button>
            <button type="button" role="menuitem" className="danger" onClick={handleDelete}>
              <Trash2 size={14} />
              <span>Delete</span>
            </button>
          </div>
        )}
      </div>
    </motion.article>
  );
}
