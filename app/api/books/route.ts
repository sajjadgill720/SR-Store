import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../lib/db/store';
import { Book } from '../../../lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const id = searchParams.get('id');

    if (slug) {
      const book = db.getBookBySlug(slug);
      if (!book) {
        return NextResponse.json({ error: 'Book not found' }, { status: 404 });
      }
      return NextResponse.json({ book });
    }

    if (id) {
      const book = db.getBookById(id);
      if (!book) {
        return NextResponse.json({ error: 'Book not found' }, { status: 404 });
      }
      return NextResponse.json({ book });
    }

    const books = db.getBooks();
    return NextResponse.json({ books });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.title || !body.title.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const title = body.title.trim();
    const rawSlug = body.slug?.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    let slug = rawSlug;
    
    // Check for slug collision
    let counter = 1;
    while (db.getBookBySlug(slug)) {
      slug = `${rawSlug}-${counter++}`;
    }

    const id = `book_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const price = typeof body.price === 'number' ? Math.round(body.price) : 1999;
    const originalPrice = body.originalPrice ? Math.round(body.originalPrice) : Math.round(price * 1.35);

    const newBook: Book = {
      id,
      slug,
      title,
      subtitle: body.subtitle?.trim() || '',
      author: body.author?.trim() || 'S.R. Rehman',
      penName: body.penName?.trim() || body.author?.trim() || 'S.R. Rehman',
      category: body.category || 'Productivity',
      productType: body.productType || 'ebook',
      coverImage: body.coverImage?.trim() || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800&auto=format&fit=crop',
      accentColor: body.accentColor || '#1d4ed8',
      price,
      originalPrice,
      badge: body.badge?.trim() || 'New Release',
      conditionLabel: 'Digital Master • EPUB + PDF',
      formats: body.formats && body.formats.length > 0 ? body.formats : ['epub', 'pdf'],
      pageCount: body.pageCount ? Number(body.pageCount) : 240,
      isbn: body.isbn?.trim() || `978-1-95432-${Math.floor(100 + Math.random() * 900)}-${Math.floor(1 + Math.random() * 9)}`,
      shortDescription: body.shortDescription?.trim() || 'Comprehensive direct digital edition formatted for all modern e-readers and devices.',
      fullDescription: body.fullDescription?.trim() || body.shortDescription?.trim() || 'Complete full edition with lifetime updates and companion resources.',
      targetAudience: body.targetAudience?.trim() || 'Readers seeking practical, rigorous, and inspiring guidance.',
      whatsIncluded: Array.isArray(body.whatsIncluded) && body.whatsIncluded.length > 0
        ? body.whatsIncluded
        : [
            'DRM-free reflowable EPUB for all e-readers and tablets',
            'Typeset high-resolution PDF for printing or desktop reading',
            'Lifetime free edition revisions & updates'
          ],
      tableOfContents: Array.isArray(body.tableOfContents) && body.tableOfContents.length > 0
        ? body.tableOfContents
        : [
            '1. Introduction and Core Fundamentals',
            '2. Strategic Frameworks and Paradigms',
            '3. Implementation Protocols and Daily Habits',
            '4. Long-Term Mastery and Synthesis'
          ],
      sampleExcerpt: body.sampleExcerpt?.trim() || `Chapter 1: The Foundation\n\nWelcome to this comprehensive edition. This volume has been crafted specifically for direct digital readers seeking unbroken clarity and actionable methodologies. In the following chapters, you will discover field-tested frameworks designed to produce consistent, repeatable results...`,
      rightsStatus: 'wide',
      currentEdition: {
        id: `ed_${id}`,
        version: body.version?.trim() || 'Edition 1.0 (Direct Master)',
        releaseDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        releaseNotes: 'Direct digital publication master edition with universal e-reader formatting.',
        assets: [
          {
            id: `asset_${id}_epub`,
            format: 'epub',
            fileName: `${slug}-master.epub`,
            fileSize: '3.2 MB',
            storageKey: `secure/books/${slug}.epub`,
            mimeType: 'application/epub+zip',
            checksum: 'sha256:directmasterepub'
          },
          {
            id: `asset_${id}_pdf`,
            format: 'pdf',
            fileName: `${slug}-master.pdf`,
            fileSize: '5.1 MB',
            storageKey: `secure/books/${slug}.pdf`,
            mimeType: 'application/pdf',
            checksum: 'sha256:directmasterpdf'
          }
        ]
      },
      rating: 5.0,
      reviewCount: 1,
      isPublished: true,
      isInStock: true,
      featured: Boolean(body.featured)
    };

    const saved = db.addBook(newBook);
    return NextResponse.json({ success: true, book: saved }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    let id = searchParams.get('id');

    if (!id) {
      try {
        const body = await request.json();
        id = body?.id;
      } catch {
        // ignore json parse error if empty body
      }
    }

    if (!id) {
      return NextResponse.json({ error: 'Book ID is required' }, { status: 400 });
    }

    const success = db.deleteBook(id);
    if (!success) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
