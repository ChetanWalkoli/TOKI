import { AnimatePresence, motion } from 'framer-motion';
import TaskCard from './TaskCard';

export default function TaskList({
  tasks = [],
  onToggle,
  onEdit,
  onDelete,
  onToggleSubtask,
  onAddSubtask,
  onSetStatus,
  onTagClick,
  onStartFocus,
  emptyTitle = 'Nothing here yet',
  emptySubtitle = 'Add a task above to get started.',
  emptyAction = null,
}) {
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
        <div className="text-3xl mb-3">🌿</div>
        <p className="font-['Fraunces'] text-base font-semibold text-[var(--color-ink)] mb-1">{emptyTitle}</p>
        <p className="text-sm text-[var(--color-muted)] max-w-xs leading-relaxed">{emptySubtitle}</p>
        {emptyAction && <div className="mt-4">{emptyAction}</div>}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <AnimatePresence mode="popLayout">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onToggle={onToggle}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleSubtask={onToggleSubtask}
            onAddSubtask={onAddSubtask}
            onSetStatus={onSetStatus}
            onTagClick={onTagClick}
            onStartFocus={onStartFocus}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
