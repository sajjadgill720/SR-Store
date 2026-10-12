'use client';
import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
export default function Newsletter() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
    const [error, setError] = useState('');
    const submit = async (event: React.FormEvent) => { event.preventDefault(); setStatus('loading'); setError(''); try {
        const response = await fetch('/api/newsletter/subscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, topics: ['general'] }) });
        const data = await response.json();
        if (!response.ok)
            throw new Error(data.error || 'Could not save your signup.');
        setStatus('success');
    }
    catch (reason) {
        setError(reason instanceof Error ? reason.message : 'Could not save your signup. Please try again.');
        setStatus('idle');
    } };
    return <form className="studio-newsletter" onSubmit={submit}>
    <label htmlFor="studio-newsletter-email">Your email for Knovera updates</label>
    <div>
    <input id="studio-newsletter-email" type="email" autoComplete="email" required value={email} onChange={event => { setEmail(event.target.value); if (status === 'success')
        setStatus('idle'); }} placeholder="Your email address" aria-describedby={error ? 'studio-newsletter-error' : undefined}/>
    <button className="studio-button" disabled={status === 'loading' || status === 'success'}>{status === 'loading' ? 'Saving…' : status === 'success' ? 'Check your inbox' : 'Join the list'}<ArrowRight size={16} aria-hidden="true"/>
    </button>
    </div>{error && <p className="studio-error" id="studio-newsletter-error" role="alert">{error}</p>}<p className="studio-caption" aria-live="polite">{status === 'success' ? 'Check your email to confirm. Already subscribed? You’re all set.' : 'Optional updates about new books and reading ideas. Confirm by email; unsubscribe anytime.'}</p>
    </form>;
}
