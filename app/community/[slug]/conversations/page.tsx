import Link from 'next/link';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { MessageCircle } from 'lucide-react';
import { CIRCLES, getCircle } from '@/lib/data/community';
import { SharedThreads } from '@/components/community/SharedCommunity';

export function generateStaticParams() { return CIRCLES.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const circle = getCircle((await params).slug);
  return { title: `${circle?.name || 'Circle'} conversations — Knovera` };
}
async function Conversations({ params }: { params: Promise<{ slug: string }> }) {
  const circle = getCircle((await params).slug);
  if (!circle) notFound();
  return <div className="community-shell circle-conversations-page">
    <nav className="community-breadcrumb" aria-label="Breadcrumb"><Link href="/community">← Community</Link><span>/</span><Link href={`/community/${circle.slug}`}>{circle.name}</Link><span>/</span><span>Conversations</span></nav>
    <header className="circle-chat-heading"><span className="community-eyebrow"><MessageCircle size={16} aria-hidden="true"/> CIRCLE CONVERSATIONS</span><h1>{circle.name}</h1><p>{circle.description}</p><small>Everyone can read. Sign in to start a discussion or reply. Journal entries stay private.</small></header>
    <nav className="circle-chat-links" aria-label="Switch reading circle">{CIRCLES.map(item => <Link key={item.slug} aria-current={item.slug === circle.slug ? 'page' : undefined} href={`/community/${item.slug}/conversations`}>{item.name}</Link>)}</nav>
    <SharedThreads circle={circle.slug} returnPath={`/community/${circle.slug}/conversations`}/>
  </div>;
}
export default function Page(props: { params: Promise<{ slug: string }> }) {
  return <Suspense fallback={<p className="community-notice">Loading circle conversations…</p>}><Conversations {...props}/></Suspense>;
}
