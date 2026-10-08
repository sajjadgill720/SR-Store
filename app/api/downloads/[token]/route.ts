import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/store';
import { getBookById } from '@/lib/data/books';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  if (!token) {
    return new NextResponse('Missing download token', { status: 400 });
  }

  const tokenRecord = db.getDownloadToken(token);
  if (!tokenRecord) {
    return new NextResponse(
      'Download link has expired or is invalid. Please request a fresh download link from your Reader Library or Access Recovery page.',
      { status: 410, headers: { 'Content-Type': 'text/plain' } }
    );
  }

  const book = db.getBookById(tokenRecord.bookId) || getBookById(tokenRecord.bookId);
  const bookTitle = book ? book.title : 'Book';

  // Generate genuine formatted digital reading file content for demonstration
  const fileContent = `======================================================
${bookTitle}
Format: ${tokenRecord.format.toUpperCase()}
License: Single-user personal license granted to ${tokenRecord.customerEmail}
Publisher: Knovera (Direct Edition)
======================================================

TABLE OF CONTENTS:
${book ? book.tableOfContents.join('\n') : 'Chapter 1 to Chapter 6'}

------------------------------------------------------
EXCERPT / OPENING CHAPTER
------------------------------------------------------
${book ? book.sampleExcerpt : 'Thank you for your purchase.'}

======================================================
COMPANION RESOURCES & UPDATES:
Access your reader library at anytime by visiting:
https://sr-store.local/account/library

E-Reader & Tablet Users:
Transfer this file directly to your favorite reading app or e-reader device.
======================================================`;

  const headers = new Headers();
  headers.set('Content-Disposition', `attachment; filename="${tokenRecord.fileName}"`);
  headers.set('Content-Type', tokenRecord.format === 'pdf' ? 'application/pdf' : 'application/epub+zip');
  headers.set('Cache-Control', 'private, no-store, max-age=0');

  db.addAuditLog('FILE_DOWNLOADED', `Reader ${tokenRecord.customerEmail} downloaded ${tokenRecord.fileName}`);

  return new NextResponse(fileContent, {
    status: 200,
    headers
  });
}
