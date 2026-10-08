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
      label: 'Deals',
      href: '/books?filter=deals',
      icon: Percent,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      hoverBg: 'group-hover:bg-emerald-100',
      ring: 'group-hover:ring-emerald-200'
    },
    {
      label: 'Reader Club',
      href: '/reader-club',
      icon: HeartHandshake,
      color: 'text-rose-500',
      bgColor: 'bg-rose-50',
      hoverBg: 'group-hover:bg-rose-100',
      ring: 'group-hover:ring-rose-200'
    },
    {
      label: 'Our Story',
      href: '/about',
      icon: Mountain,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      hoverBg: 'group-hover:bg-teal-100',
      ring: 'group-hover:ring-teal-200'
    },
    {
      label: 'Bundles',
      href: '/books?category=Bundles',
      icon: Gift,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      hoverBg: 'group-hover:bg-blue-100',
      ring: 'group-hover:ring-blue-200'
    },
    {
      label: 'Bestsellers',
      href: '/books?sort=popular',
      icon: Trophy,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      hoverBg: 'group-hover:bg-amber-100',
      ring: 'group-hover:ring-amber-200'
    },
    {
      label: 'New Arrivals',
      href: '/books?sort=newest',
      icon: TrendingUp,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-50',
      hoverBg: 'group-hover:bg-indigo-100',
      ring: 'group-hover:ring-indigo-200'
    },
    {
      label: 'Free Samples',
      href: '/free-resources',
      icon: Tag,
      color: 'text-stone-600',
      bgColor: 'bg-stone-100',
      hoverBg: 'group-hover:bg-stone-200',
      ring: 'group-hover:ring-stone-300'
    }
  ];

  return (
    <section className="bg-white border-b border-[#E8E4DA]/60 py-7 sm:py-10">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-center font-serif text-lg sm:text-xl font-semibold text-[#0F1D2F] mb-7 tracking-tight">
          Quick Browse
        </h2>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-4 sm:gap-5 text-center">
          {quickLinks.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className="group flex flex-col items-center justify-center p-2 rounded-xl hover:bg-stone-50/50 transition-all duration-300"
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                <div
                  className={`w-13 h-13 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center mb-2.5 transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-lg ring-1 ring-transparent ${item.ring} ${item.bgColor} ${item.hoverBg}`}
                >
                  <Icon className={`w-6 h-6 ${item.color} transition-transform duration-300 group-hover:scale-110`} />
                </div>
                <span className="text-[11px] sm:text-xs font-semibold text-[#4A5568] tracking-wide group-hover:text-[#0F1D2F] transition-colors">
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
