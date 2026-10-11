'use client';
import { useSyncExternalStore } from 'react';
import type { CartItem } from '../types';
export interface ShoppingState {
    items: CartItem[];
    wishlist: string[];
    storageError: string;
}
const empty: ShoppingState = { items: [], wishlist: [], storageError: '' };
let snapshot = empty;
let initialized = false;
const listeners = new Set<() => void>();
export function validateCart(value: unknown): CartItem[] {
    if (!Array.isArray(value))
        return [];
    return value.filter((item): item is CartItem => !!item && typeof item === 'object' &&
        ['bookId', 'title', 'slug', 'author', 'coverImage', 'formatSelected'].every(key => typeof item[key] === 'string') &&
        Number.isSafeInteger(item.price) && item.price >= 0 && Number.isSafeInteger(item.quantity) && item.quantity > 0 && item.quantity <= 99).slice(0, 100);
}
function read() {
    let storageError = '';
    const parse = (key: string) => { try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : [];
    }
    catch {
        storageError = 'Device storage could not be loaded. Your activity may not persist in this browser.';
        return [];
    } };
    const items = validateCart(parse('sr_store_cart'));
    const wishlist = parse('sr_store_wishlist');
    snapshot = { items, wishlist: Array.isArray(wishlist) ? [...new Set(wishlist.filter((id): id is string => typeof id === 'string'))].slice(0, 100) : [], storageError };
}
function subscribe(listener: () => void) {
    listeners.add(listener);
    const onStorage = (event: StorageEvent) => { if (event.key === null || ['sr_store_cart', 'sr_store_wishlist'].includes(event.key)) {
        read();
        listeners.forEach(fn => fn());
    } };
    window.addEventListener('storage', onStorage);
    return () => { listeners.delete(listener); window.removeEventListener('storage', onStorage); };
}
function getSnapshot() { if (!initialized) {
    read();
    initialized = true;
} return snapshot; }
export function useShoppingState() { return useSyncExternalStore(subscribe, getSnapshot, () => empty); }
export function updateShopping(update: (previous: ShoppingState) => ShoppingState): ShoppingState {
    const previous = getSnapshot();
    const next = update(previous);
    try {
        if (next.items !== previous.items)
            localStorage.setItem('sr_store_cart', JSON.stringify(next.items));
        if (next.wishlist !== previous.wishlist)
            localStorage.setItem('sr_store_wishlist', JSON.stringify(next.wishlist));
        snapshot = { ...next, storageError: '' };
    }
    catch {
        snapshot = { ...next, storageError: 'This change is available for this visit, but could not be saved on your device.' };
    }
    listeners.forEach(fn => fn());
    return snapshot;
}
