import Link from 'next/link';
export default function TopBar() {
    return <div className="site-announcement">
    <span>Your next read. Your next conversation.</span>
    <Link href="/help">Reading & download help</Link>
    </div>;
}
