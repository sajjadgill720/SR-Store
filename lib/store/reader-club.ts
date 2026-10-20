'use client';
import { useEffect, useSyncExternalStore } from 'react';

type ClubStatus = 'loading' | 'none' | 'pending' | 'subscribed';
let status: ClubStatus = 'loading';
let checkedAt = 0;
let request: Promise<void> | undefined;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach(listener => listener());
export function rememberClubSignup() { status = 'pending'; checkedAt = Date.now(); notify(); }
export function refreshReaderClub() {
  if (request) return request;
  request = fetch('/api/newsletter/status', { cache: 'no-store' })
    .then(async response => {
      if (!response.ok) throw new Error('Membership check unavailable');
      const data = await response.json();
      if (['none', 'pending', 'subscribed'].includes(data.status)) status = data.status;
      checkedAt = Date.now();
    }).catch(() => { if (status === 'loading') status = 'none'; })
    .finally(() => { request = undefined; notify(); });
  return request;
}
function subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; }
export function useReaderClub() {
  const value = useSyncExternalStore(subscribe, () => status, () => 'loading' as ClubStatus);
  useEffect(() => {
    if (Date.now() - checkedAt > 30000) void refreshReaderClub();
    const refresh = () => { void refreshReaderClub(); };
    window.addEventListener('focus', refresh);
    return () => window.removeEventListener('focus', refresh);
  }, []);
  return value;
}
