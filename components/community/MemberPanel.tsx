'use client';
import { useState } from 'react';
import Link from 'next/link';
import { importLocalActivity, refreshSession, useMemberSession } from '../../lib/community/client';
import { useCommunityActivity as useLocalActivity } from '../../lib/store/community';
import SignOut from '../auth/SignOut';

export function MemberPanel() {
  const session=useMemberSession(),local=useLocalActivity();
  const [busy,setBusy]=useState(false),[message,setMessage]=useState(''),[error,setError]=useState('');
  const hasLocal=local.joined.length+local.saved.length+local.completed.length+Object.keys(local.notes).length>0;
  return <section className="community-account" aria-label="Community account">
    <div><strong>{session.member?`Welcome, ${session.member.name}`:'Make yourself at home'}</strong><p>{!session.ready?'Connecting…':session.member?'Your reading space is connected.':'One reader account for your books, conversations, and private journal.'}</p></div>
    <div className="community-account-actions">{session.member?<><SignOut />{hasLocal && <button disabled={busy} onClick={async()=>{setBusy(true);setError('');try{await importLocalActivity(local);setMessage('Browser activity imported. Existing account reflections were preserved.');}catch(reason){setError(reason instanceof Error?reason.message:'Unable to import.');}finally{setBusy(false);}}}>Import this browser’s reading space</button>}</>:<Link className="community-button" href="/account/login?next=/community">Sign in / Create account</Link>}<button onClick={()=>void refreshSession()}>Refresh sync</button></div>
    {message && <p role="status" className="community-success">{message}</p>}{(error||session.error) && <p role="alert" className="community-error">{error||session.error}</p>}
  </section>;
}
