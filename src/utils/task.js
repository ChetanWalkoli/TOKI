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
/**
 * Natural language task parser
 * Extracts title, due date, time, priority, estimated duration, project, and tags from strings like:
 * "Finish portfolio tomorrow at 6pm high priority ~2h #design p:portfolio"
 */
export function parseTaskInput(text) {
  if (!text || typeof text !== 'string') {
    return {
      title: '',
      dueDate: getTodayString(),
      dueTime: '',
      priority: 'Medium',
      estimatedMinutes: 0,
      projectId: null,
      tags: [],
    };
  }

  let working = text.trim();
  let dueDate = getTodayString();
  let dueTime = '';
  let priority = 'Medium';
  let estimatedMinutes = 0;
  let projectId = null;
  const tags = [];

  // 1. Extract tags: #tagname
  const tagMatches = working.match(/#[a-zA-Z0-9_\-]+/g);
  if (tagMatches) {
    tagMatches.forEach((tag) => {
      tags.push(tag.replace('#', '').toLowerCase());
      working = working.replace(tag, '');
    });
  }

  // 2. Extract project: p:project-name or project:project-name
  const projMatch = working.match(/\b(?:p|project):([a-zA-Z0-9_\-]+)\b/i);
  if (projMatch) {
    projectId = projMatch[1].toLowerCase();
    working = working.replace(projMatch[0], '');
  }

  // 3. Extract estimated duration: ~30m, ~1h, ~2h, ~45m, for 30m, for 1 hour, for 45 mins, 30m, 1h
  const estMatch = working.match(/(?:~|for\s+|estimate\s+)?(\d+(?:\.\d+)?)\s*(m|min|mins|minutes|h|hr|hrs|hours)\b/i);
  if (estMatch) {
    const num = parseFloat(estMatch[1]);
    const unit = estMatch[2].toLowerCase();
    if (unit.startsWith('h')) {
      estimatedMinutes = Math.round(num * 60);
    } else {
      estimatedMinutes = Math.round(num);
    }
    working = working.replace(estMatch[0], '');
  }

  // 4. Extract time: "at 6pm", "at 6:30pm", "at 18:00", "at 9am", "at noon", "at midnight", "6pm", "18:00"
  const timeRegex = /\b(?:at\s+)?(1[0-2]|0?[1-9])(?::([0-5][0-9]))?\s*(am|pm)\b/i;
  const timeMatch = working.match(timeRegex);
  if (timeMatch) {
    let hour = parseInt(timeMatch[1], 10);
    const minute = timeMatch[2] ? timeMatch[2] : '00';
    const ampm = timeMatch[3].toLowerCase();

    if (ampm === 'pm' && hour < 12) hour += 12;
    if (ampm === 'am' && hour === 12) hour = 0;

    dueTime = `${String(hour).padStart(2, '0')}:${minute}`;
    working = working.replace(timeMatch[0], '');
  } else {
    // Check 24-hour time: "at 18:00", "14:30"
    const time24Match = working.match(/\b(?:at\s+)?([01]?[0-9]|2[0-3]):([0-5][0-9])\b/i);
    if (time24Match) {
      dueTime = `${String(time24Match[1]).padStart(2, '0')}:${time24Match[2]}`;
      working = working.replace(time24Match[0], '');
    } else if (/\bat noon\b/i.test(working)) {
      dueTime = '12:00';
      working = working.replace(/\bat noon\b/i, '');
    } else if (/\bat midnight\b/i.test(working)) {
      dueTime = '00:00';
      working = working.replace(/\bat midnight\b/i, '');
    }
  }

  // 5. Extract priority markers:
  // "high priority", "urgent priority", "medium priority", "low priority",
  // "!high", "!urgent", "!med", "!medium", "!low", "priority high"
  const wordPrioRegex = /\b(high|urgent|medium|med|low)\s+priority\b/i;
  const wordPrioMatch = working.match(wordPrioRegex);
  if (wordPrioMatch) {
    const raw = wordPrioMatch[1].toLowerCase();
    if (raw === 'high' || raw === 'urgent') priority = 'High';
    else if (raw === 'low') priority = 'Low';
    else priority = 'Medium';
    working = working.replace(wordPrioMatch[0], '');
  } else {
    const prioSymbolRegex = /!(high|urgent|med|medium|low)\b/i;
    const prioSymbolMatch = working.match(prioSymbolRegex);
    if (prioSymbolMatch) {
      const raw = prioSymbolMatch[1].toLowerCase();
      if (raw === 'high' || raw === 'urgent') priority = 'High';
      else if (raw === 'low') priority = 'Low';
      else priority = 'Medium';
      working = working.replace(prioSymbolMatch[0], '');
    } else {
      const prioWordRegex = /\bpriority\s*:\s*(high|urgent|med|medium|low)\b/i;
      const prioWordMatch = working.match(prioWordRegex);
      if (prioWordMatch) {
        const raw = prioWordMatch[1].toLowerCase();
        if (raw === 'high' || raw === 'urgent') priority = 'High';
        else if (raw === 'low') priority = 'Low';
        else priority = 'Medium';
        working = working.replace(prioWordMatch[0], '');
      }
    }
  }

  // 6. Extract dates: today, tomorrow, yesterday, next week, in X days
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

  // 7. Clean up title (remove leftover artifacts like extra spaces)
  const cleanTitle = working.replace(/\s+/g, ' ').trim();

  return {
    title: cleanTitle || text.trim(),
    dueDate,
    dueTime,
    priority,
    estimatedMinutes,
    projectId,
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

/**
 * Advanced search parser and task filter
 * Supports queries like:
 * - "high priority tasks" or "priority:high"
 * - "overdue tasks" or "is:overdue"
 * - "tasks due today" or "due:today"
 * - "project:portfolio" or "p:portfolio"
 * - "tag:frontend"
 * - "status:done" / "status:todo" / "status:in_progress"
 */
export function filterTasks(
  tasks = [],
  { query = '', status = 'all', priority = 'all', category = 'all', tag = 'all', project = 'all' },
  projects = []
) {
  let workingQuery = query.trim().toLowerCase();
  let filterPriority = priority;
  let filterStatus = status;
  let filterTag = tag;
  let filterProject = project;
  let filterDue = null;
  let filterOverdue = false;

  // Natural language query shortcuts
  if (/\bhigh priority\b/i.test(workingQuery)) {
    filterPriority = 'High';
    workingQuery = workingQuery.replace(/\bhigh priority\b/i, '');
  } else if (/\blow priority\b/i.test(workingQuery)) {
    filterPriority = 'Low';
    workingQuery = workingQuery.replace(/\blow priority\b/i, '');
  } else if (/\bmedium priority\b/i.test(workingQuery)) {
    filterPriority = 'Medium';
    workingQuery = workingQuery.replace(/\bmedium priority\b/i, '');
  }

  if (/\b(overdue tasks|is:overdue|overdue:true|\boverdue\b)/i.test(workingQuery)) {
    filterOverdue = true;
    workingQuery = workingQuery.replace(/\b(overdue tasks|is:overdue|overdue:true|\boverdue\b)/i, '');
  }

  if (/\b(tasks due today|due:today|due today)\b/i.test(workingQuery)) {
    filterDue = 'today';
    workingQuery = workingQuery.replace(/\b(tasks due today|due:today|due today)\b/i, '');
  } else if (/\b(tasks due tomorrow|due:tomorrow|due tomorrow)\b/i.test(workingQuery)) {
    filterDue = 'tomorrow';
    workingQuery = workingQuery.replace(/\b(tasks due tomorrow|due:tomorrow|due tomorrow)\b/i, '');
  }

  // Syntax filters: priority:high, prio:high
  const prioMatch = workingQuery.match(/\b(?:priority|prio):(high|medium|low)\b/i);
  if (prioMatch) {
    const raw = prioMatch[1].toLowerCase();
    filterPriority = raw.charAt(0).toUpperCase() + raw.slice(1);
    workingQuery = workingQuery.replace(prioMatch[0], '');
  }

  // Syntax filters: status:done, status:todo, status:in_progress
  const statusMatch = workingQuery.match(/\bstatus:(done|completed|todo|in_progress|active)\b/i);
  if (statusMatch) {
    const raw = statusMatch[1].toLowerCase();
    filterStatus = raw === 'completed' ? 'done' : raw;
    workingQuery = workingQuery.replace(statusMatch[0], '');
  }

  // Syntax filters: tag:frontend, #frontend
  const tagMatch = workingQuery.match(/\b(?:tag:|#)([a-zA-Z0-9_\-]+)\b/i);
  if (tagMatch) {
    filterTag = tagMatch[1].toLowerCase();
    workingQuery = workingQuery.replace(tagMatch[0], '');
  }

  // Syntax filters: project:xyz, p:xyz
  const projMatch = workingQuery.match(/\b(?:project|p):([a-zA-Z0-9_\-]+)\b/i);
  if (projMatch) {
    filterProject = projMatch[1].toLowerCase();
    workingQuery = workingQuery.replace(projMatch[0], '');
  }

  // Clean remaining text
  const cleanTerm = workingQuery.replace(/\btasks\b/g, '').replace(/\s+/g, ' ').trim();

  const todayStr = getTodayString();
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

  return tasks.filter((task) => {
    // Overdue filter
    if (filterOverdue) {
      if (!isOverdue(task)) return false;
    }

    // Due date filter
    if (filterDue === 'today' && task.dueDate !== todayStr) return false;
    if (filterDue === 'tomorrow' && task.dueDate !== tomorrowStr) return false;

    // Status filter
    if (filterStatus === 'active' && task.completed) return false;
    if (filterStatus === 'completed' && !task.completed) return false;
    if (filterStatus === 'done' && !task.completed) return false;
    if (filterStatus === 'todo' && (task.completed || task.status === 'in_progress')) return false;
    if (filterStatus === 'in_progress' && (task.completed || task.status !== 'in_progress')) return false;

    // Priority filter
    if (filterPriority !== 'all' && task.priority?.toLowerCase() !== filterPriority.toLowerCase()) {
      return false;
    }

    // Category filter
    if (category !== 'all' && task.category?.toLowerCase() !== category.toLowerCase()) {
      return false;
    }

    // Tag filter
    if (filterTag !== 'all') {
      if (!Array.isArray(task.tags) || !task.tags.map((t) => t.toLowerCase()).includes(filterTag.toLowerCase())) {
        return false;
      }
    }

    // Project filter
    if (filterProject !== 'all') {
      const matchProjectId = task.projectId?.toLowerCase() === filterProject.toLowerCase();
      // Also match project name if projects array is provided
      const matchedProjectObj = projects.find(
        (p) => p.id?.toLowerCase() === task.projectId?.toLowerCase() ||
               p.name?.toLowerCase().includes(filterProject.toLowerCase())
      );
      if (!matchProjectId && !matchedProjectObj) return false;
    }

    // Free text match
    if (cleanTerm) {
      const matchTitle = task.title?.toLowerCase().includes(cleanTerm);
      const matchDesc = task.description?.toLowerCase().includes(cleanTerm);
      const matchCategory = task.category?.toLowerCase().includes(cleanTerm);
      const matchTags = Array.isArray(task.tags) && task.tags.some((t) => t.toLowerCase().includes(cleanTerm));
      const matchSubtasks = Array.isArray(task.subtasks) && task.subtasks.some((st) => st.title.toLowerCase().includes(cleanTerm));
      if (!matchTitle && !matchDesc && !matchCategory && !matchTags && !matchSubtasks) return false;
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
