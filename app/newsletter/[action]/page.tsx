import { Suspense } from 'react';
import Link from 'next/link';
export const metadata = { robots: { index: false, follow: false }, referrer: 'no-referrer' as const };
async function NewsletterAction({ params, searchParams }: { params: Promise<{ action: string }>; searchParams: Promise<{ token?: string; done?: string }> }) {
  const { action } = await params;
  const { token, done } = await searchParams;
  const unsubscribe = action === 'unsubscribe';
  if (!['confirm', 'unsubscribe'].includes(action)) return <div className="storefront"><h1>Page not found</h1></div>;
  return <div className="storefront"><div className="studio-page-heading"><span className="studio-kicker">KNOVERA READER CLUB</span><h1>{done === '1' ? (unsubscribe ? 'You’re unsubscribed.' : 'Welcome to the Reader Club.') : unsubscribe ? 'Leave the mailing list?' : 'Confirm your subscription.'}</h1><p>{done === '1' ? (unsubscribe ? 'You will no longer receive newsletter campaigns. Purchase emails are unaffected.' : 'Your email is confirmed. You can unsubscribe from any newsletter.') : 'error' === done ? 'This link is invalid or expired. Please request a new one.' : token ? (unsubscribe ? 'Confirm below to stop receiving newsletters.' : 'Confirm below to receive book news and reading ideas.') : 'Check your inbox for a confirmation link. If you’re already subscribed, you’re all set.'}</p></div>{token && !done && <form action={`/api/newsletter/${action}`} method="post"><input type="hidden" name="token" value={token} /><button className="studio-button" type="submit">{unsubscribe ? 'Unsubscribe' : 'Confirm subscription'}</button></form>}<Link className="studio-text-link" href="/">Back to Knovera</Link></div>;
}
export default function Page(props: { params: Promise<{ action: string }>; searchParams: Promise<{ token?: string; done?: string }> }) { return <Suspense fallback={<div className="storefront">Loading…</div>}><NewsletterAction {...props} /></Suspense>; }
