import { useState } from 'react';
import { Plus, X, Hash, Sparkles } from 'lucide-react';
import { categories, priorityOptions, toDateInput, parseTaskInput } from '../../utils/task';

const inputCls = 'w-full px-3 py-2 rounded-lg border border-[var(--color-line)] bg-[var(--color-paper-card)] text-[var(--color-ink)] text-sm outline-none focus:border-[var(--color-coral)] focus:shadow-[0_0_0_3px_var(--color-coral-subtle)] transition-all placeholder:text-[var(--color-muted)]';
const selectCls = inputCls;
const labelCls = 'block text-xs font-medium text-[var(--color-ink-secondary)] mb-1.5';

export default function TaskForm({ task, defaults = {}, onSave, onCancel }) {
  const [form, setForm] = useState(() => ({
    title: task?.title || '',
    description: task?.description || '',
    priority: task?.priority || defaults.defaultPriority || 'Medium',
    category: task?.category || defaults.defaultCategory || 'Personal',
    dueDate: task?.dueDate !== undefined ? task?.dueDate : toDateInput(),
    status: task?.status || (task?.completed ? 'done' : 'todo'),
    subtasks: Array.isArray(task?.subtasks) ? [...task.subtasks] : [],
    tags: Array.isArray(task?.tags) ? [...task.tags] : [],
  }));

  const [newSubtask, setNewSubtask] = useState('');
  const [newTag, setNewTag] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === 'title' && value.trim()) setError('');
  };

  const handleNaturalParse = () => {
    if (!form.title.trim()) return;
    const parsed = parseTaskInput(form.title);
    setForm((prev) => ({
      ...prev,
      title: parsed.title,
      dueDate: parsed.dueDate,
      priority: parsed.priority,
      tags: [...new Set([...prev.tags, ...parsed.tags])],
    }));
  };

  const handleAddSubtask = () => {
    const title = newSubtask.trim();
    if (!title) return;
    setForm((prev) => ({
      ...prev,
      subtasks: [...prev.subtasks, { id: crypto.randomUUID(), title, completed: false }],
    }));
    setNewSubtask('');
  };

  const handleRemoveSubtask = (id) => {
    setForm((prev) => ({ ...prev, subtasks: prev.subtasks.filter((st) => st.id !== id) }));
  };

  const handleAddTag = () => {
    const clean = newTag.trim().replace(/^#/, '').toLowerCase();
    if (!clean) return;
    setForm((prev) => ({ ...prev, tags: [...new Set([...prev.tags, clean])] }));
    setNewTag('');
  };

  const handleRemoveTag = (tagToRemove) => {
    setForm((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tagToRemove) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanTitle = form.title.trim();
    if (!cleanTitle) { setError('Please give your task a title.'); return; }
    onSave({ ...form, title: cleanTitle, description: form.description.trim() });
  };

  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleSubmit(e);
  };

  return (
    <form className="flex flex-col gap-4 p-1" onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
      {/* Title */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label htmlFor="task-title-input" className={labelCls}>
            Task title <span className="text-[var(--color-red)]">*</span>
          </label>
          <button type="button" onClick={handleNaturalParse}
            title="Parse dates like 'tomorrow', priorities like '!high', tags like '#frontend'"
            className="flex items-center gap-1 text-[10px] text-[var(--color-muted)] hover:text-[var(--color-coral)] transition-colors px-2 py-1 rounded-lg hover:bg-[var(--color-coral-subtle)]">
            <Sparkles size={11} />
            <span>Parse keywords</span>
          </button>
        </div>
        <input id="task-title-input" name="title" type="text" value={form.title}
          onChange={handleChange} placeholder="e.g., Deploy v2 release tomorrow !high #work"
          autoFocus className={inputCls} />
        {error && <p className="text-xs text-[var(--color-red)] mt-1" role="alert">{error}</p>}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="task-desc-input" className={labelCls}>
          Notes / Context <em className="font-normal text-[var(--color-muted)]">(optional)</em>
        </label>
        <textarea id="task-desc-input" name="description" value={form.description}
          onChange={handleChange} placeholder="Add details, links, or notes…" rows={2}
          className={`${inputCls} resize-none`} />
      </div>

      {/* Priority + Category */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="task-priority-select" className={labelCls}>Priority</label>
          <select id="task-priority-select" name="priority" value={form.priority} onChange={handleChange} className={selectCls}>
            {priorityOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="task-category-select" className={labelCls}>Category</label>
          <select id="task-category-select" name="category" value={form.category} onChange={handleChange} className={selectCls}>
            {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
      </div>

      {/* Due date + Status */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="task-duedate-input" className={labelCls}>Due date</label>
          <input id="task-duedate-input" type="date" name="dueDate" value={form.dueDate} onChange={handleChange} className={inputCls} />
        </div>
        <div>
          <label htmlFor="task-status-select" className={labelCls}>Status (Kanban)</label>
          <select id="task-status-select" name="status" value={form.status} onChange={handleChange} className={selectCls}>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>
      </div>

      {/* Subtasks */}
      <div>
        <label className={labelCls}>Subtasks</label>
        {form.subtasks.length > 0 && (
          <div className="flex flex-col gap-1 mb-2 p-2 rounded-lg bg-[var(--color-paper-subtle)] border border-[var(--color-line-subtle)]">
            {form.subtasks.map((st) => (
              <div key={st.id} className="flex items-center gap-2 text-xs text-[var(--color-ink)]">
                <span className="flex-1">{st.title}</span>
                <button type="button" onClick={() => handleRemoveSubtask(st.id)} aria-label="Remove subtask"
                  className="w-5 h-5 flex items-center justify-center rounded text-[var(--color-muted)] hover:text-[var(--color-red)] hover:bg-[var(--color-red-subtle)] transition-colors">
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <input type="text" value={newSubtask} onChange={(e) => setNewSubtask(e.target.value)}
            placeholder="Add a subtask step…"
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSubtask(); } }}
            className={`${inputCls} flex-1`} />
          <button type="button" onClick={handleAddSubtask}
            className="flex items-center gap-1 px-3 py-2 rounded-lg border border-[var(--color-line)] text-[var(--color-ink-secondary)] text-xs font-medium hover:bg-[var(--color-paper-deep)] transition-colors whitespace-nowrap">
            <Plus size={13} /> Add
          </button>
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className={labelCls}>Tags</label>
        {form.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {form.tags.map((tag) => (
              <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[var(--color-paper-deep)] text-[var(--color-ink-secondary)] text-[11px] border border-[var(--color-line)]">
                <Hash size={10} /> {tag}
                <button type="button" onClick={() => handleRemoveTag(tag)} aria-label={`Remove tag ${tag}`}
                  className="ml-0.5 text-[var(--color-muted)] hover:text-[var(--color-red)] transition-colors">
                  <X size={10} />
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <input type="text" value={newTag} onChange={(e) => setNewTag(e.target.value)}
            placeholder="Add tag (e.g. frontend, college)…"
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
            className={`${inputCls} flex-1`} />
          <button type="button" onClick={handleAddTag}
            className="flex items-center gap-1 px-3 py-2 rounded-lg border border-[var(--color-line)] text-[var(--color-ink-secondary)] text-xs font-medium hover:bg-[var(--color-paper-deep)] transition-colors whitespace-nowrap">
            <Plus size={13} /> Tag
          </button>
        </div>
      </div>

      {/* Form actions */}
      <div className="flex justify-end gap-2 pt-2 border-t border-[var(--color-line-subtle)]">
        <button type="button" onClick={onCancel}
          className="px-4 py-2 rounded-lg border border-[var(--color-line)] text-[var(--color-ink-secondary)] text-sm font-medium hover:bg-[var(--color-paper-deep)] transition-colors">
          Cancel
        </button>
        <button type="submit"
          className="px-5 py-2 rounded-lg bg-[var(--color-coral)] text-white text-sm font-semibold hover:bg-[var(--color-coral-hover)] transition-colors">
          {task?.id ? 'Save changes' : 'Add task'}
        </button>
      </div>
    </form>
  );
}
