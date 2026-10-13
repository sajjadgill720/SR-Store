import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/store';
import { AccessError, purchaseAccess, PURCHASE_COOKIE } from '@/lib/downloads/access';

const headers = { 'Cache-Control': 'private, no-store' };
export async function GET(req: NextRequest) {
  try {
    const { order, entitlements } = await purchaseAccess(req.cookies.get(PURCHASE_COOKIE)?.value);
    const books = (await Promise.all(entitlements.map(item => db.getBookById(item.bookId))))
      .filter((book): book is NonNullable<typeof book> => !!book)
      .map(book => ({ ...book, formats: book.formats.filter(format => order.items.some(item => item.bookId === book.id && item.formats.includes(format))) }));
    return NextResponse.json({ books, orderNumber: order.orderNumber }, { headers });
  } catch (error) {
    return NextResponse.json({ error: error instanceof AccessError ? error.message : 'Could not open your library. Please try again.' }, { status: error instanceof AccessError ? error.status : 503, headers });
  }
}
export async function DELETE(req: NextRequest) {
  if (req.headers.get('origin') !== new URL(req.url).origin) return NextResponse.json({ error: 'Invalid origin.' }, { status: 403, headers });
  const response = NextResponse.json({ success: true }, { headers });
  response.cookies.set(PURCHASE_COOKIE, '', { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production', path: '/api', maxAge: 0 });
  return response;
}
