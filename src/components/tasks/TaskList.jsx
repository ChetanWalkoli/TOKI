import { AnimatePresence } from 'framer-motion';
import TaskCard from './TaskCard';

export default function TaskList({ tasks, emptyMessage = 'All clear for now', ...actions }) {
  if (!tasks.length) return <div className="empty-inline"><span>🌿</span><strong>{emptyMessage}</strong><p>Enjoy the empty list.</p></div>;
  return <div className="task-list"><AnimatePresence initial={false}>{tasks.map((task) => <TaskCard key={task.id} task={task} {...actions} />)}</AnimatePresence></div>;
}
