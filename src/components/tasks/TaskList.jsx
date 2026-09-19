import { AnimatePresence } from 'framer-motion';
import TaskCard from './TaskCard';

export default function TaskList({
  tasks = [],
  emptyTitle = 'All clear for now',
  emptySubtitle = 'Take a breath or add something new when you are ready.',
  emptyAction,
  ...actions
}) {
  if (tasks.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon-wrap" aria-hidden="true">
          🌱
        </div>
        <h4 className="empty-title">{emptyTitle}</h4>
        <p className="empty-subtitle">{emptySubtitle}</p>
        {emptyAction && <div className="empty-action-wrap">{emptyAction}</div>}
      </div>
    );
  }

  return (
    <div className="task-list" role="list">
      <AnimatePresence initial={false} mode="popLayout">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} {...actions} />
        ))}
      </AnimatePresence>
    </div>
  );
}
