import { motion } from 'framer-motion';
import { CalendarDays, Check, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function TaskCard({ task, onToggle, onEdit, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return <motion.article layout className={`task-card ${task.completed ? 'is-complete' : ''}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0, scale: task.completed ? .985 : 1 }} exit={{ opacity: 0, x: 40 }} transition={{ duration: .22 }}>
    <button className="task-check" onClick={() => onToggle(task.id)} aria-label={task.completed ? `Mark ${task.title} incomplete` : `Complete ${task.title}`}><motion.span animate={task.completed ? { scale: [0, 1.25, 1] } : { scale: 1 }} transition={{ duration: .26 }}>{task.completed && <Check size={15} strokeWidth={3} />}</motion.span></button>
    <div className="task-content"><h3>{task.title}</h3>{task.description && <p>{task.description}</p>}<div className="task-meta"><span className={`priority priority-${task.priority}`}><i />{task.priority}</span><span><CalendarDays size={14} /> {task.dueDate === new Date().toISOString().slice(0, 10) ? 'Today' : task.dueDate}</span><span className="category-pill">{task.category}</span></div></div>
    <div className="task-menu"><button className="icon-button" aria-label={`Options for ${task.title}`} onClick={() => setMenuOpen(!menuOpen)}><MoreHorizontal size={20} /></button>{menuOpen && <div className="menu-popover"><button onClick={() => onEdit(task)}><Pencil size={15} /> Edit</button><button className="danger" onClick={() => onDelete(task.id)}><Trash2 size={15} /> Delete</button></div>}</div>
  </motion.article>;
}
