import React from 'react';
import Link from 'next/link';
import { BookOpen, ShieldCheck, Lock } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#182A27] text-stone-300 border-t border-[#23584B]">
      
      {/* Newsletter Signup Strip (BetterWorldBooks-style bottom subscription) */}
      <div className="border-b border-[#23584B] py-8 px-4 bg-[#142320]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-white">
              Join the Knovera Reader Club
            </h3>
            <p className="text-xs sm:text-sm text-stone-300 mt-1 max-w-xl">
              Get notified of new book releases, free printable templates, and author release notes. Zero spam, unsubscribe anytime.
            </p>
          </div>

          <form 
            action="/api/newsletter/subscribe" 
            method="POST" 
            className="flex w-full md:w-auto max-w-md gap-2"
          >
            <input
              type="email"
              name="email"
              required
              placeholder="Enter your email address..."
              className="px-3.5 py-2.5 text-xs sm:text-sm rounded bg-stone-900/60 border border-stone-600 text-white placeholder-stone-400 focus:outline-hidden focus:border-emerald-400 flex-1"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#008bd2] hover:bg-[#0077b5] text-white font-bold text-xs sm:text-sm rounded transition-colors whitespace-nowrap"
            >
              Sign Up Free
            </button>
          </form>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          
          {/* Column 1: Help & Access */}
          <div>
            <h4 className="font-serif font-bold text-sm text-white uppercase tracking-wider mb-3">
              Help & Delivery
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/access" className="hover:text-white transition-colors">
                  Lost Purchase Recovery
                </Link>
              </li>
              <li>
                <Link href="/help" className="hover:text-white transition-colors">
                  Device & Reading Setup
                </Link>
              </li>
              <li>
                <Link href="/help" className="hover:text-white transition-colors">
                  Device Compatibility Guides
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Customer Support Form
                </Link>
              </li>
              <li>
                <Link href="/legal/refunds" className="hover:text-white transition-colors">
                  Refund & License Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Catalog */}
          <div>
            <h4 className="font-serif font-bold text-sm text-white uppercase tracking-wider mb-3">
              Catalog
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/books" className="hover:text-white transition-colors">
                  All Published Titles
                </Link>
              </li>
              <li>
                <Link href="/books?category=Productivity" className="hover:text-white transition-colors">
                  Deep Work & Productivity
                </Link>
              </li>
              <li>
                <Link href="/books?category=Personal Growth" className="hover:text-white transition-colors">
                  Habit Systems & Growth
                </Link>
              </li>
              <li>
                <Link href="/books?category=Children %26 Family" className="hover:text-white transition-colors">
                  Children&apos;s STEM & Printables
                </Link>
              </li>
              <li>
                <Link href="/books?category=Bundles" className="hover:text-white transition-colors">
                  Discounted Box Sets & Bundles
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Reader Perks */}
          <div>
            <h4 className="font-serif font-bold text-sm text-white uppercase tracking-wider mb-3">
              Reader Club
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/reader-club" className="hover:text-white transition-colors">
                  Member Benefits & Terms
                </Link>
              </li>
              <li>
                <Link href="/free-resources" className="hover:text-white transition-colors">
                  Free Worksheets & Excerpts
                </Link>
              </li>
              <li>
                <Link href="/account/library" className="hover:text-white transition-colors">
                  My Purchased Library
                </Link>
              </li>
              <li>
                <Link href="/reader-club#preferences" className="hover:text-white transition-colors">
                  Manage Topic Preferences
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: About & Mission */}
          <div>
            <h4 className="font-serif font-bold text-sm text-white uppercase tracking-wider mb-3">
              About & Trust
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About Knovera (Our Story)
                </Link>
              </li>
              <li>
                <Link href="/legal/privacy" className="hover:text-white transition-colors">
                  Privacy Policy & Data Rights
                </Link>
              </li>
              <li>
                <Link href="/legal/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#23584B] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span>&copy; 2026 Knovera. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-4 text-stone-300">
            <span className="flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>256-Bit SSL Encrypted Hosted Checkout</span>
            </span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>DRM-Free Personal License</span>
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}
