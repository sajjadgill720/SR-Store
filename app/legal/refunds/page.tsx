'use client';

import React from 'react';
import Link from 'next/link';

export default function RefundsPage() {
  return (
    <div className="py-12 sm:py-16 max-w-4xl mx-auto px-4">
      <div className="bg-white p-6 sm:p-12 rounded-2xl border border-stone-200 shadow-sm space-y-6">
        
        <div>
          <span className="text-xs font-bold text-[#23584B] uppercase tracking-widest block mb-1">
            CONSUMER POLICIES
          </span>
          <h1 className="font-serif text-3xl font-bold text-[#182A27] mb-2">
            Refund, Delivery & License Policy
          </h1>
          <p className="text-xs text-stone-500">
            Last updated: October 2026 • Published by Knovera
          </p>
        </div>

        <div className="space-y-4 text-xs sm:text-sm text-stone-700 leading-relaxed">
          <h2 className="font-serif text-lg font-bold text-[#182A27]">
            1. Digital Delivery Policy
          </h2>
          <p>
            All products sold on Knovera are delivered digitally and immediately upon payment confirmation. You will receive immediate download links on the order confirmation screen, as well as an official receipt with permanent access tokens sent to your registered email.
          </p>

          <h2 className="font-serif text-lg font-bold text-[#182A27]">
            2. 14-Day Reader Satisfaction Guarantee
          </h2>
          <p>
            We stand behind the quality and substance of our books. If an ebook or printable pack fails to meet your expectations or does not match its published scope, you may request a full refund within 14 days of purchase by submitting a ticket on our <Link href="/contact" className="text-[#008bd2] underline">Support Page</Link> with your order number.
          </p>

          <h2 className="font-serif text-lg font-bold text-[#182A27]">
            3. Personal Use License
          </h2>
          <p>
            Purchases grant you a perpetual, non-exclusive, personal license to read the materials on your personal devices and print physical copies for members of your immediate household. Redistribution, public re-uploading, or commercial resale of the digital files is strictly prohibited.
          </p>

          <h2 className="font-serif text-lg font-bold text-[#182A27]">
            4. Access Recovery
          </h2>
          <p>
            If you lose access to your downloaded files or switch computers, you may generate fresh download links at any time using our <Link href="/access" className="text-[#008bd2] underline">Access Recovery Portal</Link> or by checking your <Link href="/account/library" className="text-[#008bd2] underline">Reader Library</Link>.
          </p>
        </div>

      </div>
    </div>
  );
}
