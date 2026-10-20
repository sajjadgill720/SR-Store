# Interactive bundle showcase

The homepage box-set illustration is now an interactive product preview.

- Select either illustrated book to lift it from the slipcase and reveal its description, included formats, individual price, and sample/details links.
- Hover lifts a cover; pointer movement adds a subtle perspective tilt.
- Book buttons support Tab/Enter/Space and left/right arrow selection. Closing the preview returns focus to its book without moving the page.
- Touch targets work on narrow layouts. Checked widths include 1440px, 390px, and 320px, with no horizontal document overflow.
- CSS respects reduced-motion preferences by removing animated transitions and tilt.
- The illustration uses the existing paper, charcoal, and burgundy palette, with page edges, a bookmark, restrained shadows, and an ambient highlight.
- Kept actual catalog content and pricing. No generated assets or external services were needed.

Validation: production build passed; TypeScript and focused ESLint passed. Browser checks covered selecting both books, keyboard switching, close/focus restoration, responsive width, and opening the selected book’s actual sample page.

[Desktop preview](desktop-preview.jpg)
