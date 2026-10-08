'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { notFound, useParams, useRouter } from 'next/navigation';
import { getBookBySlug, getReviewsForBook, BOOKS_DATA } from '../../../lib/data/books';
import { Book } from '../../../lib/types';
import { useCart } from '../../../lib/store/cart';
import BookCard from '../../../components/books/BookCard';
import { 
  Star, 
  ShoppingCart, 
  Heart, 
  ShieldCheck, 
  Smartphone, 
  BookOpen, 
  CheckCircle2, 
  Download, 
  FileText, 
  ChevronRight, 
  Lock, 
  HelpCircle,
  Eye,
  Zap,
  RefreshCw
} from 'lucide-react';

function BookContent() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [book, setBook] = useState<Book | null>(() => getBookBySlug(slug) || null);
  const [loading, setLoading] = useState<boolean>(!book);

  useEffect(() => {
    if (!book && slug) {
      fetch(`/api/books?slug=${encodeURIComponent(slug)}`)
        .then((res) => {
          if (!res.ok) throw new Error('Book not found');
          return res.json();
        })
        .then((data) => {
          if (data.book) setBook(data.book);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [slug, book]);

  const { addToCart, toggleWishlist, isWishlisted } = useCart();

  if (loading) {
    return (
      <div className="py-24 text-center text-stone-500">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-[#23584B]" />
        <span>Loading book details...</span>
      </div>
    );
  }

  if (!book) {
    return notFound();
  }

  const wishlisted = isWishlisted(book.id);
  const reviews = getReviewsForBook(book.id);
  const relatedBooks = BOOKS_DATA.filter((b) => b.id !== book.id).slice(0, 3);

  const dollars = Math.floor(book.price / 100);
  const cents = (book.price % 100).toString().padStart(2, '0');

  const origDollars = book.originalPrice ? Math.floor(book.originalPrice / 100) : null;
  const origCents = book.originalPrice ? (book.originalPrice % 100).toString().padStart(2, '0') : null;

  const handleBuyNow = () => {
    addToCart(book);
    router.push('/cart');
  };

  return (
    <div className="py-6 sm:py-10 max-w-7xl mx-auto px-4">
      
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-stone-500 mb-6" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-[#23584B]">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/books" className="hover:text-[#23584B]">Books</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-stone-800 font-medium truncate max-w-xs">{book.title}</span>
      </nav>

      {/* Main 2-Column Product Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 bg-white p-6 sm:p-10 rounded-2xl border border-stone-200 shadow-sm mb-12">
        
        {/* Left Column: Book Cover Presentation (object-fit: contain to preserve cover art) */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="relative w-full max-w-xs sm:max-w-sm bg-stone-100 p-6 rounded-xl border border-stone-200 flex items-center justify-center shadow-inner">
            <div className="w-56 h-80 sm:w-64 sm:h-92 shadow-2xl rounded-md overflow-hidden border border-stone-300">
              <img
                src={book.coverImage}
                alt={book.title}
                className="w-full h-full object-cover"
              />
            </div>

            <button
              onClick={() => toggleWishlist(book.id)}
              className={`absolute top-4 right-4 p-2 rounded-full bg-white/90 shadow-xs transition-colors ${
                wishlisted ? 'text-rose-600' : 'text-stone-400 hover:text-rose-500'
              }`}
              title="Add to Wishlist"
            >
              <Heart className={`w-5 h-5 ${wishlisted ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Quick Format Compatibility Badges */}
          <div className="w-full max-w-xs sm:max-w-sm mt-4 p-3.5 bg-stone-50 rounded-lg border border-stone-200 text-xs text-stone-600 space-y-2">
            <div className="font-bold text-[#182A27] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Certified Digital Assets:</span>
            </div>
            <div className="flex flex-wrap gap-2 text-[11px]">
              <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-semibold">
                Reflowable EPUB
              </span>
              <span className="bg-sky-100 text-sky-800 px-2 py-0.5 rounded font-semibold">
                Universal PDF
              </span>
              <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-semibold">
                All Devices Compatible
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Book Details & Purchase Card */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          <div>
            
            {/* Condition tag / Category */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-[#23584B] uppercase tracking-wider bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded">
                {book.conditionLabel}
              </span>
              {book.badge && (
                <span className="text-xs font-bold text-white bg-[#9B5C36] px-2.5 py-0.5 rounded uppercase tracking-wider">
                  {book.badge}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="font-serif text-2xl sm:text-4xl font-bold text-[#182A27] leading-tight mb-2">
              {book.title}
            </h1>

            {/* Subtitle */}
            {book.subtitle && (
              <p className="text-sm sm:text-base text-stone-600 leading-relaxed mb-3">
                {book.subtitle}
              </p>
            )}

            {/* Author & ISBN */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-stone-500 mb-4 pb-4 border-b border-stone-200">
              <span>by <strong className="text-[#182A27]">{book.author}</strong></span>
              {book.isbn && <span>ISBN: <strong>{book.isbn}</strong></span>}
              {book.pageCount && <span>Length: <strong>{book.pageCount} pages</strong></span>}
              <span>Edition: <strong>{book.currentEdition.version}</strong></span>
            </div>

            {/* Ratings */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < Math.floor(book.rating) ? 'fill-current' : 'text-stone-300'}`}
                  />
                ))}
              </div>
              <span className="text-xs sm:text-sm font-bold text-[#182A27]">
                {book.rating} out of 5
              </span>
              <span className="text-xs text-stone-400">
                ({book.reviewCount} customer reviews)
              </span>
            </div>

            {/* Pricing Section (BetterWorldBooks style) */}
            <div className="bg-stone-50 p-4 sm:p-5 rounded-xl border border-stone-200 mb-6">
              <div className="flex items-baseline justify-between mb-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-[#182A27]">
                    ${dollars}
                    <sup className="text-sm font-semibold">{cents}</sup>
                  </span>
                  {book.originalPrice && (
                    <span className="text-sm text-stone-400 line-through">
                      ${origDollars}.{origCents}
                    </span>
                  )}
                </div>
                <span className="text-xs font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                  Direct Author Price
                </span>
              </div>
              
              <p className="text-xs text-stone-600">
                Includes all available formats (EPUB & PDF) with instant download access and lifetime edition corrections.
              </p>

              {/* Action Buttons: Add to Cart & Buy Now */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                <button
                  onClick={() => addToCart(book)}
                  className="py-3 px-4 bg-[#008bd2] hover:bg-[#0077b5] text-white font-bold text-sm rounded shadow-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Add To Cart</span>
                </button>

                <button
                  onClick={handleBuyNow}
                  className="py-3 px-4 bg-[#182A27] hover:bg-[#23584B] text-white font-bold text-sm rounded shadow-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <Zap className="w-4 h-4 text-amber-300" />
                  <span>Buy Now (Instant Access)</span>
                </button>
              </div>

              {/* Sample Excerpt Link */}
              <div className="mt-3 text-center">
                <Link
                  href={`/samples/${book.slug}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#008bd2] hover:underline"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Read Free Sample Chapter (No email required)</span>
                </Link>
              </div>
            </div>

            {/* Target Audience & Short Description */}
            <div className="space-y-3 text-xs sm:text-sm text-stone-700 leading-relaxed mb-6">
              <p><strong>Who this is for:</strong> {book.targetAudience}</p>
              <p>{book.fullDescription}</p>
            </div>

          </div>

          {/* Guarantee Footer */}
          <div className="pt-4 border-t border-stone-200 flex flex-wrap items-center justify-between text-xs text-stone-500 gap-2">
            <span className="flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Secure checkout with instant access token</span>
            </span>
            <Link href="/help" className="hover:text-[#23584B] underline">
              Need device assistance?
            </Link>
          </div>
        </div>

      </div>

      {/* Scope, Table of Contents, and What's Included */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        
        {/* What's Included */}
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-2xs">
          <h2 className="font-serif text-lg font-bold text-[#182A27] mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>What's Included in Your Purchase</span>
          </h2>
          <ul className="space-y-2.5 text-xs sm:text-sm text-stone-700">
            {book.whatsIncluded.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Table of Contents */}
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-2xs">
          <h2 className="font-serif text-lg font-bold text-[#182A27] mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#23584B]" />
            <span>Table of Contents & Core Scope</span>
          </h2>
          <ul className="space-y-2 text-xs sm:text-sm text-stone-700">
            {book.tableOfContents.map((chapter, idx) => (
              <li key={idx} className="py-1 border-b border-stone-100 last:border-0 font-medium">
                {chapter}
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* Authentic Reviews Section for this book */}
      <div className="bg-white p-6 sm:p-8 rounded-xl border border-stone-200 shadow-2xs mb-12">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-200">
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#182A27]">
              Customer Reviews ({reviews.length})
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Verified readers who purchased directly through our store.
            </p>
          </div>
          <Link
            href="/contact?topic=review"
            className="text-xs font-bold text-[#008bd2] hover:underline"
          >
            Submit a review
          </Link>
        </div>

        {reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((rev) => (
              <div key={rev.id} className="p-4 bg-stone-50 rounded-lg border border-stone-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex text-amber-500">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <span className="text-[11px] text-stone-400">{rev.createdAt}</span>
                </div>
                <p className="text-xs sm:text-sm text-stone-700 italic mb-2">
                  "{rev.reviewText}"
                </p>
                <div className="text-xs font-bold text-[#182A27]">
                  {rev.authorName} <span className="font-normal text-stone-400">({rev.location})</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-stone-500 italic">No reviews yet for this title. Be the first to read the sample and leave feedback!</p>
        )}
      </div>

      {/* Suggestions ("Customers also bought") */}
      <div className="mb-12">
        <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#182A27] mb-6">
          More Titles from S.R. Rehman
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {relatedBooks.map((relBook) => (
            <BookCard key={relBook.id} book={relBook} />
          ))}
        </div>
      </div>

    </div>
  );
}

export default function BookDetailPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-stone-500 font-sans">Loading book details...</div>}>
      <BookContent />
    </Suspense>
  );
}
