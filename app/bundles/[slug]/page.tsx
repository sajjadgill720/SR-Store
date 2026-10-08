'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { notFound, useParams, useRouter } from 'next/navigation';
import { getBundleBySlug } from '../../../lib/data/books';
import { useCart } from '../../../lib/store/cart';
import { 
  Sparkles, 
  CheckCircle2, 
  ShoppingCart, 
  Zap, 
  ShieldCheck, 
  BookOpen, 
  ArrowRight,
  ChevronRight
} from 'lucide-react';

function BundleContent() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const bundle = getBundleBySlug(slug);

  if (!bundle) {
    return notFound();
  }

  const { addToCart } = useCart();

  const handleBuyBundle = () => {
    // Add all books in bundle to cart
    bundle.books.forEach((b) => addToCart(b));
    router.push('/cart');
  };

  return (
    <div className="py-8 sm:py-12 max-w-7xl mx-auto px-4">
      
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-stone-500 mb-6">
        <Link href="/" className="hover:text-[#23584B]">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/books?category=Bundles" className="hover:text-[#23584B]">Bundles</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-stone-800 font-medium">{bundle.title}</span>
      </nav>

      {/* Main Bundle Card */}
      <div className="bg-white p-6 sm:p-10 rounded-2xl border border-stone-200 shadow-sm mb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#9B5C36] text-white text-xs font-bold rounded uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{bundle.badge}</span>
            </div>

            <h1 className="font-serif text-2xl sm:text-4xl font-bold text-[#182A27] leading-tight">
              {bundle.title}
            </h1>

            <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
              {bundle.subtitle}
            </p>

            {/* Standalone Price Breakdown vs Bundle Price */}
            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
                Standalone Price Comparison:
              </span>
              <div className="space-y-1.5 text-xs text-stone-700">
                {bundle.books.map((b) => (
                  <div key={b.id} className="flex justify-between items-center">
                    <span>• {b.title}</span>
                    <span className="font-semibold">${(b.price / 100).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t border-stone-200 flex justify-between text-xs text-stone-500">
                <span>Separate Total</span>
                <span className="line-through">${(bundle.originalPrice / 100).toFixed(2)}</span>
              </div>
            </div>

            {/* Pricing Callout */}
            <div className="flex items-baseline gap-4 pt-2">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-[#182A27]">
                  ${(bundle.price / 100).toFixed(2)}
                </span>
                <span className="text-sm text-stone-400 line-through">
                  ${(bundle.originalPrice / 100).toFixed(2)}
                </span>
              </div>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded">
                Save {bundle.savingsPercentage}% Instantly
              </span>
            </div>

            {/* Actions */}
            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={handleBuyBundle}
                className="px-6 py-3.5 bg-[#008bd2] hover:bg-[#0077b5] text-white font-bold text-sm rounded shadow-sm flex items-center gap-2 transition-transform hover:-translate-y-0.5 cursor-pointer"
              >
                <Zap className="w-4 h-4 text-amber-300" />
                <span>Buy Complete Bundle (Instant Access)</span>
              </button>
            </div>
          </div>

          {/* Bundle Mockup */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative flex items-center justify-center p-6 bg-stone-50 rounded-2xl border border-stone-200 w-full max-w-sm">
              <div className="w-36 h-52 rounded-md overflow-hidden shadow-xl -rotate-6 border border-stone-300">
                <img src={bundle.books[0].coverImage} alt="Cover 1" className="w-full h-full object-cover" />
              </div>
              <div className="w-36 h-52 rounded-md overflow-hidden shadow-xl rotate-6 -ml-12 border border-stone-300">
                <img src={bundle.books[1].coverImage} alt="Cover 2" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Included Titles Deep Dive */}
      <div className="space-y-6">
        <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#182A27]">
          Detailed Breakdown of Included Titles
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bundle.books.map((b) => (
            <div key={b.id} className="bg-white p-6 rounded-xl border border-stone-200 shadow-2xs space-y-3">
              <div className="flex gap-4 items-start">
                <img src={b.coverImage} alt={b.title} className="w-16 h-24 object-cover rounded border border-stone-200 shrink-0" />
                <div>
                  <h3 className="font-serif font-bold text-base text-[#182A27]">{b.title}</h3>
                  <p className="text-xs text-stone-500 mt-0.5">Edition: {b.currentEdition.version}</p>
                  <p className="text-xs text-stone-600 mt-2 line-clamp-2">{b.shortDescription}</p>
                </div>
              </div>
              <div className="pt-2 border-t border-stone-100 flex justify-between items-center text-xs">
                <span className="text-emerald-700 font-semibold">{b.conditionLabel}</span>
                <Link href={`/books/${b.slug}`} className="font-bold text-[#008bd2] hover:underline">
                  View book page →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

export default function BundleDetailPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-stone-500 font-sans">Loading bundle...</div>}>
      <BundleContent />
    </Suspense>
  );
}
