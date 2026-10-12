import { NextRequest, NextResponse } from 'next/server';
import { authenticate, changeActivity, CommunityError, communityDb, createReply, createThread, discussionExists, getActivity, limit, logout, moderate, replies, sessionMember, threads, threadById } from '../../../../lib/community/server';
const cookie = 'knovera_member';
type Context = { params: Promise<{resource: string}> };
function json(value: unknown, status = 200) { return NextResponse.json(value, { status, headers: { 'Cache-Control': 'private, no-store' } }); }
async function handle(req: NextRequest, ctx: Context) {
  try {
    const { resource } = await ctx.params;
    const member = sessionMember(req.cookies.get(cookie)?.value);
    if (req.method === 'GET') {
      if (resource === 'session') return json({ member, ...(member ? getActivity(member.id) : {}) });
      if (resource === 'threads') return json({ threads: threads(req.nextUrl.searchParams.get('circle') || undefined, !!member?.moderator) });
      if (resource === 'thread') {
        const thread = threadById(req.nextUrl.searchParams.get('id') || '', !!member?.moderator);
        if (!thread) throw new CommunityError('Discussion not found.', 404);
        return json({ thread });
      }
      if (resource === 'replies') {
        const id = req.nextUrl.searchParams.get('discussion') || '';
        if (!discussionExists(id)) throw new CommunityError('Discussion not found.', 404);
        return json({ replies: replies(id, !!member?.moderator) });
      }
      if (resource === 'reports' && member?.moderator) return json({ reports: communityDb().prepare(`SELECT p.id,p.target,p.kind,p.reason,p.createdAt,COALESCE(r.body,t.body) AS content,COALESCE(r.discussion,t.id) AS discussion FROM reports p LEFT JOIN replies r ON p.kind='reply' AND r.id=p.target LEFT JOIN threads t ON p.kind='thread' AND t.id=p.target WHERE p.resolved=0 ORDER BY p.createdAt`).all() });
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
        logout(req.cookies.get(cookie)?.value);
        const response = json({ member: null });
        response.cookies.set(cookie, '', { maxAge: 0, path: '/' });
        return response;
      }
      // The network address comes from the socket proxy only when explicitly configured by the host.
      limit('accounts:global', 100, 60_000);
      const result = authenticate(String(input.action), input.username, input.password, input.name);
      const response = json({ member: result.member, ...getActivity(result.member.id) });
      response.cookies.set(cookie, result.token, { httpOnly: true, secure: req.nextUrl.protocol === 'https:', sameSite: 'lax', path: '/', maxAge: 30 * 86400 });
      return response;
    }
    if (!member) throw new CommunityError('Sign in to participate or sync your reading space.', 401);
    if (resource === 'activity') return json(changeActivity(member.id, input));
    if (resource === 'threads') return json(createThread(member, input), 201);
    if (resource === 'replies') { createReply(member, input); return json({ success: true }, 201); }
    if (resource === 'moderation') { moderate(member, input); return json({ success: true }); }
    throw new CommunityError('Not found.', 404);
  } catch (error) {
    if (error instanceof CommunityError) return json({ error: error.message }, error.status);
    console.error('Community request failed', error);
    return json({ error: 'Unable to save or load community data. Please try again.' }, 500);
  }
}
export const GET = handle;
export const POST = handle;
