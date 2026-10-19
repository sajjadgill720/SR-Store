'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, BookOpen, Library, Users } from 'lucide-react';
import { MemberPanel } from './MemberPanel';
import { useCommunityActivity } from '../../lib/community/client';

export function CommunityFrame({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const activity = useCommunityActivity();

  return (
    <div className="community-workspace">
      {/* Horizontal Top Bar */}
      <header className="community-horizontal-header" aria-label="Community navigation">
        <div className="community-horizontal-inner">
          
          {/* Left section: "Reading together" + Navigation Links */}
          <div className="community-horizontal-nav-group">
            <div className="community-horizontal-brand">
              <span className="community-horizontal-symbol">
                <Users size={16} aria-hidden="true" />
              </span>
              <span className="community-horizontal-title">Reading together</span>
            </div>

            <nav className="community-horizontal-nav" aria-label="Community Navigation">
              <Link
                href="/community"
                className={`community-nav-tab ${path === '/community' ? 'active' : ''}`}
                aria-current={path === '/community' ? 'page' : undefined}
              >
                <Compass size={14} aria-hidden="true" />
                <span>Discover</span>
              </Link>
              <Link href="/books" className="community-nav-tab">
                <BookOpen size={14} aria-hidden="true" />
                <span>Explore books</span>
              </Link>
              <Link href="/account/library" className="community-nav-tab">
                <Library size={14} aria-hidden="true" />
                <span>My library</span>
              </Link>
            </nav>
          </div>

          {/* Right section: Reading Space Activity Metrics + Member Status */}
          <div className="community-horizontal-meta-group">
            <div className="community-reading-space-bar" title="Your reading space stats">
              <span className="reading-space-kicker">Reading space:</span>
              <div className="reading-space-counters">
                <span className="space-stat-pill" title="Circles joined">
                  <span className="stat-label">Circles</span>
                  <strong className="stat-val">{activity.joined.length}</strong>
                </span>
                <span className="space-stat-pill" title="Saved conversations">
                  <span className="stat-label">Saved</span>
                  <strong className="stat-val">{activity.saved.length}</strong>
                </span>
                <span className="space-stat-pill" title="Journal entries">
                  <span className="stat-label">Journal</span>
                  <strong className="stat-val">{Object.keys(activity.notes).length}</strong>
                </span>
              </div>
            </div>

            <div className="community-member-container">
              <MemberPanel />
            </div>
          </div>

        </div>
      </header>

      {/* Main Community Workspace Content */}
      <div className="community-workspace-content">
        {children}
      </div>
    </div>
  );
}
