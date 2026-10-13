import { NextResponse } from 'next/server';

// Old preview tokens never serve fabricated ebook files.
export function GET() {
  return NextResponse.json({ error: 'This preview link has expired. Open your purchase link to request a fresh download.' }, { status: 410, headers: { 'Cache-Control': 'no-store' } });
}
