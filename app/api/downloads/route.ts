import { NextRequest, NextResponse } from 'next/server';
import { AccessError, downloadAsset, PURCHASE_COOKIE } from '@/lib/downloads/access';
import { signDownload } from '@/lib/downloads/storage';

export async function POST(req: NextRequest) {
  const headers = { 'Cache-Control': 'private, no-store' };
  if (req.headers.get('origin') && req.headers.get('origin') !== new URL(req.url).origin)
    return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403, headers });
  try {
    const body = await req.json();
    const asset = await downloadAsset(body?.orderToken ?? req.cookies.get(PURCHASE_COOKIE)?.value, body?.bookId, body?.format);
    return NextResponse.json(await signDownload(asset), { headers });
  } catch (error) {
    const status = error instanceof AccessError ? error.status : error instanceof SyntaxError ? 400 : 503;
    return NextResponse.json({ error: error instanceof AccessError ? error.message : status === 400 ? 'Invalid request.' : 'Downloads are temporarily unavailable. Please try again or contact support.' }, { status, headers });
  }
}
