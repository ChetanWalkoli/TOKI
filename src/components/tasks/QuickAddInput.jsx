import { useState } from 'react';
import { Plus, SlidersHorizontal, CornerDownLeft } from 'lucide-react';
import { toDateInput } from '../../utils/task';

export default function QuickAddInput({
  onAdd,
  onOpenDetailed,
  defaults = {},
  defaultDueDate,
  placeholder = 'Add a task… (press Enter to save)',
}) {
  const [title, setTitle] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) return;

    onAdd({
      title: cleanTitle,
      description: '',
      priority: defaults.defaultPriority || 'Medium',
      category: defaults.defaultCategory || 'Personal',
      dueDate: defaultDueDate !== undefined ? defaultDueDate : toDateInput(),
    });

    setTitle('');
  };

  const handleDetailedClick = () => {
    onOpenDetailed({
      title: title.trim(),
      priority: defaults.defaultPriority || 'Medium',
      category: defaults.defaultCategory || 'Personal',
      dueDate: defaultDueDate !== undefined ? defaultDueDate : toDateInput(),
    });
  };

  return (
    <form className="quick-add-form" onSubmit={handleSubmit}>
      <div className="quick-add-input-wrap">
        <Plus size={18} className="quick-add-icon" />
        <input
          type="text"
          className="quick-add-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={placeholder}
          aria-label="Quickly add a task"
        />
        {title.trim() && (
          <button
            type="submit"
            className="quick-add-submit-btn"
            aria-label="Submit task"
            title="Press Enter to add"
          >
            <CornerDownLeft size={14} />
            <span>Add</span>
          </button>
        )}
        <button
          type="button"
          className="quick-add-more-btn"
          onClick={handleDetailedClick}
          aria-label="Add task with full details"
          title="Add with details (priority, category, date, notes)"
        >
          <SlidersHorizontal size={15} />
          <span className="details-label">Details</span>
        </button>
      </div>
    </form>
  );
}
