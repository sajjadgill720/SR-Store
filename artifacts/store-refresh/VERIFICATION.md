# Store identity and interaction audit — 20 October 2026

Implemented the supplied visual references as a Knovera digital goods store, with ebooks as the current focus.

## Changes

- Added `/account/signup` and rebuilt sign-in, signup, recovery, and password-update screens around the dark story panel, warm form background, serif headings, and reader card. Mobile uses a focused single-column form. Existing Supabase email/password, verification resend, recovery, and destination handling remain connected.
- Added password visibility controls, descriptive field placeholders, inline errors, loading states, legal links, purchase recovery, and support access.
- Implemented the Google OAuth handler. The configured Supabase project reports Google disabled and email enabled. The Google button is disabled with a visible explanation by default. Enable Google in Supabase, configure its authorized redirect URLs, then set `NEXT_PUBLIC_GOOGLE_AUTH_ENABLED=true` and rebuild to activate it.
- Added the missing `/newsletter` destination and redesigned newsletter signup to match the rounded reference. Success messaging now correctly requests email confirmation. Multiple newsletter forms use unique field IDs.
- Replaced press branding in navigation, footer, About, product chrome, and page metadata with the digital store identity. Removed fabricated newsletter readership and location claims.
- Restyled the reading set as a rounded paper card with a burgundy label, included ebook links, and a digital slipcase illustration. The homepage shows the actual combined individual price ($38.49 for the current seeded set), matching existing cart behavior. Removed unsupported $29.99 / 22% savings copy from both landing and product pages.
- Added prominent paths to saved finds, purchase library, community, and free resources. Catalog opens in its product grid; shelf and index views remain available.
- Replaced cryptic purchase and settlement labels with Add ebook to cart, Order summary, Continue to checkout, and clear empty-cart guidance.
- Replaced placeholder resource downloads with useful plain-text planners, worksheets, curiosity prompts, and a deployment checklist. Buttons and file labels explicitly say `.txt`.
- Corrected mobile reading-set grid sizing and decorative artwork overflow.

## Verification

- Production build passed: all 72 static outputs generated, including the new signup and newsletter routes.
- Focused ESLint passed with no errors or warnings across changed interactive components and pages.
- TypeScript passed as part of the production build.
- 14 automated tests passed across storefront, auth, SEO, email, and Lemon payment suites. Payment tests use isolated test data, not live purchases.
- Read-only HTTP crawl visited 48 customer-facing URLs with zero failures. Re-run with `node scripts/audit-store-links.mjs` against a running local server.
- Browser checks: desktop sign-in/signup, Google unavailable state, password visibility, recovery mode, signup navigation, wishlist persistence, saved catalog, product navigation, cart confirmation, quantity increment/decrement, removal, and mobile navigation.
- Browser checks at 1440px desktop and 390px / 320px mobile. Final mobile home and signup measurements show no horizontal document overflow.
- The free Daily Focus Planner downloaded successfully and contains the actual planner text.

## Integration limits

Google sign-in requires the provider setup described above. No customer account was created, no password-reset or marketing email was sent, and no real payment was submitted during browser validation. Authenticated purchase/download access remains covered by the existing isolated automated tests rather than a new live customer session.

## Visual previews

- [Sign in — desktop](sign-in-desktop.jpg)
- [Create account — desktop](signup-desktop.jpg)
- [Create account — mobile](signup-mobile.jpg)
- [Homepage — desktop](home-desktop.jpg)
- [Homepage — mobile](home-mobile.jpg)
