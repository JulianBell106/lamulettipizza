# VendorApp — Project Bible
> Last updated: April 2026 — Session 4 (Kitchen Dashboard Design — Order Card)
> Read this file at the start of every session to get fully up to speed. JB

---

## 1. What Is This Project?

A white-label food ordering Progressive Web App (PWA) platform built for independent mobile food vendors. Each customer gets their own fully branded ordering app — no app store download required, works on any phone.

The product is built and operated by **Julian Bell** through his company **Endoo Limited**, based in Bletchley, Milton Keynes.

**Working product name:** VendorApp (final name TBD — still selecting)

**Endoo Limited** is the holding company. The food platform will trade under its own brand name once selected. Candidates shortlisted: Rovr, Nearli, Localo. (Queup, Pitchfire, Ember, Flok all taken.)

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

---

## 3. Launch Customer — La Muletti Pizza

**Business:** Mobile wood-fired Neapolitan pizzeria, Milton Keynes
**Founders:** Daniele (Head Pizzaiolo, born Sicily) and Danielle (Operations)
**Phone:** 07951 050383
**Email:** hello@lamulettipizza.co.uk
**Facebook:** @lamulettipizza
**Website:** lamulettipizza.co.uk

**Commercial arrangement:** Free for year one in exchange for being a reference customer and providing feedback. Year two onwards moves to standard pricing. **Daniele has confirmed he wants to go ahead — meeting being arranged.**

**Demo site (live):** https://lamulettipizza-demo.netlify.app/
**GitHub repo:** https://github.com/JulianBell106/lamulettipizza

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

**Four files — all pushed to GitHub and live on Netlify ✅**

| File | Purpose |
|------|---------|
| `index.html` | Pure structure — zero hardcoded business content |
| `css/styles.css` | All styling — desktop + mobile |
| `js/config.js` | ALL customer-specific data lives here |
| `js/app.js` | All logic — reads entirely from CONFIG |

**Key principle:** `config.js` is the ONLY file that changes between customers.

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
| 03 | Firebase Backend | 🔨 Next | Real-time order processing |
| 04 | Kitchen Dashboard | 🔨 Next | Owner login, accept/manage orders |
| 05 | Real-time Order Status | ⏳ Planned | Preparing → Ready to Collect |
| 06 | Geofence Notifications | ⏳ Planned | Van enters area → subscriber phone buzzes |
| 07 | Flash Sales & Broadcasts | ⏳ Planned | Vendor launches deal in seconds |
| 08 | Offers & Coupons | ⏳ Planned | Event deals, first order discount |
| 09 | Loyalty Stamp Card | ⏳ Planned | Digital, no paper needed |
| 10 | WhatsApp Order Alerts | ⏳ Planned | Orders to WhatsApp via Twilio |
| 11 | Pre-order Time Slots | ⏳ Planned | Order now, collect at chosen time |
| 12 | Vendor Self-Service | ⏳ Planned | Vendor manages own menu/events/location |
| 13 | MI & Reporting | ⏳ Planned | Daily order count, revenue totals, product breakdown — export via CSV or Looker Studio. Data captured automatically from order object. |

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

**Order flow:**
1. Customer places order → status: `pending`
2. Owner accepts → status: `accepted`, wait time set
3. `accepted` → `preparing` → `ready`
4. Customer sees live status in real time
5. Customer collects and pays

**Kitchen dashboard:**
- Sound alert on new order
- Accept + wait time entry (10/15/20/25 mins or manual)
- Tap through status stages
- Walk-up order entry
- Close kitchen toggle (see section 9b)

**Firestore structure:**
```
vendors/{vendorId}/
  config, menu, events
  kitchenStatus: "open" | "closed_busy" | "closed_end" | "closed_today"
  counters/daily → { date, count }  ← order ref counter, resets midnight

orders/{orderId}/
  vendorId, orderRef, customerId, customerName, customerPhone,
  items, orderTotal, payment, status, waitMins,
  expiresAt, createdAt, updatedAt

subscribers/{subscriberId}/
  vendorId, location, radius, notifyVia, lastNotified

users/{uid}/
  firstName, phone (verified), createdAt
```

---

## 9a. Order Submission — Detailed Design ✅ LOCKED

**Key principle: data model is vendor-agnostic. Display language is vendor-specific via config.js.**

**Customer journey:**
1. Basket review → customer reviews items + total
2. Auth check → already logged in? Skip to step 5
3. Enter mobile number → receive SMS code → verified (Firebase Phone Auth)
4. Enter first name → stored against uid for all future orders
5. Confirm order → single tap "Place Order"
6. Confirmation screen → shows order ref e.g. `#007`, "We'll have your order ready shortly"

**Repeat customer journey (steps 2-4 skipped):**
1. Basket review
2. Confirm order — name pre-filled, one tap
3. Confirmation screen

**Order object (Firestore):**
```json
{
  "orderId": "auto — Firestore generated",
  "orderRef": "#007",
  "vendorId": "lamuletti",
  "customerId": "firebase-uid",
  "customerName": "Julian",
  "customerPhone": "+447911123456",
  "items": [
    {
      "id": "margherita",
      "name": "Margherita",
      "price": 9.00,
      "quantity": 1,
      "notes": null
    },
    {
      "id": "margherita",
      "name": "Margherita",
      "price": 9.00,
      "quantity": 1,
      "notes": "No onion please"
    }
  ],
  "orderTotal": 18.00,
  "payment": {
    "method": "cash_on_collection",
    "status": "pending"
  },
  "status": "pending",
  "waitMins": null,
  "expiresAt": "createdAt + 10 mins",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

**Order status flow:**
```
pending → accepted → preparing → ready
```
Status values are vendor-agnostic. Customer-facing copy configured per vendor in config.js.
Example: La Muletti maps `preparing` → "In the oven 🔥". A burger van maps it → "On the grill 🍔".

**Item-level notes:**
- Notes sit on each line item, not at order level
- Same item with different customisations = separate line items
- Example: two Margheritas — one plain, one no onion = two line items, same id, different notes
- UI will support "Add another with changes" to handle this cleanly
- Quantity counter only used when items are truly identical

**Order reference — daily sequential counter:**
- Format: `#001`, `#002` — resets at midnight each day
- Stored in: `vendors/lamuletti/counters/daily` → `{ date, count }`
- Implemented as a Firestore transaction to prevent duplicate numbers on concurrent orders
- Daily count doubles as MI data point (orders per day)

**Order timeout:**
- If order sits in `pending` for 10 minutes with no kitchen action, escalate visually on dashboard (order card turns red)
- Auto-cancel with customer notification after timeout
- Timeout duration vendor-configurable, default 10 minutes
- `expiresAt` field = `createdAt + timeout duration`

**Payment hook:**
- MVP: `method: "cash_on_collection"` — no payment integration
- Future: populate `method: "card"` + `status: "paid"` when payment added
- No other changes required to order object or kitchen dashboard

**Authentication — Firebase Phone Auth:**
- Customer enters mobile number → SMS verification code → verified
- First name collected once after verification, stored against uid
- Captures a verified phone number automatically — feeds campaign lists, WhatsApp pipeline, loyalty system
- `uid` becomes foreign key across orders, loyalty stamps, geofence subscriptions
- Customer authenticated once, remembered on device thereafter
- Phone Auth as primary; email/password as future option

---

## 9b. Kitchen Close Feature — Spec ✅ LOCKED

Vendor can close the kitchen at any time from the dashboard. Prevents new orders being placed.

**Kitchen status values:**

| Status | Customer-facing message | Use case |
|--------|------------------------|----------|
| `open` | Normal ordering | Default |
| `closed_busy` | "We're really busy right now — back shortly!" | Queue overwhelmed |
| `closed_end` | "We're closing up for tonight — see you next time!" | End of service |
| `closed_today` | "We're not trading today — see you soon!" | No service today |

**Behaviour when closed:**
- App/website shows clear closed message (copy from config.js per vendor)
- Order button disabled — no new orders can be placed
- Existing orders already in queue are unaffected and continue through status flow
- Kitchen dashboard shows prominent "Kitchen is CLOSED" banner
- One tap to reopen

---

## 9c. Kitchen Dashboard — Order Card Design 🔨 IN PROGRESS

**Core design principle: the card must work at a glance, under pressure, in a noisy environment.**

**Card always shows:**
- Order ref — large, primary identifier (e.g. `#007`)
- Customer first name — for calling out at collection
- Item count badge — e.g. "3 pizzas" — quick reconciliation before handover
- Item list — capped at 3 lines, then "+ N more" tap to expand in place
- Item notes — same visual weight as item name, never subordinate
- Time elapsed — urgency at a glance
- One primary action button — single tap to advance status

**Off the card:** phone number, order total, payment status — available elsewhere, not in working view.

**Large order handling:**
- Large order threshold: vendor-configurable in config.js (no platform default — a pizza van with one oven is different to a noodle van with 8 burners)
- Large orders get a distinct card colour in the queue — not just a badge
- Accept flow for large orders surfaces two additional options:
  - Set a longer custom wait time
  - Close kitchen to new orders at the same moment as accepting — one action, not two
- No max order size enforced on customer side — handle gracefully on kitchen side
- No cap: forcing customers to split orders or walk away loses them to more expensive competitors

**Progressive disclosure:**
- Small orders (1–3 items): full detail visible immediately
- Large orders: card stays compact, "+ N more" expands in place when kitchen is ready to start

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

**Hosting:** Netlify — https://lamulettipizza-demo.netlify.app/
**GitHub:** https://github.com/JulianBell106/lamulettipizza
**Auto-deploy:** Netlify linked to GitHub ✅

**Workflow:**
1. Claude produces files in outputs
2. Julian downloads + copies into local repo (maintaining css/ and js/ folders)
3. GitHub Desktop → commit → Push origin
4. Netlify auto-deploys in ~30 seconds

**Remember:** Commit saves locally. Push origin sends to GitHub and triggers deploy.

---

## 13. Key Decisions Made

- Multi-tenancy: one deployment per customer for 0-5, then scale
- config.js is single file that changes per customer
- Desktop = landing page, Mobile = PWA app shell, 768px breakpoint
- Endoo stays as IT services holding company
- La Muletti free year 1 — agreed with Daniele
- No commission ever — flat monthly fee
- Build SMS notifications first, WhatsApp later
- Dedicated Android device in van for geofence tracking
- Midsummer Place vendors = secondary market year 2+
- Approach Sophie once La Muletti has real orders flowing
- Payment: cash on collection for MVP — single `payment` field added to order object as hook for future card integration
- Auth: Firebase Phone Auth — verified mobile number captured at first order, remembered on device thereafter
- Order ref: daily sequential (`#001` format), resets midnight, Firestore transaction for concurrency safety
- MI data: captured automatically from order object from day one — no extra instrumentation needed
- Analytics: export to CSV or Looker Studio — no in-app reporting UI in MVP
- No guest checkout — Phone Auth IS the guest experience. Friction is minimal: mobile → SMS code → done
- UI copy frames phone verification as a benefit not a gate: "Enter your mobile and we'll text you when your order is ready"
- Customer name: first name only, entered once after first SMS verification, stored against uid, pre-filled on all subsequent orders
- Repeat customers: already authenticated + name pre-filled = genuinely one tap to reorder
- Order status flow: `pending → accepted → preparing → ready` — vendor-agnostic values, vendor-specific display copy in config.js
- Item-level notes: notes on each line item not order level. Same item different customisation = separate line items
- Basket UI: "Add another with changes" button to handle same item with different notes
- Kitchen close: four states — open / closed_busy / closed_end / closed_today. Disables ordering, existing queue unaffected
- Order timeout: 10 min default, escalate visually then auto-cancel with customer notification. Vendor configurable. `expiresAt` field on order object
- Large order threshold: vendor-configurable in config.js — not a platform default
- Large orders: distinct card colour in queue, not just a badge
- No customer-side max order size — handle gracefully on kitchen side
- Large order accept flow: surfaces close-kitchen option at same moment as accept — one tap, not two
- Kitchen dashboard card: minimal information under pressure — ref, name, item count badge, item list (capped + expandable), notes prominent, elapsed time, one action button

---

## 14. Core Product Principle — Kitchen Management Co-pilot

**Established Session 4. Must feed into pitch deck and marketing.**

Independent food vendors are brilliant at their craft but are not trained kitchen managers. When orders pile up they have no system — they react. Quality drops, customers wait without knowing why, the experience falls apart.

**VendorApp is a kitchen management co-pilot for people who've never had one.**

The app promotes good decisions at exactly the moments when a vendor is most likely to make bad ones — a large order lands, a queue builds, the oven is at capacity. The system surfaces the right options at the right time: close the kitchen, set a longer wait, keep the customer informed. One tap.

**Pitch deck headline:** *"VendorApp keeps small kitchens flowing under pressure — giving independent vendors the kitchen management instincts they never had time to learn."*

**The customer transparency angle:** Customers appreciate honesty about wait times far more than silence. A vendor who communicates is a vendor customers trust and return to.

---

## 15. Pitch Deck

**File:** `vendorapp-pitch-v2.pptx` (11 slides)
**TODO:** Update slide 11 with real Endoo contact details. Add QR code to slide 7.
**TODO:** Add kitchen management co-pilot angle — slide on how app handles pressure moments.

Slide order: Cover → Problem → Solution → USPs → Geofence → Flash Sales → Live Demo → Pricing → Partnership (Sophie) → Roadmap → Close

---

## 16. Next Actions

**Before next session:**
- [ ] Push this updated PROJECT.md to GitHub
- [ ] Meet with Daniele & Danielle — agree arrangement, understand workflow, ask WhatsApp vs dashboard preference
- [ ] Julian creates Firebase project + shares credentials

**Next session — Kitchen Dashboard Design continued:**
- [ ] #2 — Order queue layout and prioritisation
- [ ] #3 — Status progression UX
- [ ] #4 — Kitchen close toggle placement
- [ ] #5 — Owner login / auth

**Upcoming build queue (in order):**
- [ ] Firebase order submission — app → Firestore
- [ ] Kitchen dashboard — real-time orders, accept, status flow
- [ ] Real-time order status (customer-facing)
- [ ] WhatsApp notifications via Twilio
- [ ] Geofence
- [ ] Flash sales

**Roadmap discussion (scheduled next week):**
- [ ] MI & Reporting — feature 13

**Product:**
- [ ] Finalise name (Rovr / Nearli / Localo)
- [ ] One-page commercial agreement for founding customers
- [ ] Approach Sophie once live

---

## 17. Working Rhythm

**Start:** "New session — ignore the project file attachment, read the live PROJECT.md from GitHub instead: https://raw.githubusercontent.com/JulianBell106/lamulettipizza/refs/heads/main/PROJECT.md — today we're working on [task]"

**End:** "Update PROJECT.md" → download → copy to repo → commit → push

**Always work inside the La Muletti Claude Project.**
**One session = one focused task.**
