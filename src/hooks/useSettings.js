import { useEffect, useState } from 'react';
import { readStore, writeStore } from '../services/storage';

const defaults = { theme: 'system', defaultPriority: 'medium', defaultCategory: 'Personal' };

export function useSettings() {
  const [settings, setSettings] = useState(() => readStore({ settings: defaults }).settings || defaults);
  useEffect(() => { writeStore({ ...readStore({}), settings }); }, [settings]);
  return { settings, updateSettings: (changes) => setSettings((current) => ({ ...current, ...changes })) };
}
