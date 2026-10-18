'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen, Sparkles, ShieldCheck, ArrowRight, RefreshCw, Feather } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="py-12 sm:py-20 max-w-4xl mx-auto px-4">
      <div className="bg-white p-6 sm:p-12 rounded-2xl border border-[var(--color-border)] shadow-sm space-y-10">
        
        {/* Header Block */}
        <div className="space-y-3 border-b border-[var(--color-border-soft)] pb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[var(--bg-warm)] text-[var(--color-accent)] border border-[#DDD6C8] text-xs font-semibold tracking-wider uppercase">
            <Feather className="w-3.5 h-3.5" />
            <span>The Independent Digital Press</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[var(--color-ink)] tracking-tight">
            About Knovera Press
          </h1>
          <p className="text-base sm:text-lg text-[var(--color-ink-muted)] leading-relaxed font-serif italic pt-1">
            &ldquo;Thoughtful digital editions built around high cognitive leverage, deliberate systems, and unbroken depth.&rdquo;
          </p>
        </div>

        {/* Narrative / Pitch */}
        <div className="space-y-4 text-sm sm:text-base text-[#38332F] leading-relaxed">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[var(--color-ink)]">
            An Intentional Rejection of Publishing Churn
          </h2>
          <p>
            In an era of relentless algorithmic content, AI-generated book summaries, and manufactured marketing urgency, <strong>Knovera</strong> is dedicated to a quieter, more enduring standard.
          </p>
          <p>
            Knovera is an independent digital press. Every title in this catalog is conceived, field-tested, written, and typeset to exacting editorial standards. There are no ghostwriters, no arbitrary chapter padding to satisfy spine widths, and no corporate distributors imposing digital restrictions.
          </p>
          <p>
            Whether detailing the cognitive architecture of 90-minute focus sessions in <em>The Focused Mind</em>, environmental friction loops in <em>Atomic Architectures</em>, or high-leverage modular software in <em>The Solo Architect</em>, our books are engineered as definitive working references that readers keep on their digital shelves for decades.
          </p>
        </div>

        {/* Four Reader Pillars */}
        <div className="space-y-4 pt-2">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[var(--color-ink)]">
            Our Commitments to Every Reader
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            
            <div className="p-5 rounded-xl bg-[var(--bg-warm)] border border-[#DDD6C8] flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-white text-[var(--color-accent)] flex items-center justify-center mb-3 shadow-xs">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-base text-[var(--color-ink)] mb-1">
                  Pure DRM-Free Ownership
                </h3>
                <p className="text-xs sm:text-sm text-[var(--color-ink-muted)] leading-relaxed">
                  Every book arrives in universal EPUB and typeset PDF. You own your files permanently. Read freely on Kindle, Apple Books, Kobo, reMarkable, or iPad with zero lock-in.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-[var(--bg-warm)] border border-[#DDD6C8] flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-white text-[var(--color-accent)] flex items-center justify-center mb-3 shadow-xs">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-base text-[var(--color-ink)] mb-1">
                  Lifetime Free Edition Updates
                </h3>
                <p className="text-xs sm:text-sm text-[var(--color-ink-muted)] leading-relaxed">
                  As frameworks evolve and revised editions or companion worksheets are released, updated files are automatically placed in your library at zero additional charge.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-[var(--bg-warm)] border border-[#DDD6C8] flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-white text-[var(--color-accent)] flex items-center justify-center mb-3 shadow-xs">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-base text-[var(--color-ink)] mb-1">
                  Actionable Working Systems
                </h3>
                <p className="text-xs sm:text-sm text-[var(--color-ink-muted)] leading-relaxed">
                  Every chapter is accompanied by concrete templates, audit checklists, or companion worksheets designed for immediate execution in your daily practice.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-[var(--bg-warm)] border border-[#DDD6C8] flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-white text-[var(--color-accent)] flex items-center justify-center mb-3 shadow-xs">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-base text-[var(--color-ink)] mb-1">
                  30-Day Money-Back Guarantee
                </h3>
                <p className="text-xs sm:text-sm text-[var(--color-ink-muted)] leading-relaxed">
                  If an edition does not provide genuine practical value for your daily work or habits, email author support directly for a prompt, courteous full refund.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Editorial Standard Card */}
        <div className="p-6 bg-[var(--bg-warm-tint)] rounded-xl border border-[#DDD6C8] space-y-2">
          <h3 className="font-serif font-bold text-base text-[var(--color-ink)]">
            Our Craft Standard
          </h3>
          <p className="text-xs sm:text-sm text-[var(--color-ink-muted)] leading-relaxed">
            We hold digital books to the standards of fine print editions: careful kerning, deliberate typographic hierarchy, margin callouts, and clean vector illustrations. We build books that feel like prized possessions on your screen.
          </p>
        </div>

        {/* CTA Footer */}
        <div className="pt-4 border-t border-[var(--color-border)] flex flex-wrap gap-4 items-center justify-between">
          <Link
            href="/books"
            className="studio-button"
          >
            <span>Explore the 4 Editions</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/contact" className="text-xs sm:text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-accent)] transition-colors">
            Have a question or reflection? Contact Knovera Press &rarr;
          </Link>
        </div>

      </div>
    </div>
  );
}
