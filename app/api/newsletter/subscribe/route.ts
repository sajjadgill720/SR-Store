import { NextRequest, NextResponse } from 'next/server';
import { emailAddress, subscribe, deliver } from '@/lib/email/service.mjs';
export async function POST(req: NextRequest) {
  try {
    const raw = await req.text();
    if (raw.length > 4000) return NextResponse.json({ error: 'Request too large' }, { status: 413 });
    const json = req.headers.get('content-type')?.includes('application/json');
    const input = json ? JSON.parse(raw) : { email: new URLSearchParams(raw).get('email'), topics: ['general'] };
    const email = emailAddress(input.email);
    const allowed = ['general', 'deep-work', 'habit-systems', 'children-activities', 'new-releases'];
    const topics: string[] = Array.isArray(input.topics) ? [...new Set<string>(input.topics.filter((topic: unknown) => typeof topic === 'string' && allowed.includes(topic)))] : ['general'];
    const id = subscribe(email, topics.length ? topics : ['general']);
    if (id) await deliver(id);
    if (!json) return NextResponse.redirect(new URL('/newsletter/confirm', req.url), 303);
    return NextResponse.json({ success: true, message: 'Check your inbox to confirm your subscription. If you are already subscribed, you are all set.' });
  } catch (error) {
    const invalid = error instanceof SyntaxError || (error instanceof Error && error.message === 'Valid email required');
    return NextResponse.json({ error: invalid ? 'Enter a valid email address.' : 'Newsletter signup is unavailable. Please try again later.' }, { status: invalid ? 400 : 503 });
  }
}
