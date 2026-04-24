# Stalliq — Project Bible
> Last updated: April 2026 — Session 9 Complete (Google Sheets Menu Management done)
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

**Commercial arrangement:** Free for year one in exchange for being a reference customer and providing feedback. Year two onwards moves to standard pricing. **Daniele has confirmed he wants to go ahead — meeting in ~3 weeks.**

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
| `index.html` | Customer app — pure structure, zero hardcoded business content |
| `css/styles.css` | All styling — desktop + mobile |
| `js/config.js` | ALL customer-specific data lives here |
| `js/firebase.js` | Firebase initialisation — exposes `db` and `auth` globals |
| `js/app.js` | All logic — reads entirely from CONFIG, integrates Firebase |
| `kitchen.html` | Kitchen dashboard — PIN protected, separate URL |
| `js/kitchen.js` | All kitchen dashboard logic |

**Key principle:** `config.js` is the ONLY file that changes between customers.

**Script load order (both index.html and kitchen.html):**

```
Firebase SDK (CDN compat v10.12.2) → js/config.js → js/firebase.js → js/app.js / js/kitchen.js
```

**Output files location:** `/mnt/user-data/outputs/lamuletti/`

**Responsive layout:**
- Desktop (≥768px): Full scrolling landing page with basket sidebar + account panel
- Mobile (<768px): PWA app shell with **6 pages** and bottom navigation

**Mobile nav (6 items):**
🏠 Home · 🍕 Menu · 🛒 Basket · 👫 About · 📍 Find Us · 👤 Account

**Design tokens:**
- Primary: `#C8410B` (fire red)
- Accent: `#D4A043` (gold)
- Background: `#1A0A00` (near black)
- Light: `#FDF6EC` (cream)
- Fonts: Playfair Display, DM Sans, Cormorant Garamond

**Contrast rule (established Session 6, applied Session 7a):**
Secondary text must use `rgba(255,255,255,0.X)` not `rgba(cream,0.X)`. Warm cream at low opacity on warm dark backgrounds renders as brown-on-brown. White-based opacity renders as readable neutral grey.

**Contrast values (current):**
- `--cream-60`: `rgba(255,255,255,0.75)` — body text, labels
- `--cream-50`: `rgba(255,255,255,0.70)` — descriptions, secondary
- `--cream-45`: `rgba(255,255,255,0.65)` — notes, hints, captions

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
| 08 | News & Locations Feed | 🔨 Session 10 | Upcoming events + where to find the van — Google Sheets driven |
| 09 | Offers & Deal Codes | 🔨 Session 10 | Offers page on customer app, discount codes |
| 10 | SMS & WhatsApp Status Notifications | ⏳ Planned | Customer notified on order status changes — Twilio |
| 11 | Live Location Broadcast | ⏳ Planned | Van location shown live on customer app — foundation for geofence at scale |
| 12 | Geofence Notifications | ⏳ Planned | Van enters subscriber's area → phone buzzes |
| 13 | Flash Sales & Broadcasts | ⏳ Planned | Vendor launches deal in seconds, broadcasts to subscribers |
| 14 | Loyalty Stamp Card | ⏳ Planned | Digital stamp card — no paper needed |
| 15 | Flash Offers by Geolocation | ⏳ Planned | Customer in area gets notified of live deal |
| 16 | Pre-order Time Slots | ⏳ Planned | Order now, collect at chosen time |
| 17 | Vendor Self-Service | ⏳ Planned | Vendor manages own menu, events, location — full self-service portal |
| 18 | MI & Reporting | ⏳ Planned | Daily order count, revenue totals, product breakdown — CSV or Looker Studio |
| 19 | AI Order Assist | 🌟 Vision | Customer orders in natural language — type or dictate. AI parses into basket, normal checkout flow. |

**Feature backlog (future):**
- Item notes (per-item text input in basket — data model already supports `notes: null`)
- Corporate catering module
- Pub partnership mode
- Multi-vendor event mode
- Review and rating system
- Sell-out warnings / scarcity nudges
- Weather-triggered deal suggestions
- End-of-night clearance prompts
- Table/pitch number delivery
- Waitlist mode for sold-out events

---

## 9. Pitch Sprint Plan — 3 Weeks to La Muletti Meeting

| Session | Focus | Goal |
|---------|-------|------|
| 7 | MVP Completion | ✅ Kitchen closed → app, real-time order status customer side |
| 8 | Customer Account / Members Area | ✅ Account page + desktop panel, live orders, history, drill-down |
| 8b | Multi-tenancy Future-Proofing Audit | ✅ No literals found; CONFIG.domains added; minor kitchen.js tidy logged |
| 9 | Google Sheets Menu Management | ✅ menuSheetUrl in config.js, CSV fetch, fallback, XSS defence, scroll reveal fix |
| 10 | News/Locations feed + Offers/Deal Codes | Customer app pages, Sheets driven |
| 11 | Demo polish | End-to-end demo reset function, rough edges removed |
| 12 | Pitch deck update | Stalliq rebrand, kitchen co-pilot angle, roadmap slide with vision features |

**What gets demoed live at the meeting:**
- Customer places order on phone → kitchen receives it instantly
- Kitchen accepts, sets wait time → customer sees status update live
- Customer dismisses modal → lands on Account page showing live order
- Customer can place multiple orders (forgot something) → both visible in Account
- Tap any order card → full detail view (items, prices, status, timestamp)
- Account page shows loyalty stamps and offers — hints at the roadmap
- Vendor edits menu in Google Sheet → customer app reflects it within minutes
- News/locations and offers pages on the customer app

**What goes on the roadmap slide (promised, not yet built):**
- SMS + WhatsApp order status notifications
- Live location broadcast → geofence at scale
- Full loyalty stamp card + personalised offers
- Flash offers by geolocation
- AI Order Assist — order by voice or natural language

---

## 10. Firebase Backend — Spec

**Tech stack:** Firestore + Firebase Auth + Firebase Cloud Functions

**Firebase project:** `stalliq` (stalliq.firebaseapp.com)
**Firebase account:** julian@endoo.co.uk (Google account linked to M365 email)
**Firebase SDK version:** 10.12.2 (CDN compat — no bundler needed)
**Firebase Phone Auth test numbers:**

| Number | Code |
|--------|------|
| +44 7700 900001 | 123456 |
| +44 7700 900002 | 123456 |
| +44 7700 900003 | 123456 |
| +44 7700 900004 | 123456 |
| +44 7700 900005 | 123456 |

⚠️ **Real numbers should never be used for testing** — Firebase throttles/blocks repeated SMS to the same number. Use test numbers only. Each test number is an independent Firebase user — `900002` onward will hit the full registration flow fresh.

**Order flow:**
1. Customer places order → status: `pending`
2. Owner accepts → status: `accepted`, wait time set
3. `accepted` → `preparing` → `ready`
4. Customer sees live status in real time (confirmation modal + Account page)
5. Customer collects and pays

**Firestore structure:**
```
vendors/{vendorId}/
  kitchenStatus: "open" | "closed_busy" | "closed_end" | "closed_today"
  counters/daily → { date, count }  ← order ref counter, resets midnight

orders/{orderId}/
  vendorId, orderRef, customerId, customerName, customerPhone,
  items, orderTotal, payment, status, waitMins,
  expiresAt, createdAt, updatedAt

users/{uid}/
  firstName, phone (verified), createdAt

subscribers/{subscriberId}/
  vendorId, location, radius, notifyVia, lastNotified
```

**Firestore security rules required:**
```
match /orders/{orderId} {
  allow read: if request.auth != null
              && resource.data.customerId == request.auth.uid;
  allow create: if request.auth != null;
}
```

**Firestore composite index required:**
The Account page queries orders by `(customerId + createdAt desc)`. Firestore will not create it automatically — on first run it surfaces a direct link in the browser console (`failed-precondition` error). Click the link, create the index, wait ~60–90 seconds to build. **Already created for La Muletti ✅**

---

## 10a. Order Submission — ✅ COMPLETE

**Customer journey:**
1. Basket review → customer reviews items + total
2. Auth check → already logged in? Skip to step 5
3. Enter mobile number → receive SMS code → verified (Firebase Phone Auth)
4. Enter first name → stored against uid for all future orders
5. Confirm order → single tap "Place Order"
6. Confirmation modal → shows order ref e.g. `#007`, live status updates
7. Customer dismisses modal → routed to Account page to track live order

**Repeat customer:** steps 2-4 skipped — one tap to confirm.

---

## 10b. Kitchen Close Feature — ✅ COMPLETE

| Status | Customer-facing message | Use case |
|--------|------------------------|----------|
| `open` | Normal ordering | Default |
| `closed_busy` | "We're really busy right now — back shortly!" | Queue overwhelmed |
| `closed_end` | "We're closing up for tonight — see you next time!" | End of service |
| `closed_today` | "We're not trading today — see you soon!" | No service today |

---

## 10c. Kitchen Dashboard — ✅ COMPLETE (MVP scope)

**URL:** `stalliq-demo.netlify.app/kitchen.html`
**PIN:** 1234 (set in `CONFIG.kitchen.pin`)

**Built in Session 7b Task 1 (Kitchen Closed → Customer App) ✅:**
- `app.js` Section 30: `initKitchenStatusListener()` — Firestore `onSnapshot` on `vendors/lamuletti`
- `applyKitchenStatus(status)` — updates shared `kitchenStatus` var and reacts across both views
- Mobile: sticky red banner at top of home page + Place Order button disabled/renamed "Kitchen Closed"
- Desktop: dark (`#1A0A00`) full-width sticky banner injected as first child of `<body>`, above nav, with fire red bottom border
- All three closed statuses show correct message
- Fails open — if Firestore unreachable, ordering stays available

**Built in Session 7b Task 2 (Real-time Order Status) ✅:**
- `app.js` Section 31: `startOrderStatusListener(orderId)` — Firestore `onSnapshot` on specific order doc
- Status block injected into confirm modal (mobile) and overlay (desktop)
- Time display updates live: ⏳ pending → ~X mins on accept
- Ready state: icon, title, button text all flip on mobile + desktop
- `stopOrderStatusListener()` fully resets modal + overlay for next use
- `[Stalliq]` console diagnostics throughout

**Built in Session 6:**
- PIN screen on load — 4-digit, auto-submits, shakes on wrong entry
- Kanban board — 4 columns: Pending | Accepted | Preparing | Ready
- Horizontal drag/scroll between columns (Pointer Events API)
- Order cards — ref, customer name, items, elapsed time, status badge, action button
- Accept order + wait time modal — options from `CONFIG.ordering.waitOptions`
- Status tap-through: `accepted → preparing` (single tap), `preparing → ready` (confirm modal)
- Collected (removes from queue)
- Kitchen close toggle — 4-option modal in header, writes to Firestore immediately
- Order detail drill-down — tap card body to open full detail modal
- Sound alert on new pending order (two beeps via Web Audio API)
- Elapsed time counter per card — turns amber at 10 mins, red at 20 mins

**Pending (locked spec — post-pitch):**
- Large order handling (distinct card colour + surfaces close kitchen option)
- Backwards status movement (long press + confirm)
- Named credentials / role-based access (owner vs staff)
- ⚠️ Minor tidy (Session 11): `orderCardHTML` in `kitchen.js` hardcodes `£` and `'cash on collection'` — should use `CONFIG.business.currency` and `CONFIG.ordering.paymentNote`

---

## 11. Customer Account / Members Area — ✅ COMPLETE (Session 8)

**Mobile:** 6th page (`#page-account`) always present in nav (👤 Account)
**Desktop:** 440px slide-in panel from nav link (👤 Account) — same content, z-index 1100 (above nav)

**Three states (both mobile + desktop):**

**Logged out:**
Clean login prompt. "Sign in to track your orders and collect stamps." Reuses existing phone auth overlay. Auth overlay title/subtitle switches context (order flow vs account sign-in) and resets correctly when triggered from the order flow.

**Logged in, no activity:**
- Welcome by first name
- Loyalty stamp card: 3/10 filled stamps, "Buy 9 get your 10th free", "Coming soon" badge
- Offers: two static placeholder cards, "Coming soon" badge
- Empty order history nudge

**Logged in with activity:**
- Live Orders section — one card per active order (pending/accepted/preparing/ready) with real-time status listener. Live section and history are strictly separated — pending orders never appear in history.
- Loyalty + offers as above
- Order history — collected/cancelled orders only, most recent first

**Order history display:**
- 90-day window — keeps display manageable; actual database cleanup via Cloud Function deferred to post-pitch
- Limit 50 per query
- Shows 3 items initially; "Show X more" button reveals the rest inline (no second Firestore call — uses `historyRemainder` client-side)
- "Showing last 3 months" label at foot of list
- `status-collected` badge: neutral white. `status-cancelled` badge: red tint.

**Order detail drill-down (shared mobile + desktop):**
Slide-up sheet on mobile, centred modal on desktop. Shows: order ref, date/time, status badge, itemised list with per-line prices, payment method, total. Populated from `orderCache`.

**Reorder:**
Collected history cards have a 🔁 Reorder button. `reorderItems(orderId)` clears basket, adds back available items, routes to basket. Items removed from menu silently skipped.

**Post-order flow:**
Modal dismiss routes to Account page (not Home) so customer immediately sees their live order.

**Firestore queries:**
- Orders: `where customerId == uid, where createdAt >= 90 days ago, orderBy createdAt desc, limit 50`
- Requires composite index on `(customerId, createdAt)` — already created for La Muletti ✅

---

## 12. Google Sheets Menu Management — ✅ COMPLETE (Session 9)

**Problem solved:** Menu changes previously required editing `config.js`, pushing to GitHub, waiting for Netlify deploy. Vendors cannot manage this themselves.

**Solution:** Menu data fetched from a published Google Sheet CSV at page load. Vendor edits the sheet, app reflects changes within minutes. No code changes, no deploy required.

**Implementation:**
- `CONFIG.menuSheetUrl` — published CSV URL in `config.js`, first field inside the CONFIG object
- `app.js` Section 22 — `fetchMenuFromSheet()`, `parseMenuCSV()`, `parseCSVLine()`
- `DOMContentLoaded` is `async` — seeds `menuData = CONFIG.menu` first, then `await fetchMenuFromSheet()`
- All render functions use `menuData` — never `CONFIG.menu` directly
- Graceful fallback: sheet unavailable, empty, or URL missing → `config.js` menu loads silently with `[Stalliq]` console warning
- `initScrollReveal()` called again after sheet load to fix double-render orange background issue (scroll reveal observer ran before sheet cards were injected)

**XSS defence:**
- `esc()` utility in Section 4 — HTML-encodes `<`, `>`, `&`, `"` before innerHTML insertion
- Applied to all sheet-sourced fields: `name`, `desc`, `diet` in menu render functions; `name` in basket, summary, order history display
- Firestore writes use raw values — `esc()` is for HTML output only
- Worst-case if vendor Google account is compromised: UI text vandalism only — no code execution possible

**Sheet structure (header row required, column order flexible):**
```
id | name | price | description | diet | available
```
- `price`: number only, no currency symbol
- `diet`: free text (VE, V, 🌶️) or blank
- `available`: TRUE/FALSE — omit to default all items to TRUE
- Descriptions with commas must be wrapped in "double quotes"

**La Muletti sheet:**
- URL stored in `CONFIG.menuSheetUrl` in `config.js`
- Published: File → Share → Publish to web → CSV
- Sheet is intentionally public — menu data is already displayed to all customers, nothing sensitive

**Vendor workflow (after initial setup):**
1. Open Google Sheet (bookmark on phone or desktop)
2. Edit any cell — price, name, toggle available to FALSE
3. Google autosaves
4. App picks it up on next customer page load

**Operator setup per new customer:**
1. Create Google Sheet, add header row, populate menu
2. Protect header row (right-click → protect range) so vendor can't break structure
3. File → Share → Publish to web → CSV → copy URL
4. Add URL to `config.js` as `CONFIG.menuSheetUrl`
5. Share Sheet with vendor (edit access via their Google account)
6. Advise vendor: sheet is public, only put customer-facing content in it; enable 2FA on Google account

**Security notes:**
- Sheet URL is public by design — same category as hero images and config.js served by Netlify
- Allergen risk: if vendor writes false allergen info (accidental or via compromised account), that's a real-world liability not a code issue — covered by vendor onboarding advice and 2FA recommendation
- Both allergen warning and 2FA requirement to be added to go-live checklist and vendor onboarding doc (Session 11 or later)

---

## 13. Geofence Feature — Spec

1. Customer subscribes, sets location + radius (1/3/5 miles) + notification preference
2. Cheap Android device in van pings GPS to Firebase every 60 seconds
3. Cloud Function matches van location to subscribers, fires notification to anyone in radius not notified in past 24 hours

**Rate limiting:** 1 notification per customer per vendor per 24 hours
**Channels:** SMS via Twilio first, WhatsApp later
**iOS caveat:** Use dedicated Android in van — iOS kills background location

---

## 14. Flash Sales — Spec

Vendor taps "Launch Flash Deal" → picks preset or custom → sets claim limit/time limit → broadcasts instantly.

Presets: First N orders X% off / Item at special price / Buy 2 get drink / Tonight only price

Dashboard shows live claim count. Auto-expires at zero.

Broadcast to: geofence subscribers only OR full list.

---

## 15. AI Order Assist — Vision Feature

Customer taps AI chat bubble → types or dictates order in natural language → AI parses into basket items → customer reviews and confirms → normal checkout flow.

**Why it works:** Menu is small and fixed. "Two Margheritas and a Bella Pepperoni" is a solved problem for an LLM. Dictation is free via smartphone keyboard.

**Why it matters:** No Just Eat, no Deliveroo, no Flipdish offers this at £29/month. It's a demo moment.

**Guardrails needed:** Stay on-task (no off-menu items), handle allergy questions carefully, cost per conversation monitoring at scale.

**Roadmap position:** Feature 19 — post loyalty and self-service.

---

## 16. Deployment Pipeline ✅

**Hosting:** Netlify — https://stalliq-demo.netlify.app/
**GitHub:** https://github.com/JulianBell106/lamulettipizza
**Auto-deploy:** Netlify linked to GitHub ✅

**Workflow:**
1. Claude produces files in `/mnt/user-data/outputs/lamuletti/`
2. Julian downloads + copies into local repo (maintaining `css/` and `js/` folders)
3. GitHub Desktop → commit → Push origin
4. Netlify auto-deploys in ~30 seconds

---

## 17. Key Decisions Made

- Multi-tenancy: one deployment per customer for 0-5, then scale
- `config.js` is single file that changes per customer
- Desktop = landing page + slide-in panels, Mobile = PWA app shell, 768px breakpoint
- Endoo stays as IT services holding company
- Platform trades as Stalliq (stalliq.co.uk)
- La Muletti free year 1 — agreed with Daniele
- No commission ever — flat monthly fee
- Build SMS notifications first, WhatsApp later
- Dedicated Android device in van for geofence tracking
- Midsummer Place vendors = secondary market year 2+
- Approach Sophie once La Muletti has real orders flowing
- Payment: cash on collection for MVP
- Auth: Firebase Phone Auth — verified mobile captured at first order, remembered on device
- Order ref: daily sequential (`#001` format), resets midnight, Firestore transaction
- MI data: captured automatically from order object from day one
- No guest checkout — Phone Auth IS the guest experience
- Firebase project named `stalliq` — vendor ID `lamuletti` in Firestore
- Firebase SDK: CDN compat v10.12.2 — no bundler needed
- Kitchen dashboard = same Netlify deployment as customer app (`/kitchen.html`)
- Wait time options configurable per vendor in `CONFIG.ordering.waitOptions`
- Secondary text colour must use `rgba(255,255,255,0.X)` not cream-based opacity (brown-on-brown problem)
- `kitchen.html` CSS is embedded (not separate file) — branding is data-driven via CONFIG at runtime
- Item notes field (`notes: null`) already in order data model — UI deferred to post-pitch backlog
- SMS/WhatsApp and live location: roadmap promises for pitch — not built before meeting
- AI Order Assist: vision feature — natural language + dictation ordering, no comparable product at this price point
- Kitchen closed banner on desktop: dark background (`#1A0A00`) injected at top of `<body>` — fire red banner blended invisibly into the orange strip bar
- Kitchen status listener fails open — Firestore unreachable does not block ordering
- Session chunking: large file outputs cause conversation timeouts — break each session into single-file chunks with fresh conversation per chunk
- Order status listener: inject-into-modal approach (not separate page) — modal is ephemeral, Account page is persistent
- Multiple concurrent orders supported — customer can dismiss modal → routed to Account page; both orders visible with individual listeners
- Account page always visible in nav (logged out shows login prompt) — loyalty card is a reason to open app even without ordering
- Loyalty + offers: static/placeholder for demo, "Coming soon" badge — shows roadmap without over-promising
- `stopOrderStatusListener()` fully resets modal + overlay state so second order in same session renders cleanly
- Pricing: £19 Starter / £59 Growth / £99 Pro — annual plans 2 months free — monthly rolling, no contracts
- Founding customer offer: 50% lifetime discount locked as long as subscription continuous (first 5 customers)
- Sophie partnership: 20% recurring commission, 24-month cap per customer — structure locked in Section 22
- Desktop account panel: 440px slide-in, z-index 1100 (above nav at 1000) — same pattern as basket panel
- `buildAccountIds(prefix)` maps 'm'/'d' to correct element IDs — single render logic serves both panels
- `orderCache` — client-side map populated on account load, enables instant detail drill-down without Firestore re-fetch
- Order detail overlay: shared mobile/desktop — slide-up sheet on mobile, centred modal on desktop (CSS handles difference)
- Post-order dismiss routes to Account page, not Home — customer immediately sees their live order
- Firestore composite index on `(customerId, createdAt)` required for order history query — already created for La Muletti ✅
- Real phone numbers must never be used for testing — Firebase throttles repeated SMS; always use Firebase test numbers
- History shows collected/cancelled only — pending/active orders live in Live Orders section exclusively
- 90-day history window with limit 50 — display concern not storage; Cloud Function for actual deletion is a future task
- Show 3 history items initially with "Show X more" button — `historyRemainder` stores hidden orders, revealed inline without a second Firestore call
- Status badge colours: collected = neutral white, cancelled = red tint — never use opacity stacking on already-low-opacity rgba colours
- Reorder button on collected history cards — `reorderItems()` clears basket, adds available items, routes to basket
- Items removed from menu silently skipped on reorder; if all unavailable a gentle alert is shown
- Session 8b audit: no `"lamuletti"` literals found in `app.js` or `kitchen.js` — `CONFIG.vendor.id` used consistently
- `CONFIG.domains` added to `config.js` as a forward-compatible field — lists valid domains per deployment
- Minor tidy deferred to Session 11: `kitchen.js` `orderCardHTML` hardcodes `£` and `'cash on collection'`
- Menu management: Google Sheets CSV approach — vendor edits sheet, app updates within minutes, no deploy
- `CONFIG.menuSheetUrl` must be inside the CONFIG object — placing it outside breaks the entire file (lesson from Session 9)
- `menuData` module-level variable — seeded from `CONFIG.menu`, replaced by sheet data if fetch succeeds; all render functions use `menuData` never `CONFIG.menu` directly
- `DOMContentLoaded` made async to await `fetchMenuFromSheet()` before any render call
- `esc()` utility — HTML-encodes sheet-sourced strings before innerHTML; Firestore writes use raw values
- Sheet is intentionally public — menu data already visible to all customers, no sensitive data
- `initScrollReveal()` called again after sheet load — fixes double-render issue where second `renderDesktopMenu()` call injected cards that the initial observer never saw, causing menu section background to render more orange
- Allergen false-info risk and 2FA recommendation to be added to go-live checklist + vendor onboarding doc (Session 11)
- CSV column order is flexible — `parseMenuCSV()` matches columns by header name, not position
- Quoted CSV fields handled correctly — commas inside "double quoted" descriptions are safe
- Google Sheet protect header row on setup — vendor can edit values but not break column structure

---

## 18. Core Product Principle — Kitchen Management Co-pilot

Independent food vendors are brilliant at their craft but are not trained kitchen managers. When orders pile up they have no system — they react. Quality drops, customers wait without knowing why, the experience falls apart.

**Stalliq is a kitchen management co-pilot for people who've never had one.**

The app promotes good decisions at exactly the moments when a vendor is most likely to make bad ones. The system surfaces the right options at the right time: close the kitchen, set a longer wait, keep the customer informed. One tap.

---

## 19. Pitch Deck

**File:** `vendorapp-pitch-v2.pptx` (11 slides)
**TODO:** Rename/update to reflect Stalliq branding.
**TODO:** Update slide 11 with real Endoo contact details. Add QR code to slide 7.
**TODO:** Add kitchen management co-pilot angle.
**TODO:** Add roadmap slide covering SMS/WhatsApp, live location, geofence, customer login, loyalty, AI Order Assist.

---

## 20. Next Session — Session 10: News/Locations Feed + Offers/Deal Codes

Paste the current `app.js` and `index.html` at the start of the session.

**What to build:**
Two new content areas driven by Google Sheets — same pattern as the menu sheet:
1. **News & Locations feed** — upcoming events and where to find the van. Vendor updates their sheet, app reflects it. Replaces the hardcoded `CONFIG.events` array.
2. **Offers & Deal Codes** — offers visible on the customer app. Static display for now; discount code redemption deferred to post-pitch.

**Key things to get right:**
- Same sheet fetch pattern as menu — graceful fallback to `config.js` data if unavailable
- Two separate sheets (events/locations and offers) or one combined sheet — decide at session start
- Offers page is a new mobile nav section or integrated into the Account page — decide at session start
- Keep it demo-ready: even with placeholder data it should look complete and real

---

## 21. Working Rhythm

**Start:** "New session — ignore the project file attachment, read the live PROJECT.md from GitHub instead: https://raw.githubusercontent.com/JulianBell106/lamulettipizza/refs/heads/main/PROJECT.md — today we're working on [task]"

**End:** "Update PROJECT.md" → download → copy to repo → commit → push

**Always work inside the La Muletti Claude Project.**
**One session = one focused task.**
**One chunk = one file output = one conversation.**

---

## 22. Sophie Partnership

**Who:** Sophie (sophieetc.com) — runs MK's definitive food blog, organises Sophie's Street Feast, background in marketing (ex-Bletchley Park), currently runs her own social media consultancy. Commercially literate, understands SaaS economics, has the relationships we don't.

**Why:** Independent food vendors trust other vendors and trusted local voices — not founders cold-calling. Sophie is the fast path to credibility across MK, Bedford, Northampton. Without her the plan still works but slower and with lower close rates.

**Commercial structure:**

| Term | Value |
|------|-------|
| Commission | 20% of gross monthly subscription |
| Duration | 24 months per customer, from their first paid month |
| Payment | Monthly via bank transfer, in arrears |
| Applies to | Customers Sophie introduces only — not La Muletti, not organic inbound, not Julian's direct closes |
| Churn | Commission stops when a customer churns — aligns incentives to retention |
| After 24 months | Commission ends, customer becomes full-margin to Stalliq |

**Timing of approach:** Month 4-5, once La Muletti has 2-3 months of real order data and at least one quotable success metric.

**Written agreement required before first customer signs.**

---

## 23. Go-Live Checklist ⚠️

Tasks that must be completed before going live with any real customer. Not blockers for demo/testing — blockers for production.

| # | Task | Notes |
|---|------|-------|
| 1 | **Firestore composite index** | Required for Account page order history query. Already created for La Muletti ✅. For each new customer deployment: on first login to Account, open browser console — Firestore will log a `failed-precondition` error with a direct link to create the index. Click it, wait ~60–90 seconds to build. One-time task per Firebase project. |
| 2 | **Firestore security rules** | Ensure the orders read rule is deployed: `allow read: if request.auth != null && resource.data.customerId == request.auth.uid;` Check in Firebase Console → Firestore → Rules. |
| 3 | **Remove `noindex, nofollow`** | The demo site has a robots meta tag preventing search indexing. Remove from `index.html` before going live on the customer's real domain. |
| 4 | **Firebase Phone Auth — real domain** | Add the production domain to Firebase Auth → Settings → Authorised Domains. Without this, Phone Auth will silently fail on the live URL. |
| 5 | **Remove Firebase test numbers** | Before or shortly after go-live, remove test numbers from Firebase Console → Authentication → Sign-in method → Phone → Test numbers. Not a security risk but keeps things clean. |
| 6 | **CONFIG.vendor.id** | Confirm `config.js` has correct vendor ID. Never hardcode as a string literal anywhere in `app.js` or `kitchen.js`. |
| 7 | **CONFIG.domains** | Update `config.js` `domains` array to include the customer's live domain once known. |
| 8 | **Kitchen PIN** | Change `CONFIG.kitchen.pin` from `1234` to something the vendor chooses. |
| 9 | **`noindex` on kitchen.html** | Add `<meta name="robots" content="noindex, nofollow">` to `kitchen.html` — the kitchen dashboard should never appear in search results. |
| 10 | **Google Sheet — protect header row** | Right-click row 1 → Protect range — vendor can edit cell values but cannot delete or reorder columns. |
| 11 | **Google Sheet — vendor 2FA** | Advise vendor to enable 2FA on their Google account. A compromised account could write false allergen information to the sheet — this is a real-world liability risk, not just a technical one. Include in vendor onboarding doc. |
| 12 | **Allergen disclaimer** | Add to vendor onboarding doc: the sheet is public and customer-facing. Only put accurate, customer-safe content in it. False allergen info (accidental or via compromised account) is a liability. |
