# Knovera UI refresh — 12 October 2026

Removed the independent-book-studio subtitle, announcement, footer branding, and site metadata. Broadened homepage, community, footer, and about-page copy to books, ideas, discovery, and readers. Actual book titles, catalog categories, circle identifiers, and guided content remain intact.

The shared interface now uses a consistent sans-serif hierarchy, brighter blue actions, cool neutral surfaces, translucent sticky navigation, rounded cards, and restrained hover feedback. The homepage, catalog, library, cart, and access pages inherit the shared design. Book-reading themes retain their existing behavior.

Community has a desktop navigation rail with real personal counts, an account card, an illustrated welcome banner, interest cards, a conversation feed, search/filter controls, discovery cards, and reply avatars derived from display names. Mobile uses a compact account panel, horizontally scrollable circles, a single-column feed, and existing bottom navigation. No fake membership, engagement counts, notification badges, urgency, or new interaction mechanics were added.

All existing authentication, public-post/reply, moderation, storage, sync, journal, commerce, and library logic is retained. Presentation changes include renaming the visible All conversations tab to Discover while preserving the original filter state; the featured catalog sorting label is now Knovera picks while retaining its original value.

Validation: TypeScript and production build passed; focused lint passed; 11 community/server/storefront tests passed. Browser checks confirmed account controls, search, bookmark toggles, and the Saved filter. Temporary bookmarks were restored. Community and library have no horizontal document overflow at 320px and 390px. Desktop checked at 1440px. Temporary viewport overrides were reset.

Screenshots: `ui-desktop.png`, `ui-mobile.png`, `ui-feed.png`, `library-ui-mobile.png`.
