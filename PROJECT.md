# Stalliq — Project Bible
> Last updated: 2026-05-19 — Session 43: Pitch deck v7 built. 12 slides, gold colour scheme (red → gold circles), fade transitions on all slides, phone mockup on Solution slide, kanban graphic on Kitchen slide, new Find Us slide (3 feature cards: Live GPS, Events, Offers), new Competitor Comparison slide (Stalliq vs IndyLocal vs Just Eat). Delivered: `Stalliq_LaMuletti_Pitch_v7.pptx`.
> **Next session — start here:**
> - **🔴 Rotate Twilio Auth Token** — SID committed to git history on develop. Rotate at Twilio Console → Account → API keys & tokens. Update `functions/.env` on both branches.
> - **Check WhatsApp template approval** — submitted 2026-05-17. Once approved: implement WhatsApp as premium tier (backlog B3).
> - **Wipe test data on stalliq-production** — delete all docs in `orders` and `users` collections. Keep `vendors/{vendorId}/staff/`, `kitchenStatus`, `location`, `counters`.
> - **Node.js 20 deprecation** — upgrade functions to Node 22 before 2026-10-30.
> - **Future session:** Google Play Store TWA wrap (pwabuilder.com → AAB → Play Console). Do on main (La Muletti production URL).
> - **Future session:** iOS PWA install guidance — in-app instructions for Safari Share → Add to Home Screen.
> - **Future session:** Add Stalliq product page to endoo.co.uk (under Products).
>
> ⚠️ **Julian — actions outstanding:**
> 1. **🔴 Rotate Twilio Auth Token** — URGENT. SID committed to develop git history.
> 2. **Wipe test data on stalliq-production** — delete all docs in `orders` and `users` collections.
> 3. **ICO registration** — ico.org.uk, ~£40/year (required before collecting personal data in production).
> 4. **Google Sheet header rows** — protect header rows on all three La Muletti sheets.
>
> **⚠️ Backlog:**
> - B3: WhatsApp as premium notifications tier — once Meta template approved, add `messagingChannel: 'sms' | 'whatsapp'` to vendor doc.
> - B4: Generic code audit — remove hardcoded pizza/La Muletti refs from shared layer ⚠️ risky — do on feature branch.
> - B5: Flash sale BOGO / flexible discount types — currently only % off and £ off. Future: buy-one-get-one-free.
> - B6: Google Play Store TWA wrap — pwabuilder.com generates signed AAB. Needs assetlinks.json on Netlify domain + Play Developer account (~$25).
> - B7: Collection Window ("Queue from Anywhere") — customer picks arrival window at checkout; kitchen sees upcoming orders with countdown. See Section 21a for full spec.
>
> **Demo with Daniele postponed ~2 weeks from 2026-05-17 (he is busy).**
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
| 10 | Walk-in Manual Order Entry | ✅ Done | "➕ New Order" on kitchen dashboard — vendor enters walk-up orders, drops into Pending column. Phone number resolves to existing account (phoneIndex) or is claimed on next customer sign-in. Session 23. |
| 11 | Colour & UX Overhaul | ✅ Done | True red token, dietary CSS badges, deeper menu section, card left accent — Session 12 |
| 12 | Per-item Notes | ✅ Done | "Add customisation" toggle on basket lines (mobile + desktop). Notes in Firestore, kanban card, detail modal, customer order detail, walk-in modal. Session 13 |
| 13 | Customer Ready Beep | ✅ Done | Two beeps via Web Audio API (660 Hz) when status → ready. unlockAudio() on Place Order tap. firedReadyBeep guard prevents spurious beeps on load. Session 13 |
| 14 | Live Location Broadcast | ✅ Done | Full stack complete. Kitchen broadcasts GPS; customer Find Us page shows live map, kitchen status, tagline. Find Us page redesigned (mobile + desktop). Kitchen legibility pass. |
| 15 | Multi-Staff Kitchen PIN | ✅ Done | Multi-staff PIN login (SHA-256 hashed), lockout after 5 fails (15 min), staff management panel (add/rename/change PIN/deactivate), forgot PIN flow via Firebase Phone Auth. Session 15. |
| 15a | Real Phone Auth Go-Live | ✅ Done | Blaze plan, App Check (reCAPTCHA v3), authorised domain confirmed, test numbers removed, old kitchen.pin removed. Session 15b. |
| 15b | Security Hardening + GDPR | ✅ Done | Anonymous auth, Firestore rules, PIN salting, cookie notice, privacy policy. Sessions 16a/16b. |
| 16 | SMS Order Ready Notifications | ✅ Done | SMS notifications live on dev + production (Session 38). Twilio UK number +447782218609. Messaging toggle in kitchen settings. WhatsApp pending Meta template approval — future premium tier (B3). |
| 17 | Geofence Notifications | ⏳ Planned | Van enters subscriber's area → phone buzzes |
| 18 | Flash Sales & Broadcasts | ⏳ Planned | Vendor launches deal in seconds, broadcasts to subscribers |
| 19 | Loyalty Stamp Card | ✅ Done | Stamp card (8 stamps → free pizza), per-order guard, cross-device sync, transaction-safe award |
| 19b | Geofenced Flash Sale Alerts | ✅ Built | Postcode opt-in, geocoding CF, kitchen panel, SMS broadcast CF (Session 39). Flash sale discount at checkout + walk-in orders (Session 40). Both branches. Deploy rules + CFs to go live. |
| 20 | Flash Offers by Geolocation | ⏳ Planned | Customer in area gets notified of live deal |
| 21 | Pre-order Time Slots | ⏳ Specced | Collection Window ("Queue from Anywhere") — see Section 21a |
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
| 22 | Walk-in order account integration | ✅ Done |
| 23 | Go live with Daniele | ⏳ Pending |

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

**Firebase projects:**
- `stalliq-production` (stalliq-production.firebaseapp.com) — La Muletti **live** data
- `stalliq` (stalliq.firebaseapp.com) — dev/sandbox (safe to wipe)
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

  staff/{staffId} → (Session 15 — multi-staff PIN; role added Session 32)
    name:      string
    pinHash:   string  (SHA-256 hex of PIN+salt — never store plaintext)
    pinSalt:   string  (random hex salt — added Session 16a, backward compat: missing = empty string)
    active:    boolean
    createdAt: timestamp
    role:      string  ('owner' | 'staff') — set via Firebase Console at onboarding. Missing = treated as 'staff'. Max 2 owners enforced in code.

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

## 19b. Geofenced Flash Sale Alerts — Sessions 39–40

### What was built (Session 39)
- **Postcode opt-in** — account page (mobile + desktop). UK postcode validation, ℹ️ info tooltip, status chip with opt-out. `users/{uid}/postcode` + `postcodeLatLng` written via `geocodePostcode` Cloud Function (server-side Google Geocoding API — key never in browser).
- **Kitchen flash sale panel** — settings modal, owner-only. Textarea (160 char), char counter, Save as template, Send button (disabled when broadcast off). Writes to `flashSales/{id}` to trigger broadcast CF.
- **`geocodePostcode` Cloud Function** — callable, `europe-west2`. Validates postcode, geocodes, writes to Firestore. Requires `GOOGLE_GEOCODING_API_KEY` in `functions/.env`.
- **`flashSaleBroadcast` Cloud Function** — Firestore onCreate on `flashSales/{id}`. Haversine filter (3 miles). Sends SMS via Twilio. Prepends vendor `displayName` to message. Logs results back to doc.
- **Firestore rules** — `flashSales/{id}` allow create: anonymous auth (kitchen). Read/update/delete: false (admin SDK only).
- **`firebase-functions-compat.js`** CDN script added to `index.html`.

### What was built (Session 40) — discount at checkout

**The fix: `vendors/{vendorId}/flashSale/current` live state doc** (same pattern as `location/current` + `kitchenStatus`).

**Doc shape:**
```
vendors/{vendorId}/flashSale/current
  active:        boolean
  discountType:  'percent' | 'fixed'
  discountValue: number
  message:       string
  expiresAt:     timestamp
  startedAt:     timestamp
  startedBy:     string (staffId)
```

**Files changed (both `develop` and `main`):**

| File | Change |
|------|--------|
| `firestore.rules` | Added `flashSale/{docId}` sub-collection: public read, anonymous write |
| `kitchen.html` | Discount type selector (% off / £ off), value input, duration selector (30min/1hr/2hr); live indicator; End Flash Sale button |
| `js/kitchen.js` | `listenFlashSaleState()`, `renderFlashSaleLiveIndicator()`, `sendFlashSale()` batch-writes both `flashSale/current` and `flashSales/` doc, `endFlashSale()`, walk-in discount in `updateWalkinTotal()` + `submitWalkinOrder()` |
| `js/app.js` | `listenFlashSale()`, `getFlashSaleDiscount()`, `getActiveDiscount()` (flash > loyalty > offer), `renderFlashSaleBanner()`, basket discount rendering |
| `index.html` | CSS + HTML for `#m-flash-sale-banner`, `#d-flash-sale-banner`, `.bsk-flash-sale-banner` |

**Key decisions:**
- Walk-in orders: ALL walk-ups get the discount automatically (no account required).
- Discount priority: flash sale > loyalty > offer (no stacking).
- Expiry checked client-side against `Date.now()` on every basket render — no Cloud Function cleanup needed.
- £ dropdown fix: `<option style="color:#1A0A00;background:#fff">` to prevent white-on-white on native OS dropdowns.
- Both branches patched and `node --check` verified OK.

### 9-step end-to-end test checklist

1. Deploy Firestore rules to `stalliq` (dev) project
2. Open demo.stalliq.co.uk in two tabs: customer + kitchen
3. Kitchen: sign in as owner → Flash Sale panel visible
4. Customer: add items to basket (no flash sale active yet — confirm no discount)
5. Kitchen: launch flash sale (20% off, 30 min) → "FLASH SALE ACTIVE" indicator appears
6. Customer: `#m-flash-sale-banner` / `#d-flash-sale-banner` appears with promo details
7. Customer: basket shows flash sale discount line + correct total
8. Customer: place order → order doc contains `discount: { type: 'flash_sale', amount: X }`
9. Kitchen: walk-in order → discount preview visible; submitted order also has `discount` field

### ⚠️ Still to do before shipping

- Deploy Firestore rules: `firebase deploy --only firestore:rules` (both projects)
- Deploy Cloud Functions: `firebase deploy --only functions` (both projects)
- Run end-to-end test checklist above
- Rotate Twilio Auth Token 🔴 URGENT
- Wipe test data on `stalliq-production`

---

## 21a. Collection Window — Feature Spec (logged 2026-05-19)

**Framing:** "Queue from Anywhere" — let customers join the kitchen queue before physically arriving at the stall. Vendor-agnostic; applies to all Stalliq vendors.

### Rules
- Only available when vendor is **live/broadcasting** — no offline pre-orders.
- Customer picks a collection preference at checkout — three options (CONFIG-driven via `CONFIG.ordering.collectionWindowOptions`):
  - **I am here** — standard order, immediate
  - **~15 mins** — I am on my way
  - **~30 mins** — I am nearby, heading over
- Order is sent to kitchen **immediately** on placement — kitchen has full visibility of upcoming queue.

### Firestore — order doc change
Add `collectionWindow` field to order document:
```
collectionWindow: {
  type:            'now' | 'later',
  minutesFromOrder: number   // 0 for 'now', 15 or 30 for 'later'
}
```

### Customer UX
Collection preference selector shown in basket/checkout, above the Place Order button. "I am here" selected by default. Selecting "later" shows the time options.

### Kitchen UX
- **"Now" orders:** render exactly as today — no change.
- **"Later" orders:** visually subdued on the board with a countdown chip ("Collecting in ~18 mins"). As countdown reaches zero, card promotes to full prominence.
- Board sorted: "now" orders first, then "later" orders ascending by collection time.
- When kitchen taps **Accept Order →**, the wait modal pre-fills with the collection window value (e.g. 15 or 30 mins). Kitchen can adjust before confirming. The existing `waitMins` per-order flow is unchanged — collection window is context, not a contract.

### No-show handling (v1)
No upfront payment required. Kitchen can mark an order "Not collected" — logged for future analytics. No automatic penalty in v1.

### Build scope
| File | Change |
|------|--------|
| `index.html` / `app.js` | Collection preference selector in checkout UI; write `collectionWindow` to order doc |
| `kitchen.html` / `kitchen.js` | Render "later" orders distinctly; countdown chip; board sort; pre-fill wait modal |
| `firestore.rules` | No change needed — `collectionWindow` is just a new field on the existing order doc |
| `js/config.js` | Add `CONFIG.ordering.collectionWindowOptions` (optional — defaults to [15, 30] if absent) |

### Ship order
1. Build on `develop` (Street Stack demo) — validate kitchen board sort and countdown UX
2. Test end-to-end: place "later" order → confirm kitchen sees countdown → accept → wait modal pre-fills → mark ready → customer notified
3. Show Daniele — get real-world feedback
4. Apply to `main`

---

## 18. Deployment Pipeline ✅

**GitHub:** https://github.com/JulianBell106/lamulettipizza

| Branch | Netlify Site | Domain | Firebase Project | Purpose |
|--------|-------------|--------|-----------------|---------|
| `develop` | stalliq-demo.netlify.app | demo.stalliq.co.uk (pending) | `stalliq` (dev sandbox) | All active development + generic Stalliq demo |
| `main` | lamuletti-stalliq.netlify.app | — | `stalliq-production` | La Muletti live production system |

**Stalliq product site:** `stalliq-site/` folder in workspace → deployed separately via Netlify drop → stalliq.co.uk

**⚠️ `.gitattributes` protects both `js/firebase.js` AND `js/config.js` with `merge=ours`** — commit this change on `develop` and merge to `main` before next code change.
Never commit production credentials or La Muletti config to `develop`, or vice versa. Always verify both files after a merge.

**DNS:** stalliq.co.uk uses Netlify DNS. Nameservers: `dns1-4.p05.nsone.net` (set in HostPapa 2026-05-04). Add subdomains directly in Netlify DNS panel.

**Development workflow:**
1. All work starts on `develop`
2. Claude produces files or diffs → Julian applies to `develop`
3. GitHub Desktop → commit to `develop` → push → stalliq-demo auto-deploys
4. When ready to ship to La Muletti: switch to `main` → merge from `develop` → verify firebase.js AND config.js still have La Muletti/production values → push → lamuletti-stalliq auto-deploys

**See `BRANCHES.md` in repo root for the full branching guide.**

---

## 36a. Stalliq Product Brand — Session 26 (2026-05-04)

**stalliq.co.uk** is the Stalliq product marketing site — entirely separate from the La Mul