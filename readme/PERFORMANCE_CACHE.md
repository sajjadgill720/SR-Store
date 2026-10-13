> Catalog update: the five-minute public catalog policy and public HTTP measurements below describe the earlier implementation. See [CATALOG_CACHE.md](CATALOG_CACHE.md) for the current persistent browser cache and revision checks. Private-cache sections remain applicable.

# Knovera caching audit and maintenance

Implemented 14 October 2026. This report distinguishes component rendering, HTTP requests, and SQL calls. They are not interchangeable.

## Runtime and decisions

- Next.js 16.4 App Router, React 19.3, Cache Components and partial prerendering. Public server components pass catalog data to client components. No second browser catalog fetch is needed.
- Supabase Postgres through one `pg` pool per process; Supabase Auth SSR cookies; private Storage signed URLs; private Realtime invalidation channel.
- Existing shopping/community external stores and local React state. No TanStack Query, Redux query client, or new infrastructure was added. The small bounded memory helper extends the existing design.
- Development runs at port 3000. The repository does not establish a production hosting provider or shared cache backend. Default Next cache memory is per process, not durable distributed storage.

## Inventory (captured before implementation)

| Source → consumers | Original trigger | Decision / freshness |
|---|---|---|
| Postgres books + bundles → home, books, book detail, sample, bundle, public API | Shared `use cache`, one-week refresh | Retain framework cache, reduce to 5 minutes; invalidate on publishing/archive |
| Category definitions → catalog controls | Local imported data | No network, deployed with code |
| Catalog search, sorting, saved-only filter → Catalog | Local state and supplied books | Keep local; no search API or arbitrary search-cache entries |
| Guest shopping cart/wishlist → cart provider, cards, modal, checkout | Persisted local store and storage events | Keep local; these do not query Supabase |
| Auth identity → session API, all protected operations | Browser auth events and verified API requests | Server authorization remains uncached |
| Community session/activity → member panel, circle controls, journals, content controls | First subscription, initial Auth event, token events, initial Realtime connection, broadcast, focus/online, 5-second disconnected polling | Deduplicate; 30-second display cache; account change clears state |
| Threads/replies/detail/reports → SharedCommunity useLive | Mount, session settling, remount, manual reload, every broadcast | Account-scoped 15-second memory cache; explicit content invalidations |
| Library → account page | Every mount; abort/restart in Strict Mode | Account-scoped 30-second memory cache and shared in-flight promise |
| Orders → receipt/checkout return | Token change/mount | Keep fresh, private/no-store; token is a capability |
| Admin aggregate → dashboard | Mount and every write | Deduplicate simultaneous loads; patch successful book/ticket/review writes; refresh refund aggregates |
| Checkout → simulator endpoint/payment adapter | Submit only | Fresh prices, publication, stock, rights and quantity checks; batch book read |
| Entitlements/Storage → download endpoint | Download click | Fresh verified ownership/order/format/entitlement checks; signed URL never cached |
| Support, newsletter, recovery → forms | Explicit submission | No read cache; avoid caching side effects |
| ReviewsSection server component → legacy home component | Server render if used | Currently not mounted by Marketplace; not a source of homepage reads |

All API handlers use the database helpers, community server, Auth store or email service. Email contacts use the existing email subsystem; this change does not duplicate their persistence. No recreated query provider was found. Supabase's browser SDK singleton is now explicit and owns one account-change listener.

## Causes and changes

1. The catalog was already cached. Local filtering, wishlist toggles, cart changes and modal interaction were not causing SQL reads. The previous weekly freshness was unnecessarily long for displayed prices.
2. Community startup could read the same session from mount, initial Auth delivery and initial socket join. Token refreshes also cleared state unnecessarily. Reads now deduplicate; initial socket join does not repeat the initial load, and unchanged identities do not reset the store.
3. Disconnected community polling ran every five seconds. It now runs every thirty seconds; connected reconciliation remains once per minute. Broadcasts, focus and reconnect still refresh. Hidden tabs do not execute refresh callbacks.
4. Every mounted useLive resource separately fetched again when the session settled. It now waits for the session, retains a bounded read cache, and prevents results for a different resource/account from appearing in the view.
5. Library loading queried entitlements per order and books per entitlement. It now reads eligible entitlements and books in batches, preserving each order's purchased formats and refund checks.
6. Community profile lookup performed a no-op upsert and a separate role lookup on every request. Existing members now use one joined SELECT with fresh database roles. Profile creation happens only when absent.
7. Checkout fetched each book sequentially. Each operation now fetches the requested book IDs together; no catalog cache supplies checkout prices.
8. Admin book creation/archive, ticket resolution and review approval previously refreshed the entire dashboard. Successful responses now update the corresponding local entries; a generation guard prevents an older aggregate request from overwriting those changes. Refunds still deliberately reload related financial aggregates.

## Policies

| Data | Freshness | Retention / boundary |
|---|---|---|
| Public published catalog, metadata, prices, bundles | Server 300 seconds; client router 120 seconds | Next bounded cache; expire 3600 seconds; no private assets |
| Categories | Static | Deployment lifecycle |
| Community session/activity display | 30 seconds | Browser only, account ID + account epoch |
| Threads/replies/detail/moderation display | 15 seconds | Browser only, normalized resource parameters + account epoch |
| Library display | 30 seconds | Browser only, account epoch; focus/online check freshness |
| Private memory | Independent of freshness | At most 80 entries; 5-minute idle retention, lazily collected on reads; cleared on identity changes |
| Admin | In-flight deduplication only | Mounted component state; authorized server reads |
| Checkout, receipt, paid access, downloads | Authoritative per operation | No shared/private-memory authorization cache; private HTTP no-store |

Freshness decides whether a value can be reused. Retention decides how long an inactive value may remain in memory. There is no persistent customer-data cache in localStorage. Existing guest shopping preferences and Supabase's own session storage remain separate.

`/api/books` returns an ETag calculated from the cached public snapshot. `Cache-Control: public, max-age=0, must-revalidate` allows conditional HTTP reuse without a second CDN freshness window hiding admin invalidation. A matching request returns 304 with no body and, while the Next snapshot is fresh, no SQL. The endpoint never refreshes or emits Auth cookies. Other authenticated/capability endpoints retain private/no-store responses.

Framework-generated hashed assets retain Next's asset caching. The current book covers are externally hosted images; their origin controls caching. No local `public` directory or managed versioned-cover upload pipeline exists. Do not mark mutable third-party URLs immutable. When adding owned covers, use content-hashed filenames and long immutable caching on those public objects only. Private ebook objects remain separate.

## Mutation mapping

| Successful operation | Effect |
|---|---|
| Add/archive a book | Expire `public-catalog` tag; patch admin books locally |
| Direct database catalog edit | Admin “Refresh storefront catalog”; otherwise bounded TTL |
| Cart/wishlist | Existing local store and totals; no server invalidation |
| Community activity/journal | Apply returned activity + revision; invalidate session snapshot only |
| Thread/reply/moderation | Invalidate community content namespaces; reload affected mounted resource |
| Remote community event | Refresh mounted content; session remains throttled by its 30-second freshness |
| Purchase success / receipt read | Invalidate browser library display; receipt and access remain authoritative |
| Close guest library | Clear library display/cache after cookie deletion |
| Account switch/logout | Clear private read entries and community state; reject old-account pending reads |
| Resolve ticket/approve review | Patch corresponding admin row; update open-ticket count for resolution |
| Refund | Refresh admin financial aggregate; subsequent downloads always check revoked entitlements |

The Realtime channel intentionally carries empty events so it cannot reveal private IDs or journal content. Such broadcasts cannot safely target an individual resource; mounted content refresh is deliberately broader than local mutation handling. Sessions are throttled separately. Role changes remain enforced immediately by server checks even if a visible badge takes a refresh to change.

## Races and authorization

`MemoryCache` shares promises for identical keys. Invalidated in-flight reads cannot repopulate or return stale values: their consumers join a fresh read. Failed requests are removed; identity changes reject pending reads with AbortError. Eviction remains bounded, including pending entries. Community mutations also retain revision/conflict handling and render generation guards.

The installed Next cache handler compares entry timestamps against tag invalidation times when reading. `revalidateTag(tag, {expire:0})` prevents pre-invalidation entries being reused. Do not replace this with an unversioned module-level map. Self-hosted multi-instance deployments need coordinated cache handlers/tag invalidation; TTL alone bounds but does not eliminate cross-instance stale display.

Browser `getSession()` identifies only the local display-cache partition. Every protected server route still calls verified Auth and performs its database authorization. RLS/grants, privileged-key placement, payment validation and refund checks are preserved. Signed URLs last 300 seconds and previously issued URLs may remain usable until that expiry after revocation.

Full-document navigation at sign-in/sign-out is retained as the existing authentication boundary to discard unrelated retained UI state. Ordinary cart, wishlist and content mutations do not reload the page.

## Measured verification

Artifacts are in `artifacts/performance/`.

| Scenario | Before | After | Evidence |
|---|---:|---:|---|
| Library: 3 orders, 2 distinct books | 11 SQL calls | 4 SQL calls | Same seeded PGlite fixture, actual query counter; `before.json`, `after.json` |
| 10 concurrent same-key consumers | Uncached control would call loader 10 times | 1 loader call | Deterministic cache test, not browser traffic measurement |
| Community disconnected polling | 12 scheduled refresh cycles/minute | 2/minute | Source/timer test; actual SQL depends on mounted resources |
| Warm public catalog HTTP | Previously no validator | 304, zero response bytes, 0 SQL | Isolated production server, `production-http.json` |

Production HTTP measurement after build (one request per row): homepage 200/0 SQL; catalog 200/0 SQL; cold public API 200/3 SQL; API revisit 200/0 SQL; conditional API 304/0 SQL; book detail 200/0 SQL after warming catalog; back to catalog 200/0 SQL; revisited detail 200/0 SQL. These are local measurements, not hosted-provider metrics, and the initial page prerender data was prepared during build. A cold runtime detail request may populate the shared catalog. The old catalog already cached public data: there is no claim that all these zeroes represent a new reduction.

Local UI controls, search/filter and guest wishlist/cart are inspected and covered by pure/store tests; they do not initiate unrelated fetches. React render counts were not profiled, and browser asset requests/prefetches are not included in the HTTP harness. Account-switch races, invalidation, current checkout prices, refunds, private library access, and protected downloads are tested. The live Supabase test exercises two temporary accounts, role enforcement/revocation, private journals, replies, recovery and logout, then cleans up its data. It does not verify outbound email delivery or real payment processing.

## Reproduce

```powershell
node --test tests/cache-efficiency.test.cjs tests/catalog-cache.test.cjs tests/auth.test.cjs tests/downloads-realtime.test.cjs tests/database.test.cjs tests/community-server.test.cjs tests/storefront.test.cjs
node node_modules/next/dist/bin/next build
node --env-file=.env scripts/measure-cache.mjs
```

The benchmark starts port 3101 and stops its server. `KNOVERA_QUERY_METRICS=1` enables SQL-helper call count/timing logs without SQL text, parameters, or credentials. Transaction-internal statements and Supabase Auth service internals are not counted by those production logs; the public GET benchmark does not use those transactions. Leave metrics disabled normally.

## Maintenance and deployment limits

- Add private resource keys as `resource?normalizedInputs|userId:epoch`. Include every server-response input. Current currency is fixed USD and list filters run locally; future server pagination/locale/currency must join the key.
- Never use browser reads or the public catalog cache inside payment/download permission logic. Do not cache signed download URLs.
- Apply successful mutation responses locally; invalidate only related namespaces. Test delayed reads around every new mutation and account transition.
- Cache errors are not stored. A miss/expiry reads the database; an outage follows existing error UI. Do not substitute seed/demo data in production.
- No Redis is justified by the measured workload. Configure a platform-supported shared Next cache before horizontal scaling, or accept per-instance cold misses and bounded stale display. Deployment rebuilds clear/recreate public prerenders.
- The store has four seeded books. One cached catalog snapshot and local filters are proportional here. Community list/reply reads already cap at 100/300. Admin aggregates and account order lookup remain full reads; introduce cursor-paginated admin endpoints with independent SQL aggregate KPIs when volume warrants it, rather than silently truncating current totals. This is a scaling limit, not hidden pagination.
- Existing primary/order-token/email/entitlement/order-owner/community indexes cover the changed equality lookups. No speculative indexes or schema migration were added; production query plans and production traffic were not available.
- A production payment provider is still required for real checkout. The existing simulator is blocked in production. Caching does not implement payment processing.
