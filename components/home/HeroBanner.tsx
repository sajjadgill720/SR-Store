import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, BookOpen, CheckCircle, Zap } from 'lucide-react';
import { BOOKS_DATA } from '../../lib/data/books';
import { Book } from '../../lib/types';

interface HeroBannerProps {
  featuredBook?: Book;
}

export default function HeroBanner({ featuredBook: propBook }: HeroBannerProps) {
  const featuredBook = propBook || BOOKS_DATA[0];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#EBF4FA] via-[#F9FBFC] to-[#F3F8FB] border-b border-[#DDE7EE] text-[#0F2537]">
      {/* Subtle atmospheric glow effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-sky-200/40 blur-3xl pointer-events-none animate-pulse-soft"></div>
      <div className="absolute -right-16 -bottom-16 w-[30rem] h-[30rem] rounded-full bg-blue-100/60 blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/2 right-1/3 w-72 h-72 rounded-full bg-amber-50/50 blur-2xl pointer-events-none"></div>

      {/* Decorative dot matrix pattern */}
      <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#0284c7_1px,transparent_1px)] [background-size:20px_20px]"></div>

      <div className="max-w-7xl mx-auto px-4 py-12 sm:py-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
          
          {/* Left Column: Editorial Headline & Statement */}
          <div className="md:col-span-7 flex flex-col items-start space-y-5">
            
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 text-[#0284C7] border border-sky-200 shadow-xs text-xs font-semibold tracking-wider uppercase backdrop-blur-md transition-transform hover:scale-102">
              <Sparkles className="w-3.5 h-3.5 text-[#0284C7] animate-pulse" />
              <span>Curated Reader Editions</span>
            </div>

            <div className="space-y-1.5">
              <span className="text-xs sm:text-sm font-bold tracking-widest uppercase text-sky-800">
                OUR FEATURED RELEASES
              </span>
              <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#0F2537] leading-[1.15]">
                what to <span className="italic font-normal text-[#0284C7] underline decoration-sky-200 decoration-wavy underline-offset-8">read</span> next
              </h1>
            </div>

            <p className="text-sm sm:text-base text-[#385361] max-w-xl leading-relaxed">
              Welcome to <strong>Knovera</strong> — an independent book studio dedicated to ideas that expand your mind and clarify your goals. Enjoy beautifully typeset, DRM-free EPUB and PDF editions ready for your Kindle, tablet, or favorite reading device.
            </p>

            {/* Direct purchase perks */}
            <div className="grid grid-cols-2 gap-2.5 text-xs text-[#2A4452] py-1">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#0284C7] shrink-0" />
                <span className="font-medium">Instant DRM-Free Downloads</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#0284C7] shrink-0" />
                <span className="font-medium">Free Lifetime Updates</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#0284C7] shrink-0" />
                <span className="font-medium">Companion Guides Included</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#0284C7] shrink-0" />
                <span className="font-medium">Verified Access Recovery</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="pt-2 flex flex-wrap gap-3.5">
              <Link
                href="/books"
                className="group px-6 py-3.5 rounded-lg bg-[#0F2537] hover:bg-[#0284C7] text-white font-bold text-sm tracking-wide flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
              >
                <span>EXPLORE ALL TITLES</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              
              <Link
                href={`/books/${featuredBook.slug}`}
                className="px-5 py-3.5 rounded-lg bg-white/90 hover:bg-white text-[#0F2537] hover:text-[#0284C7] font-semibold text-sm border border-sky-200/90 shadow-xs hover:shadow-md transition-all duration-200"
              >
                <span>View Bestseller (${(featuredBook.price / 100).toFixed(2)})</span>
              </Link>
            </div>

          </div>

          {/* Right Column: Hero Book Showcase with Floating Animations */}
          <div className="md:col-span-5 flex justify-center md:justify-end">
            <div className="relative group">
              
              {/* Floating Micro-Badge: Instant Delivery */}
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 border border-sky-200 text-[#0F2537] text-[11px] font-bold shadow-lg absolute -top-5 -left-6 z-20 animate-float-slow backdrop-blur-md">
                <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>Instant E-Reader Delivery</span>
              </div>

              {/* Floating Micro-Badge: EPUB & PDF */}
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 border border-sky-200 text-[#0F2537] text-[11px] font-bold shadow-lg absolute -bottom-4 -right-4 z-20 animate-float backdrop-blur-md">
                <BookOpen className="w-3.5 h-3.5 text-[#0284C7]" />
                <span>EPUB + PDF Included</span>
              </div>

              {/* Ambient backdrop glow */}
              <div className="absolute inset-0 bg-sky-200/40 rounded-2xl rotate-3 scale-95 transition-transform duration-500 group-hover:rotate-6 blur-xs"></div>
              
              {/* Main book cover container with float animation */}
              <div className="relative bg-white p-3.5 rounded-2xl shadow-xl shadow-sky-950/10 border border-sky-100 max-w-[280px] sm:max-w-[320px] transition-transform duration-500 group-hover:scale-102 animate-float">
                <img
                  src={featuredBook.coverImage}
                  alt={featuredBook.title}
                  className="w-full h-80 sm:h-96 object-cover rounded-xl shadow-sm"
                />
                
                <div className="mt-3.5 p-2.5 bg-gradient-to-r from-sky-50/80 to-[#F9FBFC] rounded-lg text-[#0F2537] flex items-center justify-between border border-sky-100/60">
                  <div>
                    <span className="text-[10px] font-bold text-[#0284C7] uppercase tracking-wider block">
                      FLAGSHIP RELEASE
                    </span>
                    <span className="font-serif font-bold text-xs truncate max-w-[180px] block text-[#0F2537]">
                      {featuredBook.title}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-[#0F2537] bg-white px-2 py-0.5 rounded shadow-2xs border border-sky-100">
                    ${(featuredBook.price / 100).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
