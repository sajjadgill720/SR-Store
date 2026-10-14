import { NextRequest, NextResponse } from 'next/server';
import { AccessError, downloadAsset, PURCHASE_COOKIE } from '@/lib/downloads/access';
import { signDownload } from '@/lib/downloads/storage';
import { currentUser, AuthError } from '@/lib/auth/server';
import { sameOrigin } from '@/lib/auth/http';
import { accountDownload } from '@/lib/downloads/account';
import { limitedBody, rateLimit, RequestError, requestFailure } from '@/lib/http-guard';

export async function POST(req: NextRequest) {
  const headers = { 'Cache-Control': 'private, no-store' };
  try {
    sameOrigin(req);
    await rateLimit(req,'downloads',20);
    const body = JSON.parse(await limitedBody(req,4000));
    const user = body?.orderToken ? null : await currentUser();
    const identity=user?.id || body?.orderToken || req.cookies.get(PURCHASE_COOKIE)?.value;
    if(typeof identity==='string')await rateLimit(req,'download-access',20,60000,identity);
    const asset = user ? await accountDownload(user,body?.bookId,body?.format) : await downloadAsset(body?.orderToken ?? req.cookies.get(PURCHASE_COOKIE)?.value, body?.bookId, body?.format);
    return NextResponse.json(await signDownload(asset), { headers });
  } catch (error) {
    if(error instanceof RequestError)return requestFailure(error);
    const status = error instanceof AccessError || error instanceof AuthError ? error.status : error instanceof SyntaxError ? 400 : 503;
    return NextResponse.json({ error: error instanceof AccessError || error instanceof AuthError ? error.message : status === 400 ? 'Invalid request.' : 'Downloads are temporarily unavailable. Please try again or contact support.' }, { status, headers });
  }
}
