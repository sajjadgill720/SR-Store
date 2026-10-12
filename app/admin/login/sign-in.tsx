'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, BookOpen, Eye, EyeOff, KeyRound, Layers3, Mail, ShieldCheck } from 'lucide-react';

export default function AdminSignIn() {
  const [recovery, setRecovery] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');

  function changeMode() {
    setRecovery(!recovery);
    setMessage('');
    setShowPassword(false);
  }

  return (
    <section className="admin-access" aria-labelledby="admin-access-title">
      <div className="admin-access-top"><Link href="/"><ArrowLeft size={16} /> Back to store</Link><span><ShieldCheck size={15} /> Admin workspace</span></div>
      <div className="admin-access-shell">
        <aside className="admin-access-story">
          <div className="admin-access-brand"><BookOpen size={27} /> Knovera<span>ADMIN</span></div>
          <div className="admin-access-story-main">
            <span className="admin-access-eyebrow">BEHIND EVERY GREAT READ</span>
            <h2>Your store.<br /> Your next chapter.</h2>
            <p>A home for the work that brings books and readers together.</p>
            <div className="admin-access-art" aria-hidden="true"><div /><div /><div /><span><Layers3 size={24} /></span></div>
          </div>
          <div className="admin-access-story-foot"><span>Curate the catalog</span><i /><span>Support your readers</span></div>
        </aside>
        <div className="admin-access-form-panel">
          <div className="admin-access-status"><span /> Setup pending</div>
          <div className="admin-access-icon"><KeyRound size={24} /></div>
          <h1 id="admin-access-title">{recovery ? 'Reset your password' : 'Welcome back.'}</h1>
          <p className="admin-access-description">{recovery ? 'Use the email associated with your admin account.' : 'Sign in to manage your Knovera store.'}</p>
          <form onSubmit={(event) => {
            event.preventDefault();
            setMessage(recovery ? 'Password reset is not connected yet. No email has been sent.' : 'Sign-in is not connected yet. Supabase setup is required before access can be verified.');
          }}>
            <label htmlFor="admin-email">Email address</label>
            <div className="admin-access-input"><Mail size={18} /><input id="admin-email" name="email" type="email" autoComplete="username" placeholder="you@example.com" required /></div>
            {!recovery && <>
              <div className="admin-access-password-label"><label htmlFor="admin-password">Password</label><button type="button" onClick={changeMode}>Forgot password?</button></div>
              <div className="admin-access-input"><KeyRound size={18} /><input id="admin-password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="Enter your password" required /><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>
            </>}
            <button className="admin-access-submit" type="submit">{recovery ? 'Send reset link' : 'Sign in'}<ArrowRight size={18} /></button>
            {message && <p className="admin-access-message" role="status">{message}</p>}
          </form>
          {recovery && <button className="admin-access-return" type="button" onClick={changeMode}><ArrowLeft size={15} /> Back to sign in</button>}
          <p className="admin-access-invite"><ShieldCheck size={16} /> Admin accounts will be invitation only.</p>
          <div className="admin-access-notice"><strong>Interface preview</strong><p>Supabase authentication will be connected after project setup. This screen does not protect the dashboard or its APIs yet.</p><Link href="/admin">Preview development dashboard <ArrowRight size={14} /></Link></div>
        </div>
      </div>
      <p className="admin-access-bottom">Knovera administration <span>Built around books. Made for people.</span></p>
    </section>
  );
}
