import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, BookOpen, CheckCircle, Zap, Star } from 'lucide-react';
import { BOOKS_DATA } from '../../lib/data/books';
import { Book } from '../../lib/types';

interface HeroBannerProps {
  featuredBook?: Book;
}

export default function HeroBanner({ featuredBook: propBook }: HeroBannerProps) {
  const featuredBook = propBook || BOOKS_DATA[0];

  return (
    <section className="relative overflow-hidden noise-overlay">
      {/* Multi-layered gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#F0F9FF] via-[#FDFBF7] to-[#F5F0E8]"></div>
      
      {/* Atmospheric glow orbs */}
      <div className="absolute top-0 left-1/4 w-[32rem] h-[32rem] rounded-full bg-sky-200/30 blur-[80px] pointer-events-none animate-pulse-soft"></div>
      <div className="absolute -right-24 -bottom-24 w-[36rem] h-[36rem] rounded-full bg-blue-100/40 blur-[100px] pointer-events-none"></div>
      <div className="absolute top-1/3 right-1/3 w-80 h-80 rounded-full bg-amber-50/40 blur-[60px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#0369A1]/15 to-transparent"></div>

      {/* Decorative dot pattern */}
      <div className="absolute inset-0 opacity-[0.07] pointer-events-none bg-[radial-gradient(#0369A1_0.8px,transparent_0.8px)] [background-size:24px_24px]"></div>

      <div className="max-w-7xl mx-auto px-4 py-14 sm:py-24 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-16 items-center">
          
          {/* Left Column */}
          <div className="md:col-span-7 flex flex-col items-start space-y-6">
            
            {/* Pill Badge */}
            <div className="animate-fade-in-up inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-[#0369A1] text-xs font-semibold tracking-wider uppercase shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#0369A1] animate-pulse" />
              <span>Independent Book Studio</span>
            </div>

            {/* Headline */}
            <div className="space-y-2 animate-fade-in-up delay-100">
              <span className="text-xs sm:text-sm font-bold tracking-[0.2em] uppercase text-[#0369A1]/70">
                Curated Reading
              </span>
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-[3.75rem] font-bold tracking-tight text-[#0F1D2F] leading-[1.1]">
                Discover your next
                <br />
                <span className="relative inline-block">
                  <span className="text-gradient italic font-normal">great read</span>
                  <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 8C30 3 70 2 100 5C130 8 170 7 198 4" stroke="#0369A1" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.25"/>
                  </svg>
                </span>
              </h1>
            </div>

            {/* Subtext */}
            <p className="text-sm sm:text-base text-[#4A5568] max-w-lg leading-relaxed animate-fade-in-up delay-200">
              Welcome to <strong className="text-[#0F1D2F]">Knovera</strong> — beautifully typeset non-fiction that expands your mind and clarifies your goals. DRM-free EPUB & PDF, ready for any device.
            </p>

            {/* Value Props Grid */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 text-xs text-[#4A5568] py-1 animate-fade-in-up delay-300">
              {[
                'Instant DRM-Free Downloads',
                'Free Lifetime Updates',
                'Companion Guides Included',
                'Access Recovery Portal'
              ].map((perk, i) => (
                <div key={i} className="flex items-center gap-2 group">
                  <CheckCircle className="w-4 h-4 text-[#0369A1] shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">{perk}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="pt-1 flex flex-wrap gap-3.5 animate-fade-in-up delay-400">
              <Link
                href="/books"
                className="group px-7 py-3.5 rounded-xl bg-gradient-to-r from-[#0F1D2F] to-[#1A3A4F] hover:from-[#0369A1] hover:to-[#075985] text-white font-bold text-sm tracking-wide flex items-center gap-2.5 shadow-lg shadow-[#0F1D2F]/20 hover:shadow-[#0369A1]/25 transition-all duration-400 hover:-translate-y-0.5"
              >
                <span>Explore All Titles</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              
              <Link
                href={`/books/${featuredBook.slug}`}
                className="group px-6 py-3.5 rounded-xl glass hover:bg-white text-[#0F1D2F] hover:text-[#0369A1] font-semibold text-sm shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4" />
                <span>Featured — ${(featuredBook.price / 100).toFixed(2)}</span>
              </Link>
            </div>

            {/* Social Proof Micro-Bar */}
            <div className="flex items-center gap-3 pt-2 animate-fade-in-up delay-500">
              <div className="flex -space-x-2">
                {['bg-sky-400', 'bg-emerald-400', 'bg-amber-400', 'bg-violet-400'].map((c, i) => (
                  <div key={i} className={`w-7 h-7 rounded-full ${c} border-2 border-white shadow-sm flex items-center justify-center text-white text-[9px] font-bold`}>
                    {['SR', 'AK', 'JM', 'LP'][i]}
                  </div>
                ))}
              </div>
              <div className="text-xs text-[#718096]">
                <div className="flex items-center gap-1">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}
                  </div>
                  <span className="font-semibold text-[#0F1D2F]">4.9</span>
                </div>
                <span>Loved by 5,600+ readers</span>
              </div>
            </div>
          </div>

          {/* Right Column — Book Showcase */}
          <div className="md:col-span-5 flex justify-center md:justify-end animate-fade-in-right delay-200">
            <div className="relative group">
              
              {/* Floating badges */}
              <div className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-full glass text-[#0F1D2F] text-[11px] font-bold shadow-lg absolute -top-6 -left-8 z-20 animate-float-slow">
                <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>Instant Delivery</span>
              </div>

              <div className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-full glass text-[#0F1D2F] text-[11px] font-bold shadow-lg absolute -bottom-5 -right-6 z-20 animate-float">
                <BookOpen className="w-3.5 h-3.5 text-[#0369A1]" />
                <span>EPUB + PDF</span>
              </div>

              {/* Ambient glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-sky-200/40 to-amber-100/30 rounded-2xl rotate-3 scale-95 transition-transform duration-700 group-hover:rotate-5 blur-sm"></div>
              
              {/* Book cover container */}
              <div className="relative bg-white p-4 rounded-2xl shadow-xl shadow-[#0F1D2F]/8 border border-stone-100/80 max-w-[280px] sm:max-w-[320px] transition-all duration-700 group-hover:scale-[1.02] animate-float card-hover">
                <img
                  src={featuredBook.coverImage}
                  alt={featuredBook.title}
                  className="w-full h-80 sm:h-[22rem] object-cover rounded-xl shadow-inner"
                />
                
                {/* Book info bar */}
                <div className="mt-3.5 p-3 bg-gradient-to-r from-stone-50 to-white rounded-lg text-[#0F1D2F] flex items-center justify-between border border-stone-100/60">
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-[#0369A1] uppercase tracking-[0.15em] block">
                      Featured
                    </span>
                    <span className="font-serif font-bold text-xs truncate max-w-[180px] block text-[#0F1D2F]">
                      {featuredBook.title}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-[#0F1D2F] bg-[#F0F9FF] px-2.5 py-1 rounded-lg shadow-sm border border-sky-100 shrink-0">
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
