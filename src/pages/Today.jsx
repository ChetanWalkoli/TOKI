import { motion } from 'framer-motion';
import TaskList from '../components/tasks/TaskList';
import { isOverdue, isToday } from '../utils/task';

export default function Today({ todos, onEdit }) {
  const overdue = todos.tasks.filter(isOverdue);
  const today = todos.tasks.filter((task) => isToday(task.dueDate));
  const completed = today.filter((task) => task.completed).length;
  return <motion.div className="page tasks-page" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}><div className="page-title"><p className="eyebrow">A short list is a kind list</p><h1>Today</h1><p className="page-copy">{completed} done · {today.length - completed} left</p></div>{overdue.length > 0 && <section className="task-group overdue"><p className="eyebrow">Overdue</p><TaskList tasks={overdue} onToggle={todos.toggleTask} onEdit={onEdit} onDelete={todos.deleteTask} /></section>}<section className="task-group"><p className="eyebrow">Due today</p><TaskList tasks={today} onToggle={todos.toggleTask} onEdit={onEdit} onDelete={todos.deleteTask} emptyMessage="Nothing due today." /></section></motion.div>;
}
