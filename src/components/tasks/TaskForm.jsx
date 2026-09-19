import { useState } from 'react';
import { categories, priorityOptions, toDateInput } from '../../utils/task';

const getInitialState = (task, defaults = {}) => {
  if (task && task.id) {
    return {
      title: task.title || '',
      description: task.description || '',
      priority: task.priority || defaults.defaultPriority || 'Medium',
      category: task.category || defaults.defaultCategory || 'Personal',
      dueDate: task.dueDate !== undefined ? task.dueDate : toDateInput(),
    };
  }

  return {
    title: task?.title || '',
    description: task?.description || '',
    priority: task?.priority || defaults.defaultPriority || 'Medium',
    category: task?.category || defaults.defaultCategory || 'Personal',
    dueDate: task?.dueDate !== undefined ? task?.dueDate : toDateInput(),
  };
};

export default function TaskForm({ task, defaults = {}, onSave, onCancel }) {
  const [form, setForm] = useState(() => getInitialState(task, defaults));
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === 'title' && value.trim()) {
      setError('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanTitle = form.title.trim();
    if (!cleanTitle) {
      setError('Please give your task a title.');
      return;
    }

    onSave({
      ...form,
      title: cleanTitle,
      description: form.description.trim(),
    });
  };

  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <form className="task-form" onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
      <div className="field">
        <label htmlFor="task-title-input">
          Task title <span className="required-star">*</span>
        </label>
        <input
          id="task-title-input"
          name="title"
          type="text"
          value={form.title}
          onChange={handleChange}
          placeholder="e.g., Draft project summary"
          autoFocus
        />
        {error && <p className="field-error" role="alert">{error}</p>}
      </div>

      <div className="field">
        <label htmlFor="task-desc-input">
          Notes / Context <em className="optional-label">(optional)</em>
        </label>
        <textarea
          id="task-desc-input"
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Add details, links, or notes to help future you…"
          rows={3}
        />
      </div>

      <div className="form-grid">
        <div className="field">
          <label htmlFor="task-priority-select">Priority</label>
          <select
            id="task-priority-select"
            name="priority"
            value={form.priority}
            onChange={handleChange}
          >
            {priorityOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="task-category-select">Category</label>
          <select
            id="task-category-select"
            name="category"
            value={form.category}
            onChange={handleChange}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="field">
        <label htmlFor="task-duedate-input">Due date</label>
        <input
          id="task-duedate-input"
          type="date"
          name="dueDate"
          value={form.dueDate}
          onChange={handleChange}
        />
      </div>

      <div className="form-actions">
        <button
          type="button"
          className="button button-ghost"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="button button-primary"
        >
          {task?.id ? 'Save changes' : 'Add task'}
        </button>
      </div>
    </form>
  );
}
