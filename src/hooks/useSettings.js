import { useEffect, useState } from 'react';
import { readStore, writeStore } from '../services/storage';

const defaultSettings = {
  theme: 'system',
  defaultPriority: 'Medium',
  defaultCategory: 'Personal',
};

export function useSettings() {
  const [settings, setSettings] = useState(() => {
    const stored = readStore({ settings: defaultSettings }).settings;
    return { ...defaultSettings, ...(stored || {}) };
  });

  useEffect(() => {
    const currentStore = readStore({});
    writeStore({ ...currentStore, settings });
  }, [settings]);

  const updateSettings = (changes) => {
    setSettings((current) => ({ ...current, ...changes }));
  };

  return { settings, updateSettings };
}
