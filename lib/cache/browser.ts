'use client';
import { MemoryCache } from './memory';

export const browserReads = new MemoryCache();
let identity: string | null | undefined;
let epoch = 0;
const listeners = new Set<() => void>();
export function subscribeAccountScope(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; }
export function accountScope() { return `${identity || 'guest'}:${epoch}`; }
export function currentAccountId() { return identity; }
export function changeAccount(id: string | null) {
  if (identity === id) return;
  identity = id; epoch++; browserReads.clear();
  listeners.forEach(listener=>listener());
}
export function clearPrivateReads() { epoch++; browserReads.clear(); listeners.forEach(listener=>listener()); }
