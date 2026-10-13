# Email delivery

Purchase receipts, purchase recovery and confirmed newsletter campaigns use Resend's REST API. No new npm dependency is required. Node 22.14+ is required for the durable SQLite outbox.

## Development

Without configuration, messages are saved privately to `.data/email.sqlite` with `preview` status. Nothing is sent. Simulator receipts and recovery for simulator-only purchases are always previews, including when Resend is enabled. Production requests for recovery/newsletter signup fail closed if delivery is not configured.

```
node scripts/email.cjs list
node scripts/email.cjs preview <message-id>
```

The second command writes `.data/email-preview.html`. Open that file to inspect an email and its links. Local confirmation links require the dev server. Preview messages are never automatically promoted to live deliveries. Do not commit the database or exported previews: they contain private purchase links and addresses.

## Enable real delivery

Create a Resend account, verify your sending domain and configure DNS as Resend instructs. Add these server-only values to `.env.local` (and the production host environment):

```
EMAIL_MODE=resend
RESEND_API_KEY=your-server-api-key
EMAIL_FROM=Knovera <books@your-verified-domain.com>
EMAIL_SITE_URL=https://your-store-domain.com
EMAIL_POSTAL_ADDRESS=Your business mailing address
```

Restart the app after configuration. Never use NEXT_PUBLIC variables for the key. Resend configuration is separate from the planned Supabase admin authentication. No actual emails were sent during implementation.

## Delivery and retries

An outbox row is stored before delivery. Signup attempts immediate delivery; recovery uses the worker to avoid revealing matching accounts through provider response timing. Failed attempts remain queued. Public requests have a five-minute per-address cooldown and a global cap of 100 messages per hour. Run the following from your host's scheduler every minute, using the same persistent `.data` volume as the application:

```
node --env-file=.env.local scripts/email.cjs drain
```

Each run handles up to 50 messages, with rate spacing. Retry delays increase exponentially. Stalled workers are recovered after two minutes. After five failed attempts or a 20-hour retry window, messages require investigation. The window stays within Resend's 24-hour idempotency retention. `accepted` means accepted by the provider, not confirmed inbox delivery; inspect Resend's delivery/bounce dashboard. Webhook-based bounce reconciliation is not implemented. Preview rows are skipped by the worker.

The application currently has only a payment simulator. Its receipt hook is connected and previewed. A future verified live-payment webhook must call `receipt(order)` after successful fulfillment, then `deliver(id)` (the worker also processes queued receipts). Do not send receipts from an unverified checkout redirect. Existing orders are not automatically backfilled.

## Newsletter campaigns

New signups receive a confirmation email; only confirmed addresses enter the sending audience. Existing seeded/legacy subscribers are not silently opted in. Confirmation links expire after 24 hours, require an explicit button press, and cannot reactivate an unsubscribed contact. Every campaign contains an unsubscribe link and RFC 8058 one-click headers. Sending rechecks consent immediately before delivery. Admin counts reflect the authoritative email contact state.

Create a JSON file with `id`, `subject`, `body`, and optional `topic`:

```json
{"id":"october-reading","subject":"Your next chapter","body":"Discover our new books this month.","topic":"new-releases"}
```

```
node --env-file=.env.local scripts/email.cjs campaign campaign.json
node --env-file=.env.local scripts/email.cjs drain
```

Campaign bodies are plain text rendered into an escaped HTML template. Repeating an identical campaign ID does not duplicate messages; changing its content requires a new ID. A mailing address is required. Campaign execution is local only: there is no public bulk-send endpoint while Supabase admin access is pending. Approval to implement this feature does not send a campaign.

## Scope and deployment

This uses persistent SQLite on a single application host. For serverless or multiple application replicas, migrate outbox/contact storage to shared Postgres and use a durable queue before launch. Purchase recovery no longer returns order tokens in HTTP responses. It does not implement password reset for community accounts or protect existing email-based library/download endpoints; those still need the account-authentication project. Purchase links retain the existing order-token lifetime.

Run tests with `node --test tests/email.test.cjs`. Tests use an isolated temporary database and a mocked provider; they never send mail.
