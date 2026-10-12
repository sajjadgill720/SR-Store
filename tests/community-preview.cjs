// Disposable browser-test account. Setup before UI checks; cleanup afterwards.
const fs = require('node:fs');
const path = require('node:path');
const file = path.join(process.cwd(), 'artifacts/community/browser-fixture.json');
async function main() {
  if (process.argv[2] === 'cleanup') {
    const fixture = JSON.parse(fs.readFileSync(file, 'utf8'));
    const { DatabaseSync } = require('node:sqlite');
    const db = new DatabaseSync(path.join(process.cwd(), '.data/community.sqlite'));
    db.exec('PRAGMA busy_timeout=5000; BEGIN IMMEDIATE');
    try {
      db.prepare('DELETE FROM reports WHERE member=?').run(fixture.member.id);
      db.prepare('DELETE FROM replies WHERE member=?').run(fixture.member.id);
      db.prepare('DELETE FROM threads WHERE member=?').run(fixture.member.id);
      db.prepare('DELETE FROM sessions WHERE member=?').run(fixture.member.id);
      db.prepare('DELETE FROM activity WHERE member=?').run(fixture.member.id);
      db.prepare('DELETE FROM members WHERE id=?').run(fixture.member.id);
      db.exec('COMMIT');
    } catch (error) { db.exec('ROLLBACK'); throw error; } finally { db.close(); }
    fs.unlinkSync(file);
    console.log('Browser-test account and its data removed.');
    return;
  }
  const username = `preview-${Date.now().toString(36)}`;
  const origin = 'http://127.0.0.1:3000';
  const response = await fetch(`${origin}/api/community/session`, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: origin }, body: JSON.stringify({ action: 'register', username, password: 'Disposable-preview-2468', name: 'Development Test Reader' }) });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify({ username, member: result.member }));
  console.log(`Browser-test username: ${username}`);
}
main().catch(error => { console.error(error); process.exitCode = 1; });
