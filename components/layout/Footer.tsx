import React from 'react';
import Link from 'next/link';
import { BookOpen, ShieldCheck, LifeBuoy, Heart, ArrowRight } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-[#0F1D2F] to-[#0A1420] text-stone-300">
      
      {/* Newsletter */}
      <div className="relative border-b border-white/8 py-10 px-4 overflow-hidden">
        {/* Background accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[40rem] h-[20rem] bg-[#0369A1]/8 blur-[100px] rounded-full pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="text-center md:text-left">
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-white tracking-tight">
              Join the Knovera Reader Club
            </h3>
            <p className="text-xs sm:text-sm text-stone-400 mt-1.5 max-w-md">
              New releases, free templates, and author notes. Zero spam, unsubscribe anytime.
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
              placeholder="Your email address..."
              className="px-4 py-3 text-sm rounded-xl bg-white/8 border border-white/10 text-white placeholder-stone-500 focus:outline-hidden focus:border-[#0369A1] focus:ring-2 focus:ring-[#0369A1]/20 flex-1 backdrop-blur-sm transition-all"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-[#0369A1] to-[#0E7490] hover:from-[#075985] hover:to-[#0C6882] text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-sky-800/20 hover:shadow-lg hover:-translate-y-0.5 flex items-center gap-1.5 whitespace-nowrap"
            >
              <span>Join Free</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Links */}
      <div className="max-w-7xl mx-auto px-4 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-14">
          
          <div>
            <h4 className="font-serif font-bold text-sm text-white uppercase tracking-[0.12em] mb-4">
              Help & Delivery
            </h4>
            <ul className="space-y-2.5 text-xs">
              {[
                { label: 'Lost Purchase Recovery', href: '/access' },
                { label: 'Device & Reading Setup', href: '/help' },
                { label: 'Compatibility Guides', href: '/help' },
                { label: 'Customer Support', href: '/contact' },
                { label: 'Refund & License Policy', href: '/legal/refunds' },
              ].map(l => (
                <li key={l.href + l.label}>
                  <Link href={l.href} className="hover:text-white transition-colors link-underline inline-block">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-serif font-bold text-sm text-white uppercase tracking-[0.12em] mb-4">
              Catalog
            </h4>
            <ul className="space-y-2.5 text-xs">
              {[
                { label: 'All Published Titles', href: '/books' },
                { label: 'Deep Work & Productivity', href: '/books?category=Productivity' },
                { label: 'Habit Systems & Growth', href: '/books?category=Personal Growth' },
                { label: 'Children\'s STEM & Printables', href: '/books?category=Children %26 Family' },
                { label: 'Box Sets & Bundles', href: '/books?category=Bundles' },
              ].map(l => (
                <li key={l.href + l.label}>
                  <Link href={l.href} className="hover:text-white transition-colors link-underline inline-block">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-serif font-bold text-sm text-white uppercase tracking-[0.12em] mb-4">
              Reader Club
            </h4>
            <ul className="space-y-2.5 text-xs">
              {[
                { label: 'Member Benefits', href: '/reader-club' },
                { label: 'Free Worksheets & Excerpts', href: '/free-resources' },
                { label: 'My Purchased Library', href: '/account/library' },
                { label: 'Topic Preferences', href: '/reader-club#preferences' },
              ].map(l => (
                <li key={l.href + l.label}>
                  <Link href={l.href} className="hover:text-white transition-colors link-underline inline-block">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-serif font-bold text-sm text-white uppercase tracking-[0.12em] mb-4">
              About & Trust
            </h4>
            <ul className="space-y-2.5 text-xs">
              {[
                { label: 'Our Story', href: '/about' },
                { label: 'Privacy Policy', href: '/legal/privacy' },
                { label: 'Terms of Service', href: '/legal/terms' },
              ].map(l => (
                <li key={l.href + l.label}>
                  <Link href={l.href} className="hover:text-white transition-colors link-underline inline-block">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#1A4D3E] to-[#0F1D2F] flex items-center justify-center">
              <BookOpen className="w-3.5 h-3.5 text-emerald-300" />
            </div>
            <span>&copy; 2026 Knovera. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-5 text-stone-400">
            <span className="flex items-center gap-1.5">
              <LifeBuoy className="w-3.5 h-3.5 text-sky-300" />
              <Link href="/contact" className="hover:text-white transition-colors">Reader Support</Link>
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>DRM-Free License</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-rose-400" />
              <span>Made with care</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
