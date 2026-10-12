import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import Loading from '../../loading';
import { DISCUSSIONS, getDiscussion } from '../../../../lib/data/community';
import { DiscussionDetail } from '../../../../components/community/CommunityExperience';
import { MemberDiscussion } from '../../../../components/community/SharedCommunity';
export function generateStaticParams() { return DISCUSSIONS.map(({slug}) => ({slug})); }
export async function generateMetadata({params}: {params: Promise<{slug:string}>}) { const {slug} = await params; const discussion = getDiscussion(slug); return {title: discussion ? discussion.title + ' — Knovera Community' : slug.startsWith('member-') ? 'Member conversation — Knovera Community' : 'Discussion not found'}; }
async function Content({params}: {params: Promise<{slug:string}>}) { const {slug} = await params; const discussion = getDiscussion(slug); if (discussion) return <DiscussionDetail discussion={discussion} />; if (/^member-[a-f0-9-]{36}$/.test(slug)) return <MemberDiscussion id={slug} />; notFound(); }
export default function Page({params}: {params: Promise<{slug:string}>}) { return <Suspense fallback={<Loading />}><Content params={params} /></Suspense>; }

