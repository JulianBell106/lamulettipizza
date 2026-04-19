# VendorApp — Project Bible
> Last updated: April 2026  
> Read this file at the start of every session to get fully up to speed.

---

## 1. What Is This Project?

A white-label food ordering Progressive Web App (PWA) platform built for independent mobile food vendors. Each customer gets their own fully branded ordering app — no app store download required, works on any phone.

The product is built and operated by **Julian Bell** through his company **Endoo Limited**, based in Bletchley, Milton Keynes.

**Working product name:** VendorApp (final name TBD — still selecting)

**Endoo Limited** is the holding company. The food platform will trade under its own brand name once selected. Candidates shortlisted: Rovr, Nearli, Localo.

---

## 2. The Team

| Role | Person |
|------|--------|
| Founder / PM / Tester | Julian Bell (Endoo Limited) |
| Developer | Claude (AI — Anthropic) |

Julian has ~30 years IT experience and a development background but no longer codes due to time constraints. He acts as product manager, tester, and business owner. Claude acts as the developer. Sessions are collaborative — Julian brings requirements and domain knowledge, Claude builds and advises.

**Working model:**
- Sessions have a clear mode: **build**, **research**, or **product thinking**
- At the end of significant sessions, update this file
- Julian deploys to Netlify manually (drag and drop) until GitHub auto-deploy is configured
- Julian tests on real devices and reports findings back

---

## 3. Launch Customer — La Muletti Pizza

**Business:** Mobile wood-fired Neapolitan pizzeria, Milton Keynes  
**Founders:** Daniele (Head Pizzaiolo, born Sicily) and Danielle (Operations)  
**Phone:** 07951 050383  
**Email:** hello@lamulettipizza.co.uk  
**Facebook:** @lamulettipizza  
**Website:** lamulettipizza.co.uk  

**Commercial arrangement:** Free for year one in exchange for being a reference customer and providing feedback. Year two onwards moves to standard pricing. This is agreed — Daniele has confirmed he wants to go ahead and a meeting is being arranged.

**Demo site (live):** https://lamulettipizza-demo.netlify.app/  
**GitHub repo:** https://github.com/JulianBell106/lamulettipizza  

---

## 4. Go-To-Market Strategy

**Target geography (years 1-3):** Milton Keynes → Bedford → Northampton  
**Target customers:** Independent mobile food vendors — pizza vans, burger vans, street food trucks, market traders  
**Secondary market (year 2+):** Fixed kiosk vendors (e.g. Midsummer Place MK) — commission saving angle  

**Key channel — Sophie etc.:**  
Sophie (sophieetc.com) runs the definitive MK food blog and organises Sophie's Street Feast. She knows every vendor in MK personally. Plan is to pitch a referral partnership once La Muletti is live and working. Sophie would introduce vendors, Julian builds the product.

**Competitor landscape:**
- **Flipdish / Slerp** — built for fixed restaurants, £59-£99+/month, not relevant to mobile vendors
- **Indi Local** — discovery/directory app, 180+ vendors across the same geography, charges £12.50/month. Different product (discovery vs ordering) — potential coexistence or partnership, not a direct competitor. They are building geofence notifications ("ice cream man effect") but it's listed as coming soon.
- **Just Eat / Deliveroo** — up to 30% commission per order. The "impossible to say no" story is built around this number.
- **MK Eats** — local Just Eat-style aggregator, 40+ MK vendors. Multi-vendor platform vs our single-vendor branded experience.

**Revenue target:** £10k/year years 1-3  
**Required customers:** ~17 at £49/month average

---

## 5. Pricing Model

| Tier | Price | Features |
|------|-------|----------|
| Founding Customer | Free year 1 | Everything — first 3 customers only, in exchange for reference + feedback |
| Starter | £29/month | Core ordering, kitchen dashboard, real-time status, WhatsApp alerts |
| Growth | £49/month | Starter + geofence, flash sales, loyalty stamp card, event menus |
| Pro | £79/month | Growth + self-service portal, analytics, pre-order slots, priority support |

No setup fee on Starter. No commission ever. This is the core "impossible to say no" positioning vs Just Eat's 30%.

---

## 6. Current Codebase — Architecture

**Four files. This is the complete product:**

| File | Location | Purpose |
|------|----------|---------|
| `index.html` | `/lamuletti/index.html` | Pure structure — zero hardcoded business content |
| `css/styles.css` | `/lamuletti/css/styles.css` | All styling — desktop + mobile |
| `js/config.js` | `/lamuletti/js/config.js` | ALL customer-specific data lives here |
| `js/app.js` | `/lamuletti/js/app.js` | All logic — reads entirely from CONFIG |

**Key architectural principle:** `config.js` is the ONLY file that changes between customers. Onboarding a new customer = copy the 4 files, edit config.js, deploy. Everything else is generic.

**Output files location:** `/mnt/user-data/outputs/lamuletti/`

**Responsive layout:**
- **Desktop (≥768px):** Full scrolling landing page with basket sidebar, sticky nav
- **Mobile (<768px):** PWA app shell with 5 pages and bottom navigation

**Design tokens:**
- Primary: `#C8410B` (fire red)
- Accent: `#D4A043` (gold)
- Background: `#1A0A00` (near black)
- Light: `#FDF6EC` (cream)
- Fonts: Playfair Display (headings), DM Sans (body), Cormorant Garamond (italic accents)

**Images:** Currently hosted on imgbb. Move to repo or Cloudinary before production.

---

## 7. config.js Structure

The CONFIG object covers:

```
CONFIG.business     — name, tagline, location, currency, type
CONFIG.theme        — all colour values (injected as CSS custom properties)
CONFIG.contact      — phone, email, website, facebook
CONFIG.images       — hero, founders, icon URLs
CONFIG.hero         — eyebrow, title lines, subtitle, CTA text
CONFIG.stripItems   — the selling-point strip bar items
CONFIG.menu         — array of items with id, name, desc, price, diet, available
CONFIG.about        — story paragraphs, founders array, image caption
CONFIG.values       — eyebrow, title, items array
CONFIG.homePills    — mobile home page feature highlights
CONFIG.events       — upcoming pop-up events array
CONFIG.ordering     — waitMins, refPrefix, paymentNote, confirmMsg
CONFIG.meta         — title, description, appTitle
```

**Menu item `available` flag:** Set to `false` to hide an item without deleting it. Critical for operational use — vendor can toggle items off at a busy event.

---

## 8. Mobile Pages

| Page | ID | Nav Icon |
|------|-----|----------|
| Home | `page-home` | 🏠 |
| Menu | `page-menu` | 🍕 |
| Basket | `page-basket` | 🛒 |
| About | `page-about` | 👫 |
| Find Us | `page-findus` | 📍 |

Plus a fullscreen order confirmation overlay (`m-order-confirm`).

---

## 9. La Muletti Menu (correct data)

| # | Name | Price | Diet |
|---|------|-------|------|
| 1 | Marinara | £8 | VE |
| 2 | Margherita | £9 | V |
| 3 | Prosciutto e Funghi | £10 | — |
| 4 | Bella Pepperoni | £10 | — |
| 5 | Capricciosa | £11 | — |
| 6 | La Mamma Muletti | £12 | 🌶️ |

---

## 10. Full Product Roadmap

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 01 | PWA & Ordering | ✅ Done | Mobile + desktop, full order flow |
| 02 | White-label Config | ✅ Done | config.js — one file per customer |
| 03 | Firebase Backend | 🔨 Next | Real-time order processing |
| 04 | Kitchen Dashboard | 🔨 Next | Owner login, accept/manage orders |
| 05 | Real-time Order Status | ⏳ Planned | Preparing → Oven → Ready to Collect |
| 06 | Geofence Notifications | ⏳ Planned | Van enters area → subscriber phone buzzes |
| 07 | Flash Sales & Broadcasts | ⏳ Planned | Vendor launches deal in seconds |
| 08 | Offers & Coupons | ⏳ Planned | Event deals, first order discount |
| 09 | Loyalty Stamp Card | ⏳ Planned | Digital, no paper needed |
| 10 | WhatsApp Order Alerts | ⏳ Planned | Orders to WhatsApp via Twilio |
| 11 | Pre-order Time Slots | ⏳ Planned | Order now, collect at chosen time |
| 12 | Vendor Self-Service | ⏳ Planned | Vendor manages own menu/events/location |

**Feature backlog (future consideration):**
- Corporate catering module
- Pub partnership mode (vendor outside, customers inside)
- Multi-vendor event mode (food festival, single URL)
- Review and rating system
- Menu photography prompts
- Revenue / analytics dashboard
- Sell-out warnings / scarcity nudges
- Weather-triggered deal suggestions
- End-of-night clearance prompts (automated)

---

## 11. Firebase Backend — Spec

**Tech stack:** Firebase Firestore (real-time database) + Firebase Authentication (owner login) + Firebase Cloud Functions (geofence matching, notifications)

**Customer order flow:**
1. Customer places order → status: `pending`
2. Daniele accepts on dashboard → status: `accepted`, wait time set
3. Status updates: `accepted` → `making` → `in_oven` → `ready`
4. Customer sees live status on their phone in real time
5. Customer collects and pays

**Kitchen dashboard (owner view):**
- Sound alert on new order
- Full order details displayed
- Accept button + wait time entry (quick-pick: 10/15/20/25 mins or manual)
- Tap through status stages
- Walk-up order entry (vendor can add orders directly)

**Firestore data structure (planned):**
```
vendors/
  {vendorId}/
    config: { ...vendorDetails }
    menu: [ ...menuItems ]
    events: [ ...upcomingEvents ]

orders/
  {orderId}/
    vendorId, items, customerName, phone,
    status, waitMins, orderRef, createdAt

subscribers/
  {subscriberId}/
    vendorId, location, radius, notifyVia, lastNotified
```

---

## 12. Geofence Feature — Technical Spec

**Three parts:**

1. **Customer subscription** — opts in, sets postcode/location, chooses radius (1/3/5 miles), chooses SMS or WhatsApp

2. **Vendor location tracker** — lightweight tracker on a device in the van (ideally dedicated cheap Android, plugged into van USB). Vendor taps "Start Trading" / "Stop Trading". Pings GPS to Firebase every 60 seconds.

3. **Matching engine** — Firebase Cloud Function runs every 60 seconds. For each van ping, queries all subscribers for that vendor, calculates distance, fires notification to anyone within radius who hasn't been notified in past 24 hours.

**Rate limiting:** Maximum one notification per customer per vendor per 24 hours regardless of how many times van enters zone.

**Notification channels:** SMS via Twilio (4p/message) or WhatsApp via Twilio WhatsApp API.

**iOS caveat:** iOS aggressively kills background location processes. Dedicated Android device in van is the cleanest solution for the tracker.

---

## 13. Flash Sales Feature — Spec

Vendor opens dashboard → taps "Launch Flash Deal" → picks preset or creates custom:
- First N orders get X% off
- Next N minutes — item at special price
- Buy 2 get free drink
- Tonight only price

Sets claim limit and/or time limit → broadcasts instantly to subscribers.

**Claim tracking:** Dashboard shows real-time claims remaining. Auto-expires at zero. No manual tracking needed.

**Broadcast scope:** Geofence only (nearby subscribers) OR all subscribers (full list).

**Future automation:** System prompts vendor at 8pm on quiet evenings — "Quiet tonight? Want to launch a deal?"

---

## 14. Deployment

**Hosting:** Netlify  
**Live URL:** https://lamulettipizza-demo.netlify.app/  
**Deploy method:** Manual drag-and-drop (Netlify → Sites → Deploy)  
**GitHub:** https://github.com/JulianBell106/lamulettipizza (NOT currently linked to Netlify auto-deploy — pending)  

**To deploy an update:**
1. Make changes to files in `/mnt/user-data/outputs/lamuletti/`
2. Download the folder
3. Drag and drop to Netlify deploy

**Pending:** Link Netlify to GitHub for auto-deploy (Site Configuration → Build & Deploy → Continuous Deployment → Link Repository. Build command: blank. Publish directory: blank or `.`)

---

## 15. Key Decisions Made

- **Multi-tenancy:** One deployment per customer for 0-5 customers. Semi-automated at 5-10. Full multi-tenant SaaS at 10+. No need to over-engineer early.
- **White-label approach:** config.js is the single file that changes per customer. Architecture is already data-driven and ready for multi-tenant migration when needed.
- **Desktop layout:** Browser on desktop = full landing page. Installed PWA on mobile = app shell. 768px breakpoint.
- **Endoo as holding company:** The food platform trades under its own brand. Endoo stays as the IT services brand.
- **La Muletti free year 1:** In exchange for reference customer status. Agreed with Daniele.
- **Payment model:** No commission ever. Flat monthly fee. This is the core USP vs Just Eat.
- **Notification channel:** Build SMS first (Twilio, simple, reliable). WhatsApp requires Meta approval — add later.
- **Geofence tracker device:** Dedicated cheap Android in van, not vendor's personal phone, to avoid iOS background location issues.

---

## 16. Pitch Assets

**Pitch deck:** `vendorapp-pitch-v2.pptx` (11 slides)  
Located at: `/mnt/user-data/outputs/vendorapp-pitch-v2.pptx`  

**Deck structure:**
1. Cover — "Your Own Ordering App"
2. The Problem
3. The Solution
4. What Makes Us Different (USP features)
5. Geofence — "Your van drives in. Their phone buzzes." ← headline USP
6. Flash Sales — "Quiet evening? Fill your slots in 60 seconds."
7. Live Demo (La Muletti)
8. Pricing
9. Partnership Opportunity (Sophie slide)
10. Roadmap
11. Close / CTA

**TODO before using deck:** Update slide 11 with real Endoo email and phone number. Add QR code to slide 7 pointing to demo URL.

---

## 17. File Locations Reference

| What | Where |
|------|-------|
| Main app files | `/mnt/user-data/outputs/lamuletti/` |
| index.html | `/mnt/user-data/outputs/lamuletti/index.html` |
| styles.css | `/mnt/user-data/outputs/lamuletti/css/styles.css` |
| app.js | `/mnt/user-data/outputs/lamuletti/js/app.js` |
| config.js | `/mnt/user-data/outputs/lamuletti/js/config.js` |
| Pitch deck v2 | `/mnt/user-data/outputs/vendorapp-pitch-v2.pptx` |
| Transcript archive | `/mnt/transcripts/` |
| Transcript journal | `/mnt/transcripts/journal.txt` |

---

## 18. Next Actions (as of April 2026)

**Immediate:**
- [ ] Julian to meet with Daniele and Danielle — agree commercial arrangement, understand their event workflow, ask WhatsApp vs dashboard preference
- [ ] Add QR code and real contact details to pitch deck
- [ ] Link Netlify to GitHub for auto-deploy

**Build queue (in order):**
- [ ] Firebase project setup — Julian creates project, adds credentials
- [ ] Firestore data structure — orders collection, vendor config
- [ ] Order submission — customer places order, writes to Firestore
- [ ] Kitchen dashboard — owner login, real-time order display, accept/status flow
- [ ] Real-time order status — customer-facing live status screen
- [ ] WhatsApp notifications via Twilio
- [ ] Geofence notifications
- [ ] Flash sales & broadcasts

**Product / business:**
- [ ] Finalise product name (shortlist: Rovr, Nearli, Localo)
- [ ] Approach Sophie etc. once La Muletti is live and working
- [ ] Build simple one-page commercial agreement for founding customers

---

## 19. How to Use This File

**At the start of every session:** Read this file to get up to speed instantly.  
**At the end of every significant session:** Update the relevant sections — current status, decisions made, next actions.  
**When in doubt:** This file is the single source of truth. If something isn't here, add it.

The goal is that any new conversation can read this file and be fully productive within minutes.
