'use client';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Eye, EyeOff, Mail, LockKeyhole, UserRound } from 'lucide-react';
import { browserAuth } from '@/lib/auth/browser';
import { authDestination } from '@/lib/auth/navigation';

export default function AuthForm({ admin = false, update = false, signup = false }: {admin?:boolean;update?:boolean;signup?:boolean}) {
  const params = useSearchParams();
  const [mode,setMode] = useState<'login'|'signup'|'forgot'|'update'>(update?'update':signup?'signup':'login');
  const [showPassword,setShowPassword] = useState(false);
  const googleEnabled = process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === 'true';
  const [busy,setBusy] = useState(false);
  const [email,setEmail] = useState('');
  const [message,setMessage] = useState('');
  const [error,setError] = useState(params.get('error') === 'link' ? 'This link could not be verified. Request a new link, or open it in the browser where you started.' : params.get('error') === 'admin' ? 'Your account does not have administrator access.' : '');
  const next = admin ? '/admin' : authDestination(params.get('next'));
  const callback = (destination:string) => `${window.location.origin}/auth/callback?next=${encodeURIComponent(destination)}`;
  async function finish() {
    const response = await fetch('/api/auth/session',{cache:'no-store'});
    const result = await response.json();
    if (!response.ok || !result.user) throw new Error(result.error || 'Confirm your email before signing in.');
    if (next==='/admin' && result.user.role!=='admin') throw new Error('You are signed in as a reader. Administrator access must be granted by the owner.');
    window.location.assign(next);
  }
  async function submit(event:React.FormEvent<HTMLFormElement>) {
    event.preventDefault();setBusy(true);setError('');setMessage('');
    const values = new FormData(event.currentTarget);
    try {
      const client = browserAuth();
      const password = String(values.get('password') || '');
      if (mode==='login') {
        const {error}=await client.auth.signInWithPassword({email:email.trim(),password});
        if(error) throw error;
        await finish();
      } else if(mode==='signup') {
        const {data,error}=await client.auth.signUp({email:email.trim(),password,options:{data:{name:String(values.get('name')||'').trim()},emailRedirectTo:callback(next)}});
        if(error) throw error;
        if(data.session) await finish();
        else setMessage('Check your email for a confirmation link. If you already have an account, sign in or reset your password.');
      } else if(mode==='forgot') {
        const {error}=await client.auth.resetPasswordForEmail(email.trim(),{redirectTo:callback('/account/update-password')});
        if(error) throw error;
        setMessage('If an account exists for this address, you will receive a password-reset email.');
      } else {
        if(password!==values.get('confirm')) throw new Error('The passwords do not match.');
        const user=await client.auth.getUser();
        if(user.error || !user.data.user) throw new Error('Open a fresh password-reset link from your email first.');
        const {error}=await client.auth.updateUser({password});
        if(error) throw error;
        const signedOut=await client.auth.signOut({scope:'global'});
        if(signedOut.error) throw signedOut.error;
        await fetch('/api/auth/logout',{method:'POST'});
        setMessage('Password updated. Sign in with your new password.');setMode('login');
      }
    } catch(reason) {setError(reason instanceof Error?reason.message:'Could not complete your request. Please try again.');}
    finally {setBusy(false);}
  }
  async function resend() {
    setBusy(true);setError('');setMessage('');
    try {
      if(!email.trim()) throw new Error('Enter your email address first.');
      const {error}=await browserAuth().auth.resend({type:'signup',email:email.trim(),options:{emailRedirectTo:callback(next)}});
      if(error) throw error;
      setMessage('If confirmation is needed, a new link will arrive in your inbox.');
    } catch(reason) {setError(reason instanceof Error?reason.message:'Could not resend your confirmation.');}
    finally {setBusy(false);}
  }
  function switchMode(value:typeof mode) {setMode(value);setError('');setMessage('');}
  async function google() {
    setBusy(true);setError('');setMessage('');
    try {
      const { error } = await browserAuth().auth.signInWithOAuth({provider:'google',options:{redirectTo:callback(next)}});
      if(error) throw error;
    } catch(reason) {setError(reason instanceof Error ? reason.message : 'Google sign-in is unavailable. Please use email.');setBusy(false);}
  }
  const creating = mode==='signup';
  return <section className="store-auth">
    <aside className="store-auth-story">
      <Link href="/" className="store-auth-brand">KNOVERA <span>DIGITAL STORE</span></Link>
      <div className="store-auth-story-copy"><h2>{creating?<>Start your <em>shelf.</em></>:<>Your library, <em>kept for you.</em></>}</h2>
      <p>{creating?'Make room for your next great idea. Keep your ebooks and digital purchases together in one place.':'Your ebooks, your discoveries, your space. Sign in to find your purchases and return to your reading.'}</p></div>
      <div className="store-reader-card" aria-hidden="true"><span className="store-card-ribbon"/><strong>KNOVERA</strong><small>YOUR DIGITAL SHELF</small><div>{creating?'No. ——':'A world of ideas.'}</div><i>{creating?'Your next chapter starts here.':'Always within reach.'}</i><hr/><small>EBOOKS · GUIDES · DIGITAL GOODS</small></div>
      <Link href="/" className="store-auth-back"><ArrowLeft size={15}/> Back to store</Link>
    </aside>
    <div className="store-auth-panel"><div className="store-auth-form-wrap">
      <Link href="/" className="store-auth-mobile-brand">KNOVERA · DIGITAL STORE</Link>
      <span className="store-auth-kicker">{admin?'ADMIN SIGN IN':creating?'CREATE ACCOUNT':mode==='forgot'?'PASSWORD RECOVERY':mode==='update'?'ACCOUNT SECURITY':'SIGN IN'}</span>
      <h1>{creating?<>Start your <em>shelf.</em></>:mode==='forgot'?<>A fresh <em>start.</em></>:mode==='update'?<>Make it <em>secure.</em></>:<>Welcome <em>back.</em></>}</h1>
      <p className="store-auth-intro">{admin?'Use the account granted access by the store owner.':creating?'One account for the ebooks and digital goods you collect.':mode==='forgot'?'Enter your account email and we’ll send you a password reset link.':mode==='update'?'Choose a new password with at least 10 characters.':'Sign in to reach your library and download your ebooks again.'}</p>
      {(mode==='login'||creating) && !admin && <><button type="button" className="store-auth-google" disabled={busy || !googleEnabled} aria-describedby={!googleEnabled?'google-availability':undefined} onClick={()=>void google()}><span aria-hidden="true">G</span> Continue with Google</button>{!googleEnabled && <p id="google-availability" className="store-auth-provider-note">Google sign-in is currently unavailable. Please use email.</p>}<div className="store-auth-divider">or with email</div></>}
      <form className="store-auth-form" onSubmit={submit} aria-busy={busy}>
        {creating && <label>Display name<div className="store-auth-input"><UserRound size={18}/><input name="name" placeholder="Your name" autoComplete="nickname" required minLength={2} maxLength={60}/></div></label>}
        {mode!=='update' && <label>Email address<div className="store-auth-input"><Mail size={18}/><input name="email" placeholder="you@example.com" type="email" autoComplete="email" required value={email} onChange={event=>setEmail(event.target.value)}/></div></label>}
        {mode!=='forgot' && <label>{mode==='update'?'New password':'Password'}<div className="store-auth-input"><LockKeyhole size={18}/><input name="password" placeholder={mode==='login'?'Your password':'At least 10 characters'} type={showPassword?'text':'password'} autoComplete={mode==='login'?'current-password':'new-password'} required minLength={mode==='login'?1:10} maxLength={128}/><button type="button" onClick={()=>setShowPassword(!showPassword)} aria-label={showPassword?'Hide password':'Show password'} aria-pressed={showPassword}>{showPassword?<EyeOff size={19}/>:<Eye size={19}/>}</button></div></label>}
        {mode==='update' && <label>Confirm new password<div className="store-auth-input"><LockKeyhole size={18}/><input name="confirm" placeholder="Repeat your new password" type={showPassword?'text':'password'} autoComplete="new-password" required minLength={10} maxLength={128}/></div></label>}
        {creating && <p className="store-auth-note">Your display name appears in the community. Your email and reading journal stay private.</p>}
        {mode==='login' && <button type="button" className="store-auth-forgot" disabled={busy} onClick={()=>switchMode('forgot')}>Forgot password?</button>}
        {error && <p className="store-auth-error" role="alert">{error} <Link href="/contact">Get help</Link></p>}{message && <p className="store-auth-success" role="status">{message}</p>}
        <button className="store-auth-submit" disabled={busy}>{busy?'Please wait…':creating?'Create account':mode==='forgot'?'Send reset link':mode==='update'?'Save password':'Sign in'}<ArrowRight size={17}/></button>
      </form>
      {creating && <p className="store-auth-terms">By creating an account you agree to the <Link href="/legal/terms">Terms</Link> and <Link href="/legal/privacy">Privacy Policy</Link>.</p>}
      <div className="store-auth-switch">{mode==='login'&&!admin?<>New to Knovera? <Link href={`/account/signup?next=${encodeURIComponent(next)}`}>Create an account</Link></>:creating?<>Already have an account? <Link href={`/account/login?next=${encodeURIComponent(next)}`}>Sign in</Link></>:mode!=='login'?<button disabled={busy} onClick={()=>switchMode('login')}>Back to sign in</button>:null}</div>
      {(mode==='login'||creating) && <button className="store-auth-resend" disabled={busy} onClick={()=>void resend()}>Resend confirmation email</button>}
      <p className="store-auth-help"><Link href="/access">Find a previous order</Link><span> · </span><Link href="/contact">Need help?</Link></p>
    </div></div>
  </section>;
}
