import { useState } from 'react';
import { Plus, SlidersHorizontal, CornerDownLeft, Sparkles, Calendar, Tag, AlertCircle } from 'lucide-react';
import { toDateInput, parseTaskInput, formatDueDate } from '../../utils/task';

export default function QuickAddInput({
  onAdd,
  onOpenDetailed,
  defaults = {},
  defaultDueDate,
  placeholder = 'Add a task… try "Write report tomorrow !high #work"',
}) {
  const [title, setTitle] = useState('');

  const parsed = parseTaskInput(title);
  const hasParsedData =
    title.trim() &&
    (parsed.dueDate !== (defaultDueDate !== undefined ? defaultDueDate : toDateInput()) ||
      parsed.priority !== (defaults.defaultPriority || 'Medium') ||
      parsed.tags.length > 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanRaw = title.trim();
    if (!cleanRaw) return;
    const parsedData = parseTaskInput(cleanRaw);
    onAdd({
      title: parsedData.title || cleanRaw,
      description: '',
      priority: parsedData.priority || defaults.defaultPriority || 'Medium',
      category: defaults.defaultCategory || 'Personal',
      dueDate:
        parsedData.dueDate !== toDateInput()
          ? parsedData.dueDate
          : defaultDueDate !== undefined
          ? defaultDueDate
          : toDateInput(),
      tags: parsedData.tags,
      subtasks: [],
    });
    setTitle('');
  };

  const handleDetailedClick = () => {
    const parsedData = parseTaskInput(title);
    onOpenDetailed({
      title: parsedData.title || title.trim(),
      priority: parsedData.priority || defaults.defaultPriority || 'Medium',
      category: defaults.defaultCategory || 'Personal',
      dueDate:
        parsedData.dueDate !== toDateInput()
          ? parsedData.dueDate
          : defaultDueDate !== undefined
          ? defaultDueDate
          : toDateInput(),
      tags: parsedData.tags,
      subtasks: [],
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <form onSubmit={handleSubmit}>
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-[var(--color-line)] bg-[var(--color-paper-card)] shadow-[var(--shadow-sm)] focus-within:border-[var(--color-coral)] focus-within:shadow-[0_0_0_3px_var(--color-coral-subtle)] transition-all">
          <Plus size={17} className="text-[var(--color-muted)] shrink-0" />
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={placeholder}
            aria-label="Quickly add a task with natural language"
            className="flex-1 bg-transparent outline-none text-sm text-[var(--color-ink)] placeholder:text-[var(--color-muted)]"
          />

          {title.trim() && (
            <button type="submit" aria-label="Submit task" title="Press Enter to add"
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--color-coral)] text-white text-xs font-semibold hover:bg-[var(--color-coral-hover)] transition-colors shrink-0">
              <CornerDownLeft size={13} />
              <span>Add</span>
            </button>
          )}

          <button type="button" onClick={handleDetailedClick} aria-label="Add task with full details"
            title="Add with details (subtasks, tags, context)"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[var(--color-line)] text-[var(--color-ink-secondary)] text-xs font-medium hover:bg-[var(--color-paper-deep)] transition-colors shrink-0">
            <SlidersHorizontal size={13} />
            <span className="hidden sm:inline">Details</span>
          </button>
        </div>
      </form>

      {/* Live NLP preview */}
      {hasParsedData && (
        <div className="flex items-center gap-1.5 flex-wrap px-1">
          <span className="flex items-center gap-1 text-[11px] text-[var(--color-muted)]">
            <Sparkles size={11} /> Auto-detected:
          </span>
          {parsed.dueDate && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-[var(--color-butter-subtle)] text-[var(--color-butter)] font-medium">
              <Calendar size={10} /> {formatDueDate(parsed.dueDate)}
            </span>
          )}
          {parsed.priority && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-[var(--color-red-subtle)] text-[var(--color-red)] font-medium">
              <AlertCircle size={10} /> {parsed.priority}
            </span>
          )}
          {parsed.tags.map((t) => (
            <span key={t} className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-[var(--color-paper-deep)] text-[var(--color-ink-secondary)]">
              <Tag size={10} /> #{t}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
