'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

export default function FooterReturn() {
  const returnTo = useSearchParams().get('footerReturn');
  // Accept only local routes with the known footer anchor.
  if (!returnTo || !/^\/(?!\/)[^\\\s]*#store-footer$/.test(returnTo)) return null;
  return <nav className="store-footer-return" aria-label="Return navigation"><Link href={returnTo}><ArrowLeft size={16} aria-hidden="true" />Back to footer</Link></nav>;
}
