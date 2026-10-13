# Supabase Postgres storage

The Next.js server now uses a single Postgres connection pool for books, bundles, purchases, entitlements, download tokens, support tickets, reviews, audit logs, community accounts/sessions, private journals, posts, replies and reports. There are **no JSON/SQLite fallbacks or dual writes for these records**. The catalog JSON in `supabase/seed` is an explicit one-time bootstrap input, never a runtime source.

Email delivery/consent still lives only in the existing email SQLite database; its old subscriber mirror has been removed. Guest browser reading preferences and cart state remain browser-local. Moving those to authenticated accounts, Supabase Auth, Realtime and Storage is outside this database migration.

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

**Existing launch blockers remain:** the admin page is still a sign-in UI preview and admin/book mutation APIs have not yet been protected with Supabase Auth. Library/download access also still uses the existing email-based mechanism. Do not publicly deploy the application with real customer data until that authentication work is complete. This migration does not claim to solve those access flows.

Checkout fulfillment creates the order, entitlements and audit record in one transaction. Provider event IDs are unique. Refunds revoke only that order's access; another paid purchase still grants access. Books are archived instead of physically deleted so paid purchases retain references. Order item titles/prices are historical snapshots; bundle items reference live books by ID rather than storing copies. Community changes use row locks and atomic rate counters; reply limits/parent validation are serialized per discussion.

Run expired-session/token housekeeping periodically:

```
node --env-file=.env.local scripts/database.mjs cleanup
```

## Verification

```
node --test tests/database.test.cjs tests/community-server.test.cjs tests/community.test.cjs tests/storefront.test.cjs tests/email.test.cjs
```

Tests execute the real migration and application SQL using isolated embedded Postgres (PGlite); they never contact your Supabase project. They cover migration reruns, catalog seeding, atomic purchase rollback, provider-event deduplication, repeat-purchase refunds, private journals/conflicts, replies, moderation, session revocation and schema access denial. Live Supabase connectivity, pooler and TLS verification require your configured project and are separate from these tests.

References: [Supabase Postgres connections](https://supabase.com/docs/guides/database/connecting-to-postgres), [node-postgres transactions](https://node-postgres.com/features/transactions).
