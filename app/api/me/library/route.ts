import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/store';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json({ error: 'Email parameter required' }, { status: 400 });
  }

  const normEmail = email.toLowerCase().trim();
  const entitlements = await db.getEntitlements(normEmail);

  const books = (await Promise.all([...new Set(entitlements.map(ent => ent.bookId))].map(id => db.getBookById(id))))
    .filter((b): b is NonNullable<typeof b> => b !== undefined);

  return NextResponse.json({
    email: normEmail,
    count: books.length,
    books
  }, { headers: { 'Cache-Control': 'private, no-store' } });
}
