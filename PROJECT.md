# Stalliq — Project Bible
> Last updated: 2026-06-04 — Session 48 (build): WhatsApp order-ready notifications now **LIVE end-to-end** — tested on dev (stalliq) AND production (stalliq-production), message delivered. Approved template SID HX8be19e3e8f7e038d326cd7a275ffdcd3 wired into functions/.env as TWILIO_WHATSAPP_CONTENT_SID (old SID HXb0f2...577036c retired, never synced to Meta). Fixed SMS-fallback bug in functions/index.js on develop + main — SMS now fires when a WhatsApp send fails or the SID is missing even when the vendor channel is 'whatsapp' (previously skipped). **Key lesson: Cloud Function env vars bake at DEPLOY time — editing .env does nothing until `firebase deploy --only functions`; production sent SMS-only until functions were redeployed to stalliq-production.** Sender display name still shows "Endoo Limited" -> decision: rename to "Stalliq" in Meta (see WhatsApp state). (Prev: 2026-06-04 — Session 47 (Pricing research, no code): Confirmed Stripe (no API/monthly fee, pay-per-txn; in-person 1.4%+10p, online 1.5%+20p; Tap to Pay £0 hardware / WisePad3 £49). **Key finding: Square ALSO offers free phone Tap to Pay (1.75% flat) — pitch the Stripe swap on consolidation, NOT lower fees (Stripe only cheaper above ~£28.50/txn). See B9 correction.** Confirmed Twilio SMS/WhatsApp unit costs + built WhatsApp monthly cost model (~£3–£10/mo for order-ready pings). Reader for B15 = Star TSP143IV UE £239.49. (Prev: 2026-06-03 — Session 46 (Pitch outcome + product-thinking, no code): Pitch delivered to Dan & Daniele — went well, they're in; unprompted validation ("we can really see how this would work"). **GO-LIVE: AUGUST 2026** (testing window + their wedding + Julian's Spain holiday). Twilio WhatsApp template now APPROVED ✅. Captured August launch requirements as backlog B9–B16: B9 card payments (TARGET all-in Stripe + Tap to Pay, eliminate Square), B10 ingredient-level extras pricing, B11 single-system consolidation, B12 MI & reporting (match/beat Square — structural differentiator), B13 "We're Open" broadcast-to-all, B14 review→signup reward (decoupled/honour-system), B15 Star TSP143IV CloudPRNT printer (£239.49, removes Dan's paper-writing), B16 JIT "To Fire" cook-scheduling lane (resolves cold-pizza concern; cook/prep times as hidden menu-sheet columns). AI Order Assist deprioritised — after B9–B16. Strategic assessment + potential northern partner (Will Thompson, Epicagile) logged in Section 4. (Prev: 2026-06-02 — Session 45: WhatsApp notifications full build, both branches; SMS fallback working; Meta Business Verification in review.))
> **Next session — start here:**
> - ~~**WhatsApp wiring + go-live**~~ ✓ Done 2026-06-04 (Session 48) — SID wired, functions redeployed to dev + production, tested end-to-end. WhatsApp now LIVE on both.
> - **Rename WhatsApp sender display name to "Stalliq"** — Meta WhatsApp Manager → Phone numbers → +447782218609 → Profile → Display name → submit for review. Currently shows "Endoo Limited" for all vendors (single shared number).
> - **Wipe test data on stalliq-production** — delete all docs in `orders` and `users` collections. Keep `vendors/{vendorId}/staff/`, `kitchenStatus`, `location`, `counters`.
> - **Node.js 20 deprecation** — upgrade functions to Node 22 before 2026-10-30.
> - **Future session:** Google Play Store TWA wrap (pwabuilder.com → AAB → Play Console). Do on main (La Muletti production URL).
> - **Future session:** iOS PWA install guidance — in-app instructions for Safari Share → Add to Home Screen.
> - **Future session:** Add Stalliq product page to endoo.co.uk (under Products).
>
> ⚠️ **Julian — actions outstanding:**
> 1. ~~**Meta business verification**~~ ✓ Approved 2026-06-04.
> 2. ~~**Add `TWILIO_WHATSAPP_CONTENT_SID` + redeploy functions**~~ ✓ Done 2026-06-04 — both projects deployed, WhatsApp live.
> 2b. **Rename WhatsApp sender to "Stalliq"** in Meta WhatsApp Manager (display name on +447782218609) — currently "Endoo Limited".
> 3. **Wipe test data on stalliq-production** — delete all docs in `orders` and `users` collections.
> 4. **ICO registration** — ico.org.uk, ~£40/year (required before collecting personal data in production).
> 5. **Google Sheet header rows** — protect header rows on all three La Muletti sheets.
> 6. **Buy Star TSP143IV UE printer (£239.49)** — needed for B15 CloudPRNT dev/test; doubles as demo unit + the one resold to La Muletti.
>
> ### WhatsApp state (LIVE as of 2026-06-04)
> - WhatsApp order-ready notifications: **LIVE end-to-end** on dev (stalliq) AND production (stalliq-production) — tested 2026-06-04, message delivered ✅
> - Meta template `order_ready_notification`: **Active** ✅ · Twilio Content template: **APPROVED** ✅ · Meta Business Verification (Endoo Limited): **approved** ✅
> - `TWILIO_WHATSAPP_CONTENT_SID = HX8be19e3e8f7e038d326cd7a275ffdcd3` set in `functions/.env` (gitignored — one shared file; same Twilio account/number for dev + prod). Old SID `HXb0f2...577036c` retired (never synced to Meta).
> - SMS fallback: **fixed + working** — guard in `functions/index.js` changed to `if (!notificationSent)` so SMS fires whenever WhatsApp fails or the SID is missing, even on the whatsapp channel. Applied develop + main.
> - ⚠️ **Deploy-time env gotcha:** Cloud Function env vars bake in at deploy. After editing `functions/.env` you MUST `firebase deploy --only functions` for EACH project — production sent SMS-only until functions were redeployed to stalliq-production.
> - ⚠️ **Sender display name = "Endoo Limited"** (WhatsApp Business profile on +447782218609). DECISION: rename to **"Stalliq"** in Meta WhatsApp Manager (Phone numbers → +447782218609 → Profile → Display name → submit for review). One shared number = one display name for all vendors; vendor still named in the body via `{{2}}`. True per-vendor sender names need a separate number/WABA per vendor — future premium option.
> - Channel toggle: `vendors/{id}/messagingChannel` ('sms'|'whatsapp') via kitchen settings (owner-only). Set per Firebase project — toggling on dev does not affect production.
>
> ### Messaging unit costs (confirmed 2026-06-04, Twilio bills in USD; GBP approx @ ~0.79)
> - **SMS (UK):** outbound **$0.056/segment** (~£0.044) — *per segment*, so >160 chars = 2×; inbound $0.0075; mobile number rental ~$2.50/mo (already held +447782218609). No platform/monthly fee — pure pay-per-message.
> - **WhatsApp (UK):** Twilio fee **$0.005/msg** (in or out) + Meta template fee passed through. **Utility** template (order-ready notification) ≈ **under $0.03**, and **FREE inside the 24h customer-service window** → all-in ≈ **$0.035 / ~£0.027** per ping, *cheaper than SMS*. **Marketing** template (B3b flash-sale broadcasts) UK ≈ **£0.0382** (~$0.048) + $0.005 Twilio — pricier, so SMS may stay default for broadcasts. **Authentication** template low (OTP).
> - **Takeaway:** transactional WhatsApp beats SMS on cost (~£0.027 vs ~£0.044+); keep SMS as fallback. Re-check Meta UK rate card at launch — rates shift periodically. Source: twilio.com/en-us/sms/pricing/gb + twilio.com/en-us/whatsapp/pricing.
> - **Monthly cost model built (2026-06-04):** `Stalliq_LaMuletti_WhatsApp_Cost_Model.xlsx` (in La Muletti folder). For their pattern (2 nights every weekend + 1 event weekend/mo ≈ 6 regular + 2 event nights): order-ready WhatsApp pings cost **~£3–£10/month** (Low 120 orders→£3.32, Mid 220→£6.08, High 370→£10.23) — trivial. Flash-sale broadcasts are separate & pricier (marketing rate, ~£34/mo for 200 subs × 4 broadcasts) and SMS broadcast is similar cost, so channel choice there is reach/UX not savings. Inputs are editable blue cells.
>
> **⚠️ Backlog:**
> - ~~B3: WhatsApp as premium notifications tier~~ ✓ **LIVE 2026-06-04** — Meta verified, template SID wired, deployed dev + production, tested end-to-end. La Muletti can be flipped to WhatsApp via the kitchen toggle.
> - B3b: WhatsApp flash sale broadcasts — needs a separate Meta marketing template approval. Currently flash sale broadcast always uses SMS.
> - B4: Generic code audit — remove hardcoded pizza/La Muletti refs from shared layer ⚠️ risky — do on feature branch.
> - B5: Flash sale BOGO / flexible discount types — currently only % off and £ off. Future: buy-one-get-one-free.
> - B6: Google Play Store TWA wrap — pwabuilder.com generates signed AAB. Needs assetlinks.json on Netlify domain + Play Developer account (~$25).
> - ~~B7: Collection Window ("Queue from Anywhere")~~ ✓ Done 2026-05-29 — built on develop (Session 41), ported to main (Session 42).
> - B8: Menu Categories — add `category` column to Google Sheet; group items by category in app.js with section headers; `CONFIG.ordering.menuCategories` array defines display order. Low risk, no Firestore changes needed.
>
> **🚀 August 2026 launch requirements (Dan & Daniele — from pitch meeting 2026-06-03):** to be triaged for approach/feasibility separately.
> - B9: Card payment integration — no-show prevention is the driver (app orders that don't turn up; same problem they have with unpaid walk-ins). **TARGET = ALL-IN ON STRIPE, eliminate Square entirely.** Stripe online/app for orders + **Stripe Terminal Tap to Pay** for in-van card-present — Danielle's phone becomes the reader, NO hardware, 10p/auth + 1.4%+10p UK/EEA card-present (below Square's ~1.75% — confirm vs their Square plan). One device, one app, one processor, one dataset → makes B11/B12 cleaner (every payment in one place). No setup fee/fixed term. **Dependency:** Tap to Pay needs supported phone (iPhone XS+/iOS 16.4+ or compatible NFC Android) — CHECK Danielle's device; fallback BBPOS WisePad 3 £49. **Phasing decision (protect August date):** either go all-Stripe+Tap-to-Pay at launch (more build: Terminal SDK + card-present flow) OR launch Stripe-online + keep Square reader, fast-follow Tap to Pay. Lean all-Stripe at launch if scope allows. **Walk-in payment capture:** add cash/card toggle to walk-in modal; record method on the order doc (`source` already = walk-in; populate `payment`). Combinations: walk-in+cash, walk-in+card (card still taken on Square reader — Stalliq records that it was card, does NOT process it; flag as externally-captured so MI never double-counts as Stalliq-processed), app+card (Stripe). This payment-method dimension feeds the cash-vs-card split in B12 (matches Square's Payment Methods report). **✅ Stripe pricing confirmed 2026-06-04 (stripe.com/gb/pricing):** NO integration/API fee, NO monthly fee, NO setup fee — pay-as-you-go, charged per successful transaction only (no monthly minimum, so quiet events cost £0). **In-person / Tap to Pay (card-present): 1.4% + 10p** standard UK cards (premium UK cards higher) — below Square's ~1.75%, confirms the cost case. **Online / in-app (card-not-present): 1.5% + 20p** standard UK cards, 2.5% + 20p international. **Hardware:** Tap to Pay = £0 (Danielle's phone IS the reader, needs iPhone XS+/iOS 16.4+ or compatible NFC Android — CHECK device); fallback BBPOS WisePad 3 = £49 ex-VAT; Stripe Reader S700 (standalone smart reader, overkill) = £229 ex-VAT. For La Muletti, realistic hardware spend is £0–£49. **⚠️ CORRECTION 2026-06-04 — "below Square's ~1.75%" is misleading, do NOT pitch Stripe as cheaper:** Square ALSO offers free Tap to Pay on phones in the UK (no hardware, no feature fee, iPhone XS+/NFC Android) — same capability, live for a while — so phone-tap is NOT a Stripe-only differentiator. On price, Square = **1.75% flat** (no fixed pence; +1.5% non-UK cards); Stripe = **1.4% + 10p**. The 10p fixed fee flips small tickets: Square cheaper below ~**£28.50**/txn, Stripe only cheaper above it. Worked: £10 order → Square 17.5p vs Stripe 24p (Square wins); £40 → Square 70p vs Stripe 66p (Stripe wins). So single-pizza walk-ins favour Square; multi-pizza family orders favour Stripe — depends on their avg order value. **Lead the swap on CONSOLIDATION (one processor, one dataset, app+in-person together, no-show prevention, clean MI), NOT lower fees** — per-tap price is roughly a wash. Source: squareup.com/help/gb fees + Square UK Tap to Pay page; stripe.com/gb/pricing.
> - B10: Ingredient-level extras & customisation pricing — Danielle prices each ingredient separately in Square (e.g. 2× extra salami) so extras can be charged. Needs to live in Stalliq's order/customisation flow.
> - B11: Single-system consolidation — replace dual Square + Stalliq workflow with one. Constraints: Dan works off hand-written paper tickets; they don't want to buy a second tablet yet. Couples with B10/B12. **Enabled by B15 (printer) — that's what removes Danielle's hand-writing while keeping Dan on paper.** Full end-state (with B9 all-Stripe/Tap-to-Pay): Danielle runs Stalliq on her phone → takes app+walk-in orders → taps card on same phone → ticket auto-prints to Dan. One device, one app, one processor, one dataset — Square eliminated entirely.
> - B16: Just-in-time cook scheduling — "To Fire" kanban lane (resolves the parked cold-pizza concern). Each accepted order gets a calculated **fire-at time** = collection time − cookMins − buffer. New staging lane between Accepted and Preparing; cards auto-promote into it and escalate visually: calm → amber "due soon" (~10 min out) → red/pulsing "FIRE NOW" at cook-start. Colour/motion for at-a-glance reading in a busy kitchen (numbers alone don't cut it). Per-item `cookMins`/`prepMins` live as **hidden columns in the menu Google Sheet** (NOT config.js) — vendor-configurable, agile, and specials carry their own timings automatically with no code change. Customer menu parser ignores the columns (not displayed); kitchen.js reads them for the fire-at calc. Graceful fallback required: blank/missing column → default to a config value or sensible constant (same pattern as existing sheet loader, roadmap item 07) so a missing number never breaks the board. La Muletti ~3 min/pizza. Data-driven so it works for any vendor; v1 keeps multi-item orders to one estimate per order (don't model oven capacity yet). **Load-management nudge:** if the To-Fire lane stacks beyond capacity, prompt "N due in next 10 min — pause new orders?" (ties to kitchenStatus closed_busy) — this is the real answer to their app-demand/capacity worry. Guard rail: auto-move INTO the lane only; never auto-move a card OUT of Preparing once grabbed. Naming: "To Fire"/"Firing Soon" (kitchen lingo) or "Up Next". Build: medium, client-side in kitchen.js + config cook times, no Firestore schema change required (optional `scheduledCookAt`). Idea from Julian 2026-06-03.
> - B15: Wireless thermal ticket printer (optional hardware extra) — eliminates Dan's paper-ticket bottleneck/Danielle's hand-written duplicates. Use **Star CloudPRNT** architecture: printer polls a Cloud Function endpoint over wifi/4G and auto-prints pending order tickets — NO tablet/PC beside it, sidesteps web→thermal-printer driver problems. Danielle enters every order once into Stalliq (app orders auto-flow; walk-ins via modal); ticket auto-prints next to Dan; he keeps working off paper with no screen to learn. Square reader stays for card-present. Standard model: **Star TSP143IV UE (CloudPRNT, ethernet/USB-C/USB-A, 80mm, grey) — confirmed £239.49 GBP, free shipping (priced 2026-06-03).** Sell as optional setup add-on (value-add + margin line — decide: pass at cost as founding-customer goodwill vs modest setup margin). Build: medium — CloudPRNT polling endpoint + ticket formatting; order data already exists. Physical printer REQUIRED for dev/test (polling cadence, ticket formatting, cut behaviour can't be faked). Same unit doubles as demo printer + the one resold to La Muletti, so cost is recouped on their take-up. This is the mechanism that makes B11 real. Idea from Julian 2026-06-03.
> - B12: MI & Reporting — cash taken, sales totals, top-selling pizzas, sliced by event/day/weekend/week/month. Currently they get this from Square. Maps to roadmap item 23 — now a launch requirement.
> - B13: "We're Open" broadcast to all subscribers — on turning live broadcast on at a location, option to message ALL subscribed users (not just geofenced) that they're open.
> - B14: Review → account signup reward (decoupled / honour-system). Goal: nudge customers to leave a Google review AND sign up for an account in exchange for a reward. **Hard-link is NOT buildable** — Google Business Profile API exposes reviewer display name/photo/rating/text only, no email/phone, so a Google reviewer can't be matched to a Stalliq customer. Deliverable approach: post-collection prompt with two side-by-side CTAs — "⭐ Leave a Google review [link]" + "Create an account for a welcome reward." Reward the signup (verifiable, = existing customisable welcome offer code); merely encourage the review (unverifiable, gaming risk negligible for a van). Bonus: pull reviews read-only via API to show a live star-rating/review feed in-app as social proof (no linking needed). Idea from Dan & Daniele 2026-06-03.
>
> **✅ Resolved — cooking-sequence / cold-pizza concern → see B16.** Dan & Daniele worried app orders for different collection times make sequencing hard and pizzas go cold. Julian's angle (it's about *when they start cooking*) is now specced as B16 just-in-time "To Fire" lane.
>
> **✅ Pitch delivered to Dan & Daniele 2026-06-03 — went well, they're in. GO-LIVE: AUGUST 2026** (deliberate, not rushed — testing window + their wedding in Italy + Julian's 2 weeks in Spain). Deck: `Stalliq_LaMuletti_Pitch_baseline_1.0.pptx`. See August launch requirements B9–B13 in backlog.**
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

**Commercial arrangement (finalised 2026-06-01):** £149 one-time setup fee. Year 1 free — full Festival tier. Year 2+: £39.50/month (50% off Festival, locked for life as Founding Customer #1). Cancel and rejoin loses the rate permanently. **Pitch meeting: Wednesday 2026-06-04. Daniele confirmed he wants to go ahead — first meeting April 2026.**

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

**Structural differentiator — MI & Reporting (B12):** Stalliq owns the full loop — orders, payments, loyalty, broadcasts AND the analytics on top. Square has reporting but no customer relationship and no marketing channel; Indi Local has discovery but doesn't run the vendor's operations. Only Stalliq has all the inputs in one place, so it can report on what neither competitor can touch: repeat-customer rate, loyalty redemption, broadcast-to-sales conversion, per-event/per-location performance. B12 is therefore not just a parity play vs Square — it is the instrument that *generates the La Muletti case-study evidence* (see below) used to sell the next ~16 customers and to open the Sophie conversation. Highest-leverage item on the August launch list.

**✅ Customer validation (pitch meeting 2026-06-03):** Julian asked Dan & Daniele at the end, "Is there anything you don't like or think is missing?" — answer: "No, we can really see how this would work." Unprompted endorsement when actively invited to criticise. Strongest PMF signal to date.

**Revenue target:** £10k/year years 1-3
**Required customers:** ~17 at blended £49/month average

**📊 Strategic assessment (2026-06-03, post-pitch):** Product-market fit at the level of one delighted operator is essentially proven — B9–B16 turn Stalliq from "ordering app" into the operating system for a van (orders, payments, customisation, MI, JIT cooking, auto-print, loyalty, broadcasts), a category position neither Indi Local (discovery), Square (payments, no customer relationship) nor delivery apps (30% commission) can easily copy. The risk has relocated from *can we build it* → *can we sell & support it at pace*. Two binding constraints: (1) distribution/inertia — the real competitor is "Square + paper already works"; overcoming it needs the La Muletti case-study data (instrument from day one) + the Sophie referral channel; (2) Julian is the throughput ceiling — solo build/test/sell/onboard/support, ~17 bespoke setups = support ceiling + key-person risk, which is why self-serve onboarding (roadmap 22) matters more to the economics than AI Assist. **AI Order Assist deprioritised — comes after B9–B16** (vision feature, not a wedge). Verdict: ~17 vans / £10k over 3 yrs across MK–Bedford–Northampton = **probable** with steady sales + case study; regional default = **plausible**, hinges on speed vs Indi Local's 180+ vendor distribution; national/bigger = different game needing partners + more hands + self-serve onboarding.

**🤝 Potential partner — Will Thompson (Epicagile):** possible northern-regions counterpart to Julian — parallel distribution + shared sales/support load, directly addresses the throughput-ceiling and regional-cap risks above. Agile delivery background (would grok the model fast). To pursue. Structure to nail down: territory, revenue split, support ownership, brand consistency. (See Section 22 for Sophie partnership structure as a reference.)

---

## 5. Pricing Model

**Tier names: Stall / Market / Festival** (updated 2026-06-01)

| Tier | Monthly | Annual (2 months free) | Features |
|------|---------|------------------------|----------|
| Stall | £19 | £190 | Core ordering, kitchen dashboard, live/offline toggle, 1 staff PIN |
| Market | £49 | £490 | Stall + loyalty stamps, flash sales, geofence alerts, collection window, WhatsApp, 3 staff accounts |
| Festival | £79 | £790 | Market + AI Order Assist (when built), unlimited staff, priority support |

**Pricing principles:**
- No commission, ever — flat monthly only
- Monthly rolling, no contracts — cancel anytime
- Annual plans: 2 months free (~17% discount) — paid upfront
- New customer prices reviewed annually (not CPI — fixed annual review)
- Founding customers grandfathered at signup price for life — first 5 customers only
- Cancel and rejoin loses the Founding rate forever
- Display pricing publicly on stalliq.co.uk with commission comparison built in
- Revisit prices at customer #10 — real conversion data will show which tier is centre of gravity

**La Muletti — Founding Customer #1 deal (agreed 2026-06-01):**
- One-time setup fee: £149 (menu config, branding, staff onboarding, on-site go-live)
- Year 1: FREE — full Festival tier, all features as built, no conditions
- Year 2+: £39.50/month — 50% off Festival, locked for life
- Founding rate lost permanently if subscription cancelled and restarted

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
| 16 | SMS Order Ready Notifications | ✅ Done | SMS notifications live on dev + production (Session 38). Twilio UK number +447782218609. Messaging toggle in kitchen settings. WhatsApp template re-submitted directly via Meta WhatsApp Manager 2026-05-29 (in review) — once approved, update Cloud Function to use template name not old Twilio Content SID. Future premium tier (B3). |
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

## 18. Deployment Pipeli