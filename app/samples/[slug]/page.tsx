'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { getBookBySlug } from '../../../lib/data/books';
import { Book } from '../../../lib/types';
import { useCart } from '../../../lib/store/cart';
import { 
  BookOpen, 
  ChevronLeft, 
  ShoppingCart, 
  Eye, 
  Type, 
  Sun, 
  Moon, 
  Coffee,
  RefreshCw 
} from 'lucide-react';

function SampleExcerptContent() {
  const params = useParams();
  const slug = params?.slug as string;

  const [book, setBook] = useState<Book | null>(() => getBookBySlug(slug) || null);
  const [loading, setLoading] = useState<boolean>(!book);

  useEffect(() => {
    if (!book && slug) {
      fetch(`/api/books?slug=${encodeURIComponent(slug)}`)
        .then((res) => {
          if (!res.ok) throw new Error('Not found');
          return res.json();
        })
        .then((data) => {
          if (data.book) setBook(data.book);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [slug, book]);

  const { addToCart } = useCart();
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [theme, setTheme] = useState<'paper' | 'white' | 'sepia' | 'dark'>('paper');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-stone-500 font-sans">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-[#23584B]" />
        <span>Loading sample excerpt...</span>
      </div>
    );
  }

  if (!book) {
    return notFound();
  }

  const themeClasses = {
    paper: 'bg-[#FDFBF7] text-[#182A27]',
    white: 'bg-white text-stone-900',
    sepia: 'bg-[#F4ECD8] text-[#3D332A]',
    dark: 'bg-[#182A27] text-stone-200'
  };

  const fontSizeClasses = {
    normal: 'text-base sm:text-lg leading-relaxed',
    large: 'text-lg sm:text-xl leading-relaxed',
    xlarge: 'text-xl sm:text-2xl leading-loose'
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${themeClasses[theme]}`}>
      
      {/* Top Floating Control Bar */}
      <div className="sticky top-0 z-30 border-b border-stone-200/50 backdrop-blur-md px-4 py-3 flex items-center justify-between max-w-4xl mx-auto">
        <Link
          href={`/books/${book.slug}`}
          className="flex items-center gap-1.5 text-xs font-bold text-[#008bd2] hover:underline"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Book Page</span>
        </Link>

        {/* Reader Customization (Font size & Palette) */}
        <div className="flex items-center gap-4 text-xs">
          {/* Font Size Toggle */}
          <div className="flex items-center gap-1 bg-black/5 rounded-md p-1">
            <button
              onClick={() => setFontSize('normal')}
              className={`px-2 py-0.5 rounded ${fontSize === 'normal' ? 'bg-white shadow-xs font-bold' : ''}`}
            >
              A
            </button>
            <button
              onClick={() => setFontSize('large')}
              className={`px-2 py-0.5 rounded text-sm ${fontSize === 'large' ? 'bg-white shadow-xs font-bold' : ''}`}
            >
              A+
            </button>
            <button
              onClick={() => setFontSize('xlarge')}
              className={`px-2 py-0.5 rounded text-base ${fontSize === 'xlarge' ? 'bg-white shadow-xs font-bold' : ''}`}
            >
              A++
            </button>
          </div>

          {/* Theme Toggle */}
          <div className="flex items-center gap-1 bg-black/5 rounded-md p-1">
            <button
              onClick={() => setTheme('paper')}
              className={`p-1 rounded ${theme === 'paper' ? 'bg-white shadow-xs' : ''}`}
              title="Paper tint"
            >
              <Coffee className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTheme('white')}
              className={`p-1 rounded ${theme === 'white' ? 'bg-white shadow-xs' : ''}`}
              title="Bright White"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`p-1 rounded ${theme === 'dark' ? 'bg-white text-stone-900 shadow-xs' : ''}`}
              title="Night Mode"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Reading Canvas */}
      <article className="max-w-3xl mx-auto px-6 py-12 sm:py-16">
        
        {/* Book Header Metadata */}
        <div className="text-center pb-10 mb-10 border-b border-stone-200/50">
          <span className="text-xs font-bold tracking-widest uppercase opacity-70 block mb-2">
            FREE PUBLIC EXCERPT
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight mb-3">
            {book.title}
          </h1>
          <p className="text-sm opacity-80 italic">by {book.author}</p>
        </div>

        {/* Excerpt Body */}
        <div className={`font-serif space-y-6 ${fontSizeClasses[fontSize]}`}>
          {book.sampleExcerpt.split('\n\n').map((paragraph, idx) => (
            <p key={idx} className="whitespace-pre-line">
              {paragraph}
            </p>
          ))}
        </div>

        {/* End of Excerpt Buy Callout */}
        <div className="mt-16 p-8 rounded-2xl bg-black/5 border border-black/10 text-center space-y-4">
          <BookOpen className="w-8 h-8 mx-auto opacity-60" />
          <h2 className="font-serif text-xl sm:text-2xl font-bold">
            Enjoyed this opening excerpt?
          </h2>
          <p className="text-xs sm:text-sm max-w-lg mx-auto opacity-80 leading-relaxed">
            The full edition includes all {book.tableOfContents.length} chapters, companion templates, reflowable EPUB for all e-readers, and lifetime corrections.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => addToCart(book)}
              className="px-6 py-3 bg-[#008bd2] hover:bg-[#0077b5] text-white font-bold text-sm rounded shadow-sm flex items-center gap-2 transition-transform hover:scale-102 cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Purchase Full Book (${(book.price / 100).toFixed(2)})</span>
            </button>

            <Link
              href={`/books/${book.slug}`}
              className="px-5 py-3 border border-stone-400 font-semibold text-xs sm:text-sm rounded hover:bg-black/5 transition-colors"
            >
              View Book Scope & Reviews
            </Link>
          </div>
        </div>

      </article>

    </div>
  );
}

export default function SampleExcerptPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-stone-500 font-sans">Loading excerpt reader...</div>}>
      <SampleExcerptContent />
    </Suspense>
  );
}
