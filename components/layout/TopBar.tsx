import React from 'react';
import Link from 'next/link';
import { Sparkles, Gift, Smartphone, HelpCircle, Zap } from 'lucide-react';

export default function TopBar() {
  return (
    <div className="relative bg-gradient-to-r from-[#0F1D2F] via-[#132B3E] to-[#0F1D2F] text-white/90 text-xs py-2 px-4 overflow-hidden">
      {/* Subtle animated shimmer */}
      <div className="absolute inset-0 animate-shimmer opacity-20 pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 relative z-10">
        {/* Left: Key value proposition */}
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wide uppercase border border-white/10">
            <Zap className="w-3 h-3 text-sky-300 fill-sky-300" />
            Instant Delivery
          </span>
          <span className="font-medium text-white/75 hidden sm:inline">
            PDF & EPUB • DRM-Free • Lifetime Updates
          </span>
        </div>

        {/* Right: Quick Utility Links */}
        <div className="hidden md:flex items-center gap-1">
          <Link href="/reader-club" className="hover:bg-white/10 px-2.5 py-1 rounded-full flex items-center gap-1.5 transition-all duration-200">
            <Sparkles className="w-3.5 h-3.5 text-sky-300" />
            <span>Reader Club</span>
          </Link>
          <Link href="/free-resources" className="hover:bg-white/10 px-2.5 py-1 rounded-full flex items-center gap-1.5 transition-all duration-200">
            <Gift className="w-3.5 h-3.5 text-emerald-300" />
            <span>Free Resources</span>
          </Link>
          <Link href="/help" className="hover:bg-white/10 px-2.5 py-1 rounded-full flex items-center gap-1.5 transition-all duration-200">
            <Smartphone className="w-3.5 h-3.5 text-sky-300" />
            <span>Device Setup</span>
          </Link>
          <Link href="/contact" className="hover:bg-white/10 px-2.5 py-1 rounded-full flex items-center gap-1.5 transition-all duration-200">
            <HelpCircle className="w-3.5 h-3.5 text-white/60" />
            <span>Support</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
