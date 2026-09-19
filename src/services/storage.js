const key = 'toki:v1';

export function readStore(fallback) {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return fallback;
    const parsed = JSON.parse(saved);
    return parsed && typeof parsed === 'object' ? { ...fallback, ...parsed } : fallback;
  } catch {
    return fallback;
  }
}

export function writeStore(data) {
  try { localStorage.setItem(key, JSON.stringify(data)); return true; } catch { return false; }
}

export function clearStore() {
  try { localStorage.removeItem(key); return true; } catch { return false; }
}
