import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { randomBytes, createHash } from 'node:crypto';
let connection;
function database() {
  if (connection) return connection;
  const filename = process.env.EMAIL_DB_PATH || path.join(process.cwd(), '.data', 'email.sqlite');
  mkdirSync(path.dirname(filename), { recursive: true });
  connection = new DatabaseSync(filename);
  connection.exec(`PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;
    CREATE TABLE IF NOT EXISTS mail (id TEXT PRIMARY KEY, recipient TEXT NOT NULL, payload TEXT NOT NULL, state TEXT NOT NULL, attempts INTEGER DEFAULT 0, created INTEGER NOT NULL, next_attempt INTEGER DEFAULT 0, provider_id TEXT, error TEXT);
    CREATE TABLE IF NOT EXISTS contacts (email TEXT PRIMARY KEY, topics TEXT NOT NULL, status TEXT NOT NULL, token TEXT NOT NULL, expires INTEGER NOT NULL, unsubscribe TEXT NOT NULL, consent INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS limits (key TEXT PRIMARY KEY, expires INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS club_sessions (digest TEXT PRIMARY KEY, email TEXT NOT NULL, verified INTEGER NOT NULL, expires INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS campaigns (id TEXT PRIMARY KEY, digest TEXT NOT NULL);`);
  return connection;
}
const hash = value => createHash('sha256').update(value).digest('hex');
const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
function emailAddress(value) {
  if (typeof value !== 'string' || value.length > 254 || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(value.trim())) throw new Error('Valid email required');
  return value.trim().toLowerCase();
}
function origin() {
  const url = new URL(process.env.EMAIL_SITE_URL || 'http://127.0.0.1:3000');
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) throw new Error('Invalid EMAIL_SITE_URL');
  return url.origin;
}
function liveConfigured() {
  if (process.env.EMAIL_MODE !== 'resend') return false;
  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM || !process.env.EMAIL_SITE_URL || new URL(origin()).protocol !== 'https:') throw new Error('Email delivery configuration is incomplete');
  return true;
}
function available() {
  if (process.env.NODE_ENV === 'production' && process.env.EMAIL_MODE !== 'resend') throw new Error('Email delivery is not configured');
  liveConfigured();
}
function cooldown(key, seconds = 60) {
  const result = database().prepare('INSERT INTO limits VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET expires=excluded.expires WHERE limits.expires <= ?').run(hash(key), Date.now() + seconds * 1000, Date.now());
  return result.changes > 0;
}
function publicCapacity() {
  // Global cap complements the per-address cooldown without trusting proxy IP headers.
  const count = database().prepare("SELECT count(*) AS n FROM mail WHERE created>? AND (id LIKE 'confirmation-%' OR id LIKE 'recovery-%')").get(Date.now()-3600000).n;
  if (count >= 100) throw new Error('Email request limit reached');
}
function template(title, text, links = []) {
  const html = `<html><body style="margin:0;background:#f4f6fa;font-family:Arial,sans-serif;color:#17283c"><main style="max-width:560px;margin:32px auto;background:white;border-radius:16px;padding:32px"><p style="color:#285bd4;font-weight:bold">KNOVERA</p><h1 style="font-size:26px">${escape(title)}</h1><p style="line-height:1.7;white-space:pre-line">${escape(text)}</p>${links.map(link => `<p><a style="color:#285bd4" href="${escape(link.url)}">${escape(link.label)}</a></p>`).join('')}<hr style="border:0;border-top:1px solid #e5e9ef"><p style="color:#738094;font-size:12px">Knovera · Books, ideas & community</p></main></body></html>`;
  return { html, text: `${title}\n\n${text}\n\n${links.map(link => `${link.label}: ${link.url}`).join('\n')}` };
}
function queue(id, recipient, subject, content, options = {}) {
  const live = !options.preview && liveConfigured();
  database().prepare('INSERT OR IGNORE INTO mail(id,recipient,payload,state,created) VALUES(?,?,?,?,?)').run(id, emailAddress(recipient), JSON.stringify({ subject, ...content, ...options }), live ? 'queued' : 'preview', Date.now());
  return id;
}
async function deliver(id) {
  const row = database().prepare('SELECT * FROM mail WHERE id=?').get(id);
  if (!row || row.state !== 'queued' || row.next_attempt > Date.now()) return row?.state;
  if (!liveConfigured()) return 'queued';
  // Claim before awaiting network; another worker cannot send the same row concurrently.
  if (!database().prepare("UPDATE mail SET state='sending', attempts=attempts+1, next_attempt=? WHERE id=? AND state='queued'").run(Date.now()+120000, id).changes) return 'sending';
  const payload = JSON.parse(row.payload);
  if (payload.campaign && database().prepare("SELECT status FROM contacts WHERE email=?").get(row.recipient)?.status !== 'subscribed') {
    database().prepare("UPDATE mail SET state='cancelled' WHERE id=?").run(id);
    return 'cancelled';
  }
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST', signal: AbortSignal.timeout(15000),
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json', 'Idempotency-Key': id },
      body: JSON.stringify({ from: process.env.EMAIL_FROM, to: [row.recipient], subject: payload.subject, html: payload.html, text: payload.text, ...(payload.headers ? { headers: payload.headers } : {}) }),
    });
    if (!response.ok) throw new Error(`Email provider returned HTTP ${response.status}`);
    const data = await response.json();
    if (!data.id) throw new Error('Email provider returned no message ID');
    database().prepare("UPDATE mail SET state='accepted', provider_id=?, error=NULL WHERE id=?").run(data.id, id);
    return 'accepted';
  } catch (error) {
    // Retry only inside Resend's 24-hour idempotency window. Manual review after that.
    const retry = row.attempts < 4 && Date.now() - row.created < 20 * 60 * 60 * 1000;
    database().prepare('UPDATE mail SET state=?, error=?, next_attempt=? WHERE id=?').run(retry ? 'queued' : 'failed', error.message, Date.now()+Math.pow(2,row.attempts)*60000, id);
    return retry ? 'queued' : 'failed';
  }
}
async function drain() {
  database().prepare("UPDATE mail SET state='queued' WHERE state='sending' AND next_attempt < ?").run(Date.now());
  database().prepare("UPDATE mail SET state='failed',error='Retry window expired; inspect provider logs before resending' WHERE state='queued' AND created < ?").run(Date.now()-20*60*60*1000);
  const rows = database().prepare("SELECT id FROM mail WHERE state='queued' AND next_attempt <= ? LIMIT 50").all(Date.now());
  for (const row of rows) { await deliver(row.id); await new Promise(resolve => setTimeout(resolve, 600)); }
  return rows.length;
}
function receipt(order) {
  const total = new Intl.NumberFormat('en-US', { style: 'currency', currency: order.currency }).format(order.totalAmount/100);
  return queue(`receipt-${order.id}`, order.customerEmail, `Your Knovera receipt · ${order.orderNumber}`, template('Thank you for your order', `${order.customerName || 'Reader'}, your books are ready.\n\n${order.items.map(item => item.title).join('\n')}\n\nTotal: ${total}\nOrder: ${order.orderNumber}`, [{ label: 'Open your order and books', url: `${origin()}/orders/${encodeURIComponent(order.publicToken)}` }]), { preview: order.provider === 'development_simulator' });
}
function recovery(email, orders) {
  available();
  publicCapacity();
  if (!cooldown(`recovery:${email}`, 300) || !orders.length) return null;
  return queue(`recovery-${randomBytes(16).toString('hex')}`, email, 'Your Knovera purchase links', template('Back to your books', 'Someone requested purchase links for this email address. If it was not you, you can ignore this email. Keep these links private.', orders.map(order => ({ label: order.orderNumber, url: `${origin()}/orders/${encodeURIComponent(order.publicToken)}` }))), {preview: orders.every(order => order.provider === 'development_simulator')});
}
function subscribe(email, topics) {
  email = emailAddress(email);
  const existing = database().prepare('SELECT * FROM contacts WHERE email=?').get(email);
  // Idempotent: a repeat must neither send another email nor invalidate a live link.
  if (existing?.status === 'subscribed' || (existing?.status === 'pending' && existing.expires > Date.now())) return null;
  available();
  publicCapacity();
  if (!cooldown(`subscribe:${email}`, 300)) return null;
  const token = randomBytes(32).toString('hex');
  const unsubscribe = existing?.unsubscribe || randomBytes(32).toString('hex');
  database().prepare('INSERT INTO contacts VALUES (?,?,?,?,?,?,?) ON CONFLICT(email) DO UPDATE SET topics=excluded.topics,status=excluded.status,token=excluded.token,expires=excluded.expires,consent=excluded.consent').run(email, JSON.stringify(topics), 'pending', hash(token), Date.now()+86400000, unsubscribe, Date.now());
  return queue(`confirmation-${hash(token)}`, email, 'Confirm your Knovera subscription', template('One more step to join', 'Confirm that you want book news and reading ideas from Knovera. This link expires in 24 hours. If you did not sign up, ignore this email.', [{label:'Confirm subscription',url:`${origin()}/newsletter/confirm?token=${token}`} ]));
}
function confirm(token) {
  if (!/^[a-f0-9]{64}$/.test(token)) return null;
  const contact = database().prepare('SELECT * FROM contacts WHERE token=? AND expires>?').get(hash(token), Date.now());
  if (!contact || contact.status === 'unsubscribed') return null;
  database().prepare("UPDATE contacts SET status='subscribed' WHERE email=?").run(contact.email);
  return { email: contact.email, topics: JSON.parse(contact.topics), consent: contact.consent };
}
function unsubscribe(token) {
  if (!/^[a-f0-9]{64}$/.test(token)) return false;
  return database().prepare("UPDATE contacts SET status='unsubscribed' WHERE unsubscribe=?").run(token).changes > 0;
}
function campaign(input) {
  available();
  if (!/^[a-z0-9-]{1,80}$/.test(input.id) || typeof input.subject !== 'string' || !input.subject.trim() || input.subject.length>150 || typeof input.body !== 'string' || !input.body.trim() || input.body.length>20000) throw new Error('Campaign requires id (lowercase letters, digits, hyphens), subject and body');
  if (!process.env.EMAIL_POSTAL_ADDRESS) throw new Error('Set EMAIL_POSTAL_ADDRESS before sending newsletters');
  const digest = hash(JSON.stringify(input));
  const previous = database().prepare('SELECT digest FROM campaigns WHERE id=?').get(input.id);
  if (previous && previous.digest !== digest) throw new Error('Campaign ID already belongs to different content');
  database().prepare('INSERT OR IGNORE INTO campaigns VALUES (?,?)').run(input.id,digest);
  const contacts = database().prepare("SELECT * FROM contacts WHERE status='subscribed'").all();
  let count=0;
  for (const contact of contacts) {
    if (input.topic && !JSON.parse(contact.topics).includes(input.topic)) continue;
    const url = `${origin()}/newsletter/unsubscribe?token=${contact.unsubscribe}`;
    queue(`campaign-${input.id}-${hash(contact.email)}`, contact.email,input.subject,template(input.subject,`${input.body}\n\n${process.env.EMAIL_POSTAL_ADDRESS}`,[{label:'Unsubscribe',url}]),{campaign:input.id,headers:{'List-Unsubscribe':`<${origin()}/api/newsletter/unsubscribe?token=${contact.unsubscribe}>`,'List-Unsubscribe-Post':'List-Unsubscribe=One-Click'}});
    count++;
  }
  return count;
}
function outbox() { return database().prepare('SELECT id,recipient,state,attempts,created,provider_id,error FROM mail ORDER BY created DESC').all(); }
function preview(id) { const row=database().prepare("SELECT payload FROM mail WHERE id=? AND state='preview'").get(id); return row ? JSON.parse(row.payload) : null; }
function contactStatus(email) { return database().prepare('SELECT status FROM contacts WHERE email=?').get(email)?.status; }
function rememberClub(email, verified = false) {
  const token = randomBytes(32).toString('hex');
  const seconds = verified ? 31536000 : 86400;
  database().prepare('DELETE FROM club_sessions WHERE expires <= ?').run(Date.now());
  database().prepare('INSERT INTO club_sessions VALUES (?,?,?,?)').run(hash(token), emailAddress(email), Number(verified), Date.now() + seconds * 1000);
  return { token, seconds };
}
function clubSessionStatus(token) {
  if (typeof token !== 'string' || !/^[a-f0-9]{64}$/.test(token)) return 'none';
  const row = database().prepare('SELECT * FROM club_sessions WHERE digest=? AND expires>?').get(hash(token), Date.now());
  if (!row) return 'none';
  const status = contactStatus(row.email);
  if (!status || status === 'unsubscribed') return 'none';
  // A signup alone does not prove ownership or reveal another person's membership.
  return row.verified && status === 'subscribed' ? 'subscribed' : 'pending';
}
function contacts() { return database().prepare('SELECT email,topics,status,consent FROM contacts').all().map(row=>({email:row.email,topics:JSON.parse(row.topics),status:row.status,consentTimestamp:new Date(row.consent).toISOString()})); }
function close() { connection?.close(); connection = undefined; }
export { emailAddress, available, cooldown, queue, deliver, drain, receipt, recovery, subscribe, confirm, unsubscribe, campaign, outbox, preview, template, contactStatus, contacts, close, rememberClub, clubSessionStatus };
