// Disposable browser-test account. Setup before UI checks; cleanup afterwards.
const fs = require('node:fs');
const path = require('node:path');
const file = path.join(process.cwd(), 'artifacts/community/browser-fixture.json');
async function main() {
  if (process.env.COMMUNITY_TEST_DISPOSABLE !== '1' || !process.env.SUPABASE_DB_URL) throw new Error('Use a disposable Postgres project with COMMUNITY_TEST_DISPOSABLE=1');
  if (process.argv[2] === 'cleanup') {
    const fixture = JSON.parse(fs.readFileSync(file, 'utf8'));
    const {transaction,close}=await import('../lib/db/postgres.mjs');
    try {await transaction(async db=>{
      for(const table of ['reports','replies','threads','sessions','activity']) await db.query('DELETE FROM knovera.'+table+' WHERE member=$1',[fixture.member.id]);
      await db.query('DELETE FROM knovera.members WHERE id=$1',[fixture.member.id]);
    });} finally {await close();}
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
