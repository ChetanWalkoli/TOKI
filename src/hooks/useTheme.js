import { useEffect } from 'react';

/**
 * useTheme — applies the correct data-theme attribute to <html>
 * and keeps it in sync with OS changes when in "system" mode.
 *
 * @param {'light' | 'dark' | 'system'} theme
 */
export function useTheme(theme) {
  useEffect(() => {
    const root = document.documentElement;

    const apply = (prefersDark) => {
      const isDark =
        theme === 'dark' ||
        (theme !== 'light' && prefersDark); // 'system' or undefined → follow OS

      root.setAttribute('data-theme', isDark ? 'dark' : 'light');

      // Keep <meta name="theme-color"> in sync (mobile browser chrome)
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) {
        meta.setAttribute('content', isDark ? '#1c1e1c' : '#f7f3eb');
      }
    };

    const mq =
      typeof window !== 'undefined' && window.matchMedia
        ? window.matchMedia('(prefers-color-scheme: dark)')
        : null;

    // Apply immediately using current OS preference
    apply(mq ? mq.matches : false);

    // For 'system' mode, keep listening for OS changes at runtime
    if (theme === 'system' || theme == null) {
      if (!mq) return;

      const listener = (e) => apply(e.matches);

      if (mq.addEventListener) {
        mq.addEventListener('change', listener);
        return () => mq.removeEventListener('change', listener);
      } else {
        // Older Safari / Firefox fallback
        mq.addListener(listener);
        return () => mq.removeListener(listener);
      }
    }
  }, [theme]);
}
