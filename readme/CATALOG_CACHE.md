# Persistent public catalog

Supabase is the source of truth. Browsing uses one public metadata snapshot in localStorage (`knovera:public-catalog:v1`) and memory, shared by homepage, catalog, book details, samples and bundle pages. There is no second hardcoded catalog.

## Read flow
1. Serve complete prerendered HTML using the shared server catalog. Seed the browser cache from the same snapshot without downloading it again. Hydrate a newer saved snapshot when available.
2. If a caller has neither a server snapshot nor a valid saved snapshot, request `/api/catalog` once. Concurrent consumers share this request.
3. On later mounts, focus, reconnect and every 60 seconds while visible, request only `/api/catalog/version`. This reads one small revision row, not the books table.
4. Download the full catalog only when its revision differs. Persist the replacement only after validation. There is no browser TTL that redownloads unchanged books.
5. Offline or failed checks retain the saved metadata and show an update warning. Corrupt storage is discarded; storage quota/private-mode failures fall back to memory, so persistence cannot be guaranteed when browser storage is unavailable.

Search, categories, author matching, format filters, sorting, saved-book filtering and pagination (12 results per page) are client-side. Filter changes reset pagination. Categories and authors are already part of the snapshot; there are no separate category/author requests or tags table. Static navigation and topic definitions remain bundled locally.

## Update flow
Migration `202610140002_catalog_revision.sql` creates a private revision counter and triggers on books, bundles and bundle membership. Inserts, updates, deletes and truncation advance it within the same transaction, including direct Supabase SQL edits. Rolled-back changes do not advance it.

Admin **Refresh storefront catalog** explicitly advances the revision. Adding or archiving a book advances it automatically. Existing visible tabs detect changes within approximately 60 seconds or on focus/navigation; this is polling, not push. Each tab checks independently. Apply new migrations with:

```powershell
node --env-file=.env scripts/database.mjs migrate
```

The API also caches server snapshots by revision to share a full read among visitors. It checks the revision after reading records and retries concurrent edits. A cold server or expired server snapshot can read records when a client actually needs the catalog; unchanged returning browser caches never request that endpoint. Private asset locations are removed.

## Security and scope
Only public published metadata is persisted. Account roles, purchase access, orders, private journals, moderation and signed links are not put into localStorage by this cache. Existing short-lived, account-scoped memory caching and Realtime invalidation remain for dynamic private data. Persisting all of those indefinitely would allow stale permissions or expose previous users' data on shared devices.

Checkout rechecks authoritative prices and availability. Downloads verify ownership, paid status and entitlements before issuing a private Storage URL valid for 300 seconds. Browser metadata never authorizes payment or download access. PDF/EPUB files are fetched only through authorized delivery, not bundled into the catalog.

## Tradeoffs and checks
Public homepage, catalog, known book, sample and bundle URLs are prerendered with visible content in HTML. Browser storage enhances that content after hydration. Missing titles use Next.js notFound. Canonical catalog URLs omit search/filter query strings. Details have unique metadata and social previews; book pages include escaped JSON-LD with actual prices and no invented reviews.

The shared SEO snapshot revalidates after five minutes when requested, checking the revision before reusing the version-keyed record cache. It does not fetch all books on every page load. Admin writes invalidate it immediately; direct SQL edits can take until the next revalidation to appear in cached HTML. Cold caches, deployments and record-cache eviction can require a full database read. Existing browser tabs still check revisions every 60 seconds. Saved offline metadata can be older; checkout validates current prices.

Set `SITE_URL=https://your-real-domain` in deployment environment variables before building. This supplies absolute canonical URLs, structured-data URLs and the sitemap. Localhost builds intentionally have an empty sitemap and disallow crawling. After deploying with the actual domain, submit `/sitemap.xml` in your search-console account. Rankings cannot be guaranteed; content quality, crawlability, hosting performance and links still matter.

Tests: `node --test tests/persistent-catalog.test.cjs tests/catalog-cache.test.cjs tests/database.test.cjs tests/seo.test.cjs`. These cover persistent reload, unchanged revision, changed revision, concurrent callers, offline retention, corrupt/quota storage, transactional revision triggers, public-file sanitization and database access restrictions. Build with `npm run build`.
