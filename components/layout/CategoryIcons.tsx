import React from 'react';
import Link from 'next/link';
import { 
  Percent, 
  HeartHandshake, 
  Mountain, 
  Gift, 
  Trophy, 
  TrendingUp, 
  Tag 
} from 'lucide-react';

export default function CategoryIcons() {
  const quickLinks = [
    {
      label: 'DEALS',
      href: '/books?filter=deals',
      icon: Percent,
      color: 'text-emerald-700',
      bgColor: 'bg-emerald-50 group-hover:bg-emerald-100'
    },
    {
      label: 'READER CLUB',
      href: '/reader-club',
      icon: HeartHandshake,
      color: 'text-rose-600',
      bgColor: 'bg-rose-50 group-hover:bg-rose-100'
    },
    {
      label: 'OUR STORY',
      href: '/about',
      icon: Mountain,
      color: 'text-teal-700',
      bgColor: 'bg-teal-50 group-hover:bg-teal-100'
    },
    {
      label: 'BUNDLES',
      href: '/books?category=Bundles',
      icon: Gift,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 group-hover:bg-blue-100'
    },
    {
      label: 'BESTSELLERS',
      href: '/books?sort=popular',
      icon: Trophy,
      color: 'text-sky-700',
      bgColor: 'bg-sky-50 group-hover:bg-sky-100'
    },
    {
      label: 'TRENDING',
      href: '/books?sort=newest',
      icon: TrendingUp,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50 group-hover:bg-indigo-100'
    },
    {
      label: 'FREE SAMPLES',
      href: '/free-resources',
      icon: Tag,
      color: 'text-stone-700',
      bgColor: 'bg-stone-100 group-hover:bg-stone-200'
    }
  ];

  return (
    <section className="bg-white border-b border-[#E2E8F0] py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-center font-serif text-lg sm:text-2xl font-semibold text-[#11252B] mb-6">
          Curated Ebooks & High-Yield Printables
        </h2>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-3 sm:gap-4 text-center">
          {quickLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className="group flex flex-col items-center justify-center p-2 rounded-lg hover:shadow-xs transition-all"
              >
                <div
                  className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center mb-2 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-md ${item.bgColor}`}
                >
                  <Icon className={`w-6 h-6 ${item.color} transition-transform duration-300 group-hover:scale-110`} />
                </div>
                <span className="text-[11px] sm:text-xs font-bold text-[#11252B] tracking-wider uppercase group-hover:text-[#0284C7] transition-colors">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
