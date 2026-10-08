'use client';

import React from 'react';
import Link from 'next/link';
import { Book } from '../../lib/types';
import { useCart } from '../../lib/store/cart';
import { Heart, Star, BookOpen, Smartphone, ShoppingCart, Eye } from 'lucide-react';

interface BookCardProps {
  book: Book;
}

export default function BookCard({ book }: BookCardProps) {
  const { addToCart, toggleWishlist, isWishlisted } = useCart();
  const wishlisted = isWishlisted(book.id);

  const dollars = Math.floor(book.price / 100);
  const cents = (book.price % 100).toString().padStart(2, '0');

  const origDollars = book.originalPrice ? Math.floor(book.originalPrice / 100) : null;
  const origCents = book.originalPrice ? (book.originalPrice % 100).toString().padStart(2, '0') : null;

  return (
    <div className="group bg-white rounded-xl border border-stone-200 hover:border-sky-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden relative">
      
      {/* Top badges and Wishlist button */}
      <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1">
        {book.badge && (
          <span className="bg-[#0284C7] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs tracking-wider uppercase">
            {book.badge}
          </span>
        )}
      </div>

      <button
        onClick={() => toggleWishlist(book.id)}
        className={`absolute top-2.5 right-2.5 z-10 p-1.5 rounded-full bg-white/90 shadow-xs transition-colors ${
          wishlisted ? 'text-rose-600 bg-rose-50' : 'text-stone-400 hover:text-rose-500'
        }`}
        aria-label="Save to Wishlist"
      >
        <Heart className={`w-4 h-4 ${wishlisted ? 'fill-current' : ''}`} />
      </button>

      {/* Book Cover Container with object-fit: contain (preserving full cover without cropping) */}
      <Link href={`/books/${book.slug}`} className="block relative bg-stone-100 p-4 pt-6 flex items-center justify-center overflow-hidden">
        <div className="relative w-36 h-52 sm:w-40 sm:h-56 transition-transform duration-300 group-hover:scale-103 shadow-md rounded overflow-hidden">
          <img
            src={book.coverImage}
            alt={book.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      </Link>

      {/* Book Details */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          {/* Format / Condition tag (BetterWorldBooks standard) */}
          <div className="flex items-center justify-between text-[11px] text-[#23584B] font-semibold mb-1">
            <span className="truncate">{book.conditionLabel}</span>
            <div className="flex items-center gap-1 text-stone-400">
              <span title="E-Reader / Phone / Tablet compatible"><Smartphone className="w-3.5 h-3.5" /></span>
              <span title="Reflowable EPUB / PDF included"><BookOpen className="w-3.5 h-3.5" /></span>
            </div>
          </div>

          {/* Title */}
          <Link href={`/books/${book.slug}`}>
            <h3 className="font-serif font-bold text-base text-[#182A27] line-clamp-2 hover:text-[#008bd2] transition-colors leading-snug">
              {book.title}
            </h3>
          </Link>

          {/* Author */}
          <p className="text-xs text-stone-500 mt-1">by {book.author}</p>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mt-2">
            <div className="flex text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${i < Math.floor(book.rating) ? 'fill-current' : 'text-stone-300'}`}
                />
              ))}
            </div>
            <span className="text-[11px] font-medium text-stone-500">
              {book.rating} ({book.reviewCount})
            </span>
          </div>
        </div>

        {/* Pricing and Actions */}
        <div className="mt-4 pt-3 border-t border-stone-100">
          <div className="flex items-baseline justify-between mb-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-[#182A27]">
                ${dollars}
                <sup className="text-xs font-semibold">{cents}</sup>
              </span>
              {book.originalPrice && (
                <span className="text-xs text-stone-400 line-through">
                  ${origDollars}.{origCents}
                </span>
              )}
            </div>

            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
              Direct Price
            </span>
          </div>

          {/* Dual Action Buttons: Add to Cart (Blue) and Read Sample */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => addToCart(book)}
              className="w-full py-2 px-2.5 bg-[#008bd2] hover:bg-[#0077b5] text-white text-xs font-bold rounded flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Add to Cart</span>
            </button>

            <Link
              href={`/samples/${book.slug}`}
              className="w-full py-2 px-2.5 border border-stone-300 hover:border-stone-400 bg-stone-50 hover:bg-stone-100 text-[#182A27] text-xs font-semibold rounded flex items-center justify-center gap-1 transition-colors"
            >
              <Eye className="w-3.5 h-3.5 text-stone-500" />
              <span>Sample</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
