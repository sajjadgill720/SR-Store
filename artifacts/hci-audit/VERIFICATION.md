# Customer experience audit — 20 October 2026

## Problems corrected

- Missing shared paper, border, and font variables caused invalid color declarations. Some dark buttons inherited dark labels. Defined the missing aliases and gave primary actions explicit light text, visible focus states, and comfortable heights.
- Replaced the cart’s dense ledger layout with a compact item list and a separate order-summary card. Titles wrap within their column, cover art cannot collide with text, quantity and removal controls are grouped, and the total and checkout action are prominent.
- Added undo for removing an item or clearing the cart. Quantity decrement stops at one; removal is an explicit action.
- Removed the personal byline from all public book views, including older cached records. Public catalog responses and structured product metadata also filter the retired byline. Cart rows no longer show an author line.
- Simplified product details to one purchase panel, a free sample, included formats, contents, edition disclosure, and concise support answers. Removed repeated press furniture, duplicated promotional sections, and hardcoded endorsements.
- Restored missing layout rules for checkout, recovery, help, library, and order access. Checkout now uses labeled full-width fields and a clear summary instead of inline controls.
- Added a compact support footer during checkout, cart, recovery, library, and order access so those tasks are not followed by a large newsletter promotion.
- Connected support field labels to their controls. Failed submissions show an accessible error while preserving the draft.
- Corrected low-contrast community refresh and reflection controls.
- Adjusted the bundle illustration’s proportions, label, badge, and headline to better match the reference. Kept the actual cart price and digital-store identity.

## Verification

- Production build passed, with 72 static outputs generated.
- Focused ESLint and TypeScript passed.
- 21 automated tests passed for storefront, public catalog, cache behavior, auth, email, SEO, and payments. The catalog regression verifies that public responses retire the old byline without mutating authoritative records.
- Read-only HTTP crawl: 48 customer-facing URLs, zero failures.
- Browser inspection: 42 page/viewport combinations across shopping, checkout, catalog, product, reading sets, library, recovery, support, help, resources, newsletter, community, account, samples, and legal pages.
- Final inspected combinations had no detected low-contrast enabled control labels, unlabeled visible form controls, horizontal document overflow, or retired byline in visible page text.
- Widths checked: 1440px desktop, 390px phone, and 320px phone for the core shopping/support flows.
- Exercised add-to-cart, cart navigation, removal, undo, and responsive layout. The temporary cart item was removed after verification.

These are targeted HCI and browser checks, not a complete WCAG conformance certification. No payment, support message, marketing signup, or account registration was submitted to a live service.

## Evidence

- [Desktop cart](cart-desktop.jpg)
- [Mobile cart](cart-mobile.jpg)
- [Desktop checkout](checkout-desktop.jpg)
- [Mobile checkout](checkout-mobile.jpg)
- [Desktop product](product-desktop.jpg)
- [Mobile product](product-mobile.jpg)
- [Bundle panel](bundle-panel.jpg)
- [Measured page checks](page-checks.json)
