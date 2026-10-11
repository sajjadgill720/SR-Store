import type { Metadata } from 'next';
import { CommunityHub } from '../../components/community/CommunityExperience';
export const metadata: Metadata = { title: 'Reader Community — Knovera', description: 'Explore reading circles, guided conversations, and your personal reading journal.' };
export default function Page() { return <CommunityHub />; }

