'use client';

import React from 'react';

export default function TermsPage() {
  return (
    <div className="py-12 sm:py-16 max-w-4xl mx-auto px-4">
      <div className="bg-white p-6 sm:p-12 rounded-2xl border border-stone-200 shadow-sm space-y-6">
        <div>
          <span className="text-xs font-bold text-[#23584B] uppercase tracking-widest block mb-1">
            LEGAL AGREEMENT
          </span>
          <h1 className="font-serif text-3xl font-bold text-[#182A27] mb-2">
            Terms of Service
          </h1>
          <p className="text-xs text-stone-500">
            Last updated: October 2026
          </p>
        </div>

        <div className="space-y-4 text-xs sm:text-sm text-stone-700 leading-relaxed">
          <p>
            By accessing or purchasing from Knovera, you agree to these Terms of Service.
          </p>

          <h2 className="font-serif text-lg font-bold text-[#182A27]">
            1. Intellectual Property
          </h2>
          <p>
            All texts, illustrations, cover artwork, and companion worksheets are the intellectual property of S.R. Rehman. Purchases grant personal reading and household printing licenses, not transfer of copyright.
          </p>

          <h2 className="font-serif text-lg font-bold text-[#182A27]">
            2. Content Accuracy & Disclaimers
          </h2>
          <p>
            Our non-fiction publications are intended for educational and self-development purposes. They do not constitute certified medical, financial, or legal advice.
          </p>

          <h2 className="font-serif text-lg font-bold text-[#182A27]">
            3. Account & Access Security
          </h2>
          <p>
            You are responsible for maintaining control of your purchase email address to access your downloads and reader library shelf.
          </p>
        </div>
      </div>
    </div>
  );
}
