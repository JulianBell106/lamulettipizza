# Stalliq — Project Bible
> Last updated: 2026-05-29 — Session 42: B6 tested + ported to main, chip/card styling improved, Twilio Auth Token rotated, WhatsApp template re-submitted via Meta (in review), B8 Menu Categories logged.
> **Next session — start here:**
> - ~~**Rotate Twilio Auth Token**~~ ✓ Done 2026-05-29 — token rotated, `.env` updated on both branches, functions redeployed to both `stalliq` and `stalliq-production`.
> - ~~**B6 Collection Window**~~ ✓ Done 2026-05-29 — tested on develop, ported to main.
> - ~~**Flash Sale (Feature 19b)**~~ ✓ Done — deployed to develop and main.
> - **Feature 19b UI polish** — postcode opt-in section on customer account page needs tightening (separate task).
> - **WhatsApp template approved? → Update Cloud Function** — once Meta approves, update `functions/index.js` to send via template name rather than old Twilio Content SID (`HXb0f2b4e74995392bf1f82095d577036c`). See WhatsApp state below.
> - **Wipe test data on stalliq-production** — still outstanding before demo (see action 3 below).
> - **Node.js 20 deprecation** — upgrade functions to Node 22 before 2026-10-30.
> - **Future session:** Add Stalliq product page to endoo.co.uk (under Products).
>
> ⚠️ **Julian — actions outstanding:**
> 1. **Wipe test data on stalliq-production** — orders + users collections.
> 3. **ICO registration** — ico.org.uk, ~£40/year.
> 4. **Google Sheet header rows** — protect header rows on La Muletti sheets.
> 5. **Commit + push both branches** — commit Session 42 changes (chip styling, B6 port to main, PROJECT.md updates) on both develop and main.

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

### Twilio state (updated 2026-05-29)
- UK number: +447782218609 ✅
- WhatsApp Business profile: Endoo Limited ✅
- SMS notifications: ✅ Working on dev and production
- WhatsApp content template `order_ready_notification` (HXb0f2b4e74995392bf1f82095d577036c): **Never reached Meta** — original Twilio submission did not sync to Meta WABA despite number being Connected.
- **Re-submitted 2026-05-29 directly via Meta WhatsApp Manager** — Utility / Default / English (GB). Header: "Your order is ready". Body: `Hi {{1}}, your order from {{2}} is ready for collection! Thanks for your order – see you soon.` Status: **In review**.
- Once approved: update `functions/index.js` to reference template by name instead of old Twilio Content SID.

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

### ⚠️ Feature 19 — Outstanding: Flash Sale Discount Not Applied at Checkout

**The gap:** The SMS fires correctly and the `flashSales/` doc is written, but the discount is never applied in the customer basket or to kitchen walk-in orders. The notification is disconnected from the transaction. Must be fixed before Feature 19 goes to production.

**The fix — `vendors/{vendorId}/flashSale/current` live state doc:**

Same pattern as `location/current` and `kitchenStatus` — a single document the whole app listens to in real time. One active flash sale per vendor at a time.

**Doc shape:**
```
vendors/{vendorId}/flashSale/current
  active:        boolean
  discountType:  'percent' | 'fixed'
  discountValue: number
  message:       string   (the SMS text, shown as a banner in-app)
  expiresAt:     timestamp
  startedAt:     timestamp
  startedBy:     string (staffId)
```

**Kitchen changes (kitchen.html + kitchen.js):**
- Flash sale panel gets two new fields: discount type selector (% off / £ off) + value input, and a duration selector (30 min / 1 hr / 2 hrs / custom).
- On Send: writes `flashSale/current` with `active: true` + `expiresAt` + discount fields, AND writes to `flashSales/` for the SMS broadcast (existing behaviour).
- Kitchen header gets a live "⚡ FLASH SALE ACTIVE" indicator when `flashSale/current` is active — similar to the broadcast button going green. Includes a "End Flash Sale" button that sets `active: false`.
- Walk-in orders: when a flash sale is active, the new order modal shows the discount and applies it to the order total automatically.

**Customer app changes (app.js + index.html):**
- New `listenFlashSale()` function — real-time listener on `vendors/{vendorId}/flashSale/current`. Same pattern as `listenVanLocation()`.
- When active and `expiresAt` is in the future: flash sale discount is returned by `getActiveDiscount()` alongside loyalty (flash sale takes priority over loyalty, same stacking rule — no double discounts).
- Basket shows the flash sale discount line automatically — no code required, no customer action.
- Optional: small flash sale banner on the home or menu page when active ("⚡ Flash sale on now!").
- Expiry handled client-side: check `expiresAt` vs `Date.now()`. No Cloud Function needed for cleanup.

**Firestore rules:**
- `vendors/{vendorId}/flashSale/{docId}`: public read (customer app needs it unauthenticated); write = anonymous auth (kitchen only).

### ✅ Built — Session 40 (2026-05-19)

All files pass `node --check`. Changes on `develop` branch only — not yet merged to main.

**firestore.rules:** Added `vendors/{vendorId}/flashSale/{docId}` — `allow read: if true` (customer reads unauthenticated), `allow write: if isAnonymousAuth()` (kitchen only).

**kitchen.html:**
- Header: added `⚡ End Flash Sale` button (`#k-flashsale-active-btn`, hidden until live) + `⚡ FLASH SALE ACTIVE` text indicator (`#k-flashsale-live-indicator`).
- Settings panel: discount type selector (`%` / `£`, `#k-flashsale-discount-type`), value input (`#k-flashsale-discount-value`), duration selector (`30 min / 1 hr / 2 hrs`, `#k-flashsale-duration`) — all before the SMS textarea.

**kitchen.js:**
- `kitchenFlashSaleData` state var — mirrors `flashSale/current`.
- `listenFlashSaleState()` — real-time listener; called from `startDashboard()` alongside `listenBroadcastState()`. Drives the header live indicator.
- `renderFlashSaleLiveIndicator()` — shows/hides header indicator and End button.
- `sendFlashSale()` — now validates discount fields + duration; writes a Firestore **batch**: `flashSale/current` (active=true, discount, expiresAt) + `flashSales/{id}` (SMS CF trigger).
- `endFlashSale()` — sets `flashSale/current.active = false`. Customer app listener picks it up instantly.
- `updateWalkinTotal()` — shows flash sale discount preview in the walk-in modal.
- `submitWalkinOrder()` — applies active flash sale discount to walk-in order total; stores `discount` field on the order doc.

**app.js:**
- `flashSaleData` + `flashSaleUnsubscribe` state vars.
- `listenFlashSale()` — real-time listener; called from `DOMContentLoaded` after `listenVanLocation()`.
- `getFlashSaleDiscount()` — calculates discount from `flashSaleData`; checks expiry client-side.
- `getActiveDiscount()` — priority order: flash sale > loyalty > offer (no stacking).
- `buildBasketDiscountHTML()` — if flash sale active: returns flash sale banner with auto-applied discount (suppresses loyalty/offer picker entirely).
- `renderFlashSaleBanner()` — shows/hides `#m-flash-sale-banner` and `#d-flash-sale-banner`.

**index.html:**
- CSS: `.m-flash-sale-banner`, `.d-flash-sale-banner`, `.bsk-flash-sale-banner` + child classes.
- `#m-flash-sale-banner` added top of `#page-menu` (mobile).
- `#d-flash-sale-banner` added above `#d-menu-grid` (desktop).

### End-to-end test checklist (do on demo.stalliq.co.uk after deploying rules + functions)
1. Start broadcast in kitchen — Broadcast button goes green.
2. Open settings panel → Flash Sale section (owner only).
3. Enter 20% / 1 hr / message → tap Send Flash Sale.
4. Confirm: `vendors/streetstack/flashSale/current` exists in Firestore with `active:true`, `discountType:'percent'`, `discountValue:20`, `expiresAt` ~1hr from now.
5. Customer app: add items to basket → basket shows ⚡ Flash sale active banner + correct discount row.
6. Place order → order in Firestore has `discount: {type:'flash_sale', amount: X}` and `orderTotal` is subtotal minus discount.
7. Kitchen walk-in modal: new order → total shows `⚡ -£X.XX` preview → Place Order → Firestore order has correct discounted total.
8. Kitchen End Flash Sale → `flashSale/current.active = false` → basket discount disappears immediately for customer.
9. Wait for `expiresAt` to pass (or set it to 1 min for testing) → discount disappears automatically client-side.

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

**B5 — Flash sale: additional discount types (BOGO + item-specific offers)**
Current flash sale supports % off and £ off the whole basket. Future vendors may want more granular mechanics:
- Buy one get one free (cheapest item free — variant of the existing loyalty reward logic)
- Item-specific discounts (e.g. "£2 off any margherita")
- Category discounts (requires menu categories — not yet in the data model)
BOGO is the most requested; could reuse `getLoyaltyDiscount()` cheapest-item logic but time-limited. Needs menu categories before item-specific offers make sense. **Pre-requisite: B4 (generic code audit + CONFIG-driven menu categories).** Log for Growth tier roadmap — current % / £ off covers 90% of real van use cases.

~~**B1 — stalliq.co.uk: Show kitchen dashboard more prominently**~~ ✓ Done Session 32 — full two-panel demo section with animated kitchen card and both CTAs. See Session 32 below.

~~**B2 — La Muletti: Live Broadcast re-enables itself (intermittent bug)**~~ ✓ Fixed Session 32 — `broadcastStopRequested` flag prevents stale GPS resolves from overwriting the stop. Applied to both branches.


---

## Domain & Hosting Architecture

| URL | Netlify Site | Branch | Firebase | Purpose |
|-----|-------------|--------|----------|---------|
| `stalliq.co.uk` | stalliq (stalliq.netlify.app) | — | — | Stalliq product marketing/coming soon |
| `demo.stalliq.co.uk` | stalliq-demo | `develop` | `stalliq` (sandbox) | Generic demo — configured ✓ 2026-05-09 |
| `lamuletti-stalliq.netlify.app` | lamuletti | `main` | `stalliq-production` | La Muletti live system |

