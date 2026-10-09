import React from 'react';
import { BookOpenCheck, HeartHandshake, Users, Award } from 'lucide-react';

export default function ImpactStats() {
  const stats = [
    {
      value: 'PDF + EPUB',
      label: 'Open formats',
      description: 'Read in your preferred app',
      icon: BookOpenCheck,
      gradient: 'from-sky-500 to-blue-600',
      bgLight: 'bg-sky-50',
    },
    {
      value: 'A closer look',
      label: 'Free previews',
      description: 'Find your next chapter',
      icon: HeartHandshake,
      gradient: 'from-teal-500 to-emerald-600',
      bgLight: 'bg-teal-50',
    },
    {
      value: 'Your library',
      label: 'Personal access',
      description: 'Keep your reads together',
      icon: Users,
      gradient: 'from-blue-500 to-indigo-600',
      bgLight: 'bg-blue-50',
    },
    {
      value: 'Here to help',
      label: 'Reader support',
      description: 'Guidance for your device',
      icon: Award,
      gradient: 'from-sky-400 to-blue-500',
      bgLight: 'bg-sky-50',
    }
  ];

  return (
    <section data-reveal className="relative bg-gradient-to-r from-[#F5FAFF] via-white to-[#F5FAFF] border-y border-stone-100 py-10 sm:py-14 overflow-hidden">
      {/* Subtle accent line */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#0369A1]/10 to-transparent"></div>
      
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {stats.map((item) => {
            const Icon = item.icon;
            return (
              <div 
                key={item.label} 
                className="group flex items-center gap-4 p-4 rounded-2xl hover:bg-white hover:shadow-lg hover:shadow-stone-200/50 transition-all duration-400"
              >
                <div className={`w-14 h-14 rounded-2xl ${item.bgLight} flex items-center justify-center shrink-0 transition-all duration-400 group-hover:shadow-md group-hover:scale-105`}>
                  <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-sm`}>
                    <Icon className="w-4.5 h-4.5 text-white" />
                  </div>
                </div>
                <div>
                  <span className="font-serif text-2xl sm:text-[1.75rem] font-bold text-[#0F1D2F] block leading-none tracking-tight">
                    {item.value}
                  </span>
                  <span className="text-xs font-bold text-[#0369A1]/80 tracking-wide uppercase block mt-1.5">
                    {item.label}
                  </span>
                  <span className="text-[11px] text-[#718096] hidden sm:block mt-0.5">
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
