# Stalliq — Project Bible
> Last updated: April 2026 — Session 6 (Kitchen Dashboard — Build, Kanban, Drill-down, Contrast)
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

**Commercial arrangement:** Free for year one in exchange for being a reference customer and providing feedback. Year two onwards moves to standard pricing. **Daniele has confirmed he wants to go ahead — meeting being arranged.**

**Demo site (live):** https://stalliq-demo.netlify.app/
**GitHub repo:** https://github.com/JulianBell106/lamulettipizza

> ⚠️ Demo site has `noindex, nofollow` meta tag — will not appear in search results.

---

## 4. Go-To-Market Strategy

**Target geography (years 1-3):** Milton Keynes → Bedford → Northampton
**Target customers:** Independent mobile food vendors — pizza vans, burger vans, street food trucks, market traders
**Secondary market (year 2+):** Fixed kiosk vendors (e.g. Midsummer Place MK) — commission saving angle

**Key channel — Sophie etc.:**
Sophie (sophieetc.com) runs the definitive MK food blog and organises Sophie's Street Feast. She knows every vendor in MK personally. Plan is to pitch a referral partnership once La Muletti is live and working.

**Strategy:** Low cost, high quality, volume play. Make it impossible to say no.

**Competitor landscape:**
- **Flipdish / Slerp** — built for fixed restaurants, £59-£99+/month, not relevant to mobile vendors
- **Indi Local** — discovery/directory app, 180+ vendors across same geography, £12.50/month. Different product — potential coexistence. They are building geofence ("ice cream man effect") — listed as coming soon. We need to move fast.
- **Just Eat / Deliveroo** — up to 30% commission. Core "impossible to say no" story built around this.
- **MK Eats** — local aggregator, multi-vendor vs our single-vendor branded experience.

**Key insight:** Indi Local helps customers FIND vendors. Our product helps vendors RUN their business.

**Revenue target:** £10k/year years 1-3
**Required customers:** ~17 at £49/month average

---

## 5. Pricing Model

| Tier | Price | Features |
|------|-------|----------|
| Founding Customer | Free year 1 | Everything — first 3 customers only |
| Starter | £29/month | Core ordering, kitchen dashboard, real-time status, WhatsApp alerts |
| Growth | £49/month | Starter + geofence, flash sales, loyalty stamp card, event menus |
| Pro | £79/month | Growth + self-service portal, analytics, pre-order slots, priority support |

No setup fee on Starter. No commission ever.

---

## 6. Current Codebase — Architecture

**Six files — all pushed to GitHub and live on Netlify ✅**

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
- Desktop (≥768px): Full scrolling landing page with basket sidebar
- Mobile (<768px): PWA app shell with 5 pages and bottom navigation

**Design tokens:**
- Primary: `#C8410B` (fire red)
- Accent: `#D4A043` (gold)
- Background: `#1A0A00` (near black)
- Light: `#FDF6EC` (cream)
- Fonts: Playfair Display, DM Sans, Cormorant Garamond

**Contrast rule (established Session 6):**
Secondary text must use `rgba(255,255,255,0.X)` not `rgba(cream,0.X)`. Warm cream at low opacity on warm dark backgrounds renders as brown-on-brown. White-based opacity renders as readable neutral grey.

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
| 05 | Real-time Order Status | 🔨 Next | Customer sees live status + actual wait time |
| 06 | Geofence Notifications | ⏳ Planned | Van enters area → subscriber phone buzzes |
| 07 | Flash Sales & Broadcasts | ⏳ Planned | Vendor launches deal in seconds |
| 08 | Offers & Coupons | ⏳ Planned | Event deals, first order discount |
| 09 | Loyalty Stamp Card | ⏳ Planned | Digital, no paper needed |
| 10 | WhatsApp Order Alerts | ⏳ Planned | Orders to WhatsApp via Twilio |
| 11 | Pre-order Time Slots | ⏳ Planned | Order now, collect at chosen time |
| 12 | Vendor Self-Service | ⏳ Planned | Vendor manages own menu/events/location |
| 13 | MI & Reporting | ⏳ Planned | Daily order count, revenue totals, product breakdown — export via CSV or Looker Studio |

**Feature backlog (future):**
- Corporate catering module
- Pub partnership mode
- Multi-vendor event mode
- Review and rating system
- Revenue / analytics dashboard
- Sell-out warnings / scarcity nudges
- Weather-triggered deal suggestions
- End-of-night clearance prompts
- Table/pitch number delivery
- Waitlist mode for sold-out events

---

## 9. Firebase Backend — Spec

**Tech stack:** Firestore + Firebase Auth + Firebase Cloud Functions

**Firebase project:** `stalliq` (stalliq.firebaseapp.com)
**Firebase account:** julian@endoo.co.uk (Google account linked to M365 email)
**Firebase SDK version:** 10.12.2 (CDN compat — no bundler needed)
**Firebase Phone Auth test number:** +44 7700 900001 / code: 123456

**Order flow:**
1. Customer places order → status: `pending`
2. Owner accepts → status: `accepted`, wait time set
3. `accepted` → `preparing` → `ready`
4. Customer sees live status in real time
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

---

## 9a. Order Submission — ✅ COMPLETE

**Customer journey:**
1. Basket review → customer reviews items + total
2. Auth check → already logged in? Skip to step 5
3. Enter mobile number → receive SMS code → verified (Firebase Phone Auth)
4. Enter first name → stored against uid for all future orders
5. Confirm order → single tap "Place Order"
6. Confirmation screen → shows order ref e.g. `#007`

**Repeat customer:** steps 2-4 skipped — one tap to confirm.

---

## 9b. Kitchen Close Feature — ✅ COMPLETE

| Status | Customer-facing message | Use case |
|--------|------------------------|----------|
| `open` | Normal ordering | Default |
| `closed_busy` | "We're really busy right now — back shortly!" | Queue overwhelmed |
| `closed_end` | "We're closing up for tonight — see you next time!" | End of service |
| `closed_today` | "We're not trading today — see you soon!" | No service today |

> ⚠️ Customer app does not yet read kitchenStatus — blocking ordering on close is **Session 7 work**.

---

## 9c. Kitchen Dashboard — ✅ COMPLETE (MVP scope)

**URL:** `stalliq-demo.netlify.app/kitchen.html`
**PIN:** 1234 (set in `CONFIG.kitchen.pin`)

**Built in Session 6:**
- PIN screen on load — 4-digit, auto-submits, shakes on wrong entry
- Kanban board — 4 columns: Pending | Accepted | Preparing | Ready
- Horizontal drag/scroll between columns (Pointer Events API — works on Windows touch, mouse, iPad)
- Order cards — ref, customer name, items, elapsed time, status badge, action button
- Accept order + wait time modal — options from `CONFIG.ordering.waitOptions`, custom entry if `allowCustomWait: true`
- Status tap-through: `accepted → preparing` (single tap), `preparing → ready` (confirm modal — two tap)
- Collected (removes from queue)
- Kitchen close toggle — 4-option modal in header, writes to Firestore immediately
- Order detail drill-down — tap card body to open full detail modal (customer phone as tappable call link, all items, total, timestamps)
- Sound alert on new pending order (two beeps via Web Audio API)
- Elapsed time counter per card — turns amber at 10 mins, red at 20 mins

**Pending (locked spec — Session 7+):**
- Large order handling (distinct card colour + surfaces close kitchen option)
- Backwards status movement (long press + confirm)
- Named credentials / role-based access (owner vs staff)

---

## 10. Geofence Feature — Spec

1. Customer subscribes, sets location + radius (1/3/5 miles) + notification preference
2. Cheap Android device in van pings GPS to Firebase every 60 seconds
3. Cloud Function matches van location to subscribers, fires notification to anyone in radius not notified in past 24 hours

**Rate limiting:** 1 notification per customer per vendor per 24 hours
**Channels:** SMS via Twilio first, WhatsApp later
**iOS caveat:** Use dedicated Android in van — iOS kills background location

---

## 11. Flash Sales — Spec

Vendor taps "Launch Flash Deal" → picks preset or custom → sets claim limit/time limit → broadcasts instantly.

Presets: First N orders X% off / Item at special price / Buy 2 get drink / Tonight only price

Dashboard shows live claim count. Auto-expires at zero.

Broadcast to: geofence subscribers only OR full list.

---

## 12. Deployment Pipeline ✅

**Hosting:** Netlify — https://stalliq-demo.netlify.app/
**GitHub:** https://github.com/JulianBell106/lamulettipizza
**Auto-deploy:** Netlify linked to GitHub ✅

**Workflow:**
1. Claude produces files in `/mnt/user-data/outputs/lamuletti/`
2. Julian downloads + copies into local repo (maintaining `css/` and `js/` folders)
3. GitHub Desktop → commit → Push origin
4. Netlify auto-deploys in ~30 seconds

---

## 13. Key Decisions Made

- Multi-tenancy: one deployment per customer for 0-5, then scale
- `config.js` is single file that changes per customer
- Desktop = landing page, Mobile = PWA app shell, 768px breakpoint
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
- Item notes field (`notes: null`) already in order data model — UI to be built Session 7

---

## 14. Core Product Principle — Kitchen Management Co-pilot

Independent food vendors are brilliant at their craft but are not trained kitchen managers. When orders pile up they have no system — they react. Quality drops, customers wait without knowing why, the experience falls apart.

**Stalliq is a kitchen management co-pilot for people who've never had one.**

The app promotes good decisions at exactly the moments when a vendor is most likely to make bad ones. The system surfaces the right options at the right time: close the kitchen, set a longer wait, keep the customer informed. One tap.

---

## 15. Pitch Deck

**File:** `vendorapp-pitch-v2.pptx` (11 slides)
**TODO:** Rename/update to reflect Stalliq branding.
**TODO:** Update slide 11 with real Endoo contact details. Add QR code to slide 7.
**TODO:** Add kitchen management co-pilot angle.

---

## 16. Next Session — Session 7: MVP Completion

**Priority order:**

1. **Text contrast** — bump all secondary text opacity to 0.75-0.85 across `styles.css` and `kitchen.html`. Quick win first.

2. **Kitchen closed → customer app** — `app.js` reads `kitchenStatus` from Firestore on load and blocks ordering when closed. Shows correct closed message on mobile and desktop. Without this the kitchen close toggle is decorative only.

3. **Real-time order status — customer side (Feature 05)** — Firestore listener on the customer's order doc. When kitchen sets `waitMins`, customer sees actual time not static 15 mins. Mobile status screen: Pending → Accepted (X mins) → Preparing → Ready to Collect.

4. **Item notes** — "no onions on the Margherita". Notes input per item in basket (`app.js` + `styles.css`). Data model already supports it (`notes: null` on each item). Kitchen card and drill-down already wired to display notes when present.

Items 2 and 3 together are the MVP moment: customer orders → kitchen receives → kitchen responds → customer sees it live.

---

## 17. Working Rhythm

**Start:** "New session — ignore the project file attachment, read the live PROJECT.md from GitHub instead: https://raw.githubusercontent.com/JulianBell106/lamulettipizza/refs/heads/main/PROJECT.md — today we're working on [task]"

**End:** "Update PROJECT.md" → download → copy to repo → commit → push

**Always work inside the La Muletti Claude Project.**
**One session = one focused task.**
