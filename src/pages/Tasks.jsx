import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, X, Sparkles, Trash2 } from 'lucide-react';
import TaskList from '../components/tasks/TaskList';
import QuickAddInput from '../components/tasks/QuickAddInput';
import { categories, filterTasks, priorityOptions, sortTasks, getAllTags } from '../utils/task';

const inputCls = 'w-full px-3 py-2 rounded-lg border border-[var(--color-line)] bg-[var(--color-paper-card)] text-[var(--color-ink)] text-xs outline-none focus:border-[var(--color-coral)] transition-all';
const eyebrowCls = 'text-xs font-semibold tracking-wider text-[var(--color-muted)] uppercase';

export default function Tasks({ todos, onEdit, onAdd, query, onQueryChange, settings, onClearCompleted, onStartFocus }) {
  const [filters, setFilters] = useState({ status: 'all', priority: 'all', category: 'all', tag: 'all', project: 'all', sort: 'newest' });
  const availableTags = getAllTags(todos.tasks);
  const projects = todos.projects || [];

  const updateFilter = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }));
  const handleSelectChange = (e) => { const { name, value } = e.target; updateFilter(name, value); };
  const handleTagClick = (tag) => updateFilter('tag', tag);

  const visibleTasks = sortTasks(filterTasks(todos.tasks, { ...filters, query }, projects), filters.sort);
  const totalCount = todos.tasks.length;
  const activeCount = todos.tasks.filter((t) => !t.completed).length;
  const completedCount = todos.tasks.filter((t) => t.completed).length;

  const hasActiveFilters = query.trim() !== '' || filters.status !== 'all' || filters.priority !== 'all' || filters.category !== 'all' || filters.tag !== 'all' || filters.project !== 'all';

  const resetFilters = () => { onQueryChange(''); setFilters({ status: 'all', priority: 'all', category: 'all', tag: 'all', project: 'all', sort: 'newest' }); };

  const tabCls = (active) => `px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
    active ? 'bg-[var(--color-coral)] text-white' : 'text-[var(--color-ink-secondary)] hover:bg-[var(--color-paper-deep)]'
  }`;

  const selectCls = 'px-2.5 py-1.5 rounded-lg border border-[var(--color-line)] bg-[var(--color-paper-card)] text-[var(--color-ink)] text-xs outline-none focus:border-[var(--color-coral)] transition-all';

  return (
    <motion.div
      className="max-w-4xl xl:max-w-5xl 2xl:max-w-6xl mx-auto flex flex-col gap-6"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      {/* Title */}
      <div>
        <p className={eyebrowCls}>Everything in one calm place</p>
        <div className="flex items-center gap-3 mt-1">
          <h1 className="font-['Fraunces'] text-3xl font-semibold text-[var(--color-ink)]">Tasks</h1>
          <span className="ml-auto px-2.5 py-1 rounded-full text-[11px] bg-[var(--color-paper-deep)] text-[var(--color-ink-secondary)] font-medium">{totalCount} total</span>
        </div>
      </div>

      {/* Quick Add */}
      <QuickAddInput onAdd={todos.addTask} onOpenDetailed={onAdd} defaults={settings} placeholder="Add a task… try 'Finish design review tomorrow at 6pm high priority ~2h #design'" />

      {/* Controls panel */}
      <div className="flex flex-col gap-3 p-4 rounded-xl border border-[var(--color-line)] bg-[var(--color-paper-card)] shadow-[var(--shadow-sm)]">
        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
          <input
            type="search"
            className={`${inputCls} pl-8 pr-8`}
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search by title, or try 'priority:high', 'project:portfolio', 'due:today'…"
            aria-label="Filter tasks by search term"
          />
          {query && (
            <button type="button" onClick={() => onQueryChange('')} aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)] hover:text-[var(--color-ink)] transition-colors">
              <X size={13} />
            </button>
          )}
        </div>

        {/* Status tabs */}
        <div className="flex items-center gap-1" role="tablist" aria-label="Task status filters">
          {[['all', 'All', totalCount], ['active', 'Active', activeCount], ['completed', 'Completed', completedCount]].map(([val, label, count]) => (
            <button key={val} type="button" role="tab" aria-selected={filters.status === val}
              className={tabCls(filters.status === val)} onClick={() => updateFilter('status', val)}>
              {label} <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${filters.status === val ? 'bg-white/30' : 'bg-[var(--color-paper-deep)]'}`}>{count}</span>
            </button>
          ))}
          {completedCount > 0 && filters.status === 'completed' && (
            <button type="button" onClick={onClearCompleted}
              className="ml-auto flex items-center gap-1 text-xs text-[var(--color-red)] hover:underline font-medium">
              <Trash2 size={12} /> Clear completed
            </button>
          )}
        </div>

        {/* Dropdown filters */}
        <div className="flex flex-wrap gap-2 items-center">
          {/* Project filter */}
          {projects.length > 0 && (
            <label className="flex items-center gap-1">
              <select name="project" value={filters.project} onChange={handleSelectChange} className={selectCls}>
                <option value="all">All Projects</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </label>
          )}

          {[
            { name: 'priority', label: 'Priority', options: priorityOptions, allLabel: 'All Priorities' },
            { name: 'category', label: 'Category', options: categories, allLabel: 'All Categories' },
            ...(availableTags.length > 0 ? [{ name: 'tag', label: 'Tag', options: availableTags.map((t) => t), allLabel: 'All Tags', isTag: true }] : []),
          ].map(({ name, options, allLabel, isTag }) => (
            <label key={name} className="flex items-center gap-1">
              <select name={name} value={filters[name]} onChange={handleSelectChange} className={selectCls}>
                <option value="all">{allLabel}</option>
                {options.map((item) => <option key={item} value={item}>{isTag ? `#${item}` : item}</option>)}
              </select>
            </label>
          ))}
          <label className="flex items-center gap-1">
            <select name="sort" value={filters.sort} onChange={handleSelectChange} className={selectCls}>
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="priority">Priority</option>
              <option value="due">Due date</option>
              <option value="smart">★ Smart Order</option>
            </select>
          </label>
          {hasActiveFilters && (
            <button type="button" onClick={resetFilters}
              className="px-2.5 py-1.5 rounded-lg text-xs text-[var(--color-coral)] border border-[rgba(220,107,84,0.3)] hover:bg-[var(--color-coral-subtle)] transition-colors font-medium">
              Reset filters
            </button>
          )}
        </div>

        {filters.sort === 'smart' && (
          <p className="flex items-center gap-1.5 text-[11px] text-[var(--color-muted)] bg-[var(--color-paper-subtle)] px-3 py-2 rounded-lg">
            <Sparkles size={11} /> <strong>Smart order:</strong> Prioritizes overdue tasks, high priority items, and tasks due today.
          </p>
        )}
      </div>

      {/* Task list */}
      <TaskList
        tasks={visibleTasks}
        allTasks={todos.tasks}
        projects={projects}
        onToggle={todos.toggleTask} onEdit={onEdit} onDelete={todos.deleteTask} onToggleSubtask={todos.toggleSubtask} onAddSubtask={todos.addSubtask} onSetStatus={todos.setTaskStatus} onTagClick={handleTagClick} onStartFocus={onStartFocus}
        emptyTitle={query ? `No tasks matching "${query}"` : hasActiveFilters ? 'No tasks match those filters' : 'No tasks yet'}
        emptySubtitle={hasActiveFilters ? 'Try adjusting your search or clearing active filters.' : 'Capture what is on your mind using the box above.'}
      />
    </motion.div>
  );
}
