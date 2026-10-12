'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, BookOpen, Library, Users, ArrowUpRight, Sparkles } from 'lucide-react';
import { MemberPanel } from './MemberPanel';
import { useCommunityActivity } from '../../lib/community/client';
export function CommunityFrame({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const activity = useCommunityActivity();
  return <div className="community-workspace"><aside className="community-rail" aria-label="Community navigation"><div className="community-rail-title"><span className="community-rail-symbol"><Users size={19} /></span><strong>Reading together</strong></div><nav><Link href="/community" aria-current={path === '/community' ? 'page' : undefined}><Compass size={19} /> Discover <ArrowUpRight size={15} /></Link><Link href="/books"><BookOpen size={19} /> Explore books</Link><Link href="/account/library"><Library size={19} /> My library</Link></nav><div className="community-space-summary"><span className="community-eyebrow">YOUR READING SPACE</span><div><span>Circles</span><strong>{activity.joined.length}</strong></div><div><span>Saved conversations</span><strong>{activity.saved.length}</strong></div><div><span>Journal entries</span><strong>{Object.keys(activity.notes).length}</strong></div></div><MemberPanel /><div className="community-rail-invitation"><Sparkles size={20} /><strong>Every perspective belongs.</strong><p>A question, a favorite passage, a book you can’t put down. Bring it here.</p><Link href="/community#member-conversations">Explore conversations <ArrowUpRight size={15} /></Link></div></aside><div className="community-workspace-content">{children}</div></div>;
}
