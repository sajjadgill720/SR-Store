import Link from 'next/link';
import { BookOpen, Download, LifeBuoy, FileCheck2, ArrowUpRight } from 'lucide-react';

const promises = [
  { icon: BookOpen, title: 'Try a chapter first', detail: 'Explore before you choose', href: '/free-resources' },
  { icon: Download, title: 'Your books, your devices', detail: 'Open PDF & EPUB formats', href: '/help' },
  { icon: FileCheck2, title: 'Clear purchase policies', detail: 'Know what to expect', href: '/legal/refunds' },
  { icon: LifeBuoy, title: 'A little help, anytime', detail: 'Reading & access support', href: '/contact' },
];

export default function TrustBar() {
  return (
    <section aria-label="Shop with confidence" className="trust-strip">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 min-[400px]:grid-cols-2 lg:grid-cols-4 gap-2">
        {promises.map(({ icon: Icon, title, detail, href }) => (
          <Link key={title} href={href} className="group flex items-center gap-3 rounded-xl p-4 hover:bg-white/70 transition-colors">
            <Icon aria-hidden="true" className="w-5 h-5 text-sky-700 shrink-0" />
            <div><p className="text-xs font-semibold text-[#0F1D2F]">{title}</p><p className="text-[11px] text-slate-500 mt-1">{detail}</p></div>
            <ArrowUpRight aria-hidden="true" className="w-3.5 h-3.5 ml-auto text-sky-700 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        ))}
      </div>
    </section>
  );
}
