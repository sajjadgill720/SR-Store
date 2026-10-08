import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/store';
import { getBookById } from '@/lib/data/books';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json({ error: 'Email parameter required' }, { status: 400 });
  }

  const normEmail = email.toLowerCase().trim();
  const entitlements = db.getEntitlements(normEmail);

  const books = entitlements
    .map((ent) => db.getBookById(ent.bookId) || getBookById(ent.bookId))
    .filter((b): b is NonNullable<typeof b> => b !== undefined);

  return NextResponse.json({
    email: normEmail,
    count: books.length,
    books
  });
}
