import { useState, useEffect } from 'react';
import {
  Plus,
  SlidersHorizontal,
  CornerDownLeft,
  Sparkles,
  Calendar,
  Clock,
  Tag,
  AlertCircle,
  Timer,
  Check,
  Edit2,
  X,
} from 'lucide-react';
import { toDateInput, parseTaskInput, formatDueDate } from '../../utils/task';

export default function QuickAddInput({
  onAdd,
  onOpenDetailed,
  defaults = {},
  defaultDueDate,
  placeholder = 'Add a task… try "Finish portfolio tomorrow at 6pm high priority ~2h #design"',
}) {
  const [rawText, setRawText] = useState('');
  const [isEditingParsed, setIsEditingParsed] = useState(false);

  // State for the parsed task fields that user can interactively edit before saving
  const [parsedTitle, setParsedTitle] = useState('');
  const [parsedDueDate, setParsedDueDate] = useState(toDateInput());
  const [parsedDueTime, setParsedDueTime] = useState('');
  const [parsedPriority, setParsedPriority] = useState('Medium');
  const [parsedEstimate, setParsedEstimate] = useState(0);
  const [parsedTags, setParsedTags] = useState([]);
  const [parsedProjectId, setParsedProjectId] = useState(null);

  // Update parsed state dynamically when raw text changes
  useEffect(() => {
    if (!rawText.trim()) {
      setIsEditingParsed(false);
      return;
    }

    const res = parseTaskInput(rawText);
    setParsedTitle(res.title);
    setParsedDueDate(
      res.dueDate !== toDateInput()
        ? res.dueDate
        : defaultDueDate !== undefined
        ? defaultDueDate
        : toDateInput()
    );
    setParsedDueTime(res.dueTime || '');
    setParsedPriority(res.priority || defaults.defaultPriority || 'Medium');
    setParsedEstimate(res.estimatedMinutes || 0);
    setParsedTags(res.tags || []);
    setParsedProjectId(res.projectId || null);
  }, [rawText, defaultDueDate, defaults.defaultPriority]);

  const hasDetectedMetadata =
    rawText.trim() &&
    (parsedDueTime !== '' ||
      parsedDueDate !== (defaultDueDate !== undefined ? defaultDueDate : toDateInput()) ||
      parsedPriority !== (defaults.defaultPriority || 'Medium') ||
      parsedEstimate > 0 ||
      parsedTags.length > 0 ||
      parsedProjectId !== null);

  const handleSave = (e) => {
    if (e) e.preventDefault();
    const finalTitle = parsedTitle.trim() || rawText.trim();
    if (!finalTitle) return;

    onAdd({
      title: finalTitle,
      description: '',
      priority: parsedPriority,
      category: defaults.defaultCategory || 'Personal',
      dueDate: parsedDueDate,
      dueTime: parsedDueTime,
      estimatedMinutes: parsedEstimate,
      projectId: parsedProjectId,
      tags: parsedTags,
      subtasks: [],
    });

    setRawText('');
    setIsEditingParsed(false);
  };

  const handleDetailedClick = () => {
    onOpenDetailed({
      title: parsedTitle || rawText.trim(),
      priority: parsedPriority,
      category: defaults.defaultCategory || 'Personal',
      dueDate: parsedDueDate,
      dueTime: parsedDueTime,
      estimatedMinutes: parsedEstimate,
      projectId: parsedProjectId,
      tags: parsedTags,
      subtasks: [],
    });
    setRawText('');
    setIsEditingParsed(false);
  };

  return (
    <div className="flex flex-col gap-2">
      <form onSubmit={handleSave}>
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-[var(--color-line)] bg-[var(--color-paper-card)] shadow-[var(--shadow-sm)] focus-within:border-[var(--color-coral)] focus-within:shadow-[0_0_0_3px_var(--color-coral-subtle)] transition-all">
          <Plus size={17} className="text-[var(--color-muted)] shrink-0" />
          <input
            type="text"
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder={placeholder}
            aria-label="Quickly add a task with natural language"
            className="flex-1 bg-transparent outline-none text-sm text-[var(--color-ink)] placeholder:text-[var(--color-muted)]"
          />

          {rawText.trim() && (
            <button
              type="submit"
              aria-label="Submit task"
              title="Press Enter to add"
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--color-coral)] text-white text-xs font-semibold hover:bg-[var(--color-coral-hover)] transition-colors shrink-0"
            >
              <CornerDownLeft size={13} />
              <span>Add</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleDetailedClick}
            aria-label="Add task with full details"
            title="Add with details (subtasks, tags, dependencies)"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[var(--color-line)] text-[var(--color-ink-secondary)] text-xs font-medium hover:bg-[var(--color-paper-deep)] transition-colors shrink-0"
          >
            <SlidersHorizontal size={13} />
            <span className="hidden sm:inline">Details</span>
          </button>
        </div>
      </form>

      {/* Interactive Natural Language Parsed Card */}
      {hasDetectedMetadata && (
        <div className="flex flex-col gap-2 p-3 rounded-xl border border-[var(--color-line)] bg-[var(--color-paper-card)] shadow-[var(--shadow-sm)] text-xs animate-fadeIn">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-[11px] font-semibold text-[var(--color-coral)]">
              <Sparkles size={12} /> Auto-detected task details:
            </span>
            <button
              type="button"
              onClick={() => setIsEditingParsed(!isEditingParsed)}
              className="flex items-center gap-1 text-[11px] text-[var(--color-muted)] hover:text-[var(--color-ink)] font-medium"
            >
              <Edit2 size={11} />
              <span>{isEditingParsed ? 'Done editing' : 'Edit before saving'}</span>
            </button>
          </div>

          {/* Quick interactive fields */}
          {isEditingParsed ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 pt-1">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-[var(--color-muted)] font-medium">Title</label>
                <input
                  type="text"
                  value={parsedTitle}
                  onChange={(e) => setParsedTitle(e.target.value)}
                  className="px-2 py-1 rounded-lg border border-[var(--color-line)] bg-[var(--color-paper-deep)] text-xs text-[var(--color-ink)] outline-none focus:border-[var(--color-coral)]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-[var(--color-muted)] font-medium">Due Date & Time</label>
                <div className="flex items-center gap-1">
                  <input
                    type="date"
                    value={parsedDueDate}
                    onChange={(e) => setParsedDueDate(e.target.value)}
                    className="flex-1 px-2 py-1 rounded-lg border border-[var(--color-line)] bg-[var(--color-paper-deep)] text-xs text-[var(--color-ink)] outline-none"
                  />
                  <input
                    type="time"
                    value={parsedDueTime}
                    onChange={(e) => setParsedDueTime(e.target.value)}
                    className="w-20 px-2 py-1 rounded-lg border border-[var(--color-line)] bg-[var(--color-paper-deep)] text-xs text-[var(--color-ink)] outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-[var(--color-muted)] font-medium">Priority</label>
                <select
                  value={parsedPriority}
                  onChange={(e) => setParsedPriority(e.target.value)}
                  className="px-2 py-1 rounded-lg border border-[var(--color-line)] bg-[var(--color-paper-deep)] text-xs text-[var(--color-ink)] outline-none"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-[var(--color-muted)] font-medium">Est. Duration</label>
                <select
                  value={parsedEstimate}
                  onChange={(e) => setParsedEstimate(Number(e.target.value))}
                  className="px-2 py-1 rounded-lg border border-[var(--color-line)] bg-[var(--color-paper-deep)] text-xs text-[var(--color-ink)] outline-none"
                >
                  <option value={0}>None</option>
                  <option value={15}>15 mins</option>
                  <option value={30}>30 mins</option>
                  <option value={45}>45 mins</option>
                  <option value={60}>1 hour</option>
                  <option value={120}>2 hours</option>
                </select>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-[var(--color-ink)] mr-1">
                "{parsedTitle}"
              </span>

              {parsedDueDate && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-[var(--color-butter-subtle)] text-[var(--color-butter)] font-medium">
                  <Calendar size={10} /> {formatDueDate(parsedDueDate)}
                </span>
              )}

              {parsedDueTime && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-[var(--color-paper-deep)] text-[var(--color-ink)] font-mono">
                  <Clock size={10} /> {parsedDueTime}
                </span>
              )}

              {parsedPriority && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-[var(--color-red-subtle)] text-[var(--color-red)] font-medium">
                  <AlertCircle size={10} /> {parsedPriority} Priority
                </span>
              )}

              {parsedEstimate > 0 && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-[var(--color-leaf-subtle)] text-[var(--color-leaf)] font-medium">
                  <Timer size={10} /> ~{parsedEstimate}m
                </span>
              )}

              {parsedTags.map((t) => (
                <span
                  key={t}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-[var(--color-paper-deep)] text-[var(--color-ink-secondary)]"
                >
                  <Tag size={10} /> #{t}
                </span>
              ))}

              <button
                type="button"
                onClick={handleSave}
                className="ml-auto flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--color-coral)] text-white text-[11px] font-semibold hover:bg-[var(--color-coral-hover)] transition-colors"
              >
                <Check size={12} />
                <span>Confirm & Save</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
