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
    <div className="book-card group bg-white rounded-2xl border border-stone-100 hover:border-sky-200/80 hover:shadow-xl hover:shadow-sky-900/5 transition-all duration-400 flex flex-col justify-between overflow-hidden relative card-hover">
      
      {/* Top badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
        {book.badge && (
          <span className="bg-gradient-to-r from-[#0369A1] to-[#0E7490] text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-md tracking-wider uppercase">
            {book.badge}
          </span>
        )}
      </div>

      {/* Wishlist */}
      <button
        onClick={() => toggleWishlist(book.id)}
        className={`absolute top-3 right-3 z-10 p-2 rounded-full glass shadow-sm transition-all duration-300 ${
          wishlisted 
            ? 'text-rose-500 bg-rose-50/90 scale-110' 
            : 'text-stone-400 hover:text-rose-500 hover:scale-110'
        }`}
        aria-label={wishlisted ? `Remove ${book.title} from wishlist` : `Save ${book.title} to wishlist`}
        aria-pressed={wishlisted}
      >
        <Heart className={`w-4 h-4 ${wishlisted ? 'fill-current' : ''}`} />
      </button>

      {/* Book Cover */}
      <Link href={`/books/${book.slug}`} className="block relative bg-gradient-to-b from-stone-50 to-stone-100/50 p-5 pt-7 flex items-center justify-center overflow-hidden">
        <div className="relative w-36 h-52 sm:w-40 sm:h-56 transition-all duration-500 group-hover:scale-105 group-hover:-translate-y-1 shadow-lg group-hover:shadow-xl rounded-lg overflow-hidden">
          <img
            src={book.coverImage}
            alt={book.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 flex items-end justify-center pb-3">
            <span className="text-white text-xs font-semibold px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/20">
              Quick View
            </span>
          </div>
        </div>
      </Link>

      {/* Details */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between">
        <div>
          {/* Format tag */}
          <div className="flex items-center justify-between text-[11px] text-[#1A4D3E] font-semibold mb-1.5">
            <span className="truncate">{book.conditionLabel}</span>
            <div className="flex items-center gap-1 text-stone-400">
              <span title="E-Reader compatible"><Smartphone className="w-3.5 h-3.5" /></span>
              <span title="EPUB/PDF included"><BookOpen className="w-3.5 h-3.5" /></span>
            </div>
          </div>

          {/* Title */}
          <Link href={`/books/${book.slug}`}>
            <h3 className="font-serif font-bold text-base text-[#0F1D2F] line-clamp-2 hover:text-[#0369A1] transition-colors leading-snug">
              {book.title}
            </h3>
          </Link>

          {/* Author */}
          <p className="text-xs text-[#718096] mt-1.5">by {book.author}</p>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mt-2.5">
            <div className="flex text-sky-400">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${i < Math.floor(book.rating) ? 'fill-current' : 'text-stone-200'}`}
                />
              ))}
            </div>
            <span className="text-[11px] font-medium text-[#718096]">
              {book.rating} ({book.reviewCount})
            </span>
          </div>
        </div>

        {/* Pricing and Actions */}
        <div className="mt-4 pt-3 border-t border-stone-100">
          <div className="flex items-baseline justify-between mb-3">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-[#0F1D2F]">
                ${dollars}
                <sup className="text-xs font-semibold">{cents}</sup>
              </span>
              {book.originalPrice && (
                <span className="text-xs text-[#718096] line-through">
                  ${origDollars}.{origCents}
                </span>
              )}
            </div>

            <span className="text-[10px] font-semibold text-[#1A4D3E] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
              Best Price
            </span>
          </div>

          {/* Dual Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => addToCart(book)}
              className="w-full py-2.5 px-2.5 bg-gradient-to-r from-[#0369A1] to-[#0E7490] hover:from-[#075985] hover:to-[#0C6882] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all duration-300 shadow-md shadow-sky-700/15 hover:shadow-lg hover:-translate-y-0.5"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Add to Cart</span>
            </button>

            <Link
              href={`/samples/${book.slug}`}
              className="w-full py-2.5 px-2.5 border border-stone-200 hover:border-stone-300 bg-white hover:bg-stone-50 text-[#0F1D2F] text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all duration-200"
            >
              <Eye className="w-3.5 h-3.5 text-[#718096]" />
              <span>Preview</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
