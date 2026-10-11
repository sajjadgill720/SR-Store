import Link from 'next/link';
export default function NotFound() { return <div className="community-shell community-empty"><h1>This chapter is missing.</h1><p>This circle or conversation could not be found.</p><Link href="/community" className="community-button">Back to community</Link></div>; }

