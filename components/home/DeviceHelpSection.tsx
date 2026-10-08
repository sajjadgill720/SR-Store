import React from 'react';
import Link from 'next/link';
import { Tablet, Smartphone, Laptop, Printer, ArrowRight } from 'lucide-react';

export default function DeviceHelpSection() {
  const guides = [
    {
      title: 'E-Readers',
      icon: Tablet,
      description: 'Transfer reflowable EPUB or PDF to Kindle, Kobo, or any dedicated e-reader for distraction-free reading.',
      link: '/help',
      gradient: 'from-emerald-500 to-teal-600',
      bgLight: 'bg-emerald-50',
    },
    {
      title: 'iPad & iPhone',
      icon: Smartphone,
      description: 'One-tap import into Apple Books. Adjust fonts, dark mode, and paper tint to your preference.',
      link: '/help/apple-books',
      gradient: 'from-sky-500 to-blue-600',
      bgLight: 'bg-sky-50',
    },
    {
      title: 'Android & Kobo',
      icon: Laptop,
      description: 'Read on Google Play Books, Moon+ Reader, Kobo devices, or any standard EPUB reader.',
      link: '/help/android',
      gradient: 'from-violet-500 to-indigo-600',
      bgLight: 'bg-violet-50',
    },
    {
      title: 'Home Printing',
      icon: Printer,
      description: 'Optimized 300 DPI vector PDFs with generous margins for US Letter and A4 printers.',
      link: '/help/printing',
      gradient: 'from-amber-400 to-orange-500',
      bgLight: 'bg-amber-50',
    }
  ];

  return (
    <section className="py-14 sm:py-20 bg-gradient-to-b from-[#FDFBF7] to-white border-t border-stone-100">
      <div className="max-w-7xl mx-auto px-4">
        
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs font-bold text-[#0369A1]/70 uppercase tracking-[0.2em] block mb-2">
            Universal Compatibility
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0F1D2F] tracking-tight">
            Read on Any Screen, Print at Home
          </h2>
          <p className="text-sm text-[#718096] mt-3 leading-relaxed">
            No lock-in. Industry-standard files with full lifetime ownership.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {guides.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="bg-white p-6 rounded-2xl border border-stone-100 flex flex-col justify-between group card-hover"
              >
                <div>
                  <div className={`w-12 h-12 rounded-xl ${item.bgLight} flex items-center justify-center mb-4 transition-all duration-300 group-hover:shadow-md group-hover:scale-105`}>
                    <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-sm`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <h3 className="font-serif font-bold text-base text-[#0F1D2F] mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#718096] leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <Link
                  href={item.link}
                  className="mt-5 pt-3 border-t border-stone-50 text-xs font-bold text-[#0369A1] hover:text-[#075985] flex items-center gap-1 group/link link-underline"
                >
                  <span>Step-by-step guide</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-1" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
