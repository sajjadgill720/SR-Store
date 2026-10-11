'use client';

import { useSyncExternalStore } from 'react';
export interface CommunityActivity { joined: string[]; saved: string[]; notes: Record<string, string>; completed: string[] }
const empty: CommunityActivity = { joined: [], saved: [], notes: {}, completed: [] };
const key = 'knovera_community_v1';
let snapshot = empty;
let initialized = false;
const listeners = new Set<() => void>();
function read() {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : null;
    const strings = (value: unknown): string[] => Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string').slice(0, 100) : [];
    snapshot = parsed && typeof parsed === 'object' ? { joined: strings(parsed.joined), saved: strings(parsed.saved), completed: strings(parsed.completed), notes: Object.fromEntries(Object.entries(parsed.notes && typeof parsed.notes === 'object' ? parsed.notes : {}).filter(([, value]) => typeof value === 'string').slice(0, 100)) as Record<string, string> } : empty;
  } catch { snapshot = empty; }
}
function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => { if (event.key === key || event.key === null) { read(); listeners.forEach(fn => fn()); } };
  window.addEventListener('storage', onStorage);
  return () => { listeners.delete(listener); window.removeEventListener('storage', onStorage); };
}
function getSnapshot() { if (!initialized) { read(); initialized = true; } return snapshot; }
export function useCommunityActivity() { return useSyncExternalStore(subscribe, getSnapshot, () => empty); }
export function updateActivity(update: (previous: CommunityActivity) => CommunityActivity): boolean {
  const next = update(getSnapshot());
  try { localStorage.setItem(key, JSON.stringify(next)); snapshot = next; listeners.forEach(fn => fn()); return true; } catch { return false; }
}
export function toggleActivity(field: 'joined' | 'saved' | 'completed', value: string) {
  return updateActivity(previous => ({ ...previous, [field]: previous[field].includes(value) ? previous[field].filter(item => item !== value) : [...previous[field], value] }));
}
