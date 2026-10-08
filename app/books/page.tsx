'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { BOOKS_DATA } from '../../lib/data/books';
import { Book } from '../../lib/types';
import BookCard from '../../components/books/BookCard';
import { Filter, SlidersHorizontal, Search, RotateCcw } from 'lucide-react';

function BooksCatalogContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';
  const initialQuery = searchParams.get('q') || '';

  const [books, setBooks] = useState<Book[]>(BOOKS_DATA);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedFormat, setSelectedFormat] = useState('All');
  const [sortBy, setSortBy] = useState('featured');
  const [inStockOnly, setInStockOnly] = useState(true);
  const [searchQuery, setSearchQuery] = useState(initialQuery);

  useEffect(() => {
    fetch('/api/books')
      .then((res) => res.json())
      .then((data) => {
        if (data.books && Array.isArray(data.books)) {
          setBooks(data.books);
        }
      })
      .catch((err) => console.error('Failed to load books catalog:', err));
  }, []);

  const dynamicCategories = useMemo(() => {
    const set = new Set<string>(['All', 'Productivity', 'Personal Growth', 'Children & Family']);
    books.forEach((b) => {
      if (b.category) set.add(b.category);
    });
    set.add('Bundles');
    return Array.from(set);
  }, [books]);

  const categories = dynamicCategories;
  const formats = ['All', 'epub', 'pdf', 'printable_pdf'];

  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      // Category filter
      if (selectedCategory !== 'All') {
        if (selectedCategory === 'Bundles') {
          if (book.productType !== 'bundle') return false;
        } else if (book.category !== selectedCategory) {
          return false;
        }
      }

      // Format filter
      if (selectedFormat !== 'All') {
        if (!book.formats.includes(selectedFormat as any)) return false;
      }

      // In stock filter (BetterWorldBooks feature)
      if (inStockOnly && !book.isInStock) {
        return false;
      }

      // Query search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = book.title.toLowerCase().includes(q);
        const matchAuthor = book.author.toLowerCase().includes(q);
        const matchDesc = book.shortDescription.toLowerCase().includes(q);
        const matchIsbn = book.isbn ? book.isbn.toLowerCase().includes(q) : false;
        if (!matchTitle && !matchAuthor && !matchDesc && !matchIsbn) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'popular') return b.reviewCount - a.reviewCount;
      return 0; // featured default
    });
  }, [selectedCategory, selectedFormat, inStockOnly, searchQuery, sortBy]);

  const resetFilters = () => {
    setSelectedCategory('All');
    setSelectedFormat('All');
    setSortBy('featured');
    setInStockOnly(true);
    setSearchQuery('');
  };

  return (
    <div className="py-8 sm:py-12 max-w-7xl mx-auto px-4">
      
      {/* Title & Header */}
      <div className="mb-6">
        <h1 className="font-serif text-2xl sm:text-4xl font-bold text-[#182A27]">
          Published Books & Digital Packs
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          Showing {filteredBooks.length} titles available for instant DRM-free download.
        </p>
      </div>

      {/* Pill-Style Filter Chips (BetterWorldBooks Filter Bar) */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs mb-8 flex flex-wrap items-center justify-between gap-4">
        
        {/* Left Filter Controls */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          
          {/* Category Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider hidden sm:inline">
              Category:
            </span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded-md px-2.5 py-1.5 font-medium text-[#182A27] focus:outline-hidden focus:border-[#23584B]"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>
              ))}
            </select>
          </div>

          {/* Format Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider hidden sm:inline">
              Format:
            </span>
            <select
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
              className="text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded-md px-2.5 py-1.5 font-medium text-[#182A27] focus:outline-hidden focus:border-[#23584B]"
            >
              <option value="All">All Formats</option>
              <option value="epub">Reflowable EPUB</option>
              <option value="pdf">Typeset PDF</option>
              <option value="printable_pdf">Printable 300 DPI</option>
            </select>
          </div>

          {/* BetterWorldBooks "In stock" Toggle Switch */}
          <label className="flex items-center gap-2 cursor-pointer bg-stone-50 border border-stone-300 px-3 py-1.5 rounded-md hover:bg-stone-100 transition-colors">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="w-4 h-4 text-[#23584B] rounded border-stone-300 focus:ring-[#23584B]"
            />
            <span className="text-xs font-bold text-[#182A27]">In stock only</span>
          </label>

          {(selectedCategory !== 'All' || selectedFormat !== 'All' || searchQuery) && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-800 font-semibold px-2 py-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}

        </div>

        {/* Right Sort Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
            Sort by:
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded-md px-2.5 py-1.5 font-medium text-[#182A27] focus:outline-hidden focus:border-[#23584B]"
          >
            <option value="featured">Featured Picks</option>
            <option value="popular">Most Reviewed</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="title">Title (A-Z)</option>
          </select>
        </div>

      </div>

      {/* Book Grid */}
      {filteredBooks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredBooks.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl border border-stone-200 p-8">
          <Search className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="font-serif text-xl font-bold text-[#182A27]">
            No matching books found
          </h3>
          <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto mt-1 mb-4">
            We couldn't find any titles matching your selected filters. Try resetting the filters or modifying your query.
          </p>
          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-[#23584B] text-white text-xs font-bold rounded hover:bg-[#182A27] transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      )}

    </div>
  );
}

export default function BooksPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-stone-500">Loading catalog...</div>}>
      <BooksCatalogContent />
    </Suspense>
  );
}
