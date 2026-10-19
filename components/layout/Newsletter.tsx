'use client';
import { useState } from 'react';
import { ArrowRight, CheckCircle2, Mail, Loader2, Sparkles } from 'lucide-react';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [error, setError] = useState('');

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
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
    <form className="studio-newsletter" onSubmit={submit} noValidate>
      <div className="studio-newsletter-header">
        <label htmlFor="studio-newsletter-email" className="studio-newsletter-label">
          <Sparkles size={13} className="text-amber-300" aria-hidden="true" />
          <span>JOIN THE PRIVATE DISPATCH</span>
        </label>
      </div>

      <div className="studio-newsletter-capsule">
        <div className="studio-newsletter-input-wrap">
          <Mail size={16} className="studio-newsletter-input-icon" aria-hidden="true" />
          <input
            id="studio-newsletter-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={event => {
              setEmail(event.target.value);
              if (status === 'success') setStatus('idle');
            }}
            placeholder="Enter your email address…"
            aria-describedby={error ? 'studio-newsletter-error' : undefined}
            className="studio-newsletter-input"
          />
        </div>

        <button
          type="submit"
          className="studio-newsletter-submit"
          disabled={status === 'loading' || status === 'success'}
        >
          {status === 'loading' ? (
            <>
              <Loader2 size={16} className="animate-spin" aria-hidden="true" />
              <span>Joining…</span>
            </>
          ) : status === 'success' ? (
            <>
              <CheckCircle2 size={16} aria-hidden="true" />
              <span>Subscribed</span>
            </>
          ) : (
            <>
              <span>Join the list</span>
              <ArrowRight size={16} aria-hidden="true" />
            </>
          )}
        </button>
      </div>

      {error && (
        <p className="studio-error" id="studio-newsletter-error" role="alert">
          {error}
        </p>
      )}

      <div className="studio-newsletter-footer">
        <span className="studio-caption" aria-live="polite">
          {status === 'success'
            ? '✓ Check your inbox to confirm. Welcome to Knovera Press.'
            : 'Curated essays & edition releases · Zero spam · Single-click unsubscribe.'}
        </span>
      </div>
    </form>
  );
}
