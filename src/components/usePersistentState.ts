import { useEffect, useState } from 'react';

/**
 * Drop-in replacement for useState that mirrors the value to localStorage, so a
 * page refresh restores it. Falls back to `initial` when storage is empty,
 * unavailable, or holds corrupt JSON.
 */
export function usePersistentState<T>(key: string, initial: T | (() => T)) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw !== null) return JSON.parse(raw) as T;
    } catch {
      /* unavailable or corrupt storage — fall through to initial */
    }
    return initial instanceof Function ? (initial as () => T)() : initial;
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* quota exceeded or storage unavailable — ignore */
    }
  }, [key, value]);

  return [value, setValue] as const;
}
