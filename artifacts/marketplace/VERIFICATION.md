# Homepage marketplace refresh — 12 October 2026

Amazon-inspired shopping layout with Knovera branding: navy header, prominent category-aware search, amber actions, horizontal department navigation, a mint book showcase, four discovery tiles, a product shelf, a featured title panel, and reading/access guidance.

Content comes from the existing published catalog. Starting price is calculated from published non-bundle books. Prices, category links, product links, samples, saved books, library, community, and support lead to existing routes. No fabricated discounts, ratings, inventory urgency, or additional products are introduced.

Homepage presentation is scoped through the header's active pathname and RouteChrome's `data-market` attribute, respecting Next.js retained inactive pages. Other pages retain their existing navigation and styling. Product cards reuse existing save and detail/sample actions. Mobile department and product shelves scroll within their own containers.

Validation: TypeScript and focused lint pass; six storefront regression tests pass; production build passes. Browser search for `atomic` opens `/books?category=&q=atomic` with one matching book. The regular catalog header and colors return after navigation. Desktop checked at 1440px; mobile at 390px and 320px has no document overflow. Screenshots: `home-desktop.png` and `home-mobile.png`. Temporary viewport override reset after verification.

Commerce remains in its existing development state, including test checkout and demo downloads.
