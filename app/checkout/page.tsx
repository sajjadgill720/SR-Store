'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '../../lib/store/cart';
import { 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Terminal, 
  CreditCard 
} from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, cartTotal, clearCart } = useCart();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (items.length === 0) {
    return (
      <div className="py-16 max-w-xl mx-auto px-4 text-center">
        <h1 className="font-serif text-2xl font-bold text-[#182A27] mb-2">
          Your cart is empty
        </h1>
        <p className="text-xs text-stone-500 mb-4">
          Please add a book to your cart before proceeding to checkout.
        </p>
        <Link
          href="/books"
          className="inline-block px-5 py-2.5 bg-[#008bd2] text-white font-bold text-xs rounded"
        >
          Browse Catalog
        </Link>
      </div>
    );
  }

  const handleSimulatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address to receive your book access.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const response = await fetch('/api/checkouts/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerEmail: email.trim(),
          customerName: name.trim() || undefined,
          items: items.map((i) => ({
            bookId: i.bookId,
            quantity: i.quantity
          }))
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Checkout simulation failed');
      }

      // Save customer email to localStorage for automatic library recognition
      try {
        localStorage.setItem('sr_reader_email', email.trim().toLowerCase());
      } catch (e) {}

      // Clear the cart
      clearCart();

      // Redirect to return page with public capability token
      router.push(`/checkout/return?token=${data.publicToken}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred during test checkout.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-8 sm:py-12 max-w-4xl mx-auto px-4">
      
      {/* Title */}
      <div className="text-center mb-8">
        <span className="text-xs font-bold text-[#23584B] uppercase tracking-widest block mb-1">
          SECURE DIRECT CHECKOUT
        </span>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#182A27]">
          Complete Your Direct Purchase
        </h1>
      </div>

      {/* Development Simulator Active Banner (proj.md Section 1 Requirement) */}
      <div className="mb-8 p-4 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 shadow-2xs">
        <div className="flex items-start gap-3">
          <Terminal className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm space-y-1">
            <p className="font-bold">
              Development Checkout Simulator Active
            </p>
            <p className="text-amber-800">
              Live Lemon Squeezy merchant credentials are not yet configured in this local environment. 
              Submitting this form exercises the exact server-side fulfillment engine, durable order creation, and entitlement grants without charging a credit card.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left: Email & Delivery form */}
        <div className="md:col-span-7 bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-6">
          <h2 className="font-serif text-lg font-bold text-[#182A27] pb-3 border-b border-stone-200">
            Reader Delivery Information
          </h2>

          <form onSubmit={handleSimulatePayment} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-[#182A27] block mb-1">
                Your Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="reader@example.com"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded focus:bg-white focus:outline-hidden focus:border-[#23584B]"
              />
              <p className="text-[11px] text-stone-500 mt-1">
                Your receipt, permanent library access link, and format downloads are bound to this email.
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-[#182A27] block mb-1">
                Full Name (Optional)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded focus:bg-white focus:outline-hidden focus:border-[#23584B]"
              />
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 bg-[#008bd2] hover:bg-[#0077b5] disabled:bg-stone-400 text-white font-bold text-sm rounded shadow-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <CreditCard className="w-4 h-4" />
                <span>
                  {isSubmitting ? 'Simulating Fulfillment...' : `Complete Test Purchase ($${(cartTotal / 100).toFixed(2)})`}
                </span>
              </button>
            </div>

            <div className="text-[11px] text-stone-500 text-center flex items-center justify-center gap-1.5 pt-2">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Simulated payment executes atomic fulfillment in local database</span>
            </div>
          </form>
        </div>

        {/* Right: Items Review */}
        <div className="md:col-span-5 bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-4">
          <h2 className="font-serif text-lg font-bold text-[#182A27] pb-2 border-b border-stone-200">
            Order Review
          </h2>

          <div className="space-y-3">
            {items.map((i) => (
              <div key={i.bookId} className="flex gap-3 items-center text-xs">
                <img src={i.coverImage} alt={i.title} className="w-10 h-14 object-cover rounded border border-stone-200" />
                <div className="flex-1">
                  <p className="font-bold text-[#182A27] line-clamp-1">{i.title}</p>
                  <p className="text-stone-500">Qty: {i.quantity}</p>
                </div>
                <span className="font-semibold text-[#182A27]">
                  ${((i.price * i.quantity) / 100).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-stone-200 space-y-2 text-xs">
            <div className="flex justify-between text-stone-600">
              <span>Delivery</span>
              <span className="text-emerald-700 font-bold">Instant Download</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-[#182A27] pt-2 border-t border-stone-100">
              <span>Total Due</span>
              <span>${(cartTotal / 100).toFixed(2)}</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
