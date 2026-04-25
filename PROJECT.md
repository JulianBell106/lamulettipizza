# Stalliq — Project Bible
> Last updated: April 2026 — Session 12 Complete (Colour & UX overhaul)
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
- `--text-muted`:     `rgba(253,246,236,0.55)` — raised from 0.45 (Session 12); 0.45 was failing WCAG AA on dark bg

**Colour architecture rules (established Session 12):**
- `--fire` reserved for: nav CTA, hero primary button, basket button, Place Order button, pizza card left accent border, dietary hot badge, stamp dot fill, auth buttons, basket badge
- `--gold` reserved for: prices, dates, section eyebrows, founder roles, accent rules, active nav state
- Fire red and gold must never both appear on the same element — they are separate roles, not interchangeable
- No cream section backgrounds — the brand is dark. Light/dark rhythm is achieved by varying the darkness of dark sections, not by introducing cream panels
- Gradient button endpoint: `#8B1810` (dark true red — was #A83200 dark orange)
- All hardcoded `rgba(200,65,11,...)` shadow values → `rgba(196,39,26,...)`

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
| 12 | SMS & WhatsApp Status Notifications | ⏳ Planned | Customer notified on order status changes — Twilio. Applies to app orders AND walk-ins with phone number |
| 13 | Live Location Broadcast | ⏳ Planned | Van location shown live on customer app — foundation for geofence at scale |
| 14 | Geofence Notifications | ⏳ Planned | Van enters subscriber's area → phone buzzes |
| 15 | Flash Sales & Broadcasts | ⏳ Planned | Vendor launches deal in seconds, broadcasts to subscribers |
| 16 | Loyalty Stamp Card | ⏳ Planned | Digital stamp card — no paper needed |
| 17 | Flash Offers by Geolocation | ⏳ Planned | Customer in area gets notified of live deal |
| 18 | Pre-order Time Slots | ⏳ Planned | Order now, collect at chosen time |
| 19 | Vendor Self-Service | ⏳ Planned | Vendor manages own menu, events, location — full self-service portal |
| 20 | MI & Reporting | ⏳ Planned | Daily order count, revenue totals, product breakdown — CSV or Looker Studio |
| 21 | AI Order Assist | 🌟 Vision | Customer orders in natural language — type or dictate. AI parses into basket, normal checkout flow. |

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

## 9. Pitch Sprint Plan — La Muletti Meeting

| Session | Focus | Goal |
|---------|-------|------|
| 7 | MVP Completion | ✅ Kitchen closed → app, real-time order status customer side |
| 8 | Customer Account / Members Area | ✅ Account page + desktop panel, live orders, history, drill-down |
| 8b | Multi-tenancy Future-Proofing Audit | ✅ No literals found; CONFIG.domains added; minor kitchen.js tidy logged |
| 9 | Google Sheets Menu Management | ✅ menuSheetUrl in config.js, CSV fetch, fallback, XSS defence, scroll reveal fix |
| 10 | News/Locations feed + Offers | ✅ eventsSheetUrl + offersSheetUrl in config.js, both live from Google Sheets |
| 10b | Desktop UX Redesign | ✅ Premium redesign: editorial menu, no strip bar, SVG icons, How It Works, noise texture, staggered reveals |
| 10c | Menu images + contrast sweep | ✅ Food photos via Google Sheet image column, mobile image cards, all brown-on-brown text fixed |
| 11 | Walk-in Manual Order Entry + Desktop CSS overhaul | ✅ Walk-in orders on kitchen dashboard; full index.html CSS rebuild |
| 12 | Colour & UX overhaul | ✅ True red token, dietary badges, deeper menu section, card accent — index.html only |
| 13 | Pitch deck update | Stalliq rebrand, kitchen co-pilot angle, roadmap slide with vision features |

**What gets demoed live at the meeting:**
- **Premium desktop site shown first on laptop — sets the brand tone before any ordering demo**
- Customer places order on phone → kitchen receives it instantly
- Kitchen accepts, sets wait time → customer sees status update live
- Customer dismisses modal → lands on Account page showing live order
- Customer can place multiple orders (forgot something) → both visible in Account
- Tap any order card → full detail view (items, prices, status, timestamp)
- **Vendor takes walk-up order on kitchen tablet → drops into Pending column instantly → same flow as app order**
- **Walk-up customer gives phone number → seeds database for future SMS notifications**
- Account page shows loyalty stamps and offers — hints at the roadmap
- Vendor edits menu in Google Sheet → customer app reflects it within minutes
- Find Us page shows upcoming events from Google Sheet — vendor updates in seconds
- Account page shows offers from Google Sheet — vendor controls what's live

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

⚠️ **Real numbers must never be used for testing** — Firebase throttles/blocks repeated SMS to the same number. Use test numbers only.

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
  vendorId, orderRef, source, customerId, customerName, customerPhone,
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
The Account page queries orders by `(customerId + createdAt desc)`. Already created for La Muletti ✅. For each new customer deployment: on first login to Account, open browser console — Firestore will log a `failed-precondition` error with a direct link to create the index.

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

## 10c. Kitchen Dashboard — ✅ COMPLETE

**URL:** `stalliq-demo.netlify.app/kitchen.html`
**PIN:** 1234 (set in `CONFIG.kitchen.pin`)

**Scroll architecture (fixed Session 11):**
- `html, body` → `overflow: hidden`
- `#k-dashboard` → `display: flex; flex-direction: column; height: 100dvh`
- `.k-orders` → `flex: 1; align-items: stretch` — fills remaining height
- `.k-col` → `overflow: hidden; flex column` — clips content
- `.k-col-cards` → `flex: 1; overflow-y: auto` — vertical scroll per column
- `.k-orders.is-empty` toggles `align-items: center` for the no-orders state

**Built features:**
- PIN screen — 4-digit, auto-submits, shakes on wrong entry
- Kanban board — 4 columns: Pending | Accepted | Preparing | Ready
- Horizontal drag/scroll between columns (Pointer Events API)
- Vertical scroll within each column when cards overflow
- Order cards — ref, customer name, items, elapsed time, status badge, action button
- Walk-in badge on cards (`source: 'walkin'`)
- Accept order + wait time modal — options from `CONFIG.ordering.waitOptions`
- Status tap-through: `accepted → preparing` (single tap), `preparing → ready` (confirm modal)
- Collected (removes from queue)
- Kitchen close toggle — 4-option modal in header, writes to Firestore immediately
- Order detail drill-down — tap card body to open full detail modal
- Sound alert on new pending order (two beeps via Web Audio API)
- Elapsed time counter per card — turns amber at 10 mins, red at 20 mins
- ➕ New Order button — walk-in order entry (see Section 10d)
- `CONFIG.business.currency` and `CONFIG.ordering.paymentNote` used throughout (no hardcoded £ or 'cash on collection')

---

## 10d. Walk-in Manual Order Entry — ✅ COMPLETE (Session 11)

**Problem solved:** Walk-up customers not in the system — split queue between app and verbal orders.

**Solution:** "➕ New Order" button in kitchen header. Vendor taps, picks items, enters customer name (required) and optional phone number. Order drops into Pending column identically to an app order.

**Firestore order document differences from app orders:**

| Field | App order | Walk-in order |
|-------|-----------|---------------|
| `source` | `'app'` | `'walkin'` |
| `customerId` | Firebase Auth uid | `null` |
| `customerPhone` | Verified by Firebase Auth | Entered manually, unverified |
| `customerName` | From users/{uid} doc | Entered by vendor in modal |

**Walk-in badge** shown on kanban card and in detail drill-down.
**Order ref** uses same `getNextOrderRef()` daily sequential counter — one unified sequence.
**Phone number** seeds customer database from day one — SMS notifications apply automatically when that feature is built, no code change required.

---

## 11. Customer Account / Members Area — ✅ COMPLETE (Session 8)

**Mobile:** 6th page (`#page-account`) always present in nav (👤 Account)
**Desktop:** 440px slide-in panel from nav link — same content, z-index 1100

**Three states:** Logged out (login prompt) | Logged in no activity (welcome + placeholders) | Logged in with activity (live orders + history + placeholders)

**Live orders:** real-time Firestore listeners keyed by `orderId` (map, not single var)
**Order history:** 90-day window, limit 50, 3 shown initially with "Show X more"
**Reorder:** button on collected history cards — clears basket, adds available items, routes to basket
**Composite Firestore index** on `(customerId, createdAt)` — already created for La Muletti ✅

---

## 12. Google Sheets — Menu, Events & Offers — ✅ COMPLETE

**Three sheets, three URLs in config.js:**

| Sheet | Config key | Page |
|-------|-----------|------|
| Menu | `menuSheetUrl` | Menu (mobile + desktop card grid) |
| Events | `eventsSheetUrl` | Find Us (mobile + desktop contact section) |
| Offers | `offersSheetUrl` | Account page Offers section |

All fetches run concurrently via `Promise.all` at init. Graceful fallback to `CONFIG` data if sheet unavailable. `active = FALSE` on any row hides it without deleting. `esc()` applied to all sheet-sourced fields.

**Menu sheet column:** `id | name | price | description | diet | available | image`
**Events sheet column:** `day | month | name | location | active`
**Offers sheet column:** `icon | title | description | badge | active`

**Menu food images:** optional `image` column — vendor pastes ibb.co direct link. Desktop card: 180px photo at top. Mobile card: stacked layout with photo when present. URL validated to start with `http` before use.

---

## 13. Colour & UX Overhaul — ✅ COMPLETE (Session 12)

**Root cause identified:** The entire palette lived within a ~20° hue arc (HSL 15–40°). Background, primary CTA, and accent gold were all in the same warm orange-brown thermal register. No hue contrast — only lightness contrast. Buttons glowed weakly. Sections blurred together.

**Changes made to `index.html` only:**

| What | Before | After | Reason |
|------|--------|-------|--------|
| `--fire` | `#C8410B` (HSL 19° — orange) | `#C4271A` (HSL 5° — true red) | Orange on dark brown = low contrast; red pops cleanly |
| `--ember` | `#E85D2A` (orange hover) | `#D93B25` (red hover) | Hover state must follow the base shift |
| `--text-muted` | `rgba(253,246,236,0.45)` | `rgba(253,246,236,0.55)` | 0.45 was ~3.2:1 contrast — failing WCAG AA |
| Gradient endpoint | `#A83200` (dark orange) | `#8B1810` (dark red) | All button gradients now graduate within red family |
| Box shadows | `rgba(200,65,11,...)` | `rgba(196,39,26,...)` | Shadow colour matched to new fire token |
| Dietary badges | Mixed emoji (🟢🟡🌶️) | CSS pills `.diet-badge-ve/.diet-badge-v/.diet-badge-hot` | Emoji render inconsistently across Android/iOS/Samsung |
| Desktop menu bg | `linear-gradient(#3A2010 → #2C1A0A)` | `linear-gradient(#1C0906 → #0E0401)` | Deeper/richer dark creates section contrast without leaving the dark palette |
| Pizza card left border | `rgba(212,160,67,0.55)` gold | `var(--fire)` true red | Red accent per card — immediate visual identity for menu items |
| Pizza card hover | Gold border glow | Red ring `rgba(196,39,26,0.25)` + lift | Consistent with red-left-accent language |
| `.status-preparing` | `rgba(255,130,50,...)` orange | `rgba(217,59,37,...)` red-aligned | Matches new ember token |

**What was tried and rejected:** Cream background (`#F5ECD6`) for the desktop menu section. Looked out of place — breaks the premium dark brand feel. The section needed more darkness, not less.

**Dietary badge classes:**
```css
.diet-badge      — base pill styles
.diet-badge-ve   — green, for Vegan
.diet-badge-v    — soft green, for Vegetarian
.diet-badge-hot  — muted red, for Spicy
```
Used in both the mobile diet legend and the desktop menu note. `app.js` uses `.m-card-diet` for inline diet labels — those remain as text; only the legend/note use the new pill classes.

---

## 14. Desktop Site — Architecture & CSS Notes

**All desktop styles live in the `<style>` block inside `index.html`** — not in `css/styles.css`. This was discovered after multiple failed attempts to fix the hero via `styles.css`. Key lesson: never edit `css/styles.css` for desktop layout fixes.

**Desktop design principles:**
- Fire red (`#C4271A`) reserved for exactly three CTAs: nav Order Now, hero View Menu, basket Place Order — plus pizza card left accent border
- Gold reserved for: prices, dates, eyebrow labels, accent rules, active nav state
- No emoji on desktop — SVG line icons for contact cards, plain text elsewhere
- Cormorant Garamond for: menu descriptions, event locations, hero subtitle area, step descriptions, editorial notes
- `.d-texture` noise overlay on all dark sections — 2.8% opacity SVG fractalNoise
- Nav links: `::after` underline slides in from left on hover

**Hero (current values after Session 11 overhaul):**
- `height: 52vh; min-height: 400px`
- Title: `clamp(36px, 3vw, 46px)` — "Authentic Pizza," stays on one line at all desktop widths
- Subtitle hidden (`display: none`) — reduces visual clutter
- `d-hero-content` has `width: 100%` — essential to prevent text-wrapping in flex container

**Nav CTA specificity fix:**
`.d-nav-links a` has specificity (0,1,1) and `.d-nav-cta` has (0,1,0). Any property set in `.d-nav-cta` without `!important` that also appears in `.d-nav-links a` will lose. All layout-critical properties on `.d-nav-cta` use `!important`. The `::after` pseudo-element (underline effect) is suppressed with `.d-nav-cta::after { display: none !important; }`.

---

## 15. Geofence Feature — Spec

1. Customer subscribes, sets location + radius (1/3/5 miles) + notification preference
2. Cheap Android device in van pings GPS to Firebase every 60 seconds
3. Cloud Function matches van location to subscribers, fires notification to anyone in radius not notified in past 24 hours

**Rate limiting:** 1 notification per customer per vendor per 24 hours
**Channels:** SMS via Twilio first, WhatsApp later
**iOS caveat:** Use dedicated Android in van — iOS kills background location

---

## 16. Flash Sales — Spec

Vendor taps "Launch Flash Deal" → picks preset or custom → sets claim limit/time limit → broadcasts instantly.
Presets: First N orders X% off / Item at special price / Buy 2 get drink / Tonight only price
Dashboard shows live claim count. Auto-expires at zero.

---

## 17. AI Order Assist — Vision Feature

Customer taps AI chat bubble → types or dictates order in natural language → AI parses into basket items → customer reviews and confirms → normal checkout flow.

**Why it works:** Menu is small and fixed. "Two Margheritas and a Bella Pepperoni" is a solved problem for an LLM.
**Why it matters:** No Just Eat, no Deliveroo, no Flipdish offers this at £19/month. It's a demo moment.
**Roadmap position:** Feature 21 — post loyalty and self-service.

---

## 18. Deployment Pipeline ✅

**Hosting:** Netlify — https://stalliq-demo.netlify.app/
**GitHub:** https://github.com/JulianBell106/lamulettipizza
**Auto-deploy:** Netlify linked to GitHub ✅

**Workflow:**
1. Claude produces files in `/mnt/user-data/outputs/lamuletti/`
2. Julian downloads + copies into local repo (maintaining `css/` and `js/` folders)
3. GitHub Desktop → commit → Push origin
4. Netlify auto-deploys in ~30 seconds

---

## 19. Key Decisions Made

- Multi-tenancy: one deployment per customer for 0-5, then scale
- `config.js` is single file that changes per customer
- Desktop = landing page + slide-in panels, Mobile = PWA app shell, 768px breakpoint
- Endoo stays as IT services holding company; platform trades as Stalliq (stalliq.co.uk)
- La Muletti free year 1 — agreed with Daniele
- No commission ever — flat monthly fee
- Build SMS notifications first, WhatsApp later
- Dedicated Android device in van for geofence tracking
- Midsummer Place vendors = secondary market year 2+
- Approach Sophie once La Muletti has real orders flowing
- Payment: cash or card on collection for MVP
- Auth: Firebase Phone Auth — verified mobile captured at first order, remembered on device
- Order ref: daily sequential (`#001` format), resets midnight, Firestore transaction
- MI data: captured automatically from order object from day one
- No guest checkout — Phone Auth IS the guest experience
- Firebase project named `stalliq` — vendor ID `lamuletti` in Firestore
- Firebase SDK: CDN compat v10.12.2 — no bundler needed
- Kitchen dashboard = same Netlify deployment as customer app (`/kitchen.html`)
- Wait time options configurable per vendor in `CONFIG.ordering.waitOptions`
- Secondary text colour must use `rgba(255,255,255,0.X)` not cream-based opacity (brown-on-brown problem)
- CSS for both `index.html` and `kitchen.html` is embedded in their respective `<style>` blocks — not in external files
- Item notes field (`notes: null`) already in order data model — UI deferred to post-pitch backlog
- Menu management: Google Sheets CSV approach — vendor edits sheet, app updates within minutes, no deploy
- `CONFIG.menuSheetUrl` must be inside the CONFIG object
- `esc()` utility — HTML-encodes sheet-sourced strings before innerHTML; Firestore writes use raw values
- All three sheet fetches run via `Promise.all` at init — concurrent, not sequential
- `active = FALSE` on any sheet row hides it without deleting
- Walk-in manual order entry on kitchen dashboard — single source of truth for all orders
- Walk-in orders: `source: 'walkin'`, `customerId: null`, customer name required, phone number optional
- Walk-in phone number seeds customer database from day one — SMS notifications apply automatically when built
- Walk-in order uses same `getNextOrderRef()` daily counter as app orders — one unified sequence
- Kitchen kanban: columns scroll vertically independently; board scrolls horizontally — full overflow solved Session 11
- `CONFIG.business.currency` and `CONFIG.ordering.paymentNote` used in `kitchen.js` — no hardcoded £ or payment strings
- **ALL desktop CSS is in the `<style>` block in `index.html`** — `css/styles.css` does NOT contain desktop styles
- Hero height: `52vh / 400px min`; title: `clamp(36px, 3vw, 46px)`; subtitle hidden
- Nav CTA `.d-nav-cta` requires `!important` on all layout properties — specificity war with `.d-nav-links a`
- `d-hero-content` must have `width: 100%` — prevents flex shrink-wrapping and title wrapping
- Pricing: £19 Starter / £59 Growth / £99 Pro — annual plans 2 months free — monthly rolling, no contracts
- Founding customer offer: 50% lifetime discount locked as long as subscription continuous (first 5 customers)
- Sophie partnership: 20% recurring commission, 24-month cap per customer — structure locked in Section 22
- Desktop account panel: 440px slide-in, z-index 1100 (above nav at 1000)
- `orderCache` — client-side map populated on account load, enables instant detail drill-down without Firestore re-fetch
- Post-order dismiss routes to Account page — customer immediately sees their live order
- History shows collected/cancelled only — pending/active orders live in Live Orders section exclusively
- Reorder button on collected history cards — `reorderItems()` clears basket, adds available items, routes to basket
- Real phone numbers must never be used for testing — Firebase throttles repeated SMS; always use Firebase test numbers
- Session chunking: large file outputs cause conversation timeouts — break each session into single-file chunks
- **Primary colour `--fire` is true red `#C4271A` (HSL 5°), not orange** — orange on warm dark bg = low contrast
- **No cream section backgrounds** — the brand is dark; light/dark rhythm via depth variation in dark sections, not light panels
- Dietary badges are CSS pills, not emoji — emoji render inconsistently cross-device
- Pizza card left border is `var(--fire)` (red) — gold borders are for surrounding structure only
- `--text-muted` is `rgba(253,246,236,0.55)` — never go below 0.55 on dark bg (WCAG AA)
- Gradient button dark endpoint is `#8B1810` — always a dark red, never a dark orange

---

## 20. Core Product Principle — Kitchen Management Co-pilot

Independent food vendors are brilliant at their craft but are not trained kitchen managers. When orders pile up they have no system — they react. Quality drops, customers wait without knowing why, the experience falls apart.

**Stalliq is a kitchen management co-pilot for people who've never had one.**

The app promotes good decisions at exactly the moments when a vendor is most likely to make bad ones. The system surfaces the right options at the right time: close the kitchen, set a longer wait, keep the customer informed. One tap.

---

## 21. Next Session — Session 13: Pitch Deck Update

**Goal:** Update the pitch deck to reflect Stalliq branding and the current product.

**What to cover:**
- Rename/rebrand from the v2 deck to Stalliq
- Update slide 11 with real Endoo contact details
- Add QR code to demo site on appropriate slide
- Add kitchen management co-pilot angle
- Add roadmap slide: SMS/WhatsApp, live location, geofence, loyalty, AI Order Assist
- Replace any placeholder content with real La Muletti screenshots or descriptions

**File:** `vendorapp-pitch-v2.pptx` — paste the raw GitHub URL at session start so Claude can fetch it.

---

## 22. Working Rhythm

**Start:** "New session — ignore the project file attachment, read the live PROJECT.md from GitHub instead: https://raw.githubusercontent.com/JulianBell106/lamulettipizza/refs/heads/main/PROJECT.md — today we're working on [task]"

**End:** "Update PROJECT.md" → download → copy to repo → commit → push

**Always work inside the La Muletti Claude Project.**
**One session = one focused task.**
**One chunk = one file output = one conversation.**

---

## 23. Sophie Partnership

**Who:** Sophie (sophieetc.com) — runs MK's definitive food blog, organises Sophie's Street Feast, background in marketing (ex-Bletchley Park), currently runs her own social media consultancy.

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

## 24. Go-Live Checklist ⚠️

| # | Task | Notes |
|---|------|-------|
| 1 | **Firestore composite index** | Required for Account page order history query. Already created for La Muletti ✅. One-time task per Firebase project. |
| 2 | **Firestore security rules** | `allow read: if request.auth != null && resource.data.customerId == request.auth.uid;` |
| 3 | **Remove `noindex, nofollow`** | Remove from `index.html` before going live on the customer's real domain. |
| 4 | **Firebase Phone Auth — real domain** | Add production domain to Firebase Auth → Settings → Authorised Domains. |
| 5 | **Remove Firebase test numbers** | Firebase Console → Authentication → Sign-in method → Phone → Test numbers. |
| 6 | **CONFIG.vendor.id** | Confirm correct vendor ID. Never hardcode as a string literal. |
| 7 | **CONFIG.domains** | Update to include the customer's live domain. |
| 8 | **Kitchen PIN** | Change from `1234` to vendor's chosen PIN. |
| 9 | **`noindex` on kitchen.html** | `<meta name="robots" content="noindex, nofollow">` — kitchen dashboard must never appear in search results. |
| 10 | **Google Sheet — protect header row** | Right-click row 1 → Protect range — vendor can edit values but not break column structure. |
| 11 | **Google Sheet — vendor 2FA** | Advise vendor to enable 2FA on Google account. Compromised account could write false allergen info. |
| 12 | **Allergen disclaimer** | Include in vendor onboarding doc: menu sheet is public and customer-facing. Accuracy is a liability. |
| 13 | **Events + offers sheet URLs** | Add `CONFIG.eventsSheetUrl` and `CONFIG.offersSheetUrl` for each new customer. |
