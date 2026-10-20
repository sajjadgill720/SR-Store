'use client';
import { useState } from 'react';
import Link from 'next/link';
import { importLocalActivity, refreshSession, useMemberSession } from '../../lib/community/client';
import { useCommunityActivity as useLocalActivity } from '../../lib/store/community';
import { User, LogIn, RefreshCw } from 'lucide-react';
import { usePathname } from 'next/navigation';

export function MemberPanel() {
  const session = useMemberSession();
  const path = usePathname();
  const local = useLocalActivity();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const hasLocal = local.joined.length + local.saved.length + local.completed.length + Object.keys(local.notes).length > 0;

  return (
    <div className="community-account-strip" aria-label="Community reader account">
      {session.member ? (
        <div className="community-account-user">
          <span className="community-user-badge">
            <User size={13} aria-hidden="true" />
            <span className="community-user-name">{session.member.name}</span>
          </span>
          <div className="community-user-actions">
            <Link href="/account/library" className="community-text-button">My account</Link>
            {hasLocal && (
              <button
                className="community-sync-pill"
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  setError('');
                  try {
                    await importLocalActivity(local);
                    setMessage('Browser activity imported.');
                  } catch (reason) {
                    setError(reason instanceof Error ? reason.message : 'Unable to import.');
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                Bring browser saves into my account
              </button>
            )}
            <button 
              className="community-refresh-icon" 
              onClick={() => void refreshSession()} 
              title="Retry account sync"
              aria-label="Retry account sync"
            >
              <RefreshCw size={12} />
            </button>
          </div>
        </div>
      ) : (
        <div className="community-account-guest">
          <span className="community-subtle">{session.ready ? 'Guest mode · saves stay in this browser' : 'Checking your reading space…'}</span>
          <Link className="community-top-signin-btn" href={`/account/login?next=${encodeURIComponent(path)}`}>
            <LogIn size={13} aria-hidden="true" />
            <span>Sign in to sync or post</span>
          </Link>
        </div>
      )}
      {message && <span role="status" className="community-top-msg success">{message}</span>}
      {(error || session.error) && <span role="alert" className="community-top-msg error">{error || session.error}</span>}
    </div>
  );
}
