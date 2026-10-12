'use client';
import { useLayoutEffect } from 'react';
import { usePathname } from 'next/navigation';
/** Next.js retains inactive pages. Presentation follows the active URL, not hidden DOM. */
export default function RouteChrome() {
    const path = usePathname();
    useLayoutEffect(() => {
        document.body.setAttribute('data-reader', String(path.startsWith('/samples/')));
        document.body.setAttribute('data-market', String(path === '/'));
        return () => { document.body.removeAttribute('data-reader'); document.body.removeAttribute('data-market'); };
    }, [path]);
    return null;
}
