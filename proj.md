file:///e%3A/SR%20Store/proj.md {"mtime":1791403324944,"ctime":1791403324944,"size":0,"etag":"3goj0o9na0","orphaned":false,"typeId":""}
Personal Ebook Store — Research and Complete Build Specification
Project: A public storefront selling one owner's books, with private owner administration and customer accounts.
Status: Implementation specification; no payment accounts, deployed website, or operating business are implied.
1. Start here: instructions for the coding agent
Build the product described in this document. Read it completely before coding. Treat requirements marked P0 as the launch scope, P1 as the next release, and P2 as optional expansion. The owner is the only publisher. Customers can purchase and access books, but cannot publish products or open stores.
If this file is added to an existing repository, inspect its README, AGENTS.md, package manifest, routes, authentication, and database migrations first. Preserve a working architecture unless a requirement makes a change necessary. If starting from an empty repository, use the default architecture in Section 13. Resolve ordinary implementation choices autonomously and record them. Request only information that materially blocks real integration or publication.
Work through the milestones in Section 25 in order. Implement functioning database-backed flows, including failure states. A beautiful frontend with fake orders, pretend payments, or nonfunctional buttons is not completion. Implement a clearly labeled development checkout simulator when credentials are absent; production must reject that simulator. Finish each milestone with its acceptance checks before moving on.
Generate normal project files during implementation: README, environment example, migrations, meaningful tests, deployment instructions, and an operations guide. These are outputs of building the application; this specification itself remains a single file.
Do not stop after scaffolding. At handoff, report what works, what was tested, which integrations need owner credentials or approval, and the exact remaining launch blockers. Never claim an untested integration is live.
2. Product decision and assumptions
Build a branded independent publishing store with a reader library and an optional Reader Club. Sell individual ebooks and curated bundles. Help buyers use what they bought through device instructions, companion resources, book updates, and relevant follow-up content. Loyal customers should return because the books and support are useful.
Assumptions to use until the owner supplies replacements:
Item	Working decision
Business model	Single owner, direct sales; no marketplace or seller onboarding
Public identity	Configurable publishing brand and optional pen name; do not insert the owner's legal name into public copy
Owner location	Pakistan; payment eligibility and settlement must be confirmed
Audience	International English-speaking readers; architecture can support other languages later
Launch catalog	1–10 books; layouts must also work with just one published title
Books	Nonfiction ebooks initially; allow separate collections for adult nonfiction and parent-purchased children's printables
Content	Owner supplies actual files, covers, descriptions, and rights declarations
Formats	PDF and EPUB when available; a printable PDF is a distinct, clearly labeled product type
Price	Owner-controlled; USD 20 is an illustrative book price, not a universal default
Revenue	One-time purchases initially; no paid subscription at launch
Accounts	Guest purchase supported; email-verified recovery and optional reader account
Administration	One owner role, protected separately from customer access
Experience	Mobile first, accessible, calm, editorial, fast


The owner's earlier $7 Amazon coloring-book offer concerns a print product. Do not silently convert it into a $7 digital download or imply the website fulfills Amazon print orders. A downloadable coloring product must have its own files, format explanation, license, and price. Separate collections and email interests prevent irrelevant offers across very different audiences.
Do not presume a prior ebook's title, page count, cover, health claims, or publishing status. Use clearly labeled development fixtures until the owner supplies approved assets.
3. Research scope and evidence quality
This is a representative landscape review, not a claim to have inspected every ebook website. Research covered creator commerce platforms, book delivery tools, actual author stores, public reviews, payment documentation, and ebook distribution restrictions. Sources are listed in Section 31.
Evidence labels used below:
- Official: A platform's own feature, pricing, or technical documentation. Establishes what it documents, not guaranteed quality.
- Review: A public user's report. Useful for finding possible failure modes; not independently verified and not proof of prevalence.
- Observation: A visible pattern on a public author website. Does not establish conversion or revenue.
- Recommendation: An original product or engineering decision for this project.
Review sampling was qualitative. Recent and older individual reviews were read, alongside platform summaries where available. No exhaustive sample, statistical ranking, or quantified complaint frequency is claimed. Review scores were deliberately omitted because they change and different platforms solicit reviews differently. Vendor-hosted testimonials are promotional evidence and are not independent reviews.
4. Competitive landscape: what to learn
Website / product	Evidence examined	Useful lesson	Decision for this store
Gumroad	Official pricing and fees; Trustpilot reviews [S01–S03]	Quick selling is attractive; users also report payment, delivery, and support problems	Keep checkout short; keep a local order ledger and a visible support route
Payhip	Official pricing/FAQ; individual Trustpilot reviews [S04–S06]	Simple administration and helpful support receive praise	Owner can publish a complete book without changing code; plain customer instructions
Lemon Squeezy	Official country/fee/API documentation; individual reviews [S07–S10]	Merchant-of-record checkout can simplify global selling; reviewers report approval and support delays	Conditional payment candidate; verify approval early and separate payments from reader access
Shopify Digital Products	Official help and app reviews [S11–S12]	Automatic delivery and owner simplicity are valuable	Deliver through both the order page and email; avoid physical-shipping fields for digital goods
SendOwl	Official integration help and app reviews [S13–S14]	Secure delivery and replacement-file workflows are useful; pricing/cancellation complaints appear	Immutable file versions, controlled updates, transparent costs; self-service cancellation if subscriptions are ever added
Sellfy	Official features and individual reviews [S15–S16]	Easy management is praised; some reviews mention customization and analytics limitations	Real reporting, editable merchandising, and clear integration limits
Podia	Official digital-download features and individual reviews [S17–S18]	Store, account, resources, and email can form one coherent experience	One reader account and library; keep community optional and small
BookFunnel	Vendor-authored WordPress plugin documentation [S19]	Device help and reader support are part of successful ebook delivery	Include device guides, delivery logs, and a future optional delivery adapter
StoryOrigin	Official pricing/features and vendor-hosted testimonials [S20–S21]	Reader magnets, reading order, and launch follow-up support an author business	Free samples, topic preferences, release notifications; no multi-author platform
WooCommerce	Official digital-product and delivery documentation [S22–S23]	Virtual-product configuration and secure file handling matter	No shipping checkout; private storage and explicit download permissions
J.F. Penn Books	Store, ebook collection, and FAQ [S24–S25]	Series/categories, bundles, and device delivery explanations	Clear collections and bundles; explain what happens after payment
The Creative Penn Books	Digital bundle product page [S26]	A book plus genuinely useful companion material can support a richer offer	Separate book-only and book-plus-workbook offers when real files exist
James Clear	Homepage and book page [S27–S28]	Samples, application guides, and an ongoing newsletter connect books to continuing value	Use a sample and relevant companion content; do not copy claims or endorsements


BookFunnel and WooCommerce were evaluated through documentation, not a representative independent review sample. Author-store testimonials concern their books and cannot establish the reliability of their storefront software. No private dashboards or full live purchases were tested.
Specific review evidence that affected the plan
Public report	Reported experience, paraphrased	Interpretation for this project
Gumroad Trustpilot, September 2026 and July 2026 [S03]	Sellers described delayed payouts; a buyer described paying twice while failing to receive download information	Separate payment, payout, and delivery states; discourage a second payment while a payment is unresolved
Payhip Trustpilot, 30 September 2026 [S06]	A new business owner praised support that investigated technical issues and explained unsupported features	Provide a real support process and explicit limitations
Lemon Squeezy Trustpilot, 25 September 2026 [S10]	A reviewer described re-verification blocking launch without a self-service path or response	Prove account activation before building assumptions around live payments
SendOwl Shopify review, edited 8 October 2025 [S14]	A merchant complained about higher pricing and needing email to close an account	Show operating cost changes to the owner; avoid hard-to-cancel recurring products
SendOwl Shopify review, edited 10 April 2025 [S14]	A long-term user praised replacement-file notifications and support	Build safe file correction and update notification workflows
Sellfy Trustpilot, 31 January 2026 [S16]	A reviewer described unclear customization limits during trial and wanted better analytics	Make admin capabilities concrete; include defined sales and repeat-buyer metrics
Podia Trustpilot, 30 September 2026 [S18]	A user praised human help when documentation or AI did not resolve a question	Self-service help must lead to an actual human contact route


A Sellfy review apparently about selling a used mobile phone was excluded; the company response suggested the wrong business had been reviewed. Print-on-demand shipping complaints were also excluded from ebook-specific conclusions. This demonstrates why star ratings alone are a poor product requirements source.
5. Problems to address, with verifiable outcomes
These are recommended requirements informed by research, not claims that every competitor has each problem.
Problem	Required response	Acceptance evidence
Buyer pays but sees no book	Confirm provider payment server-side; create entitlements transactionally; show library/order download options	Paid order produces the exact purchased files even when email delivery fails
Payment appears unresolved	Show checking/pending states and a retry-status action	Pending state never asks the reader to purchase again to solve delivery
Old link expires	Recover access through verified email or account and issue a new temporary file link	Recovery works after the original signed link expires
Ebook format is confusing	Show actual formats and device instructions before and after purchase	Every offered format has a usable help path
Forced account creation interrupts purchase	Guest checkout with later account claiming	New visitor buys without setting a password
File replacement loses access	Immutable assets, edition history, and purchase-linked access	Old buyer keeps access after a correction release
Reader buys an owned book	Authenticated ownership indicator; warning before duplicate purchase	Library/book page shows owned state; gift purchase is separately identified
Weak trust or exaggerated promises	Real samples, honest metadata, real policies, authentic reviews	No fabricated reviews, counters, badges, countdowns, or unsupported outcomes
Support lacks order context	Order-linked ticket, delivery diagnostics, resend and recovery controls	Owner can find and help the customer from one order screen
Readers receive irrelevant campaigns	Topic interests and explicit consent, with suppression checks	Parent-printable buyers do not receive adult-topic campaigns without selecting that interest
Site becomes provider-dependent	Own catalog/order/entitlement data plus provider adapter boundary	Switching future checkout provider does not erase historical purchases
Owner cannot manage publishing	Database-backed admin forms, publishing validation, preview	Add a book and change a price without a frontend release


6. Launch scope and expansion
P0: must work before accepting real money
- Home, catalog, collection, book details, public samples, about, help, contact, and legal pages.
- Single-offer Buy Now checkout: individual books and curated bundles sold as explicit provider offers.
- Server-verified purchases, idempotent webhook handling, customer/order database, and private downloads.
- Guest access recovery, customer library, order history, and device guides.
- Owner admin for catalog, uploads, editions, offer mappings, orders, customers, support, and basic reports.
- Newsletter signup, topic preferences, explicit consent, unsubscribe, basic approved email sequences.
- Authentic review submission and publication rules.
- SEO, mobile accessibility, error handling, backups, monitoring, and launch checks.
P1: after reliable sales and delivery
- Buyer-only companion resource hub, saved reading status, wishlist, and more precise email segmentation.
- Free Reader Club benefits, release polls, structured book feedback, and occasional member resources.
- Coupons and campaigns tied to real provider-supported prices and discounts.
- Referral/affiliate attribution with a refund-aware commission ledger; manual payouts first.
- Gifts with separately verified recipient claiming.
- Multi-item cart only after proving the chosen provider supports the required mixed-product transaction.
- Additional approved payment adapter if there is demonstrated demand.
- BookFunnel integration if device support volume justifies its cost.
P2: only when demand warrants it
- In-browser full-book reader, highlights/notes, richer reading progress, audiobooks.
- Paid membership with genuinely recurring content, supported billing, and self-service cancellation.
- Moderated discussion spaces, localization, or organization licenses.
Exclude marketplace features, author onboarding, public uploads, social feeds, native mobile apps, a custom card vault, a custom tax engine, AI-generated fake reviews, and an AI chatbot that invents answers about purchases.
7. Brand, navigation, and visual design
Use a configurable brand placeholder, YOUR_PUBLISHING_BRAND, until the owner supplies a name. The public brand or pen name can differ from the legal merchant identity required by a payment provider. Required legal disclosures and receipts must remain truthful.
Design a polished editorial bookstore:
- Warm paper background #F7F3EA, ink #182A27, forest accent #23584B, subdued copper #9B5C36.
- Verify actual foreground/background combinations for contrast; tokens are starting choices, not a contrast guarantee.
- A readable serif heading face and clean sans-serif interface face, with properly licensed fonts and local hosting where practical.
- Consistent spacing scale of 4/8/12/16/24/32/48/64 px; content width around 1200 px.
- Book covers maintain their natural aspect ratio using object-fit: contain. Never crop a book title or hide the edges of printable previews.
- Cover assets should be optimized, sharp, and accessible. Do not generate covers or illustrations without a separate asset requirement.
- Restrained hover transitions; reduced-motion support; no autoplay, compulsory animation, or loading-heavy 3D bookshelf.
- Minimum comfortable touch targets around 44 px; visible keyboard focus; semantic headings and form labels.
- On mobile, a sticky purchase bar is acceptable if it does not obscure content or device controls.
Public navigation: Books · Collections · Free sample · Reader Club · Help · My library. Hide Collections if the catalog does not justify it. Footer: About, Contact, reading help, Privacy, Terms, Refunds, preferences, and social links actually configured by the owner.
No empty leaderboard, manufactured popularity, unnecessary jargon, or permanent site-wide discount banner. Real availability and real offers only.
8. Routes and page requirements
Route	Purpose and required content
/	Featured book, approved value statement, sample CTA, actual catalog, why buy direct, help, optional signup
/books	Published catalog with category/type/format filters; sort by newest/title/price; preserve query in URL
/books/[slug]	Complete product page, sample, formats, one-time price, purchase CTA, genuine reviews, relevant suggestions
/collections/[slug]	Purpose and matching books; series order where relevant
/bundles/[slug]	Every included title/file, actual standalone-price comparison, bundle price and ownership warning
/samples/[slug]	Sanitized readable excerpt and/or a separate downloadable sample file
/free-resources	Owner-approved resources; newsletter is a separate choice unless enrollment is the stated offer
/reader-club	Benefits, conditions, preference controls, signup; do not promise unpublished benefits
/about	Approved brand/author story and contact context
/journal and /journal/[slug]	Optional owner-written articles that support discovery and reader usefulness
/checkout/return	Verified status and safe pending state; never trust a success query parameter
/orders/[public-token]	Limited order-specific access after capability verification; minimal personal information
/access	Request access to purchases using email; neutral response to prevent account enumeration
/account/library	Owned titles, downloads, device help, edition/update notes, companion resources
/account/orders	Order history, provider receipt/invoice links, payment/refund status
/account/preferences	Topic interests, email consent, frequency, export/delete request, optional profile
/help and /help/[slug]	Device and delivery guides; contact link on each article
/contact	Support form, order context, published response expectations
/legal/privacy, /legal/terms, /legal/refunds	Owner-reviewed policies reflecting actual provider and operations
/admin/*	Owner-only application; no indexing; no reliance on hidden navigation for authorization


For small catalogs, do not show empty filters or duplicate the same book in six sections. Clearly distinguish public preview, purchased digital content, and links to external retailers.
Homepage order
1. Hero with one flagship cover, concrete approved promise, Buy/View Book, and Read Sample.
2. A short explanation of what buyers receive: available formats, secure payment, access recovery.
3. Real books grouped by reader interest, with clear prices.
4. Real sample or preview images.
5. Direct-purchase benefits that are actually implemented.
6. Authentic reviews, if any; otherwise an invitation to read the sample.
7. Brand/author introduction.
8. Optional newsletter/Reader Club signup with topic selection.
9. Delivery/refund FAQ and footer.
Book page content contract
Every published book requires title, slug, cover/alt text, short description, full description, language, product type, audience, actual file formats, edition, validated page count when meaningful, table of contents or honest scope summary, sample, price/offer, delivery explanation, license, support link, and publishing eligibility status.
Explain the intended reader, what the book covers, what it does not cover, and included companion files. Reading time is optional and labeled as an estimate. Distinguish print-layout page count from reflowable EPUB pagination. Do not promise medical treatment, guaranteed financial results, or guaranteed child-development outcomes.
If no reviews exist, omit the rating summary and say no reviews yet. If no discount exists, display only the real price. If EPUB is absent, do not advertise it. External Amazon purchases do not automatically grant website ebook access.
9. Customer journeys
First purchase
Browse → sample → book or bundle → Buy Now → approved hosted checkout → checking payment → confirmed order access → download + receipt → optional account/Reader Club.
No account/password requirement before checkout. The checkout provider may require billing country or other information for its own obligations. Do not add shipping address fields for digital products.
Returning reader
Email link or verified login → owned library → fresh download link or device guide → useful companion content → relevant new release. Do not require another payment to restore an existing purchase.
Failed or delayed payment
Distinguish canceled checkout, failed payment, and pending/unconfirmed payment. If the reader might already have paid, explain that verification is in progress and offer status checking/support. Before creating a new payment attempt, reconcile the existing attempt or explicitly establish that it is terminal.
Lost purchase email
Enter email → generic confirmation → email verification/capability link → purchased titles → fresh authorized file links. Rate-limit requests and never show purchase history before email control is proven.
Book correction
Owner uploads a new immutable edition → validation → preview → release notes → choose eligible prior purchases → publish atomically → notify affected buyers once, if appropriate → readers see old purchased edition and eligible corrected edition.
Support
Reader opens help from book/order → tries instructions → submits contextual ticket → acknowledgement → owner investigates payment/download/email status → controlled corrective action → reader receives resolution. Support promises must match the owner's actual availability.
10. Payments: make this decision early
Eligibility findings
Stripe's standard merchant-country list does not include Pakistan [S29]. Lemon Squeezy lists Pakistan among bank-payout countries [S07], but eligibility is not approval of this owner or these books. Its public reviews include approval/support complaints [S10]. Treat it as a candidate to validate, not a guaranteed recommendation.
Safepay documents payment options and international reach; its services agreement describes PKR settlement [S30–S31]. It is a possible direct gateway to investigate for Pakistan-based operations. Get written confirmation of eligibility for these digital products, supported buyer countries/currencies, refunds, settlement, fees, and production activation before integrating it.
Provider decision table
Route	Use when	Responsibilities and caveats
Lemon Squeezy hosted checkout	Owner, products, bank payouts, and store approval are confirmed	Confirm merchant-of-record terms, all fees, refund workflow, allowed fulfillment, and production status
Another approved merchant of record, including Gumroad if appropriate	It accepts these books and this owner and supports the needed integration	Check current country/payout support and signed event or authoritative reconciliation capabilities; do not assume interchangeability
Safepay or another approved direct gateway	Direct gateway eligibility is confirmed and needed markets are served	Owner's tax/invoicing responsibilities differ from merchant-of-record sales
Direct Stripe	Only if the owner has a legitimately eligible business/account	Do not use false residence or borrowed accounts; country availability must be rechecked


Use hosted payment collection. Never store card numbers or CVC. Explain provider branding and receipt identity so readers recognize the charge. Ordinary owner income/accounting obligations remain outside a merchant-of-record's transaction-tax service.
P0 checkout model
Use one offer per checkout: one book or one predefined bundle. Create explicit provider product/variant mappings for every live offer. A bundle maps to one purchasable offer and expands into multiple local book entitlements.
Do not assume a provider's single-product checkout supports a general multi-product cart. P1 cart needs its own feasibility proof, tax/discount behavior, provider line-item model, and refund tests. Until then, Buy Now and curated bundles form a complete store.
Adapter contract
Implement a server-only PaymentProvider interface:
interface PaymentProvider {
  createCheckout(input: ApprovedCheckoutInput): Promise<CheckoutResult>;
  verifyWebhook(rawBody: Uint8Array, headers: Headers): VerifiedProviderEvent;
  fetchPurchase(reference: ProviderPurchaseReference): Promise<VerifiedPurchase>;
  requestRefund(input: SupportedRefundInput): Promise<RefundRequestResult>;
  getReceiptLink(reference: ProviderPurchaseReference): Promise<string | null>;
}
These are application types, not claims about any provider's SDK. Implement methods using current official documentation. Unsupported capabilities must return explicit typed errors. Map provider order IDs, product/variant IDs, statuses, prices, taxes, fees, test mode, and refund events; document the mapping. Admin order history retains the original provider, so refunds/reconciliation use the right account after a switch.
Live payment readiness
Production requires an approved account, confirmed book eligibility, successful test purchase, valid signed webhook, verified fulfillment, tested refund, configured receipt identity, and a genuine low-value live transaction under the provider's rules. Confirm a real payout reaches the owner's bank before scaling paid acquisition. A simulator does not satisfy any of these requirements.
11. Pricing and unit economics
Keep prices in integer minor units with ISO currency codes. Snapshot prices and bundle contents on purchases. Never calculate charges using floating-point arithmetic. Store charged currency and settlement currency separately; do not present browser-estimated FX as guaranteed checkout pricing.
Current documented examples, to recheck before launch:
Platform	Documented pricing fact	Source
Gumroad	Pricing page shows 10% + USD 0.50 direct and 30% Discover; fee help lists card processing of 2.9% + USD 0.30 separately	[S01–S02]
Payhip	Free: 5%; Plus: USD 29/month + 2%; Pro: USD 99/month + 0%; processor fees extra	[S04]
Lemon Squeezy	Base example uses 5% + USD 0.50; documented additions include international, PayPal, subscription, payout, and some marketing fees	[S08]


Illustrative USD 20 sale, before taxes/refunds/payout fees: Gumroad direct with the separately documented card-processing fees leaves USD 16.62; Lemon Squeezy at base fee leaves USD 18.50, or USD 18.20 with a 1.5% international addition. These are calculations from published terms, not promised take-home amounts. Provider fees can apply to tax-inclusive totals.
Use this reporting equation:
Contribution = revenue excluding tax - discounts - refunds - payment/platform fees - affiliate cost - variable fulfillment cost
Record actual provider fee data when available. If unavailable, show estimated contribution, its formula, and missing components. Never label paid gross sales as profit or bank payout.
Price offers based on actual content: book-only; book plus genuine workbook/templates; themed bundle. Do not invent enormous bonus values. A repeat-customer discount is configurable and margin-checked. Do not make discounting the only reason to join Reader Club.
12. Loyalty and customer relationships
Free Reader Club
P0 includes signup and preferences. P1 adds useful benefits: companion files, eligible correction updates, topic-specific reading guides, advance release notifications, and occasional feedback invitations. Buying a book grants its purchased resources without forcing newsletter consent.
Do not put earned customer downloads behind membership renewal. Paid memberships, if later introduced, must clearly distinguish permanently purchased books from subscription-only resources.
Email rules
Maintain separate transactional and marketing channels. Essential receipt/access messages and necessary purchase notices must remain available to buyers who decline marketing. Newsletters, upsells, abandoned checkout reminders, review solicitation, and engagement messages follow the required marketing permissions and suppression rules.
Use explicit, unchecked consent controls, timestamped consent evidence, policy version, topic preferences, a visible unsubscribe link, and provider suppression synchronization. Double opt-in is the recommended default for newsletter subscriptions. A free sample download is not automatically consent to unrelated campaigns.
Sequence	Trigger	Content	Permission / stop condition
Purchase access	Confirmed paid order	Receipt identity, book access, formats, device help	Transactional; one logical delivery job
Optional welcome	Confirmed newsletter signup	Brand introduction and requested sample/resource	Marketing opt-in; stop on unsubscribe
Optional application tip	Buyer + relevant topic + opted in, about day 3	One useful idea linked to the purchased book	Stop on unsubscribe, unresolved refund, or topic mismatch
Honest feedback request	Eligible opted-in buyer, about day 10–14	Ask for candid book feedback	No reward tied to positivity; one request
New release	Owner-approved campaign and matching interest	New title, clear offer, sample	Frequency cap and suppression check at send time
Reactivation	Opted-in reader after a configurable quiet period	A useful resource or relevant update	One attempt initially; no assumed reading activity
Purchase recovery	Verified support request	Access link and help	Transactional; not a cross-sell opportunity


A download event does not establish that a customer read or finished a book. P1 reading status is explicitly self-reported. Avoid messages claiming to know their reading progress.
Frequency default: no more than one general marketing campaign per week per subscriber, plus a carefully controlled launch sequence. Expose pause, topics, and unsubscribe. Enforce suppression when jobs execute, not only when campaigns are scheduled.
Referral and affiliate design, P1
Support creator-specific links and optional discount codes. Choose either provider-managed attribution or a local authoritative ledger per campaign; never pay twice through both. A local model uses signed attribution, an explicit attribution window, and refund-aware qualification. Do not silently track users across unrelated sites.
Commission options: percentage of clearly defined net revenue or a fixed amount. If using a 50/50 split, specify exactly which fees, refunds, taxes, and costs come out before the split. Use no automatic cash payouts initially. Owner reviews eligible balances and records payout evidence; refunds reverse commissions. Exclude self-referrals, duplicates, unverified payments, and coupon abuse.
Do not incentivize positive reviews. Referral rewards and review requests are separate processes.
13. Default architecture
For a new repository, use a modular TypeScript monolith:
Layer	Default
Web application	Current stable Next.js App Router with TypeScript; verify supported versions when implementation begins
Interface	Tailwind CSS and accessible component primitives; stable server-rendered product pages
Database	Supabase Postgres with migrations, SQL constraints, and RLS
Identity	Supabase Auth for reader email verification and owner authentication
Files	Supabase Storage: public covers/samples; private paid assets
Payments	Hosted checkout through the validated adapter
Email	Resend for transactional messages and supported marketing features, or an equivalent verified provider
Jobs	Durable Postgres outbox plus a scheduled worker; one job runner with row locking and retries
Validation	Zod at application boundaries and database constraints for core invariants
Analytics	First-party commerce events and owner reports; optional approved analytics integration
Tests	Unit/integration tests for commerce invariants; Playwright for core user journeys
Deployment	Commercially permitted managed hosting or a maintained container deployment


Supabase documents private buckets, RLS, and temporary signed download URLs [S32–S34]. Its service key bypasses RLS and must remain server-only. Signed URLs remain usable until expiry; revoking an entitlement prevents future links but cannot instantly retract an existing URL [S34].
Do not use Vercel Hobby for the commercial store: its documented restrictions permit personal/noncommercial use [S35]. Select an appropriate commercial plan or another host and confirm its current terms.
Do not add microservices, Elasticsearch, RabbitMQ, or Kubernetes for a ten-book store. Use a separate worker only where scheduled jobs or file processing require it. Keep the payment, email, and storage integrations behind small interfaces; avoid building a universal integration framework.
Suggested structure:
app/                         public, account, admin, and API routes
components/                  shared accessible UI
features/catalog/            catalog queries and publishing validation
features/commerce/           checkout, orders, refunds, entitlements
features/readers/             library and access recovery
features/marketing/           consent, segments, approved campaigns
features/support/             tickets and diagnostic actions
lib/payments/                 provider adapter and verified mappings
lib/email/                    templates and provider adapter
lib/storage/                  authorized download URL creation
lib/auth/                     reader and owner guards
jobs/                         outbox processing and reconciliation
supabase/migrations/          tables, constraints, functions, RLS
tests/                        targeted unit, integration, and E2E tests
14. Data model and invariants
Use UUID primary keys, UTC timestamps, indexes on lookup fields, foreign keys, and documented deletion behavior. All tables containing customer or operational data require RLS. The following is a schema blueprint; the implementation must produce executable migrations.
Table	Core fields and rules
brand_settings	Single owner-controlled row; public brand fields separated from private configuration
profiles	Auth user ID, display name, role; role assigned only server-side, never editable by readers
customers	ID, optional auth user ID, normalized email, created time; do not strip Gmail dots or plus aliases
books	Slug unique, metadata, type, audience, status, cover/sample refs, publishing rights/exclusivity state
collections / book_collections	Collection metadata and ordered membership
editions	Book ID, immutable version label, release notes, release date, status, compatibility/update policy
assets	Edition ID, format, private storage key, MIME, byte count, SHA-256, processing status
offers	Book or curated bundle, currency, minor-unit price, state, update policy; never inferred from client input
offer_items	Offer-to-book/edition eligibility; snapshot into each order, not live lookup at fulfillment
provider_offer_mappings	Provider, store/account identifier, provider product/variant ID, offer ID, test/live flag; unique mappings
checkout_attempts	Random ID, offer/price snapshot, provider ref, state, expiry, minimal session binding
orders	Provider purchase ID unique per provider/account, customer, charged currency, totals, tax, payment/refund state
order_items	Purchased offer and expanded book/edition snapshots; preserve history if catalog changes
entitlements	Customer, book, originating order item, allowed editions/policy, active/revoked state
webhook_events	Provider/account, event name, deduplication key, payload reference/hash, processing state, error
refunds	Order, provider refund reference, amount, currency, affected order items, pending/confirmed state
download_sessions	Entitlement/asset, authorized-at time, request-group identifier, status; issuing URL is not completed download
access_tokens	Hashed token, scope, order/customer reference, expiry/revocation, used-at where applicable
subscriptions	Email marketing status only at P0; call it newsletter_subscriptions to avoid billing ambiguity
consent_events	Customer/email, purpose, action, timestamp, source, policy version; immutable evidence
email_jobs	Template/purpose, recipient ref, idempotency key, state, retries, provider message ID
campaigns	Approved draft content, audience predicate, scheduled-at, state, owner approval time
reviews	Book, customer, verified purchase ref if applicable, rating, text, moderation state, timestamp
support_tickets	Customer/order ref, category, subject, status, messages, internal notes separated from reader view
analytics_events	Allowlisted event, pseudonymous session/customer ref when permitted, offer/book ID, campaign metadata
outbox_jobs	Job type, unique logical key, payload, attempts, lease, next run, terminal error
audit_log	Owner action, entity, before/after reference, timestamp; no secrets or unbounded PII


P1 tables: wishlists, reading_status, resource_access, referral_attributions, commission_ledger, gift_claims. Paid subscription tables are separate P2 scope.
Hard invariants
1. A payment success redirect cannot create a paid order or entitlement.
2. One verified provider purchase has one local order; retries do not duplicate entitlements or access emails.
3. A customer can have access through multiple independent purchases. Revoking one refunded purchase must not erase another valid entitlement.
4. An entitlement represents access rights; a signed file URL represents short-term delivery. They are different records.
5. Changing an offer's price/content never rewrites a historical order.
6. A full refund revokes future access from that purchase after provider confirmation. A partial goodwill refund preserves access by default unless an item-specific policy says otherwise.
7. Unpublishing a title hides future sales but retains prior legitimate purchase access unless the owner has a documented lawful reason otherwise.
8. Deleting an account does not silently destroy records that must be retained for accounting; implement documented retention/anonymization behavior.
9. Marketing consent is not inferred from purchase, free download, account creation, or provider customer creation.
10. The admin role cannot be granted through a customer-controlled field, signup payload, or editable JWT metadata.
15. Payment and fulfillment implementation
Checkout creation
1. Receive an offer ID and supported campaign metadata; validate everything server-side.
2. Verify live publication rights, asset readiness, provider mapping, currency, and current offer state.
3. Calculate only documented server-approved pricing; reject client-submitted prices or arbitrary variant IDs.
4. Create a checkout attempt with immutable offer, book, edition, and price snapshots.
5. Create the provider checkout. Supply an opaque internal attempt ID as correlation metadata where supported.
6. Use an allowlisted return URL and a supported hosted checkout. Never allow client-supplied open redirects.
7. Avoid serial requests for every catalog field; keep the critical checkout path small.
Verified webhook processing
Lemon Squeezy documents request signatures and limited retry delivery [S36–S37]. Implement its actual documented headers and raw-body verification, not a copied handler for a different provider.
1. Enforce body-size limit and verify the signature against exact raw bytes before parsing or mutating data. Compare signatures safely.
2. Validate store/account, live/test mode, event type, provider order identity, purchased variant, currency, and payment state. Correlation metadata alone is insufficient proof of purchase.
3. Persist the verified event durably using a documented deduplication strategy. Some providers may not supply a unique delivery event ID; use a stable provider-specific key, and independently enforce business-level order uniqueness.
4. Return success only after the event is durably accepted. Process through the worker with retries; a persisted event cannot be lost if the server stops.
5. In one database transaction, upsert the paid order, insert order items, grant entitlements, and enqueue one logical access-email job.
6. Handle refunds, disputes, and reversals monotonically. A delayed paid event cannot resurrect a refunded/revoked purchase.
7. Use authoritative provider fetches to resolve ambiguity and out-of-order events. Never grant access solely because the amount matches.
8. Record failures for owner inspection and safe replay. Do not expose webhook payloads to readers.
Return page and guest access
The checkout return verifies status from the server's order state, with a bounded reconciliation call if needed. Browser/provider overlays are UX signals, not proof. Poll briefly, then show a stable pending/support screen.
Use a cryptographically random order capability token or verified session to show order details. Store only token hashes. A provider purchase ID or predictable URL is not authorization. Support hosted-checkout redirects that cross devices without assuming the original browser cookie survives; email verification is the recovery path.
Reconciliation
Schedule a job that checks stale pending checkouts and verified but unprocessed events. Query provider orders by documented references, and use a time cursor with overlap to find missing records when supported. Run all recovered orders through the same fulfillment function. Keep reconciliation provider-scoped, paginated, rate-limited, and observable.
Refunds and disputes
Owner initiates supported refunds through the original provider, or records a provider-dashboard action for reconciliation. Show refund_pending until authoritative confirmation. Invalidate new download grants according to the actual refund/item policy. A chargeback can suspend relevant access while investigated. Record the reason, affected items, and audit action. Reconcile revenue and referrals after confirmation.
Already-downloaded files cannot be remotely erased. Do not imply that refund revocation achieves this.
16. Files, editions, previews, and download access
Upload and publication
Direct uploads go to private quarantine using scoped upload authorization. Validate filename, extension, MIME, actual file signature, maximum size, checksum, PDF readability, and EPUB structure where offered. Use a malware-scanning step before publication; implement explicit processing/failure states. Paid uploads must never enter the public cover/sample bucket.
Recommended configurable initial limits: PDF/EPUB up to 100 MB each; covers up to 5 MB. These are application choices, not provider limits. Offer resumable uploads if actual file sizes require them. Do not proxy large uploads through a small request-body limit unnecessarily.
Require a separate public sample asset or a deliberately extracted excerpt. Hiding full-book pages in a frontend viewer is not secure previewing. Strip unsafe HTML and active content from displayed excerpts. EPUB reading must not execute embedded scripts.
Owner publishing checks: cover present, metadata complete, sample approved, formats match validated assets, files ready, offer/provider mapping valid, rights declaration confirmed, and exclusivity status checked.
Edition policy
Paid assets are immutable: write a new storage object for every corrected version. Preserve the purchased edition. Corrections to the same edition can be granted to prior buyers; substantive new editions are a separate policy. Display that policy before purchase. Do not promise all future books or perpetual service uptime.
Before notifying customers, display eligible recipient count and preview release notes. Use a unique release/customer job key to prevent duplicate notices. Necessary correction notices contain no bundled promotion. Optional feature/news announcements obey marketing preferences.
Download authorization
- Server checks a verified reader session or scoped capability, active entitlement, requested asset, and allowed edition.
- Return a short-lived signed URL, initially five minutes. The customer can request another URL without repurchasing.
- Keep paid storage keys and credentials out of public catalog responses.
- Apply rate limits to URL generation; do not impose an arbitrary tiny lifetime download quota on legitimate readers.
- Support Range requests where storage/CDN permits. Do not treat every range fetch or email scanner request as a new human download.
- Log download_url_issued accurately. Claim download_completed only if the delivery infrastructure supplies dependable evidence; otherwise report access attempts.
- Sign URLs only at click time; email links should lead to an authenticated recovery/order page, not an already-expired raw file URL.
- Use HTTPS, sensible content disposition, safe filenames, private cache behavior, and a no-referrer policy on access pages.
Optional PDF watermarking can add a masked customer identifier/order reference in margins, after visual validation. Avoid adding a child's information or broadly exposing buyer email addresses. Show the policy in advance. Watermarking must not obscure artwork, worksheets, or accessibility. Do not claim piracy prevention or block copying with CSS as a security measure.
17. Device compatibility and printable books
Reader need	Required help
Phone/tablet	Explain PDF vs EPUB and compatible reading apps; clear save/open instructions
Kindle	Link to current Amazon Send to Kindle instructions; EPUB/PDF are accepted by that service [S38]
Desktop	Download/open PDF; recommend an EPUB reader only if a compatible EPUB exists
Kobo/other reader	Provide tested transfer guidance for actual offered files; do not promise untested devices
Printing worksheets/coloring pages	State page dimensions, color/line-art distinction, recommended print settings, personal-use license


Do not label raw EPUB USB transfer as universal Kindle support or claim Kindle store purchases are synchronized with this website. Send to Kindle conversion/layout can vary. Do not ask for Amazon passwords. Initial Kindle flow is download the file and follow Amazon's own upload guide.
For illustrated/printable previews, allow zoom and full image view; maintain the original page shape. Provide adjacent colored/reference and line-art views only when those files exist. Clearly distinguish digital printable purchase from an Amazon paperback link.
18. Owner administration
Provide /admin with these working sections:
Section	Owner actions
Overview	Verified sales, refunds, access failures, pending payments, support queue, job health
Books	Create/edit metadata, categories, draft preview, publish/unpublish, exclusivity status
Files and editions	Upload, validate, preview, release notes, retain versions, grant eligible updates
Offers/bundles	Price and currency, included titles, provider mappings, sample disclosure, real sale schedule
Orders	Search by customer/order/provider ID; distinguish payment, delivery, refund, payout information
Customers	Purchased books, consent/topic status, support history, export/request handling
Support	Read/reply/update tickets, investigate diagnostics, resend access, initiate verified corrections
Reviews	Publish/reject with auditable moderation reason; do not hide reviews solely for low ratings
Email	Edit templates, preview/test, draft segments, approve/schedule campaign, pause/cancel
Reporting	Revenue/refunds/contribution, cohort repeat purchases, book/campaign funnel, CSV export
Settings	Public brand, legal pages, support contact, integration readiness, feature flags


Publishing forms must work without code edits. Secrets stay in the deployment secret manager; the settings page shows connection readiness and masked identifiers, not editable raw API keys stored in public configuration.
Use protected server authorization for all actions. Require owner MFA and recent authentication for destructive actions/refunds/large exports. Record admin access and changes. Protect the only owner account from accidental removal. Never seed a universal admin password or infer owner privilege from an email submitted by the browser.
Campaigns begin as drafts. Scheduling/sending requires an explicit owner action, recipient preview, consent/suppression check, and a test message. Purchasing a book never triggers an unapproved mass campaign.
19. API and server actions
Use route handlers or server actions consistently. Suggested contracts:
Endpoint/action	Authorization	Behavior
GET /api/catalog	Public	Published safe metadata only; paginated/filtered
POST /api/checkouts	Guest/session, rate-limited	Valid offer to hosted checkout; server snapshots and validates
POST /api/webhooks/[provider]	Verified provider signature	Durable accept and process verified payment events
GET /api/checkouts/[id]/status	Bound session or scoped proof	Minimal payment/access state; no customer data leakage
POST /api/access/request	Public, rate-limited	Neutral response; send verification only to submitted email
POST /api/access/claim	Scoped, verified token	Exchange for secure limited session; prevent scanner-triggered consumption
POST /api/downloads	Reader session/capability	Recheck entitlement and issue signed URL
GET /api/me/library	Reader	Active access plus eligible editions/resources
POST /api/newsletter/subscribe	Public, rate-limited	Record opt-in intent, preferences, and confirmation
POST /api/newsletter/unsubscribe	Signed unsubscribe capability	Immediate suppression; handle provider one-click semantics
POST /api/support	Public/reader, rate-limited	Ticket; validate order association and avoid spam
POST /api/reviews	Verified reader	One genuine book review per customer; verified badge only when justified
/api/admin/*	Owner server guard + MFA as applicable	Catalog, refunds, campaigns, diagnostics, exports
POST /api/jobs/run	Scheduler secret or equivalent	Lease/retry pending jobs; never an unauthenticated public trigger


Return typed error codes and readable messages. Validate input length, UUIDs, currency, URLs, and ownership. Protect cookie-authenticated mutation routes against CSRF and cross-origin requests. Webhooks use signature verification rather than browser CSRF tokens. Redact secret tokens and personal data from logging.
Email verification/access links must tolerate mail scanners: GET may show a safe landing page, but should not consume a single-use credential or perform an irreversible action. Exchange on explicit confirmation/POST or use a documented equivalent authentication flow. Restrict redirect destinations to the site.
20. Reporting, SEO, and discovery
Commerce metrics
Metric	Definition
Paid conversion	Unique verified paid orders / eligible storefront sessions; specify period and attribution
Checkout completion	Verified purchases / distinct checkout attempts, with delayed purchases reconciled
Average order value	Paid order merchandise value excluding tax, with currency and refund treatment shown
Delivery reliability	Eligible paid orders with successful entitlement creation / eligible paid orders
Access failure rate	Failed authorized access attempts / authorized access attempts; distinct from file transfer completion
Repeat buyer rate	Customers with two or more separate paid orders / paid customers; state time window
Cohort repeat purchase	First-buy cohort purchasing again within 30/60/90 days; only mature cohorts included
Subscriber-to-buyer	Confirmed subscribers with a paid purchase / confirmed subscribers; specify attribution window
Contribution	Recorded net revenue minus recorded variable costs; show estimates/missing fees separately
Support load	Tickets per 100 orders; categorize payment/access/device/content


Use actual transactional database records for revenue. Analytics scripts are not the financial ledger. Exclude test transactions, staff traffic, known bots, and duplicate events. Do not combine different currencies without a documented dated exchange rate. Email opens are unreliable and should not be the primary success measure.
Events: book_viewed, sample_opened, checkout_started, purchase_verified, access_recovery_requested, download_url_issued, newsletter_confirmed, review_submitted, and repeat_purchase_verified. Never send email addresses, capability tokens, private file URLs, or payment details to analytics platforms.
SEO requirements
Server-render indexable public book pages. Set unique titles/descriptions, canonical URLs, social previews, XML sitemap, robots directives, breadcrumbs, and helpful collection pages. Use appropriate Book/Product/Offer structured data only when it matches visible content and real offer availability. Add aggregate ratings only from actual published reviews.
Noindex account, order/access, admin, checkout, preview drafts, and duplicate query-filter pages as appropriate. Robots/noindex is not access control. Use stable slugs and redirects when changing them. Journal articles must be useful original content, not mass-produced keyword pages. No ranking guarantees.
21. Security, privacy, publishing rights, and policies
This section defines product controls. Legal policy wording and obligations must be checked for the actual seller, countries, provider, and content before launch.
Publishing and Amazon
Amazon says KDP Select requires digital exclusivity during enrollment; ordinary KDP publishing is distinct from Select [S39–S40]. Store rights declarations per title: wide, kdp_select, unknown, plus owner-confirmed effective dates and evidence reference.
- If unknown, block direct digital sale until owner confirms eligibility.
- If active kdp_select, block new direct digital checkout, bundles containing it, free full-book distribution, gifts, and new promotional access grants. Do not merely hide Buy Now on the page.
- Any permitted sample/excerpt must be reviewed against current terms; do not assume that arbitrary preview length is allowed.
- Keep an external Amazon link if configured. Do not treat a renamed PDF or alternate digital file format as an exclusivity workaround.
- Require resolution of existing direct-download availability before the owner enrolls a title in Select. Do not automatically revoke historical readers or enroll titles from this application.
- Require explicit publishing eligibility review before restoring direct sales after a restriction ends; do not infer enrollment has ended solely from a local date.
Core security
- Deny-by-default RLS; readers access only their own customer/order/entitlement records.
- Public catalog uses a safe view/serializer; never expose draft files, order metadata, or internal notes.
- Service-role keys and provider/email secrets stay server-side and out of bundles, migrations, screenshots, or exports.
- Private file buckets, signed short-lived delivery links, authorized asset lookup, and immutable uploads.
- Rate limits on checkout, login, recovery, downloads, newsletter, support, and review routes.
- Content Security Policy, secure cookies, safe URL handling, upload validation, and sanitized rich text.
- Admin MFA, scoped actions, audit records, and dependency/security updates.
- No customer-readable database permissions to create paid orders, change prices, grant access, or alter consent evidence.
Privacy and consent
Collect only needed information. Avoid collecting children's names, birthdates, photos, accounts, or behavioral profiles: children's books are purchased by adults. Adults supply their own contact/payment details. No child-targeted marketing or public child-content upload.
Publish a clear privacy policy stating services used, data purposes, retention, contact, and applicable rights process. Support marketing unsubscribe, reasonable data export, and deletion/anonymization requests with legal retention exceptions. Only load nonessential tracking when permitted. The coding agent must not invent compliant-looking legal text and declare the store legally approved.
Refund and license policy
Describe how customers request help/refunds, how the chosen provider handles them, and access consequences. Do not default to an absolute no-refunds claim that ignores mandatory rights or provider rules. Where instant digital supply requires a specific consent/acknowledgement, use the approved provider flow or implement reviewed controls for the actual markets.
Default personal-use license: reading on the buyer's devices; personal household printing only where product permits; no redistribution/resale. Separate organization/classroom licenses are future explicit offers. Do not display a copyright year/owner or third-party asset license without verification.
22. Reliability and operations
Use persistent jobs, with exponential retry, leases/row locks, a maximum retry count, dead-letter visibility, and an owner retry action. Ensure only one logical notification is queued, and reconcile ambiguous email-provider responses before resending when possible. Do not promise exactly-once external delivery under every network failure.
Monitor: payment/webhook errors, processing backlog, entitlement failures, email bounce/complaint/suppression, authorization failures, storage availability, support queue, backup results, and stale pending orders. Show real states in admin; do not fabricate provider uptime or payout availability.
Suggested initial service objectives, to validate rather than promise blindly:
- Entitlements available within 10 seconds of accepting a verified paid event under normal load.
- Order return page moves to a useful stable state within 30 seconds, including a pending explanation when necessary.
- Public pages target good Core Web Vitals: LCP ≤2.5s, INP ≤200ms, CLS ≤0.1 at the 75th percentile when enough field data exists.
- Support response target chosen by owner, for example two business days; publish only after operational confirmation.
Back up the database and private object files separately; do not assume a database backup includes storage bytes. Maintain checksums and a storage manifest. Initial recovery goals: RPO 24 hours and RTO one business day; implement and test a restore to isolated staging before launch. Restrict backup access and retention, and budget for backups and egress.
Provide an operations runbook for: paid/no-access complaint; incorrect checkout email; rejected/failed email; wrong book file; provider outage; missing webhook; confirmed refund; compromised owner account; file rollback; and full restore. Recovery actions must recheck order identity and authorization, not grant access based solely on an unverified support email.
23. Performance, accessibility, and empty states
Use responsive cover images, reserve dimensions to prevent layout shift, cache public catalog pages safely, and never cache personalized library responses publicly. Paginate owner lists. Use basic indexed database search before adding a separate search service.
Target WCAG 2.2 AA for the interface: keyboard access, focus management, readable contrast, labeled errors, meaningful alternative text, reduced motion, and no inaccessible drag-only actions. Test critical flows at 360 px mobile width, 200% zoom, keyboard-only, and screen-reader basics. Accessibility of the actual PDF/EPUB files is a separate publication check.
Every data surface needs loading, empty, success, and error states. Important examples:
- Empty library: explain recovery and browsing, not an alarming error.
- No matching books: clear filters.
- No reviews: honest empty state.
- Invalid/expired link: offer secure recovery.
- Provider unavailable: pause purchases with a helpful message; existing downloads remain accessible where possible.
- Failed file processing: owner sees the cause and next action; product cannot be published.
- Missing integration credentials: admin readiness shows incomplete; customer checkout is disabled in production.
24. Costs, effort, and viability
These are planning allowances, not live vendor quotes. Verify official current pricing and commercial-use terms before selecting plans. USD amounts exclude taxes, card/platform fees, marketing, ebook production, and developer labor.
Item	Lean production allowance	Notes
Domain	USD 10–30/year	Extension/registrar/renewal affect cost
Commercial hosting	USD 15–40/month	Account for functions, scheduled jobs, traffic, and commercial eligibility
Database/auth/storage	USD 25–50/month	Backups, storage and download traffic can add usage costs
Email	USD 0–20/month initially	Sending limits, daily caps, and marketing features need verification
Monitoring/backups/processing	USD 0–20/month initially	Scope and retained logs affect cost
Initial recurring envelope	Approximately USD 40–130/month	Budget range; some bundled services overlap
Payment costs	Variable per actual provider terms	Include international, refund, payout, and affiliate costs


Illustration: USD 60 fixed monthly cost and USD 17 contribution per sale needs four sales to cover that fixed cost, before acquisition and labor. This is arithmetic, not a sales forecast.
Rough effort for one experienced developer with AI assistance: 4–6 weeks for a careful P0, plus external approval delays. A proof-of-concept can be faster; secure live payment/recovery/refund integration and quality checks still need completion. P1 can take another 2–4 weeks depending on features. Start with two published books and one honest bundle rather than build every optional feature before learning from buyers.
Weekly owner work: clear support queue, reconcile refunds/errors, review conversion and repeat purchases, publish useful content, inspect consent/email health, verify files after updates, and check costs. Loyalty depends partly on these operations and book quality, not website features alone.
25. Implementation milestones
Milestone 0 — repository and payment feasibility
Inspect existing project or initialize stack. Define brand configuration, env schema, adapter boundary, publication rights fields, and seed fixtures. Confirm payment eligibility path before committing to a provider-specific live flow. Record unresolved owner inputs. Configure production so it cannot start accepting payments with simulator settings.
Acceptance: reproducible local start; documented credentials; no exposed secrets; launch blockers explicit; one payment candidate's required capabilities documented from official sources.
Milestone 1 — catalog and complete storefront
Implement database schema/migrations, public catalog, book/bundle pages, previews, help/legal shells, responsive UI, and owner metadata administration. Use development fixtures clearly marked. Complete safe public serializers and initial RLS.
Acceptance: owner creates a draft, previews it, supplies validated assets, and publishes/unpublishes it; public users cannot read drafts or private file keys. One-book and ten-book layouts both work.
Milestone 2 — payment, orders, and access
Implement real adapter in test mode, durable webhook ingestion, transaction-based fulfillment, safe return page, guest capabilities, account library/recovery, private downloads, and transactional email.
Acceptance: successful test purchase grants only the correct content; duplicate/reordered events are safe; pending/failed/canceled checkout is truthful; lost email can be recovered; email failure does not remove access.
Milestone 3 — owner operations and relationships
Implement refund reconciliation, edition updates, support diagnostics, newsletter confirmation/preferences/unsubscribe, approved email jobs, authentic review handling, and basic finance/funnel reports.
Acceptance: correction updates preserve prior access; confirmed refund changes only affected rights; unsubscribed readers get no campaigns; owner can inspect retry failures and restore recovery from a backup exercise.
Milestone 4 — production readiness
Run security/accessibility/performance checks, validate actual assets and policies, configure domain/email authentication/monitoring/backups, verify payment activation, and execute live smoke tests under provider rules.
Acceptance: Section 28 checklist passes, with any exceptions explicitly accepted by owner. No claimed successful checkout, payout, restore, or deliverability result without evidence.
Milestone 5 — P1 based on actual demand
Add features in order: useful resources/preferences → improved cohort reporting → Reader Club value → referrals/gifts → extra checkout methods or multi-item cart. Defer full reader and discussion systems until there is measurable need.
26. Tests that matter
Use local fakes for repeatable adapter failure scenarios, signed fixtures for webhook verification, and provider test mode for real integration. Do not place live payment credentials or customer data in tests.
Test	Required result
Valid paid event	Exactly one order and correct entitlements; one logical access-email job
Duplicate webhook / simultaneous replay	No duplicated order, access, commission, or logical email job
Invalid signature / wrong store / wrong mode	No commerce mutation
Tampered client price/variant	Rejected; server-approved mapping governs checkout
Return URL says success without proof	No entitlement; verified pending/failure state
Delayed webhook	Safe pending UI; reconciliation creates access when provider confirms
Refund arrives before delayed paid event	Later event does not restore refunded access
Full vs partial refund	Whole-purchase revocation vs documented retained/item-level rights
Same book bought through two valid orders	Refunding one does not revoke the other
Email outage	Library/order access works; job retries safely
Expired capability or file URL	Secure recovery; no repurchase required
Guessed order ID / cross-customer access	Denied even with a valid reader session
Broken/malicious file	Cannot publish; owner sees processing failure
Corrected edition	Purchased edition retained; eligible new edition accessible
KDP Select/unknown rights title	Direct checkout, bundle and new free full-book grant blocked server-side
Newsletter unsubscribed after scheduling	Suppressed at execution; legitimate receipt still works
Email scanner opens verification link	Does not consume access or trigger destructive actions
Unauthorized admin request / role escalation	Denied; customer cannot edit role
Production simulator configuration	Startup/checkout fails closed
Database + storage restoration	Orders, entitlements, and actual file bytes available in isolated staging
Mobile keyboard/screen-reader purchase	No hidden controls, obscured content, or inaccessible errors


End-to-end smoke flows: browse → sample → test checkout → access → recovery → library; owner upload → validate → publish → correction; refund → reconciliation → entitlement policy; newsletter confirm → preferences → unsubscribe. Keep browser tests focused on these user outcomes.
27. Environment and developer handoff
Document environment variables, separating public values from secrets. Example names:
APP_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
PAYMENT_PROVIDER=
PAYMENTS_LIVE_ENABLED=false
LEMONSQUEEZY_API_KEY=
LEMONSQUEEZY_STORE_ID=
LEMONSQUEEZY_WEBHOOK_SECRET=
RESEND_API_KEY=
TRANSACTIONAL_FROM_EMAIL=
MARKETING_FROM_EMAIL=
SUPPORT_EMAIL=
JOB_RUNNER_SECRET=
OWNER_AUTH_USER_ID=
Use actual current SDK/API configuration names as needed; this list does not prescribe outdated provider variables. Never put secret values in NEXT_PUBLIC_*. Dev simulator is selected separately and permitted only in explicit development/test environments.
Handoff must include local install/run commands, migration/seed commands, test commands, build/deploy commands, how to configure provider webhooks and offer mappings, how to verify the email domain, how to establish the first owner, how to publish a book, and recovery runbooks. Seed data must be development-only and use a safe dummy email domain.
If exact SDK behavior is uncertain, consult current official docs and prove the integration with a test; do not invent endpoints, webhook names, cart capabilities, or refund permissions.
28. Launch checklist
- [ ] Public brand, contact details, actual books/covers, prices, samples, and metadata are owner-approved.
- [ ] Rights are verified per title; Amazon Select restrictions handled across all grant paths.
- [ ] PDF/EPUB/printable files open correctly; format/device claims are tested.
- [ ] Actual checkout provider account/products/payout method approved; hosted checkout working.
- [ ] Test/live isolation and verified webhook signatures work; simulator blocked in production.
- [ ] Payment success, pending, canceled, refund, missed-event, and duplicate-event cases pass.
- [ ] Guest access recovery, customer library, fresh downloads, and support paths work.
- [ ] RLS/admin security/MFA/private storage verified; no secret leakage.
- [ ] Email domain authentication and access messages tested; bounce handling and marketing suppression work.
- [ ] Policies reviewed for actual operation; no fabricated endorsements or legal approval claims.
- [ ] Mobile/accessibility/performance checks completed; previews are not cropped.
- [ ] Monitoring, cost alerts, backups, storage backups, and isolated restore exercise completed.
- [ ] Owner can publish/update/refund/support without editing code.
- [ ] Real low-value transaction and payout validation completed before scaling acquisition.
29. Owner inputs still needed
The coding agent can start local development without these. Obtain them before the dependent production step:
Input	Why needed	Interim behavior
Brand/domain/pen name	Public identity and domain/email setup	Configurable placeholder, no legal-name insertion
Actual book files/covers/descriptions	Publication and honest product pages	Labeled development fixtures; no live sale
Per-title rights and KDP Select status	Direct sale/distribution eligibility	Unknown status blocks purchase/grants
Chosen approved payment account	Real charging/refunds/payouts	Dev simulator only; production disabled
Actual prices/currencies/offer contents	Offer mapping and checkout	Development-only sample prices
Legal merchant/support details and policies	Checkout identity and customer rights	Draft policy shells marked incomplete
Email account/domain credentials	Reliable delivery and marketing	Local email preview; no pretend sending
Owner authentication user	Protected administration	Documented secure bootstrap procedure
Allowed Reader Club benefits/cadence	Truthful retention offer	Minimal signup/preferences without invented benefits


Do not request all inputs again if they already exist in the repository or approved project configuration. Do not use optional branding preferences as a reason to stop implementing independent work.
30. Definition of done and coding-agent completion report
The initial build is done when the P0 flows operate on real persisted data, meaningful tests pass, owner administration works, and the application can be deployed with explicit integration readiness checks. A public-money launch is a separate state requiring payment approval, correct content, and the launch checklist.
Report:
1. Implemented public, reader, and owner functionality.
2. Validation completed and any tests not run.
3. External configuration still required, with exact setup instructions.
4. Actual production readiness; no conflating demo checkout with payment integration.
5. Known limitations, including chosen provider/cart restrictions, device testing, and cost assumptions.
6. Next useful P1 feature based on observed usage, not a list of unrelated additions.
31. Sources and verification notes
Sources accessed during research on 7 October 2026 UTC / 8 October 2026 in Pakistan. Prices, country support, software interfaces, restrictions, and reviews can change. Recheck relevant official sources immediately before implementation and launch. URLs are provided so this file remains useful outside ChatGPT.
Commerce platforms and reviews
- S01: Gumroad pricing — documented direct/Discover rates and merchant-of-record positioning.
- S02: Gumroad fee help — processing additions, fee details, and reporting. Consult alongside the shorter pricing page.
- S03: Gumroad public reviews — self-selected reports; not verified prevalence.
- S04: Payhip pricing — plans, processor fees, and stated transaction-tax coverage.
- S05: Payhip FAQ — supported product formats and payment handling.
- S06: Payhip public reviews — individual support/usability reports and review collection context.
- S07: Lemon Squeezy supported countries — Pakistan appears in bank-payout support; not owner approval.
- S08: Lemon Squeezy fees — transaction/payout/marketing additions and a tax-inclusive worked example.
- S09: Lemon Squeezy webhook API — official integration entry point.
- S10: Lemon Squeezy public reviews — approval/support reports; allegations are not independently established.
- S11: Shopify Digital Products help — delivery, files, and access considerations.
- S12: Shopify Digital Products app and reviews — merchant reviews; app identity/content can change.
- S13: SendOwl Shopify integration — delivery and checkout/account access paths.
- S14: SendOwl app and reviews and five-star review page — contrasting pricing and correction-workflow reports; older reports clearly dated.
- S15: Sellfy features — commerce, customization, marketing, and security feature claims.
- S16: Sellfy public reviews — relevant administration/analytics reports; irrelevant used-phone and shipping reports excluded from ebook conclusions.
- S17: Podia digital downloads — connected downloads, account, and resource features.
- S18: Podia public reviews — individual support and integrated-experience reports.
- S19: BookFunnel vendor-authored WordPress plugin documentation — reader help, delivery logging, refund behavior, and duplicate integration warnings. Main BookFunnel pages could not be fetched reliably, so these claims use the documented plugin source.
- S20: StoryOrigin pricing/features — reader magnets, direct sale delivery, and marketing functions.
- S21: StoryOrigin testimonials — vendor-hosted, not independent evidence of business outcomes.
- S22: WooCommerce virtual/downloadable products — virtual product setup and download configuration.
- S23: WooCommerce digital/download handling — protected downloads, access, and updating file behavior.
Author websites
- S24: J.F. Penn Books ebook catalog — observed collections and bundles.
- S25: J.F. Penn Books FAQ — customer-facing download/device explanation.
- S26: The Creative Penn digital bundle — actual companion-product packaging, not a price recommendation for this owner.
- S27: James Clear homepage — sample/newsletter placement.
- S28: Atomic Habits book page — companion guide and reader-bonus pattern; no copying of text or endorsements.
Payment, infrastructure, and publishing documentation
- S29: Stripe global availability — standard merchant-country availability; recheck at launch.
- S30: Safepay payments — documented local/international payment offering; individual merchant eligibility requires confirmation.
- S31: Safepay services agreement — settlement terms, including PKR settlement; owner must review actual agreement.
- S32: Supabase bucket fundamentals — private/public models.
- S33: Supabase Storage access control — RLS and service-key behavior.
- S34: Supabase serving downloads — signed URLs and expiry/revocation limitations.
- S35: Vercel Hobby plan and terms — noncommercial-use limitation.
- S36: Lemon Squeezy signing requests — signature verification.
- S37: Lemon Squeezy webhook requests — acknowledgement and limited retries.
- S38: Amazon document transfer help and Send to Kindle — supported transfer formats and official customer tool.
- S39: Amazon KDP Select — digital exclusivity explanation.
- S40: KDP Select enrollment requirements — exclusivity during enrollment; distinguish from ordinary KDP.
- S41: Resend marketing emails — unsubscribe handling; verify current contacts/segments API before coding.
The product architecture, priorities, table schema, service objectives, cost allowances, tests, and milestones are recommendations developed for this owner. They are not vendor guarantees, independently measured conversion improvements, legal opinions, or revenue forecasts.