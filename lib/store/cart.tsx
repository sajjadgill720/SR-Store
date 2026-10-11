'use client';
import { createContext, useContext, useState } from 'react';
import type { Book, CartItem } from '../types';
import { formatsLabel } from '../catalog';
import { useShoppingState, updateShopping } from './shopping';
interface CartContextType {
    items: CartItem[];
    cartCount: number;
    cartTotal: number;
    storageError: string;
    addToCart: (book: Book, format?: string) => void;
    removeFromCart: (bookId: string) => void;
    updateQuantity: (bookId: string, quantity: number) => void;
    clearCart: () => void;
    wishlist: string[];
    toggleWishlist: (bookId: string) => void;
    isWishlisted: (bookId: string) => boolean;
    modalItem: CartItem | null;
    isModalOpen: boolean;
    closeModal: () => void;
    openCartDrawer: boolean;
    setOpenCartDrawer: (open: boolean) => void;
}
const CartContext = createContext<CartContextType | undefined>(undefined);
export function CartProvider({ children }: {
    children: React.ReactNode;
}) {
    const { items, wishlist, storageError } = useShoppingState();
    const [modalItem, setModalItem] = useState<CartItem | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [openCartDrawer, setOpenCartDrawer] = useState(false);
    const addToCart = (book: Book, format = formatsLabel(book.formats)) => {
        const next = updateShopping(previous => {
            const existing = previous.items.find(item => item.bookId === book.id);
            const item: CartItem = existing ? { ...existing, quantity: Math.min(existing.quantity + 1, 99) } : { bookId: book.id, title: book.title, slug: book.slug, author: book.author, coverImage: book.coverImage, price: book.price, formatSelected: format, quantity: 1 };
            return { ...previous, items: existing ? previous.items.map(value => value.bookId === book.id ? item : value) : [...previous.items, item] };
        });
        setModalItem(next.items.find(item => item.bookId === book.id)!);
        setIsModalOpen(true);
    };
    const removeFromCart = (id: string) => updateShopping(previous => ({ ...previous, items: previous.items.filter(item => item.bookId !== id) }));
    const updateQuantity = (id: string, quantity: number) => { if (!Number.isSafeInteger(quantity))
        return; if (quantity <= 0) {
        removeFromCart(id);
        return;
    } updateShopping(previous => ({ ...previous, items: previous.items.map(item => item.bookId === id ? { ...item, quantity: Math.min(quantity, 99) } : item) })); };
    const clearCart = () => { updateShopping(previous => ({ ...previous, items: [] })); };
    const toggleWishlist = (id: string) => { updateShopping(previous => ({ ...previous, wishlist: previous.wishlist.includes(id) ? previous.wishlist.filter(value => value !== id) : [...previous.wishlist, id] })); };
    return <CartContext.Provider value={{ items, wishlist, storageError, cartCount: items.reduce((sum, item) => sum + item.quantity, 0), cartTotal: items.reduce((sum, item) => sum + item.quantity * item.price, 0), addToCart, removeFromCart, updateQuantity, clearCart, toggleWishlist, isWishlisted: id => wishlist.includes(id), modalItem, isModalOpen, closeModal: () => setIsModalOpen(false), openCartDrawer, setOpenCartDrawer }}>{children}</CartContext.Provider>;
}
export function useCart() { const context = useContext(CartContext); if (!context)
    throw new Error('useCart must be used within CartProvider'); return context; }
