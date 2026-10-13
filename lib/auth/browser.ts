'use client';
import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { changeAccount } from '../cache/browser';

let client: SupabaseClient | undefined;

export function browserAuth() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error('Account sign-in is not configured yet. Please contact support.');
  if (!client) {
    client = createBrowserClient(url, key);
    client.auth.onAuthStateChange((_event, session) => changeAccount(session?.user.id || null));
  }
  return client;
}
