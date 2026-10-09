# Knovera — Complete Feature and Path Guide

**Project:** Knovera independent digital book studio  
**Workspace:** `E:\SR Store`  
**Documented:** 9 October 2026, Asia/Karachi  
**Scope:** Current implementation, premium styling, mobile improvements, backend endpoints, and owner tools.

This guide explains every implemented page and feature, where to find it in the website, and which source files control it. It distinguishes functional demo behavior from services that still require production implementation.

## Contents

1. [Overview](#1-overview)
2. [Complete website route map](#2-complete-website-route-map)
3. [Shared site shell and navigation](#3-shared-site-shell-and-navigation)
4. [Homepage](#4-homepage)
5. [Catalog and product features](#5-catalog-and-product-features)
6. [Samples, wishlist, cart, and checkout](#6-samples-wishlist-cart-and-checkout)
7. [Orders, library, recovery, and downloads](#7-orders-library-recovery-and-downloads)
8. [Reader Club, resources, and support](#8-reader-club-resources-and-support)
9. [Help, story, and policies](#9-help-story-and-policies)
10. [Owner administration](#10-owner-administration)
11. [API reference](#11-api-reference)
12. [Data models and persistence](#12-data-models-and-persistence)
13. [Design, animations, and mobile behavior](#13-design-animations-and-mobile-behavior)
14. [Configuration and local development](#14-configuration-and-local-development)
15. [User journeys](#15-user-journeys)
16. [Where to make changes](#16-where-to-make-changes)
17. [Implementation gaps](#17-implementation-gaps)
18. [History and verification](#18-history-and-verification)

## 1. Overview

Knovera sells nonfiction ebook editions, printable activity packs, and curated book bundles. The application has a storefront, sample reader, shopping cart, simulated checkout, purchase access, reader library, recovery portal, newsletter signup, support tickets, and an owner dashboard.

The presentation uses cream and light-blue surfaces, midnight accents, premium Google Fonts, soft gradients, glass effects, and restrained motion. Phone layouts include compact product presentation, swipeable categories, larger controls, and bottom navigation.

### Status at a glance

| Area | Implemented | Boundary |
| --- | --- | --- |
| Storefront | Home, catalog, products, bundles, samples | Seed content and placeholder imagery remain |
| Shopping | Cart, wishlist, quantities, confirmation dialog | Local browser state, not a synchronized account |
| Checkout | Test order creation and entitlements | No real payment processing |
| Access | Order token lookup, library, recovery | Supplied email is not authenticated |
| Downloads | Expiring token and attachment responses | Purchased attachments contain placeholder text, not valid PDF/EPUB binaries |
| Relationships | Subscriber and ticket records | No outbound email, double opt-in, or unsubscribe endpoint |
| Owner tools | KPIs, add/delete books, refund state, ticket resolution, moderation, logs | No owner authentication/authorization |
| Storage | Local JSON database | No transactional production database or private object storage |

Visual polish and a successful build do not establish that the application is ready for live payments or private customer data.

## 2. Complete website route map

Development base URL: [http://localhost:3000](http://localhost:3000). Append the website paths below to that origin. Bracketed segments such as `[slug]` and `[token]` must be replaced with actual values.

| Website path | Purpose | Source |
| --- | --- | --- |
| `/` | Curated homepage | [app/page.tsx](<E:/SR Store/app/page.tsx>) |
| `/books` | Searchable, filterable catalog | [app/books/page.tsx](<E:/SR Store/app/books/page.tsx>) |
| `/books/[slug]` | Individual book/product details | [app/books/[slug]/page.tsx](<E:/SR Store/app/books/[slug]/page.tsx>) |
| `/bundles/[slug]` | Curated bundle details | [app/bundles/[slug]/page.tsx](<E:/SR Store/app/bundles/[slug]/page.tsx>) |
| `/samples/[slug]` | Free excerpt reader | [app/samples/[slug]/page.tsx](<E:/SR Store/app/samples/[slug]/page.tsx>) |
| `/cart` | Items, quantities, demo coupons, totals | [app/cart/page.tsx](<E:/SR Store/app/cart/page.tsx>) |
| `/checkout` | Simulated purchase form | [app/checkout/page.tsx](<E:/SR Store/app/checkout/page.tsx>) |
| `/checkout/return` | Post-checkout order lookup and downloads | [app/checkout/return/page.tsx](<E:/SR Store/app/checkout/return/page.tsx>) |
| `/orders/[token]` | Token-based order access | [app/orders/[token]/page.tsx](<E:/SR Store/app/orders/[token]/page.tsx>) |
| `/account/library` | Email-based purchase library | [app/account/library/page.tsx](<E:/SR Store/app/account/library/page.tsx>) |
| `/access` | Email-based purchase recovery | [app/access/page.tsx](<E:/SR Store/app/access/page.tsx>) |
| `/reader-club` | Newsletter signup and topic preferences | [app/reader-club/page.tsx](<E:/SR Store/app/reader-club/page.tsx>) |
| `/free-resources` | Companion resource demo downloads | [app/free-resources/page.tsx](<E:/SR Store/app/free-resources/page.tsx>) |
| `/help` | Device/help categories | [app/help/page.tsx](<E:/SR Store/app/help/page.tsx>) |
| `/help/kindle` | Kindle transfer guide | [app/help/kindle/page.tsx](<E:/SR Store/app/help/kindle/page.tsx>) |
| `/contact` | Support ticket submission | [app/contact/page.tsx](<E:/SR Store/app/contact/page.tsx>) |
| `/about` | Studio story and principles | [app/about/page.tsx](<E:/SR Store/app/about/page.tsx>) |
| `/legal/privacy` | Privacy policy copy | [app/legal/privacy/page.tsx](<E:/SR Store/app/legal/privacy/page.tsx>) |
| `/legal/terms` | Terms of service copy | [app/legal/terms/page.tsx](<E:/SR Store/app/legal/terms/page.tsx>) |
| `/legal/refunds` | Refund, delivery, and license policy | [app/legal/refunds/page.tsx](<E:/SR Store/app/legal/refunds/page.tsx>) |
| `/admin` | Demo owner dashboard | [app/admin/page.tsx](<E:/SR Store/app/admin/page.tsx>) |

### Seed products and examples

| Product | Detail path | Sample path | Seed price |
| --- | --- | --- | --- |
| The Focused Mind: Deep Work in a Distracted World | `/books/the-focused-mind` | `/samples/the-focused-mind` | $19.99 |
| Atomic Architectures: Systems Over Motivation | `/books/atomic-architectures` | `/samples/atomic-architectures` | $18.50 |
| The Young Explorer: STEM & Mindfulness Activity Pack | `/books/explorers-mind-activities` | `/samples/explorers-mind-activities` | $14.00 |
| The Solo Architect: Building High-Leverage Software | `/books/the-solo-architect` | `/samples/the-solo-architect` | $24.00 |
| Complete Mastery & Productivity Bundle | `/bundles/the-complete-mastery-bundle` | Individual included-book samples | Advertised $29.99 |

Seed definitions: [lib/data/books.ts](<E:/SR Store/lib/data/books.ts>). Runtime database records may differ. The bundle's advertised discount is not applied by current fulfillment.

### Queries and anchors

| Example | Actual behavior |
| --- | --- |
| `/books?q=focus` | Initializes the search field |
| `/books?category=Productivity` | Initializes Productivity filtering |
| `/books?category=Personal%20Growth` | Initializes Personal Growth filtering |
| `/books?category=Children%20%26%20Family` | Initializes Children & Family filtering |
| `/books?category=Bundles` | Filters actual records with product type `bundle` |
| `/books?sort=popular` | Linked from Quick Browse, but sorting is not initialized from the URL |
| `/books?sort=newest` | Linked from Quick Browse, but newest sorting is unimplemented |
| `/books?filter=deals` | Linked from Deals, but catalog does not read this parameter |
| `/reader-club#preferences` | Targets the real preferences form container |
| `/reader-club?status=success` | Footer redirect; page does not read it to activate the submitted state |
| `/checkout/return?token=...` | Looks up a stored order |
| `/help/kindle#apple`, `#android`, `#printing` | Help-index links, but corresponding sections/IDs are absent |

There is no standalone `/bundles` index, `/checkout/simulator` page, or dedicated `/help/apple-books`, `/help/android`, or `/help/printing` route.

## 3. Shared site shell and navigation

### Root layout

**Source:** [app/layout.tsx](<E:/SR Store/app/layout.tsx>)

Wraps all pages in the announcement bar, header, main content, footer, mobile navigation, and cart confirmation dialog. `CartProvider` supplies shared shopping state.

Loads **DM Sans** for interface/body text and **Cormorant Garamond** for editorial headings via `next/font/google`. Font files are included in the build for self-hosting. Sets the site title/description and Open Graph/Twitter metadata. There is no complete per-product metadata or structured-data system.

The keyboard-visible **Skip to content** link targets `#main-content`.

### Announcement bar

**Source:** [components/layout/TopBar.tsx](<E:/SR Store/components/layout/TopBar.tsx>)

Shows delivery/format messaging and desktop links to Reader Club, free resources, device setup, and support. Mobile reduces visible announcement content.

### Header

**Source:** [components/layout/Header.tsx](<E:/SR Store/components/layout/Header.tsx>)

Features:

- Brand/logo links to the homepage.
- Large-screen Explore dropdown links to categories and bundle browsing.
- Search submits to `/books?q=...`; empty search opens `/books`.
- Clear-search button appears when a query exists.
- Library action opens `/account/library`.
- Cart action opens `/cart` and shows total quantity.
- Mobile navigation menu exposes category links.
- Phone search occupies its own full-width row.
- Search and menu controls have labels; menus expose expanded state.

### Mobile bottom navigation

**Source:** [components/layout/MobileNav.tsx](<E:/SR Store/components/layout/MobileNav.tsx>)

Below 640px, a fixed translucent bar provides **Home**, **Explore**, **Library**, and **Cart**. Cart quantity updates from shared state. Links have touch-sized areas; safe-area padding accommodates phone edges. Body padding keeps the bar from covering the final content.

The bar hides while the add-to-cart modal is open. It currently has no active-route highlight and appears across all routes, including administration and checkout.

### Footer

**Source:** [components/layout/Footer.tsx](<E:/SR Store/components/layout/Footer.tsx>)

Contains newsletter signup, Help & Delivery links, Catalog links, Reader Club links, About & Trust links, copyright, and reader-support/license messaging.

The form posts to `/api/newsletter/subscribe`. On phones, the email input and button stack, links have additional touch spacing, and bottom badges wrap. Reader Support links to `/contact`; it is not a security certification.

## 4. Homepage

**Website:** `/`  
**Composition:** [app/page.tsx](<E:/SR Store/app/page.tsx>)

Reads database books, selects the first featured book or first available book, displays non-bundle records, and selects the first static bundle.

### Hero and featured book

**Source:** [components/home/HeroBanner.tsx](<E:/SR Store/components/home/HeroBanner.tsx>)

Introduces Knovera with an editorial headline, description, benefits, and Explore All Titles action. The featured card shows cover, title, and price, and links to the product page.

Desktop uses two columns, floating delivery/format badges, and layered cream/blue backgrounds. Mobile reduces padding, scales the headline, hides redundant secondary messaging/action, presents a full-width primary button, and uses a compact horizontal featured card.

Decorative effects include glow layers, texture, dots, curved underline, and staggered entrances. Earlier hard-coded audience counts were replaced with reading-oriented copy.

### Trust strip

**Source:** [components/home/TrustBar.tsx](<E:/SR Store/components/home/TrustBar.tsx>)

| Link label | Destination |
| --- | --- |
| Try a chapter first | `/free-resources` |
| Your books, your devices | `/help` |
| Clear purchase policies | `/legal/refunds` |
| A little help, anytime | `/contact` |

Desktop provides supporting descriptions; phones use compact two-column links. Actual book chapters are at `/samples/[slug]`; free resources are companion downloads.

### Quick Browse

**Source:** [components/layout/CategoryIcons.tsx](<E:/SR Store/components/layout/CategoryIcons.tsx>)

Shortcuts: Deals, Reader Club, Our Story, Bundles, Bestsellers, New Arrivals, and Free Samples. Desktop uses a grid; phones use a horizontally scrollable row with snap alignment. Some shortcut query parameters are unhandled, as listed in the route table.

### Reading room

**Sources:** [app/page.tsx](<E:/SR Store/app/page.tsx>), [components/books/BookCard.tsx](<E:/SR Store/components/books/BookCard.tsx>)

Displays non-bundle database books and a catalog link. Cards offer product detail, wishlist, cart, and sample actions. Desktop uses four columns; phones at 360–639px use two; smaller phones use one.

### Bundle showcase

**Sources:** [app/page.tsx](<E:/SR Store/app/page.tsx>), [lib/data/books.ts](<E:/SR Store/lib/data/books.ts>)

Displays the bundle title, description, included-book breakdown, advertised price, comparison total, savings, covers, and detail-page action.

Desktop uses a midnight gradient and translucent panel. Mobile places smaller covers above text, stacks included-title information, wraps price/savings, and uses a full-width action. This is offer presentation; checkout does not enforce its bundle discount.

### Reader benefits

**Source:** [components/home/ImpactStats.tsx](<E:/SR Store/components/home/ImpactStats.tsx>)

Despite the filename, now shows benefits rather than audience counts: open formats, free previews, personal library, and reader support. Mobile uses two-by-two tiles.

### Knovera experience

**Source:** [app/page.tsx](<E:/SR Store/app/page.tsx>)

Three panels describe DRM-free files, lifetime edition updates, and purchase access recovery. Phone layouts reduce spacing and enlarge readable text. Automated edition distribution and verified recovery are not complete services.

### Reader perspectives

**Source:** [components/home/ReviewsSection.tsx](<E:/SR Store/components/home/ReviewsSection.tsx>)

Displays approved static `REVIEWS_DATA` as **sample stories**, with an explicit demo disclosure. Includes stars, text, initials/name, location, and date.

The component does not read JSON database moderation changes. Ratings/counts on seed book cards and product pages are also seeded; they are not independently verified live social proof.

### Device guidance

**Source:** [components/home/DeviceHelpSection.tsx](<E:/SR Store/components/home/DeviceHelpSection.tsx>)

Cards describe e-readers, Apple devices, Android/Kobo, and printing. All current homepage guide links go to the existing `/help` index.

### Section reveals

**Source:** [components/home/ScrollReveal.tsx](<E:/SR Store/components/home/ScrollReveal.tsx>)

Uses IntersectionObserver to reveal later homepage sections once they approach visibility. Above-the-fold content remains available immediately. Reduced-motion users see content without animation. Preference changes and effect cleanup are handled. Content stays visible if JavaScript or the observer API is unavailable.

## 5. Catalog and product features

### Catalog

**Website:** `/books`  
**Source:** [app/books/page.tsx](<E:/SR Store/app/books/page.tsx>)

Starts with seed data, then fetches database books from `/api/books`.

Available controls:

- Search title, author, short description, and ISBN.
- Filter by category, including dynamically discovered categories.
- Filter formats: EPUB, PDF, printable PDF.
- In-stock-only toggle, initially enabled.
- Sort by default/featured order, most reviewed, ascending/descending price, or title.
- Reset filters, result count, and empty-results state.

Default/featured sorting preserves input order; it does not explicitly prioritize featured flags. Phone controls stack and have accessible labels/touch-sized heights. Filter calculations include fetched books as a dependency. There is no pagination or server-side search.

### Book card

**Source:** [components/books/BookCard.tsx](<E:/SR Store/components/books/BookCard.tsx>)

Shows cover, optional badge, format label, title, author, seeded stars/count, price, optional comparison price, and Best Price label.

| Control | Behavior |
| --- | --- |
| Cover/title | Opens `/books/[slug]` |
| Heart | Toggles locally stored wishlist ID |
| Add to Cart | Adds/increments item and opens confirmation |
| Preview | Opens `/samples/[slug]` |

Wishlist controls expose pressed state and descriptive labels. “Quick View” is a hover label; clicking navigates to details rather than opening a separate quick-view popup.

Mobile cards use smaller covers and stacked actions with at least 44px height. Two-column presentation applies to the homepage and catalog grids carrying the `book-grid` class.

### Book details

**Website:** `/books/[slug]`  
**Source:** [app/books/[slug]/page.tsx](<E:/SR Store/app/books/[slug]/page.tsx>)

Includes breadcrumbs, cover, title/author, metadata, format/device messaging, prices, target audience, description, inclusions, table of contents, reviews, and related books.

Actions include wishlist, Add to Cart, Buy Now, and free sample. **Buy Now** adds the book and opens `/cart`; it does not charge a payment or open a provider checkout. Adding also triggers the shared confirmation dialog.

Seed slugs resolve from static helpers first. Unknown slugs fetch database records through the API. Reviews/related books remain static data. Missing books use not-found behavior.

### Bundle details

**Website:** `/bundles/[slug]`  
**Source:** [app/bundles/[slug]/page.tsx](<E:/SR Store/app/bundles/[slug]/page.tsx>)

Reads the static bundle offer, displays included titles and prices, links to individual products, and offers a purchase button. Purchase adds individual books at their standalone cart prices and navigates to `/cart`. No discounted bundle line item is created. Unknown slugs use not-found behavior.

## 6. Samples, wishlist, cart, and checkout

### Sample reader

**Website:** `/samples/[slug]`  
**Source:** [app/samples/[slug]/page.tsx](<E:/SR Store/app/samples/[slug]/page.tsx>)

Shows a free excerpt without email registration. Reading controls offer normal, large, and extra-large text plus paper, white, sepia, and dark themes. Links return to product details.

Uses static seed data first and API fallback for unknown slugs. Preferences are component state, not persisted/synchronized settings. This is an excerpt reader, not a complete EPUB renderer or full-book web reader.

### Shopping state

**Source:** [lib/store/cart.tsx](<E:/SR Store/lib/store/cart.tsx>)

`CartProvider` tracks cart items, quantity totals, price totals, wishlist IDs, and dialog state. `useCart()` exposes add/remove/update/clear and wishlist operations.

| Local storage key | Purpose |
| --- | --- |
| `sr_store_cart` | JSON cart items |
| `sr_store_wishlist` | Saved book IDs |
| `sr_reader_email` | Remembered checkout/library email, set by relevant pages |

Storage is browser/origin-specific, not authentication or cross-device synchronization. No dedicated wishlist page exists. Context includes drawer state, but no cart drawer is implemented.

### Confirmation modal

**Source:** [components/books/AddToCartModal.tsx](<E:/SR Store/components/books/AddToCartModal.tsx>)

Shows the added item, format label, quantity, and price, with Go To Cart, Continue Shopping, and Close controls. Phone styles limit height, permit internal scrolling, enlarge Close, and reserve banner space for it.

Declares dialog semantics but does not implement a complete focus trap, Escape handling, or background scroll lock.

### Cart page

**Website:** `/cart`  
**Source:** [app/cart/page.tsx](<E:/SR Store/app/cart/page.tsx>)

Supports quantity adjustment, removal, clear cart, continue shopping, total display, coupon entry, and checkout navigation. Empty state links to the catalog.

Demo coupons:

- `DIRECT5`: displays $5 off.
- `READER10`: displays 10% off calculated when applied.
- Invalid codes display an error.

Coupon state lives on the cart page. It is not sent to checkout or applied by the server. Changing quantities after applying a coupon does not recalculate the stored discount automatically.

### Checkout form

**Website:** `/checkout`  
**Source:** [app/checkout/page.tsx](<E:/SR Store/app/checkout/page.tsx>)

Collects email and optional name, shows a summary, and posts item IDs/quantities to `/api/checkouts/simulate`. Handles empty carts, basic email checks, busy state, and errors.

On success, remembers email, clears cart, and opens `/checkout/return?token=...`. No real payment is processed. Server pricing uses static seed books instead of client-submitted prices.

### Payment adapter

**Source:** [lib/payments/adapter.ts](<E:/SR Store/lib/payments/adapter.ts>)

Defines checkout input/result, provider-event, create-checkout, verify-webhook, and refund interfaces. The active provider is `DevelopmentSimulatorProvider`.

The current checkout UI directly calls the simulation API. It does not use the adapter's `createCheckout()`, which returns a URL for the unimplemented `/checkout/simulator` page. Simulator webhook verification accepts parsed JSON without signature validation.

`fulfillSimulatorOrder()` creates a paid test order, stores it, grants access, and logs fulfillment. These are separate JSON writes; comments calling them atomic do not make them a transactional operation. Refund behavior in the simulator revokes access/logs locally.

## 7. Orders, library, recovery, and downloads

### Checkout return

**Website:** `/checkout/return?token=...`  
**Source:** [app/checkout/return/page.tsx](<E:/SR Store/app/checkout/return/page.tsx>)

Calls `/api/orders/lookup`, shows loading/error states and order information, and provides download/library/help actions. URL text alone does not create an order; the token must identify a stored record.

### Order page

**Website:** `/orders/[token]`  
**Source:** [app/orders/[token]/page.tsx](<E:/SR Store/app/orders/[token]/page.tsx>)

Looks up order details, lists purchased titles, and requests EPUB/PDF links. Invalid orders show a recovery action. Actual order tokens should be treated as private bearer links.

### Reader library

**Website:** `/account/library`  
**Source:** [app/account/library/page.tsx](<E:/SR Store/app/account/library/page.tsx>)

Loads active entitled books for an email. Starts from remembered `sr_reader_email`, or the seeded `reader@example.com` demo identity. Offers download/sample actions and empty-library/recovery states.

There is no verified account session: entering an email queries its entitlement data.

### Recovery

**Website:** `/access`  
**Source:** [app/access/page.tsx](<E:/SR Store/app/access/page.tsx>)

Posts email to `/api/access/request`, displays matching orders/access links, and records an audit entry. It returns tokens directly to the browser instead of sending a verified recovery email.

### Downloads

**Sources:** [app/api/downloads/route.ts](<E:/SR Store/app/api/downloads/route.ts>), [app/api/downloads/[token]/route.ts](<E:/SR Store/app/api/downloads/[token]/route.ts>)

1. Request a link with email, book ID, and format.
2. Server checks active entitlement.
3. Resolve current edition asset; absent format falls back to first asset.
4. Store a random token valid for five minutes.
5. Browser opens `/api/downloads/[token]`.
6. Server checks expiry and returns attachment content.

Tokens are random stored identifiers, not cryptographically signed storage URLs. The `used` flag is not consumed, so links are reusable until expiry. Retrieval does not recheck entitlement after issuance.

**Actual attachment content:** generated text with title, license, contents, and excerpt. PDF/EPUB filenames and MIME types do not make this a valid book binary. Storage keys are metadata; actual private files are not fetched.

Invalid/expired tokens return HTTP 410. Successful issuance/retrieval produces audit entries.

## 8. Reader Club, resources, and support

### Reader Club

**Website:** `/reader-club#preferences`  
**Source:** [app/reader-club/page.tsx](<E:/SR Store/app/reader-club/page.tsx>)

Email signup with topic choices:

| Topic ID | Interest |
| --- | --- |
| `deep-work` | Deep Work & Productivity updates |
| `habit-systems` | Habit systems/scorecards |
| `children-activities` | Children STEM/mindfulness worksheets |
| `new-releases` | Releases and launch discounts |

Posts to the subscriber API and shows an accepted state. Existing emails merge topics and become subscribed again; removing a selected topic does not delete a previously stored preference.

No campaigns, double opt-in, or unsubscribe flow is implemented.

### Free resources

**Website:** `/free-resources`  
**Source:** [app/free-resources/page.tsx](<E:/SR Store/app/free-resources/page.tsx>)

Lists focus protocol, habit stacking/friction matrix, calming maze sample, and production deployment checklist. Cards display descriptions, advertised formats/sizes, and download controls.

Download buttons generate a short browser-side `.txt` resource notice. They do not provide the advertised PDFs or actual worksheets; sizes are illustrative.

### Support tickets

**Website:** `/contact`  
**Sources:** [app/contact/page.tsx](<E:/SR Store/app/contact/page.tsx>), [app/api/support/route.ts](<E:/SR Store/app/api/support/route.ts>)

Collects email, subject, category, optional order reference, and message. Categories: download help, device setup, payment inquiry, and general. Stores an open ticket, logs creation, and returns a ticket number displayed to the reader.

The page publishes a two-business-day response expectation. No automatic email response or external helpdesk integration exists. Owners resolve stored tickets through admin.

## 9. Help, story, and policies

### Device help

**Sources:** [app/help/page.tsx](<E:/SR Store/app/help/page.tsx>), [app/help/kindle/page.tsx](<E:/SR Store/app/help/kindle/page.tsx>)

The help index presents device categories and support links. The Kindle guide provides Send to Kindle web and email-transfer instructions, including an external Amazon tool link.

Apple, Android, and printing guide sections remain incomplete. Help-index anchors are absent from the Kindle page; its e-reader category links back to the help index. The homepage device section currently uses the existing help index for all guides.

### About

**Source:** [app/about/page.tsx](<E:/SR Store/app/about/page.tsx>)

Studio story, publishing values, and reader principles, with catalog/contact actions. Content is static editorial copy, not admin-managed.

### Policy pages

| Page | Content | Source |
| --- | --- | --- |
| `/legal/privacy` | Data collection/use and privacy policy copy | [app/legal/privacy/page.tsx](<E:/SR Store/app/legal/privacy/page.tsx>) |
| `/legal/terms` | Digital licenses, educational disclaimers, account/access responsibility | [app/legal/terms/page.tsx](<E:/SR Store/app/legal/terms/page.tsx>) |
| `/legal/refunds` | Delivery, 14-day satisfaction wording, personal/household license, recovery | [app/legal/refunds/page.tsx](<E:/SR Store/app/legal/refunds/page.tsx>) |

Static copy must be aligned with owner-approved business operations. Mentioning emailed receipts, valid book delivery, or access security does not implement those services.

## 10. Owner administration

**Website:** `/admin`  
**UI:** [app/admin/page.tsx](<E:/SR Store/app/admin/page.tsx>)  
**API:** [app/api/admin/actions/route.ts](<E:/SR Store/app/api/admin/actions/route.ts>)

This dashboard has six tabs and no login gate or server-side owner role check.

### Overview & Settings

Displays paid-order revenue, order count, active entitlements, open tickets, and subscribers. Shows simulator and publishing-rights status text.

It is not a working payment-credential/settings editor. Revenue includes paid simulated orders. Subscriber count includes stored records without filtering subscription status. Adding provider keys to an environment file does not activate a provider.

### Orders

Lists stored orders and offers Refund. This marks the order refunded, revokes related entitlements, and logs the change. It does not return actual money through a processor.

### Catalog Management

Add Book collects:

- Title, subtitle, author, category.
- Price/comparison price in dollars; submitted as cents.
- Badge, cover URL, page count, featured flag.
- Short/full descriptions.
- Multi-line inclusions and table of contents, converted to arrays.
- Sample excerpt.

API creates a unique slug/ID, fills defaults, adds placeholder edition/asset metadata, assumes `wide` rights, and sets published/in-stock immediately. The cover field and preset controls use URLs; they do not upload covers or ebook files.

Delete removes a JSON catalog record after UI confirmation. There is no general book-update endpoint, draft workflow, publish/unpublish action, validated file upload, or edition-management UI. Deleting a seed record does not remove its static definition used elsewhere.

### Support Tickets

Displays tickets and lets the owner mark them resolved with optional notes through the API. This does not send a customer reply.

### Reviews

Displays JSON review records and toggles approval. There is no customer review submission page/API. Static storefront reviews do not consume moderation changes.

### Audit Trail

Displays the newest records; API returns up to 20. Logged events cover initialization, catalog changes, fulfillment, refunds, recovery, downloads, tickets, and subscriptions. These are local records, not a tamper-proof external audit system.

## 11. API reference

URLs are relative to the site origin. Mutating endpoints currently lack authentication. Request examples describe implementation; they are not instructions to operate on production data.

| Method | Endpoint | Input | Result | Source |
| --- | --- | --- | --- | --- |
| GET | `/api/books` | Optional `slug` or `id`; slug first | `{books}` or `{book}` | [app/api/books/route.ts](<E:/SR Store/app/api/books/route.ts>) |
| POST | `/api/books` | JSON title required, metadata, prices in cents | Creates published book, HTTP 201 | [app/api/books/route.ts](<E:/SR Store/app/api/books/route.ts>) |
| DELETE | `/api/books` | Query `id` or JSON `id` | Removes record | [app/api/books/route.ts](<E:/SR Store/app/api/books/route.ts>) |
| POST | `/api/checkouts/simulate` | Email/name, nonempty items | Paid test order, token, receipt URL | [app/api/checkouts/simulate/route.ts](<E:/SR Store/app/api/checkouts/simulate/route.ts>) |
| GET | `/api/orders/lookup` | Query `token` | Selected order fields/items | [app/api/orders/lookup/route.ts](<E:/SR Store/app/api/orders/lookup/route.ts>) |
| POST | `/api/access/request` | JSON `email` | Matching orders including tokens | [app/api/access/request/route.ts](<E:/SR Store/app/api/access/request/route.ts>) |
| GET | `/api/me/library` | Query `email` | Email, count, entitled books | [app/api/me/library/route.ts](<E:/SR Store/app/api/me/library/route.ts>) |
| POST | `/api/downloads` | Email, book ID, format | Temporary URL/name/size, 300-second expiry | [app/api/downloads/route.ts](<E:/SR Store/app/api/downloads/route.ts>) |
| GET | `/api/downloads/[token]` | Path token | Placeholder attachment or HTTP 410 | [app/api/downloads/[token]/route.ts](<E:/SR Store/app/api/downloads/[token]/route.ts>) |
| POST | `/api/newsletter/subscribe` | JSON email/topics or form email | JSON success or Reader Club redirect | [app/api/newsletter/subscribe/route.ts](<E:/SR Store/app/api/newsletter/subscribe/route.ts>) |
| POST | `/api/support` | Email/message; optional subject/category/reference | Stores ticket, returns number | [app/api/support/route.ts](<E:/SR Store/app/api/support/route.ts>) |
| GET | `/api/admin/actions` | None | KPIs and operational collections | [app/api/admin/actions/route.ts](<E:/SR Store/app/api/admin/actions/route.ts>) |
| POST | `/api/admin/actions` | Action/payload | Supported admin mutation | [app/api/admin/actions/route.ts](<E:/SR Store/app/api/admin/actions/route.ts>) |

### Admin payloads

| Action | Payload | Effect |
| --- | --- | --- |
| `DELETE_BOOK` | `{bookId}` | Deletes a record |
| `REFUND_ORDER` | `{orderId}` | Marks refunded, revokes access, logs |
| `RESOLVE_TICKET` | `{ticketId, notes?}` | Resolves stored ticket |
| `TOGGLE_REVIEW_APPROVAL` | `{reviewId, isApproved}` | Changes moderation flag |

Missing inputs generally return HTTP 400; missing books/orders return 404; missing active entitlement returns 403; expired download token returns 410. Caught exceptions return 500. Validation is primarily presence/basic-email checking rather than strict schemas.

### Example simulator input

```json
{
  "customerEmail": "reader@example.com",
  "customerName": "Demo Reader",
  "items": [{ "bookId": "book-deep-work", "quantity": 1 }]
}
```

No client price, bundle offer price, or coupon is submitted.

### Example download-link request

```json
{
  "email": "reader@example.com",
  "bookId": "book-deep-work",
  "format": "epub"
}
```

An active stored entitlement is required, but the email's ownership is not authenticated.

### Key response fields

- Book API: `book` or `books`; mutations include `success`.
- Simulator: `success`, `orderNumber`, `publicToken`, `receiptUrl`.
- Order lookup: `order` with customer identity, amount, status, date, items.
- Recovery: `success`, `orders` containing public access tokens.
- Library: normalized `email`, `count`, `books`.
- Download issuance: `success`, `downloadUrl`, `fileName`, `fileSize`, `expiresInSeconds`.
- Support: `success`, `ticketNumber`.
- Admin GET: `kpis`, `orders`, `books`, `entitlements`, `tickets`, `reviews`, `subscribers`, `auditLogs`.

## 12. Data models and persistence

### JSON database

**Implementation:** [lib/db/store.ts](<E:/SR Store/lib/db/store.ts>)  
**Runtime location:** `.data/db.json` under the workspace.

Reads/writes the entire store synchronously. Missing file triggers seed initialization with books, reviews, a demo order/entitlement, subscriber, ticket, and log. An empty books array is repopulated with seed titles. Malformed JSON falls back to seed books/reviews and empty operational collections.

Write failures are logged rather than consistently propagated. There are no locks, transactions, migrations, database access policies, or concurrent-write guarantees. Back up the JSON file before owner operations or persistence changes. Do not expose customer/order data as public assets.

### Models

**Types:** [lib/types.ts](<E:/SR Store/lib/types.ts>)

| Model | Purpose and main fields |
| --- | --- |
| Book | IDs/slugs, content, author/category, formats, prices, cover, rights, edition, ratings, publication flags |
| BookAsset | Format, filename, displayed size, storage key, MIME type, checksum |
| BookEdition | Version/date/notes and assets |
| BundleOffer | Static books, discounted/original price, savings, description |
| CartItem | Book metadata, unit price, selected label, quantity |
| OrderItem | Book ID/title, edition version, unit price, formats |
| Order | Public token/number, customer identity, totals, status/provider, items/date |
| Entitlement | Email, book/order IDs, active/revoked state, dates |
| Review | Book, author/location, rating/text/date, verified/approved flags |
| SupportTicket | Number, customer, category/reference/message, status/notes/date |
| NewsletterSubscriber | Email, topics, consent timestamp, subscription status |
| DownloadTokenRecord | Token, email/book/format/name, expiry, unused usage flag; defined in database module |

Money is in integer minor units: `1999` = $19.99. Formats: `pdf`, `epub`, `printable_pdf`. Product types: `ebook`, `printable`, `bundle`. Rights values: `wide`, `kdp_select`, `unknown`; checkout does not consistently enforce them.

### Static versus database sources

**Seed source:** [lib/data/books.ts](<E:/SR Store/lib/data/books.ts>)

| Consumer | Source |
| --- | --- |
| Homepage books/featured choice | JSON database |
| Catalog | Static initial data, then API database |
| Seed product/sample slug | Static first |
| New product/sample slug | API fallback |
| Bundle offers | Static `BUNDLES_DATA` |
| Homepage reviews | Static `REVIEWS_DATA` |
| Product reviews/related titles | Static helpers/data |
| Simulator pricing/fulfillment | Static `getBookById()` |
| Library/download lookup | Database first, static fallback |
| Admin | Database, with seed catalog fallback |

Adding/deleting metadata does not update every flow. Database-only new books can be browsed but are not supported correctly by static simulator fulfillment. Bundle category results can be empty when the database has no actual bundle records.

Entitlements deduplicate by active email/book, not per purchase. Refunding one order can remove access despite another purchase of the same book. Quantity affects total cost but is not represented as separate licenses in order fulfillment.

## 13. Design, animations, and mobile behavior

**Styles:** [app/globals.css](<E:/SR Store/app/globals.css>)

### Visual system

Cream paper `#FDFBF7`, ink `#0F1D2F`, accent `#0369A1`, and light accent `#E0F2FE` underpin the theme. Fonts, rounded corners, soft shadows, gradients, glass surfaces, texture, focus-visible outlines, and selection/scrollbar styles form the shared visual language.

The recent pass removed orange/amber accents from shared/home components; older page-specific colors are not all comprehensively restyled.

### Motion and accessibility

Includes float, slow float, soft pulse, shimmer, gradient shift, directional fades, scale-in, link underlines, and hover feedback. Hero uses staggered entrances; homepage sections use observer reveals.

Reduced-motion preferences disable CSS animation/transitions and make pending content visible. Hover-only card movement is suppressed on non-hover devices. The layout adds a skip link, form/control labels, menu expanded state, and wishlist pressed state.

Full accessibility still needs physical-device, keyboard, assistive-technology, and dialog-focus testing.

### Mobile behavior map

| Area | Phone behavior |
| --- | --- |
| Breakpoints | Phone overrides below 640px |
| Header | Search on own row, larger controls |
| Hero | Reduced height/padding, fluid headline, compact linked feature |
| CTA | Full-width, minimum 48px height |
| Trust | Compact two-column strip |
| Categories | Horizontal scrolling with snap alignment |
| Book grids | Two columns at 360–639px; one below 360px |
| Card controls | Stacked, minimum 44px height |
| Bundle | Small covers above content, stacked inclusions, wrapping price |
| Benefits | Two-by-two tiles |
| Content panels | Tighter spacing, readable paragraph sizes |
| Forms/filters | Touch-sized controls, 16px field text to reduce common phone auto-zoom |
| Newsletter | Stacked input/button |
| Bottom navigation | Fixed bar, safe-area padding, cart badge |
| Confirmation dialog | Viewport-limited height and scrolling |

Desktop composition remains governed by the larger-screen layouts. Browser viewport checks do not establish physical iOS/Android keyboard or browser compatibility.

## 14. Configuration and local development

| File | Purpose |
| --- | --- |
| [package.json](<E:/SR Store/package.json>) | Dependencies and scripts |
| [next.config.ts](<E:/SR Store/next.config.ts>) | Cache Components, partial prefetching, Tailwind Turbopack loader |
| [tsconfig.json](<E:/SR Store/tsconfig.json>) | Strict TypeScript, bundler resolution, `@/*` alias |
| [eslint.config.mjs](<E:/SR Store/eslint.config.mjs>) | Lint configuration |
| [AGENTS.md](<E:/SR Store/AGENTS.md>) | Read installed Next.js docs before code changes |
| [README.md](<E:/SR Store/README.md>) | Original quick-start README |
| [proj.md](<E:/SR Store/proj.md>) | Larger project requirements and launch planning |

Declared versions include Next.js 16.4.0, React/React DOM 19.3.0, Tailwind 4, TypeScript 5, Lucide React, and Zod. Zod's presence does not mean API validation uses it.

### Commands

```powershell
cd 'E:\SR Store'
npm install
npm run dev
```

Open [the local site](http://localhost:3000). Installation is for a fresh checkout; dependencies already exist in this workspace.

```powershell
npm run build
npm run start
npm run lint
npx tsc --noEmit
```

There is no dedicated automated test script. Google font assets may require network access during builds. In this Windows environment, Next.js compilation required execution outside the filesystem sandbox to resolve the project path.

No live payment, email, or production database environment wiring is implemented. Adding Lemon Squeezy keys to `.env.local` alone does not activate live checkout. Environment names in `proj.md` describe planned integration requirements.

### Installed framework guidance

Before changing Next.js code, follow `AGENTS.md` and consult `node_modules/next/dist/docs/`. The project uses a framework version whose behavior should be checked against those installed guides.

## 15. User journeys

### Discover and preview

1. Visit `/`.
2. Search or select Explore to reach `/books`.
3. Filter/sort.
4. Open `/books/[slug]` for scope and inclusions.
5. Read `/samples/[slug]` with preferred size/theme.

### Simulated purchase

1. Add a seed book.
2. Open `/cart` and adjust quantity.
3. Proceed to `/checkout`.
4. Enter a demo email and submit.
5. View `/checkout/return?token=...`.
6. Request a download or open `/account/library`.

Creates local test records without charging money. The attachment is placeholder text.

### Purchase recovery

1. Open `/access`.
2. Enter the same checkout email.
3. Open a matching `/orders/[token]`.
4. Request a fresh download link.

Illustrates the journey without verifying email ownership.

### Reader Club

1. Open `/reader-club#preferences`.
2. Choose topics and enter email.
3. Submit to create/merge a local subscriber record.

### Support

1. Submit `/contact`.
2. Receive a ticket number onscreen.
3. Owner views Support Tickets in `/admin`.
4. Owner resolves the record.

### Catalog addition

1. Open `/admin`, Catalog Management.
2. Complete Add Book fields.
3. Submit metadata.
4. Inspect `/books` and generated product URL.

This does not upload real files, verify rights, or establish new-title fulfillment.

## 16. Where to make changes

| Change | Files |
| --- | --- |
| Brand metadata/fonts/site composition | [app/layout.tsx](<E:/SR Store/app/layout.tsx>) |
| Theme/mobile breakpoints/animation | [app/globals.css](<E:/SR Store/app/globals.css>) |
| Homepage section order | [app/page.tsx](<E:/SR Store/app/page.tsx>) |
| Hero copy/feature | [components/home/HeroBanner.tsx](<E:/SR Store/components/home/HeroBanner.tsx>) |
| Trust links | [components/home/TrustBar.tsx](<E:/SR Store/components/home/TrustBar.tsx>) |
| Section reveals | [components/home/ScrollReveal.tsx](<E:/SR Store/components/home/ScrollReveal.tsx>) |
| Category shortcuts | [components/layout/CategoryIcons.tsx](<E:/SR Store/components/layout/CategoryIcons.tsx>) |
| Header search/menus | [components/layout/Header.tsx](<E:/SR Store/components/layout/Header.tsx>) |
| Phone navigation | [components/layout/MobileNav.tsx](<E:/SR Store/components/layout/MobileNav.tsx>) |
| Footer/signup | [components/layout/Footer.tsx](<E:/SR Store/components/layout/Footer.tsx>) |
| Product cards | [components/books/BookCard.tsx](<E:/SR Store/components/books/BookCard.tsx>) |
| Cart confirmation | [components/books/AddToCartModal.tsx](<E:/SR Store/components/books/AddToCartModal.tsx>) |
| Catalog search/filters | [app/books/page.tsx](<E:/SR Store/app/books/page.tsx>) |
| Product/bundle detail | [app/books/[slug]/page.tsx](<E:/SR Store/app/books/[slug]/page.tsx>), [app/bundles/[slug]/page.tsx](<E:/SR Store/app/bundles/[slug]/page.tsx>) |
| Sample reader | [app/samples/[slug]/page.tsx](<E:/SR Store/app/samples/[slug]/page.tsx>) |
| Seed catalog/bundles/reviews | [lib/data/books.ts](<E:/SR Store/lib/data/books.ts>) |
| Cart/wishlist operations | [lib/store/cart.tsx](<E:/SR Store/lib/store/cart.tsx>) |
| Coupon display | [app/cart/page.tsx](<E:/SR Store/app/cart/page.tsx>) |
| Checkout | [app/checkout/page.tsx](<E:/SR Store/app/checkout/page.tsx>), [lib/payments/adapter.ts](<E:/SR Store/lib/payments/adapter.ts>) |
| Recovery/library | [app/access/page.tsx](<E:/SR Store/app/access/page.tsx>), [app/account/library/page.tsx](<E:/SR Store/app/account/library/page.tsx>) |
| Download handling | [app/api/downloads/route.ts](<E:/SR Store/app/api/downloads/route.ts>), [app/api/downloads/[token]/route.ts](<E:/SR Store/app/api/downloads/[token]/route.ts>) |
| Admin UI/actions | [app/admin/page.tsx](<E:/SR Store/app/admin/page.tsx>), [app/api/admin/actions/route.ts](<E:/SR Store/app/api/admin/actions/route.ts>) |
| Database | [lib/db/store.ts](<E:/SR Store/lib/db/store.ts>) |
| Data definitions | [lib/types.ts](<E:/SR Store/lib/types.ts>) |

Every route/component/library file in the current `app`, `components`, and `lib` tree is linked somewhere in this guide.

## 17. Implementation gaps

| Area | Current limitation | Production work |
| --- | --- | --- |
| Admin | No authentication on dashboard/API/mutations | Owner identity and enforced roles |
| Reader identity | APIs trust supplied email | Verified sessions/scoped capabilities |
| Payments | Simulator with no production lockout/live integration | Hosted checkout, signed webhooks, fail-closed simulator config |
| Fulfillment | Separate writes, limited validation/idempotency | Server-approved offers, transactional/replay-safe fulfillment |
| Discounts | Bundle/coupon display not enforced | Authoritative server offer pricing |
| Purchased files | Text with PDF/EPUB filenames | Validated binaries and private storage |
| Free resources | Text notice instead of worksheets | Actual downloadable resource assets |
| Catalog consistency | Static and JSON sources diverge | Unified authoritative catalog |
| Publishing | Default metadata/ratings/ISBN/rights/assets | Owner-approved metadata, rights, assets, draft workflow |
| Persistence | Entire-file rewrites and race risks | Durable database, transactions, backups |
| Download tokens | Reusable; entitlement checked only at issuance | Documented token/revocation policy |
| Refunds | Local status/access change only | Actual provider refund and reconciliation |
| Repeat purchases | One active grant per email/book | Per-order entitlement accounting |
| Email | No receipts/recovery/marketing delivery | Transactional email and consent workflows |
| Moderation | DB approvals not connected to display | Authentic reviews and unified approved source |
| Guide links/shortcuts | Unhandled parameters and missing anchors | Complete guides and consistent query handling |
| Policies | Text promises exceed implementation | Align copy with approved operation |
| Accessibility | Modal focus management incomplete | Keyboard/screen-reader/phone validation |
| SEO/assets | Global metadata and placeholders | Product metadata and approved content/assets |

No implemented referrals, gifting, complete in-browser book reader, asset-processing pipeline, automatic edition distribution, provider reconciliation worker, or customer authentication service. References in `proj.md` to these are future scope.

## 18. History and verification

History inspected during the work:

| Commit | Message | Context |
| --- | --- | --- |
| `506c8fa` | `code` | Earlier baseline |
| `4404207` | `polished version` | Existing branded styling |
| `b68559f` | `enhanced polish version` | Premium baseline present before mobile changes |

Use current Git state rather than assuming this snapshot always represents the latest history:

```powershell
git log --oneline -8
git status --short
git diff --stat
```

Mobile changes were checked with production build/TypeScript compilation, focused lint, and browser viewports at 320px, 390px, and 430px. Checked home/catalog layouts had no horizontal document overflow, and local add-to-cart showed the confirmation dialog.

Focused lint passed without errors, with an image-optimization warning. Earlier repository-wide lint reported existing errors outside the changed files; this document does not claim full-repository lint passes. No live payment, valid published-file delivery, physical-device certification, email-deliverability validation, or production security review was completed.

This documentation is a source-code snapshot. Update it when routes, behavior, data sources, or integrations change.

