import { motion } from 'framer-motion';
import TaskList from '../components/tasks/TaskList';
import { isOverdue } from '../utils/task';

const iso = (offset) => new Date(Date.now() + offset * 86400000).toISOString().slice(0, 10);
export default function Upcoming({ todos, onEdit }) {
  const tomorrow = iso(1);
  const weekEnd = iso(7);
  const groups = [{ label: 'Tomorrow', tasks: todos.tasks.filter((task) => !task.completed && task.dueDate === tomorrow) }, { label: 'This week', tasks: todos.tasks.filter((task) => !task.completed && task.dueDate > tomorrow && task.dueDate <= weekEnd) }, { label: 'Later', tasks: todos.tasks.filter((task) => !task.completed && task.dueDate > weekEnd) }];
  const overdue = todos.tasks.filter(isOverdue);
  return <motion.div className="page tasks-page" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}><div className="page-title"><p className="eyebrow">Give future you a hand</p><h1>Upcoming</h1></div>{overdue.length > 0 && <section className="task-group overdue"><p className="eyebrow">Overdue</p><TaskList tasks={overdue} onToggle={todos.toggleTask} onEdit={onEdit} onDelete={todos.deleteTask} /></section>}{groups.map((group) => <section className="task-group" key={group.label}><p className="eyebrow">{group.label}</p><TaskList tasks={group.tasks} onToggle={todos.toggleTask} onEdit={onEdit} onDelete={todos.deleteTask} emptyMessage={`Nothing for ${group.label.toLowerCase()}.`} /></section>)}</motion.div>;
}
