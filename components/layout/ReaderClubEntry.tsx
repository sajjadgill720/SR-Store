'use client';

import Link from 'next/link';

import { ArrowRight, CheckCircle2, Mail } from 'lucide-react';

import { useReaderClub } from '@/lib/store/reader-club';



export default function ReaderClubEntry() {

  const status = useReaderClub();

  const subscribed = status === 'subscribed';

  return <Link href="/reader-club#preferences" className="hero-reader-club">

    <span className="hero-reader-club-icon">{subscribed ? <CheckCircle2 size={18} aria-hidden="true"/> : <Mail size={18} aria-hidden="true"/>}</span>

    <span><strong>{subscribed ? 'Your Reader Club' : 'Join the Reader Club'}</strong>

    <small>{subscribed ? 'Membership · Free reader resources' : 'Free reading news · Choose your topics'}</small></span><ArrowRight size={17} aria-hidden="true"/>

  </Link>;

}

