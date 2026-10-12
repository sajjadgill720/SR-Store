import Link from 'next/link';
import Newsletter from './Newsletter';
const groups = [
    { title: 'Reading room', links: [['Books', '/books'], ['Saved books', '/books?saved=1'], ['Reader community', '/community'], ['About Knovera', '/about']] },
    { title: 'Your books', links: [['My Library', '/account/library'], ['Recover a purchase', '/access'], ['Reading & device help', '/help'], ['Contact support', '/contact']] },
    { title: 'Knovera', links: [['Reader Club preferences', '/reader-club#preferences'], ['Free resources', '/free-resources'], ['Privacy', '/legal/privacy'], ['Terms', '/legal/terms'], ['Delivery & refunds', '/legal/refunds']] }
];
export default function Footer() {
    return <footer className="studio-footer">
    <div className="studio-footer-inner">
    <section className="studio-footer-invitation">
    <div>
    <span className="studio-kicker">KEEP EXPLORING</span>
    <h2>Good reads find their people.</h2>
    <p>Discover new books, fresh ideas, and conversations worth joining.</p>
    </div>
    <Newsletter />
    </section>
    <div className="studio-footer-links">
    <div className="studio-footer-brand">
    <Link href="/">Knovera</Link>
    <p>A world of books and ideas.<br />A place for every kind of reader.</p>
    </div>{groups.map(group => <div key={group.title}>
        <h3>{group.title}</h3>
        <ul>{group.links.map(([label, href]) => <li key={href}>
            <Link href={href}>{label}</Link>
            </li>)}</ul>
        </div>)}</div>
    <div className="studio-footer-bottom">
    <span>© 2026 Knovera</span>
    <span>Read. Discover. Connect.</span>
    </div>
    </div>
    </footer>;
}
