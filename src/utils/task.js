export const priorityOptions = ['Low', 'Medium', 'High'];
export const categories = ['Personal', 'Work', 'Study', 'Health', 'Other'];

export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return { title: 'Good morning', icon: '☀️' };
  if (hour < 18) return { title: 'Good afternoon', icon: '🌤️' };
  return { title: 'Good evening', icon: '🌙' };
}

export function getTodayString() {
  return new Date().toISOString().slice(0, 10);
}

export function toDateInput(value) {
  return value || getTodayString();
}

export function isToday(date) {
  return Boolean(date && date === getTodayString());
}

export function isTomorrow(date) {
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  return Boolean(date && date === tomorrow);
}

export function isOverdue(task) {
  if (!task || task.completed || !task.dueDate) return false;
  return task.dueDate < getTodayString();
}

export function formatDueDate(dateString) {
  if (!dateString) return 'No due date';
  const today = getTodayString();
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  if (dateString === today) return 'Today';
  if (dateString === tomorrow) return 'Tomorrow';
  if (dateString === yesterday) return 'Yesterday';

  try {
    const [year, month, day] = dateString.split('-').map(Number);
    if (!year || !month || !day) return dateString;
    const dateObj = new Date(year, month - 1, day);
    return dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return dateString;
  }
}

export function getTodayStats(tasks = []) {
  const todayStr = getTodayString();
  const todayTasks = tasks.filter((t) => t.dueDate === todayStr);
  const total = todayTasks.length;
  const completed = todayTasks.filter((t) => t.completed).length;
  const remaining = total - completed;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return { total, completed, remaining, percent, tasks: todayTasks };
}

export function getPriorityTodayTasks(tasks = []) {
  const todayStr = getTodayString();
  // High priority due today or overdue
  return tasks.filter((t) => {
    if (t.completed) return false;
    const isTodayTask = t.dueDate === todayStr;
    const overdue = isOverdue(t);
    return (isTodayTask && (t.priority === 'High' || t.priority === 'Medium')) || overdue;
  });
}

export function getUpcomingBuckets(tasks = []) {
  const todayStr = getTodayString();
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const weekEndStr = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);

  const active = tasks.filter((t) => !t.completed);
  const overdue = active.filter((t) => t.dueDate && t.dueDate < todayStr);
  const tomorrow = active.filter((t) => t.dueDate === tomorrowStr);
  const thisWeek = active.filter((t) => t.dueDate && t.dueDate > tomorrowStr && t.dueDate <= weekEndStr);
  const later = active.filter((t) => t.dueDate && t.dueDate > weekEndStr);
  const noDueDate = active.filter((t) => !t.dueDate);

  return { overdue, tomorrow, thisWeek, later, noDueDate };
}

export function filterTasks(tasks = [], { query = '', status = 'all', priority = 'all', category = 'all' }) {
  const term = query.trim().toLowerCase();

  return tasks.filter((task) => {
    // Search query matches title, description, or category
    if (term) {
      const matchTitle = task.title?.toLowerCase().includes(term);
      const matchDesc = task.description?.toLowerCase().includes(term);
      const matchCategory = task.category?.toLowerCase().includes(term);
      if (!matchTitle && !matchDesc && !matchCategory) return false;
    }

    // Status filter
    if (status === 'active' && task.completed) return false;
    if (status === 'completed' && !task.completed) return false;

    // Priority filter (case insensitive comparison)
    if (priority !== 'all' && task.priority?.toLowerCase() !== priority.toLowerCase()) {
      return false;
    }

    // Category filter
    if (category !== 'all' && task.category?.toLowerCase() !== category.toLowerCase()) {
      return false;
    }

    return true;
  });
}

export function sortTasks(tasks = [], sortType = 'newest') {
  const copy = [...tasks];
  const priorityWeight = { High: 3, high: 3, Medium: 2, medium: 2, Low: 1, low: 1 };

  switch (sortType) {
    case 'oldest':
      return copy.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
    case 'priority':
      return copy.sort((a, b) => (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0));
    case 'due':
      return copy.sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      });
    case 'newest':
    default:
      return copy.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }
}
