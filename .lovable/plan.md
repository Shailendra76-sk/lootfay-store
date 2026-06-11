# LootBazaar Multi-Page Upgrade Plan

## Pages (new routes)
- `/` Home — top trending deals (existing storefront, trimmed)
- `/categories` — filter grid by Electronics / Fashion / Home / Gadgets
- `/blog` — static tips & hacks articles (3–4 starter posts)
- `/about` — support email, UPI donation QR, social handles, affiliate disclosure

## Shared Header
- New `SiteHeader` component with `BrandLogo` + nav links (Home, Categories, Blog, About) using `<Link>` with `activeProps`
- Mounted in `__root.tsx` so it appears on every page
- Replace the current sticky Amazon-style header on `/` with the shared one (search bar moves into Home + Categories pages as a section, not header — keeps header clean across pages)

## Top Banner Fix
- Replace `LiveTicker` (simulated user notifications) with a clean marquee: "🔔 Join our WhatsApp group for instant 24/7 loot deal alerts! 🔥"
- Single horizontal scrolling line, links to WhatsApp

## Affiliate Disclosure
- Under main H1 on home: small muted line — "LootBazaar.in is an Amazon Associate. We may earn a commission from qualifying purchases at no extra cost to you."
- Also on About page in full

## Share Button on Product Card
- New `ShareDealModal` component (uses existing `Dialog` from ui)
- Buttons: WhatsApp, Facebook, Telegram, Copy Link
- WhatsApp message template: `Look at this amazing deal on LootBazaar! {title} is now available at ₹{price}. Check here: {affiliateUrl}`
- Share button placed top-right on card (next to bell), `e.stopPropagation()` + `e.preventDefault()` so card click still works

## Fully Clickable Card
- Wrap entire `<article>` in `<a href={affiliateUrl} target="_blank">` (or make the article an `<a>`)
- Bell + Share buttons inside use `e.preventDefault(); e.stopPropagation();`
- Keep the visible "Buy on Amazon" button at bottom (high contrast already)

## Logo + QR fixes (from "yha par logo nhi dikh rha")
- `BrandLogo` already falls back to SVG wordmark if `/custom-logo.png` 404s — verify file exists; if not, default to SVG (no broken img)
- `DonationCard` QR: same pattern — if `/donation-qr.png` 404s it falls back to generated QR. Verify and keep fallback robust.

## Files to create
- `src/components/site-header.tsx`
- `src/components/share-deal-modal.tsx`
- `src/components/scrolling-banner.tsx` (replaces LiveTicker on home)
- `src/routes/categories.tsx`
- `src/routes/blog.tsx`
- `src/routes/about.tsx`

## Files to edit
- `src/routes/__root.tsx` — mount `SiteHeader`
- `src/routes/index.tsx` — trim old header, use shared header, swap ticker for scrolling banner, add disclosure under H1
- `src/components/product-card.tsx` — wrap in anchor, add Share button, stopPropagation on inner buttons
- `src/components/brand-logo.tsx` — already robust, no change needed unless image missing

## Out of scope
- No backend/schema changes
- No new dependencies (use existing `Dialog`, `lucide-react` icons)
