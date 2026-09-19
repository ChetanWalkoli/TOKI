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

export function getAllTags(tasks = []) {
  const tagSet = new Set();
  tasks.forEach((task) => {
    if (Array.isArray(task.tags)) {
      task.tags.forEach((t) => tagSet.add(t.toLowerCase()));
    }
  });
  return Array.from(tagSet).sort();
}

/**
 * Natural language task parser
 * Extracts due date, priority, tags from string like:
 * "Finish React project tomorrow !high #frontend"
 */
export function parseTaskInput(text) {
  if (!text || typeof text !== 'string') {
    return { title: '', dueDate: getTodayString(), priority: 'Medium', tags: [] };
  }

  let working = text.trim();
  let dueDate = getTodayString();
  let priority = 'Medium';
  const tags = [];

  // Extract tags: #tagname
  const tagMatches = working.match(/#[a-zA-Z0-9_\-]+/g);
  if (tagMatches) {
    tagMatches.forEach((tag) => {
      tags.push(tag.replace('#', '').toLowerCase());
      working = working.replace(tag, '');
    });
  }

  // Extract priority markers: !high, !urgent, !med, !medium, !low
  const prioRegex = /!(high|urgent|med|medium|low)\b/i;
  const prioMatch = working.match(prioRegex);
  if (prioMatch) {
    const rawPrio = prioMatch[1].toLowerCase();
    if (rawPrio === 'high' || rawPrio === 'urgent') priority = 'High';
    else if (rawPrio === 'low') priority = 'Low';
    else priority = 'Medium';
    working = working.replace(prioMatch[0], '');
  }

  // Extract dates: today, tomorrow, yesterday, next week, in X days
  const now = new Date();
  if (/\b(today)\b/i.test(working)) {
    dueDate = getTodayString();
    working = working.replace(/\b(today)\b/i, '');
  } else if (/\b(tomorrow)\b/i.test(working)) {
    const d = new Date(now.getTime() + 86400000);
    dueDate = d.toISOString().slice(0, 10);
    working = working.replace(/\b(tomorrow)\b/i, '');
  } else if (/\b(yesterday)\b/i.test(working)) {
    const d = new Date(now.getTime() - 86400000);
    dueDate = d.toISOString().slice(0, 10);
    working = working.replace(/\b(yesterday)\b/i, '');
  } else if (/\bnext week\b/i.test(working)) {
    const d = new Date(now.getTime() + 7 * 86400000);
    dueDate = d.toISOString().slice(0, 10);
    working = working.replace(/\bnext week\b/i, '');
  } else {
    const inDaysMatch = working.match(/\bin (\d+) days?\b/i);
    if (inDaysMatch) {
      const days = parseInt(inDaysMatch[1], 10);
      const d = new Date(now.getTime() + days * 86400000);
      dueDate = d.toISOString().slice(0, 10);
      working = working.replace(inDaysMatch[0], '');
    }
  }

  // Clean title
  const cleanTitle = working.replace(/\s+/g, ' ').trim();

  return {
    title: cleanTitle || text.trim(),
    dueDate,
    priority,
    tags: [...new Set(tags)],
  };
}

/**
 * Real task completion streak calculation
 * Counts consecutive days counting backwards from today (or yesterday if no task done today yet)
 */
export function calculateStreak(tasks = []) {
  const completedTasks = tasks.filter((t) => t.completed && t.completedAt);
  if (completedTasks.length === 0) return 0;

  // Extract unique completion dates (YYYY-MM-DD)
  const completionDates = new Set();
  completedTasks.forEach((t) => {
    try {
      const dateStr = new Date(t.completedAt).toISOString().slice(0, 10);
      completionDates.add(dateStr);
    } catch {
      // ignore invalid date
    }
  });

  const todayStr = getTodayString();
  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  // Check if today or yesterday has a completion
  let currentDate = completionDates.has(todayStr) ? new Date() : null;
  if (!currentDate && completionDates.has(yesterdayStr)) {
    currentDate = new Date(Date.now() - 86400000);
  }

  if (!currentDate) return 0;

  let streak = 0;
  let checkTime = currentDate.getTime();

  while (true) {
    const dateStr = new Date(checkTime).toISOString().slice(0, 10);
    if (completionDates.has(dateStr)) {
      streak += 1;
      checkTime -= 86400000; // previous day
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Smart sorting priority:
 * 1. Overdue tasks
 * 2. High priority tasks
 * 3. Due today
 * 4. Due soon (next 3 days)
 * 5. Low priority
 * 6. No deadline
 */
export function smartSortTasks(tasks = []) {
  const todayStr = getTodayString();
  const soonStr = new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10);

  return [...tasks].sort((a, b) => {
    // Completed tasks always at the bottom
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }

    const aOverdue = isOverdue(a);
    const bOverdue = isOverdue(b);
    if (aOverdue !== bOverdue) return aOverdue ? -1 : 1;

    const prioWeight = { High: 3, Medium: 2, Low: 1 };
    const aPrio = prioWeight[a.priority] || 2;
    const bPrio = prioWeight[b.priority] || 2;

    const aIsToday = a.dueDate === todayStr;
    const bIsToday = b.dueDate === todayStr;
    if (aIsToday !== bIsToday) return aIsToday ? -1 : 1;

    if (aPrio !== bPrio) return bPrio - aPrio;

    const aIsSoon = a.dueDate && a.dueDate > todayStr && a.dueDate <= soonStr;
    const bIsSoon = b.dueDate && b.dueDate > todayStr && b.dueDate <= soonStr;
    if (aIsSoon !== bIsSoon) return aIsSoon ? -1 : 1;

    // Due date comparison
    if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
    if (a.dueDate && !b.dueDate) return -1;
    if (!a.dueDate && b.dueDate) return 1;

    return (b.createdAt || 0) - (a.createdAt || 0);
  });
}

export function filterTasks(
  tasks = [],
  { query = '', status = 'all', priority = 'all', category = 'all', tag = 'all' }
) {
  const term = query.trim().toLowerCase();

  return tasks.filter((task) => {
    // Search query matches title, description, category, or tags
    if (term) {
      const matchTitle = task.title?.toLowerCase().includes(term);
      const matchDesc = task.description?.toLowerCase().includes(term);
      const matchCategory = task.category?.toLowerCase().includes(term);
      const matchTags = Array.isArray(task.tags) && task.tags.some((t) => t.toLowerCase().includes(term));
      const matchSubtasks = Array.isArray(task.subtasks) && task.subtasks.some((st) => st.title.toLowerCase().includes(term));
      if (!matchTitle && !matchDesc && !matchCategory && !matchTags && !matchSubtasks) return false;
    }

    // Status filter
    if (status === 'active' && task.completed) return false;
    if (status === 'completed' && !task.completed) return false;

    // Priority filter
    if (priority !== 'all' && task.priority?.toLowerCase() !== priority.toLowerCase()) {
      return false;
    }

    // Category filter
    if (category !== 'all' && task.category?.toLowerCase() !== category.toLowerCase()) {
      return false;
    }

    // Tag filter
    if (tag !== 'all') {
      if (!Array.isArray(task.tags) || !task.tags.includes(tag.toLowerCase())) {
        return false;
      }
    }

    return true;
  });
}

export function sortTasks(tasks = [], sortType = 'newest') {
  if (sortType === 'smart') {
    return smartSortTasks(tasks);
  }

  const copy = [...tasks];
  const priorityWeight = { High: 3, Medium: 2, Low: 1 };

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
