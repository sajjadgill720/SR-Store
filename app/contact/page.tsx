'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, CheckCircle2, Clock } from 'lucide-react';

export default function ContactSupportPage() {
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<'download_help' | 'device_setup' | 'payment_inquiry' | 'general'>('download_help');
  const [orderRef, setOrderRef] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketNumber, setTicketNumber] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !message.trim()) return;

    setIsSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerEmail: email.trim().toLowerCase(),
          subject: subject.trim() || 'General Customer Inquiry',
          category,
          orderReference: orderRef.trim() || undefined,
          message: message.trim()
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not send your request. Your message has been kept; please try again.');
      if (res.ok) {
        setTicketNumber(data.ticketNumber);
        setSubmitted(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send your request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="store-support py-12 sm:py-16 max-w-2xl mx-auto px-4">
      <div className="bg-white p-6 sm:p-10 rounded-2xl border border-stone-200 shadow-sm">
        
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-[var(--store-sage)] text-[var(--store-green)] flex items-center justify-center mx-auto mb-3">
            <Mail className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold text-[var(--store-green)] uppercase tracking-widest block mb-1">
            HUMAN CUSTOMER SUPPORT
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--store-ink)]">
            How Can We Assist You?
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-2">
            Tell us about your order or download. Include your device and order reference if you have one.
          </p>
        </div>

        {submitted ? (
          <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h2 className="font-serif text-xl font-bold text-[var(--store-ink)]">
              Ticket Received (#{ticketNumber})
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto">
              Thank you for contacting us. We have logged your request under ticket <strong>{ticketNumber}</strong> and will follow up with <strong>{email}</strong> shortly.
            </p>
            <div className="pt-2">
              <Link
                href="/books"
                className="inline-block px-5 py-2.5 bg-[var(--store-gold)] text-[var(--store-ink)] text-xs font-bold rounded"
              >
                Return to Storefront
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" aria-busy={isSubmitting}>
            {error && <p className="studio-error" role="alert">{error}</p>}
            
            <div>
              <label htmlFor="support-field-1" className="text-xs font-bold text-[var(--store-ink)] block mb-1">
                Your Email Address <span className="text-rose-500">*</span>
              </label>
              <input id="support-field-1"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="reader@example.com"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded focus:bg-white focus:outline-hidden focus:border-[var(--store-green)]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="support-field-2" className="text-xs font-bold text-[var(--store-ink)] block mb-1">
                  Inquiry Category
                </label>
              <select id="support-field-2"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as typeof category)}
                  className="w-full px-3 py-2.5 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded focus:bg-white focus:outline-hidden focus:border-[var(--store-green)]"
                >
                  <option value="download_help">Download Link or Expired Access</option>
                  <option value="device_setup">E-Reader / Tablet / Device Setup</option>
                  <option value="payment_inquiry">Payment or Receipt Question</option>
                  <option value="general">Book Content or General Question</option>
                </select>
              </div>

              <div>
                <label htmlFor="support-field-3" className="text-xs font-bold text-[var(--store-ink)] block mb-1">
                  Order Number (If known)
                </label>
              <input id="support-field-3"
                  type="text"
                  value={orderRef}
                  onChange={(e) => setOrderRef(e.target.value)}
                  placeholder="e.g. SR-2026-8910"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded focus:bg-white focus:outline-hidden focus:border-[var(--store-green)]"
                />
              </div>
            </div>

            <div>
              <label htmlFor="support-field-4" className="text-xs font-bold text-[var(--store-ink)] block mb-1">
                Subject
              </label>
              <input id="support-field-4"
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Summary of your question..."
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded focus:bg-white focus:outline-hidden focus:border-[var(--store-green)]"
              />
            </div>

            <div>
              <label htmlFor="support-field-5" className="text-xs font-bold text-[var(--store-ink)] block mb-1">
                Message & Context <span className="text-rose-500">*</span>
              </label>
              <textarea id="support-field-5"
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Please describe the issue, device model (e.g. iPad, Kobo, Android, E-reader), or question..."
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded focus:bg-white focus:outline-hidden focus:border-[var(--store-green)]"
              ></textarea>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-[var(--store-gold)] hover:bg-[var(--store-gold-hover)] text-[var(--store-ink)] font-bold text-xs sm:text-sm rounded transition-colors shadow-2xs cursor-pointer"
              >
                {isSubmitting ? 'Submitting...' : 'Send Support Ticket'}
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2 text-[11px] text-stone-500">
              <Clock className="w-3.5 h-3.5" />
              <span>Average response time: &lt; 2 business days</span>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
