'use client';

import { useState } from 'react';
import { ArrowRight, CheckCircle2, Mail, Loader2, Lock } from 'lucide-react';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [error, setError] = useState('');

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    setStatus('loading');
    setError('');
    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, topics: ['general'] }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Could not save your signup.');
      }
      setStatus('success');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not save your signup. Please try again.');
      setStatus('idle');
    }
  };

  return (
    <form className="amazon-newsletter-form studio-newsletter" onSubmit={submit} noValidate>
      <label htmlFor="amazon-newsletter-email" className="amazon-input-label block text-xs font-bold text-stone-900 mb-2">
        Email address
      </label>

      <div className="amazon-input-wrapper flex items-center bg-white border border-stone-300 rounded-xl h-12 px-3.5 mb-3 focus-within:border-stone-900 focus-within:ring-2 focus-within:ring-stone-900/10 transition-all">
        <Mail size={16} className="amazon-input-icon text-stone-400 mr-2.5 shrink-0" aria-hidden="true" />
        <input
          id="amazon-newsletter-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={event => {
            setEmail(event.target.value);
            if (status === 'success') setStatus('idle');
            if (error) setError('');
          }}
          placeholder="you@example.com"
          aria-describedby={error ? 'amazon-newsletter-error' : undefined}
          className="amazon-email-input w-full bg-transparent border-0 outline-none text-sm text-stone-900 placeholder:text-stone-400"
        />
      </div>

      <button
        type="submit"
        className="amazon-cta-btn flex items-center justify-center gap-2 w-full h-12 bg-[#171717] hover:bg-[#2A2A2A] text-white font-medium text-sm rounded-xl shadow-sm transition-all cursor-pointer"
        disabled={status === 'loading' || status === 'success'}
      >
        {status === 'loading' ? (
          <>
            <Loader2 size={15} className="animate-spin shrink-0" aria-hidden="true" />
            <span>Joining…</span>
          </>
        ) : status === 'success' ? (
          <>
            <CheckCircle2 size={15} className="shrink-0" aria-hidden="true" />
            <span>Subscribed!</span>
          </>
        ) : (
          <>
            <span>Sign up free</span>
            <ArrowRight size={14} className="shrink-0" aria-hidden="true" />
          </>
        )}
      </button>

      {error && (
        <p className="amazon-error-msg text-red-600 text-xs font-medium mt-2" id="amazon-newsletter-error" role="alert">
          {error}
        </p>
      )}

      {status === 'success' ? (
        <div className="amazon-success-box flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 text-emerald-800 text-xs font-medium mt-3">
          <CheckCircle2 size={15} className="amazon-success-icon text-emerald-600 shrink-0" aria-hidden="true" />
          <span>✓ Subscribed. Check your email for your welcome dispatch.</span>
        </div>
      ) : (
        <div className="amazon-form-footer mt-3">
          <div className="amazon-security-badge flex items-start gap-1.5 text-[11px] text-stone-500 leading-normal">
            <Lock size={12} className="text-stone-400 shrink-0 mt-0.5" aria-hidden="true" />
            <span>Zero spam · 1-click unsubscribe anytime · We respect your privacy.</span>
          </div>
        </div>
      )}
    </form>
  );
}

