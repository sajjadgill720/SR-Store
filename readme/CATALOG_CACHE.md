# Public catalog and ebook delivery

The public homepage, catalog, book details, samples, bundle pages, and `/api/books` share `lib/catalog-cache.ts`. Supabase remains the single source of truth. There is no second hardcoded book list to maintain.

## Browsing

Next.js caches published book and bundle metadata using `use cache`. The homepage and catalog are prerendered in the production build. Filtering, searching, and sorting use the data already delivered to the frontend.

- Cached catalog data revalidates after **one week** when requested.
- After **30 days** without refreshing, the next request waits for fresh data.
- Browser navigation can reuse its cached view for **five minutes**.
- Builds, cold caches, cache eviction, and server restarts can require a database read. This is not an offline database replacement. Production caching differs from development hot reloads.
- File locations are removed from the public snapshot; no signed download links are cached.

## Publishing changes

Adding or archiving books through the admin website invalidates the shared catalog immediately after a successful database write. The next server read loads the latest data. An already open browser view may remain unchanged until refreshed.

After editing books or bundles directly in Supabase, open `/admin` and click **Refresh storefront catalog**. This calls the admin-only, same-origin `REFRESH_CATALOG` action. Database edits alone do not send an invalidation event. Redeploying also rebuilds the public pages.

For multiple independent self-hosted server instances, configure a shared Next.js cache handler/invalidation mechanism before scaling; the default process cache is not distributed.

## Buying and downloading

Checkout still reads authoritative prices and availability on the server. Purchase ownership, paid order status, refunds, and active entitlements are checked fresh. Account and community information is not included in the public catalog cache.

After verifying download access, the existing download endpoint asks Supabase Storage for a signed URL from the **private** `SUPABASE_EBOOK_BUCKET`. The link lasts **300 seconds (five minutes)**. A reader can request another link while their entitlement remains valid. An already issued link can remain usable until it expires, including after a refund.

Actual PDF/EPUB files must exist at the storage keys configured on each edition. Uploading a file alone does not change catalog metadata. Production payment-provider integration is still required for real paid checkout; this change does not add a payment provider.

## Visual theme

The community uses the landing page's navy header, warm gold actions, sage surfaces, and green accents. Shared storefront color variables live in `app/marketplace.css`; community-specific layout and colors live in `app/community/community.css`.

## Validation

`node --test tests/catalog-cache.test.cjs tests/downloads-realtime.test.cjs tests/auth.test.cjs tests/database.test.cjs tests/storefront.test.cjs`

`node node_modules/next/dist/bin/next build`

The focused cache test checks public filtering, private-file omission, authoritative-data preservation, and invalidation configuration. Next's production build verifies the actual cache directive and reports the homepage/catalog as static with a one-week revalidation period.
