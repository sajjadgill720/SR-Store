# KNOVERA PRESS — DESIGN SPECIFICATION
**Concept:** "The Store is a Digital Goods Imprint" — Typeset & Printed, Not Templated  
**Version:** 1.0.0 (Master Visual Architecture)  
**Status:** Awaiting Art Director Approval  

---

## 1. Executive Summary & Design Philosophy

The KNOVERA Press storefront is conceived not as an e-commerce template, but as a living octavo volume. Every viewport is treated as a printed recto or verso spread: defined by generous margins, hairline typographic rules, strict bibliographic hierarchy, running heads, folios, marginalia, dot leaders, and colophons.

Decoration is never borrowed from software UI kits (no gradient blobs, glassmorphism, blur cards, neon halos, or icons enclosed in colored circles). All aesthetic richness originates from five centuries of bookbinding and typographic craftsmanship: tactile paper tone, letterpress ink density, book spines resting on a wooden library shelf, perforated dispatch slips, and postmarks stamped in dilute ink.

---

## 2. Locked Token Palette

Color in this system is strictly limited to paper stocks, printer inks, cloth bindings, and a single amber accent mark per screen.

### 2.1 The Paper Foundations (Surfaces)
| Token Name | Hex Code | HSL / CSS Var | Purpose & Application |
| :--- | :--- | :--- | :--- |
| `--paper-page` | `#F1ECE3` | `hsl(38, 26%, 92%)` | Main body background (unbleached rag paper). |
| `--paper-card` | `#F7F3EB` | `hsl(40, 36%, 95%)` | Secondary reading surfaces, book spreads, sidebars. |
| `--paper-raised` | `#FCFAF6` | `hsl(40, 50%, 98%)` | Elevated slips, floating dispatch tickets, inputs. |
| `--paper-rule` | `#E4DCCE` | `hsl(39, 27%, 85%)` | 1px hairline rules, folios, leader dots, dividers. |

### 2.2 The Inks (Typography & Primary Structure)
| Token Name | Hex Code | HSL / CSS Var | Purpose & Application |
| :--- | :--- | :--- | :--- |
| `--ink-primary` | `#1A1815` | `hsl(36, 11%, 9%)` | Deep printer ink: titles, running heads, solid buttons. |
| `--ink-muted` | `#5F594F` | `hsl(37, 9%, 34%)` | Secondary bylines, marginal notes, catalog metadata. |
| `--ink-faint` | `#8A7B66` | `hsl(36, 15%, 47%)` | Leader dots, bracket notations, disabled states. |

### 2.3 The Singular Accent
| Token Name | Hex Code | HSL / CSS Var | Purpose & Application |
| :--- | :--- | :--- | :--- |
| `--amber-mark` | `#E8A317` | `hsl(39, 82%, 50%)` | Strictly limited: bookmark ribbon notch, focus halo, single fleuron. Max 1 focal point per view. |

### 2.4 Cloth Tones (Book Spines, Stamps, & Slip Linings Only)
| Token Name | Hex Code | Purpose & Application |
| :--- | :--- | :--- |
| `--cloth-deep` | `#3A342C` | Dark buckram cloth book spine, circular postmark ink. |
| `--cloth-umber` | `#8A7B66` | Muted umber book spine, edition labels. |
| `--cloth-sand` | `#D9CFBD` | Natural linen book spine, table of contents indicator. |
| `--cloth-cream` | `#F2ECE0` | Archival vellum book spine. |

---

## 3. Typography & Typesetting Conventions

Only two typefaces are used throughout the entire platform. No exceptions.

### 3.1 Font Families
1. **Cormorant Garamond** (`var(--font-editorial)`):
   - Used for: Display headlines, section numerals (I, II, III), book titles on spines and covers, drop caps, price numerals, folios (`p. 042`), and running heads.
   - Weights: 400 (Regular), 400 Italic, 600 (Semibold), 700 (Bold).
   - Numerals: Set with `font-variant-numeric: oldstyle-nums tabular-nums;` wherever numbers appear in running prose, catalog tables, or order ledgers.
2. **DM Sans** (`var(--font-sans)`):
   - Used for: Body reading text, button labels, small caps bylines, metadata definitions, forms, and system feedback.
   - Weights: 400 (Regular), 500 (Medium), 700 (Bold).

### 3.2 Typesetting Hierarchy & Scales
| Level | Font & Weight | Size / Line-Height | Tracking / Style | Application |
| :--- | :--- | :--- | :--- | :--- |
| **Headline XL** | Cormorant 600 | `72px` / `1.05` | `-0.03em` | Book detail title, major editorial moments |
| **Headline L** | Cormorant 600 Italic | `48px`–`56px` / `1.1` | `-0.02em` | Section headers ("Notes from the press.") |
| **Headline M** | Cormorant 600 | `28px`–`34px` / `1.2` | `-0.015em` | Drawer headings, order slip titles |
| **Running Head** | DM Sans 700 | `11px` / `1.0` | `+0.16em` Small Caps | Top banner title & bibliographic references |
| **Folio / Marker** | Cormorant 600 | `13px` / `1.0` | Tabular oldstyle | Page numbers (`p. 018`), Roman indices |
| **Drop Cap** | Cormorant 700 | `3 lines` (~`72px`) | Margin float | Initial letter of book description |
| **Marginal Note** | Cormorant 400 Italic | `13px` / `1.45` | Superscript anchor | Right gutter marginalia commentary |
| **Body / Prose** | DM Sans 400 | `15px` / `1.65` | `normal` | General descriptions, about texts |
| **Colophon Label** | DM Sans 700 | `11px` / `1.0` | `+0.12em` Small Caps | Definition terms in colophon lists |

---

## 4. Signature Elements & Components

### 4.1 Header = The Running Head
- **Structure:**
  - Full-width `1px` hairline border on bottom (`#E4DCCE`).
  - **Left:** `KNOVERA PRESS` in small-caps, tracked `0.16em`, font-size `11px`, deep ink `#1A1815`.
  - **Center:** Current section title in *Cormorant Garamond Italic* (`The Catalogue`, `Volume Detail`, `The Reader's Circle`).
  - **Right:** The Folio page index (e.g., `p. 001` on home, `p. 014` on catalog, `p. 042` on detail, `p. 088` on cart) formatted in tabular Cormorant numerals, accompanied by the cart counter in brackets `[ 02 ]`.
- **Navigation (The Table of Contents):**
  - Directly beneath the running head sits a horizontal bibliographic index line:
  - `I. Catalogue ········ II. Community ········ III. Colophon ········ IV. Library`
  - Uses true dot leaders (`········`) in faint umber, never modern button pills.

### 4.2 Catalogue = A Shelf, Not a Card Grid
- **The Book Shelf (Default View):**
  - Books stand vertically as tangible spines on a single continuous wooden/hairline shelf rule (`#D9CFBD`).
  - **Spine Dimensions:** Varied realistic cloth widths (`32px`, `40px`, `48px`, `56px`) and heights (`230px`, `260px`, `285px`, `300px`).
  - **Spine Finishes:** Buckram black (`#3A342C`), Raw umber (`#8A7B66`), Bookbinder's sand (`#D9CFBD`), Archival cream (`#F2ECE0`).
  - **Spine Typography:** Vertical title in Cormorant Garamond (`writing-mode: vertical-rl; transform: rotate(180deg);`), with author in tiny DM Sans caps at the heel, and ribbon bookmark at the head.
  - **Interactive Micro-Motion:**
    - On hover, the spine slides upward `16px`, tilts `2deg`, and the cover face peeks out smoothly beside it (`transition: 300ms cubic-bezier(0.2, 0.8, 0.25, 1)`).
    - Exposes a keyboard-accessible name (`aria-label="Book title by Author"`).
- **The Index Toggle ("Shelf / Index"):**
  - A subtle small-caps switch (`Shelf / Index`).
  - When switched to **Index**, books render as a classic printed index table:
    - Columns: Roman Numeral, Title, Author, Format, Year, Price.
    - Dotted leaders extend from title to price (`Atomic Architectures ························· $18.50`).

### 4.3 Book Covers
- **Physical Proportion & Geometry:**
  - Strict `2:3` aspect ratio.
  - Maximum `2px` border-radius (books have sharp cut cloth and board corners, never bubbly UI radiuses).
  - Left edge has a `1px` lighter highlight to mimic light catching the spine groove (`rgba(255, 255, 255, 0.4)`).
  - Right edge has a subtle two-line stacked-page edge (`box-shadow: 2px 0 0 -1px #E4DCCE, 4px 0 0 -2px #D9CFBD`).
  - Shadow: A short, warm, grounding shadow (`0 10px 14px -8px rgba(60, 48, 30, 0.35)`).
- **The Bookmark Ribbon (Wishlist / Saved):**
  - When saved/wishlisted, a vertical amber ribbon (`#E8A317`, `10px` wide) hangs over the top edge of the cover, finished with a classic notched V-cut bottom.

### 4.4 Book Detail = A Double-Page Spread
- **Layout Structure:**
  - Implements an open folio spread on desktop (`grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr)` with a central fold rule).
- **Left Page (The Plate):**
  - High-resolution frontispiece cover.
  - Bibliographic imprint below: Edition statement (`First printing · Limited digital release`), file weight, DRM-free certificate badge.
- **Right Page (The Text):**
  - **Title:** `72px` Cormorant Garamond, leading `1.05`.
  - **Byline:** Set in DM Sans small caps with bullet points.
  - **Opening Description:** Features a traditional 3-line drop cap styled in Cormorant Garamond with amber tint.
  - **Marginalia:** The wide right gutter houses 1 to 2 marginal notes set in `13px` Cormorant italic with superscript roman anchors (`¹`, `²`), referencing deep focus and systems craft.
  - **Purchase Block:** Printed ledger slip with formats, instant acquisition button in solid ink `#1A1815`, and sample chapter link.
  - **The Colophon:** A closing definition list with dot leaders:
    - `Typeface ··············· Cormorant Garamond & DM Sans`
    - `Format ················· DRM-Free EPUB 3 & Print-Ready PDF`
    - `Pages ·················· 240 Typeset Pages`
    - `ISBN ··················· 978-1-95432-102-5`

### 4.5 Newsletter = The Dispatch as a Posted Letter
- **Visual Formulation:**
  - Rendered as an archival folded dispatch envelope and subscription slip.
- **Left Side (The Letter):**
  - Eyebrow: `KNOVERA PRESS · DISPATCH SERVICE`
  - Headline: `Notes from the press.` (Cormorant `64px`–`84px`, with *`the press.`* in flowing italic).
  - Editorial note describing private subscriber access.
  - Social verification: `4.9 out of 5 · 4,200+ thoughtful readers` with 5 amber stars.
- **The Perforation Divide:**
  - A vertical dashed perforation line (`border-right: 1.5px dashed #D9CFBD`) with half-circle punched notches (`14px` diameter) at top and bottom, mimicking a tear-off ticket.
- **Right Side (The Postal Slip):**
  - Label: `Dispatch No. 27` stamped in small caps.
  - **The Circular Postmark:** SVG postmark stamp rotated `-8deg`, rendered in dilute deep ink (`rgba(26, 24, 21, 0.14)`), with curved circular path text: `★ KNOVERA PRESS · EDITORIAL DISPATCH · EST. 2026 ★`.
  - **Underline-Only Input:** An archival blank line (`border: none; border-bottom: 1.5px solid #1A1815; background: transparent;`) with italic label `"Where should we send it?"`.
  - **The Postal Seal Button:** Solid deep ink `#1A1815`, rectangular with crisp corners, text `Join the list →`.
  - Small caps privacy guarantee under a hairline rule.

### 4.6 Cart = The Order Slip
- **Format:**
  - Styled as an official accounting ledger or printer's invoice.
  - No rounded cards or bubbly tags.
  - Hairline dividing rules separating each item.
  - Item quantities in tabular Cormorant Garamond.
  - Dot leaders connecting title to price (`The Focused Mind ··················· $19.99`).
  - Total enclosed within a classic bookkeeper's double hairline rule (`border-top: 1px solid #1A1815; border-bottom: 3px double #1A1815;`).

### 4.7 Footer = The Colophon
- **Structure:**
  - Centered small-caps colophon block:
    ```
    TYPESET IN CORMORANT GARAMOND AND DM SANS.
    PRINTED ON ARCHIVAL RAG PAPER #F1ECE3.
    PUBLISHED BY KNOVERA PRESS, INDEPENDENT IMPRINT.
    ```
  - Centered amber fleuron SVG mark (`❦`) as the sole decorative punctuation.
  - "Back to top" navigation formatted as: `↑ Return to the first page`.

---

## 5. Depth, Elevation, and Surfaces

Depth in print is subtle and tactile, never atmospheric neon or blurred glass.

1. **Rules, Not Boxes:** Grouping is achieved primarily through horizontal hairline rules (`1px solid #E4DCCE`) and whitespace, rather than stacked rounded containers.
2. **Paper Shadows:** When an element floats (e.g. an elevated ticket slip or open book cover), the shadow is warm and directional:
   `box-shadow: 0 4px 16px -4px rgba(60, 48, 30, 0.08), 0 1px 3px rgba(60, 48, 30, 0.04);`
3. **Strict Radii Scale:**
   - Books and slip tickets: `2px` (razor-cut paper edges).
   - Form inputs and action buttons: `14px` (subtly smoothed printer stamps).
   - Large master panels: `28px`.
   - **Prohibited:** Generic 8px or 12px pill shapes, glassmorphism blur, circular floating icon badges.

---

## 6. Restrained Motion Design (Print Physics)

- **The Ink-In Reveal:** Major display headings reveal on initial view using an ink-bleed clip path:
  `clip-path: inset(0 100% 0 0); animation: inkIn 450ms cubic-bezier(0.16, 1, 0.3, 1) forwards;`
  Staggered across nested lines by `60ms`.
- **Spine & Cover Hover:** Spines slide up `16px` with a gentle `2deg` tilt; buttons depress `1px` on click with zero elastic bounce.
- **Reduced Motion:** If `prefers-reduced-motion: reduce` is active, all clip-paths, transforms, and tilts are strictly disabled; elements render static immediately.

---

## 7. Responsive Breakpoints & Adapting Print

| Breakpoint | Viewport Width | Behavior & Print Reconfiguration |
| :--- | :--- | :--- |
| **Desktop** | `>= 1280px` | Full double-page spreads, horizontal library shelf with vertical titles, right gutter marginalia. |
| **Tablet** | `768px – 1279px` | Shelf remains standing with horizontal drag/scroll; marginalia collapse below main body text with dashed connector rules. |
| **Mobile** | `< 768px` (360px+) | Spines recline into an intuitive horizontal swipe shelf with sticky shelf baseline; double-page spread folds into vertical page succession; perforation line on dispatch turns from vertical to horizontal with side ticket notches. |

---

## 8. Do’s and Don’ts

| Aspect | DO | DON’T |
| :--- | :--- | :--- |
| **Lines** | Use `1px solid #E4DCCE` hairlines and dot leaders. | Never use heavy 2px modern borders or dashed borders unless simulating ticket perforation. |
| **Color** | Stick strictly to paper `#F1ECE3`, card `#F7F3EB`, ink `#1A1815`, and amber mark `#E8A317`. | Never use electric blues, purples, greens, or gradient fills. |
| **Typography** | Use Cormorant Garamond for display and DM Sans for UI. Honor small-caps tracking (`0.14em`–`0.16em`). | Never use system sans for book titles or omit oldstyle numbers in prices. |
| **Decorations**| Postmarks, circular stamp paths, dot leaders, drop caps, marginalia, fleuron marks. | No gradient blobs, backdrop-blur frosted glass, floating circular icons, or generic card grids. |
| **Corners** | `2px` for paper/covers, `14px` for buttons/inputs, `28px` for master card. | Never use rounded pill capsules (`999px`) or generic `8px` cards. |

---

## 9. Implementation Roadmap & Agent Instructions

All implementations will be executed progressively in small, non-destructive diffs:

1. **Step 1:** Establish root CSS tokens and hairline typographic utilities in `theme.css` and `refinement.css`.
2. **Step 2:** Refactor `Header.tsx` into the Running Head with dynamic folio, small-caps brand, and dotted leader Table of Contents.
3. **Step 3:** Refactor `Marketplace.tsx` / `Catalog.tsx` to feature the Standing Spine Book Shelf with Index table toggle and cover peek micro-interaction.
4. **Step 4:** Refactor `BookCover.tsx` to feature true 2:3 book proportions, spine groove highlight, stacked-page edge, and bookmark ribbon.
5. **Step 5:** Refactor `BookDetail.tsx` into the Double-Page Spread with drop cap, gutter marginalia, and colophon definition list.
6. **Step 6:** Refactor `Newsletter.tsx` and `Footer.tsx` into the Perforated Postal Dispatch (with SVG postmark) and the Colophon Footer with fleuron mark.
7. **Step 7:** Audit Cart (`app/cart/page.tsx`) to render as an Accounting Ledger Order Slip.
8. **Step 8:** Run `npm run build` and visual inspection at 360px, 768px, and 1280px.

---
*End of Design Specification. Awaiting user review and authorization to proceed with Step 1.*
