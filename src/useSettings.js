import { useState } from 'react';

const KEY = 'nexus.settings';

export const DEFAULT_SETTINGS = {
  identity: { sessionTimeoutMin: '60' },
  reduceMotion: false,
  activity: { liveRuns: true, agentEvents: true, auditEvents: false, refresh: '10s' },
  integrationMode: 'live', // 'live' | 'simulation' | 'readonly'
  scheduling: { window: 'Sat 23:00 – 03:00 IST', soakHours: 24, maxCisPerWave: 50 },
};

export const loadSettings = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY)) ?? {};
    return Object.fromEntries(Object.entries(DEFAULT_SETTINGS).map(([k, v]) => [k, typeof v === 'object' ? { ...v, ...saved[k] } : saved[k] ?? v]));
  } catch {
    return DEFAULT_SETTINGS;
  }
};

/** App-wide preferences, persisted per browser. `update({ section: {...} })` replaces whole sections. */
export function useSettings() {
  const [settings, setSettings] = useState(loadSettings);
  const update = (patch) =>
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* storage unavailable */ }
      return next;
    });
  const reset = () => {
    try { localStorage.removeItem(KEY); } catch { /* storage unavailable */ }
    setSettings(DEFAULT_SETTINGS);
  };
  return [settings, update, reset];
}
