# Reader community

Implemented at `/community`, the three circle pages, and `/community/discussions/[slug]`.

## Reader flow

1. Create an account with a unique username, a display name, and a password of at least 10 characters. No real members or email service is required to test it.
2. Sign in using the same account on another browser or device connected to the **same running deployment**. Circles, bookmarks, completed practices, and private journals are stored on the server and refreshed every five seconds while pages are visible, and on focus/reconnect. Refresh sync retrieves changes immediately.
3. Publish a discussion from the community hub or a circle. Open it to bookmark it, keep a private journal, or reply. The original guided discussions also accept public replies.
4. Reply to an existing reply to create a nested conversation. Public posts display the author's display name. Readers can remove their own content and report other content.
5. Sign out to stop showing account journals. Guest activity uses the original `knovera_community_v1` browser storage key. Signing in does not automatically upload guest journals. The explicit Import button merges local activity and copies only reflections absent from the account.

Sync uses server-confirmed writes and revision checks. A stale write returns HTTP 409 without changing stored data. The draft stays available; refresh sync and retry. Failed writes never show a successful save. There is no offline upload queue: guests can write locally, but account changes require a connection.

## Persistence and deployment

Community data now uses the shared Supabase Postgres database. Follow `SUPABASE.md` for configuration, migrations and optional local-data import. There is no runtime SQLite or JSON fallback. Existing salted password hashes, hashed sessions, HttpOnly cookies, ownership checks and rate limits are preserved; switching to Supabase Auth is a separate task. Cross-device clients must use the same server URL.

The feed shows the latest 100 member discussions per hub/circle; direct discussion URLs remain available for older discussions. A discussion supports up to 300 replies and eight nested levels. Hidden parent replies remain as tombstones so child replies stay visible.

## Moderation

Create the owner's ordinary account first. Inspect `/api/community/session` while signed in and copy `member.id`. Set `COMMUNITY_MODERATOR_IDS` to that UUID (or a comma-separated set of owner-approved UUIDs), then restart the server. No default moderator or seeded credentials are created; user-controlled usernames cannot grant moderator access.

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

The HTTP suite requires a disposable Supabase project used by the preview server, its SUPABASE_DB_URL, and COMMUNITY_TEST_DISPOSABLE=1. It creates test accounts and removes them after success. Do not point it at production. The unit suite uses isolated embedded Postgres.

Verified: registration/login, invalid credentials, duplicate usernames, token forgery/revocation, private activity isolation, all four activity categories across independent login sessions, stale-write rejection, public posts, replies/nested replies, invalid parents/content, origin protection, guest write denial, reporting, ownership enforcement, moderator removal/restoration, password/token hashing, and existing storefront regressions. Browser checks confirm publishing/opening a new discussion, replies/nested replies, journal synchronization in another tab without reload, and journal clearing on sign-out.

Screenshot from disposable browser test: `artifacts/community/implemented-replies-sync.png`. The screenshot contains development test data; those accounts and posts are removed after verification.

## Remaining production services

This implements the community interaction and sync flows. Email verification, password recovery, transactional notifications, and Supabase Auth are not included. Accounts use usernames and passwords and do not claim email verification. Configure moderators and persistent storage before opening public registrations. Journal privacy is enforced at the application API boundary; database administrators still have access to stored data.
