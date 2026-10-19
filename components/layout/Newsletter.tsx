'use client';

import { useState } from 'react';
import { ArrowRight, CheckCircle2, Loader2, Lock } from 'lucide-react';

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
        throw new Error(data.error || 'Could not register your correspondence.');
      }
      setStatus('success');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not register your correspondence. Please try again.');
      setStatus('idle');
    }
  };

  return (
    <div className="postal-slip-card">
      {/* Side perforated notches */}
      <div className="postal-notch postal-notch-left" aria-hidden="true" />
      <div className="postal-notch postal-notch-right" aria-hidden="true" />

      {/* Postal Header with circular postmark */}
      <div className="postal-slip-head">
        <div className="postal-slip-meta">
          <span className="postal-folio">FOLIO NO. 28</span>
          <span className="postal-title">SUBSCRIBER REQUISITION SLIP</span>
        </div>

        {/* Circular Postmark Stamp */}
        <div className="postal-postmark-wrap" aria-hidden="true">
          <svg viewBox="0 0 100 100" className="dispatch-postmark">
            <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="1.2" strokeDasharray="3 2" />
            <circle cx="50" cy="50" r="37" fill="none" stroke="currentColor" strokeWidth="0.8" />
            <path id="postmark-arc" d="M 16,50 A 34,34 0 1,1 84,50" fill="none" />
            <text fill="currentColor" fontSize="7" fontWeight="700" letterSpacing="0.18em">
              <textPath href="#postmark-arc" startOffset="50%" textAnchor="middle">
                KNOVERA PRESS · 2026
              </textPath>
            </text>
            <text x="50" y="53" fill="currentColor" fontSize="10.5" fontWeight="600" textAnchor="middle" fontFamily="serif">
              POSTAL
            </text>
            <text x="50" y="66" fill="currentColor" fontSize="6" fontWeight="700" letterSpacing="0.1em" textAnchor="middle">
              DESK
            </text>
          </svg>
        </div>
      </div>

      <form className="postal-slip-form" onSubmit={submit} noValidate>
        <label htmlFor="dispatch-email-input" className="postal-input-label">
          RECIPIENT EMAIL ADDRESS
        </label>

        <div className="postal-input-underline-wrap">
          <input
            id="dispatch-email-input"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={event => {
              setEmail(event.target.value);
              if (status === 'success') setStatus('idle');
              if (error) setError('');
            }}
            placeholder="reader@domain.com"
            aria-describedby={error ? 'postal-error-msg' : undefined}
            className="postal-email-input"
          />
        </div>

        <button
          type="submit"
          className="postal-submit-btn"
          disabled={status === 'loading' || status === 'success'}
        >
          {status === 'loading' ? (
            <>
              <Loader2 size={14} className="animate-spin shrink-0" aria-hidden="true" />
              <span>Recording Requisition…</span>
            </>
          ) : status === 'success' ? (
            <>
              <CheckCircle2 size={14} className="shrink-0" aria-hidden="true" />
              <span>Correspondence Confirmed</span>
            </>
          ) : (
            <>
              <span>Subscribe to Dispatches</span>
              <ArrowRight size={13} className="shrink-0" aria-hidden="true" />
            </>
          )}
        </button>

        {error && (
          <p className="postal-error-msg" id="postal-error-msg" role="alert">
            {error}
          </p>
        )}

        {status === 'success' ? (
          <div className="postal-success-slip" role="status">
            <CheckCircle2 size={14} className="text-emerald-700 shrink-0" aria-hidden="true" />
            <span>✓ Subscribed. Check your inbox for the welcome dispatch and opening essay.</span>
          </div>
        ) : (
          <div className="postal-slip-footer">
            <Lock size={11} className="shrink-0" aria-hidden="true" />
            <span>No commercial tracking · Instant 1-click unsubscribe in every issue.</span>
          </div>
        )}
      </form>
    </div>
  );
}
