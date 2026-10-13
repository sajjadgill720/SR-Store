import type { User } from '@supabase/supabase-js';
import { accountOrders } from '../auth/store';
import { db } from '../db/store';
import { AccessError, downloadAsset } from './access';
import type { Book } from '../types';

export async function accountLibrary(user: User) {
  const orders=await accountOrders(user);
  const books=new Map<string,Book>();
  for(const order of orders) {
    if(process.env.NODE_ENV==='production' && order.provider==='development_simulator') continue;
    for(const entitlement of await db.getOrderEntitlements(order.id)) {
      const item=order.items.find(item=>item.bookId===entitlement.bookId);
      if(!item) continue;
      const book=await db.getBookById(entitlement.bookId);
      if(!book) continue;
      const formats=book.formats.filter(format=>item.formats.includes(format));
      const previous=books.get(book.id);
      books.set(book.id,{...book,formats:[...new Set([...(previous?.formats || []),...formats])]});
    }
  }
  return [...books.values()];
}
export async function accountDownload(user: User, bookId: unknown, format: unknown) {
  for(const order of await accountOrders(user)) {
    if(!order.items.some(item=>item.bookId===bookId)) continue;
    try { return await downloadAsset(order.publicToken,bookId,format); }
    catch(error) { if(!(error instanceof AccessError) || error.status!==403) throw error; }
  }
  throw new AccessError('Your account does not have active access to that book and format.',403);
}
