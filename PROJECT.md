# Stalliq — Project Bible
> Last updated: April 2026 — Session 7b Complete + GTM & Pricing Strategy Added
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
- Founding customers: 50% lifetime discount locked in as long as subscription is continuous — cancel and re-signup loses the rate forever. Creates retention hook and peer evangelism.
- La Muletti stays on original free year 1 terms — Founding discount applies to customer #2 onwards
- Revisit prices at customer #10 — real conversion data will show which tier should be the centre of gravity

**Why this structure:**
- £19 Starter is under the £20 "no-brainer" SMB threshold — positions as proper tool, still cheap
- £59 Growth is where the business actually earns — geofence + loyalty + flash sales tier
- £99 Pro is the anchor — most pick Growth, which is the intent
- Revenue target £10k/year requires ~17 customers at blended £49 average, or ~14 on Growth
- Data export available on request (48hr turnaround) — not self-service — customer owns data but leaving has friction

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
| 06 | Customer Account / Members Area | 🔨 Session 8 | Account page, current orders (multi), order history, loyalty placeholder, offers placeholder |
| 07 | Google Sheets Menu Management | 🔨 Session 9 | Vendor edits a Google Sheet, menu updates live in app — no deploy needed |
| 08 | News & Locations Feed | 🔨 Session 10 | Upcoming events + where to find the van — Google Sheets driven |
| 09 | Offers & Deal Codes | 🔨 Session 10 | Offers page on customer app, discount codes |
| 10 | SMS & WhatsApp Status Notifications | ⏳ Planned | Customer notified on order status changes — Twilio |
| 11 | Live Location Broadcast | ⏳ Planned | Van location shown live on customer app — foundation for geofence at scale |
| 12 | Geofence Notifications | ⏳ Planned | Van enters subscriber's area → phone buzzes |
| 13 | Flash Sales & Broadcasts | ⏳ Planned | Vendor launches deal in seconds, broadcasts to subscribers |
| 14 | Loyalty Stamp Card | ⏳ Planned | Digital stamp card — no paper needed |
| 15 | Customer Login & Order History | ⏳ Planned | Full account, past orders, saved preferences |
| 16 | Flash Offers by Geolocation | ⏳ Planned | Customer in area gets notified of live deal |
| 17 | Pre-order Time Slots | ⏳ Planned | Order now, collect at chosen time |
| 18 | Vendor Self-Service | ⏳ Planned | Vendor manages own menu, events, location — full self-service portal |
| 19 | MI & Reporting | ⏳ Planned | Daily order count, revenue totals, product breakdown — CSV or Looker Studio |
| 20 | AI Order Assist | 🌟 Vision | Customer orders in natural language — type or dictate. AI parses into basket, normal checkout flow. |

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
| 8 | Customer Account / Members Area | Account page, current orders, history, loyalty + offers placeholders |
| 8b | Multi-tenancy Future-Proofing Audit | Replace any `"lamuletti"` literals with `CONFIG.vendorId`, add `CONFIG.domains` field, scan HTML for vendor literals — 15-minute insurance against future migration pain |
| 9 | Google Sheets menu management | Vendor edits sheet, app updates live — no deploy |
| 10 | News/Locations feed + Offers/Deal Codes | Customer app pages, Sheets driven |
| 11 | Demo polish | End-to-end demo reset function, rough edges removed |
| 12 | Pitch deck update | Stalliq rebrand, kitchen co-pilot angle, roadmap slide with vision features |

**What gets demoed live at the meeting:**
- Customer places order on phone → kitchen receives it instantly
- Kitchen accepts, sets wait time → customer sees status update live
- Customer can place multiple orders (forgot something) → both visible in Account
- Account page shows loyalty stamps and offers — hints at the roadmap
- Vendor edits menu in Google Sheet → customer app reflects it
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

**Firestore security rules required (customer reads own orders):**
```
match /orders/{orderId} {
  allow read: if request.auth != null
              && resource.data.customerId == request.auth.uid;
  allow create: if request.auth != null;
}
```

**Order history query requires a composite index** (`customerId` + `createdAt` desc). Firestore will surface a direct link to create it on first query — one click, not a blocker.

---

## 10a. Order Submission — ✅ COMPLETE

**Customer journey:**
1. Basket review → customer reviews items + total
2. Auth check → already logged in? Skip to step 5
3. Enter mobile number → receive SMS code → verified (Firebase Phone Auth)
4. Enter first name → stored against uid for all future orders
5. Confirm order → single tap "Place Order"
6. Confirmation modal → shows order ref e.g. `#007`, live status updates

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
- Desktop: dark (`#1A0A00`) full-width sticky banner injected as first child of `<body>`, above nav, with fire red bottom border — visually distinct from the orange strip bar
- All three closed statuses show correct message: `closed_busy`, `closed_end`, `closed_today`
- Fails open — if Firestore unreachable, ordering stays available
- Kitchen close toggle in dashboard already wrote to Firestore (Session 6) — full loop now live

**Built in Session 7b Task 2 (Real-time Order Status) ✅:**
- `app.js` Section 31: `startOrderStatusListener(orderId)` — Firestore `onSnapshot` on specific order doc
- Status block injected into confirm modal (mobile) and overlay (desktop)
- Time display (`m-confirm-time` / `d-order-time`) updates live: ⏳ pending → ~X mins on accept
- Ready state: icon, title, button text all flip on mobile + desktop
- `stopOrderStatusListener()` fully resets modal + overlay for next use
- `[Stalliq]` console diagnostics throughout — permission-denied error surfaces Firestore rules fix
- Handles multiple orders in same session cleanly (reset on each new order)

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

## 11. Customer Account / Members Area — Session 8 Spec

**The account page is always present in the nav** (👤 Account, 6th item). Visible whether logged in or not.

**Three states:**

**Logged out:**
Clean login prompt. "Sign in to track your orders and collect stamps." Taps into the existing phone auth flow. No new auth code needed.

**Logged in, no activity:**
- Welcome by first name
- Loyalty stamp card: 0/10 stamps, "Buy 9 get your 10th free", "Coming soon" badge
- Offers placeholder: one or two static offer cards, "Coming soon" badge
- Empty order history with nudge to order

**Logged in with activity:**
- Current Orders section — one card per active order (status ≠ collected/cancelled). Each card shows live status with its own Firestore listener. Handles multiple concurrent orders (e.g. customer placed two orders in a row).
- Loyalty stamp card — static for demo, shows 3/10 filled stamps
- Offers — static for demo, one welcome offer card
- Order history — all past orders, most recent first. Ref, date, items summary, total, status badge.

**Post-order modal flow (unchanged):**
The confirm modal stays exactly as built. It's the ephemeral "your order is placed" moment. The Account page is the persistent source of truth. Customer can dismiss the modal and find all active orders in Account.

**Firestore queries for Account page:**
- Current orders: `orders` where `customerId == uid` AND `status` not in `['collected', 'cancelled']`
- Order history: `orders` where `customerId == uid`, ordered by `createdAt` desc
- Both require the composite index on `customerId` + `createdAt` (Firestore provides one-click link on first run)

**Multiple listener management:**
Current `orderStatusUnsubscribe` (single var) needs to become a map keyed by `orderId`. `stopAllOrderListeners()` cleans up all. Individual listener cleaned up when order reaches `ready` and customer dismisses from Account page.

**Session 8 files to produce:** `index.html` + `app.js` (Account page HTML + CSS + all JS logic)

---

## 12. Google Sheets Menu Management — Spec

**Problem:** Menu changes require editing `config.js`, pushing to GitHub, waiting for Netlify deploy. Not vendor-manageable.

**Solution:** Menu data pulled from a published Google Sheet at runtime. Vendor edits their sheet, app reflects changes within minutes. No code changes, no deploy required.

**Approach:**
- Google Sheet published as JSON via Sheets API public endpoint
- `app.js` fetches menu data on load, falls back to `config.js` menu if Sheet unavailable
- Sheet structure mirrors current menu format: name, price, diet flags, available toggle, description
- Vendor given edit access to their own sheet only

**Operator workflow:** Julian creates and shares the Sheet per customer. Vendor manages their own content.

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

**Roadmap position:** Feature 20 — post loyalty and self-service.

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
- Item notes field (`notes: null`) already in order data model — UI deferred to post-pitch backlog
- Menu management: Google Sheets approach for vendor self-service — no deploy needed
- SMS/WhatsApp and live location: roadmap promises for pitch — not built before meeting
- AI Order Assist: vision feature — natural language + dictation ordering, no comparable product at this price point
- Kitchen closed banner on desktop: dark background (`#1A0A00`) injected at top of `<body>` — fire red banner blended invisibly into the orange strip bar
- Kitchen status listener fails open — Firestore unreachable does not block ordering
- Session chunking: large file outputs cause conversation timeouts — break each session into single-file chunks with fresh conversation per chunk
- Order status listener: inject-into-modal approach (not separate page) — modal is ephemeral, Account page is persistent
- Multiple concurrent orders supported — customer can dismiss modal and place second order; both visible in Account page with individual listeners
- Account page always visible in nav (logged out shows login prompt) — loyalty card is a reason to open app even without ordering
- Loyalty + offers: static/placeholder for demo, "Coming soon" badge — shows roadmap without over-promising
- `stopOrderStatusListener()` fully resets modal + overlay state so second order in same session renders cleanly
- Pricing: £19 Starter / £59 Growth / £99 Pro — annual plans 2 months free — monthly rolling, no contracts
- Founding customer offer: 50% lifetime discount locked as long as subscription continuous (first 5 customers) — replaces original "free year 1" model for customer #2 onwards. La Muletti stays on original free year 1 terms.
- Sophie partnership: 20% recurring commission, 24-month cap per customer — structure locked in Section 22
- La Muletti analytics: capture baseline order volume and customer behaviour from day one — Growth-features delta is the Sophie pitch
- Session 8b added: multi-tenancy future-proofing audit post-Session 8 — replace vendor literals with `CONFIG.vendorId`, add `CONFIG.domains` field
- Multi-tenancy architecture: Model A (one site per customer, 0-5) → Model B (hostname resolution, 5-10) → Model C (full SaaS, 10+). Defer each step until customer volume justifies it. Data model is already multi-tenant shaped — migration is cheap. `vendorId` must always be read from `CONFIG.vendorId`, never a string literal.

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

## 20. Next Session — Session 8: Customer Account / Members Area

Paste the current `index.html` and `app.js` at the start of the session.

**What to build:**
A 6th mobile page (`#page-account`, 👤 Account) always present in the nav. Three states: logged out (login prompt), logged in with no orders (welcome + placeholders), logged in with activity (current orders + history + placeholders).

**Detailed spec:** See Section 11 above.

**Key things to get right:**
- Multiple concurrent order listeners — map keyed by orderId, not single var
- Current orders query excludes collected/cancelled status
- Order history composite index — Firestore will prompt on first run, one-click fix
- Loyalty stamp card: 3/10 filled, "Coming soon" badge, visually complete
- Offers: 1-2 static cards, "Coming soon" badge
- Post-order modal stays exactly as is — account page is the persistent layer

---

**After Session 8 — Session 8b: Multi-tenancy Future-Proofing Audit**

Scope:
1. Grep `app.js` and `kitchen.js` for any literal `"lamuletti"` string — replace with `CONFIG.vendorId`
2. Add `CONFIG.vendorId = "lamuletti"` explicitly at the top of `config.js` if not already there
3. Add `CONFIG.domains = ["lamulettipizza.co.uk", "stalliq-demo.netlify.app"]` as forward-compatible field (unused for now, shape is right)
4. Quick scan of `index.html` and `kitchen.html` for any other vendor-specific literals that shouldn't be there
5. Update PROJECT.md with audit result and Model A → B → C migration principle

Rationale: data model is the expensive thing to change later. Deployment topology, config location, and onboarding are all cheap to change when customers are running on good data. This audit is the insurance that keeps the data model clean.

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

**Example economics:**
- Starter customer at £19/month: Sophie earns £3.80/month × 24 = £91.20 lifetime
- Growth customer at £59/month: Sophie earns £11.80/month × 24 = £283.20 lifetime

**Why 20% / 24 months:**
- 20% is the SaaS partner/affiliate standard — meaningful to her, sustainable for us
- Recurring (not one-off) keeps her invested in customer success, not just signup
- 24-month cap protects long-term unit economics and creates a built-in margin expansion as customers roll off her commission in Y3+

**Rejected alternatives:**
- Flat referral fee (e.g. £100-£200 per signup) — wrong incentive, paid whether customer stays a week or two years
- Lifetime revenue share — leaves a permanent 20% tax on half the customer base
- Equity — this is a referral relationship, not a co-founder relationship

**Timing of approach:** Month 4-5, once La Muletti has 2-3 months of real order data and at least one quotable success metric. Do not approach before that — only one shot at this conversation.

**Qualifying as "her" customer:**
- First introduction documented (email, WhatsApp, meeting note) — logged in a shared tracker
- If Julian and Sophie both know a vendor, first documented introduction wins
- No ambiguity allowed — capture it in writing at the time

**Written agreement required before first customer signs:**
One-page memo covering: commission rate, 24-month duration, qualifying customer definition, payment cadence, churn treatment, what happens if Endoo sells the business (commissions honoured or lump-sum settlement). Not heavy legal — just enough to prevent awkward conversations later.

**Framing for the pitch conversation:**
> "I want to build this across MK, Beds and Northampton. I can't do the relationship work — you can. 20% of everything you bring in, paid monthly for 24 months per customer. Bring in 10 customers in your first year averaging £40/month, and you're earning £80/month passive by year end with room to compound."

Frame it as building her a recurring income stream tied to her existing network — not as a one-off referral gig. Matches how she'll think about it given her consultancy background.

**Risk to manage:** If Sophie's own consulting work gets busy, she'll deprioritise. Mitigation: the commission structure itself is the mitigation — 20% recurring is meaningful enough to compete for attention. Also: build direct relationships with 2-3 of her vendors early so the pipeline doesn't live entirely in her head.
