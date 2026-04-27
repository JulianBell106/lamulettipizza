# Stalliq — Project Bible
> Last updated: April 2026 — Session 19 (Loyalty stamp card + functional offers ✅)
> **Next sprint:** Session 20 — Go live with Daniele. Complete remaining go-live checklist items (ICO registration, Google Sheet protection, allergen disclaimer, Firestore TTL activation).
> **Pending (Julian):** ICO registration (ico.org.uk, ~£40/year) · Activate Firestore TTL policy (Firebase Console → Firestore → TTL → collection: `orders`, field: `deleteAt`) · Google Sheet header row protection · Allergen disclaimer in onboarding doc · **Publish updated Firestore rules** (firestore.rules — adds offerUsage sub-collection + stamp award write) · **Migrate offers sheet** to new schema (see Section 29).
> Read this file at the start of every session to get fully up to speed.

---

## 1. What Is This Project?

A white-label food ordering Progressive Web App (PWA) platform built for independent mobile food vendors. Each customer gets their own fully branded ordering app — no app store download required, works on any phone.

The product is built and operated by **Julian Bell** through his company **Endoo Limited**, based in Bletchley, Milton Keynes.

**Platform name: Stalliq** (stalliq.co.uk secured via HostPapa)

**Endoo Limited** is the holding company. Stalliq is the trading brand for the food platform.

---

## 2. The Team

| Role | Person |
|------|--------|
| Founder / PM / Tester | Julian Bell (Endoo Limited) |
| Developer | Claude (AI — Anthropic) |

Julian has ~30 years IT experience and a development background but no longer codes due to time constraints. He acts as product manager, tester, and business owner. Claude acts as the developer. Sessions are collaborative — Julian brings requirements and domain knowledge, Claude builds and advises.

**Working model:**
- Sessions have a clear mode: **build**, **research**, or **product thinking**
- One session = one focused task
- At the end of every significant session, update PROJECT.md
- Julian deploys via GitHub Desktop → push → Netlify auto-deploys
- Julian tests on real devices and reports findings back

**Session startup prompt:**
> "New session — ignore the project file attachment, read the live PROJECT.md from GitHub instead: https://raw.githubusercontent.com/JulianBell106/lamulettipizza/refs/heads/main/PROJECT.md — today we're working on [task]"

**⚠️ Raw URL note:** GitHub raw URLs are sometimes served cached. If Claude fetches files and the content looks wrong or outdated, paste the file content directly into chat.

---

## 3. Launch Customer — La Muletti Pizza

**Business:** Mobile wood-fired Neapolitan pizzeria, Milton Keynes
**Founders:** Daniele (Head Pizzaiolo, born Sicily) and Danielle (Operations)
**Phone:** 07951 050383
**Email:** hello@lamulettipizza.co.uk
**Facebook:** @lamulettipizza
**Website:** lamulettipizza.co.uk

**Commercial arrangement:** Free for year one in exchange for being a reference customer and providing feedback. Year two onwards moves to standard pricing. **Daniele has confirmed he wants to go ahead — meeting happened April 2026.**

**Demo site (live):** https://stalliq-demo.netlify.app/
**GitHub repo:** https://github.com/JulianBell106/lamulettipizza

> ⚠️ Demo site has `noindex, nofollow` meta tag — will not appear in search results.

---

## 4. Go-To-Market Strategy

**Target geography (years 1-3):** Milton Keynes → Bedford → Northampton
**Target customers:** Independent mobile food vendors — pizza vans, burger vans, street food trucks, market traders
**Secondary market (year 2+):** Fixed kiosk vendors (e.g. Midsummer Place MK) — commission saving angle

**Key channel — Sophie etc.:**
Sophie (sophieetc.com) runs the definitive MK food blog and organises Sophie's Street Feast. Background in marketing (ex-Bletchley Park), currently runs her own social media consultancy. Commercially literate, understands SaaS economics, knows every vendor in MK personally. Plan is to pitch a referral partnership once La Muletti is live with real data. **Commercial structure for the partnership: see Section 22.**

**La Muletti case study is the unlock — instrument analytics from day one to capture baseline vs Growth-features delta.** Without hard, quotable numbers from La Muletti's first 3-4 months, the Sophie conversation has nothing to sell with. Capture order volume, repeat customer rate, geofence impact on orders per service, loyalty card redemption rate from the moment data starts flowing — dashboard can come later but the raw data cannot be missed.

**Strategy:** Low cost, high quality, volume play. Make it impossible to say no.

**Competitor landscape:**
- **Flipdish / Slerp** — built for fixed restaurants, £59-£99+/month, not relevant to mobile vendors
- **Indi Local** — discovery/directory app, 180+ vendors across same geography, £12.50/month. Different product — potential coexistence. They are building geofence ("ice cream man effect") — listed as coming soon. We need to move fast.
- **Just Eat / Deliveroo** — up to 30% commission. Core "impossible to say no" story built around this.
- **MK Eats** — local aggregator, multi-vendor vs our single-vendor branded experience.

**Key insight:** Indi Local helps customers FIND vendors. Our product helps vendors RUN their business.

**Revenue target:** £10k/year years 1-3
**Required customers:** ~17 at blended £49/month average

---

## 5. Pricing Model

| Tier | Monthly | Annual (2 months free) | Features |
|------|---------|------------------------|----------|
| Founding Customer | 50% off chosen tier, locked for life as long as subscription continuous | — | Everything in chosen tier — first 5 customers only |
| Starter | £19 | £190 | Core ordering, kitchen dashboard, real-time status, WhatsApp alerts |
| Growth | £59 | £590 | Starter + geofence, flash sales, loyalty stamp card, event menus |
| Pro | £99 | £990 | Growth + self-service portal, analytics, pre-order slots, priority support |

**Pricing principles:**
- No setup fee on any tier
- No commission, ever — flat monthly only
- Monthly rolling, no contracts — cancel anytime
- Annual plans: 2 months free (~17% discount) — paid upfront, strong lock-in
- Founding customers: 50% lifetime discount locked in as long as subscription is continuous — cancel and re-signup loses the rate forever
- La Muletti stays on original free year 1 terms — Founding discount applies to customer #2 onwards
- Revisit prices at customer #10 — real conversion data will show which tier should be the centre of gravity

---

## 6. Current Codebase — Architecture

**Seven files — all pushed to GitHub and live on Netlify ✅**

| File | Purpose |
|------|---------|
| `index.html` | Customer app — ALL styles live here in an embedded `<style>` block. Zero hardcoded business content in HTML. |
| `css/styles.css` | Legacy file — mobile-only styles and responsive breakpoints. **Desktop styles are in index.html, not here.** |
| `js/config.js` | ALL customer-specific data lives here |
| `js/firebase.js` | Firebase initialisation — exposes `db` and `auth` globals |
| `js/app.js` | All logic — reads entirely from CONFIG, integrates Firebase |
| `kitchen.html` | Kitchen dashboard — PIN protected, separate URL. All styles embedded in `<style>` block. |
| `js/kitchen.js` | All kitchen dashboard logic |

**Key principle:** `config.js` is the ONLY file that changes between customers.

**⚠️ CRITICAL CSS ARCHITECTURE NOTE (discovered Session 11):**
ALL desktop styles for `index.html` live in the embedded `<style>` block inside `index.html` itself — NOT in `css/styles.css`. Any changes to `css/styles.css` targeting desktop classes (`.d-hero`, `.d-nav-cta`, etc.) have zero effect. Always edit the `<style>` block in `index.html` directly for desktop changes.

**Script load order:**
```
Firebase SDK (CDN compat v10.12.2) → js/config.js → js/firebase.js → js/app.js
```

**Output files location:** `/mnt/user-data/outputs/lamuletti/`

**Responsive layout:**
- Desktop (≥768px): Full scrolling landing page with basket sidebar + account panel
- Mobile (<768px): PWA app shell with **6 pages** and bottom navigation

**Mobile nav (6 items):**
🏠 Home · 🍕 Menu · 🛒 Basket · 👫 About · 📍 Find Us · 👤 Account

**Design tokens (current — updated Session 12):**
- Primary fire: `#C4271A` (true red, HSL 5° — was #C8410B orange at HSL 19°)
- Ember hover: `#D93B25` (deeper red — was #E85D2A orange)
- Accent gold: `#D4A043`
- Background: `#1A0A00` (near black)
- Light: `#FDF6EC` (cream)
- Fonts: Playfair Display, DM Sans, Cormorant Garamond

**Contrast rule:**
Secondary text must use `rgba(255,255,255,0.X)` not `rgba(cream,0.X)`. Warm cream at low opacity on warm dark backgrounds renders as brown-on-brown. White-based opacity renders as readable neutral grey.

**Contrast values (current):**
- `--text-primary`:   `rgba(253,246,236,0.95)`
- `--text-secondary`: `rgba(253,246,236,0.75)`
- `--text-muted`:     `rgba(253,246,236,0.55)`

---

## 7. La Muletti Menu

| # | Name | Price | Diet |
|---|------|-------|------|
| 1 | Marinara | £8 | VE |
| 2 | Margherita | £9 | V |
| 3 | Prosciutto e Funghi | £10 | — |
| 4 | Bella Pepperoni | £10 | — |
| 5 | Capricciosa | £11 | — |
| 6 | La Mamma Muletti | £12 | 🌶️ |

---

## 8. Full Product Roadmap

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 01 | PWA & Ordering | ✅ Done | Mobile + desktop, full order flow |
| 02 | White-label Config | ✅ Done | config.js — one file per customer |
| 03 | Firebase Backend | ✅ Done | Order submission, Phone Auth, Firestore |
| 04 | Kitchen Dashboard | ✅ Done | PIN, kanban, accept/status/drill-down, kitchen close toggle |
| 05 | Real-time Order Status | ✅ Done | Live status listener, time display, ready-state handling, diagnostics |
| 06 | Customer Account / Members Area | ✅ Done | Mobile page + desktop panel, live orders, history, drill-down, loyalty + offers placeholders |
| 07 | Google Sheets Menu Management | ✅ Done | menuSheetUrl in config.js, CSV fetch on load, graceful fallback, XSS defence via esc() |
| 08 | News & Locations Feed | ✅ Done | eventsSheetUrl in config.js, CSV fetch, Find Us page (mobile + desktop), graceful fallback |
| 09 | Offers | ✅ Done | offersSheetUrl in config.js, CSV fetch, Account page Offers section (mobile + desktop), graceful fallback |
| 10 | Walk-in Manual Order Entry | ✅ Done | "➕ New Order" on kitchen dashboard — vendor enters walk-up orders, drops into Pending column |
| 11 | Colour & UX Overhaul | ✅ Done | True red token, dietary CSS badges, deeper menu section, card left accent — Session 12 |
| 12 | Per-item Notes | ✅ Done | "Add customisation" toggle on basket lines (mobile + desktop). Notes in Firestore, kanban card, detail modal, customer order detail, walk-in modal. Session 13 |
| 13 | Customer Ready Beep | ✅ Done | Two beeps via Web Audio API (660 Hz) when status → ready. unlockAudio() on Place Order tap. firedReadyBeep guard prevents spurious beeps on load. Session 13 |
| 14 | Live Location Broadcast | ✅ Done | Full stack complete. Kitchen broadcasts GPS; customer Find Us page shows live map, kitchen status, tagline. Find Us page redesigned (mobile + desktop). Kitchen legibility pass. |
| 15 | Multi-Staff Kitchen PIN | ✅ Done | Multi-staff PIN login (SHA-256 hashed), lockout after 5 fails (15 min), staff management panel (add/rename/change PIN/deactivate), forgot PIN flow via Firebase Phone Auth. Session 15. |
| 15a | Real Phone Auth Go-Live | ✅ Done | Blaze plan, App Check (reCAPTCHA v3), authorised domain confirmed, test numbers removed, old kitchen.pin removed. Session 15b. |
| 15b | Security Hardening + GDPR | ✅ Done | Anonymous auth, Firestore rules, PIN salting, cookie notice, privacy policy. Sessions 16a/16b. |
| 16 | SMS & WhatsApp Status Notifications | ⏳ Planned | Customer notified on order status changes — Twilio |
| 17 | Geofence Notifications | ⏳ Planned | Van enters subscriber's area → phone buzzes |
| 18 | Flash Sales & Broadcasts | ⏳ Planned | Vendor launches deal in seconds, broadcasts to subscribers |
| 19 | Loyalty Stamp Card | ⏳ Planned | Digital stamp card — no paper needed |
| 20 | Flash Offers by Geolocation | ⏳ Planned | Customer in area gets notified of live deal |
| 21 | Pre-order Time Slots | ⏳ Planned | Order now, collect at chosen time |
| 22 | Vendor Self-Service | ⏳ Planned | Vendor manages own menu, events, location — full self-service portal |
| 23 | MI & Reporting | ⏳ Planned | Daily order count, revenue totals, product breakdown |
| 24 | AI Order Assist | 🌟 Vision | Customer orders in natural language — type or dictate |

**Feature backlog (future):**
- Empty basket button — `index.html` only, wires to existing `clearBasket()`. Tag onto any session with spare time.

---

## 9. Pitch Sprint Plan — La Muletti Meeting

| Session | Focus | Status |
|---------|-------|--------|
| 13 | Per-item notes + Ready beep | ✅ Done |
| 14 | Live location broadcast + Find Us redesign + kitchen legibility | ✅ Done |
| 15 | Multi-staff kitchen PIN management | ✅ Done |
| 15b | Real Firebase Phone Auth go-live | ✅ Done |
| 16a | Security hardening — anonymous auth | ✅ Done |
| 16b | Security hardening — rules, salting, GDPR | ✅ Done |
| 16c | Kitchen UI polish + bug fixes | ✅ Done |
| 16d | Mobile performance + ready beep fix | ✅ Done |
| 17 | Pitch deck v4 — 8-slide, text-stripped, redesigned Offer | ✅ Done |
| 18 | iOS/Android hardening, UX fixes, GDPR retention | ✅ Done |
| 19 | Go live with Daniele | ⏳ Next |

**What gets demoed live at the meeting:**
- Premium desktop site shown first on laptop — sets the brand tone
- Customer places order on phone (real phone number, real SMS code) → kitchen receives it instantly
- Customer adds customisation per item → kitchen sees notes
- Kitchen accepts, sets wait time → customer sees status update live
- Kitchen marks ready → customer phone beeps twice
- Vendor takes walk-up order → drops into Pending column
- **Find Us page shows van's live position on Google Map — kitchen toggles on/off**
- Account page shows loyalty stamps and offers

---

## 10. Firebase Backend — Spec

**Firebase project:** `stalliq` (stalliq.firebaseapp.com)
**Firebase account:** julian@endoo.co.uk
**Firebase SDK version:** 10.12.2 (CDN compat)
**Firebase Phone Auth test numbers:**

| Number | Code |
|--------|------|
| +44 7700 900001 | 123456 |
| +44 7700 900002 | 123456 |
| +44 7700 900003 | 123456 |
| +44 7700 900004 | 123456 |
| +44 7700 900005 | 123456 |

**Firestore structure:**
```
vendors/{vendorId}/
  kitchenStatus: "open" | "closed_busy" | "closed_end" | "closed_today"
  ownerPhone:    string  (E.164 — used for PIN reset verification, Session 15)
  counters/daily → { date, count }

  location/current → (Session 14)
    active:    boolean
    lat:       number
    lng:       number
    accuracy:  number
    updatedAt: timestamp

  staff/{staffId} → (Session 15 — multi-staff PIN)
    name:      string
    pinHash:   string  (SHA-256 hex of PIN+salt — never store plaintext)
    pinSalt:   string  (random hex salt — added Session 16a, backward compat: missing = empty string)
    active:    boolean
    createdAt: timestamp

orders/{orderId}/
  vendorId, orderRef, source, customerId, customerName, customerPhone,
  items[{ id, name, price, quantity, notes }], orderTotal, payment,
  status, waitMins, expiresAt, createdAt, updatedAt

users/{uid}/
  firstName, phone (verified), createdAt
```

---

## 10a–10d. (see previous sessions — all complete)

---

## 14a. Live Location Broadcast — Spec (Session 14)

**Kitchen side** (`kitchen.html` / `js/kitchen.js`) — ✅ COMPLETE:
- `📍 Broadcast` toggle button in header
- `broadcastActive` and `broadcastIntervalId` state vars
- `listenBroadcastState()` — real-time listener; syncs button and manages ping interval
- `toggleBroadcast()` — calls start or stop
- `startLocationBroadcast()` — GPS push + 10-min setInterval
- `pushLocation()` — Geolocation API → writes to `vendors/{vendorId}/location/current`
- `stopLocationBroadcast()` — clears interval, writes `{ active: false }`
- Button states: default = ash/muted; `.active` = green (`--s-ready`)

**Customer side** (`js/app.js` + `index.html`) — ✅ COMPLETE:
- `listenVanLocation()` — real-time listener on `vendors/{vendorId}/location/current` using compat SDK (`db.collection().doc().onSnapshot()`)
- `renderMobileVanLocation()` / `renderDesktopVanLocation()` — shows/hides map in `#m-van-location` / `#d-van-location`
- `buildMapHTML(lat, lng, updatedAt)` — live badge, italic tagline ("We are operating in this location right now — come and find us!"), Google Maps Embed iframe, age label
- `_startAgeTimer()` / `_stopAgeTimer()` — updates "Updated X mins ago" every 60s; self-cleans if element leaves DOM
- `renderFindUsKitchenStatus(status)` — writes live status pill to `#m-findus-status` and `#d-findus-status`; called from `applyKitchenStatus` so it stays live without page reload
- State vars added to Section 3: `vanLocationUnsubscribe`, `vanLocationData`, `locationAgeInterval`
- Init: `listenVanLocation()` called in DOMContentLoaded after `initKitchenStatusListener()`

**⚠️ Compat SDK gotcha (learned this session):** All Firestore calls in app.js use the compat pattern — `db.collection('x').doc('y').onSnapshot(...)` — NOT the modular `{ doc, onSnapshot }` destructuring. The two SDKs are not interchangeable.

---

## 14b. Find Us Page Redesign (Session 14) ✅

**Problem:** Contact cards (phone/email/website/Facebook) were mixed in with live location and pop-ups, making the page cluttered and burying the most important info.

**Mobile solution — priority reorder:**
Page order is now: kitchen status pill → live location map (when active) → Upcoming Pop-Ups panel → "Get in Touch" divider → contact cards. Contact is visible but clearly secondary. Sub-heading updated to "Live location · upcoming pop-ups · opening status".

**Desktop solution — split into two sections:**
- Top two-column grid: left = "Live updates" (kitchen status + van map); right = Upcoming Pop-Ups. Eyebrow changed from "Get in touch" to "Live updates".
- Below a gold rule: "Get in Touch" full-width section with 2×2 contact card grid.

**CSS classes added (all in `index.html` `<style>`):**
- `.van-location-tagline` — italic Cormorant under live badge
- `#m-findus-status` / `#d-findus-status` — kitchen status pill containers
- `.fs-dot` / `.fs-text` — shared dot + text classes for status pill (`.open` = green glow, `.closed` = red)
- `.m-findus-divider` — ruled divider with centred "Get in Touch" label
- `.m-contact-section-label` — gold uppercase label above contact cards (mobile)
- `.m-popups-section` — upgraded to gold-tinted panel with border + radius
- `.d-getintouch-wrap` — desktop Get in Touch sub-section below the two-column grid
- `#m-van-location { margin-top: 12px }` — breathing room between status pill and map
- `.page { padding-bottom: 80px }` was already correct — removed accidental override that was truncating mobile scroll

---

## 14c. Kitchen Dashboard Legibility Pass (Session 14) ✅

All changes in `kitchen.html` CSS only. Target: readable in a busy kitchen in poor light.

| Element | Before | After |
|---|---|---|
| Clock (`.k-time`) | 13px, `--ash` brown | 20px bold, 95% white |
| "KITCHEN DASHBOARD" sub | 10px, `--ash` | 10px, 40% white |
| "LIVE ORDERS" label | 11px, `--ash` | 13px bold, 85% white |
| Active count | 12px, `--ash` | 14px bold, pure white |
| Column titles (PENDING etc) | 11px | 14px bold (status colours retained) |
| Column count badges | 11px, `--ash` | 13px bold, 90% white |
| New Order button | 12px | 14px bold (gold retained) |
| Broadcast button | 12px, `--ash` | 14px bold, 85% white (green when active) |
| Customer name on card | 14px, cream | 16px bold, pure white |
| Elapsed time on card | 12px, `--ash` | 14px, 70% white (warning/urgent colours untouched) |

---

## 15. Geofence Feature — Spec

1. Customer subscribes, sets location + radius (1/3/5 miles) + notification preference
2. Cheap Android device in van pings GPS to Firebase every 60 seconds
3. Cloud Function matches van location to subscribers, fires notification to anyone in radius not notified in past 24 hours

---

## 16–17. Flash Sales + AI Order Assist — see previous sessions

---

## 18. Deployment Pipeline ✅

**Hosting:** Netlify — https://stalliq-demo.netlify.app/
**GitHub:** https://github.com/JulianBell106/lamulettipizza
**Auto-deploy:** Netlify linked to GitHub ✅

**Workflow:**
1. Claude produces files or diffs
2. Julian applies changes to local repo
3. GitHub Desktop → commit → Push origin
4. Netlify auto-deploys in ~30 seconds

---

## 19. Key Decisions Made

*(all previous decisions retained — appending Session 14 additions)*

- Live location broadcast: Firestore path `vendors/{vendorId}/location/current` — `{ active, lat, lng, accuracy, updatedAt }`
- Kitchen side writes; customer side reads via real-time listener (not polling)
- Google Maps Embed API chosen for demo — free, no billing key required, ships fast
- iOS caveat: iOS Safari kills background JS when screen sleeps — use dedicated Android in van
- Broadcast interval: 10 minutes (`BROADCAST_INTERVAL_MS = 10 * 60 * 1000`)
- `listenBroadcastState()` keeps button and interval in sync if another device toggles state
- `buildMapHTML()` URL format: `https://maps.google.com/maps?q={lat},{lng}&z=15&output=embed`
- Age timer: 60-second setInterval; stops when map hidden; cleans up if element removed from DOM
- app.js Firestore pattern: always use compat SDK (`db.collection().doc().onSnapshot()`), never modular destructuring
- Find Us page: contact details are secondary — location/status/pop-ups get first focus on both mobile and desktop
- Kitchen status is surfaced on the Find Us page (not just the home/basket pages) via `renderFindUsKitchenStatus()` called from `applyKitchenStatus()`
- Multi-staff kitchen PIN: different identities, same access level — no role tiers needed at this stage
- PIN storage: SHA-256 hashed in Firestore — never store plaintext PINs
- PIN reset: self-serve via Firebase Phone Auth (SMS code to registered owner phone) — no Julian involvement needed at scale
- PIN security: lockout after 5 failed attempts for 15 minutes; App Check (Session 15) covers the reset flow
- Empty basket button: `index.html` only, wires to existing `clearBasket()` — tag onto any session with spare time

---

## 20. Core Product Principle — Kitchen Management Co-pilot

Independent food vendors are brilliant at their craft but are not trained kitchen managers. Stalliq is a kitchen management co-pilot for people who've never had one.

---

## 21. Next Session — Session 15b: Real Firebase Phone Auth Go-Live

**Goals:**
1. Upgrade Firebase project to **Blaze plan** (pay-as-you-go — required for Phone Auth in production)
2. Add **Netlify domain** (`stalliq-demo.netlify.app`) to Firebase authorised domains
3. Enable **Firebase App Check** (reCAPTCHA Enterprise) to protect the SMS reset flow from abuse
4. Remove **test phone numbers** from Firebase console
5. Update `CONFIG.domains` in `js/config.js`

**Firestore prerequisite for Forgot PIN flow:**
Before the "Forgot all PINs?" reset flow will work, Julian must manually set the owner phone in Firestore:
- Path: `vendors/{vendorId}/ownerPhone`
- Value: owner's number in E.164 format, e.g. `+447951050383`

**How to seed Daniele's first staff document (do this once after deploying):**
1. Use "Forgot all PINs?" on the kitchen PIN screen
2. Enter Daniele's number → receive SMS code → verify → set a 6-digit PIN
3. This creates a staff doc at `vendors/{vendorId}/staff/owner`
4. Log in, open ⚙️ Staff Management, tap + Add Staff to add any additional team members
5. Optionally rename the "Owner" entry to "Daniele" via the Edit button

**Pending retest before go-live:**
> Customer order placement + phone auth — Firebase was rate-limiting during Session 16c testing. Test fresh: place an order as a customer (real phone, real SMS), confirm it lands in kitchen, accept it, advance to Ready, check Account page shows the order.

**Session startup:**
> "New session — read the live PROJECT.md from GitHub: https://raw.githubusercontent.com/JulianBell106/lamulettipizza/refs/heads/main/PROJECT.md — today we're doing Session 18: retest auth flow and go live with Daniele."

---

## 22. Sophie Partnership

| Term | Value |
|------|-------|
| Commission | 20% of gross monthly subscription |
| Duration | 24 months per customer, from their first paid month |
| Payment | Monthly via bank transfer, in arrears |
| Applies to | Customers Sophie introduces only |
| Churn | Commission stops when a customer churns |
| After 24 months | Commission ends, customer becomes full-margin |

**Timing:** Month 4-5 once La Muletti has 2-3 months of real order data.

---

## 23. Go-Live Checklist ⚠️

| # | Task | Status |
|---|------|--------|
| 1 | Firestore composite index | ✅ Created for La Muletti |
| 2 | Firestore security rules | ✅ Session 16b |
| 3 | Remove `noindex, nofollow` from index.html | ✅ Session 16b |
| 4 | Firebase Phone Auth — real domain | ✅ |
| 4a | Firebase App Check (reCAPTCHA v3) | ✅ |
| 4b | Firebase Blaze plan | ✅ |
| 5 | Remove Firebase test numbers | ✅ |
| 6 | CONFIG.vendor.id confirmed | ⏳ |
| 7 | CONFIG.domains updated | ⏳ |
| 8 | Kitchen PIN system replaced with multi-staff PIN management | ✅ Session 15 |
| 8a | Anonymous Firebase auth for kitchen (enables security rules) | ✅ Session 16a |
| 8b | PIN hash salting (per-staff random salt in Firestore) | ✅ Session 16b |
| 8c | Cookie/storage notice (PECR compliance) | ✅ Session 16b |
| 8d | Privacy policy page | ✅ Session 16b |
| 8e | ICO registration (Endoo Limited) | ⏳ Julian — ico.org.uk, ~£40/year |
| 9 | noindex on kitchen.html | ✅ Present |
| 10 | Google Sheet — protect header row | ⏳ |
| 11 | Google Sheet — vendor 2FA | ⏳ |
| 12 | Allergen disclaimer in onboarding doc | ⏳ |
| 13 | Events + offers sheet URLs in CONFIG | ✅ |
| 14 | GDPR data retention — `deleteAt` field on orders | ✅ Session 18 (code done) |
| 14a | Activate Firestore TTL policy | ⏳ Julian — Firebase Console → Firestore → TTL → collection: `orders`, field: `deleteAt` |
| 15 | Customer order placement + auth flow end-to-end retest | ✅ Session 18 |
| 16 | iOS screen lock recovery (auto-reload + session restore) | ✅ Session 18 |

---

## 25. Multi-Staff Kitchen PIN — Spec (Session 15)

**Decision:** Different identities, same access level. All staff PINs unlock the full kitchen dashboard. No role tiers at this stage.

**Firestore location:** `vendors/{vendorId}/staff/{staffId}` → `{ name, pinHash, active, createdAt }`

**PIN storage:** SHA-256 hex hash of the raw PIN — never store plaintext. Hash is computed client-side before writing and before comparison.

---

### Login flow (replaces current single-PIN screen)

1. PIN entry screen unchanged visually — staff enter their 6-digit PIN
2. On submit: hash the entered PIN → query `staff` collection for a document where `pinHash` matches AND `active == true`
3. If match found: grant access, show brief "Welcome, [name]" toast, proceed to dashboard
4. If no match: increment failed attempt counter (stored in `sessionStorage`); show error
5. After 5 failed attempts: lock screen for 15 minutes, show countdown timer

---

### Staff management panel (new — inside kitchen dashboard)

- Accessible via a ⚙️ settings icon in the kitchen header (visible once logged in)
- Lists all active staff members by name
- Actions per staff member: **Rename**, **Change PIN**, **Deactivate** (soft delete — sets `active: false`)
- **Add new staff member**: enter name + choose 6-digit PIN → writes new document to Firestore
- No "delete" — always deactivate. Keeps audit trail.
- The management panel itself requires re-entering the logged-in staff member's own PIN before making changes (prevents casual tampering on an unlocked tablet)

---

### Forgotten PIN — self-serve reset flow

**For staff:** The logged-in owner resets it from the management panel. No self-serve needed — mirrors every real workplace.

**For owner (if all PINs forgotten / locked out):**
1. "Forgot all PINs?" link on the lock screen
2. Enter the vendor's registered phone number
3. Firebase Phone Auth sends SMS code (same infrastructure as customer auth)
4. Enter code → verified → set a new PIN for yourself → logged in
5. The owner's phone number is stored at `vendors/{vendorId}/ownerPhone` (written during onboarding/setup)

---

### Security posture

| Threat | Mitigation |
|--------|-----------|
| Brute force PIN | 5-attempt lockout → 15-minute freeze |
| Stolen/guessed PIN | Deactivate that staff member immediately from management panel |
| SMS reset abuse | Firebase Phone Auth has built-in rate limiting per number; App Check (Session 15) blocks automated abuse |
| SIM swap | Out of threat model for this product — effort/reward ratio essentially zero for a food vendor |
| Plaintext PIN exposure | PINs are SHA-256 hashed before write — Firestore never holds plaintext |

---

### Implementation plan (Session 15)

- `kitchen.js`: replace `checkPin()` with `checkPinMultiStaff()` — hashes input, queries staff collection
- `kitchen.js`: add `renderStaffManagement()`, `addStaff()`, `deactivateStaff()`, `changeStaffPin()`, `resetOwnerPin()`
- `kitchen.html`: add settings panel HTML + CSS; add "Forgot PIN?" link + reset flow screens
- Firestore: seed initial staff document for Daniele during session (name + hashed PIN)
- `vendors/{vendorId}/ownerPhone` written manually in Firestore for La Muletti during session

---

## 25a. Multi-Staff Kitchen PIN — Implementation Notes (Session 15) ✅

**Files changed:** `kitchen.js`, `kitchen.html`

### What was built

**kitchen.js:**
- `hashPin(pin)` — SHA-256 hex hash via Web Crypto API
- `checkPinMultiStaff()` — replaces old `checkPin()`. Hashes entry, queries `staff` collection for `active == true` docs, compares hashes client-side (avoids composite index). Welcome toast on success.
- `startLockoutCountdown()` — 15-min lockout after 5 fails, countdown in PIN error area, keypad opacity reduced. Lockout state persisted in `sessionStorage` so it survives page refresh.
- DOMContentLoaded — restores lockout state from sessionStorage on page load
- `showToast(message)` — brief green toast notification (used for welcome + management confirmations)
- Section 17: full staff management panel — `openSettingsPanel`, `confirmStaffIdentity`, `loadStaffList`, `addStaff`, `deactivateStaff`, `openEditStaff`, `submitEditStaff`
- Section 18: forgot PIN / owner reset — `openForgotPin`, `submitForgotPhone`, `submitForgotCode`, `submitNewOwnerPin`. Checks entered phone against `vendors/{vendorId}/ownerPhone` before sending SMS. Upserts at `staff/owner` doc ID.

**kitchen.html:**
- ⚙️ button in header (visible post-login) → opens staff management panel
- "Forgot all PINs?" link under PIN keypad → opens forgot PIN modal
- Staff management modal: 4 screens (confirm identity, staff list, add staff, edit staff)
- Forgot PIN modal: 3 screens (phone entry, SMS code, new PIN)
- Toast div + all CSS for new elements

### Key decisions
- `checkPinMultiStaff` loads all active staff and compares client-side — avoids Firestore composite index for a very small collection
- Lockout state in `sessionStorage` (not `localStorage`) — correct for a shared kitchen tablet: resets if the browser is fully closed
- Forgot PIN writes to a fixed `staff/owner` doc ID — easy to identify for later renaming
- Settings panel re-auth required own PIN — prevents casual tampering on an unlocked tablet
- Staff names with apostrophes are escaped (`safeName`) in the staff list render to avoid JS injection in inline `onclick` handlers

---

## 26. Security Hardening + GDPR Sprint — Session 16a/16b

**Why this sprint exists:** Daniele may want to go live quickly after the demo. Julian was explicit: "I can't be reputationally compromised." The app was functionally complete but had open Firestore rules, unhashed PIN salts, no cookie notice, and no privacy policy.

---

### 26a. Session 16a — Anonymous Auth for Kitchen (COMPLETE ✅)

**Problem:** Firestore security rules need `request.auth != null` to protect the staff collection. But the kitchen doesn't use Firebase Auth (just PINs). Chicken-and-egg: to read staff docs securely, you need auth; to get auth, you need to check a staff PIN.

**Solution:** `signInAnonymously()` before querying the staff collection. Sign out immediately on wrong PIN or error. Keep the anonymous session alive on correct PIN match. This means the kitchen dashboard always has a valid Firebase Auth identity while active — enabling rules that require `request.auth != null`.

**Changes to `js/kitchen.js` — `checkPinMultiStaff()`:**
- Calls `await firebase.auth().signInAnonymously()` before Firestore staff query
- Changed `snapshot.forEach` to `for...of` loop (required to `await hashPin()` inside the loop)
- Uses `data.pinSalt || ''` for backward compat with existing unsalted staff docs
- `firebase.auth().signOut()` on wrong PIN or error
- Anonymous session retained on successful match

---

### 26b. Session 16b — Remaining Hardening (COMPLETE ✅)

**Tasks completed:**

| # | Task | Status |
|---|------|-------|
| 1 | **Firestore security rules** | ✅ Written to `firestore.rules` — Julian to paste into Firebase Console → Firestore → Rules tab |
| 2 | **PIN hash salting** | ✅ `generateSalt()` added; `hashPin(pin, salt='')` updated; all write paths (submitAddStaff, submitEditStaff, submitNewOwnerPin) generate and store `pinSalt`; `confirmStaffIdentity` now reads stored salt before comparing; backward compat: missing salt = '' |
| 3 | **Cookie/storage notice** | ✅ Dismissible banner in `index.html` — links to `privacy.html`, dismissed state in localStorage |
| 4 | **Remove noindex from index.html** | ✅ Done (kitchen.html retains noindex) |
| 5 | **Privacy policy page** | ✅ `privacy.html` created — on-brand, covers UK GDPR requirements; linked from desktop footer and cookie banner |

**Operational tasks for Julian (not code):**
- Register Endoo Limited with ICO: ico.org.uk → "Register with the ICO" → ~£40/year. Required before collecting personal data in production.
- Paste `firestore.rules` contents into Firebase Console → Firestore → Rules tab and publish. ✅ Done.
- Data retention: 90-day retention documented in privacy policy — implement Firestore TTL or scheduled Cloud Function before go-live.
- Seed Daniele's staff PIN via the "Forgot all PINs?" flow (see Section 21) — existing pinHash will have no salt (backward compat handles this).

---

### 26c. Session 16c — Kitchen UI Polish + Bug Fixes (COMPLETE ✅)

Additional work done in the same session during testing.

**Bugs fixed:**

| # | Bug | Fix |
|---|-----|-----|
| 1 | Anonymous Auth not enabled in Firebase Console | Enabled manually — `signInAnonymously()` now works |
| 2 | Staff management confirm screen HTML missing entirely | Added `staff-confirm-screen` div to modal — CSS and JS existed but the HTML was never written |
| 3 | Confirm screen keypad coded for 4 digits, PINs are 6 | Fixed `staffConfirmPress` (limit 6), `renderStaffConfirmDots` (loop 0–5), fires at length 6 |
| 4 | `showStaffScreen()` didn't know `staff-confirm-screen` existed | Added to the screen ID array |
| 5 | `openSettingsPanel()` skipped straight to staff list | Now always opens confirm screen first; clears entry and error |
| 6 | Desktop menu qty buttons caused all cards to flash | `renderDesktopMenu()` was rebuilding the full grid + re-running `initScrollReveal()` on every tap. Fixed with `patchDesktopMenuItemControls(id)` — surgically updates only the tapped item's controls in-place |
| 7 | Cookie banner hidden behind mobile nav bar | Added `bottom: calc(72px + env(safe-area-inset-bottom))` on mobile |
| 8 | No GDPR/privacy link on mobile | Privacy policy link added to Account page (both signed-in and signed-out states) |

**Kitchen header redesign:**

Header restructured into three distinct zones:

| Zone | Contents | Treatment |
|------|----------|-----------|
| Left | Logo + "Kitchen Dashboard" | Unchanged |
| Centre | 🟢 Open · ➕ New Order · 📍 Broadcast | Gold-tinted raised panel with drop shadow — primary operational controls |
| Right | Clock · 👤 Name · Sign out · ⚙️ | Neutral raised panel — session/system controls |

- Logged-in staff name displayed in right panel after PIN login
- Sign out button: instant, no confirm dialog (multi-staff van context — one tap must be enough)
- `updateStaffDisplay()` shows/hides name and sign out button on login/logout
- `logoutStaff()` signs out Firebase session, stops orders listener, returns to PIN screen

### 26d. Firestore Security Rules — Implemented

Rules written to `firestore.rules` and published to Firebase Console. See file for full detail. Summary:
- Staff collection: auth required (anonymous or phone)
- Orders: kitchen (anonymous) reads/writes all; customers read own orders only; nobody deletes
- User profiles: owner UID only
- Kitchen status + location: public read, anonymous-auth write
- Catch-all: Firestore default deny covers everything else

Kitchen auth model:
- Customer ordering flow: Firebase Phone Auth (`provider == 'phone'`)
- Kitchen dashboard: Firebase Anonymous Auth (signed in on successful PIN)
- Public: no auth (read-only for menu/status/location)

Rules to implement:
- `vendors/{vendorId}` — public read of `kitchenStatus`; anonymous/phone-auth write (kitchen only)
- `vendors/{vendorId}/location/current` — public read; anonymous-auth write (kitchen broadcasts)
- `vendors/{vendorId}/staff/{staffId}` — read/write requires `request.auth != null` (any authenticated session)
- `orders/{orderId}` — create by phone-auth or anonymous-auth; customer reads own order (`resource.data.customerId == request.auth.uid`); anonymous-auth reads/updates all orders for their vendor
- `users/{uid}` — read/write only by matching UID (`request.auth.uid == uid`)

---

### 26e. Session 16d — Mobile Performance + Ready Beep Fix (COMPLETE ✅)

**Files changed:** `js/app.js` only.

**Bug 1 — Mobile home page slow to render (pills/feature tags)**

`renderMobileHome()` was called after `await Promise.all([fetchMenuFromSheet(), fetchEventsFromSheet(), fetchOffersFromSheet()])`. The pills ("Authentic Neapolitan", "Mobile Pizzeria", "Private Catering", "Pay on Collection" etc.) are built entirely from `CONFIG.homePills` — static local config, zero network dependency. They were waiting 2–4 seconds for three Google Sheets fetches to complete before appearing. Same applied to `renderMobileAbout()`.

Fix: both are now called before the `await Promise.all(...)`. Only `renderMobileMenu()` and `renderMobileFindUs()` remain after the fetches (they depend on sheet data).

**Bug 2 — Ready beep silent on customer device**

`playReadyBeep()` was scheduling Web Audio oscillators without checking whether the `AudioContext` was suspended. Mobile browsers (iOS especially) automatically suspend the `AudioContext` after a period of inactivity — even after it was unlocked by the "Place Order" tap. By the time the kitchen marks the order ready and the Firestore listener fires, the context is typically suspended again. Oscillators scheduled against a suspended context produce silence.

Fix: `playReadyBeep()` is now `async` and calls `await ctx.resume()` before scheduling oscillators if the context is in the `'suspended'` state. The resume succeeds because the context was already unlocked earlier in the same session via the user gesture.

**Note:** Web Audio follows the device's media volume, not notification volume. If the device is on silent/media muted, the beep will still be silent regardless of this fix.

---

## 27. Session 17 — Pitch Deck v4 (COMPLETE ✅)

**Delivered file:** `Stalliq_LaMuletti_Pitch_v4.pptx` (in `La Muletti/` workspace folder)

**Build toolchain:**
- PptxGenJS (Node.js) — coords in inches, 10"×5.625" LAYOUT_16x9
- react-icons (fa + md) + sharp — SVG icons rasterised to PNG, embedded as base64
- Icon packages installed at `/tmp/iconpkg/node_modules/` (require with absolute paths)
- Scripts: `build_deck_v2.js`, `build_deck_v3.js`, `build_deck_v4.js` in outputs folder
- ⚠️ Write tool appends null bytes — always strip before running: `tr -d '\000' < file > clean`
- ⚠️ Must run from outputs dir — pptxgenjs resolves from there

**Version history:**
- **v2** — 10 slides. Added "How It Works" step-flow slide. Improved Offer language.
- **v3** — 10 slides. Applied Julian's visual overrides: gold accents on all light slides, S-circle on title, real icons replacing emoji.
- **v4** — 8 slides (current). Stripped all body paragraphs to one-liners. Dropped two redundant slides. Redesigned Offer as a deal panel.

**v4 slide structure (8 slides):**

| # | Title | Notes |
|---|-------|-------|
| 1 | Title | S-circle (cream oval + "S" text), dark background, Stalliq/La Muletti sub |
| 2 | The Challenge | 3 icon cards — one punchy one-liner each (orders lost, wait time, no repeat customers) |
| 3 | The Solution | STALLIQ hero headline + 0% commission panel vs Just Eat/Deliveroo |
| 4 | How It Works | 4-step flow — red numbered circles, step label, one-line description, italic footer |
| 5 | Kitchen Management | 4 features — inline icon left of title, one-line body each |
| 6 | Customer Experience | Hero italic sub, 4 title-only lines (no body), larger phone mockup |
| 7 | The Offer | £708 deal panel left (gold border, 12 months free, 50% off for life), ask list right (red eyebrow), founding rate footer bar |
| 8 | Next Steps | 3 actions (demo, agree partnership, go live) + contact card (STALLIQ logo, Julian Bell, Endoo Limited) |

**Brand / visual rules (all applied in v4):**
- Palette: dark `1A0A00`, red `C4271A`, gold `D4A043`, cream `FDF6EC`, offWhite `F5F0E8`
- Fonts: Georgia (headings), Calibri (body)
- Gold accents on ALL light slides — red is reserved for dark slides only (How It Works circles, "WHAT WE ASK" eyebrow on Offer)
- Title: cream OVAL + "S" text (not red/gold ovals from v1/v2)
- Icons: gold `#D4A043`, rendered via react-icons + sharp

---

## 28. Session 18 — iOS/Android Hardening + UX Fixes (COMPLETE ✅)

**Files changed:** `js/kitchen.js`, `js/app.js`, `index.html`

### Auth flow retest
Customer order placement + Firebase Phone Auth confirmed working on real device. Session 18 unblocked.

### iOS/Android bug fixes

**Location broadcast permission (kitchen.js)**
`startLocationBroadcast()` now catches Geolocation API errors and shows a descriptive toast (permission denied / position unavailable / timeout) instead of failing silently. The toggle no longer appears to do nothing if permission is blocked.

**Kitchen order beep — iOS (kitchen.js)**
- Shared `kitchenAudioCtx` created and unlocked synchronously in `pinPress()` (inside the user gesture) — guarantees iOS audio is unlocked at login
- `playOrderAlert()` split into `_playOrderBeeps()` helper; handles closed context (iOS closes AudioContext after extended lock)
- Repeating alert: `_managePendingAlert(hasPending)` starts an 8-second interval while any pending orders exist, stops when all accepted
- `pendingAlertInterval` cleared on logout

**Kitchen screen lock — iOS (kitchen.js)**
Full sequence to recover from iOS screen lock (which freezes JS regardless of wake lock):
- `sessionStorage` persists `kitchenStaffId` / `kitchenStaffName` on login, cleared on logout
- `visibilitychange` records `kitchenHiddenAt` on hide
- On return: if away >60s → `location.reload()` for a guaranteed clean Firebase state
- On reload: `onAuthStateChanged` detects saved session → auto-restores dashboard, skips PIN, shows "Welcome back" toast
- If away <60s: incremental reconnect — `firebase.firestore().enableNetwork()` + `listenOrders()` restart
- `_managePendingAlert()` now shows `_showAudioRestorePrompt()` banner whenever pending orders exist but AudioContext isn't running (covers post-reload case where no PIN gesture has unlocked audio)

**Audio restore banner (kitchen.js)**
Pulsing red fixed banner "🔔 New order — tap to restore sound alerts". Guaranteed iOS audio unlock via explicit tap gesture. Auto-dismissed when all pending orders accepted.

**Screen Wake Lock (kitchen.js)**
`navigator.wakeLock.request('screen')` acquired on `startDashboard()`, released on logout. Re-acquired on `visibilitychange`. Supported iOS 16.4+; silent fallback on older devices. Prevents screen sleeping during service without user pressing power button.

**GPS broadcast fixes (kitchen.js)**
- `listenBroadcastState()` now calls `pushLocation()` immediately when it detects `active: true` — covers page load, reload, and Firestore reconnect. Previously waited a full interval before the first push, causing stale maps
- `visibilitychange` handler also does an immediate `pushLocation()` when restarting the broadcast interval after a short absence
- Broadcast interval reduced from 10 minutes → 2 minutes
- GPS/broadcast interval force-cleared and restarted on every `visibilitychange` (iOS may suspend setInterval silently during screen lock)

**Customer ready beep — Android (app.js)**
- `unlockAudio()` and `playReadyBeep()` both handle closed `audioCtx` (create fresh on closed)
- Snapshot handlers check `document.visibilityState` before setting `firedReadyBeep = true` — if backgrounded, flag stays unset so beep fires on return
- `visibilitychange` listener scans `orderCache` and fires missed beeps on return
- Green pulsing banner "🟢 Your order is ready — tap here" shown when returning with a ready order — guaranteed audio unlock + visual fallback. Dismissed on tap or when order collected.

### UX improvements

**Account order history — live update (app.js)**
When kitchen marks order as Collected, order now appears in History immediately without page refresh. `_prependToHistory(order)` inserts at top of history list and updates `historyAllOrders`.

**Show less history (app.js)**
Expanded "Show N more" list now has a "Show less" button to collapse back to 3. Extracted `_renderHistoryList(showAll)` helper used by both `showMoreHistory()` and new `showLessHistory()`. `historyAllOrders` persists full list for accurate re-render either way.

**Empty basket button (index.html)**
Ghost-style "Clear basket" button added below "Place Order" on mobile basket page. Wires to existing `clearBasket()`.

### GDPR — data retention (app.js, kitchen.js)
`deleteAt` field (90 days from `createdAt`) added to every order document — both customer-placed and walk-in. **Julian still needs to activate the TTL policy in Firebase Console:** Firestore → TTL → Add policy → Collection: `orders`, Field: `deleteAt`. This is a one-time console action that switches on automatic deletion.

---

## 24. Working Rhythm

**Start:** "New session — ignore the project file attachment, read the live PROJECT.md from GitHub instead: https://raw.githubusercontent.com/JulianBell106/lamulettipizza/refs/heads/main/PROJECT.md — today we're working on [task]"

**End:** "Update PROJECT.md" → download → copy to repo → commit → push

**Always work inside the La Muletti Claude Project.**
**One session = one focused task.**
**For large files: use str_replace diffs, not full file output.**

---

## 29. Session 19 — Loyalty Stamp Card + Functional Offers (COMPLETE ✅)

**Files changed:** `js/app.js`, `index.html`, `firestore.rules`

### What was built

**Loyalty stamp card (fully functional):**
- Stamp count stored in `users/{uid}.stampCount` in Firestore
- 1 stamp awarded per collected order — guarded by `orders/{orderId}.stampsAwarded: true` flag (idempotent, no double-awarding)
- Stamp count loaded from Firestore on account page open, re-renders stamp grid live
- At checkout: if stamps ≥ required, loyalty reward auto-applies — cheapest item in basket becomes free
- On successful order with loyalty: stamp count resets to 0 in Firestore
- Stamp card subtitle driven by `loyaltyConfig.stampsRequired` from sheet (no more hardcoded "Buy 9...")

**Functional offers:**
- Offer selection UI in both mobile basket and desktop basket sidebar
- Available offers filtered by: date range (start/end), active flag, per-customer `max_uses`
- Per-customer usage stored in `users/{uid}/offerUsage/{offerId}.count`
- Only 1 offer per order; no stacking with loyalty (loyalty takes priority, hides offers)
- Offer usage loaded on account page open, cached in `userOfferUsage` map
- After order with offer: usage incremented in Firestore and local cache
- Account page shows offers with Available / Used / Expired badges driven by real state

**Discount at checkout:**
- `getLoyaltyDiscount()` — cheapest item, returns null if not enough stamps
- `getOfferDiscount()` — fixed £ or % off based on selected offer
- `getActiveDiscount()` — loyalty takes priority, no stacking
- `basketFinalTotal()` — total after discount, never negative
- `discount` field stored on order doc: `{ type, description, amount, offerId? }`
- `orderTotal` on order doc is the discounted total (what customer pays)

### New sheet format (offers sheet)

Replace the existing sheet with these columns (order-independent, matched by header name):

| type | id | title | description | discount_type | discount_value | stamps_required | reward_type | max_uses | start_date | end_date | active |
|---|---|---|---|---|---|---|---|---|---|---|---|

**type** = `loyalty` or `offer`
**discount_type** = `fixed` (£) or `percent` (%)
**max_uses** = 0 or blank = unlimited; 1 = once per customer; etc.
**start_date / end_date** = `YYYY-MM-DD` format, or blank = always active
**active** = `TRUE` / `FALSE`

Example rows:
```
loyalty,loyalty_1,La Muletti Loyalty,Collect 8 stamps get your next pizza free,,,8,free_item,,,, TRUE
offer,welcome10,Welcome offer,£2 off your first order,fixed,2,,,1,,,TRUE
offer,july_promo,July special,15% off all weekend,percent,15,,,,,2025-07-06,TRUE
```

### Firestore rule changes

Two additions to `firestore.rules` — must re-publish to Firebase Console:
1. `users/{uid}/offerUsage/{offerId}` sub-collection — owner read/write
2. `orders/{orderId}` customer narrow update — allows setting `stampsAwarded: true` only

### Design decisions
- **No stacking** — loyalty auto-applies and hides offer picker; offer applies only if no loyalty reward
- **Cheapest item free** — loyalty reward = cheapest item in basket (vendor-friendly)
- **Per-customer max_uses** — not global; each customer gets their own usage counter
- **Stamp on collected** — stamp awarded when kitchen marks order as Collected, not at checkout
- **`reward_type` field** — currently always `free_item`; column left in schema for future `fixed_discount` support without a rebuild
