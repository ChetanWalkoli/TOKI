import { useState, useRef } from 'react';
import {
  Plus,
  X,
  Hash,
  Sparkles,
  Clock,
  Timer,
  FolderGit2,
  GitFork,
  Paperclip,
  FileText,
  Trash2,
} from 'lucide-react';
import { categories, priorityOptions, toDateInput, parseTaskInput } from '../../utils/task';
import TaskComments from './TaskComments';
import { uploadTaskAttachment } from '../../services/attachments';

const inputCls = 'w-full px-3 py-2 rounded-lg border border-[var(--color-line)] bg-[var(--color-paper-card)] text-[var(--color-ink)] text-xs outline-none focus:border-[var(--color-coral)] focus:shadow-[0_0_0_3px_var(--color-coral-subtle)] transition-all placeholder:text-[var(--color-muted)]';
const selectCls = inputCls;
const labelCls = 'block text-xs font-semibold text-[var(--color-ink-secondary)] mb-1.5';

export default function TaskForm({
  task,
  defaults = {},
  projects = [],
  allTasks = [],
  currentUser = null,
  onSave,
  onCancel,
  onOpenAIAssistant,
}) {
  const [form, setForm] = useState(() => ({
    title: task?.title || '',
    description: task?.description || '',
    priority: task?.priority || defaults.defaultPriority || 'Medium',
    category: task?.category || defaults.defaultCategory || 'Personal',
    dueDate: task?.dueDate !== undefined ? task?.dueDate : toDateInput(),
    dueTime: task?.dueTime || '',
    estimatedMinutes: task?.estimatedMinutes || 0,
    projectId: task?.projectId || null,
    dependsOn: Array.isArray(task?.dependsOn) ? [...task.dependsOn] : [],
    attachments: Array.isArray(task?.attachments) ? [...task.attachments] : [],
    comments: Array.isArray(task?.comments) ? [...task.comments] : [],
    status: task?.status || (task?.completed ? 'done' : 'todo'),
    subtasks: Array.isArray(task?.subtasks) ? [...task.subtasks] : [],
    tags: Array.isArray(task?.tags) ? [...task.tags] : [],
  }));

  const [newSubtask, setNewSubtask] = useState('');
  const [newTag, setNewTag] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [error, setError] = useState('');

  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'estimatedMinutes' ? Number(value) : value,
    }));
    if (name === 'title' && value.trim()) setError('');
  };

  const handleNaturalParse = () => {
    if (!form.title.trim()) return;
    const parsed = parseTaskInput(form.title);
    setForm((prev) => ({
      ...prev,
      title: parsed.title,
      dueDate: parsed.dueDate,
      dueTime: parsed.dueTime || prev.dueTime,
      priority: parsed.priority,
      estimatedMinutes: parsed.estimatedMinutes || prev.estimatedMinutes,
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

  // Task Dependencies
  const toggleDependency = (depTaskId) => {
    setForm((prev) => {
      const exists = prev.dependsOn.includes(depTaskId);
      const next = exists
        ? prev.dependsOn.filter((id) => id !== depTaskId)
        : [...prev.dependsOn, depTaskId];
      return { ...prev, dependsOn: next };
    });
  };

  // Attachment upload handler
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    setUploadError('');

    try {
      const uploadedItems = [];
      for (const file of files) {
        const item = await uploadTaskAttachment(file, task?.id || 'temp', currentUser?.id);
        uploadedItems.push(item);
      }
      setForm((prev) => ({
        ...prev,
        attachments: [...prev.attachments, ...uploadedItems],
      }));
    } catch (err) {
      setUploadError(err.message || 'File upload failed.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveAttachment = (attId) => {
    setForm((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((a) => a.id !== attId),
    }));
  };

  // Comments handler
  const handleAddComment = (comment) => {
    setForm((prev) => ({
      ...prev,
      comments: [...prev.comments, comment],
    }));
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

  // Candidates for dependencies (exclude current task)
  const candidateDependencies = allTasks.filter((t) => !task || t.id !== task.id);

  return (
    <form className="flex flex-col gap-4 max-h-[80vh] overflow-y-auto pr-1" onSubmit={handleSubmit}>
      {/* Title + NLP Parser & AI Trigger */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label htmlFor="task-title-input" className={labelCls}>
            Task title <span className="text-[var(--color-red)]">*</span>
          </label>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleNaturalParse}
              title="Parse dates, times (6pm), priorities (!high)"
              className="flex items-center gap-1 text-[11px] text-[var(--color-muted)] hover:text-[var(--color-coral)] transition-colors px-2 py-0.5 rounded-lg hover:bg-[var(--color-coral-subtle)]"
            >
              <Sparkles size={11} />
              <span>Parse text</span>
            </button>
            {onOpenAIAssistant && (
              <button
                type="button"
                onClick={() => onOpenAIAssistant(form)}
                className="flex items-center gap-1 text-[11px] font-semibold text-[var(--color-coral)] hover:underline px-2 py-0.5 rounded-lg bg-[var(--color-coral-subtle)]"
              >
                <span>AI Assistant</span>
              </button>
            )}
          </div>
        </div>
        <input
          id="task-title-input"
          name="title"
          type="text"
          value={form.title}
          onChange={handleChange}
          placeholder="e.g. Finish portfolio tomorrow at 6pm high priority ~2h"
          autoFocus
          className={inputCls}
        />
        {error && <p className="text-xs text-[var(--color-red)] mt-1" role="alert">{error}</p>}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="task-desc-input" className={labelCls}>
          Notes / Context <em className="font-normal text-[var(--color-muted)]">(optional)</em>
        </label>
        <textarea
          id="task-desc-input"
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Add details, specifications, or links…"
          rows={2}
          className={`${inputCls} resize-y leading-relaxed`}
        />
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

      {/* Due date + Due time */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="task-duedate-input" className={labelCls}>Due date</label>
          <input id="task-duedate-input" type="date" name="dueDate" value={form.dueDate} onChange={handleChange} className={inputCls} />
        </div>
        <div>
          <label htmlFor="task-duetime-input" className={labelCls}>Time (optional)</label>
          <div className="flex items-center gap-1.5">
            <Clock size={14} className="text-[var(--color-muted)] shrink-0" />
            <input
              id="task-duetime-input"
              type="time"
              name="dueTime"
              value={form.dueTime}
              onChange={handleChange}
              className={inputCls}
            />
          </div>
        </div>
      </div>

      {/* Project + Estimated Duration */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="task-project-select" className={labelCls}>Project</label>
          <div className="flex items-center gap-1.5">
            <FolderGit2 size={14} className="text-[var(--color-muted)] shrink-0" />
            <select
              id="task-project-select"
              name="projectId"
              value={form.projectId || ''}
              onChange={(e) => setForm({ ...form, projectId: e.target.value || null })}
              className={selectCls}
            >
              <option value="">No Project (Personal backlog)</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="task-estimate-select" className={labelCls}>Estimated Duration</label>
          <div className="flex items-center gap-1.5">
            <Timer size={14} className="text-[var(--color-muted)] shrink-0" />
            <select
              id="task-estimate-select"
              name="estimatedMinutes"
              value={form.estimatedMinutes}
              onChange={handleChange}
              className={selectCls}
            >
              <option value={0}>No estimate</option>
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>1 hour</option>
              <option value={90}>1.5 hours</option>
              <option value={120}>2 hours</option>
            </select>
          </div>
        </div>
      </div>

      {/* Dependencies (Task B depends on Task A) */}
      {candidateDependencies.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>Prerequisite Tasks (Dependencies)</label>
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 rounded-xl bg-[var(--color-paper-subtle)] border border-[var(--color-line-subtle)]">
            {candidateDependencies.slice(0, 10).map((dep) => {
              const isSelected = form.dependsOn.includes(dep.id);
              return (
                <button
                  key={dep.id}
                  type="button"
                  onClick={() => toggleDependency(dep.id)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] transition-all border ${
                    isSelected
                      ? 'bg-[var(--color-coral-subtle)] border-[var(--color-coral)] text-[var(--color-coral)] font-semibold'
                      : 'bg-[var(--color-paper-card)] border-[var(--color-line)] text-[var(--color-ink-secondary)] hover:bg-[var(--color-paper-deep)]'
                  }`}
                >
                  <GitFork size={10} />
                  <span className="truncate max-w-[180px]">{dep.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Attachments */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className={labelCls}>Attachments ({form.attachments.length})</label>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-1 text-[11px] font-semibold text-[var(--color-coral)] hover:underline"
          >
            <Paperclip size={12} />
            <span>{uploading ? 'Uploading…' : 'Attach file'}</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileUpload}
            className="hidden"
            accept="image/*,application/pdf,text/*,.doc,.docx,.zip"
          />
        </div>

        {uploadError && <p className="text-[11px] text-[var(--color-red)]">{uploadError}</p>}

        {form.attachments.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {form.attachments.map((att) => (
              <div
                key={att.id}
                className="flex items-center justify-between p-2 rounded-lg bg-[var(--color-paper-deep)] border border-[var(--color-line-subtle)] text-xs"
              >
                <div className="flex items-center gap-2 truncate mr-1">
                  <FileText size={14} className="text-[var(--color-muted)] shrink-0" />
                  <span className="truncate text-[var(--color-ink)]">{att.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveAttachment(att.id)}
                  className="text-[var(--color-muted)] hover:text-[var(--color-red)] p-0.5"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Subtasks */}
      <div>
        <label className={labelCls}>Subtasks ({form.subtasks.length})</label>
        {form.subtasks.length > 0 && (
          <div className="flex flex-col gap-1 mb-2 p-2 rounded-lg bg-[var(--color-paper-subtle)] border border-[var(--color-line-subtle)]">
            {form.subtasks.map((st) => (
              <div key={st.id} className="flex items-center gap-2 text-xs text-[var(--color-ink)]">
                <span className="flex-1">{st.title}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSubtask(st.id)}
                  aria-label="Remove subtask"
                  className="w-5 h-5 flex items-center justify-center rounded text-[var(--color-muted)] hover:text-[var(--color-red)] hover:bg-[var(--color-red-subtle)] transition-colors"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <input
            type="text"
            value={newSubtask}
            onChange={(e) => setNewSubtask(e.target.value)}
            placeholder="Add a subtask step…"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddSubtask();
              }
            }}
            className={`${inputCls} flex-1`}
          />
          <button
            type="button"
            onClick={handleAddSubtask}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[var(--color-line)] text-[var(--color-ink-secondary)] text-xs font-medium hover:bg-[var(--color-paper-deep)] transition-colors whitespace-nowrap"
          >
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
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--color-paper-deep)] text-[var(--color-ink-secondary)] text-[11px] border border-[var(--color-line)]"
              >
                <Hash size={10} /> {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  aria-label={`Remove tag ${tag}`}
                  className="ml-0.5 text-[var(--color-muted)] hover:text-[var(--color-red)] transition-colors"
                >
                  <X size={10} />
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Add tag (e.g. frontend, sprint)…"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddTag();
              }
            }}
            className={`${inputCls} flex-1`}
          />
          <button
            type="button"
            onClick={handleAddTag}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[var(--color-line)] text-[var(--color-ink-secondary)] text-xs font-medium hover:bg-[var(--color-paper-deep)] transition-colors whitespace-nowrap"
          >
            <Plus size={13} /> Tag
          </button>
        </div>
      </div>

      {/* Discussion / Comments (when editing existing task) */}
      {task?.id && (
        <TaskComments
          comments={form.comments}
          onAddComment={handleAddComment}
          currentUser={currentUser}
        />
      )}

      {/* Form actions */}
      <div className="flex justify-end gap-2 pt-3 border-t border-[var(--color-line-subtle)] mt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-xl border border-[var(--color-line)] text-[var(--color-ink-secondary)] text-xs font-medium hover:bg-[var(--color-paper-deep)] transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-5 py-2 rounded-xl bg-[var(--color-coral)] text-white text-xs font-semibold hover:bg-[var(--color-coral-hover)] transition-colors shadow-sm"
        >
          {task?.id ? 'Save changes' : 'Add task'}
        </button>
      </div>
    </form>
  );
}
