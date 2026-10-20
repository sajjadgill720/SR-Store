'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ComponentProps } from 'react';
import { useBrowserSearch } from '@/lib/use-browser-search';

/** Carry the originating footer with every footer destination, including new tabs. */
export default function FooterLink({ href, ...props }: Omit<ComponentProps<typeof Link>, 'href'> & { href: string }) {
  const path = usePathname();
  const search = useBrowserSearch();
  search.delete('footerReturn');
  const query = search.toString();
  const origin = `${path}${query ? `?${query}` : ''}#store-footer`;
  const destination = new URL(href, 'https://knovera.invalid');
  destination.searchParams.set('footerReturn', origin);
  return <Link {...props} href={`${destination.pathname}${destination.search}${destination.hash}`} />;
}
