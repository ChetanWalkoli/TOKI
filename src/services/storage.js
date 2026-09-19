const KEY = 'toki:v1';
const FOCUS_KEY = 'toki:focus:v1';
const ACHIEVEMENTS_KEY = 'toki:achievements:v1';

export function sanitizeTask(item) {
  if (!item || typeof item !== 'object') return null;
  const title = typeof item.title === 'string' ? item.title.trim() : '';
  if (!title) return null;

  const validPriorities = ['Low', 'Medium', 'High'];
  const validCategories = ['Personal', 'Work', 'Study', 'Health', 'Other'];
  const validStatuses = ['todo', 'in_progress', 'done'];

  // Normalize priority
  let priority = 'Medium';
  if (item.priority) {
    const capitalized = item.priority.charAt(0).toUpperCase() + item.priority.slice(1).toLowerCase();
    if (validPriorities.includes(capitalized)) {
      priority = capitalized;
    }
  }

  // Normalize category
  let category = 'Personal';
  if (item.category && validCategories.includes(item.category)) {
    category = item.category;
  }

  // Normalize subtasks
  let subtasks = [];
  if (Array.isArray(item.subtasks)) {
    subtasks = item.subtasks
      .filter((st) => st && typeof st.title === 'string' && st.title.trim().length > 0)
      .map((st) => ({
        id: typeof st.id === 'string' && st.id.length > 0 ? st.id : crypto.randomUUID(),
        title: st.title.trim(),
        completed: Boolean(st.completed),
      }));
  }

  // Normalize tags
  let tags = [];
  if (Array.isArray(item.tags)) {
    tags = item.tags
      .filter((t) => typeof t === 'string' && t.trim().length > 0)
      .map((t) => t.trim().replace(/^#/, '').toLowerCase());
    tags = [...new Set(tags)]; // unique
  }

  const completed = Boolean(item.completed);

  // Normalize status for Kanban
  let status = 'todo';
  if (item.status && validStatuses.includes(item.status)) {
    status = item.status;
    // Keep completed and status synchronized
    if (status === 'done' && !completed) {
      status = 'todo';
    } else if (completed) {
      status = 'done';
    }
  } else {
    status = completed ? 'done' : 'todo';
  }

  const now = Date.now();
  const createdAt = typeof item.createdAt === 'number' && !isNaN(item.createdAt) ? item.createdAt : now;
  const updatedAt = typeof item.updatedAt === 'number' && !isNaN(item.updatedAt) ? item.updatedAt : createdAt;

  return {
    id: typeof item.id === 'string' && item.id.length > 0 ? item.id : crypto.randomUUID(),
    title,
    description: typeof item.description === 'string' ? item.description : '',
    completed,
    status,
    priority,
    category,
    dueDate: typeof item.dueDate === 'string' ? item.dueDate : '',
    subtasks,
    tags,
    focusSessions: typeof item.focusSessions === 'number' ? Math.max(0, item.focusSessions) : 0,
    focusMinutes: typeof item.focusMinutes === 'number' ? Math.max(0, item.focusMinutes) : 0,
    createdAt,
    updatedAt,
    completedAt: item.completedAt ? Number(item.completedAt) : (completed ? updatedAt : null),
  };
}

export function readStore(fallback = {}) {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return fallback;

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return fallback;
    }

    if (Array.isArray(parsed.tasks)) {
      parsed.tasks = parsed.tasks.map(sanitizeTask).filter(Boolean);
    }

    return { ...fallback, ...parsed };
  } catch (error) {
    console.warn('Toki: Unable to read local storage or corrupted data detected, restoring defaults.', error);
    return fallback;
  }
}

export function writeStore(data) {
  try {
    if (!data || typeof data !== 'object') return false;
    localStorage.setItem(KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Toki: Failed to write to local storage.', error);
    return false;
  }
}

export function clearStore() {
  try {
    localStorage.removeItem(KEY);
    localStorage.removeItem(FOCUS_KEY);
    localStorage.removeItem(ACHIEVEMENTS_KEY);
    return true;
  } catch (error) {
    console.error('Toki: Failed to clear local storage.', error);
    return false;
  }
}

// Focus history storage
export function readFocusHistory() {
  try {
    const raw = localStorage.getItem(FOCUS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeFocusHistory(history) {
  try {
    localStorage.setItem(FOCUS_KEY, JSON.stringify(history));
    return true;
  } catch {
    return false;
  }
}

// Achievements storage
export function readAchievements() {
  try {
    const raw = localStorage.getItem(ACHIEVEMENTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeAchievements(achievements) {
  try {
    localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(achievements));
    return true;
  } catch {
    return false;
  }
}
