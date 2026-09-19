import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, Check, Trash2, X } from 'lucide-react';
import TaskList from '../components/tasks/TaskList';
import QuickAddInput from '../components/tasks/QuickAddInput';
import { categories, filterTasks, priorityOptions, sortTasks } from '../utils/task';

export default function Tasks({ todos, onEdit, onAdd, query, onQueryChange, settings, onClearCompleted }) {
  const [filters, setFilters] = useState({
    status: 'all', // all | active | completed
    priority: 'all',
    category: 'all',
    sort: 'newest',
  });

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    updateFilter(name, value);
  };

  // Filter and sort tasks
  const visibleTasks = sortTasks(
    filterTasks(todos.tasks, { ...filters, query }),
    filters.sort
  );

  const totalCount = todos.tasks.length;
  const activeCount = todos.tasks.filter((t) => !t.completed).length;
  const completedCount = todos.tasks.filter((t) => t.completed).length;

  const hasActiveFilters =
    query.trim() !== '' ||
    filters.status !== 'all' ||
    filters.priority !== 'all' ||
    filters.category !== 'all';

  const resetFilters = () => {
    onQueryChange('');
    setFilters({
      status: 'all',
      priority: 'all',
      category: 'all',
      sort: 'newest',
    });
  };

  return (
    <motion.div
      className="page tasks-page"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="page-title">
        <p className="eyebrow">All tasks in one calm place</p>
        <div className="title-row">
          <h1>Tasks</h1>
          <span className="count-pill">{totalCount} total</span>
        </div>
      </div>

      {/* Quick Add Bar */}
      <div className="tasks-quick-add">
        <QuickAddInput
          onAdd={todos.addTask}
          onOpenDetailed={onAdd}
          defaults={settings}
          placeholder="Add a task… (press Enter to save)"
        />
      </div>

      {/* Search and Filters Toolbar */}
      <div className="tasks-controls-panel">
        <div className="search-bar-row">
          <div className="search-input-wrap">
            <Search size={16} className="search-icon" />
            <input
              type="search"
              className="tasks-search-input"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Search by title, note, or category…"
              aria-label="Filter tasks by search term"
            />
            {query && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => onQueryChange('')}
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Status Segmented Tabs */}
        <div className="filter-tabs-row">
          <div className="status-tabs" role="tablist" aria-label="Task status filters">
            <button
              type="button"
              role="tab"
              aria-selected={filters.status === 'all'}
              className={`status-tab ${filters.status === 'all' ? 'active' : ''}`}
              onClick={() => updateFilter('status', 'all')}
            >
              All <span>{totalCount}</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={filters.status === 'active'}
              className={`status-tab ${filters.status === 'active' ? 'active' : ''}`}
              onClick={() => updateFilter('status', 'active')}
            >
              Active <span>{activeCount}</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={filters.status === 'completed'}
              className={`status-tab ${filters.status === 'completed' ? 'active' : ''}`}
              onClick={() => updateFilter('status', 'completed')}
            >
              Completed <span>{completedCount}</span>
            </button>
          </div>

          {completedCount > 0 && filters.status === 'completed' && (
            <button
              type="button"
              className="text-button danger-text-button"
              onClick={onClearCompleted}
            >
              <Trash2 size={14} /> Clear completed
            </button>
          )}
        </div>

        {/* Dropdown Filters (Priority, Category, Sort) */}
        <div className="dropdown-filters-row">
          <label className="filter-select-label">
            <span>Priority</span>
            <select
              name="priority"
              value={filters.priority}
              onChange={handleSelectChange}
            >
              <option value="all">All Priorities</option>
              {priorityOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="filter-select-label">
            <span>Category</span>
            <select
              name="category"
              value={filters.category}
              onChange={handleSelectChange}
            >
              <option value="all">All Categories</option>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="filter-select-label">
            <span>Sort by</span>
            <select
              name="sort"
              value={filters.sort}
              onChange={handleSelectChange}
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="priority">Priority</option>
              <option value="due">Due date</option>
            </select>
          </label>

          {hasActiveFilters && (
            <button
              type="button"
              className="reset-filters-button"
              onClick={resetFilters}
            >
              Reset filters
            </button>
          )}
        </div>
      </div>

      {/* Task List */}
      <TaskList
        tasks={visibleTasks}
        onToggle={todos.toggleTask}
        onEdit={onEdit}
        onDelete={todos.deleteTask}
        emptyTitle={
          query
            ? `No tasks matching "${query}"`
            : hasActiveFilters
            ? 'No tasks match those filters'
            : 'No tasks yet'
        }
        emptySubtitle={
          hasActiveFilters
            ? 'Try adjusting your search or clearing active filters.'
            : 'Capture what is on your mind using the box above.'
        }
      />
    </motion.div>
  );
}
