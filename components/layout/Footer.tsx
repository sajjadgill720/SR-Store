import Link from 'next/link';
import Newsletter from './Newsletter';

const groups = [
  {
    title: 'The Collection',
    links: [
      ['The Focused Mind', '/books/the-focused-mind'],
      ['Atomic Architectures', '/books/atomic-architectures'],
      ['The Solo Architect', '/books/the-solo-architect'],
      ['The Young Explorer', '/books/explorers-mind-activities'],
      ['Mastery & Focus Bundle', '/bundles/the-complete-mastery-bundle'],
      ['All Editions', '/books'],
    ],
  },
  {
    title: 'Your Books',
    links: [
      ['My Library', '/account/library'],
      ['Recover a purchase', '/access'],
      ['Device & reading guidance', '/help'],
      ['Send to Kindle guide', '/help/kindle'],
      ['Contact author support', '/contact'],
    ],
  },
  {
    title: 'Imprint & Integrity',
    links: [
      ['About S.R. Rehman & Knovera', '/about'],
      ['Free reader resources', '/free-resources'],
      ['Reader community', '/community'],
      ['Delivery & refund policy', '/legal/refunds'],
      ['Terms of license', '/legal/terms'],
      ['Privacy policy', '/legal/privacy'],
    ],
  },
];

export default function Footer() {
  return (
    <footer className="studio-footer" role="contentinfo">
      <div className="studio-footer-inner">
        <section className="studio-footer-invitation">
          <div className="studio-footer-invitation-copy">
            <span className="studio-kicker">AUTHOR DISPATCH</span>
            <h2>Notes from the writing desk.</h2>
            <p>
              Occasional dispatches from S.R. Rehman on cognitive focus, behavioral leverage,
              and systems design. Delivered directly to your inbox without algorithmic noise.
            </p>
          </div>
          <div className="studio-footer-invitation-form">
            <Newsletter />
          </div>
        </section>

        <div className="studio-footer-links">
          <div className="studio-footer-brand">
            <Link href="/" className="studio-footer-brand-title">
              Knovera
            </Link>
            <p className="studio-footer-brand-desc">
              The independent publishing imprint of S.R. Rehman. Thoughtful digital books designed
              for lifelong reference, deep attention, and deliberate craft.
            </p>
            <div className="studio-footer-pill">
              <span>DRM-Free</span>
              <span>·</span>
              <span>Universal EPUB &amp; PDF</span>
              <span>·</span>
              <span>Direct Support</span>
            </div>
          </div>

          {groups.map(group => (
            <div key={group.title} className="studio-footer-col">
              <h3>{group.title}</h3>
              <ul>
                {group.links.map(([label, href]) => (
                  <li key={href}>
                    <Link href={href}>{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="studio-footer-bottom">
          <span>© 2026 Knovera · Published independently by S.R. Rehman</span>
          <span>Typeset with care in Cormorant Garamond &amp; DM Sans</span>
        </div>
      </div>
    </footer>
  );
}
