'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  HeartHandshake, 
  CheckCircle2, 
  ShieldCheck, 
  Gift, 
  Bell, 
  ArrowRight
} from 'lucide-react';

export default function ReaderClubPage() {
  const [email, setEmail] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([
    'deep-work',
    'new-releases'
  ]);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const availableTopics = [
    { id: 'deep-work', label: 'Deep Work & Productivity Protocol updates' },
    { id: 'habit-systems', label: 'Behavioral Architecture & Habit Scorecards' },
    { id: 'children-activities', label: 'Children STEM & Mindfulness Worksheets' },
    { id: 'new-releases', label: 'New Book Releases & Direct Launch Discounts' }
  ];

  const handleToggleTopic = (topicId: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topicId) ? prev.filter((t) => t !== topicId) : [...prev, topicId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) return;

    setIsSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          topics: selectedTopics
        })
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Could not save your signup.');
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-12 sm:py-16 max-w-4xl mx-auto px-4">
      
      {/* Hero */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
          <HeartHandshake className="w-6 h-6" />
        </div>
        <span className="text-xs font-bold text-[var(--store-green)] uppercase tracking-widest block mb-1">
          READING NEWSLETTER
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[var(--store-ink)] mb-3">
          The Knovera Reader Club
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
          Choose the reading topics you care about. Explore our reader circles for guided conversations, reading practices, and your private journal.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        <Link href="/community" className="md:col-span-12 rounded-2xl border border-[#c6ddd0] bg-[var(--store-sage)] p-6 flex items-center justify-between gap-4"><div><h2 className="font-serif text-2xl text-[var(--store-ink)]">Find your reading circle</h2><p className="text-sm text-slate-600 mt-1">Thoughtful reads, small practices, and room for your perspective.</p></div><ArrowRight className="shrink-0 text-[var(--store-green)]" /></Link>
        {/* Left: Perks breakdown */}
        <div className="md:col-span-6 space-y-4">
          <div className="p-5 bg-white rounded-xl border border-stone-200 shadow-2xs flex items-start gap-3.5">
            <Gift className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-serif font-bold text-base text-[var(--store-ink)]">
                Free Companion Worksheets
              </h3>
              <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                Direct access to PDF habit scorecards, focus checklists, and children&apos;s printable sample pages without making a purchase.
              </p>
            </div>
          </div>

          <div className="p-5 bg-white rounded-xl border border-stone-200 shadow-2xs flex items-start gap-3.5">
            <Bell className="w-5 h-5 text-[var(--store-green)] shrink-0 mt-0.5" />
            <div>
              <h3 className="font-serif font-bold text-base text-[var(--store-ink)]">
                Edition Correction Alerts
              </h3>
              <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                Be the first to know when books receive revised editions or expanded companion chapters.
              </p>
            </div>
          </div>

          <div className="p-5 bg-white rounded-xl border border-stone-200 shadow-2xs flex items-start gap-3.5">
            <ShieldCheck className="w-5 h-5 text-[#9B5C36] shrink-0 mt-0.5" />
            <div>
              <h3 className="font-serif font-bold text-base text-[var(--store-ink)]">
                Strict Respect For Your Inbox
              </h3>
              <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                We send at most 1–2 thoughtful notes per month. Your address is never shared or sold.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Signup & Preferences Form */}
        <div className="md:col-span-6 bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-sm" id="preferences">
          {error && <p role="alert" className="studio-error">{error}</p>}
          {submitted ? (
            <div className="text-center py-8 space-y-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h3 className="font-serif text-2xl font-bold text-[var(--store-ink)]">
                Check your inbox
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Check <strong>{email}</strong> for a confirmation link. Already subscribed? You’re all set. Free resources are available while you wait.
              </p>
              <Link
                href="/free-resources"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[var(--store-gold)] text-[var(--store-ink)] text-xs font-bold rounded"
              >
                <span>Access Free Resources</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="font-serif text-lg font-bold text-[var(--store-ink)] pb-2 border-b border-stone-200">
                Join or Update Preferences
              </h2>

              <div>
                <label htmlFor="reader-club-email" className="text-xs font-bold text-[var(--store-ink)] block mb-1">
                  Email Address
                </label>
                <input
                  id="reader-club-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded focus:bg-white focus:outline-hidden focus:border-[var(--store-green)]"
                />
              </div>

              {/* Topic Interests Selection */}
              <div>
                <label className="text-xs font-bold text-[var(--store-ink)] block mb-2">
                  Select Your Topics of Interest:
                </label>
                <div className="space-y-2">
                  {availableTopics.map((topic) => (
                    <label
                      key={topic.id}
                      className="flex items-start gap-2.5 text-xs text-stone-700 cursor-pointer p-2 rounded hover:bg-stone-50"
                    >
                      <input
                        type="checkbox"
                        checked={selectedTopics.includes(topic.id)}
                        onChange={() => handleToggleTopic(topic.id)}
                        className="w-4 h-4 text-[var(--store-green)] rounded border-stone-300 mt-0.5"
                      />
                      <span>{topic.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 bg-[var(--store-gold)] hover:bg-[var(--store-gold-hover)] text-[var(--store-ink)] font-bold text-xs sm:text-sm rounded transition-colors shadow-2xs cursor-pointer"
                >
                  {isSubmitting ? 'Registering...' : 'Join Reader Club Free'}
                </button>
              </div>

              <p className="text-[11px] text-stone-400 text-center">
                Unsubscribe or change your topics at anytime. No mandatory purchase required.
              </p>
            </form>
          )}
        </div>

      </div>

    </div>
  );
}
