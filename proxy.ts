import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

export async function proxy(request: NextRequest) {
  if (request.method === 'GET' && request.nextUrl.pathname === '/api/books') return NextResponse.next();
  let response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (url && key) {
    const client = createServerClient(url, key, { cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: values => {
        values.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        values.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    } });
    try { await client.auth.getClaims(); }
    catch { /* Routes independently verify identity and fail closed on Auth outages. */ }
  }
  response.headers.set('Cache-Control', 'private, no-store');
  return response;
}
export const config = { matcher: ['/admin/:path*','/account/:path*','/auth/:path*','/api/auth/:path*','/api/admin/:path*','/api/books','/api/community/:path*','/api/me/:path*','/api/downloads','/api/checkouts/:path*'] };
