# Knovera interface refinement — 19 October 2026

Used the reverse-engineer-anything skill and REA `capture_browser_scenario` to open the public Apple and Linear homepages in a temporary, headless Edge browser at 1440 × 1000. Captured screenshots and accessibility output after a two-second settling period. No accounts or private application interfaces were accessed.

## Observed references

- https://www.apple.com/ — compact navigation, a large product stage, short headline, generous whitespace, and paired primary/secondary actions. Evidence: `ev_dd1c670c055b3d4bdc1110a9bafa1d960dea4975ba80dde2bc321252ad240bac`.
- https://linear.app/ — restrained navigation, large tightly spaced sans-serif heading, muted supporting text, fine borders, and a prominent product interface panel. Evidence: `ev_533cefcb7efea9f11037c21dbd3d7d9e8b30a6c1bd2e4d74dad5b335c237c226`.

These are viewport observations, not recovered design tokens or proof of either site's full behavior. Reduced-motion capture was used; animation timing was not measured. REA reported complete requested captures, with browser-host platform/architecture unobserved. Browser screenshots are evidence of presentation, not original source reconstruction.

## Adaptation

Knovera retains its own ivory, burgundy, and editorial identity. Added a final, scoped stylesheet (`app/refinement.css`) for quiet navigation, clearer action hierarchy, a spacious featured-book stage, subtle card borders, responsive layout, focus indicators, and reduced-motion support. Existing user edits to the motion provider and base stylesheet are preserved.

Simplified homepage copy to welcome readers across subjects. The title count uses catalog data. Existing book links, samples, wishlists, carts, caching, authentication, and payment code remain in place. No Apple or Linear logos, product illustrations, or proprietary fonts were copied.

Removed 30-day money-back claims from the homepage, book-detail FAQ/trust copy, sample conclusion, and About page. Replacement copy points to support and the published refund policy rather than promising an automatic refund. The pre-existing 14-day policy on the refunds page is unchanged; this design task does not amend that policy.

## Preview checks

REA captured the local homepage at desktop 1440 × 1000 and mobile 390 × 844. No page-error events were captured in either observation window. Final desktop evidence: `ev_ca97da16215dff94943c7915e4e7fb877c715ad7615aa4f95e36fee4c9e032aa`; mobile evidence: `ev_13d4cf073a1faed00e9739d3e81d8cdce8d06c16730003dddd0f472601c15edb`. Production build and TypeScript checks passed.

## Follow-up: readers, color and rotating imagery

The homepage uses everyday first-name reader profiles (Aisha, Daniel, Sara and Omar), explicitly labelled illustrative profiles rather than customer endorsements. The catalog heading does not assume a fixed number of titles. Its button count, grid, slide counter and progress markers derive from the current books array.

Added soft lavender, sage and peach surfaces alongside the existing ivory and burgundy. The featured-book stage gently turns the existing cover image and cycles through all catalog books every seven seconds. Title, price, formats, sample link and detail link update together. Previous/next controls stop automatic playback; a playback control resumes it. Hover, keyboard interaction and a hidden document prevent advancement. Reduced-motion users get a static image and manual navigation. A zero- or one-book catalog does not render rotation controls or start a timer. No new database requests are used for rotation.

REA desktop evidence `ev_210afa851cc7fc4358928f53d53a17305f8502b4c5e2d43e362568be906d9e3e` observed the first and second books across an eight-second wait, with no captured page errors. Mobile reduced-motion evidence `ev_4797e81a527b084b34ccd93d9532149a45eb4f1ac29d4754cc548306095b15e9` observed a successful Next click changing the slide and no captured page errors. Production build, TypeScript and focused component lint passed.
