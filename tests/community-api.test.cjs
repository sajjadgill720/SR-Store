/* eslint-disable @typescript-eslint/no-require-imports -- Optional live integration test. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {randomBytes}=require('node:crypto');
const {createClient}=require('@supabase/supabase-js');
const {createServerClient}=require('@supabase/ssr');
const origin=process.env.COMMUNITY_TEST_URL;

test('live Supabase Auth: readers, server roles, journals, replies, recovery and logout',{
  skip:!origin || process.env.COMMUNITY_TEST_DISPOSABLE!=='1' || !process.env.SUPABASE_SECRET_KEY,
},async()=>{
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const admin=createClient(url,process.env.SUPABASE_SECRET_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
  const {query,transaction,close}=await import('../lib/db/postgres.mjs');
  const users=[],jars=[new Map(),new Map(),new Map()];
  const clients=[];
  async function request(jar,path,body,options={}) {
    const r=await fetch(origin+path,{method:body===undefined?'GET':'POST',redirect:'manual',headers:{Origin:origin,...(body===undefined?{}:{'Content-Type':'application/json'}),Cookie:[...jar].map(([k,v])=>`${k}=${v}`).join('; '),...options},body:body===undefined?undefined:JSON.stringify(body)});
    for(const raw of r.headers.getSetCookie()) {
      const first=raw.split(';')[0],position=first.indexOf('='),name=first.slice(0,position),value=first.slice(position+1);
      if(/max-age=0(?:;|$)/i.test(raw)) jar.delete(name);else jar.set(name,decodeURIComponent(value));
    }
    return {status:r.status,data:r.headers.get('content-type')?.includes('application/json')?await r.json():null};
  }
  try {
    for(let i=0;i<2;i++) {
      const email=`codex-auth-${randomBytes(8).toString('hex')}@example.invalid`,password=randomBytes(24).toString('base64url');
      // Admin-created confirmed test accounts send no email. No real account is modified.
      const created=await admin.auth.admin.createUser({email,password,email_confirm:true,user_metadata:{name:`Auth Test ${i}`,role:'admin'}});
      assert.equal(created.error,null,'Could not create disposable Auth account');users.push(created.data.user);
      const client=createServerClient(url,key,{cookies:{getAll:()=>[...jars[i]].map(([name,value])=>({name,value})),setAll:values=>values.forEach(({name,value})=>jars[i].set(name,value))}});
      clients.push(client);
      assert.equal((await client.auth.signInWithPassword({email,password})).error,null,'Test sign-in failed');
    }
    assert.equal((await request(new Map(),'/api/admin/actions')).status,401);
    assert.equal((await request(jars[0],'/api/admin/actions')).status,403,'Reader metadata must not grant admin');
    assert.equal((await request(jars[0],'/api/auth/session')).data.user.id,users[0].id);
    assert.equal((await request(jars[0],'/api/me/library')).status,200);
    const a=(await request(jars[0],'/api/community/session')).data.member;
    const b=(await request(jars[1],'/api/community/session')).data.member;
    assert.equal(a.id,users[0].id);assert.equal(b.id,users[1].id);
    assert.equal((await request(jars[0],'/api/community/session',{action:'login',username:'unused',password:'unused'})).status,410);
    assert.equal((await request(new Map(),'/api/community/activity',{field:'joined',id:'the-focus-room',value:true,revision:0})).status,401);
    assert.equal((await request(jars[0],'/api/community/activity',{field:'joined',id:'the-focus-room',value:true,revision:0},{Origin:'https://evil.example'})).status,403);
    const saved=await request(jars[0],'/api/community/activity',{field:'notes',id:'protecting-your-first-hour',value:'Private test journal',revision:0});assert.equal(saved.status,200);
    assert.equal((await request(jars[1],'/api/community/session')).data.activity.notes['protecting-your-first-hour'],undefined);
    const posted=await request(jars[0],'/api/community/threads',{circle:'the-focus-room',title:'Disposable Auth integration test',body:'This record will be removed after verification.'});assert.equal(posted.status,201);
    const thread=posted.data.id;
    assert.equal((await request(jars[1],'/api/community/replies',{discussion:thread,body:'Reply from another verified account.'})).status,201);
    const reply=(await request(jars[0],`/api/community/replies?discussion=${thread}`)).data.replies[0];
    assert.equal((await request(jars[0],'/api/community/replies',{discussion:thread,parentId:reply.id,body:'Nested reply test.'})).status,201);
    assert.equal((await request(new Map(),`/api/community/replies?discussion=${thread}`)).data.replies.length,2);
    assert.equal((await request(jars[0],'/api/community/moderation',{kind:'reply',id:reply.id,action:'hide'})).status,403);
    await query('INSERT INTO knovera.account_roles VALUES($1,$2)',[users[0].id,'admin']);
    assert.equal((await request(jars[0],'/api/admin/actions')).status,200);
    assert.equal((await request(jars[0],'/api/books',{title:'Must not be created'},{Origin:'https://evil.example'})).status,403);
    await query('DELETE FROM knovera.account_roles WHERE user_id=$1',[users[0].id]);
    assert.equal((await request(jars[0],'/api/admin/actions')).status,403);
    // Generate a reset link without sending mail; consume through the actual confirmation route.
    const link=await admin.auth.admin.generateLink({type:'recovery',email:users[0].email});assert.equal(link.error,null);
    const confirmed=await request(jars[2],'/api/auth/confirm',{type:'recovery',token_hash:link.data.properties.hashed_token});
    assert.equal(confirmed.status,200);assert.equal(confirmed.data.next,'/account/update-password');
    assert.equal((await request(jars[2],'/api/auth/session')).data.user.id,users[0].id);
    assert.equal((await request(jars[0],'/api/auth/logout',{})).status,200);
    assert.equal((await request(jars[0],'/api/auth/session')).data.user,null);
    assert.equal((await request(jars[0],'/api/community/session')).data.member,null);
  } finally {
    const ids=users.map(user=>user.id);
    try {
      if(ids.length) await transaction(async db=>{
        await db.query('DELETE FROM knovera.reports WHERE member=ANY($1::text[])',[ids]);
        await db.query('DELETE FROM knovera.replies WHERE member=ANY($1::text[])',[ids]);
        await db.query('DELETE FROM knovera.threads WHERE member=ANY($1::text[])',[ids]);
        await db.query('DELETE FROM knovera.activity WHERE member=ANY($1::text[])',[ids]);
        await db.query('DELETE FROM knovera.members WHERE id=ANY($1::text[])',[ids]);
      });
      for(const user of users) assert.equal((await admin.auth.admin.deleteUser(user.id)).error,null,'Could not remove disposable Auth user');
    } finally {await close();}
  }
});
