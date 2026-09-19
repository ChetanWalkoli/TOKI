export const priorityOptions = ['low', 'medium', 'high'];
export const categories = ['Personal', 'Work', 'Study', 'Health', 'Other'];

export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return { title: 'Good morning', icon: '☀️' };
  if (hour < 18) return { title: 'Good afternoon', icon: '🌤️' };
  return { title: 'Good evening', icon: '🌙' };
}

export function toDateInput(value) {
  return value || new Date().toISOString().slice(0, 10);
}

export function isToday(date) { return date === new Date().toISOString().slice(0, 10); }

export function isOverdue(task) { return !task.completed && task.dueDate && task.dueDate < new Date().toISOString().slice(0, 10); }

export function filterTasks(tasks, { query = '', status = 'all', priority = 'all', category = 'all' }) {
  const term = query.trim().toLowerCase();
  return tasks.filter((task) => (!term || [task.title, task.description, task.category].some((value) => value?.toLowerCase().includes(term)))
    && (status === 'all' || status === 'active' ? status === 'all' || !task.completed : task.completed)
    && (priority === 'all' || task.priority === priority)
    && (category === 'all' || task.category === category));
}

export function sortTasks(tasks, sort) {
  const copy = [...tasks];
  const weight = { high: 3, medium: 2, low: 1 };
  if (sort === 'oldest') return copy.sort((a, b) => a.createdAt - b.createdAt);
  if (sort === 'priority') return copy.sort((a, b) => weight[b.priority] - weight[a.priority]);
  if (sort === 'due') return copy.sort((a, b) => (a.dueDate || '9999').localeCompare(b.dueDate || '9999'));
  return copy.sort((a, b) => b.createdAt - a.createdAt);
}
