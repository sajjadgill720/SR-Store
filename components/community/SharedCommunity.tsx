'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api, toggleActivity, updateActivity, useCommunityActivity, useMemberSession } from '../../lib/community/client';
import type { Reply, Thread } from '../../lib/community/types';
import { CIRCLES } from '../../lib/data/community';
import { subscribeCommunityChanges } from '../../lib/community/realtime';

function useLive<T>(resource: string, initial: T) {
  const [data, setData] = useState(initial);
  const [error, setError] = useState('');
  const [version, setVersion] = useState(0);
  const session = useMemberSession();
  useEffect(() => {
    let active = true;
    let loading = false;
    let dirty = false;
    const load = async () => { if (!active) return; if (loading) { dirty = true; return; } loading = true; try { const result = await api<T>(resource); if (active) { setData(result); setError(''); } } catch (error) { if (active) setError(error instanceof Error ? error.message : 'Unable to load conversations.'); } finally { loading = false; if (dirty) { dirty = false; void load(); } } };
    void load();
    const unsubscribe = subscribeCommunityChanges(() => { void load(); });
    return () => { active = false; unsubscribe(); };
  }, [resource, version, session.member?.id, session.member?.moderator]);
  return { data, error, reload: () => setVersion(value => value + 1) };
}
function ContentControls({ id, kind, authorId, hidden, reload }: {id: string; kind: 'thread' | 'reply'; authorId: string; hidden: boolean; reload: () => void}) {
  const { member } = useMemberSession();
  const [reason, setReason] = useState('');
  const [reporting, setReporting] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  if (!member) return null;
  async function perform(action: string) {
    setBusy(true); setError('');
    try { await api('moderation', { id, kind, action, reason }); setMessage(action === 'report' ? 'Report sent to moderators.' : 'Content updated.'); setReporting(false); reload(); }
    catch (error) { setError(error instanceof Error ? error.message : 'Unable to update content.'); }
    finally { setBusy(false); }
  }
  return <div className="content-controls">{(member.moderator || (member.id === authorId && !hidden)) && <button disabled={busy} onClick={() => void perform(hidden ? 'restore' : 'hide')}>{hidden ? 'Restore' : 'Remove'} {kind}</button>}{!hidden && <button onClick={() => setReporting(!reporting)}>Report</button>}{reporting && <form onSubmit={event => { event.preventDefault(); void perform('report'); }}><label>Why are you reporting this?<input value={reason} onChange={event => setReason(event.target.value)} minLength={5} maxLength={500} required /></label><button disabled={busy}>Send report</button></form>}{message && <span role="status">{message}</span>}{error && <p role="alert" className="community-error">{error}</p>}</div>;
}
export function SharedThreads({ circle, filter = 'All conversations', query = '' }: {circle?: string; filter?: string; query?: string}) {
  const { member } = useMemberSession();
  const activity = useCommunityActivity();
  const { data, error, reload } = useLive<{threads: Thread[]}>(`threads${circle ? `?circle=${encodeURIComponent(circle)}` : ''}`, { threads: [] });
  const [busy, setBusy] = useState(false);
  const [postError, setPostError] = useState('');
  const [created, setCreated] = useState('');
  const visibleThreads = data.threads.filter(thread => (filter !== 'Saved' || activity.saved.includes(thread.id)) && (filter !== 'My circles' || activity.joined.includes(thread.circle)) && `${thread.title} ${thread.body} ${thread.author}`.toLowerCase().includes(query.toLowerCase().trim()));
  async function post(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = event.currentTarget; const values = new FormData(form); setBusy(true); setPostError('');
    try { const result = await api<{id:string}>('threads', { circle: circle || values.get('circle'), title: values.get('title'), body: values.get('body') }); form.reset(); setCreated(result.id); reload(); }
    catch (error) { setPostError(error instanceof Error ? error.message : 'Unable to publish discussion.'); }
    finally { setBusy(false); }
  }
  return <section id="member-conversations" className="community-section shared-conversations"><span className="community-eyebrow">THE COMMUNITY FEED</span><h2>Reader conversations</h2><p className="community-subtle">A question, a favorite book, a fresh perspective. See what readers are sharing.</p>{member ? <form className="reflection-form" onSubmit={post}><h3>Start a conversation</h3>{!circle && <label>Reading circle<select name="circle">{CIRCLES.map(item => <option key={item.slug} value={item.slug}>{item.name}</option>)}</select></label>}<label>Discussion title<input name="title" minLength={5} maxLength={160} required /></label><label>Your discussion<textarea name="body" rows={4} maxLength={5000} required /></label><p>Published as {member.name}. Keep private details in your journal.</p><button className="community-button" disabled={busy}>{busy ? 'Publishing…' : 'Publish discussion'}</button>{created && <p role="status"><Link href={`/community/discussions/${created}`}>Discussion published — open conversation</Link></p>}{postError && <p role="alert" className="community-error">{postError}</p>}</form> : <p className="community-notice">Sign in above to start a conversation.</p>}{error && <p role="alert" className="community-error">{error}</p>}<div className="conversation-grid">{visibleThreads.map(thread => <article className="conversation-card" key={thread.id}><span className="community-tag">{thread.hidden ? 'Removed' : 'Member discussion'}</span>{!thread.hidden && <Link href={`/community/discussions/${thread.id}`}><h3>{thread.title}</h3><p>{thread.body.slice(0, 180)}{thread.body.length > 180 ? '…' : ''}</p></Link>}<p className="community-subtle">{thread.author} · {new Date(thread.createdAt).toLocaleDateString()}</p><ContentControls id={thread.id} kind="thread" authorId={thread.authorId} hidden={thread.hidden} reload={reload} /></article>)}</div>{!error && !visibleThreads.length && <p className="community-empty">Every conversation starts somewhere. Share the first question, idea, or book recommendation.</p>}<button className="community-text-button" onClick={reload}>Refresh conversations</button>{member?.moderator && <ModerationQueue onChange={reload} />}</section>;
}
export function Replies({ discussion }: {discussion: string}) {
  const { member } = useMemberSession();
  const { data, error, reload } = useLive<{replies: Reply[]}>(`replies?discussion=${encodeURIComponent(discussion)}`, { replies: [] });
  const [body, setBody] = useState('');
  const [parent, setParent] = useState<Reply | null>(null);
  const [busy, setBusy] = useState(false);
  const [postError, setPostError] = useState('');
  const [message, setMessage] = useState('');
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setPostError(''); setMessage('');
    try { await api('replies', { discussion, body, parentId: parent?.id || null }); setBody(''); setParent(null); setMessage('Reply published.'); reload(); }
    catch (error) { setPostError(error instanceof Error ? error.message : 'Unable to publish reply.'); }
    finally { setBusy(false); }
  }
  function renderReply(reply: Reply, depth = 0): React.ReactNode {
    return <article className={`community-reply ${depth ? 'nested' : ''}`} key={reply.id}><header className="reply-author"><span className="reader-avatar" aria-hidden="true">{reply.author.slice(0, 2).toUpperCase()}</span><div><strong>{reply.author}</strong><time dateTime={reply.createdAt}>{new Date(reply.createdAt).toLocaleString()}</time></div></header><p>{reply.body}</p>{member && !reply.hidden && <button className="community-text-button" onClick={() => { setParent(reply); setMessage(''); }}>Reply to {reply.author}</button>}<ContentControls id={reply.id} kind="reply" authorId={reply.authorId} hidden={reply.hidden} reload={reload} />{depth < 20 && data.replies.filter(child => child.parentId === reply.id).map(child => renderReply(child, depth + 1))}</article>;
  }
  return <section className="community-section" aria-label="Public replies"><h2>Continue the conversation</h2><p className="community-subtle">Public replies are visible to everyone. Updates appear automatically.</p>{error && <p role="alert" className="community-error">{error}</p>}{data.replies.filter(reply => !reply.parentId).map(reply => renderReply(reply))}{!error && !data.replies.length && <p className="community-empty">No replies yet. Share the first perspective.</p>}{member ? <form className="reflection-form" onSubmit={submit}>{parent && <p>Replying to {parent.author} <button type="button" className="community-text-button" onClick={() => setParent(null)}>Cancel reply</button></p>}<label htmlFor={`public-reply-${discussion}`}>Your public reply</label><textarea id={`public-reply-${discussion}`} rows={4} maxLength={2000} required value={body} onChange={event => setBody(event.target.value)} /><p>Published as {member.name} · {body.length}/2000</p><button className="community-button" disabled={busy}>{busy ? 'Publishing…' : 'Publish reply'}</button>{postError && <p role="alert" className="community-error">{postError}</p>}{message && <p role="status" className="community-success">{message}</p>}</form> : <p className="community-notice">Sign in above to reply.</p>}<button className="community-text-button" onClick={reload}>Refresh replies</button></section>;
}
export function MemberDiscussion({ id }: {id: string}) {
  const { data, error, reload } = useLive<{thread: Thread | null}>(`thread?id=${encodeURIComponent(id)}`, { thread: null });
  const { member } = useMemberSession();
  const thread = data.thread;
  return <div className="community-shell"><Link href="/community" className="community-breadcrumb">← Community</Link>{error ? <p role="alert">{error}</p> : thread ? <><article className="discussion-article"><span className="community-tag">{thread.hidden ? 'Removed discussion' : 'Member discussion'}</span><h1>{thread.title}</h1><p className="community-subtle">{thread.author}</p><p className="member-discussion-body">{thread.body}</p><ContentControls id={thread.id} kind="thread" authorId={thread.authorId} hidden={thread.hidden} reload={reload} /></article>{!thread.hidden && <><PrivateJournal discussion={id} key={`${id}:${member?.id || 'guest'}`} /><Replies discussion={id} /></>}</> : <p className="community-notice">Loading conversation…</p>}</div>;
}
function PrivateJournal({ discussion }: {discussion: string}) {
  const activity = useCommunityActivity();
  const [draft, setDraft] = useState<{value: string; base: string | null} | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const value = draft?.value ?? activity.notes[discussion] ?? '';
  return <section className="community-section"><button className="community-button secondary" aria-pressed={activity.saved.includes(discussion)} onClick={async () => setError(await toggleActivity('saved', discussion) ? '' : 'Could not save. Check the sync message above.')}>{activity.saved.includes(discussion) ? 'Saved to your reading space' : 'Save for later'}</button><form className="reflection-form" onSubmit={async event => { event.preventDefault(); setBusy(true); const saved = await updateActivity(previous => ({ ...previous, notes: { ...previous.notes, [discussion]: value } }), draft ? draft.base : activity.notes[discussion] ?? null); setBusy(false); if (saved) setDraft(previous => previous?.value === value ? null : previous); setError(saved ? '' : 'Could not save. Keep your draft and check the sync message above.'); setMessage(saved ? 'Reflection saved privately.' : ''); }}><h2>Your private journal</h2><p>Reflections sync with your account when signed in and stay in this browser for guests. They are never published.</p><label>Your reflection<textarea value={value} onChange={event => { setDraft(previous => ({value: event.target.value, base: previous ? previous.base : activity.notes[discussion] ?? null})); setMessage(''); }} rows={5} maxLength={2000} /></label><button className="community-button" disabled={busy}>Save reflection</button><button type="button" className="community-text-button" onClick={() => setDraft(null)}>Discard draft and load saved reflection</button>{message && <p role="status" className="community-success">{message}</p>}{error && <p role="alert" className="community-error">{error}</p>}</form></section>;
}
function ModerationQueue({ onChange }: {onChange: () => void}) {
  const { data, error, reload } = useLive<{reports: {id: string; target: string; kind: 'thread' | 'reply'; reason: string; content: string; discussion: string}[]}>('reports', { reports: [] });
  const [actionError, setActionError] = useState('');
  return <section className="community-section"><h3>Moderation reports</h3>{(error || actionError) && <p role="alert">{error || actionError}</p>}{data.reports.map(report => <div className="conversation-card" key={report.id}><Link href={`/community/discussions/${report.discussion}`}>Open reported {report.kind}</Link><p>{report.content}</p><p>Report reason: {report.reason}</p><ContentControls id={report.target} kind={report.kind} authorId="" hidden={false} reload={() => { reload(); onChange(); }} /><button className="community-text-button" onClick={async () => { try { await api('moderation', { id: report.target, kind: report.kind, action: 'dismiss' }); setActionError(''); reload(); } catch (error) { setActionError(error instanceof Error ? error.message : 'Could not dismiss report.'); } }}>Dismiss report — keep content</button></div>)}{!data.reports.length && <p>No open reports.</p>}</section>;
}
