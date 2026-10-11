import Link from 'next/link';
export default function TopBar() {
    return <div className="site-announcement">
    <span>Independent books. A little more perspective.</span>
    <Link href="/help">Reading & download help</Link>
    </div>;
}
