'use client';
import Image from 'next/image';
import { useState } from 'react';
import { BookOpen } from 'lucide-react';
import { coverSource } from '../../lib/catalog';
export default function BookCover({ src, title, priority = false, size = 'card' }: {
    src: string;
    title: string;
    priority?: boolean;
    size?: 'card' | 'feature' | 'small';
}) {
    const [failed, setFailed] = useState(false);
    return <div className={`edition-cover edition-cover-${size}`}>
    {failed ? <div className="edition-cover-fallback">
        <BookOpen aria-hidden="true"/>
        <span>{title}</span>
        </div> :
            <Image src={src} alt={title} width={360} height={480} unoptimized={!src.startsWith('https://images.unsplash.com/')} sizes={size === 'small' ? '80px' : size === 'feature' ? '(max-width: 760px) 200px, 340px' : '(max-width: 380px) 260px, (max-width: 760px) 42vw, 250px'} loader={({ src: source, width }) => coverSource(source, width)} loading={priority ? 'eager' : 'lazy'} fetchPriority={priority ? 'high' : 'auto'} onError={() => setFailed(true)}/>}
  </div>;
}
