# Stalliq — Project Bible
> Last updated: 2026-05-18 — Session 39: Feature 19 — Geofenced Flash Sale Alerts fully wired. Kitchen panel writes to Firestore ✅. Firestore rules updated ✅. Geocoding API key added ✅. Functions deployed (pending). Postcode opt-in pending end-to-end test. UI polish needed on both kitchen panel and customer account section.
> **Next session — start here:**
> - **🔴 Rotate Twilio Auth Token** — SID accidentally committed to git history on develop. Rotate at Twilio Console → Account → API keys & tokens. Update `functions/.env` on both branches.
> - **Deploy functions to develop** — run `firebase deploy --only functions` from lamulettipizza dir. Then test postcode opt-in end-to-end (enter postcode → check Firestore for postcodeLatLng → activate broadcast in kitchen → send flash sale → confirm SMS arrives).
> - **Feature 19 UI polish** — flash sale section in kitchen settings feels cluttered; postcode opt-in section on customer account page also needs tightening. Tackle as a dedicated polish pass next session.
> - **Check WhatsApp template approval** — submitted 2026-05-17. Once approved: implement WhatsApp as premium tier (backlog B3).
> - **Wipe test data on stalliq-production** — still outstanding before demo (see action 3 below).
> - **Node.js 20 deprecation** — upgrade functions to Node 22 before 2026-10-30.
> - **Future session:** Add Stalliq product page to endoo.co.uk (under Products) — agreed with Julian 2026-05-10.

## What is Stalliq?
Julian (Endoo Limited) is building Stalliq — a white-label PWA food ordering platform for independent mobile street food vendors. La Muletti Pizza (Daniele + Danielle, Bletchley MK) is the launch customer, on a free Year 1 Founding Customer deal.

---

## Demo with Daniele — postponed ~2 weeks from 2026-05-17 (he is busy)

### Outstanding actions (Julian)
1. ~~**Add composite index on `stalliq` dev Firebase project**~~ ✓ Done — stamps confirmed working on demo.stalliq.co.uk.
2. ~~Add image links to Street Stack menu sheet~~ ✓ Done 2026-05-09
3. **Wipe test data on stalliq-production** — Firebase Console: delete all docs in `orders` and `users` collections. Keep `vendors/{vendorId}/staff/` (staff PINs), `kitchenStatus`, `location`, `counters`.
4. ~~James's stamp count~~ ✓ Done 2026-05-10 — `stampCount` set to 0 in stalliq-production.
5. **ICO registration** — ico.org.uk, ~£40/year (Endoo Limited — required before collecting personal data in production).
6. **Google Sheet header rows** — protect header rows on all three La Muletti sheets.
7. ~~stalliq.co.uk demo tile~~ ✓ Fixed 2026-05-10 — full site rebuilt, links correctly to `https://demo.stalliq.co.uk`.
8. ~~Set `role: "owner"` on the Owner staff doc in both Firebase projects~~ ✓ Done 2026-05-10.
9. ~~Deploy stalliq-site~~ ✓ Done 2026-05-10.
10. ~~Add `stalliq-site` to GitHub source control~~ ✓ Done 2026-05-10 — repo at `JulianBell106/stalliq-site`, linked to Netlify.
11. **Generic code audit** ⚠️ High priority before scaling — remove hardcoded pizza/La Muletti refs from shared layer. Do on feature branch. Do not rush — risky change.
12. ~~Rename Firebase `stalliq` project → `stalliq-development`~~ ✓ Done 2026-05-10.
13. ~~**Twilio billing**~~ ✓ Done 2026-05-17 — card added, compliance profile approved.
14. ~~**Twilio UK number**~~ ✓ Done 2026-05-18 — number +447782218609 purchased. WhatsApp Business profile created (Endoo Limited). `.env` written on both branches. SMS working end-to-end on dev and production.
15. ~~**Deploy Feature 16 to main**~~ ✓ Done 2026-05-18 — functions deployed to stalliq-production. `displayName: "La Muletti"` set on vendor doc. IAM Cloud Build permissions fixed on stalliq-production.
16. ~~**Messaging toggle in kitchen settings**~~ ✓ Done 2026-05-18 — owners can enable/disable SMS notifications from kitchen settings. Defaults to enabled. Deployed to both dev and production.

---


## Session 39 — 2026-05-18: Feature 19 — Geofenced Flash Sale Alerts (develop)

### Changes
- **`index.html`** — Firebase Functions CDN script added. CSS for postcode opt-in/status chip added. Placeholder divs `#m-postcode-section` / `#d-postcode-section` added to both mobile and desktop account views (between Offers and Order History).
- **`js/app.js`** — `userPostcode` state var added. `renderPostcodeSection(prefix)`, `togglePostcodeInfo(prefix)`, `submitPostcode(prefix)`, `removePostcode()` functions added. `listenUserProfile` updated to sync `userPostcode` and re-render postcode sections. `loadAccountPage` updated to call `renderPostcodeSection`.
- **`kitchen.html`** — Flash Sale section added to settings modal (owner-only, below Customer Notifications). Textarea, char counter, Save as template link, Send button, broadcast warning, status line.
- **`js/kitchen.js`** — `loadFlashSaleTemplate()`, `updateFlashSaleUI()`, `saveFlashSaleTemplate()`, `sendFlashSale()` functions added. `listenBroadcastState` updated to call `updateFlashSaleUI()` on change. `loadStaffList` updated to show/hide flash sale section (owner-only) and load template.
- **`functions/index.js`** — `geocodePostcode` callable Cloud Function added. `flashSaleBroadcast` Firestore onCreate trigger added. `GOOGLE_GEOCODING_API_KEY` env var required (not yet added to `.env` — Julian to action before deploy).

### Still needed before Feature 19 is testable
1. Get a Google Geocoding API key from Google Cloud Console (stalliq project) → enable Geocoding API → add `GOOGLE_GEOCODING_API_KEY=<key>` to `functions/.env` on develop.
2. `firebase deploy --only functions` on develop.
3. Test: sign in on demo site, enter a postcode, verify lat/lng written to Firestore. Activate broadcast in kitchen, send a flash sale, verify SMS arrives.

---

## Session 38 — 2026-05-18: Feature 16 — Live on Production + Messaging Toggle

### Changes
- **Twilio UK number purchased** — +447782218609. WhatsApp Business profile created under Endoo Limited Meta Business account.
- **`functions/.env`** — written on both `develop` and `main` with real Twilio credentials and number. Gitignored.
- **Feature 16 SMS-only** — WhatsApp attempt removed. Cloud Function sends SMS only. WhatsApp moved to future premium tier (see backlog B3). Deployed to both `stalliq` dev and `stalliq-production`.
- **Messaging toggle** — `vendors/{vendorId}/messagingEnabled` (bool, default true). Kitchen settings → Customer Notifications section (owner-only). Toggle writes to Firestore; Cloud Function checks flag before sending. Deployed to both branches.
- **`displayName: "La Muletti"`** — set on `vendors/lamuletti` in stalliq-production Firestore so SMS reads correctly.
- **IAM fix** — granted `Storage Object Viewer` to `275171575630@cloudbuild.gserviceaccount.com` on stalliq-production (required for first Cloud Functions deploy).
- **`firebase.json`** — updated on `main` to include functions block (source: functions, runtime: nodejs20).
- **`.firebaserc`** on `main` — `"default": "stalliq-production"`.

### Twilio state (2026-05-18)
- UK number: +447782218609 ✅
- WhatsApp Business profile: Endoo Limited ✅
- SMS notifications: ✅ Working on dev and production
- WhatsApp content template `order_ready_notification` (HXb0f2b4e74995392bf1f82095d577036c): **Pending Meta approval** — submitted 2026-05-17, expected within 48hrs

---

## Session 37 — 2026-05-17: Feature 16 — Order Ready Notifications

### Changes
- **`functions/index.js`** — Cloud Function `orderReadyNotification`. Firestore trigger on `orders/{orderId}` onUpdate. Fires when status → `ready`. Resolves `firstName` from `users/{customerId}` (or `customerName` for walk-ins). Resolves `vendorName` from `vendors/{vendorId}/displayName`. Attempts WhatsApp send via Twilio content template (`HXb0f2b4e74995392bf1f82095d577036c`), SMS fallback on failure. Logs outcome back to order doc (`notificationSent`, `notificationChannel`, `notificationSentAt`).
- **`functions/package.json`** — firebase-admin ^12, firebase-functions ^5.1, twilio ^5.3, nodejs20.
- **`functions/.gitignore`** — excludes `node_modules/` and `.env`.
- **`functions/.env`** — local only, gitignored. Contains Twilio credentials. `TWILIO_WHATSAPP_FROM` and `TWILIO_SMS_FROM` still placeholder — pending UK number purchase.
- **`firebase.json`** — updated to include `functions` block (source: functions, runtime: nodejs20).
- **`.firebaserc`** — created on develop branch, `"default": "stalliq"` (dev project).
- **Deployed to `stalliq` dev project** — europe-west2, nodejs20, deployed 21:26. Trigger confirmed in Firebase console.
- **`vendors/demo/displayName`** — set to "Street Stack" in stalliq dev Firestore.

### Twilio state (2026-05-17)
- Account SID: configured (see .env — do not commit)
- Compliance profile: ✅ Approved
- Content template `order_ready_notification` (HXb0f2b4e74995392bf1f82095d577036c): submitted for Meta approval (Utility category) — pending
- UK mobile number purchase: compliance registration In Review — expected approval within 2 business days
- WhatsApp sender: not yet created (blocked on number purchase)

---

## Design Session — 2026-05-17: Feature 16/17/18 Notifications

### Build order agreed
1. ~~**Feature 16 — Order Ready Notifications (SMS)**~~ ✓ Done Session 38
2. ~~**Web Push infrastructure**~~ Dropped — SMS (Twilio) used instead. Simpler, works on all phones, no permission prompt.
3. ~~**Feature 19 — Geofenced Flash Sale Alerts**~~ ✓ Built Session 39 — postcode opt-in, geocoding CF, kitchen panel, broadcast CF.
4. **Next: Test + deploy Feature 19 to develop.** Then port to main when stable.

### Feature 16 — Order Ready Notifications spec

**Trigger:** Kitchen marks order → `ready` → Firebase Cloud Function fires.
**Channels:** WhatsApp first, SMS fallback on delivery failure. Same Twilio account.
**GDPR:** Transactional — no separate opt-in needed.

**WhatsApp template:** `order_ready_notification`
- Body: `Hi {{1}}, your order from {{2}} is ready for collection! Thanks for your order – see you soon.`
- `{{1}}` = customer first name · `{{2}}` = vendor name (CONFIG.business.name)
- Generic — no food emoji, works across all Stalliq vendors
- WhatsApp approval status: **Not yet submitted** (blocked on Twilio billing)

**SMS fallback:** `Hi {{1}}, your order from {{2}} is ready for collection! See you soon.`

**Cloud Function flow:**
1. Firestore `orders/{orderId}` write triggers on status → `ready`
2. Read `customerPhone` + `firstName` from order/user docs
3. Attempt WhatsApp send via Twilio content template SID
4. On failure → send SMS to same number
5. Log outcome

**Twilio setup state (2026-05-17):**
- Account created: julian@endoo.co.uk ✅
- Content template `order_ready_notification` created ✅
- Meta Business account created (Endoo Limited) ✅
- WhatsApp sender: ⏳ blocked on Twilio billing — Julian to add card (Google Pay failed, try card directly)
- Once billing active: complete WhatsApp sender setup → submit template for Meta approval (~24-48hr)

### Feature 19 — Geofenced Flash Sale Alerts spec ✅ Built Session 39

**Decision:** SMS (Twilio) used instead of Web Push. Simpler architecture, near-100% open rate, no permission prompt, works on all phones. Cost at La Muletti's scale is negligible.

**Postcode opt-in (customer app — account page):**
- New section between Offers and Order History on both mobile and desktop
- Shows opt-in card with postcode input, UK postcode validation (client + server), ℹ️ info tooltip explaining data use
- On submit: calls `geocodePostcode` Cloud Function (server-side Google Geocoding API — key never exposed)
- On success: `users/{uid}/postcode` + `users/{uid}/postcodeLatLng: {lat, lng}` written to Firestore
- `listenUserProfile` picks up the update and flips the card to a status chip showing opted-in postcode + "Remove postcode" link
- Remove: deletes both fields from Firestore; status chip flips back to opt-in card

**Geocoding Cloud Function (`geocodePostcode` — callable):**
- Validates postcode server-side, calls Google Geocoding API, writes lat/lng to `users/{uid}`
- Requires: `GOOGLE_GEOCODING_API_KEY` in `functions/.env`
- Auth guard: `context.auth.uid` used — user can only write their own record

**Kitchen flash sale panel (kitchen dashboard — settings modal, owner only):**
- New section below Customer Notifications toggle in the staff-list-screen
- Textarea pre-loaded with saved template from `vendors/{vendorId}/flashSaleTemplate`
- "Save as template" button — writes to vendor doc for next time
- Character counter (max 160 — one SMS)
- "Send Flash Sale" button — disabled with warning if broadcast not active (van must be live)
- On send: writes to `flashSales/{id}` → triggers `flashSaleBroadcast` Cloud Function

**Broadcast Cloud Function (`flashSaleBroadcast` — Firestore onCreate):**
- Triggers on `flashSales/{id}` creation
- Reads `vanLat`/`vanLng` from the doc (captured at send time from `location/current`)
- Queries all `users` where `postcodeLatLng != null`
- Filters to users within `FLASH_SALE_RADIUS_MILES = 3` using Haversine formula
- Sends SMS via Twilio to each in-range user
- Logs `sentCount`, `skippedCount`, `errors`, `completedAt` back to the `flashSales` doc
- Respects `vendors/{vendorId}/messagingEnabled` flag

**New Firestore collections/fields:**
- `users/{uid}/postcode` — normalised UK postcode string (e.g. `"MK1 1AA"`)
- `users/{uid}/postcodeLatLng` — `{ lat: number, lng: number }`
- `flashSales/{id}` — `{ vendorId, message, vanLat, vanLng, sentBy, createdAt, status, sentCount, skippedCount, errors, completedAt }`

**New env var required:**
- `GOOGLE_GEOCODING_API_KEY` — add to `functions/.env` on both branches before deploy

**New CDN script:**
- `firebase-functions-compat.js` added to `index.html` (required for `firebase.functions().httpsCallable()`)

---

## Session 36 — 2026-05-12

**Scope:** Apply pending app.js audio fix to develop branch.

### Changes
- **app.js audio fix — develop** (`js/app.js`). `unlockAudio()`: `audioCtx.state === 'suspended'` → `!== 'running'` + `.catch(() => {})`. `playReadyBeep()`: `if (ctx.state === 'suspended') await ctx.resume()` → `if (ctx.state !== 'running') await ctx.resume().catch(() => {})`. Matches main. All iOS audio fixes now on both branches.

---
## Session 35 — 2026-05-11

- **Bug fix — iOS PIN inputs unresponsive in kitchen settings** (`kitchen.html`, both branches). `type="password"` + `inputmode="numeric"` is broken on iOS Safari — Safari ignores `inputmode` on password fields and the password autofill UI intercepts the first tap. Fix: changed all 6 PIN inputs (`add-staff-pin`, `add-staff-pin2`, `edit-staff-pin`, `edit-staff-pin2`, `forgot-newpin-input`, `forgot-newpin2-input`) to `type="text"` + `autocomplete="off"` + CSS `-webkit-text-security: disc` (masks digits visually). New class `staff-pin-input` added.

- **Bug fix — iOS kitchen not updating order status in real-time** (`js/kitchen.js`, both branches). iOS Safari silently drops Firestore "document modified" WebSocket events while still delivering "document added" events — so new orders appeared but status changes from other devices didn't. Fix: iOS heartbeat (`startIOSHeartbeat` / `stopIOSHeartbeat`) runs `get({source:'server'})` every 20s on iOS only. Uses direct server fetch rather than recreating the `onSnapshot` listener (listener recreation caused cache-first stale reads = one state behind, and disrupted the beep interval). Also fixed `visibilitychange` handler to chain `enableNetwork().finally(() => listenOrders())` instead of calling them independently. Detection: `_isIOS` flag covers iPad Pro (`platform === 'MacIntel'` + `maxTouchPoints > 1`).

- **Bug fix — loyalty discount missing from Order Placed modal** (`js/app.js`, both branches). `buildOrderSummaryHTML()` was called after `await resetUserStamps()`. `resetUserStamps()` triggers `listenUserProfile` which immediately zeroes `userStampCount`, so `getLoyaltyDiscount()` returned null and the discount row was absent. Fix: moved `buildOrderSummaryHTML()` call to before `resetUserStamps()` in both mobile (`mPlaceOrder`) and desktop (`dPlaceOrder`) flows.

- **Bug fix — iOS kitchen audio silent after screen lock** (`js/kitchen.js`, both branches). Three layered fixes:
  1. `_unlockKitchenAudio()` — if existing AudioContext is not `'running'` (iOS breaks it post-lock), close and discard it rather than trying to `resume()` (which silently fails). Create a fresh context. Also play a silent 1-sample buffer during the gesture — iOS requires audio to actually be played during the gesture to fully prime the pipeline for subsequent non-gesture beeps.
  2. `playOrderAlert()` — handle `'interrupted'` state (iOS on lock/call/Siri) same as `'suspended'`; always try `resume()` if not `'running'`, show restore banner if `resume()` fails.
  3. Result: after screen lock/unlock, the red "🔔 New order — tap to restore sound alerts" banner appears; one tap now reliably restores audio without needing a page refresh.

- **app.js audio fix — both branches** (`js/app.js`). `unlockAudio()` and `playReadyBeep()` updated to handle `'interrupted'` AudioContext state (not just `'suspended'`). Applied to main (Session 35) and develop (Session 36).

---

## Session 34 — 2026-05-10

- **Endoo branding added to `stalliq-site/index.html`** — two placements:
  1. **Footer** — full-width ruled row below the copyright line: "A product of [Endoo logo] — Endoo Limited, registered in England & Wales". Logo links to `https://www.endoo.co.uk`.
  2. **CTA section** — trust sentence below the demo buttons: "Stalliq is built and operated by [Endoo Limited](https://www.endoo.co.uk) — a UK technology company based in Milton Keynes."
- **`endoo-logo.png` added to `stalliq-site/`** — resized from `Endoo_Logo_BestOf_110mm.png` (1299×434px) to 239×80px (13 KB), RGBA PNG. Displayed at 20px height via CSS. Cream/gold coloured logo on transparent background — renders correctly on the midnight dark background.
- **Netlify auto-deploy confirmed working** — `stalliq-site` Netlify project now properly linked to `JulianBell106/stalliq-site` GitHub repo. Push to `main` → auto-deploys to `stalliq.co.uk`.
- **Future session planned** — write a Stalliq product page for `endoo.co.uk` under Products to cross-reference from the Stalliq site.

---

## Session 33 — 2026-05-10 (continued)

- **Feature — FSA Food Hygiene Rating badge** (`index.html` + `js/config.js`, both branches). Gold circle showing rating score + "Very Good" label renders in the desktop footer. CONFIG-driven: `CONFIG.fsa.rating` (0–5 or `null` to hide). Script placed after `config.js` loads to avoid timing issue. Font: DM Sans on the score numeral. La Muletti: `rating: 5`. Street Stack demo: `rating: 5` (for demo purposes). ⚠️ develop `config.js` had null bytes — stripped on write.
- **Backlog done — stalliq-site to GitHub** (`JulianBell106/stalliq-site`, public). Moved to `Documents\Engineering\stalliq-site`. Linked to Netlify for auto-deploy on push to `main`. Old `stalliq-site/` folder inside La Muletti to be deleted manually.
- **Firebase rename** — `stalliq` project display name → `stalliq-development`. Project ID unchanged.

---

## Session 32 — 2026-05-10

- **B1 done — stalliq-site demo section rebuilt** (`stalliq-site/index.html`). Section title: "See both sides of every order." Two-panel layout: customer panel (CSS phone + ghost CTA → `demo.stalliq.co.uk`) and kitchen panel (CSS phone with animated order cycling New → Confirmed → Ready on 11s loop, primary teal CTA → `demo.stalliq.co.uk/kitchen.html`, demo PIN `123456`). Mobile-responsive: panels stack vertically. ⚠️ Deploy pending — drag `stalliq-site/` onto Netlify Drop.
- **Bug fix — desktop events not rendering** (`js/app.js`, both branches). Root cause: `renderEventsList` fired before sheet data loaded and was never called again post-load. Fix: added `renderEventsList(...)` call in the post-`Promise.all` block, after `renderMobileFindUs()`.
- **Bug fix — kitchen.html `:root` flashing La Muletti colours on Street Stack** (`kitchen.html`, develop only). Fixed `:root` CSS vars to Street Stack teal values.
- **Bug fix — Street Stack privacy.html showed La Muletti branding** (`privacy.html`, develop only). Completely rewritten for Street Stack palette and contact details.
- **B2 done — Live Broadcast race condition fixed** (`js/kitchen.js`, both branches). Stale GPS resolves after `stopLocationBroadcast()` were overwriting `active: false`. Fix: `broadcastStopRequested` boolean flag set on stop, cleared on start, checked inside the GPS callback before any Firestore write.
- **Feature — Staff role management** (`kitchen.html` + `js/kitchen.js`, both branches). `role: 'owner' | 'staff'` field in Firestore staff docs. Owners see all staff + add/edit/remove controls. Staff see own row only. Max 2 owners enforced in code + UI. Role set via Firebase Console at onboarding — no in-app promotion. `loggedInStaffRole` state variable + `sessionStorage` persistence. ⚠️ Julian must manually set `role: "owner"` on the Owner staff doc in both Firebase projects before demo.
- **Firebase Auth fix** — `demo.stalliq.co.uk` added to authorised domains on `stalliq` dev project (manual, Julian). Phone auth was failing on Street Stack demo.

---

## Session 31 — 2026-05-10

- **stalliq-site rebuilt** — replaced "coming soon" splash with full marketing site: sticky nav, hero, proof bar, spotlight carousel (Flash Sales / WhatsApp Messaging / Geofence Loyalty with animated visuals), feature bento grid (hairline-separated cells, inline SVG icons — no emojis), CSS phone mockups (customer + kitchen views side by side), CTA, footer. Gradient section dividers throughout.
- **ImprovMX email** — `hello@stalliq.co.uk` → `info@endoo.co.uk`, catch-all → `julian@endoo.co.uk`. MX + SPF records added to Netlify DNS. ✓ Working.
- **stalliq-site not yet deployed or on GitHub** — drag `stalliq-site/` folder onto Netlify Drop to publish; see backlog B3 for source control.

---

## Pre-production backlog

**B3 — WhatsApp as premium notifications tier** — once Meta template approved, add WhatsApp as an upgrade to the mid-tier SMS plan. Tier structure:
- **Mid tier ("Notify"):** SMS order ready notifications (current)
- **Premium tier ("Connect"):** WhatsApp notifications + SMS fallback. Richer UX, lower cost at scale, unlocks future Features 17/18 (Flash Sales, Geolocation) via WhatsApp.
- Implementation: add `messagingChannel: 'sms' | 'whatsapp'` to vendor doc. Cloud Function checks channel and sends accordingly. Kitchen settings toggle to switch channel (owner-only).
- **Dependency:** Meta WhatsApp template approval (pending as of 2026-05-18).

~~**B1 — stalliq.co.uk: Show kitchen dashboard more prominently**~~ ✓ Done Session 32 — full two-panel demo section with animated kitchen card and both CTAs. See Session 32 below.

~~**B2 — La Muletti: Live Broadcast re-enables itself (intermittent bug)**~~ ✓ Fixed Session 32 — `broadcastStopRequested` flag prevents stale GPS resolves from overwriting the stop. Applied to both branches.


---

## Domain & Hosting Architecture

| URL | Netlify Site | Branch | Firebase | Purpose |
|-----|-------------|--------|----------|---------|
| `stalliq.co.uk` | stalliq (stalliq.netlify.app) | — | — | Stalliq product marketing/coming soon |
| `demo.stalliq.co.uk` | stalliq-demo | `develop` | `stalliq` (sandbox) | Generic demo — configured ✓ 2026-05-09 |
| `lamuletti-stalliq.netlify.app` | lamuletti | `main` | `stalliq-production` | La Muletti live system |

**DNS:** stalliq.co.uk uses Netlify DNS. Nameservers: `dns1-4.p05.nsone.net` (set in HostPapa 2026-05-04).
**Email:** ImprovMX handles `@stalliq.co.uk`. MX records in Netlify DNS. `hello@` → `info@endoo.co.uk`, `*@` → `julian@endoo.co.uk`. ✓ Working 2026-05-10.
**Future vendors** will get `[vendor].stalliq.co.uk` subdomains — Netlify DNS makes this trivial.

---

## Environment Architecture

| Branch | Netlify Site | Firebase Project | Purpose |
|--------|-------------|-----------------|---------|
| `develop` | stalliq-demo.netlify.app / demo.stalliq.co.uk | `stalliq` (dev sandbox) | All active development + Street Stack demo |
| `main` | lamuletti-stalliq.netlify.app | `stalliq-production` | La Muletti live system |

**Key files:**
- `.gitattributes` — protects `js/firebase.js` and `js/config.js` with `merge=ours` — **NOT index.html**
- `js/firebase.js` — branch-specific: dev creds on `develop`, production creds on `main`
- `js/config.js` — customer-specific: Street Stack on `develop`, La Muletti on `main`

**⚠️ index.html is NOT protected by .gitattributes.** Merging develop → main WILL overwrite La Muletti's CSS vars. Never merge index.html. Apply all UX changes to both branches separately.

**Merge workflow:** finish on `develop` → test on demo.stalliq.co.uk → apply same generic changes to `main` directly → push → lamuletti-stalliq auto-deploys.

---

## Branch divergence (intentional as of Session 30, updated Session 32)

| | `develop` (Street Stack) | `main` (La Muletti) |
|--|--|--|
| `:root` CSS vars | Street Stack teal (corrected Session 32) | La Muletti fire/gold/cream |
| `kitchen.html` `:root` | Street Stack teal (fixed Session 32 — was flashing La Muletti colours) | La Muletti fire/gold/cream |
| `privacy.html` | Street Stack branding (rewritten Session 32) | La Muletti branding |
| Desktop card height | 180px | 220px |
| Mobile card img height | 140px | 170px |
| Mobile img position | `center center` | `center 60%` |
| `.m-menu-card.no-image` CSS | present | not needed yet (all items have images) |
| No-image card template | Vertical with `.m-card-footer` | Side-by-side (original) |

---

## Architecture — File Overview

**7 files — all live on Netlify**

| File | Purpose |
|------|---------|
| `index.html` | Customer app — ALL styles in embedded `<style>` block |
| `css/styles.css` | Legacy mobile-only styles — do NOT edit for desktop |
| `js/config.js` | All customer-specific data — only file that changes per customer |
| `js/firebase.js` | Firebase init — branch-specific credentials |
| `js/app.js` | All customer-side logic (~3520+ lines) |
| `kitchen.html` | Kitchen dashboard — PIN protected |
| `js/kitchen.js` | All kitchen logic (~2120+ lines) |

**⚠️ Desktop CSS lives in `index.html` `<style>` block — NOT in css/styles.css**

**Firestore:** always use compat SDK pattern (`db.collection().doc().onSnapshot()`) — never modular destructuring.

**Kitchen Firebase isolation:** `kitchen.js` uses a named app instance (`firebase.initializeApp(config, 'kitchen')`) → `kitchenAuth` + `kitchenDb`. App Check activated on both.

**Firestore staff doc schema** (`vendors/{vendorId}/staff/{staffId}`):
```
name:      string
pinHash:   string   (SHA-256 hex of PIN+salt)
pinSalt:   string   (random hex — missing = '' for backward compat)
active:    boolean
createdAt: timestamp
role:      string   ('owner' | 'staff') — added Session 32. Missing = treated as 'staff'. Max 2 owners. Set via Firebase Console at onboarding.
```

---

## CONFIG-driven architecture

All vendor-specific text is driven from `js/config.js`. Key CONFIG fields:

- `CONFIG.business.name` / `nameShort` / `type` (e.g. `'pizzas'`, `'burgers'`) / `stampIcon`
- `CONFIG.howItWorks` — `{ eyebrow, title, steps: [{title, desc}] }` — renders in desktop How It Works section
- `CONFIG.ordering.paymentNote` — shown in menu sub-header
- `CONFIG.menuSheetUrl` / `eventsSheetUrl` / `offersSheetUrl` — Google Sheets CSV URLs
- If `offersSheetUrl` is blank → `loyaltyConfig = null` → stamp card hidden entirely (correct behaviour)

---

## Design Tokens

### La Muletti (main branch `:root`)
```
--fire: #C4271A   --gold: #D4A043   --cream: #FDF6EC   --dark: #1A0A00
--char: #2C1A0A   --smoke: #5C3D1E  --ember: #D93B25   --ash:  #8B6347
--gold-pale: rgba(212,160,67,0.10)  --gold-mid: rgba(212,160,67,0.22)  --gold-rule: rgba(212,160,67,0.12)
--text-primary: rgba(253,246,236,0.95)  --text-secondary: rgba(253,246,236,0.75)  --text-muted: rgba(253,246,236,0.55)
```
Fonts: Playfair Display, DM Sans, Cormorant Garamond

⚠️ Always use CSS vars in JS inline styles — never hardcode hex.
⚠️ If `:root` on main ever shows teal colours, restore from an earlier commit: `git show origin/main~N:index.html`

### Stalliq / Street Stack (develop branch `:root`)
```
--fire: #14B8A6   --gold: #2DD4BF   --cream: #F0FDFA   --dark: #0B1221
```
Font: Inter (via Google Fonts)

---

## Image Hosting

All vendor images hosted on **Cloudinary** (account: `dqaotqmn8`).
- La Muletti images: `stalliq/la-muletti/brand/` folder
- Street Stack images: `stalliq/street-stack/` folder
- Vendors add image URLs to their Google Sheet `image` column

---

## Street Stack Demo — Google Sheet URLs

- **Menu:** `https://docs.google.com/spreadsheets/d/e/2PACX-1vSP7_Si73YVPKnVerMYSbWAhC4Sz9iagORnZ88kLVpssTxTuS0asui3r_yTmaGXGA/pub?output=csv`
- **Events:** `https://docs.google.com/spreadsheets/d/e/2PACX-1vQH9InpxkAASnzySuI-8gma3P9p76LanPqGgvQW9Rqs9l385ngFWj6fqKhTtjLREg/pub?output=csv`
- **Offers:** `https://docs.google.com/spreadsheets/d/e/2PACX-1vSIRl-ACpUFdEiajbFuZfbD4dFyJmeI_WjOYEaHoPsUY6jumgP2g_95DwWmtwgLTQ/pub?output=csv`

---

## Production Firebase (stalliq-production)

- **Firestore:** europe-west2, production mode rules deployed
- **Auth:** Anonymous + Phone enabled. Authorised domains: `lamuletti-stalliq.netlify.app`, `demo.stalliq.co.uk` (added Session 32)
- **App Check:** reCAPTCHA v3 site key: `6LelNtksAAAAAPEoa2QCW0RDzB7FHMsTNwyDaq4t`, enforced on Firestore
- **Vendor data:** `vendors/lamuletti` — kitchenStatus, ownerPhone, counters/daily, staff (Harry, Som, Owner), location/current
- **Composite index:** `orders` → `customerId` ASC + `createdAt` ASC — created 2026-05-06 ✓

---

## Commercial

**La Muletti deal:** Free Year 1 → 50% off for life from Year 2 (Founding Customer)
**Daniele confirmed he wants to go ahead — April 2026**

**Sophie (sophieetc.com):** MK food blogger — referral partner plan post-La Muletti data (Month 4-5). Commission: 20% of gross monthly subscription, 24 months per customer, then full margin.

---

## Large File Editing Rules

- `app.js` and `index.html` — patch via Python string replace only, never Edit tool directly
- Always verify JS with `node --check` after every change
- ⚠️ app.js on develop has null bytes — strip first: `tr -d '\000' < app.js > /tmp/app_clean.js`
- ⚠️ Always write large files using Python binary mode `open(dest, 'wb').write(data)` and verify size. Direct `cp` to Windows mount truncates large files.
- ⚠️ Never use apostrophes/contractions inside single-quoted JS strings in config.js

---

## Deployment

- GitHub: https://github.com/JulianBell106/lamulettipizza
- Dev: https://demo.stalliq.co.uk — tracks `develop` branch
- Production: https://lamuletti-stalliq.netlify.app — tracks `main` branch
- Stalliq site: https://stalliq.co.uk — Netlify drop deploy from `stalliq-site/` folder
