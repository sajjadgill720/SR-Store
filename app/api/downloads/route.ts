import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/store';
import { getBookById } from '@/lib/data/books';

export async function POST(req: NextRequest) {
  try {
    const { email, bookId, format } = await req.json();

    if (!email || !bookId) {
      return NextResponse.json({ error: 'Email and book ID are required' }, { status: 400 });
    }

    const normEmail = email.toLowerCase().trim();

    // Check entitlement
    const hasAccess = db.hasEntitlement(normEmail, bookId);
    if (!hasAccess) {
      return NextResponse.json({ error: 'No active entitlement found for this title' }, { status: 403 });
    }

    const book = db.getBookById(bookId) || getBookById(bookId);
    if (!book) {
      return NextResponse.json({ error: 'Book asset not found' }, { status: 404 });
    }

    const asset = book.currentEdition.assets.find((a) => a.format === format) || book.currentEdition.assets[0];

    // Generate 5-minute signed token
    const token = 'dl_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    db.createDownloadToken({
      token,
      customerEmail: normEmail,
      bookId,
      format: asset.format,
      fileName: asset.fileName,
      expiresAt,
      used: false
    });

    db.addAuditLog('DOWNLOAD_TOKEN_ISSUED', `Issued 5-minute download token for ${normEmail} - ${asset.fileName}`);

    return NextResponse.json({
      success: true,
      downloadUrl: `/api/downloads/${token}`,
      fileName: asset.fileName,
      fileSize: asset.fileSize,
      expiresInSeconds: 300
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
