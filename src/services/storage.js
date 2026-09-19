const KEY = 'toki:v1';

export function sanitizeTask(item) {
  if (!item || typeof item !== 'object') return null;
  const title = typeof item.title === 'string' ? item.title.trim() : '';
  if (!title) return null;

  const validPriorities = ['Low', 'Medium', 'High'];
  const validCategories = ['Personal', 'Work', 'Study', 'Health', 'Other'];

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

  const now = Date.now();
  const createdAt = typeof item.createdAt === 'number' && !isNaN(item.createdAt) ? item.createdAt : now;
  const updatedAt = typeof item.updatedAt === 'number' && !isNaN(item.updatedAt) ? item.updatedAt : createdAt;

  return {
    id: typeof item.id === 'string' && item.id.length > 0 ? item.id : crypto.randomUUID(),
    title,
    description: typeof item.description === 'string' ? item.description : '',
    completed: Boolean(item.completed),
    priority,
    category,
    dueDate: typeof item.dueDate === 'string' ? item.dueDate : '',
    createdAt,
    updatedAt,
    completedAt: item.completedAt ? Number(item.completedAt) : null,
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

    // Clean and validate tasks if present
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
    return true;
  } catch (error) {
    console.error('Toki: Failed to clear local storage.', error);
    return false;
  }
}
