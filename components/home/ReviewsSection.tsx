import React from 'react';
import { Star, BookOpen, Quote } from 'lucide-react';
import { REVIEWS_DATA } from '../../lib/data/books';

export default function ReviewsSection() {
  return (
    <section data-reveal className="reviews-section py-14 sm:py-20 bg-white border-t border-stone-100">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-6 border-b border-stone-100 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                <BookOpen className="w-4.5 h-4.5 text-emerald-600" />
              </div>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-[0.15em]">
                READER PERSPECTIVES
              </span>
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl font-semibold text-[#0F1D2F] tracking-tight">
              A good book stays with you
            </h2>
          </div>

          {/* Aggregate Rating Badge */}
          <div className="flex items-center gap-3.5 bg-gradient-to-r from-stone-50 to-white border border-stone-100 px-5 py-3 rounded-2xl self-start md:self-auto shadow-sm">
            <span className="font-serif text-3xl font-bold text-[#0F1D2F] leading-none">
              04
            </span>
            <div>
              <div className="flex text-sky-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <span className="text-[11px] font-medium text-[#718096] block mt-0.5">
                Illustrative reader stories
              </span>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-500 mb-6">Demo content: these sample testimonials illustrate the reading experience and are not verified customer endorsements.</p>
        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {REVIEWS_DATA.filter(review => review.isApproved).map((review) => (
            <div
              key={review.id}
              className="relative p-5 rounded-2xl bg-gradient-to-b from-stone-50/50 to-white border border-stone-100 flex flex-col justify-between hover:border-sky-200/60 hover:shadow-lg hover:shadow-sky-900/5 transition-all duration-400 group card-hover"
            >
              {/* Quote decoration */}
              <Quote className="absolute top-4 right-4 w-8 h-8 text-stone-100 group-hover:text-sky-100 transition-colors" />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex text-sky-400">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <span className="text-[10px] font-semibold text-sky-700 bg-sky-50 px-2 py-1 rounded-full">Sample story</span>
                </div>

                <p className="text-sm text-[#4A5568] leading-relaxed italic">
                  &ldquo;{review.reviewText}&rdquo;
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-white text-[10px] font-bold shadow-sm">
                    {review.authorName.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#0F1D2F] block">
                      {review.authorName}
                    </span>
                    <span className="text-[11px] text-[#718096]">
                      {review.location} • {review.createdAt}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
