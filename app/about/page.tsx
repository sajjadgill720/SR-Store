'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen, Sparkles, HeartHandshake, CheckCircle2, ArrowRight, Compass } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="py-12 sm:py-20 max-w-4xl mx-auto px-4">
      <div className="bg-white p-6 sm:p-12 rounded-2xl border border-stone-200 shadow-sm space-y-10">
        
        {/* Header Block */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 text-[#0284C7] border border-sky-200 text-xs font-semibold tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Our Story & Vision</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#11252B] tracking-tight">
            About Knovera
          </h1>
          <p className="text-base sm:text-lg text-stone-600 leading-relaxed font-serif italic pt-1">
            &ldquo;Books crafted for deliberate minds seeking clarity, depth, and lifelong momentum.&rdquo;
          </p>
        </div>

        {/* Narrative / Pitch */}
        <div className="space-y-4 text-sm sm:text-base text-stone-700 leading-relaxed">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#11252B]">
            Crafting Ideas That Last
          </h2>
          <p>
            In an era of endless digital noise and superficial takeaways, <strong>Knovera</strong> is an intentional space for deep work, transformative thinking, and actionable knowledge. 
          </p>
          <p>
            Each title in our catalog is born out of real-world experimentation, rigorous synthesis, and obsessive editorial refinement. We write for practitioners, thinkers, and lifelong learners who value substantive insight over quick hype.
          </p>
        </div>

        {/* Four Reader Pillars */}
        <div className="space-y-4 pt-2">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#11252B]">
            The Knovera Reader Experience
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            
            <div className="p-5 rounded-xl bg-stone-50 border border-stone-200 flex flex-col justify-between hover:border-sky-300 transition-colors">
              <div>
                <div className="w-10 h-10 rounded-lg bg-sky-100 text-[#0284C7] flex items-center justify-center mb-3">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-base text-[#11252B] mb-1">
                  Pure Reader Freedom
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  Every book arrives DRM-free in universal PDF and reflowable EPUB. Enjoy complete freedom to read on Kindle, Kobo, iPad, or your favorite e-reader.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-stone-50 border border-stone-200 flex flex-col justify-between hover:border-sky-300 transition-colors">
              <div>
                <div className="w-10 h-10 rounded-lg bg-emerald-100 text-[#23584B] flex items-center justify-center mb-3">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-base text-[#11252B] mb-1">
                  Free Lifetime Updates
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  As our research expands and new revisions or companion worksheets are published, you automatically receive updated editions in your library.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-stone-50 border border-stone-200 flex flex-col justify-between hover:border-sky-300 transition-colors">
              <div>
                <div className="w-10 h-10 rounded-lg bg-blue-100 text-[#0284C7] flex items-center justify-center mb-3">
                  <Compass className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-base text-[#11252B] mb-1">
                  Actionable Frameworks
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  Our titles are engineered with practical mental models, field-tested systems, and companion worksheets ready for immediate execution.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-stone-50 border border-stone-200 flex flex-col justify-between hover:border-sky-300 transition-colors">
              <div>
                <div className="w-10 h-10 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center mb-3">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-base text-[#11252B] mb-1">
                  Direct Author Dialogue
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  Readers aren&apos;t metrics here. You can ask questions, suggest future topics, and engage directly with the author team.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Editorial Standard Card */}
        <div className="p-6 bg-gradient-to-r from-sky-50/60 to-stone-50 rounded-xl border border-sky-100 space-y-2">
          <h3 className="font-serif font-bold text-base text-[#11252B]">
            Our Editorial Standard
          </h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            We refuse to produce synthetic filler, manufactured urgency, or hollow productivity formulas. Every page is dedicated to genuine insight, aesthetic typography, and ideas worth keeping on your digital shelf for decades.
          </p>
        </div>

        {/* CTA Footer */}
        <div className="pt-4 border-t border-stone-200 flex flex-wrap gap-4 items-center justify-between">
          <Link
            href="/books"
            className="px-6 py-3 bg-[#0F2537] hover:bg-[#0284C7] text-white text-xs sm:text-sm font-bold rounded-lg flex items-center gap-2 shadow-sm transition-all duration-300 hover:-translate-y-0.5"
          >
            <span>Explore the Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/contact" className="text-xs sm:text-sm text-stone-500 hover:text-stone-800 transition-colors">
            Have a question or thought? Get in touch &rarr;
          </Link>
        </div>

      </div>
    </div>
  );
}
