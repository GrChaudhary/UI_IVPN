import { useSyncExternalStore } from 'react';

/** Current theme ('dark' | 'light'), for the few consumers that can't use CSS variables (canvas charts). */
const subscribe = (cb) => {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  return () => mo.disconnect();
};
const snapshot = () => document.documentElement.dataset.theme || 'dark';

export const useTheme = () => useSyncExternalStore(subscribe, snapshot, () => 'dark');
