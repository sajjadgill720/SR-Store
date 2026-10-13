import { NextRequest, NextResponse } from 'next/server';
import { AuthError } from './server';

export const privateHeaders = { 'Cache-Control': 'private, no-store' };
export function sameOrigin(req: NextRequest) {
  try {
    const origin = new URL(req.headers.get('origin') || '');
    if (!['http:', 'https:'].includes(origin.protocol) || origin.host !== req.headers.get('host')) throw new Error();
  } catch { throw new AuthError('Request origin is not allowed.', 403); }
}
export function authFailure(error: unknown) {
  return NextResponse.json({ error: error instanceof AuthError ? error.message : 'Unable to complete this request. Please try again.' }, { status: error instanceof AuthError ? error.status : 503, headers: privateHeaders });
}
