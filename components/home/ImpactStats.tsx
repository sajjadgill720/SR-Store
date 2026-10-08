import React from 'react';
import { BookOpenCheck, HeartHandshake, Users, Award } from 'lucide-react';

export default function ImpactStats() {
  const stats = [
    {
      value: '14,200+',
      label: 'BOOKS DOWNLOADED',
      description: 'Instant DRM-free delivery globally',
      icon: BookOpenCheck,
      color: 'text-sky-700'
    },
    {
      value: '100%',
      label: 'AUTHOR-ORIGINAL EDITIONS',
      description: 'Crafted with obsessive depth and care',
      icon: HeartHandshake,
      color: 'text-teal-700'
    },
    {
      value: '5,600+',
      label: 'READER CLUB MEMBERS',
      description: 'Receiving free updates & bonus notes',
      icon: Users,
      color: 'text-[#0284C7]'
    },
    {
      value: '4.9 / 5',
      label: 'VERIFIED REVIEWS',
      description: 'Over 300+ reader endorsements',
      icon: Award,
      color: 'text-sky-600'
    }
  ];

  return (
    <section className="bg-gradient-to-r from-[#F0F7FF] via-[#F8FBFE] to-[#F0F7FF] border-y border-sky-100 py-8 sm:py-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {stats.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="group flex items-center gap-3.5 transition-transform duration-300 hover:-translate-y-0.5">
                <div className="w-12 h-12 rounded-xl bg-white shadow-xs flex items-center justify-center shrink-0 border border-sky-100 transition-all duration-300 group-hover:shadow-md group-hover:scale-105">
                  <Icon className={`w-6 h-6 ${item.color}`} />
                </div>
                <div>
                  <span className="font-serif text-xl sm:text-2xl font-bold text-[#0F2537] block leading-none">
                    {item.value}
                  </span>
                  <span className="text-[11px] sm:text-xs font-bold text-sky-800 tracking-wider uppercase block mt-1">
                    {item.label}
                  </span>
                  <span className="text-[11px] text-slate-500 hidden sm:block">
                    {item.description}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
