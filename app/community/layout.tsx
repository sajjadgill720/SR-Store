import './community.css';
import { Suspense } from 'react';
import { CommunityFrame } from '../../components/community/CommunityFrame';
export default function Layout({children}: {children: React.ReactNode}) { return <Suspense fallback={<div className="community-shell">Opening community…</div>}><CommunityFrame>{children}</CommunityFrame></Suspense>; }

