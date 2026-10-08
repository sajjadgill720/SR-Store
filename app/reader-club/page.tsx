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
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          topics: selectedTopics
        })
      });
      if (res.ok) {
        setSubmitted(true);
      }
    } catch (err) {
      console.error(err);
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
        <span className="text-xs font-bold text-[#23584B] uppercase tracking-widest block mb-1">
          FREE COMMUNITY MEMBERSHIP
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#182A27] mb-3">
          The Knovera Reader Club
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
          Join over 5,600+ thoughtful readers. Receive genuine bonus companion worksheets, author release notes, and early book previews. No affiliate spam, unsubscribe anytime in one click.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left: Perks breakdown */}
        <div className="md:col-span-6 space-y-4">
          <div className="p-5 bg-white rounded-xl border border-stone-200 shadow-2xs flex items-start gap-3.5">
            <Gift className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-serif font-bold text-base text-[#182A27]">
                Free Companion Worksheets
              </h3>
              <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                Direct access to PDF habit scorecards, focus checklists, and children&apos;s printable sample pages without making a purchase.
              </p>
            </div>
          </div>

          <div className="p-5 bg-white rounded-xl border border-stone-200 shadow-2xs flex items-start gap-3.5">
            <Bell className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-serif font-bold text-base text-[#182A27]">
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
              <h3 className="font-serif font-bold text-base text-[#182A27]">
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
          {submitted ? (
            <div className="text-center py-8 space-y-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h3 className="font-serif text-2xl font-bold text-[#182A27]">
                Welcome to the Reader Club!
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                We have registered <strong>{email}</strong> with your selected topics. You can explore free companion files immediately on our Free Resources hub.
              </p>
              <Link
                href="/free-resources"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#23584B] text-white text-xs font-bold rounded"
              >
                <span>Access Free Resources</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="font-serif text-lg font-bold text-[#182A27] pb-2 border-b border-stone-200">
                Join or Update Preferences
              </h2>

              <div>
                <label className="text-xs font-bold text-[#182A27] block mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded focus:bg-white focus:outline-hidden focus:border-[#23584B]"
                />
              </div>

              {/* Topic Interests Selection */}
              <div>
                <label className="text-xs font-bold text-[#182A27] block mb-2">
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
                        className="w-4 h-4 text-[#23584B] rounded border-stone-300 mt-0.5"
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
                  className="w-full py-3 px-4 bg-[#008bd2] hover:bg-[#0077b5] text-white font-bold text-xs sm:text-sm rounded transition-colors shadow-2xs cursor-pointer"
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
