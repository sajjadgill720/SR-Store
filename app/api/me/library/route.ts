import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/store';
import { AccessError, purchaseAccess, PURCHASE_COOKIE } from '@/lib/downloads/access';
import { currentUser, AuthError } from '@/lib/auth/server';
import { sameOrigin } from '@/lib/auth/http';
import { accountLibrary } from '@/lib/downloads/account';

const headers = { 'Cache-Control': 'private, no-store' };
export async function GET(req: NextRequest) {
  try {
    const user = await currentUser();
    if (user) return NextResponse.json({ books:await accountLibrary(user),account:true,orderNumber:'Your account' }, {headers});
    const { order, entitlements } = await purchaseAccess(req.cookies.get(PURCHASE_COOKIE)?.value);
    const books = (await Promise.all(entitlements.map(item => db.getBookById(item.bookId))))
      .filter((book): book is NonNullable<typeof book> => !!book)
      .map(book => ({ ...book, formats: book.formats.filter(format => order.items.some(item => item.bookId === book.id && item.formats.includes(format))) }));
    return NextResponse.json({ books, orderNumber: order.orderNumber }, { headers });
  } catch (error) {
    return NextResponse.json({ error: error instanceof AccessError || error instanceof AuthError ? error.message : 'Could not open your library. Please try again.' }, { status: error instanceof AccessError || error instanceof AuthError ? error.status : 503, headers });
  }
}
export async function DELETE(req: NextRequest) {
  try { sameOrigin(req); } catch { return NextResponse.json({ error:'Invalid origin.' }, {status:403,headers}); }
  const response = NextResponse.json({ success: true }, { headers });
  response.cookies.set(PURCHASE_COOKIE, '', { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production', path: '/api', maxAge: 0 });
  return response;
}
