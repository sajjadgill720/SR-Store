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
  X,
  Library,
  Compass,
  Sparkles,
  Menu,
  ArrowRight
} from 'lucide-react';

export default function Header() {
  const router = useRouter();
  const { cartCount } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/books?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/books');
    }
  };

  const categories = [
    { label: 'All Books & Releases', href: '/books', icon: Compass, color: 'text-[#1A4D3E]' },
    { label: 'Deep Work & Productivity', href: '/books?category=Productivity', dot: 'bg-sky-500' },
    { label: 'Habit Systems & Growth', href: '/books?category=Personal Growth', dot: 'bg-emerald-500' },
    { label: 'Children & Family Printables', href: '/books?category=Children %26 Family', dot: 'bg-amber-500' },
    { label: 'Box Sets & Bundles', href: '/books?category=Bundles', dot: 'bg-violet-500' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-[#E8E4DA]/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="max-w-7xl mx-auto px-4 py-3 sm:py-3.5 flex items-center justify-between gap-3 sm:gap-6">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#1A4D3E] to-[#0F1D2F] flex items-center justify-center text-white shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105">
            <BookOpen className="w-5 h-5 text-emerald-300 group-hover:rotate-6 transition-transform duration-300" />
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-amber-400 border-2 border-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
          <div className="flex flex-col">
            <span className="font-serif font-bold text-xl sm:text-2xl text-[#0F1D2F] tracking-tight">
              Knovera
            </span>
            <span className="text-[9px] font-medium text-[#718096] tracking-[0.2em] uppercase -mt-0.5 hidden sm:block">
              Book Studio
            </span>
          </div>
        </Link>

        {/* Categories Dropdown */}
        <div className="relative hidden lg:block">
          <button
            onClick={() => setIsCategoryOpen(!isCategoryOpen)}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
              isCategoryOpen 
                ? 'text-[#0369A1] bg-sky-50' 
                : 'text-[#0F1D2F] hover:text-[#0369A1] hover:bg-stone-50'
            }`}
          >
            <span>Explore</span>
            <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isCategoryOpen ? 'rotate-180' : ''}`} />
          </button>

          {isCategoryOpen && (
            <div 
              className="absolute left-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-stone-100 py-2 z-50 animate-fade-in-down"
              onMouseLeave={() => setIsCategoryOpen(false)}
            >
              <div className="px-4 py-2 text-[10px] font-bold text-[#718096] uppercase tracking-[0.15em]">
                Browse Collection
              </div>
              {categories.map((cat) => (
                <Link
                  key={cat.href}
                  href={cat.href}
                  onClick={() => setIsCategoryOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#0F1D2F] hover:bg-stone-50 font-medium transition-colors group"
                >
                  {cat.icon ? (
                    <cat.icon className={`w-4 h-4 ${cat.color}`} />
                  ) : (
                    <span className={`w-2.5 h-2.5 rounded-full ${cat.dot} group-hover:scale-125 transition-transform`}></span>
                  )}
                  <span>{cat.label}</span>
                </Link>
              ))}
              <div className="border-t border-stone-100 mt-1 pt-1">
                <Link
                  href="/bundles"
                  onClick={() => setIsCategoryOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#0369A1] hover:bg-sky-50 font-semibold transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Special Bundles & Offers</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-auto" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Search Bar */}
        <form 
          onSubmit={handleSearchSubmit} 
          className="flex-1 max-w-xl relative flex items-center"
        >
          <div className="relative w-full flex items-center group">
            <div className="absolute left-3 text-stone-400 group-focus-within:text-[#0369A1] transition-colors">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search titles, authors, topics..."
              className="w-full pl-10 pr-10 py-2.5 text-sm bg-stone-50/80 border border-stone-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-[#0369A1] focus:ring-2 focus:ring-[#0369A1]/10 transition-all text-[#0F1D2F] placeholder-stone-400"
            />
            
            {/* Clear input */}
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 text-stone-400 hover:text-stone-600 p-0.5 rounded-full hover:bg-stone-100 transition-colors"
                title="Clear"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </form>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          
          {/* Reader Library */}
          <Link
            href="/account/library"
            className="flex items-center gap-1.5 px-2.5 py-2 text-sm font-medium text-[#0F1D2F] hover:text-[#0369A1] hover:bg-stone-50 rounded-lg transition-all duration-200"
            title="Access your purchased books"
          >
            <Library className="w-4.5 h-4.5 text-[#1A4D3E]" />
            <span className="hidden sm:inline">My Library</span>
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-stone-100 text-[#0F1D2F] transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Cart */}
          <Link
            href="/cart"
            className="relative flex items-center justify-center p-2 rounded-lg hover:bg-stone-50 text-[#0F1D2F] transition-all duration-200 group"
            aria-label="Shopping Cart"
          >
            <ShoppingCart className="w-5 h-5 sm:w-5.5 sm:h-5.5 text-[#0F1D2F] group-hover:text-[#0369A1] transition-colors" />
            {cartCount > 0 ? (
              <span className="absolute -top-0.5 -right-0.5 bg-[#0369A1] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md ring-2 ring-white animate-scale-in">
                {cartCount}
              </span>
            ) : (
              <span className="absolute -top-0.5 -right-0.5 bg-stone-200 text-stone-500 text-[9px] font-semibold w-4 h-4 rounded-full flex items-center justify-center">
                0
              </span>
            )}
          </Link>
        </div>

      </div>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-stone-100 bg-white animate-fade-in-down">
          <nav className="max-w-7xl mx-auto px-4 py-3 space-y-1">
            {categories.map((cat) => (
              <Link
                key={cat.href}
                href={cat.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-[#0F1D2F] hover:bg-stone-50 rounded-lg font-medium"
              >
                {cat.icon ? (
                  <cat.icon className={`w-4 h-4 ${cat.color}`} />
                ) : (
                  <span className={`w-2 h-2 rounded-full ${cat.dot}`}></span>
                )}
                <span>{cat.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
