'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, CheckCircle2, ShieldCheck, ArrowRight, HelpCircle } from 'lucide-react';

export default function AccessRecoveryPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [foundOrders, setFoundOrders] = useState<any[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/access/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() })
      });
      const data = await res.json();
      setFoundOrders(data.orders || []);
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-12 sm:py-16 max-w-xl mx-auto px-4">
      <div className="bg-white p-6 sm:p-10 rounded-2xl border border-stone-200 shadow-sm text-center">
        
        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#23584B] flex items-center justify-center mx-auto mb-4">
          <Mail className="w-6 h-6" />
        </div>

        <span className="text-[11px] font-bold text-[#23584B] uppercase tracking-widest block mb-1">
          SELF-SERVICE ACCESS RESTORATION
        </span>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#182A27] mb-2">
          Restore Your Purchase Access
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 mb-6 leading-relaxed">
          Lost your original email receipt or switched devices? Enter the email address used at checkout to immediately recover your downloads and library tokens.
        </p>

        {submitted ? (
          <div className="space-y-6 text-left">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-900 space-y-1">
                <p className="font-bold">Access Verification Processed</p>
                <p>
                  If an active direct purchase exists for <strong>{email}</strong>, authorized capability links are displayed below and available in your Reader Library.
                </p>
              </div>
            </div>

            {foundOrders.length > 0 ? (
              <div className="space-y-3">
                <h3 className="font-serif font-bold text-sm text-[#182A27]">
                  Found {foundOrders.length} Order Record(s):
                </h3>
                {foundOrders.map((ord) => (
                  <div key={ord.id} className="p-4 bg-stone-50 rounded-lg border border-stone-200 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-[#182A27]">{ord.orderNumber}</p>
                      <p className="text-stone-500">{ord.items.length} title(s) • Paid ${(ord.totalAmount / 100).toFixed(2)}</p>
                    </div>
                    <Link
                      href={`/orders/${ord.publicToken}`}
                      className="px-3 py-1.5 bg-[#008bd2] hover:bg-[#0077b5] text-white font-bold rounded flex items-center gap-1"
                    >
                      <span>Open Receipt</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-stone-50 rounded-lg text-xs text-stone-500 text-center">
                No orders found under this exact address. Check if you purchased using an alternate email, or contact support below.
              </div>
            )}

            <div className="pt-2 text-center">
              <Link
                href="/account/library"
                className="text-xs font-bold text-[#23584B] hover:underline"
              >
                Go Directly To My Reader Library Shelf →
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div>
              <label className="text-xs font-bold text-[#182A27] block mb-1">
                Checkout Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. reader@example.com"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded focus:bg-white focus:outline-hidden focus:border-[#23584B]"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-[#23584B] hover:bg-[#182A27] text-white font-bold text-xs sm:text-sm rounded transition-colors shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isSubmitting ? 'Verifying...' : 'Restore Access'}</span>
            </button>

            <div className="pt-4 text-center">
              <Link
                href="/contact"
                className="text-xs text-stone-500 hover:text-stone-800 flex items-center justify-center gap-1"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Can't remember the purchase email? Contact Support</span>
              </Link>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
