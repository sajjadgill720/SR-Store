'use client';
import { useState } from 'react';
import Link from 'next/link';
import { importLocalActivity, refreshSession, useMemberSession } from '../../lib/community/client';
import { useCommunityActivity as useLocalActivity } from '../../lib/store/community';
import SignOut from '../auth/SignOut';
import { User, LogIn, RefreshCw } from 'lucide-react';

export function MemberPanel() {
  const session = useMemberSession();
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
            <SignOut />
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
                Sync local activity
              </button>
            )}
            <button 
              className="community-refresh-icon" 
              onClick={() => void refreshSession()} 
              title="Refresh session sync"
              aria-label="Refresh session sync"
            >
              <RefreshCw size={12} />
            </button>
          </div>
        </div>
      ) : (
        <div className="community-account-guest">
          <Link className="community-top-signin-btn" href="/account/login?next=/community">
            <LogIn size={13} aria-hidden="true" />
            <span>Sign in / Join</span>
          </Link>
        </div>
      )}
      {message && <span role="status" className="community-top-msg success">{message}</span>}
      {(error || session.error) && <span role="alert" className="community-top-msg error">{error || session.error}</span>}
    </div>
  );
}
