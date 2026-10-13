import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { accountRole } from './store';

export class AuthError extends Error {
  constructor(message: string, public status = 401) { super(message); }
}
export async function serverAuth() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new AuthError('Account sign-in is not configured yet.', 503);
  const jar = await cookies();
  return createServerClient(url, key, {
    cookies: {
      getAll: () => jar.getAll(),
      setAll: values => {
        try { values.forEach(({ name, value, options }) => jar.set(name, value, options)); }
        catch { /* Server Components cannot write cookies; proxy refreshes them. */ }
      },
    },
  });
}
export async function currentUser() {
  const client = await serverAuth();
  // Verify with Auth, including disabled/deleted accounts. Never authorize from getSession().
  const { data, error } = await client.auth.getUser();
  if (error) {
    if (error.name === 'AuthSessionMissingError' || [400,401,403].includes(error.status || 0)) return null;
    throw new AuthError('Account service is temporarily unavailable.', 503);
  }
  return data.user && !data.user.is_anonymous && data.user.email_confirmed_at ? data.user : null;
}
export async function requireUser() {
  const user = await currentUser();
  if (!user) throw new AuthError('Sign in with a confirmed email address to continue.');
  return user;
}
export async function requireAdmin() {
  const user = await requireUser();
  if (await accountRole(user.id) !== 'admin') throw new AuthError('Administrator access is required.', 403);
  return user;
}
