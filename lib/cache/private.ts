'use client';
import { browserAuth } from '../auth/browser';
import { accountScope, browserReads, changeAccount, currentAccountId } from './browser';
import { resourceKey } from './memory';

export async function privateRead<T>(resource: string, freshFor: number, load: () => Promise<T>) {
  // getSession is used ONLY to partition local display data. APIs verify identity.
  const { data, error } = await browserAuth().auth.getSession();
  if (error) throw error;
  const id = data.session?.user.id || null;
  if (currentAccountId() === undefined) changeAccount(id);
  if (currentAccountId() !== id) throw new DOMException('Account changed', 'AbortError');
  const key = `${resourceKey(resource)}|${accountScope()}`;
  return browserReads.read(key, load, freshFor);
}
