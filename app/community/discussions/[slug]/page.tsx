import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import Loading from '../../loading';
import { DISCUSSIONS, getDiscussion } from '../../../../lib/data/community';
import { DiscussionDetail } from '../../../../components/community/CommunityExperience';
export function generateStaticParams() { return DISCUSSIONS.map(({slug}) => ({slug})); }
export async function generateMetadata({params}: {params: Promise<{slug:string}>}) { const discussion = getDiscussion((await params).slug); return {title: discussion ? discussion.title + ' — Knovera Community' : 'Discussion not found'}; }
async function Content({params}: {params: Promise<{slug:string}>}) { const discussion = getDiscussion((await params).slug); if (!discussion) notFound(); return <DiscussionDetail discussion={discussion} />; }
export default function Page({params}: {params: Promise<{slug:string}>}) { return <Suspense fallback={<Loading />}><Content params={params} /></Suspense>; }

