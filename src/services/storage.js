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

  // V4 fields normalization
  const dueTime = typeof item.dueTime === 'string' ? item.dueTime.trim() : '';
  const estimatedMinutes = typeof item.estimatedMinutes === 'number' && !isNaN(item.estimatedMinutes)
    ? Math.max(0, Math.round(item.estimatedMinutes))
    : 0;
  const projectId = typeof item.projectId === 'string' && item.projectId.trim().length > 0
    ? item.projectId.trim()
    : null;

  // Task dependencies (IDs of tasks this task depends on)
  let dependsOn = [];
  if (Array.isArray(item.dependsOn)) {
    dependsOn = item.dependsOn
      .filter((id) => typeof id === 'string' && id.trim().length > 0 && id !== item.id)
      .map((id) => id.trim());
    dependsOn = [...new Set(dependsOn)];
  }

  // Attachments
  let attachments = [];
  if (Array.isArray(item.attachments)) {
    attachments = item.attachments
      .filter((att) => att && typeof att.name === 'string')
      .map((att) => ({
        id: typeof att.id === 'string' ? att.id : crypto.randomUUID(),
        name: att.name,
        size: typeof att.size === 'number' ? att.size : 0,
        type: typeof att.type === 'string' ? att.type : 'application/octet-stream',
        url: typeof att.url === 'string' ? att.url : '',
        storagePath: typeof att.storagePath === 'string' ? att.storagePath : '',
        createdAt: att.createdAt || Date.now(),
      }));
  }

  // Comments (Collaboration)
  let comments = [];
  if (Array.isArray(item.comments)) {
    comments = item.comments
      .filter((c) => c && typeof c.content === 'string' && c.content.trim().length > 0)
      .map((c) => ({
        id: typeof c.id === 'string' ? c.id : crypto.randomUUID(),
        userId: typeof c.userId === 'string' ? c.userId : 'guest',
        userName: typeof c.userName === 'string' ? c.userName : 'Anonymous',
        userAvatar: typeof c.userAvatar === 'string' ? c.userAvatar : '',
        content: c.content.trim(),
        createdAt: c.createdAt || Date.now(),
      }));
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
    dueTime,
    estimatedMinutes,
    projectId,
    dependsOn,
    attachments,
    comments,
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
    localStorage.removeItem(PROJECTS_KEY);
    localStorage.removeItem(ACTIVITY_KEY);
    localStorage.removeItem(OFFLINE_QUEUE_KEY);
    return true;
  } catch (error) {
    console.error('Toki: Failed to clear local storage.', error);
    return false;
  }
}

// ---------------------------------------------------------------------------
// Focus History Storage
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Achievements Storage
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// V4: Projects Storage
// ---------------------------------------------------------------------------
const PROJECTS_KEY = 'toki:projects:v1';

export function sanitizeProject(proj) {
  if (!proj || typeof proj !== 'object') return null;
  const name = typeof proj.name === 'string' ? proj.name.trim() : '';
  if (!name) return null;

  const validColors = [
    '#dc6b54', // Toki Coral
    '#4a7c59', // Leaf Green
    '#3b82f6', // Ocean Blue
    '#8b5cf6', // Violet
    '#f59e0b', // Warm Amber
    '#ec4899', // Berry Pink
  ];

  let color = validColors[0];
  if (proj.color && (validColors.includes(proj.color) || /^#[0-9a-fA-F]{6}$/.test(proj.color))) {
    color = proj.color;
  }

  let members = [];
  if (Array.isArray(proj.members)) {
    members = proj.members
      .filter((m) => m && typeof m.name === 'string')
      .map((m) => ({
        id: typeof m.id === 'string' ? m.id : crypto.randomUUID(),
        name: m.name.trim(),
        email: typeof m.email === 'string' ? m.email.trim() : '',
        role: ['owner', 'editor', 'viewer'].includes(m.role) ? m.role : 'editor',
      }));
  }

  const now = Date.now();
  return {
    id: typeof proj.id === 'string' && proj.id.length > 0 ? proj.id : crypto.randomUUID(),
    name,
    description: typeof proj.description === 'string' ? proj.description.trim() : '',
    color,
    ownerId: typeof proj.ownerId === 'string' ? proj.ownerId : 'local-user',
    members,
    createdAt: typeof proj.createdAt === 'number' ? proj.createdAt : now,
    updatedAt: typeof proj.updatedAt === 'number' ? proj.updatedAt : now,
  };
}

export function readProjects(fallback = []) {
  try {
    const raw = localStorage.getItem(PROJECTS_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return fallback;
    return parsed.map(sanitizeProject).filter(Boolean);
  } catch {
    return fallback;
  }
}

export function writeProjects(projects) {
  try {
    if (!Array.isArray(projects)) return false;
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
    return true;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// V4: Activity Log Storage
// ---------------------------------------------------------------------------
const ACTIVITY_KEY = 'toki:activity:v1';

export function readActivityLog(limit = 50) {
  try {
    const raw = localStorage.getItem(ACTIVITY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.slice(0, limit);
  } catch {
    return [];
  }
}

export function logActivityItem({ action, entityType = 'task', entityTitle = '', userName = 'You', metadata = {} }) {
  try {
    const logs = readActivityLog(100);
    const item = {
      id: crypto.randomUUID(),
      action, // e.g. "completed", "created", "moved to in progress", "added attachment"
      entityType, // 'task' | 'project'
      entityTitle,
      userName,
      metadata,
      timestamp: Date.now(),
    };
    const updated = [item, ...logs].slice(0, 100);
    localStorage.setItem(ACTIVITY_KEY, JSON.stringify(updated));
    return item;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// V4: Offline Sync Queue
// ---------------------------------------------------------------------------
const OFFLINE_QUEUE_KEY = 'toki:offline_queue:v1';

export function readOfflineQueue() {
  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function pushOfflineQueue(action) {
  try {
    const queue = readOfflineQueue();
    queue.push({
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      ...action,
    });
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
    return true;
  } catch {
    return false;
  }
}

export function clearOfflineQueue() {
  try {
    localStorage.removeItem(OFFLINE_QUEUE_KEY);
    return true;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// V4: Sync Conflict Strategy
// ---------------------------------------------------------------------------
/**
 * Detects if a local task and remote task have conflicting changes.
 * Returns null if no conflict, or { hasConflict, fields: [...] } if conflict exists.
 */
export function detectTaskConflict(localTask, remoteTask) {
  if (!localTask || !remoteTask) return null;
  // If remote is older or identical, no conflict
  if ((remoteTask.updatedAt || 0) <= (localTask.updatedAt || 0)) return null;

  const conflictFields = [];
  const fieldsToCheck = ['title', 'description', 'priority', 'status', 'dueDate', 'dueTime', 'estimatedMinutes', 'completed'];

  fieldsToCheck.forEach((field) => {
    if (localTask[field] !== remoteTask[field]) {
      conflictFields.push({
        field,
        localValue: localTask[field],
        remoteValue: remoteTask[field],
      });
    }
  });

  return conflictFields.length > 0
    ? { hasConflict: true, fields: conflictFields, localTask, remoteTask }
    : null;
}

/**
 * Merges independent fields where possible.
 */
export function mergeIndependentFields(localTask, remoteTask, baseTask = {}) {
  const merged = { ...remoteTask };

  // If local changed a field that remote did not change compared to base, keep local's change
  const fields = ['title', 'description', 'priority', 'status', 'dueDate', 'dueTime', 'estimatedMinutes', 'completed'];
  fields.forEach((field) => {
    const localChanged = localTask[field] !== baseTask[field];
    const remoteChanged = remoteTask[field] !== baseTask[field];

    if (localChanged && !remoteChanged) {
      merged[field] = localTask[field];
    }
  });

  // Union subtasks and tags
  if (Array.isArray(localTask.tags) && Array.isArray(remoteTask.tags)) {
    merged.tags = [...new Set([...localTask.tags, ...remoteTask.tags])];
  }

  merged.updatedAt = Date.now();
  return sanitizeTask(merged);
}
