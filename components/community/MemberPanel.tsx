'use client';
import { useState } from 'react';
import { account, importLocalActivity, refreshSession, useMemberSession } from '../../lib/community/client';
import { useCommunityActivity as useLocalActivity } from '../../lib/store/community';

export function MemberPanel() {
  const session = useMemberSession();
  const local = useLocalActivity();
  const [mode, setMode] = useState('login');
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const hasLocal = local.joined.length + local.saved.length + local.completed.length + Object.keys(local.notes).length > 0;
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError('');
    const form = new FormData(event.currentTarget);
    try { await account({ action: mode, username: form.get('username'), password: form.get('password'), name: form.get('name') }); setOpen(false); setMessage('Signed in. Your account reading space syncs across devices.'); }
    catch (error) { setError(error instanceof Error ? error.message : 'Unable to sign in.'); }
    finally { setBusy(false); }
  }
  return <section className="community-account" aria-label="Community account"><div><strong>{session.member ? `Welcome, ${session.member.name}` : 'Make yourself at home'}</strong><p>{!session.ready ? 'Connecting…' : session.member ? 'Your reading space is connected.' : 'Join the conversation. Keep your favorites and journal together.'}</p></div><div className="community-account-actions">{session.member ? <><button disabled={busy} onClick={async () => { setBusy(true); setError(''); try { await account({ action: 'logout' }); setMessage('Signed out. Account journals are no longer shown on this browser.'); } catch (error) { setError(String(error)); } finally { setBusy(false); } }}>Sign out</button>{hasLocal && <button disabled={busy} onClick={async () => { setBusy(true); setError(''); try { await importLocalActivity(local); setMessage('Browser activity imported. Existing account reflections were preserved.'); } catch (error) { setError(String(error)); } finally { setBusy(false); } }}>Import this browser’s reading space</button>}</> : <button disabled={!session.ready} onClick={() => setOpen(!open)}>{open ? 'Close sign-in' : 'Sign in / Create account'}</button>}<button onClick={() => void refreshSession()}>Refresh sync</button></div>{open && !session.member && <form className="community-auth" onSubmit={submit}><div className="community-tabs"><button type="button" aria-pressed={mode === 'login'} onClick={() => setMode('login')}>Sign in</button><button type="button" aria-pressed={mode === 'register'} onClick={() => setMode('register')}>Create account</button></div>{mode === 'register' && <label>Display name<input name="name" autoComplete="nickname" required minLength={2} maxLength={60} /></label>}<label>Username<input name="username" autoComplete="username" pattern="[a-zA-Z0-9_-]+" required minLength={3} maxLength={32} /></label><label>Password<input name="password" type="password" autoComplete={mode === 'register' ? 'new-password' : 'current-password'} required minLength={10} maxLength={128} /></label><p>Your display name appears on public posts and replies. Your journal remains private. Keep your password safe; password recovery is not available yet.</p><button className="community-button" disabled={busy}>{busy ? 'Please wait…' : mode === 'register' ? 'Create account' : 'Sign in'}</button></form>}{message && <p role="status" className="community-success">{message}</p>}{(error || session.error) && <p role="alert" className="community-error">{error || session.error}</p>}</section>;
}
