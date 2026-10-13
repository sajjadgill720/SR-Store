'use client';
import { useSyncExternalStore } from 'react';
const event = 'knovera:search-changed';
function subscribe(listener:()=>void) {
  window.addEventListener('popstate',listener);
  window.addEventListener(event,listener);
  return () => {window.removeEventListener('popstate',listener);window.removeEventListener(event,listener);};
}
// Query preferences enhance the canonical HTML after hydration without causing
// useSearchParams to replace the prerendered catalog with a Suspense fallback.
export function useBrowserSearch() {
  return new URLSearchParams(useSyncExternalStore(subscribe,()=>window.location.search,()=>''));
}
export function replaceCatalogSearch(url:string) {
  window.history.replaceState(null,'',url);
  window.dispatchEvent(new Event(event));
}
