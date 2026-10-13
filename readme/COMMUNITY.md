# Reader community

Implemented at `/community`, the three circle pages, and `/community/discussions/[slug]`.

## Reader flow

1. Create an account at `/account/login` with an email, display name and password of at least 10 characters, then confirm the email through Supabase Auth. See [SUPABASE_AUTH.md](SUPABASE_AUTH.md) for provider, SMTP, redirects and owner-role setup.
2. Sign in using the same account on another browser or device connected to the **same running deployment**. Posts, replies, moderation and private reading activity refresh on Supabase Realtime notifications. Each tab shares one subscription. If Realtime is unavailable or unconfigured, visible pages fall back to five-second polling; connected tabs reconcile once per minute and on focus/reconnect. Refresh sync also retrieves changes immediately.
3. Publish a discussion from the community hub or a circle. Open it to bookmark it, keep a private journal, or reply. The original guided discussions also accept public replies.
4. Reply to an existing reply to create a nested conversation. Public posts display the author's display name. Readers can remove their own content and report other content.
5. Sign out to stop showing account journals. Guest activity uses the original `knovera_community_v1` browser storage key. Signing in does not automatically upload guest journals. The explicit Import button merges local activity and copies only reflections absent from the account.

Sync uses server-confirmed writes and revision checks. A stale write returns HTTP 409 without changing stored data. The draft stays available; refresh sync and retry. Failed writes never show a successful save. There is no offline upload queue: guests can write locally, but account changes require a connection.

## Persistence and deployment

Community data uses the shared Supabase Postgres database. Follow `SUPABASE.md` for data configuration and `SUPABASE_AUTH.md` for Auth. There is no runtime SQLite or JSON fallback. Supabase Auth replaces custom password/session authentication; legacy content stays intact and can be linked through the trusted migration command. Ownership checks, private journals, content rate limits and revision checks remain in the server API. Cross-device clients must use the same deployment.

The feed shows the latest 100 member discussions per hub/circle; direct discussion URLs remain available for older discussions. A discussion supports up to 300 replies and eight nested levels. Hidden parent replies remain as tombstones so child replies stay visible.

## Moderation

Create and confirm the owner's Supabase account first. Copy its User UID from Authentication → Users, then use `node --env-file=.env scripts/auth-admin.mjs set-role USER-UUID admin` or use `moderator` for community-only moderation. No default moderator or seeded credentials are created. Roles come from the private database, never user metadata or usernames. `COMMUNITY_MODERATOR_IDS` is retired.

Moderators see reported content and reasons on the hub/circle pages, can dismiss reports while keeping content, remove reported posts/replies, and restore hidden content. Hidden posts are omitted from ordinary feeds, and removed replies show a tombstone. Moderator feeds include hidden posts; the replies endpoint returns their original content only to moderators. Moderator actions resolve associated reports. Account journals are never returned by public feeds, replies, or moderation endpoints.

## Validation

```powershell
node --test tests/community.test.cjs tests/community-server.test.cjs tests/storefront.test.cjs
$env:COMMUNITY_TEST_URL='http://127.0.0.1:3000'
$env:COMMUNITY_TEST_DISPOSABLE='1'
node --env-file=.env.local --test tests/community-api.test.cjs
node node_modules/typescript/bin/tsc --noEmit
node node_modules/next/dist/bin/next build
```

The HTTP suite requires a development Supabase project used by the preview server, its public URL/key, server secret, database URL and COMMUNITY_TEST_DISPOSABLE=1. It creates temporary confirmed Auth accounts without sending email and cleans its accounts/content in a finally block. Do not point it at production. The unit suite uses isolated embedded Postgres. The old username/password browser-fixture script has been removed.

Current verification covers Supabase login, Auth-cookie handling, reader/admin role boundaries and revocation, recovery-token confirmation, logout, private activity isolation, stale-write rejection, posts, nested replies, invalid parents/content, origin protection, guest write denial, reporting and moderation. The offline suite also covers account purchase ownership, refunds and existing storefront regressions. Real email delivery requires your SMTP configuration and manual checks.

Historical screenshot: `artifacts/community/implemented-replies-sync.png` documents the earlier community UI; it is not evidence of Supabase Auth or email delivery.

## Remaining production services

Supabase Auth, email-confirmation and password-recovery code are implemented. Configure Auth SMTP, email templates and owner roles before opening registrations. Community email notifications, OAuth and MFA UI are separate future features. Journal privacy is enforced at the application API boundary; database administrators still have access to stored data.
