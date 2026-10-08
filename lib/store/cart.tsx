'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Book, CartItem } from '../types';

interface CartContextType {
  items: CartItem[];
  cartCount: number;
  cartTotal: number;
  addToCart: (book: Book, format?: string) => void;
  removeFromCart: (bookId: string) => void;
  updateQuantity: (bookId: string, quantity: number) => void;
  clearCart: () => void;
  // Wishlist
  wishlist: string[];
  toggleWishlist: (bookId: string) => void;
  isWishlisted: (bookId: string) => boolean;
  // Add to Cart Modal (BetterWorldBooks interactive popup)
  modalItem: CartItem | null;
  isModalOpen: boolean;
  closeModal: () => void;
  openCartDrawer: boolean;
  setOpenCartDrawer: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [modalItem, setModalItem] = useState<CartItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openCartDrawer, setOpenCartDrawer] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('sr_store_cart');
      if (savedCart) setItems(JSON.parse(savedCart));

      const savedWishlist = localStorage.getItem('sr_store_wishlist');
      if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
    } catch (e) {
      console.error('Failed to load cart/wishlist', e);
    }
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('sr_store_cart', JSON.stringify(items));
    } catch (e) {}
  }, [items]);

  useEffect(() => {
    try {
      localStorage.setItem('sr_store_wishlist', JSON.stringify(wishlist));
    } catch (e) {}
  }, [wishlist]);

  const addToCart = (book: Book, format: string = 'Digital Master (EPUB + PDF)') => {
    const existingIndex = items.findIndex((i) => i.bookId === book.id);
    let addedItem: CartItem;

    if (existingIndex > -1) {
      const updated = [...items];
      updated[existingIndex].quantity += 1;
      setItems(updated);
      addedItem = updated[existingIndex];
    } else {
      addedItem = {
        bookId: book.id,
        title: book.title,
        slug: book.slug,
        author: book.author,
        coverImage: book.coverImage,
        price: book.price,
        formatSelected: format,
        quantity: 1
      };
      setItems((prev) => [...prev, addedItem]);
    }

    // Trigger BetterWorldBooks-style confirmation modal
    setModalItem(addedItem);
    setIsModalOpen(true);
  };

  const removeFromCart = (bookId: string) => {
    setItems((prev) => prev.filter((i) => i.bookId !== bookId));
  };

  const updateQuantity = (bookId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(bookId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.bookId === bookId ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const toggleWishlist = (bookId: string) => {
    setWishlist((prev) =>
      prev.includes(bookId) ? prev.filter((id) => id !== bookId) : [...prev, bookId]
    );
  };

  const isWishlisted = (bookId: string) => wishlist.includes(bookId);

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        cartCount,
        cartTotal,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        wishlist,
        toggleWishlist,
        isWishlisted,
        modalItem,
        isModalOpen,
        closeModal,
        openCartDrawer,
        setOpenCartDrawer
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
