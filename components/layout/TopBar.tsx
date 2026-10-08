import React from 'react';
import Link from 'next/link';
import { Sparkles, Gift, Smartphone, HelpCircle } from 'lucide-react';

export default function TopBar() {
  return (
    <div className="bg-[#182A27] text-[#E8E4DA] text-xs py-1.5 px-4 border-b border-[#23584B]">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        {/* Left: Direct Author Notice / Flash Sale Promo */}
        <div className="flex items-center gap-2">
          <span className="bg-[#0284C7] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full tracking-wide uppercase shadow-xs">
            Direct Release
          </span>
          <span className="font-medium text-sky-100">
            Instant Digital Delivery • PDF & Reflowable EPUB • Free Updates for Life
          </span>
        </div>

        {/* Right: Quick Utility Links */}
        <div className="hidden md:flex items-center gap-4 text-stone-300">
          <Link href="/reader-club" className="hover:text-white flex items-center gap-1 transition-colors">
            <Sparkles className="w-3.5 h-3.5 text-sky-300" />
            <span>Reader Club</span>
          </Link>
          <Link href="/free-resources" className="hover:text-white flex items-center gap-1 transition-colors">
            <Gift className="w-3.5 h-3.5 text-teal-400" />
            <span>Free Resources</span>
          </Link>
          <Link href="/help" className="hover:text-white flex items-center gap-1 transition-colors">
            <Smartphone className="w-3.5 h-3.5 text-sky-400" />
            <span>Reading & Device Setup</span>
          </Link>
          <Link href="/contact" className="hover:text-white flex items-center gap-1 transition-colors">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Support</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
