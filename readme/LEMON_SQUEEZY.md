# Lemon Squeezy payments and rate limiting

## What the code does

The checkout page calls `POST /api/checkouts`. The server reloads the selected books from Postgres, checks availability and prices, and checks that the advertised files exist in a private Supabase bucket. Browser prices cannot decide the amount charged. Ordinary catalog browsing continues to use the existing cache.

The server saves an immutable cart snapshot in the private, RLS-enabled `knovera.checkout_intents` table. It creates a hosted Lemon Squeezy checkout for one generic digital-books variant, using the cart subtotal as its custom price. Multiple books are represented by this single payment line; the local order retains every book and quantity. Prices are USD minor units. Discount codes are disabled. Checkouts expire after 30 minutes.

Returning from checkout never grants access. The return page polls `GET /api/checkouts` using a random bearer token. Keep order/return URLs private, and exclude query strings from analytics and access logs.

`POST /api/webhooks/lemonsqueezy` verifies the raw request's HMAC signature, then retrieves the current order directly from Lemon Squeezy. It verifies store, mode, currency, subtotal, variant, and discount amount against the stored intent. Only a paid order creates active entitlements. Order creation, entitlement creation, and intent association are one database transaction. Retries are idempotent. A refunded order cannot be reactivated by an old paid event.

Full and partial refunds revoke access for the entire cart. This version does not allocate a partial refund among individual books. Issue refunds in the Lemon Squeezy dashboard; the admin's local refund action is blocked for live Lemon Squeezy orders. Separate purchases of the same book retain their own access.

Existing downloads still check purchase access and issue a **300-second (5-minute)** Supabase signed link. Refunding prevents new links; an already-issued link can remain usable until it expires.

## Configure your Lemon Squeezy account

1. Create your store and complete activation, identity and payout setup. Pakistan is listed in the [supported countries](https://docs.lemonsqueezy.com/help/getting-started/supported-countries), but this does not guarantee approval of an individual store.
2. In test mode, create a published digital product such as **Knovera digital books**, with one standard **one-time payment** variant. Do not use subscription, pay-what-you-want, free, package or tiered pricing. Set the appropriate ebook tax category, use USD, and use tax-exclusive pricing. The server checks the latest Price object's category and scheme.
3. Keep this dedicated variant free of automatic discounts and upsells. The server supplies its amount and cart description per checkout. Actual ebook files stay in private Supabase Storage and are delivered by this app.
4. Copy the store ID and variant ID into the variables below. Create an API key for the correct account/mode. Do not put keys in client code or `NEXT_PUBLIC_` variables.
5. Create a webhook with URL `https://YOUR-DOMAIN/api/webhooks/lemonsqueezy`. Subscribe to **order_created** and **order_refunded**, choose a strong signing secret, and put that exact secret in your environment. Configure matching test/live mode. Local development requires a public HTTPS tunnel forwarding to your local server; Lemon Squeezy cannot call localhost directly. Set `SITE_URL` to the tunnel URL when testing return links.
6. Upload your real ebooks to the private `ebooks` bucket and ensure each published book's edition assets point to the correct object paths. Missing files deliberately block checkout.

Official references: [create checkout](https://docs.lemonsqueezy.com/api/checkouts/create-checkout), [webhook signing](https://docs.lemonsqueezy.com/help/webhooks/signing-requests), [order object](https://docs.lemonsqueezy.com/api/orders/the-order-object), [prices](https://docs.lemonsqueezy.com/api/prices/the-price-object).

## Environment and commands

Add these to your existing `.env` (or `.env.local`), not to the example:

```dotenv
SITE_URL=https://YOUR-DOMAIN
LEMON_SQUEEZY_API_KEY=your-server-api-key
LEMON_SQUEEZY_STORE_ID=your-numeric-store-id
LEMON_SQUEEZY_VARIANT_ID=your-numeric-variant-id
LEMON_SQUEEZY_WEBHOOK_SECRET=your-signing-secret
LEMON_SQUEEZY_TEST_MODE=true
RATE_LIMIT_SECRET=your-stable-random-secret
RATE_LIMIT_IP_HEADER=
```

Keep the existing Supabase connection and private bucket settings. To apply the new database table, from the project folder:

```powershell
node --env-file=.env scripts/database.mjs migrate
npm run dev
```

Use `.env.local` in the command if that is your filename. Before live deployment: complete store approval, replace test credentials/IDs with the correct live ones, configure the live webhook, set `LEMON_SQUEEZY_TEST_MODE=false`, set the public HTTPS domain, then build and restart. Production intentionally refuses test checkout. In development, test orders use the existing `development_simulator` classification so they never unlock production downloads or send real receipts.

```powershell
npm run build
npm start
```

No live payment was made during implementation. Automated tests mock the provider API and use a local Postgres-compatible test database. You must complete a provider test-mode checkout and webhook delivery after adding your credentials, including a test refund and duplicate delivery, before enabling live sales.

## Emails and delivery operations

Lemon Squeezy sends its payment receipt with a button pointing back to the app. The app additionally queues its existing ebook receipt once per order. Configure Resend and the official sender later, as planned. Run the existing queue worker on a schedule:

```powershell
node --env-file=.env scripts/email.cjs drain
```

The existing email queue uses SQLite. It needs persistent storage and a worker; a serverless deployment with ephemeral files needs a shared durable email queue first. Payments and entitlements are stored in Supabase independently. If email queuing fails, the webhook returns an error for retry, while an already-committed purchase remains accessible through the return page.

Monitor failed webhook deliveries in the Lemon Squeezy dashboard. Resolve the configuration/error and resend the event. Do not manually create a paid order from a browser return URL. If a buyer sees confirmation pending, check provider status before asking them to pay again. Signed events for unrelated products without a matching checkout intent are ignored.

## Shared rate limits

Counters use atomic Postgres upserts in the existing `knovera.limits` table, so they survive restarts and apply across server instances. Responses use HTTP 429 and `Retry-After`. Oversized POST bodies are rejected with HTTP 413. Failures of the limiter database fail closed.

| Endpoint | Per trusted IP | Additional identity cap |
| --- | --- | --- |
| Checkout creation | 10/minute | 5/minute per email |
| Checkout status | 60/minute | 60/minute per return token |
| Download signing | 20/minute | 20/minute per account/order token |
| Order lookup | 30/minute | 30/minute per order token |
| Purchase recovery | 5/minute | 3/hour per email |
| Newsletter signup | 5/minute | 3/hour per email |
| Support ticket | 5/hour | 5/hour per email |

Each scope also has a global ceiling of `max(50 × the identity limit, 300)` in the same time window. Email-specific scopes additionally apply their own IP ceiling when a trusted header is enabled. Existing community per-member limits remain in place. Supabase Auth handles its own authentication limits; these API guards do not intercept browser requests made directly to Supabase.

IP limiting is enabled only when `RATE_LIMIT_IP_HEADER` identifies a header your hosting proxy **overwrites**, and direct origin access is blocked. Do not blindly set this to a user-controlled `X-Forwarded-For` header. Without it, global and email/account/token limits still work, but there is no per-IP limit. Set `RATE_LIMIT_SECRET` to a stable random secret; if omitted the server uses `SUPABASE_SECRET_KEY`. Only HMAC digests of identities/IPs are stored in limiter keys.

Webhook deliveries use signature verification and a 256 KB body bound instead of these customer limits, so legitimate payment retries are not blocked by a busy storefront. Add hosting-edge request limits for volumetric traffic; an application database limiter is not DDoS protection.

Run the existing cleanup command periodically to remove expired counters:

```powershell
node --env-file=.env scripts/database.mjs cleanup
```

Retain fulfilled checkout intents: future refunds need their payment mapping. This implementation does not automatically delete abandoned intents.

## Code map

- `lib/payments/lemon.ts`: provider checkout, order verification, transactional fulfillment/refunds.
- `app/api/checkouts/route.ts`: bounded, rate-limited checkout creation and status.
- `app/api/webhooks/lemonsqueezy/route.ts`: signature boundary and receipt queueing.
- `components/books/CheckoutPending.tsx`: confirmation polling and retry UI.
- `lib/http-guard.ts`: shared request limits, body limits and error responses.
- `supabase/migrations/202610140003_payments.sql`: private checkout intents and provider uniqueness.
- `tests/lemon-payments.test.cjs`: amount/configuration/signature rejection, missing assets, replay safety, refunds, production test blocking, atomic limits and body bounds.
