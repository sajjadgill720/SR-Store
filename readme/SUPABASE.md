# Supabase Postgres storage

The Next.js server uses a single Postgres connection pool for books, bundles, purchases, entitlements, support tickets, reviews, audit logs, community accounts/sessions, private journals, posts, replies and reports. There are **no JSON/SQLite fallbacks or dual writes for these records**. The catalog JSON in `supabase/seed` is an explicit one-time bootstrap input, never a runtime source. Supabase Storage holds ebook bytes; Realtime broadcasts change notifications, not another copy of application data.

Email delivery/consent still lives only in the existing email SQLite database; its old subscriber mirror has been removed. Guest browser reading preferences and cart state remain browser-local. Supabase Auth remains a separate integration.

## Connect your project

1. Create a Supabase project. In its **Connect** panel, copy the Postgres **session pooler** connection string for a long-running server/IPv4 connection. Use the transaction pooler for serverless deployments. Queries do not use named prepared statements.
2. Copy `.env.example` to `.env.local` and fill `SUPABASE_DB_URL`. Replace the password placeholder with the database password, URL-encoding special characters. This is a server secret, **not** the anon/publishable key and **not** a `NEXT_PUBLIC` value.
3. Remote connections verify TLS certificates. If your connection needs Supabase's root certificate, download it from the project database settings and set `SUPABASE_DB_CA_FILE`. Do not disable certificate verification.
4. Apply migrations:

```
node --env-file=.env.local scripts/database.mjs migrate
```

No remote schema/data changes have been applied as part of this implementation: project credentials are not present. Until configured, database-backed pages report a setup/unavailability error. This is intentional; missing credentials never silently switch storage or display old demo data.

## Choose one initial data path

For a fresh development project, load the sample catalog (no fake purchases or members):

```
node --env-file=.env.local scripts/database.mjs seed
```

To preserve local records instead, stop the development server, back up `.data`, then import **before seeding**:

```
node --env-file=.env.local scripts/database.mjs import-legacy "E:/SR Store/.data"
```

Import requires empty target book/order/member tables. It imports `db.json` and `community.sqlite` in one transaction, including password hashes and private activity. Foreign-key or uniqueness failures roll the whole import back; source files are never deleted or modified. Live local writes must stay stopped until cutover finishes. Expiring sessions and download tokens are not migrated; users sign in again. Email database/consent is not copied or inferred from legacy subscribers. Existing legacy orders require their referenced books to exist; repair missing references in the backup before re-running a failed import. Existing custom bundles were not stored locally; fresh seed can be run after import only if you also want the supplied sample catalog/bundle bootstrap.

```
node --env-file=.env.local scripts/database.mjs check
```

Restart the app. Keep old local files as an offline backup; runtime code no longer reads them. Seed is idempotent and never overwrites existing catalog entries. Migration checksums reject editing an already-applied migration. Future changes belong in new migration files.

## Access and integrity

Application tables use the private `knovera` schema, not Supabase's public Data API. RLS is enabled, with no browser-role policies. Do not add this schema to the exposed schema list or publish the database password. The server connects as the table owner via the project connection string; it is responsible for application authorization. Community session checks, private journals, author permissions, moderation and optimistic revisions remain enforced by the existing API.

**Existing launch blockers remain:** admin sign-in is still a UI preview. Admin data/actions and book mutations now refuse requests in production until proper Auth is implemented, because exposing order records would expose their private purchase tokens. Development retains the existing admin preview. Downloads require a paid purchase capability and active order-specific entitlement; email alone grants no access. Real payment-provider integration is also pending; simulated checkout and simulated downloads are disabled in production. Do not expose the development server publicly.

Checkout fulfillment creates the order, entitlements and audit record in one transaction. Provider event IDs are unique. Refunds revoke only that order's access; another paid purchase still grants access. Books are archived instead of physically deleted so paid purchases retain references. Order item titles/prices are historical snapshots; bundle items reference live books by ID rather than storing copies. Community changes use row locks and atomic rate counters; reply limits/parent validation are serialized per discussion.

Run expired-session/rate-limit housekeeping periodically:

```
node --env-file=.env.local scripts/database.mjs cleanup
```

## Verification

```
node --test tests/database.test.cjs tests/downloads-realtime.test.cjs tests/community-server.test.cjs tests/community.test.cjs tests/storefront.test.cjs tests/email.test.cjs
```

Tests execute the real migration and application SQL using isolated embedded Postgres (PGlite); they never contact your Supabase project. They cover migration reruns, catalog seeding, atomic purchase rollback, provider-event deduplication, repeat-purchase refunds, private journals/conflicts, replies, moderation, session revocation and schema access denial. Live Supabase connectivity, pooler and TLS verification require your configured project and are separate from these tests.

References: [Supabase Postgres connections](https://supabase.com/docs/guides/database/connecting-to-postgres), [node-postgres transactions](https://node-postgres.com/features/transactions).

## Private ebook Storage

Fill these values in `.env.local` using the same Supabase project as `SUPABASE_DB_URL`:

- `NEXT_PUBLIC_SUPABASE_URL`: project API URL.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: public publishable key (legacy anon key also works). Rebuild/restart after changing public values.
- `SUPABASE_SECRET_KEY`: server secret key, or legacy service-role key. Never use a public prefix or put it in browser code.
- `SUPABASE_EBOOK_BUCKET`: defaults to `ebooks`.

Apply migrations, then create the private bucket:

```powershell
node --env-file=.env.local scripts/database.mjs migrate
node --env-file=.env.local scripts/storage.mjs init
```

Upload your actual PDFs/EPUBs to the object paths in each book's `currentEdition.assets[].storageKey`. The bucket name is separate from the object path; keep any `secure/books/` prefix present in the catalog. There are no placeholder file responses anymore. Use the Storage dashboard or the upload helper:

```powershell
node --env-file=.env.local scripts/storage.mjs upload BOOK_ID pdf "E:/ebooks/edition.pdf"
node --env-file=.env.local scripts/storage.mjs upload BOOK_ID epub "E:/ebooks/edition.epub"
```

The helper validates the file header, uses the server-side catalog path, and refuses to overwrite existing files. `init` creates a private bucket with a 100 MB per-file limit and PDF/EPUB MIME types (project limits also apply). Do not add browser SELECT or upload policies for this bucket, and do not make it public. Existing broad Storage policies should not grant access to `ebooks`. The signing service checks that the bucket is private on every request.

Opening a valid paid receipt/recovery link establishes a one-hour HttpOnly, SameSite=Strict cookie for that order's library. This is purchase-link access, not a customer account login. The library lists only that order's active editions; recover another order to switch. `/api/downloads` accepts the receipt's `orderToken` or this cookie, never an email as authorization. It verifies paid status, order item/format and an active entitlement for that exact order before creating a **five-minute** signed Supabase Storage URL. A revoked/refunded purchase cannot issue new links even if the same email has another active order. An already-issued URL remains valid until its five-minute expiry, and downloaded files cannot be recalled. Private purchase links remain valid until access is revoked and must be treated as passwords. Token pages send no-referrer/noindex headers.

Migration 002 removes the obsolete preview download-token table; old `/api/downloads/:token` links return 410. There is no second download-token database or duplicate ebook store.

## Realtime activation and verification

Migration 002 installs statement triggers and a receive-only RLS policy on Supabase's managed `realtime.messages`. Use the project database owner via the migration CLI. This migration requires an actual Supabase project with Realtime enabled; it is not intended for a plain Postgres server without that service. No `postgres_changes` publication or exposure of the `knovera` schema is needed. The app subscribes to the private `knovera:community` Broadcast channel using the public key; its narrowly scoped policy permits anon/authenticated listeners because the only payload is `{}`. There is no client INSERT policy. Avoid broad pre-existing Realtime policies that permit browser publishing to this topic.

Post/reply creation, removal/restoration, reports and reading-activity writes send a generic `changed` notification after commit. No row values, IDs, authors, report text or journal content are broadcast. Aggregate change timing is observable by listeners. Each tab shares one socket and debounces events, then refetches through the existing session/permission-checked API. Tabs refetch on reconnect/focus; disconnected/unconfigured tabs poll every five seconds, with a one-minute reconciliation while connected. Community Auth still uses the existing server sessions.

With your project configured, open two separate browsers at `/community`, sign in to two test accounts, post a discussion/reply, and confirm the other browser updates without reload. Browser developer tools should show a successful `realtime/v1/websocket` connection and `phx_join` reply, followed by `changed` events. Test the same account in both browsers for private reading activity and different accounts for journal isolation. Disconnect Realtime and confirm polling continues. For downloads, verify real PDF/EPUB bytes, unauthenticated/email-only denial, wrong-book denial, a refunded-order denial, and expiry of a saved signed URL after five minutes.

Automated tests exercise real application SQL in isolated PGlite, with test-only stand-ins for Supabase-managed Realtime functions. Storage signing and socket lifecycle tests use SDK mocks. They do **not** prove hosted Storage, live WebSocket authorization, or remote URL expiry; those checks require your project credentials and uploaded files.
