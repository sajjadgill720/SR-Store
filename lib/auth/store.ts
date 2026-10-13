import type { User } from '@supabase/supabase-js';
import type { Member } from '../community/types';
import type { Order } from '../types';
import { query } from '../db/postgres.mjs';

export async function accountRole(userId: string): Promise<'reader' | 'admin' | 'moderator'> {
  const row = (await query<{role:'admin'|'moderator'}>('SELECT role FROM knovera.account_roles WHERE user_id=$1', [userId])).rows[0];
  return row?.role || 'reader';
}
export async function memberForUser(user: User): Promise<Member> {
  const name = typeof user.user_metadata?.name === 'string' ? user.user_metadata.name.trim().slice(0,60) : '';
  // Display metadata is cosmetic. Role/ownership never come from user_metadata.
  const read = () => query<{id:string;username:string;name:string;moderator:boolean}>(
    "SELECT m.id,m.username,m.name,COALESCE(r.role IN ('admin','moderator'),false) AS moderator FROM knovera.members m LEFT JOIN knovera.account_roles r ON r.user_id=m.auth_user_id WHERE m.auth_user_id=$1", [user.id]);
  let result = await read();
  if (!result.rows.length) {
    await query('INSERT INTO knovera.members(id,username,name,auth_user_id) VALUES($1,$2,$3,$4) ON CONFLICT(auth_user_id) DO NOTHING', [user.id,`reader-${user.id}`,name || 'Reader',user.id]);
    result = await read();
  }
  return result.rows[0];
}
export async function accountOrders(user: User): Promise<Order[]> {
  if (!user.email_confirmed_at || !user.email || user.is_anonymous) return [];
  // Bind once to a verified identity. Future email changes cannot transfer ownership.
  await query(`INSERT INTO knovera.order_owners(order_id,user_id)
    SELECT id,$1 FROM knovera.orders WHERE lower(data->>'customerEmail')=$2 AND data->>'paymentStatus'='paid'
    ON CONFLICT(order_id) DO NOTHING`, [user.id,user.email.toLowerCase()]);
  const result = await query<{id:string;data:Omit<Order,'id'>}>(`SELECT o.id,o.data FROM knovera.orders o
    JOIN knovera.order_owners owner ON owner.order_id=o.id WHERE owner.user_id=$1 AND o.data->>'paymentStatus'='paid'
    ORDER BY o.data->>'createdAt' DESC`, [user.id]);
  return result.rows.map(row => ({id:row.id,...row.data}));
}
