'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '../../lib/store/cart';
import { X, CheckCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export default function AddToCartModal() {
  const { isModalOpen, closeModal, modalItem, cartCount } = useCart();

  if (!isModalOpen || !modalItem) return null;

  const dollars = Math.floor(modalItem.price / 100);
  const cents = (modalItem.price % 100).toString().padStart(2, '0');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-white rounded-lg shadow-2xl overflow-hidden border border-stone-200 animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Close X */}
        <button
          onClick={closeModal}
          className="absolute top-3 right-3 text-stone-400 hover:text-stone-700 p-1.5 rounded-full hover:bg-stone-100 z-10 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Free Shipping / Instant Delivery Banner (Exact BetterWorldBooks Green Bar) */}
        <div className="bg-[#23584B] text-white px-4 py-2.5 text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 text-center">
          <ShieldCheck className="w-4 h-4 text-emerald-300 shrink-0" />
          <span>Your order qualifies for INSTANT DIGITAL DELIVERY — no waiting, no shipping fees</span>
        </div>

        {/* Header Heading */}
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <h3 className="text-lg sm:text-xl font-bold text-[#182A27]">
              Great choice! We added that item to your cart.
            </h3>
          </div>

          {/* Book Info Card */}
          <div className="flex gap-4 p-4 bg-stone-50 rounded-lg border border-stone-200 mb-6">
            <div className="w-20 h-28 bg-stone-200 rounded shrink-0 overflow-hidden shadow-xs border border-stone-300">
              <img
                src={modalItem.coverImage}
                alt={modalItem.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col justify-between flex-1">
              <div>
                <h4 className="font-serif font-bold text-sm sm:text-base text-[#182A27] line-clamp-2 leading-snug">
                  {modalItem.title}
                </h4>
                <p className="text-xs text-stone-500 mt-0.5">by {modalItem.author}</p>
                <div className="mt-1.5 inline-block bg-emerald-100 text-emerald-800 text-[11px] font-semibold px-2 py-0.5 rounded">
                  {modalItem.formatSelected}
                </div>
              </div>

              <div className="flex items-baseline justify-between mt-2 pt-2 border-t border-stone-200">
                <span className="text-xs text-stone-500 font-medium">Quantity: {modalItem.quantity}</span>
                <span className="text-lg font-bold text-[#182A27]">
                  ${dollars}
                  <sup className="text-xs font-semibold">{cents}</sup>
                </span>
              </div>
            </div>
          </div>

          {/* Modal Buttons (BetterWorldBooks layout: Go To Cart (Primary Blue) + Continue Shopping) */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/cart"
              onClick={closeModal}
              className="flex-1 py-3 px-4 bg-[#008bd2] hover:bg-[#0077b5] text-white font-bold text-sm text-center rounded shadow-sm flex items-center justify-center gap-2 transition-colors"
            >
              <span>Go To Cart ({cartCount})</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            
            <button
              onClick={closeModal}
              className="flex-1 py-3 px-4 border border-[#008bd2] text-[#008bd2] hover:bg-sky-50 font-bold text-sm text-center rounded transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
