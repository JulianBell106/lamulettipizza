# La Muletti Pizza — Stalliq PWA · Project Log

**Repo:** `JulianBell106/lamulettipizza`
**Demo:** https://stalliq-demo.netlify.app (noindex, nofollow)
**Platform:** Stalliq by Endoo Limited
**Customer:** La Muletti Pizza (Daniele + Danielle, Milton Keynes)

---

## Roadmap Status

| # | Phase | Status |
|---|-------|--------|
| 01 | PWA & Ordering | ✅ Complete |
| 02 | White-label Config | ✅ Complete |
| 03 | Firebase Backend | ✅ Complete |
| 04 | Kitchen Dashboard | ✅ Complete |
| 05 | Real-time Order Status | ✅ Complete |
| 06 | Geofence Notifications | ⏳ Queued |
| 07 | Flash Sales & Broadcasts | ⏳ Queued |
| 08 | Offers & Coupons | ⏳ Queued |
| 09 | Loyalty Stamp Card | ⏳ Queued |
| 10 | WhatsApp Order Alerts | ⏳ Queued |
| 11 | Pre-order Time Slots | ⏳ Queued |
| 12 | Vendor Self-Service | ⏳ Queued |

---

## Session Log

### Session 13 — Mobile UX Polish + Desktop Hero/Menu Fixes
**Files changed:** `index.html`

#### Desktop CSS fixes (4 changes)
1. Hero title size: `clamp(36px, 3vw, 46px)` → `clamp(44px, 4.5vw, 68px)` — more commanding at desktop widths
2. Hero title line-height: `1.05` → `1.0` — tighter tracking at display size
3. Hero content top padding: `80px 60px 0` → `36px 60px 0` — text vertically centred in hero
4. Menu section top padding: `.d-menu-inner` `100px 60px` → `56px 60px 100px` — closes gap between hero and menu

#### Mobile UX improvements (13 changes)

**CSS (9):**
1. `.m-card-desc` → Cormorant Garamond italic 15px weight 300, line-height 1.45 — biggest single win, replaces DM Sans 12px
2. `.m-story-body` → Cormorant Garamond 17px weight 300, opacity 0.70
3. `.m-payment-note` → Cormorant Garamond italic 16px weight 300, opacity 0.65
4. `.m-socials-note` → Cormorant Garamond italic 17px weight 300, opacity 0.65, line-height 1.6
5. `.m-basket-item` border opacity: `0.12` → `0.20` — more visible item separation
6. `.m-founder-avatar` → circular gold ring with Playfair initial (matches desktop pattern), replaces emoji
7. `.m-basket-total` padding: `16px` → `20px`
8. `.m-btn` top margin: `8px` → `16px` — more separation from basket total
9. `.m-eyebrow` — new class added; gold uppercase label with `::after` rule line, matching desktop eyebrow pattern

**Hero:**
10. Overlay gradient darkened at top: `rgba(26,10,0,0.3)` → `0.5`; bottom `0.85` → `0.88`
11. `.m-hero-title` font size: `32px` → `36px`

**Account:**
12. `.m-acct-section-label` letter-spacing raised to `0.18em`

**HTML (4):**
1. Menu page: `<div class="m-eyebrow">Fresh to order</div>` added above section header
2. Find Us page: `<div class="m-eyebrow">Come find us</div>` added above section header
3. About page: `<div class="m-values-grid"></div>` removed entirely
4. Socials note: exclamation mark removed — period only

---

### Session 12 — Colour Refresh & UX Audit
**Files changed:** `index.html`

- `--fire` shifted from `#C8410B` (orange, HSL 19°) to `#C4271A` (true red, HSL 5°) — aligns with La Muletti brand
- `--ember` follows as a brighter red hover
- `--text-muted` raised from opacity 0.45 → 0.55 (WCAG AA contrast fix)
- Full mobile UX audit documented; 13-point improvement plan agreed

---

### Sessions 1–11 — Foundation

- **Sessions 1–2:** PWA scaffold, mobile layout, menu rendering from config, basket, order confirm screen
- **Session 3:** White-label `config.js` architecture; all content (menu, branding, SEO, events, founders) driven from single config object; CSS custom properties injected at runtime
- **Sessions 4–5:** Firebase backend — Firestore order submission, Phone Auth flow, daily sequential order references via Firestore transaction, test number (+44 7700 900001 / 123456)
- **Session 6:** Kitchen dashboard — separate Netlify site, real-time Firestore listener, order status controls (Accept / Preparing / Ready / Collected / Cancel)
- **Session 7:** Real-time order status on customer side — live Firestore listener updates confirm screen and account page
- **Session 8:** Order history — account page shows past orders with detail sheet (bottom sheet on mobile, modal on desktop)
- **Session 9:** Desktop site — full editorial desktop layout (hero, menu grid, story, how it works, contact/events, footer, basket panel, account panel)
- **Session 10:** Desktop polish — scroll reveal animations, noise texture utility, nav scroll behaviour, diet badge system
- **Session 11:** Dietary badges (CSS pills replacing emoji circles), menu card images, `noindex, nofollow` on demo URL

---

## Architecture

### Key files
| File | Purpose |
|------|---------|
| `index.html` | Customer PWA — all HTML + CSS; JS loaded from `/js/` |
| `js/config.js` | Single source of truth — all vendor content and branding |
| `js/firebase.js` | Firebase init, auth helpers, Firestore order write |
| `js/app.js` | All app logic — menu render, basket, auth flow, order status |
| `kitchen.html` | Kitchen dashboard — separate deployment |
| `js/kitchen.js` | Kitchen logic — real-time order listener, status controls |

### Firebase
- Project: `stalliq`
- Phone Auth enabled — test number: `+44 7700 900001` / code `123456`
- Firestore structure:
  - `orders/{orderId}` — order documents
  - `vendors/lamuletti/counters/daily` — daily sequential ref counter

### Hosting
- Customer PWA: Netlify (continuous deploy from `main`)
- Kitchen dashboard: Netlify (separate site, same repo)
- GitHub → Netlify auto-deploy on push (~30s)

---

## Design Tokens

```css
--fire:   #C4271A   /* primary red — CTAs, accents */
--gold:   #D4A043   /* gold — eyebrows, prices, nav active */
--cream:  #FDF6EC   /* primary text */
--dark:   #1A0A00   /* page background */
--char:   #2C1A0A   /* panel / card background */
--smoke:  #5C3D1E
--ember:  #D93B25   /* red hover state */
--ash:    #8B6347   /* muted text */
```

**Typography:**
- `Playfair Display` — headings, prices, hero titles
- `Cormorant Garamond` — descriptions, story body, editorial italic text
- `DM Sans` — UI labels, buttons, navigation

---

## Next Sessions

| Session | Task |
|---------|------|
| 14 | Live location broadcast — kitchen GPS toggle, Firestore write, customer real-time listener, Google Maps Embed on Find Us |
| 15 | Real phone auth go-live — App Check, production domain, Blaze plan, real-handset test |
| 16 | Pitch deck update — Stalliq rebrand, kitchen co-pilot angle, roadmap slide |

---

## Session Startup Pattern

> "New session — ignore the project file attachment, read the live PROJECT.md from GitHub instead:
> https://raw.githubusercontent.com/JulianBell106/lamulettipizza/refs/heads/main/PROJECT.md
> Today we're working on [task]"

⚠️ Raw GitHub URLs sometimes cached — if content looks wrong, paste file directly into chat.
