import type { Book, BookFormat, Order } from './types';
/** Retire the old personal byline, including records saved in older browsers. */
export function authorLabel(author: string) {
    return /s[.\s]*r[.\s]*rehman/i.test(author) ? 'Knovera' : author;
}
export const money = (minorUnits: number, currency = 'USD') => new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(minorUnits / 100);
export const formatLabel = (format: BookFormat) => format === 'printable_pdf' ? 'Printable PDF' : format.toUpperCase();
export const formatsLabel = (formats: BookFormat[]) => formats.map(formatLabel).join(' + ');
export function coverSource(src: string, width: number) {
    try {
        const url = new URL(src);
        if (url.hostname === 'images.unsplash.com') {
            url.searchParams.set('w', String(width));
            url.searchParams.set('q', '80');
            url.searchParams.set('auto', 'format');
            url.searchParams.set('fit', 'max');
            return url.toString();
        }
    }
    catch { /* Local asset URLs are preserved. */ }
    return src;
}
export function sampleSections(excerpt: string, targetWords = 95): string[] {
    const paragraphs = excerpt.trim().split(/\n\s*\n/).filter(Boolean);
    const sections: string[] = [];
    let current: string[] = [];
    let words = 0;
    for (const paragraph of paragraphs) {
        const count = paragraph.split(/\s+/).length;
        if (current.length && words + count > targetWords && words >= targetWords * .55) {
            sections.push(current.join('\n\n'));
            current = [];
            words = 0;
        }
        current.push(paragraph);
        words += count;
    }
    if (current.length)
        sections.push(current.join('\n\n'));
    return sections;
}
export function discoverBooks(books: Book[], query: string, category: string, saved?: string[]) {
    const normalized = query.trim().toLowerCase();
    return books.filter(book => book.isPublished && (category === 'All' || book.category === category) &&
        (!saved || saved.includes(book.id)) &&
        [book.title, book.subtitle, book.author, book.category, book.shortDescription, book.isbn].filter(Boolean).join(' ').toLowerCase().includes(normalized));
}
export function orderPresentation(status: Order['paymentStatus']) {
    switch (status) {
        case 'paid': return { title: 'Your order is ready.', description: 'Your order is recorded as paid. Find your available formats below.', accessible: true };
        case 'pending': return { title: 'Your payment is pending.', description: 'Your order is recorded, but payment has not been confirmed. Downloads will be available once access is granted.', accessible: false };
        case 'refunded': return { title: 'This order was refunded.', description: 'Downloads for this order are no longer available. Contact us if you need help.', accessible: false };
        default: return { title: 'Your payment was not completed.', description: 'No successful payment is recorded for this order. Contact support before trying again.', accessible: false };
    }
}
