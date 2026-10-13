import { NextRequest, NextResponse } from 'next/server';
import { authenticate, changeActivity, CommunityError, reports, createReply, createThread, discussionExists, getActivity, limit, logout, moderate, replies, sessionMember, threads, threadById } from '../../../../lib/community/server';
const cookie = 'knovera_member';
type Context = { params: Promise<{resource: string}> };
function json(value: unknown, status = 200) { return NextResponse.json(value, { status, headers: { 'Cache-Control': 'private, no-store' } }); }
async function handle(req: NextRequest, ctx: Context) {
  try {
    const { resource } = await ctx.params;
    const member = await sessionMember(req.cookies.get(cookie)?.value);
    if (req.method === 'GET') {
      if (resource === 'session') return json({ member, ...(member ? await getActivity(member.id) : {}) });
      if (resource === 'threads') return json({ threads: await threads(req.nextUrl.searchParams.get('circle') || undefined, !!member?.moderator) });
      if (resource === 'thread') {
        const thread = await threadById(req.nextUrl.searchParams.get('id') || '', !!member?.moderator);
        if (!thread) throw new CommunityError('Discussion not found.', 404);
        return json({ thread });
      }
      if (resource === 'replies') {
        const id = req.nextUrl.searchParams.get('discussion') || '';
        if (!await discussionExists(id)) throw new CommunityError('Discussion not found.', 404);
        return json({ replies: await replies(id, !!member?.moderator) });
      }
      if (resource === 'reports' && member?.moderator) return json({ reports: await reports() });
      throw new CommunityError('Not found.', 404);
    }
    // Next.js can normalize req.nextUrl to an internal hostname; compare the browser's
    // Origin with the actual Host instead. Do not trust forwarded host headers.
    const origin = req.headers.get('origin');
    let sameOrigin = false;
    try { const source = new URL(origin || ''); sameOrigin = source.host === req.headers.get('host') && (source.protocol === 'http:' || source.protocol === 'https:'); } catch {}
    if (!sameOrigin) throw new CommunityError('Request origin is not allowed.', 403);
    if (!req.headers.get('content-type')?.includes('application/json')) throw new CommunityError('JSON required.', 415);
    const raw = await req.text();
    if (raw.length > 16000) throw new CommunityError('Request too large.', 413);
    let input: Record<string, unknown>;
    try { input = JSON.parse(raw); } catch { throw new CommunityError('Invalid JSON.'); }
    if (!input || typeof input !== 'object' || Array.isArray(input)) throw new CommunityError('Invalid request.');
    if (resource === 'session') {
      if (input.action === 'logout') {
        await logout(req.cookies.get(cookie)?.value);
        const response = json({ member: null });
        response.cookies.set(cookie, '', { maxAge: 0, path: '/' });
        return response;
      }
      // The network address comes from the socket proxy only when explicitly configured by the host.
      await limit('accounts:global', 100, 60_000);
      const result = await authenticate(String(input.action), input.username, input.password, input.name);
      const response = json({ member: result.member, ...(await getActivity(result.member.id)) });
      response.cookies.set(cookie, result.token, { httpOnly: true, secure: req.nextUrl.protocol === 'https:', sameSite: 'lax', path: '/', maxAge: 30 * 86400 });
      return response;
    }
    if (!member) throw new CommunityError('Sign in to participate or sync your reading space.', 401);
    if (resource === 'activity') return json(await changeActivity(member.id, input));
    if (resource === 'threads') return json(await createThread(member, input), 201);
    if (resource === 'replies') { await createReply(member, input); return json({ success: true }, 201); }
    if (resource === 'moderation') { await moderate(member, input); return json({ success: true }); }
    throw new CommunityError('Not found.', 404);
  } catch (error) {
    if (error instanceof CommunityError) return json({ error: error.message }, error.status);
    console.error('Community request failed', error);
    return json({ error: 'Unable to save or load community data. Please try again.' }, 500);
  }
}
export const GET = handle;
export const POST = handle;
