'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '../../lib/store/cart';
import { 
  Search, 
  ShoppingCart, 
  BookOpen, 
  ChevronDown, 
  Barcode, 
  X,
  Library,
  Compass
} from 'lucide-react';

export default function Header() {
  const router = useRouter();
  const { cartCount } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/books?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/books');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#E8E4DA] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 py-3 sm:py-3.5 flex items-center justify-between gap-3 sm:gap-6">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-[#23584B] flex items-center justify-center text-white shadow-sm group-hover:bg-[#182A27] group-hover:scale-105 transition-all duration-300">
            <BookOpen className="w-5 h-5 text-emerald-300 group-hover:rotate-6 transition-transform duration-300" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif font-bold text-xl sm:text-2xl text-[#11252B] tracking-tight">
              Knovera
            </span>
          </div>
        </Link>

        {/* Categories Dropdown (BetterWorldBooks style) */}
        <div className="relative hidden lg:block">
          <button
            onClick={() => setIsCategoryOpen(!isCategoryOpen)}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-[#182A27] hover:text-[#23584B] rounded-md transition-colors"
          >
            <span>Categories</span>
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isCategoryOpen ? 'rotate-180' : ''}`} />
          </button>

          {isCategoryOpen && (
            <div 
              className="absolute left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-stone-200 py-2 z-50 animate-in fade-in slide-in-from-top-2"
              onMouseLeave={() => setIsCategoryOpen(false)}
            >
              <div className="px-3 py-1.5 text-xs font-bold text-stone-400 uppercase tracking-wider">
                Store Taxonomy
              </div>
              <Link 
                href="/books" 
                onClick={() => setIsCategoryOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-[#182A27] hover:bg-stone-50 font-medium"
              >
                <Compass className="w-4 h-4 text-emerald-700" />
                <span>All Books & Releases</span>
              </Link>
              <Link 
                href="/books?category=Productivity" 
                onClick={() => setIsCategoryOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-[#182A27] hover:bg-stone-50"
              >
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <span>Deep Work & Productivity</span>
              </Link>
              <Link 
                href="/books?category=Personal Growth" 
                onClick={() => setIsCategoryOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-[#182A27] hover:bg-stone-50"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Habit Systems & Growth</span>
              </Link>
              <Link 
                href="/books?category=Children %26 Family" 
                onClick={() => setIsCategoryOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-[#182A27] hover:bg-stone-50"
              >
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span>Children & Family Printables</span>
              </Link>
              <Link 
                href="/books?category=Bundles" 
                onClick={() => setIsCategoryOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-[#182A27] hover:bg-stone-50"
              >
                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                <span>Box Sets & Bundles</span>
              </Link>
            </div>
          )}
        </div>

        {/* Search Bar (Exact BetterWorldBooks input + barcode icon + search button) */}
        <form 
          onSubmit={handleSearchSubmit} 
          className="flex-1 max-w-2xl relative flex items-center"
        >
          <div className="relative w-full flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Title, Author, Topic, or ISBN..."
              className="w-full pl-3.5 pr-20 py-2 sm:py-2.5 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded-md focus:bg-white focus:outline-hidden focus:border-[#23584B] focus:ring-2 focus:ring-[#23584B]/20 transition-all text-[#182A27] placeholder-stone-400"
            />
            
            {/* Clear input button */}
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-14 text-stone-400 hover:text-stone-600 p-1"
                title="Clear query"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Barcode/ISBN indicator icon (BetterWorldBooks hallmark) */}
            <div className="hidden sm:flex items-center px-2 text-stone-400 border-l border-stone-200 absolute right-10">
              <span title="ISBN lookup supported"><Barcode className="w-4 h-4 text-stone-400" /></span>
            </div>

            {/* Search trigger button */}
            <button
              type="submit"
              className="absolute right-1 top-1 bottom-1 px-3 bg-[#008bd2] hover:bg-[#0077b5] text-white rounded flex items-center justify-center transition-colors shadow-xs"
              title="Search store"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Right Actions: Library, Admin, Cart */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          
          {/* Reader Library & Recovery */}
          <Link
            href="/account/library"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs sm:text-sm font-medium text-[#182A27] hover:text-[#23584B] rounded-md transition-colors"
            title="Access your purchased books"
          >
            <Library className="w-4 h-4 text-[#23584B]" />
            <span className="hidden sm:inline">My Library</span>
          </Link>

          {/* Cart Icon & Badge */}
          <Link
            href="/cart"
            className="relative flex items-center justify-center p-2 rounded-md hover:bg-stone-100 text-[#182A27] transition-colors"
            aria-label="Shopping Cart"
          >
            <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-[#182A27]" />
            {cartCount > 0 ? (
              <span className="absolute -top-1 -right-1 bg-[#0284C7] text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-xs shadow-sky-500/40 animate-in zoom-in-50">
                {cartCount}
              </span>
            ) : (
              <span className="absolute -top-1 -right-1 bg-stone-200 text-stone-600 text-[10px] font-semibold w-4 h-4 rounded-full flex items-center justify-center">
                0
              </span>
            )}
          </Link>
        </div>

      </div>
    </header>
  );
}
