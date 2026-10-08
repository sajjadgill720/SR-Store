import React from 'react';
import Link from 'next/link';
import { Tablet, Smartphone, Laptop, Printer, ArrowRight } from 'lucide-react';

export default function DeviceHelpSection() {
  const guides = [
    {
      title: 'Dedicated E-Readers',
      icon: Tablet,
      description: 'Transfer reflowable EPUB or PDF directly to your favorite e-reader for crisp, distraction-free reading.',
      link: '/help'
    },
    {
      title: 'iPad & iPhone (Apple Books)',
      icon: Smartphone,
      description: 'One-tap import into Apple Books. Adjust font size, dark mode theme, and background paper tint.',
      link: '/help/apple-books'
    },
    {
      title: 'Android & Kobo',
      icon: Laptop,
      description: 'Read on Google Play Books, Moon+ Reader, Kobo e-readers, or any standard EPUB reader.',
      link: '/help/android'
    },
    {
      title: 'Home Printers (Printables)',
      icon: Printer,
      description: 'Optimized 300 DPI vector PDFs with generous margins for standard US Letter and International A4 printers.',
      link: '/help/printing'
    }
  ];

  return (
    <section className="py-12 sm:py-16 bg-[#FDFBF7] border-t border-[#E8E4DA]">
      <div className="max-w-7xl mx-auto px-4">
        
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold text-[#23584B] uppercase tracking-widest block mb-1">
            SEAMLESS COMPATIBILITY
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#182A27]">
            Read On Any Screen, Or Print at Home
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-2">
            No proprietary lock-in. You receive clean, industry-standard digital files with full lifetime ownership.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {guides.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="bg-white p-5 rounded-xl border border-stone-200 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 text-[#23584B] flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif font-bold text-base text-[#182A27] mb-1.5">
                    {item.title}
                  </h3>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <Link
                  href={item.link}
                  className="mt-4 pt-3 border-t border-stone-100 text-xs font-bold text-[#008bd2] hover:text-[#0077b5] flex items-center gap-1 group"
                >
                  <span>Step-by-step guide</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
