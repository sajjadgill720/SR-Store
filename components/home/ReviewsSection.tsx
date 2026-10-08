import React from 'react';
import { Star, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { REVIEWS_DATA } from '../../lib/data/books';

export default function ReviewsSection() {
  return (
    <section className="py-12 sm:py-16 bg-white border-t border-[#E8E4DA]">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Header Block with Score */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-6 border-b border-stone-200 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest">
                VERIFIED READER TESTIMONIALS
              </span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#182A27]">
              What Readers Are Saying
            </h2>
          </div>

          {/* Aggregate Badge (BetterWorldBooks ShopperApproved style) */}
          <div className="flex items-center gap-3 bg-stone-50 border border-stone-200 px-4 py-2.5 rounded-lg self-start md:self-auto">
            <span className="font-serif text-2xl font-bold text-[#182A27] leading-none">
              4.9
            </span>
            <div>
              <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <span className="text-[11px] font-semibold text-stone-500 block mt-0.5">
                Over 300+ Verified Buyers
              </span>
            </div>
          </div>
        </div>

        {/* Reviews Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {REVIEWS_DATA.map((review) => (
            <div
              key={review.id}
              className="p-5 rounded-xl bg-stone-50 border border-stone-200 flex flex-col justify-between hover:border-emerald-200 hover:shadow-xs transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex text-amber-500">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  {review.isVerifiedPurchase && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded">
                      <CheckCircle2 className="w-3 h-3" />
                      Verified
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed italic">
                  "{review.reviewText}"
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-200">
                <span className="text-xs font-bold text-[#182A27] block">
                  {review.authorName}
                </span>
                <span className="text-[11px] text-stone-400">
                  {review.location} • {review.createdAt}
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
