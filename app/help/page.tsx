'use client';

import React from 'react';
import Link from 'next/link';
import { Tablet, Smartphone, Laptop, Printer, HelpCircle, Mail, ArrowRight } from 'lucide-react';

export default function HelpIndexPage() {
  const categories = [
    {
      title: 'Dedicated E-Readers & Tablets',
      icon: Tablet,
      desc: 'How to easily transfer reflowable EPUB and high-resolution PDF directly onto your favorite digital reading device.',
      href: '/help'
    },
    {
      title: 'Apple Books (iPad & iPhone)',
      icon: Smartphone,
      desc: 'One-tap downloading and opening EPUB files in the native iOS Books application.',
      href: '/help/kindle#apple'
    },
    {
      title: 'Android & Kobo e-Readers',
      icon: Laptop,
      desc: 'Using Google Play Books, Moon+ Reader, or direct USB sideloading on Kobo devices.',
      href: '/help/kindle#android'
    },
    {
      title: 'Home Printing & Printables',
      icon: Printer,
      desc: 'Optimal printer settings, US Letter vs A4 margins, paper weight recommendations, and household licenses.',
      href: '/help/kindle#printing'
    }
  ];

  return (
    <div className="py-12 sm:py-16 max-w-5xl mx-auto px-4">
      
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="w-12 h-12 rounded-xl bg-sky-50 text-[#008bd2] flex items-center justify-center mx-auto mb-4">
          <HelpCircle className="w-6 h-6" />
        </div>
        <span className="text-xs font-bold text-[#23584B] uppercase tracking-widest block mb-1">
          DEVICE SETUP & DELIVERY
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#182A27] mb-3">
          Reading & Device Assistance
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
          Because our books are 100% DRM-free, you have the flexibility to read on any device you prefer. Choose your platform below for tested step-by-step instructions.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
        {categories.map((c) => {
          const Icon = c.icon;
          return (
            <Link
              key={c.title}
              href={c.href}
              className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs hover:shadow-md hover:border-[#23584B]/40 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="w-10 h-10 rounded-lg bg-emerald-50 text-[#23584B] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <Icon className="w-5 h-5" />
                </div>
                <h2 className="font-serif font-bold text-lg text-[#182A27] mb-1.5 group-hover:text-[#008bd2] transition-colors">
                  {c.title}
                </h2>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  {c.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-100 text-xs font-bold text-[#008bd2] flex items-center gap-1">
                <span>View Guide</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Need human help? */}
      <div className="p-8 bg-stone-100 rounded-2xl border border-stone-200 text-center space-y-3">
        <Mail className="w-6 h-6 text-[#23584B] mx-auto" />
        <h3 className="font-serif font-bold text-lg text-[#182A27]">
          Still have questions about your purchase?
        </h3>
        <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto">
          Our human customer support answers tickets within 2 business days.
        </p>
        <Link
          href="/contact"
          className="inline-block px-5 py-2.5 bg-[#23584B] hover:bg-[#182A27] text-white text-xs font-bold rounded transition-colors"
        >
          Submit Support Ticket
        </Link>
      </div>

    </div>
  );
}
