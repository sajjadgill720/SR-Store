'use client';

import React from 'react';
import Link from 'next/link';
import { Tablet, ExternalLink, CheckCircle2, ChevronRight, HelpCircle } from 'lucide-react';

export default function KindleHelpPage() {
  return (
    <div className="py-12 sm:py-16 max-w-4xl mx-auto px-4">
      
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-stone-500 mb-6">
        <Link href="/" className="hover:text-[#23584B]">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/help" className="hover:text-[#23584B]">Help & Guides</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-stone-800 font-medium">Send to Kindle Guide</span>
      </nav>

      <div className="bg-white p-6 sm:p-10 rounded-2xl border border-stone-200 shadow-sm space-y-8">
        
        <div>
          <span className="text-xs font-bold text-[#23584B] uppercase tracking-widest block mb-1">
            OFFICIAL AMAZON INTEGRATION
          </span>
          <h1 className="font-serif text-2xl sm:text-4xl font-bold text-[#182A27] mb-3">
            How to Read Your Purchased EPUB on Amazon Kindle
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            Amazon officially accepts reflowable <strong>.EPUB</strong> and <strong>.PDF</strong> files for Kindle devices (Paperwhite, Oasis, Scribe, and the Kindle iOS/Android app). Follow this simple 3-step process.
          </p>
        </div>

        {/* Method 1: Amazon Web Tool (Fastest & Recommended) */}
        <div className="p-6 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#23584B] text-white text-xs font-bold flex items-center justify-center">
              1
            </span>
            <h2 className="font-serif font-bold text-base sm:text-lg text-[#182A27]">
              Method 1: Amazon "Send to Kindle" Webpage (Fastest)
            </h2>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-stone-700 pl-8">
            <p>
              1. Download the <strong>EPUB file</strong> of your book from your Order Receipt or Reader Library.
            </p>
            <p>
              2. Open Amazon's official Send to Kindle portal:{' '}
              <a
                href="https://www.amazon.com/sendtokindle"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#008bd2] font-bold hover:underline inline-flex items-center gap-1"
              >
                <span>amazon.com/sendtokindle</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </p>
            <p>
              3. Sign in to your Amazon account and drag the downloaded <code>.epub</code> file onto the browser window.
            </p>
            <p>
              4. Click <strong>"Send"</strong>. Within 1–2 minutes, the book will automatically sync into your Kindle library with custom font sizing, Whispersync reading progress, and page-flip enabled.
            </p>
          </div>
        </div>

        {/* Method 2: Kindle Email */}
        <div className="p-6 bg-stone-50 border border-stone-200 rounded-xl space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-stone-700 text-white text-xs font-bold flex items-center justify-center">
              2
            </span>
            <h2 className="font-serif font-bold text-base sm:text-lg text-[#182A27]">
              Method 2: Email Directly to Your @Kindle.com Address
            </h2>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-stone-700 pl-8">
            <p>
              1. Find your Send-to-Kindle email in your Amazon account under <em>Manage Your Content and Devices → Preferences → Personal Document Settings</em>.
            </p>
            <p>
              2. Attach the <code>.epub</code> file to an email and send it to your unique <code>@kindle.com</code> address.
            </p>
            <p>
              3. Amazon will convert and deliver the book to your registered devices.
            </p>
          </div>
        </div>

        {/* Important notes from proj.md section 17 */}
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 space-y-1">
          <p className="font-bold">Important Security & Integrity Notice:</p>
          <p>
            We will never ask for your Amazon account password. Amazon's official tool is completely independent and operates safely in your own browser.
          </p>
        </div>

        <div className="pt-4 border-t border-stone-200 flex justify-between items-center text-xs">
          <Link href="/help" className="text-[#008bd2] font-bold hover:underline">
            ← Back to all device guides
          </Link>
          <Link href="/contact" className="text-stone-500 hover:text-stone-800">
            Need hands-on help? Contact support
          </Link>
        </div>

      </div>

    </div>
  );
}
