# Non-payment launch audit — 14 October 2026

## Verdict

The core store is implemented, but it is not ready for public sales yet even when payment integration is excluded. File delivery assets, production email configuration, publishing validation and support hardening are the main remaining items.

This was an audit, not a feature implementation. No production content, accounts, permissions or files were modified.

## Verified evidence

- Ran `node --test tests/*.test.cjs`: 37 tests total, 36 passed, 0 failed, 1 skipped. The skipped test is the optional live Supabase Auth/community integration test. Most security/database checks use isolated PGlite; Storage transport tests use mocks.
- Checked local `.env` presence/flags without exposing credentials. Supabase connection identifiers and server credentials are set. `RESEND_API_KEY`, `EMAIL_FROM` and `SITE_URL` are missing; email is in preview mode; the email site URL is not public HTTPS.
- Queried Supabase Storage metadata read-only. The `ebooks` bucket exists and is private. None of the eight asset references across the four published books matched an object in that bucket. This checks the configured object paths, not whether unrelated uploads exist elsewhere.
- Inspected API handlers, admin publishing, support, email persistence, cache/SEO implementation, free resources and customer-facing copy.
- The preceding SEO implementation passed a production build and initial HTML checks. This audit did not repeat that build or make application code changes.

## Required before launch

### 1. Upload and validate actual ebook files

All four published titles currently point to missing objects. Access checks and five-minute signing code cannot deliver an absent file. Upload the real PDF/EPUB assets to the catalog's exact object paths, validate they open correctly, then run an authorized download smoke test. The printable title currently has two asset entries with the same format; verify that the intended file is the one selected by the download flow.

Evidence: `lib/downloads/storage.ts`, `scripts/storage.mjs`, remote `storage.buckets` / `storage.objects` metadata.

### 2. Finish the publishing workflow

`app/api/books/route.ts` creates asset paths, sizes/checksums, a random ISBN, rating 5 and one review by default, then sets published/in-stock immediately. It never verifies that ebook objects exist. The UI supports adding and archiving books, but lacks a complete edit/upload/edition/draft/publish workflow.

Add strict server validation, draft-first publishing, real asset metadata, asset existence checks, and editing. Leave ISBN absent unless supplied and verified; do not manufacture ratings/review counts. Ensure formats match the actual assets before making a title purchasable. This also protects SEO structured data from fabricated ISBNs.

### 3. Enable production email and choose durable storage

The Resend integration, consent confirmation, unsubscribe, queue and retry logic exist. The local environment is not configured for delivery. Configure a verified sender, provider key and public HTTPS email URL, then test real confirmation/recovery mail to an address you control.

Newsletter contacts, consent and queued emails still live in local SQLite (`lib/email/service.mjs`), not Supabase. This can work on a single persistent server with backups. Ephemeral/serverless or multiple independent instances need shared durable persistence instead. `EMAIL_DB_PATH` is unset, so the current default is `.data/email.sqlite`.

Purchase recovery queues mail asynchronously. A deployed worker must regularly run `node --env-file=.env scripts/email.cjs drain`. No deployed scheduler was verified. Provider acceptance is tracked, but bounce/delivery webhook reconciliation is not implemented. Supabase Auth SMTP is separate from Resend website-email settings and was not verified in this audit.

### 4. Harden support and provide a response workflow

`app/api/support/route.ts` accepts public writes with only email/message presence checks. It has no request-size bound, robust field schema or rate limit. Timestamp IDs and four-digit ticket numbers can collide. It also returns raw exception messages.

Add bounded validation, abuse controls, collision-safe identifiers and generic errors. The admin can mark a ticket resolved, but there is no customer reply/email notification workflow. A documented external support mailbox could serve that need initially.

### 5. Set the production domain

Set `SITE_URL` to the actual HTTPS domain before building/deploying. The current fallback is local, so robots intentionally disallows crawling and the sitemap is empty. Align email links and Supabase Auth redirects with the deployed domain. Verify canonical URLs, robots and sitemap after deployment.

Evidence: `lib/seo.ts`, `app/robots.ts`, `app/sitemap.ts`, local configuration checks.

### 6. Replace misleading resource downloads and outdated copy

`app/free-resources/page.tsx` advertises PDFs, printable pages and file sizes, but creates a short `.txt` file. Supply real resources or clearly label/remove these offers.

The help page still describes demo files and email-based library access; the privacy page describes the older custom account/password/session model. Rewrite factual descriptions to match Supabase Auth, actual storage and current access flows. Several older README guides also describe removed JSON storage and demo behavior, so they should not be used as current operational instructions.

## Important follow-up work

- Add an account deletion/data export workflow, or document an authenticated manual support process for these requests. No dedicated implementation was found.
- Consider enforcing MFA for administrators. Trusted server roles are implemented, but the app does not require an MFA assurance level.
- Establish production error monitoring, uptime checks, backups and a tested restoration procedure. Repository inspection cannot establish whether these are configured in hosting dashboards.
- Run a final live acceptance test: signup, confirmation, reset, admin denial for readers, two-reader replies and cross-device synchronization, file delivery, newsletter confirmation/unsubscribe and support response. Hosted SMTP, live WebSocket authorization and real file content were not exercised here.
- Before traffic grows, paginate admin aggregate reads and review deployment cache sharing. The dashboard currently loads all orders/books/tickets and related records.

## Already implemented

Server-verified Supabase identity and trusted admin roles; purchase ownership and entitlement checks; private bucket enforcement and 300-second signed URLs; database-backed community posts/replies/private journals; Realtime invalidation with polling fallback; persistent public catalog caching; local catalog search/filter/sort/pagination; server-rendered catalog HTML, canonical metadata, structured data, robots and sitemap code.

Passing tests support these implementations but do not establish production configuration or successful real-world delivery.

## Suggested order

1. Publishing validation and real ebook assets.
2. Email credentials, durable email persistence and worker deployment.
3. Support validation/rate limits and reply handling.
4. Real resources, accurate content and production domain configuration.
5. Live acceptance tests, monitoring and restore verification.
