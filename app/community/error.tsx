'use client';
export default function Error({retry}: {retry: () => void}) { return <div className="community-shell community-empty"><h1>A little interruption.</h1><p>We couldn’t open this reading space. Please try again.</p><button className="community-button" onClick={retry}>Try again</button></div>; }

