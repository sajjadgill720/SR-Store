import { transaction, close } from '../lib/db/postgres.mjs';

async function main() {
  const [command,userId,value]=process.argv.slice(2);
  if(!['set-role','link-member'].includes(command) || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId || ''))
    throw new Error('Usage: node --env-file=.env scripts/auth-admin.mjs set-role <auth-user-uuid> <admin|moderator|reader> | link-member <auth-user-uuid> <legacy-member-id>');
  await transaction(async client=>{
    const user=(await client.query('SELECT id FROM auth.users WHERE id=$1 AND email_confirmed_at IS NOT NULL AND email IS NOT NULL',[userId])).rows[0];
    if(!user) throw new Error('A confirmed Supabase email account is required.');
    if(command==='set-role') {
      if(!['reader','admin','moderator'].includes(value)) throw new Error('Choose reader, admin or moderator.');
      if(value==='reader') await client.query('DELETE FROM knovera.account_roles WHERE user_id=$1',[userId]);
      else await client.query('INSERT INTO knovera.account_roles(user_id,role) VALUES($1,$2) ON CONFLICT(user_id) DO UPDATE SET role=excluded.role',[userId,value]);
    } else {
      if(!value) throw new Error('Supply the legacy member ID after verifying the owner through your support process.');
      if((await client.query('SELECT id FROM knovera.members WHERE auth_user_id=$1',[userId])).rows.length)
        throw new Error('This Auth user already has a linked profile. Use a reviewed data migration to merge profiles; no records were changed.');
      const linked=await client.query('UPDATE knovera.members SET auth_user_id=$1,password=NULL WHERE id=$2 AND auth_user_id IS NULL RETURNING id',[userId,value]);
      if(!linked.rowCount) throw new Error('No unlinked legacy member found.');
    }
    await client.query('INSERT INTO knovera.audit_logs VALUES(gen_random_uuid()::text,$1,$2,$3)',[command==='set-role'?'ACCOUNT_ROLE_CHANGED':'LEGACY_MEMBER_LINKED',`${userId}: ${value}`,new Date().toISOString()]);
  });
  console.log(`Account ${command} completed.`);
}
main().catch(error=>{console.error(error.code?`Account operation failed (${error.code}).`:error.message);process.exitCode=1;}).finally(close);
