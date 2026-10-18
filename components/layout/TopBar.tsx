import Link from 'next/link';
import { BookOpen } from 'lucide-react';

export default function TopBar() {
  return (
    <div className="site-announcement" role="region" aria-label="Store announcement">
      <div className="site-announcement-inner">
        <span className="site-announcement-message">
          <BookOpen size={13} aria-hidden="true" className="inline-block mr-1.5 opacity-80" />
          Direct from author S.R. Rehman · DRM-free universal EPUB &amp; typeset PDF
        </span>
        <div className="site-announcement-links">
          <Link href="/help" className="site-announcement-link">
            Device &amp; reading guidance
          </Link>
          <span className="site-announcement-separator" aria-hidden="true">·</span>
          <Link href="/access" className="site-announcement-link">
            Find purchases
          </Link>
        </div>
      </div>
    </div>
  );
}
