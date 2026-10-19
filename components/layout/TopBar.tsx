import Link from 'next/link';
import { BookOpen } from 'lucide-react';

export default function TopBar() {
  return (
    <div className="site-announcement hairline-bottom" role="region" aria-label="Press notice">
      <div className="site-announcement-inner">
        <span className="site-announcement-message">
          <span className="site-announcement-dot" aria-hidden="true">■</span>
          <span>DIRECT FROM THE IMPRINT · UNIVERSAL EPUB &amp; TYPESET PDF EDITIONS</span>
        </span>
        <div className="site-announcement-links">
          <Link href="/help" className="site-announcement-link">
            Send-to-Kindle Guide
          </Link>
          <span className="site-announcement-separator" aria-hidden="true">·</span>
          <Link href="/access" className="site-announcement-link">
            Retrieve Purchases
          </Link>
        </div>
      </div>
    </div>
  );
}
