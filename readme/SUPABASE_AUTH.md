# Supabase Auth: setup and implementation guide

Updated: 14 October 2026.

Knovera now uses one Supabase Auth identity for reader and administrator accounts. Readers sign in with email and password. Administrator and moderator privileges are assigned separately in the private database; a signup form cannot grant privileges.

## 1. What is implemented

- Reader signup, email/password sign-in, email confirmation and confirmation resend.
- Password-reset request and new-password form.
- Admin sign-in using the same identity system.
- Cookie-based sessions using `@supabase/ssr`, with Next.js `proxy.ts` refreshing tokens.
- Server-side verification using Supabase `auth.getUser()` before protected operations.
- Protected admin page, admin data/actions API, and book creation/deletion APIs in **all environments**.
- Account-linked community profiles, posts, replies, private journals, bookmarks and circle activity.
- Signed-in library across eligible orders; private receipt links also remain usable.
- Owner-controlled role assignment and legacy-profile linking command.
- Supabase Auth confirmation via PKCE callback or explicit token-hash confirmation.
- Same-origin checks on cookie-authenticated mutations and no-store responses for account data.

Dashboard configuration, your first admin assignment, SMTP credentials and your actual ebook files still require your input. No default admin password or automatically privileged first signup exists. No real-user email is sent by the automated tests.

## 2. Supabase dashboard setup — do this first

### A. Email provider and confirmation

1. Open your existing Supabase project.
2. Open **Authentication → Sign In / Providers** (the navigation may label this Providers).
3. Enable **Email** with password sign-in.
4. Allow new signups if readers should register themselves.
5. Enable **Confirm email**. The application requires a verified email for accounts, including admins. This also protects the purchase-to-account linking process.
6. Set the password minimum to at least **10 characters**, matching the website's signup/reset forms. Configure additional password protections as appropriate for your project.
7. Keep anonymous sign-in disabled unless you deliberately add an anonymous-user flow later. Anonymous users cannot use the protected account features here.

### B. Site URL and redirect allowlist

Under **Authentication → URL Configuration**, use this Site URL while developing:

```text
http://127.0.0.1:3000
```

Add this development redirect allowlist entry:

```text
http://127.0.0.1:3000/**
```

If you also use localhost, add `http://localhost:3000/**`. Prefer using one hostname consistently: localhost and 127.0.0.1 have different browser cookies, so a PKCE flow started on one cannot finish on the other.

Before deployment, change Site URL to your real HTTPS domain. Replace broad development redirects with the exact production destinations the application sends:

```text
https://YOUR-DOMAIN/auth/callback?next=%2Faccount%2Flibrary
https://YOUR-DOMAIN/auth/callback?next=%2Fcommunity
https://YOUR-DOMAIN/auth/callback?next=%2Fadmin
https://YOUR-DOMAIN/auth/callback?next=%2Faccount%2Fupdate-password
```

Use the actual domain in place of `YOUR-DOMAIN`. The application separately restricts post-authentication destinations to `/account/library`, `/community`, `/admin` and `/account/update-password`; arbitrary external redirects are rejected.

### C. Configure Auth email delivery

Open **Authentication → Email / SMTP Settings** and enable custom SMTP. Your SMTP provider supplies host, port, username and password. Add a verified sender address and the sender name Knovera.

Supabase Auth email is separate from the existing website receipt/newsletter service. Setting `RESEND_API_KEY` in the website does not configure Supabase Auth SMTP. You may use the same provider/domain, but configure its SMTP credentials in the Supabase dashboard too. Supabase's default sender is restricted and is not a production email service.

Configure SMTP before inviting ordinary readers. Disable provider link tracking for Auth messages if it rewrites verification links. Do not paste SMTP passwords or secret keys into public code or screenshots.

### D. Confirmation email templates

The default Supabase confirmation flow works through `/auth/callback` using PKCE. Users must finish in the browser where signup/reset began. For links that can be opened in another browser, configure the token-hash templates below under **Authentication → Email Templates**.

For **Confirm signup**, use this link in your email HTML:

```html
<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&amp;type=signup">Confirm your email</a>
```

For **Reset password**:

```html
<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&amp;type=recovery">Reset your password</a>
```

For **Invite user**, if you use dashboard invitations:

```html
<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&amp;type=invite">Accept your invitation</a>
```

The confirmation page asks the recipient to click **Continue**, then sends a same-origin POST to verify the token. Merely fetching the landing page does not consume the token. Recovery and invitation confirmations open `/account/update-password`. Signup confirmations open the library. The token is removed from the address before navigating onward. Links and token pages send `Referrer-Policy: no-referrer` and `X-Robots-Tag: noindex, nofollow`.

No Google/Apple OAuth UI, email-address editing UI, or MFA enrollment/challenge UI is implemented in this change. If you add those later, retain server-side identity and role checks. Admin MFA is a useful follow-up, not a feature claimed by this implementation.

## 3. Local configuration and migration

Your existing `.env` already contains the required Supabase settings. No second set of credentials is needed:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR-PUBLISHABLE-KEY
SUPABASE_SECRET_KEY=YOUR-SERVER-SECRET
SUPABASE_DB_URL=YOUR-POSTGRES-CONNECTION-STRING
SUPABASE_DB_CA_FILE="E:/SR Store/prod-ca-2021.crt"
SUPABASE_EBOOK_BUCKET=ebooks
```

The public key identifies the browser application. It cannot assign roles. The server secret is used for privileged Storage operations and controlled integration tests, not ordinary user sign-in. The database connection stays server-only. Continue URL-encoding special characters in the database password and verifying the database certificate.

From PowerShell:

```powershell
cd "E:\SR Store"
npm install
node --env-file=.env scripts/database.mjs migrate
npm run dev
```

Migration `202610140001_auth.sql` adds Auth references, the private role table and order ownership table. It removes the old custom session table, signing out legacy community sessions. Re-running the migration command is safe: the migration runner tracks checksums. Never edit an already applied SQL migration to make a future schema change.

Stop an existing development server with Ctrl+C before starting another. Restart after environment changes so a cached Postgres pool does not retain old credentials or certificates. For deployment, build with the production public URL/key present: Next.js embeds public variables at build time.

## 4. Create your owner/admin account

1. Open `http://127.0.0.1:3000/account/login`.
2. Choose **Create an account**, enter your name, email and password, and confirm your email. Alternatively, invite your own email from the Supabase dashboard after configuring its email template.
3. Open **Supabase → Authentication → Users** and copy your account's **User UID**. Use the Auth user UUID, not an email, username, project ID or API key.
4. Grant that UUID admin access locally:

```powershell
node --env-file=.env scripts/auth-admin.mjs set-role YOUR-AUTH-USER-UUID admin
```

5. Visit `http://127.0.0.1:3000/admin/login` and sign in.

Grant a community moderator without access to store administration:

```powershell
node --env-file=.env scripts/auth-admin.mjs set-role THEIR-AUTH-USER-UUID moderator
```

Remove elevated privileges:

```powershell
node --env-file=.env scripts/auth-admin.mjs set-role THEIR-AUTH-USER-UUID reader
```

These commands require the private database connection and a confirmed Auth user. Each role operation is recorded in `knovera.audit_logs`. There is no public role-management endpoint. Roles are read from the database on each protected request, so a role change does not depend on waiting for a JWT refresh. Never use editable `user_metadata` to grant an admin role. `COMMUNITY_MODERATOR_IDS` is retired.

## 5. Code map

| File | Responsibility |
| --- | --- |
| `lib/auth/browser.ts` | Shared Supabase SSR browser client for forms, auth events and Realtime. |
| `lib/auth/server.ts` | Request-scoped cookie client, verified current user, requireUser and requireAdmin guards. |
| `lib/auth/store.ts` | Reader profile linking, trusted role lookup and purchase ownership. |
| `lib/auth/http.ts` | Same-origin checks, private response headers and safe Auth errors. |
| `lib/auth/navigation.ts` | Strict allowlist for post-auth destinations. |
| `proxy.ts` | Refreshes tokens and forwards updated cookies to the request and browser; guards still run inside routes. |
| `components/auth/AuthForm.tsx` | Shared reader/admin signup, sign-in, reset-request, resend and new-password UI. |
| `components/auth/SignOut.tsx` | Current-browser logout and full navigation to clear in-memory private state. |
| `app/account/login/page.tsx` | Reader sign-in/signup entry point. |
| `app/account/update-password/page.tsx` | New-password form after recovery/invitation. |
| `app/admin/login/sign-in.tsx` | Admin entry point using the shared Auth form. |
| `app/admin/page.tsx` | Server-side admin gate behind a Suspense boundary. |
| `app/admin/dashboard.tsx` | Existing dashboard UI, rendered only after the server gate. |
| `app/auth/callback/route.ts` | Exchanges a PKCE code for session cookies and redirects safely. |
| `app/auth/confirm/` | Explicit confirmation landing page. |
| `app/api/auth/confirm/route.ts` | Verifies supported email token types and writes session cookies. |
| `app/api/auth/session/route.ts` | Returns only the verified user's ID, email and trusted application role. |
| `app/api/auth/logout/route.ts` | Signs out the current Auth session and clears legacy/purchase cookies. |
| `app/api/admin/actions/route.ts` | Requires admin for all reads and writes. |
| `app/api/books/route.ts` | Public catalog reads; admin-only creation/deletion. |
| `app/api/community/[resource]/route.ts` | Uses verified Auth identity instead of custom login cookies. |
| `lib/community/client.ts` | Refreshes and clears private reading state when authentication changes. |
| `lib/community/realtime.ts` | Uses the same browser Auth client for its shared Realtime subscription. |
| `lib/downloads/account.ts` | Builds account libraries and checks active access before signing downloads. |
| `app/api/me/library/route.ts` | Signed-in library first; existing purchase-link library for guests. |
| `app/api/downloads/route.ts` | Account or receipt-token access checks before Storage signing. |
| `scripts/auth-admin.mjs` | Trusted local role assignment and legacy-profile linking. |
| `supabase/migrations/202610140001_auth.sql` | Database changes for identity references, roles and ownership. |

## 6. Authentication and authorization flow

```text
Reader/admin enters email and password
  → Supabase Auth verifies credentials
  → @supabase/ssr stores the session in browser cookies
  → Next.js proxy refreshes tokens when needed
  → Protected route calls Auth getUser()
  → Server requires a confirmed, non-anonymous email account
  → Admin route additionally queries the private role table
  → Community/library route checks ownership and existing permissions
```

Authentication answers “who is this user?” Authorization answers “what can they do?” A valid login alone does not permit admin access, reading another journal, moderating someone else's content or downloading an unpurchased ebook.

The browser client needs access to the standard Supabase session cookies for its Auth lifecycle, so these are not represented as custom HttpOnly-only sessions. Purchase-link cookies remain HttpOnly. Never trust a cookie's decoded user object by itself. The server calls `getUser()` to verify identity; it does not authorize from `getSession()`. Auth outages fail closed.

Supabase access tokens have their own expiry. Signing out revokes refresh capability and clears this browser's cookies, but do not assume a copied access JWT becomes invalid everywhere instantly. Role revocation is immediate for this app because roles are checked in the private database on each request. Configure session/JWT lifetimes in Supabase appropriate to your deployment.

## 7. Data and RLS design

The application uses server-owned SQL against the private `knovera` schema. Browser database access remains denied; there is no need to expose this schema through the Data API.

New tables:

- `account_roles(user_id, role)`: references `auth.users`; only `admin` and `moderator` need rows. Absence means reader. RLS is enabled and browser grants are revoked.
- `order_owners(order_id, user_id)`: one owner per order, referencing the existing order and Auth user. RLS is enabled and browser grants are revoked. If an Auth user is deleted, the ownership row stays with a null user so a new account cannot automatically take it over.

`members.auth_user_id` links an existing community profile to its Auth user. Old member IDs, posts, replies, reports and private journals remain intact. New profiles use the Auth UUID as their member ID. The display name comes from validated-length cosmetic signup metadata; privilege and ownership never do.

The server database role and Storage secret can bypass RLS. Therefore route authorization is mandatory. Do not expose these credentials or replace the guards with a client-side hidden button. Existing Realtime notifications continue to contain only empty invalidations; content is fetched through the authorized API.

## 8. Reader purchases and downloads

When a confirmed reader opens their library, unclaimed paid orders whose checkout email matches their verified Auth email are linked to their UUID. Already owned orders cannot be reassigned automatically, even if another account later has the same email. A linked purchase remains with its UUID if that user changes email in the future.

The library merges active editions across that account's orders. Every new download request checks paid status, active entitlement and purchased format again. Refunds prevent new download URLs; another valid purchase can still grant access. Production excludes simulated purchases. Private purchase-link access remains available for guests and existing receipts, so those links still function as credentials and must be kept private.

Signed Storage URLs still last **300 seconds**. Already-issued links remain valid until expiry; already-downloaded files cannot be recalled. Users who purchased under another email need a reviewed support process; the app does not let readers enter any email and claim its books.

## 9. Existing community accounts

The retired custom login has no verified email identity. It cannot safely be matched to a Supabase user by display name or username alone.

- Legacy content and profile rows are preserved.
- Legacy sessions are removed and their cookies no longer authenticate requests.
- Legacy password hashes are retained as dormant migration data; they are never checked by the new login flow. New profiles store no local password hash.
- After verifying the owner through a trusted process, create/confirm their Supabase Auth user, then link it **before** it first creates a new community profile:

```powershell
node --env-file=.env scripts/auth-admin.mjs link-member AUTH-USER-UUID LEGACY-MEMBER-ID
```

The command preserves the legacy member ID, links the Auth UUID and clears that legacy password hash. It refuses to overwrite an existing mapping. If both profiles already contain activity, use a reviewed merge migration; the tool does not silently discard or overwrite either profile. For a fresh development project with no legacy members, simply create reader accounts normally.

## 10. Verification commands and manual checks

Implementation verification completed on 14 October 2026: the production build passed; 24 offline tests passed; the live Supabase integration test passed (login, admin role enforcement/revocation, community privacy/replies, recovery-token confirmation and logout). The Auth migration was applied to the configured development project. Temporary live-test accounts/content were removed. Browser checks verified reader signup/sign-in controls and redirection of a signed-out admin visitor. Actual confirmation/reset email delivery was not exercised and still needs the dashboard/SMTP setup above.

Offline tests use isolated embedded Postgres plus mocked Auth/Storage transports:

```powershell
node --test tests/auth.test.cjs tests/database.test.cjs tests/community-server.test.cjs tests/downloads-realtime.test.cjs tests/community.test.cjs tests/storefront.test.cjs tests/email.test.cjs
node node_modules/typescript/bin/tsc --noEmit
npm run build
```

Optional live test — only against a development project:

```powershell
$env:COMMUNITY_TEST_URL='http://127.0.0.1:3000'
$env:COMMUNITY_TEST_DISPOSABLE='1'
node --env-file=.env --test tests/community-api.test.cjs
```

This creates temporary confirmed Supabase users with generated passwords, signs in through Supabase, tests server cookies/roles/library/community/recovery, then removes its records and users in a finally block. It generates a recovery token without sending mail. It does not modify real-user roles. If the process is forcibly interrupted, inspect Auth users named `codex-auth-…@example.invalid` and remove only the test records after checking them.

Manual checks after dashboard setup:

1. Sign up with your real test email; verify the confirmation email arrives and its link works.
2. Request a password reset; confirm the email, set a new password, and sign in again.
3. Test expired and already-used confirmation links; the UI should offer sign-in/retry rather than access.
4. Open `/admin` while signed out, then as a reader. Neither should display the dashboard.
5. Grant your owner UUID admin and sign in through `/admin/login`; revoke the role and confirm access stops.
6. Use two reader accounts to test journals are isolated, posts/replies sync, and sign-out clears account content.
7. Create a development purchase with the same verified email and check the account library. Test refunds and another reader's download denial.
8. Verify actual ebook bytes and five-minute Storage URL expiry after uploading your files.

## 11. Troubleshooting

| Symptom | Check |
| --- | --- |
| Confirmation/reset email does not arrive | Supabase Auth SMTP, verified sender, provider logs, rate limits and spam folder. Website EMAIL_MODE does not control Auth SMTP. |
| Confirmation succeeds but opens another hostname | Site URL, redirect allowlist and consistent localhost/127.0.0.1 usage. |
| PKCE link fails in another browser | Use the original browser or configure the token-hash email templates above. |
| Correct password but protected account is unavailable | Confirm email is enabled and the user's email is confirmed; check Auth availability. |
| Reader receives admin access denied | Expected until their Auth UUID is granted admin with the trusted CLI. |
| Legacy username cannot sign in | Register/confirm an email account and link the old profile using the migration procedure. |
| Missing account_roles/auth_user_id SQL error | Apply the Auth migration with the database owner connection. |
| Self-signed certificate error after changing .env | Verify SUPABASE_DB_CA_FILE and fully restart the development server. |
| Library has no books | Check verified account email, paid order, active entitlement and whether ownership is already bound elsewhere. |
| Production simulated checkout/download denied | Intentional. A real payment-provider integration is still required for launch. |

## References

- [Supabase SSR clients and Next.js session refresh](https://supabase.com/docs/guides/auth/server-side/creating-a-client)
- [Password-based authentication](https://supabase.com/docs/guides/auth/passwords)
- [Redirect URL configuration](https://supabase.com/docs/guides/auth/redirect-urls)
- [Auth email templates](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Custom SMTP](https://supabase.com/docs/guides/auth/auth-smtp)

This implementation does not claim completed SMTP delivery, MFA, OAuth, account deletion UI, or a real payment gateway. Those are separate features/configuration. Keep the current test checkout local to development.
