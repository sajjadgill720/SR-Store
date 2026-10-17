import Link from 'next/link';
import { Sparkles } from 'lucide-react';
export default function TopBar() {
    return <div className="site-announcement">
    <span><Sparkles size={11} aria-hidden="true" /> Your next read. Your next conversation.</span>
    <Link href="/help">Reading &amp; download help</Link>
    </div>;
}
