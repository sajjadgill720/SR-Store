import React from 'react';
import Link from 'next/link';
import ScrollReveal from '../components/home/ScrollReveal';
import TrustBar from '../components/home/TrustBar';
import HeroBanner from '../components/home/HeroBanner';
import CategoryIcons from '../components/layout/CategoryIcons';
import ImpactStats from '../components/home/ImpactStats';
import ReviewsSection from '../components/home/ReviewsSection';
import DeviceHelpSection from '../components/home/DeviceHelpSection';
import BookCard from '../components/books/BookCard';
import { BUNDLES_DATA } from '../lib/data/books';
import { db } from '../lib/db/store';
import { Sparkles, ArrowRight, ShieldCheck, Download, RefreshCw } from 'lucide-react';

export default function HomePage() {
  const allBooks = db.getBooks();
  const standaloneBooks = allBooks.filter((b) => b.productType !== 'bundle');
  const featuredBook = allBooks.find((b) => b.featured) || allBooks[0];
  const bundle = BUNDLES_DATA[0];

  return (
    <ScrollReveal>
      
      {/* 1. Hero Banner */}
      <HeroBanner featuredBook={featuredBook} />
      <TrustBar />

      {/* 2. BetterWorldBooks Style Category Icons Row */}
      <CategoryIcons />

      {/* 3. Featured Books Section (BetterWorldBooks Grid) */}
      <section data-reveal className="py-16 sm:py-24 max-w-7xl mx-auto px-4 catalog-section">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 pb-4 border-b border-stone-200 gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#008bd2]"></span>
              <span className="text-xs font-bold text-[#008bd2] uppercase tracking-widest">
                THE READING ROOM
              </span>
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl font-semibold text-[#182A27]">
              Ideas worth spending time with
            </h2>
          </div>

          <Link
            href="/books"
            className="text-xs sm:text-sm font-bold text-[#008bd2] hover:text-[#0077b5] flex items-center gap-1 group"
          >
            <span>View all titles & filters</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* 4-Column Book Cards Grid */}
        <div className="book-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {standaloneBooks.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </section>

      {/* 4. Curated Digital Box Set / Bundle Banner */}
      {bundle && (
        <section data-reveal className="bundle-section py-12 sm:py-20 text-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="bundle-panel rounded-3xl p-6 sm:p-10 border border-white/15 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              <div className="lg:col-span-8 space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#0284C7] text-white text-xs font-bold uppercase tracking-wider shadow-xs">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{bundle.badge}</span>
                </div>

                <h3 className="font-serif text-2xl sm:text-4xl font-bold text-white">
                  {bundle.title}
                </h3>

                <p className="text-sm text-sky-100 max-w-2xl leading-relaxed">
                  {bundle.description}
                </p>

                {/* Included titles breakdown */}
                <div className="p-4 bg-white/5 rounded-lg border border-white/15 max-w-2xl">
                  <span className="text-xs font-bold uppercase tracking-wider text-sky-200 block mb-2">
                    Included In This Box Set:
                  </span>
                  <div className="space-y-1.5 text-xs text-stone-200">
                    {bundle.books.map((b) => (
                      <div key={b.id} className="flex items-center justify-between">
                        <span className="font-medium">• {b.title}</span>
                        <span className="text-stone-400">Standalone: ${(b.price / 100).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-baseline gap-4 pt-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-white">
                      ${(bundle.price / 100).toFixed(2)}
                    </span>
                    <span className="text-sm text-sky-200/70 line-through">
                      ${(bundle.originalPrice / 100).toFixed(2)}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-sky-100 bg-sky-800 px-2.5 py-1 rounded">
                    Save {bundle.savingsPercentage}% Instantly
                  </span>
                </div>

                <div className="pt-2 flex flex-wrap gap-3">
                  <Link
                    href={`/bundles/${bundle.slug}`}
                    className="px-6 py-3 bg-[#008bd2] hover:bg-[#0077b5] text-white font-bold text-sm rounded shadow-md transition-transform hover:-translate-y-0.5 flex items-center gap-2"
                  >
                    <span>Get The Bundle Offer</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Bundle Covers Mockup */}
              <div className="lg:col-span-4 flex justify-center">
                <div className="relative flex items-center justify-center">
                  <div className="w-40 h-56 rounded-lg overflow-hidden shadow-2xl rotate-[-6deg] border border-white/20">
                    <img src={bundle.books[0].coverImage} alt={bundle.books[0].title} className="w-full h-full object-cover" />
                  </div>
                  <div className="w-40 h-56 rounded-lg overflow-hidden shadow-2xl rotate-[8deg] -ml-16 border border-white/20">
                    <img src={bundle.books[1].coverImage} alt={bundle.books[1].title} className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>
      )}

      {/* 5. BetterWorldBooks 4-Metric Impact Counters */}
      <ImpactStats />

      {/* 6. Why Buy Direct Section */}
      <section data-reveal className="experience-section py-16 sm:py-24 border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold text-[#0284C7] uppercase tracking-widest block mb-1">
              THE KNOVERA EXPERIENCE
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-semibold text-[#11252B]">
              Built for Readers Who Cherish Depth
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-2">
              Pure reading freedom, elegant typography, lifetime updates, and direct author connection.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="experience-card p-8 rounded-2xl bg-white/70 border border-white flex flex-col items-start hover:-translate-y-1 hover:shadow-md transition-all duration-300">
              <div className="w-12 h-12 rounded-lg bg-emerald-100 text-[#23584B] flex items-center justify-center mb-4 shadow-2xs">
                <Download className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-lg text-[#182A27] mb-2">
                Pure DRM-Free Files
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                You own your books. Download both universal PDF and reflowable EPUB. Transfer them to any e-reader or tablet without restrictive proprietary walls.
              </p>
            </div>

            <div className="experience-card p-8 rounded-2xl bg-white/70 border border-white flex flex-col items-start hover:-translate-y-1 hover:shadow-md transition-all duration-300">
              <div className="w-12 h-12 rounded-lg bg-sky-100 text-[#0284C7] flex items-center justify-center mb-4 shadow-2xs">
                <RefreshCw className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-lg text-[#182A27] mb-2">
                Free Lifetime Edition Updates
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                When an edition is corrected, updated with new chapters, or expanded with companion worksheets, you receive the new release automatically in your library.
              </p>
            </div>

            <div className="experience-card p-8 rounded-2xl bg-white/70 border border-white flex flex-col items-start hover:-translate-y-1 hover:shadow-md transition-all duration-300">
              <div className="w-12 h-12 rounded-lg bg-blue-100 text-[#0284C7] flex items-center justify-center mb-4 shadow-2xs">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-lg text-[#182A27] mb-2">
                Instant Access Recovery
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Lost your device or can&apos;t find your purchase receipt? Enter your email address at anytime on our Access Recovery portal to instantly restore your downloads.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. ShopperApproved-style Reader Reviews */}
      <ReviewsSection />

      {/* 8. Device Compatibility & Kindle Push Guide */}
      <DeviceHelpSection />

    </ScrollReveal>
  );
}
