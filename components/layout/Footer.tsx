import Link from 'next/link';
import Newsletter from './Newsletter';
const groups = [
    { title: 'Reading room', links: [['Books', '/books'], ['Saved books', '/books?saved=1'], ['Reader community', '/community'], ['About Knovera', '/about']] },
    { title: 'Your books', links: [['My Library', '/account/library'], ['Recover a purchase', '/access'], ['Reading & device help', '/help'], ['Contact the studio', '/contact']] },
    { title: 'Studio', links: [['Reader Club preferences', '/reader-club#preferences'], ['Free resources', '/free-resources'], ['Privacy', '/legal/privacy'], ['Terms', '/legal/terms'], ['Delivery & refunds', '/legal/refunds']] }
];
export default function Footer() {
    return <footer className="studio-footer">
    <div className="studio-footer-inner">
    <section className="studio-footer-invitation">
    <div>
    <span className="studio-kicker">A NOTE FROM THE STUDIO</span>
    <h2>Keep a little room for reading.</h2>
    <p>New books, thoughtful notes, and a reason to open your next chapter.</p>
    </div>
    <Newsletter />
    </section>
    <div className="studio-footer-links">
    <div className="studio-footer-brand">
    <Link href="/">Knovera</Link>
    <p>An independent book studio.<br />Books to spend time with.</p>
    </div>{groups.map(group => <div key={group.title}>
        <h3>{group.title}</h3>
        <ul>{group.links.map(([label, href]) => <li key={href}>
            <Link href={href}>{label}</Link>
            </li>)}</ul>
        </div>)}</div>
    <div className="studio-footer-bottom">
    <span>© 2026 Knovera</span>
    <span>Digital editions · Independent publishing</span>
    </div>
    </div>
    </footer>;
}
