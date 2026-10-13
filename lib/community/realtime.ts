'use client';
import { createClient } from '@supabase/supabase-js';

const listeners = new Set<() => void>();
let stop: (() => void) | undefined;
function realtimeClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  try {
    return url && key ? createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } }) : null;
  } catch { return null; } // Incomplete development configuration keeps polling usable.
}

// One socket and fallback timer per tab. Events carry no rows or member identifiers.
export function subscribeCommunityChanges(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) {
    let connected = false;
    let pending: ReturnType<typeof setTimeout> | undefined;
    let elapsed = 0;
    const refresh = () => {
      if (pending) return;
      pending = setTimeout(() => { pending = undefined; if (document.visibilityState === 'visible') listeners.forEach(fn => fn()); }, 150);
    };
    const client = realtimeClient();
    const channel = client?.channel('knovera:community', { config: { private: true } })
      .on('broadcast', { event: 'changed' }, refresh)
      .subscribe(status => { connected = status === 'SUBSCRIBED'; if (connected) { elapsed = 0; refresh(); } });
    // Poll only while disconnected; reconcile once a minute to recover missed events.
    const timer = setInterval(() => { elapsed += 5000; if (!connected || elapsed >= 60000) { elapsed = 0; refresh(); } }, 5000);
    const visible = () => { if (document.visibilityState === 'visible') refresh(); };
    window.addEventListener('focus', refresh);
    window.addEventListener('online', refresh);
    document.addEventListener('visibilitychange', visible);
    stop = () => {
      clearInterval(timer); clearTimeout(pending);
      window.removeEventListener('focus', refresh); window.removeEventListener('online', refresh);
      document.removeEventListener('visibilitychange', visible);
      if (channel) void client?.removeChannel(channel);
    };
  }
  return () => { listeners.delete(listener); if (!listeners.size) { stop?.(); stop = undefined; } };
}
