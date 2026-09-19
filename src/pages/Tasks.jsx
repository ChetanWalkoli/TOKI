import { motion } from 'framer-motion';
import { useState } from 'react';
import TaskList from '../components/tasks/TaskList';
import { categories, filterTasks, priorityOptions, sortTasks } from '../utils/task';

export default function Tasks({ todos, onEdit, query, onQueryChange }) {
  const [filters, setFilters] = useState({ status: 'all', priority: 'all', category: 'all', sort: 'newest' });
  const update = (event) => setFilters((value) => ({ ...value, [event.target.name]: event.target.value }));
  const visible = sortTasks(filterTasks(todos.tasks, { ...filters, query }), filters.sort);
  return <motion.div className="page tasks-page" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}><div className="page-title"><p className="eyebrow">Everything in one gentle place</p><h1>My tasks</h1></div><label className="task-search"><span>Search your list</span><input value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Title, note, or category" /></label><div className="task-toolbar"><label>Status<select name="status" value={filters.status} onChange={update}><option value="all">All</option><option value="active">Active</option><option value="completed">Completed</option></select></label><label>Priority<select name="priority" value={filters.priority} onChange={update}><option value="all">Any</option>{priorityOptions.map((item) => <option key={item}>{item}</option>)}</select></label><label>Category<select name="category" value={filters.category} onChange={update}><option value="all">Any</option>{categories.map((item) => <option key={item}>{item}</option>)}</select></label><label>Sort<select name="sort" value={filters.sort} onChange={update}><option value="newest">Newest</option><option value="oldest">Oldest</option><option value="priority">Priority</option><option value="due">Due date</option></select></label></div><TaskList tasks={visible} onToggle={todos.toggleTask} onEdit={onEdit} onDelete={todos.deleteTask} emptyMessage={query ? 'Nothing matched that search.' : 'No tasks match those filters.'} /></motion.div>;
}
