'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '../../lib/store/cart';
import { 
  Trash2, 
  Plus, 
  Minus, 
  ShieldCheck, 
  ArrowRight, 
  ShoppingBag, 
  Lock, 
  Tag, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function CartPage() {
  const router = useRouter();
  const { items, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();
    if (code === 'DIRECT5' || code === 'READER10') {
      const discount = code === 'DIRECT5' ? 500 : Math.round(cartTotal * 0.1);
      setCouponDiscount(discount);
      setCouponApplied(true);
      setCouponError('');
    } else {
      setCouponError('Invalid coupon code. Try code "DIRECT5" for $5 off.');
    }
  };

  const finalTotal = Math.max(0, cartTotal - couponDiscount);
  const dollars = Math.floor(finalTotal / 100);
  const cents = (finalTotal % 100).toString().padStart(2, '0');

  if (items.length === 0) {
    return (
      <div className="py-16 max-w-4xl mx-auto px-4 text-center">
        <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4 text-stone-400">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#182A27] mb-2">
          Your Shopping Cart is Empty
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mb-6 max-w-md mx-auto">
          Explore our published nonfiction books and printable learning kits. Every purchase includes instant downloads and lifetime updates.
        </p>
        <Link
          href="/books"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#008bd2] hover:bg-[#0077b5] text-white font-bold text-sm rounded shadow-sm transition-colors"
        >
          <span>Browse All Books</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="py-8 sm:py-12 max-w-7xl mx-auto px-4">
      
      {/* Title */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-200">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#182A27]">
          My Cart ({items.reduce((s, i) => s + i.quantity, 0)} items)
        </h1>
        <button
          onClick={clearCart}
          className="text-xs text-stone-400 hover:text-rose-600 transition-colors"
        >
          Clear all items
        </button>
      </div>

      {/* Free Delivery Qualification Banner (Exact BetterWorldBooks Green Bar) */}
      <div className="mb-8 p-3.5 bg-[#23584B] text-white rounded-lg flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold shadow-xs">
        <ShieldCheck className="w-4 h-4 text-emerald-300 shrink-0" />
        <span>Your order qualifies for FREE INSTANT DIGITAL DELIVERY — reflowable EPUB + PDF</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          {items.map((item) => {
            const itemDollars = Math.floor((item.price * item.quantity) / 100);
            const itemCents = ((item.price * item.quantity) % 100).toString().padStart(2, '0');

            return (
              <div
                key={item.bookId}
                className="bg-white p-4 sm:p-5 rounded-xl border border-stone-200 shadow-2xs flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
              >
                {/* Book cover & Details */}
                <div className="flex gap-4 items-center flex-1">
                  <div className="w-16 h-24 sm:w-20 sm:h-28 bg-stone-100 rounded shrink-0 overflow-hidden shadow-xs border border-stone-200">
                    <img
                      src={item.coverImage}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="space-y-1">
                    <Link
                      href={`/books/${item.slug}`}
                      className="font-serif font-bold text-sm sm:text-base text-[#182A27] hover:text-[#008bd2] transition-colors line-clamp-2"
                    >
                      {item.title}
                    </Link>
                    <p className="text-xs text-stone-500">by {item.author}</p>
                    <div className="inline-block bg-stone-100 text-stone-700 text-[11px] font-semibold px-2 py-0.5 rounded">
                      {item.formatSelected}
                    </div>
                    <div className="text-[11px] text-emerald-700 flex items-center gap-1 font-medium">
                      <span>Direct Author Fulfillment</span>
                    </div>
                  </div>
                </div>

                {/* Quantity Controls & Price */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 pt-3 sm:pt-0 border-t sm:border-0 border-stone-100">
                  <div className="text-right">
                    <span className="text-base sm:text-lg font-bold text-[#182A27]">
                      ${itemDollars}
                      <sup className="text-xs font-semibold">{itemCents}</sup>
                    </span>
                  </div>

                  {/* Stepper buttons (BetterWorldBooks standard) */}
                  <div className="flex items-center border border-stone-300 rounded bg-stone-50">
                    <button
                      onClick={() => updateQuantity(item.bookId, item.quantity - 1)}
                      className="p-1.5 hover:bg-stone-200 text-stone-600 transition-colors"
                      title="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 text-xs font-bold text-[#182A27]">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.bookId, item.quantity + 1)}
                      className="p-1.5 hover:bg-stone-200 text-stone-600 transition-colors"
                      title="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(item.bookId)}
                    className="text-xs text-stone-400 hover:text-rose-600 flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                </div>

              </div>
            );
          })}

          <div className="pt-2">
            <Link
              href="/books"
              className="text-xs font-bold text-[#008bd2] hover:underline"
            >
              ← Continue Shopping
            </Link>
          </div>
        </div>

        {/* Right Column: BetterWorldBooks Order Summary Card */}
        <div className="lg:col-span-4 bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-6">
          <h2 className="font-serif text-lg font-bold text-[#182A27] pb-3 border-b border-stone-200">
            Order Summary
          </h2>

          <div className="space-y-2.5 text-xs sm:text-sm">
            <div className="flex justify-between text-stone-600">
              <span>Items Subtotal</span>
              <span className="font-semibold text-[#182A27]">${(cartTotal / 100).toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-stone-600">
              <span>Digital Delivery</span>
              <span className="font-bold text-emerald-700">FREE</span>
            </div>

            {couponApplied && (
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>Coupon Discount ({couponCode})</span>
                <span>-${(couponDiscount / 100).toFixed(2)}</span>
              </div>
            )}

            <div className="pt-3 border-t border-stone-200 flex justify-between text-base font-bold text-[#182A27]">
              <span>Total</span>
              <span>${dollars}.{cents}</span>
            </div>
          </div>

          {/* Primary Proceed to Checkout button */}
          <Link
            href="/checkout"
            className="w-full py-3.5 px-4 bg-[#008bd2] hover:bg-[#0077b5] text-white font-bold text-sm rounded shadow-sm flex items-center justify-center gap-2 transition-colors text-center"
          >
            <Lock className="w-4 h-4" />
            <span>Proceed To Checkout</span>
          </Link>

          {/* Coupon Input Form */}
          <form onSubmit={handleApplyCoupon} className="pt-4 border-t border-stone-200">
            <label className="text-xs font-bold text-[#182A27] block mb-1.5">
              Have a promotional code?
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Enter coupon (e.g. DIRECT5)"
                className="flex-1 px-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded focus:bg-white focus:outline-hidden focus:border-[#23584B]"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold rounded transition-colors"
              >
                Apply
              </button>
            </div>
            {couponError && (
              <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                <span>{couponError}</span>
              </p>
            )}
            {couponApplied && (
              <p className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Coupon code applied successfully!</span>
              </p>
            )}
          </form>

          {/* Direct Author Guarantee */}
          <div className="p-3 bg-stone-50 rounded text-[11px] text-stone-600 space-y-1">
            <p className="font-bold text-[#182A27]">Direct Buyer Protection:</p>
            <p>• Immediate download capability links on order return page.</p>
            <p>• Access restoration anytime via email on /access.</p>
            <p>• DRM-free files with universal e-reader compatibility.</p>
          </div>

        </div>

      </div>

    </div>
  );
}
