import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import Loading from '../loading';
import { CIRCLES, getCircle } from '../../../lib/data/community';
import { CircleDetail } from '../../../components/community/CommunityExperience';
export function generateStaticParams() { return CIRCLES.map(({slug}) => ({slug})); }
export async function generateMetadata({params}: {params: Promise<{slug:string}>}) { const circle = getCircle((await params).slug); return {title: circle ? circle.name + ' — Knovera Community' : 'Circle not found'}; }
async function Content({params}: {params: Promise<{slug:string}>}) { const circle = getCircle((await params).slug); if (!circle) notFound(); return <CircleDetail circle={circle} />; }
export default function Page({params}: {params: Promise<{slug:string}>}) { return <Suspense fallback={<Loading />}><Content params={params} /></Suspense>; }

