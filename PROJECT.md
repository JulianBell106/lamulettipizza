# Stalliq — Project Bible
> Last updated: 2026-05-09 — Session 30

## What is Stalliq?
Julian (Endoo Limited) is building Stalliq — a white-label PWA food ordering platform for independent mobile street food vendors. La Muletti Pizza (Daniele + Danielle, Bletchley MK) is the launch customer, on a free Year 1 Founding Customer deal.

---

## Demo with Daniele — ~2026-05-15

### Remaining pre-demo checklist
1. **Add composite index on `stalliq` dev Firebase project** — Firebase Console → stalliq project → Firestore → Indexes → Add: `orders` collection, `customerId` ASC + `createdAt` ASC. (Production index exists; dev index still missing.)
2. ~~Add image links to Street Stack menu sheet~~ ✓ Done 2026-05-09
3. **Wipe test data on stalliq-production** — Firebase Console: delete all docs in `orders` and `users` collections. Keep `vendors/{vendorId}/staff/` (staff PINs), `kitchenStatus`, `location`, `counters`.
4. **James's stamp count** — manually set `users/{jamesUid}/stampCount` to 0 in stalliq-production Firebase Console (awarded incorrectly on a free pizza order).
5. **ICO registration** — ico.org.uk, ~£40/year (Endoo Limited — required before collecting personal data in production).
6. **Google Sheet header rows** — protect header rows on all three La Muletti sheets.
7. **stalliq.co.uk demo tile** — update `stalliq-site/index.html` href from `stalliq-demo.netlify.app` to `https://demo.stalliq.co.uk`, drag `stalliq-site/` folder onto Netlify drop to redeploy.

---

## Domain & Hosting Architecture

| URL | Netlify Site | Branch | Firebase | Purpose |
|-----|-------------|--------|----------|---------|
| `stalliq.co.uk` | stalliq (stalliq.netlify.app) | — | — | Stalliq product marketing/coming soon |
| `demo.stalliq.co.uk` | stalliq-demo | `develop` | `stalliq` (sandbox) | Generic demo — configured ✓ 2026-05-09 |
| `lamuletti-stalliq.netlify.app` | lamuletti | `main` | `stalliq-production` | La Muletti live system |

**DNS:** stalliq.co.uk uses Netlify DNS. Nameservers: `dns1-4.p05.nsone.net` (set in HostPapa 2026-05-04).
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

## Branch divergence (intentional as of Session 30)

| | `develop` (Street Stack) | `main` (La Muletti) |
|--|--|--|
| `:root` CSS vars | Street Stack teal | La Muletti fire/gold/cream |
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
| `js/app.js` | All customer-side logic (~3410+ lines) |
| `kitchen.html` | Kitchen dashboard — PIN protected |
| `js/kitchen.js` | All kitchen logic (~1959 lines) |

**⚠️ Desktop CSS lives in `index.html` `<style>` block — NOT in css/styles.css**

**Firestore:** always use compat SDK pattern (`db.collection().doc().onSnapshot()`) — never modular destructuring.

**Kitchen Firebase isolation:** `kitchen.js` uses a named app instance (`firebase.initializeApp(config, 'kitchen')`) → `kitchenAuth` + `kitchenDb`. App Check activated on both.

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
- **Auth:** Anonymous + Phone enabled. Authorised domain: `lamuletti-stalliq.netlify.app`
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
