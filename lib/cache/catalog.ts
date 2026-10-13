import type { Book, BundleOffer } from '../types';

export type CatalogSnapshot = {version:string; books:Book[]; bundles:BundleOffer[]};
export const CATALOG_STORAGE_KEY = 'knovera:public-catalog:v1';
type Storage = Pick<globalThis.Storage, 'getItem' | 'setItem'>;
const valid = (value: unknown): value is CatalogSnapshot => {
  if (!value || typeof value !== 'object') return false;
  const data = value as CatalogSnapshot;
  const book = (b:Book) => b && typeof b.id === 'string' && typeof b.slug === 'string' && typeof b.title === 'string'
    && typeof b.price === 'number' && b.isPublished === true && Array.isArray(b.formats)
    && Array.isArray(b.tableOfContents) && Array.isArray(b.whatsIncluded) && typeof b.targetAudience === 'string'
    && b.currentEdition && Array.isArray(b.currentEdition.assets) && b.currentEdition.assets.length === 0;
  return typeof data.version === 'string' && /^\d+$/.test(data.version) && Array.isArray(data.books)
    && data.books.every(book) && Array.isArray(data.bundles)
    && data.bundles.every(b => typeof b.slug === 'string' && Array.isArray(b.books) && b.books.every(book));
};

// Public metadata only. Private account data and signed URLs never enter this store.
export function createCatalogCache(storage: () => Storage, request: typeof fetch = fetch) {
  let state: {data:CatalogSnapshot|null; error:string|null} = {data:null,error:null};
  let hydrated = false;
  let pending: Promise<void> | null = null;
  const listeners = new Set<() => void>();
  const emit = () => listeners.forEach(listener => listener());
  const hydrate = () => {
    if (hydrated) return;
    hydrated = true;
    try {
      const saved:unknown = JSON.parse(storage().getItem(CATALOG_STORAGE_KEY) || 'null');
      if (valid(saved)) { state = {data:saved,error:null}; emit(); }
    } catch { /* Unavailable or corrupt storage falls back to a network read. */ }
  };
  async function json(url:string) {
    const response = await request(url, {cache:'no-store',credentials:'omit'});
    if (!response.ok) throw new Error('Catalog request failed');
    return response.json();
  }
  return {
    getSnapshot: () => state,
    subscribe: (listener:() => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; },
    hydrate,
    refresh() {
      hydrate();
      if (pending) return pending;
      pending = (async () => {
        try {
          const version = state.data ? (await json('/api/catalog/version')).version : null;
          if (!state.data || version !== state.data.version) {
            const fresh:unknown = await json('/api/catalog');
            if (!valid(fresh)) throw new Error('Invalid catalog');
            state = {data:fresh,error:null};
            try { storage().setItem(CATALOG_STORAGE_KEY,JSON.stringify(fresh)); }
            catch { /* Quota/private mode: keep the working in-memory copy. */ }
          } else state = {...state,error:null};
        } catch {
          state = {...state,error:state.data ? 'Showing saved books. Updates will resume when the connection returns.' : 'The collection is temporarily unavailable. Please try again.'};
        } finally { pending = null; emit(); }
      })();
      return pending;
    },
  };
}
