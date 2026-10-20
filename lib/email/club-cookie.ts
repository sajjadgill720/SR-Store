import { NextResponse } from 'next/server';
import { rememberClub } from './service.mjs';

export const CLUB_COOKIE = 'knovera-reader-club';
export function rememberReaderClub(response: NextResponse, email: string, verified = false) {
  const receipt = rememberClub(email, verified);
  response.cookies.set(CLUB_COOKIE, receipt.token, {
    httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production',
    path: '/', maxAge: receipt.seconds,
  });
  return response;
}
