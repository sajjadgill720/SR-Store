'use client';
import { useLayoutEffect } from 'react';
import { usePathname } from 'next/navigation';
/** Next.js retains inactive pages. Presentation follows the active URL, not hidden DOM. */
export default function RouteChrome() {
    const path = usePathname();
    useLayoutEffect(() => {
        document.body.setAttribute('data-reader', String(path.startsWith('/samples/')));
        document.body.setAttribute('data-community', String(path.startsWith('/community')));
        return () => { document.body.removeAttribute('data-community'); document.body.removeAttribute('data-reader'); };
    }, [path]);
    return null;
}
