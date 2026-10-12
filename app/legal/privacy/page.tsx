'use client';

import React from 'react';

export default function PrivacyPage() {
  return (
    <div className="py-12 sm:py-16 max-w-4xl mx-auto px-4">
      <div className="bg-white p-6 sm:p-12 rounded-2xl border border-stone-200 shadow-sm space-y-6">
        <div>
          <span className="text-xs font-bold text-[#23584B] uppercase tracking-widest block mb-1">
            DATA PROTECTION
          </span>
          <h1 className="font-serif text-3xl font-bold text-[#182A27] mb-2">
            Privacy Policy
          </h1>
          <p className="text-xs text-stone-500">
            Last updated: October 2026
          </p>
        </div>

        <div className="space-y-4 text-xs sm:text-sm text-stone-700 leading-relaxed">
          <p>
            Knovera stores information used to fulfill digital orders, provide reader support, and operate optional reader community accounts.
          </p>

          <h2 className="font-serif text-lg font-bold text-[#182A27]">
            Information We Collect
          </h2>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Email Address:</strong> Required to issue order receipts, capability tokens, and reader library access.</li>
            <li><strong>Order Ledger:</strong> Record of purchased editions and format downloads to verify active entitlements.</li>
            <li><strong>Marketing Consent:</strong> Stored only when you explicitly opt in to the Reader Club. We do not automatically enroll buyers into marketing lists.</li>
            <li><strong>Community Accounts:</strong> Your username, display name, salted password hash, and expiring login sessions are stored when you create an account. Your display name appears on public discussions and replies.</li>
            <li><strong>Reading Space:</strong> Circles, bookmarks, reading practices, and private journals are stored with your signed-in account to synchronize across devices. Journals are visible only through your authenticated account, not public feeds or moderation tools. Server administrators can access stored data.</li>
            <li><strong>Guest Activity:</strong> Guest reading activity stays in this browser. It is uploaded only when you sign in and explicitly select the import action.</li>
            <li><strong>Public Participation:</strong> Discussions and replies are publicly visible. Content reports are available to configured moderators. Removing public content hides it; the server retains it for moderation.</li>
          </ul>

          <h2 className="font-serif text-lg font-bold text-[#182A27]">
            Payment Security
          </h2>
          <p>
            We do not store or process payment card numbers or security codes on our servers. All transactions are securely processed by authorized merchant-of-record hosted checkout providers.
          </p>

          <h2 className="font-serif text-lg font-bold text-[#182A27]">
            Data Retention & Deletion
          </h2>
          <p>
            You may request an export or deletion of your customer profile at any time by contacting our support team, subject to lawful accounting retention requirements.
          </p>
        </div>
      </div>
    </div>
  );
}
