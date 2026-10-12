'use client';
import { useSyncExternalStore } from 'react';
import { toggleActivity as localToggle, updateActivity as localUpdate, useCommunityActivity as useLocalActivity } from '../store/community';
import { emptyActivity, type Activity, type Member } from './types';

interface State { member: Member | null; activity: Activity; revision: number; ready: boolean; error: string }
const initial: State = { member: null, activity: emptyActivity(), revision: 0, ready: false, error: '' };
let state = initial;
const listeners = new Set<() => void>();
let generation = 0;
let writing = false;
function emit(next: Partial<State>) { state = { ...state, ...next }; listeners.forEach(fn => fn()); }
export async function api<T>(resource: string, input?: unknown): Promise<T> {
  const response = await fetch(`/api/community/${resource}`, { method: input === undefined ? 'GET' : 'POST', headers: input === undefined ? undefined : { 'Content-Type': 'application/json' }, body: input === undefined ? undefined : JSON.stringify(input), cache: 'no-store' });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Unable to reach the community.');
  return result;
}
export async function refreshSession() {
  if (writing) return;
  const current = ++generation;
  try {
    const result = await api<{ member: Member | null; activity?: Activity; revision?: number }>('session');
    if (generation !== current || writing) return;
    emit({ member: result.member, activity: result.activity || emptyActivity(), revision: result.revision || 0, ready: true, error: '' });
  } catch (error) { if (generation === current) emit({ ready: true, error: error instanceof Error ? error.message : 'Sync unavailable.' }); }
}
function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) {
    void refreshSession();
    const timer = window.setInterval(() => { if (document.visibilityState === 'visible') void refreshSession(); }, 5000);
    const refresh = () => { void refreshSession(); };
    window.addEventListener('focus', refresh);
    window.addEventListener('online', refresh);
    stop = () => { window.clearInterval(timer); window.removeEventListener('focus', refresh); window.removeEventListener('online', refresh); };
  }
  return () => { listeners.delete(listener); if (!listeners.size) stop?.(); };
}
let stop: (() => void) | undefined;
export function useMemberSession() { return useSyncExternalStore(subscribe, () => state, () => initial); }
export function useCommunityActivity() { const session = useMemberSession(); const local = useLocalActivity(); return session.member ? session.activity : local; }
export async function account(input: unknown) {
  if (writing) throw new Error('Please wait for your current save to finish.');
  writing = true; ++generation;
  try {
    const result = await api<{ member: Member | null; activity?: Activity; revision?: number }>('session', input);
    emit({ member: result.member, activity: result.activity || emptyActivity(), revision: result.revision || 0, ready: true, error: '' });
  } finally { writing = false; }
}
async function change(field: string, id: string, value: unknown, previousValue?: string | null): Promise<boolean> {
  if (writing) { emit({ error: 'Please wait for your current save to finish.' }); return false; }
  writing = true; ++generation;
  try {
    const result = await api<{ activity: Activity; revision: number }>('activity', { field, id, value, revision: state.revision, ...(previousValue === undefined ? {} : { previousValue }) });
    emit({ ...result, error: '' }); return true;
  } catch (error) {
    emit({ error: error instanceof Error ? error.message : 'Unable to sync. Your change was not saved.' });
    return false;
  } finally { writing = false; }
}
export async function toggleActivity(field: 'joined' | 'saved' | 'completed', id: string) {
  if (!state.ready) return false;
  if (!state.member) return localToggle(field, id);
  return change(field, id, !state.activity[field].includes(id));
}
export async function updateActivity(update: (previous: Activity) => Activity, previousValue?: string | null) {
  if (!state.ready) return false;
  if (!state.member) return localUpdate(update);
  const before = state.activity;
  const after = update(before);
  const keys = new Set([...Object.keys(before.notes), ...Object.keys(after.notes)]);
  for (const id of keys) if (before.notes[id] !== after.notes[id]) return change('notes', id, after.notes[id] ?? null, previousValue === undefined ? before.notes[id] ?? null : previousValue);
  return true;
}
export async function importLocalActivity(local: Activity) {
  if (!state.member) throw new Error('Sign in first.');
  for (const field of ['joined', 'saved', 'completed'] as const) for (const id of local[field]) {
    if (!state.activity[field].includes(id) && !await change(field, id, true)) throw new Error(state.error);
  }
  for (const [id, value] of Object.entries(local.notes)) {
    // Preserve existing account reflections instead of overwriting them during an import.
    if (!(id in state.activity.notes) && !await change('notes', id, value)) throw new Error(state.error);
  }
}
