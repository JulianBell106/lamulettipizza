/**
 * La Muletti Pizza — App JS
 * ============================================================================
 * All customer-specific data comes from CONFIG (js/config.js).
 * Firebase initialised in js/firebase.js — exposes: db, auth
 *
 * Structure:
 *   1.  Theme injection
 *   2.  Page bootstrap (title, meta, images)
 *   3.  Shared state
 *   4.  Utility functions
 *   5.  Desktop — Nav + Hero
 *   6.  Desktop — Strip bar
 *   7.  Desktop — Menu
 *   8.  Desktop — Story / About
 *   9.  Desktop — Values
 *   10. Desktop — Contact + Events
 *   11. Desktop — Basket
 *   12. Desktop — Order confirmation
 *   13. Desktop — Nav scroll effect
 *   14. Mobile — Page navigation
 *   15. Mobile — Home page
 *   16. Mobile — Menu
 *   17. Mobile — Basket
 *   18. Mobile — Order confirmation
 *   19. Mobile — About
 *   20. Mobile — Find Us
 *   21. Scroll reveal
 *   22. Google Sheets — Menu, Events & Offers
 *       22a. Menu fetch
 *       22b. Events fetch
 *       22c. Offers fetch
 *   23. Init
 *   24. Auth — State helpers
 *   25. Auth — Gateway (intercepts Place Order)
 *   26. Auth — Send SMS code
 *   27. Auth — Verify code
 *   28. Auth — Save name (first order only)
 *   29. Firebase — Get next order ref (daily counter)
 *   30. Firebase — Submit order to Firestore
 *   31. Firebase — Kitchen status listener
 *   32. Firebase — Order status listener (confirmation modal)
 *   32a. Audio — Ready beep (Session 13)
 *   33. Account page — Members area
 *   34. Order detail overlay
 * ============================================================================
 */


/* ============================================================================
   1. THEME INJECTION
   ============================================================================ */
function applyTheme() {
  const t = CONFIG.theme;
  const r = document.documentElement;
  r.style.setProperty('--fire',  t.primary);
  r.style.setProperty('--ember', t.primaryHover);
  r.style.setProperty('--gold',  t.accent);
  r.style.setProperty('--dark',  t.dark);
  r.style.setProperty('--char',  t.darkMid);
  r.style.setProperty('--cream', t.light);
  r.style.setProperty('--ash',   t.muted);
}


/* ============================================================================
   2. PAGE BOOTSTRAP
   ============================================================================ */
function bootstrapPage() {
  document.title = CONFIG.meta.title;

  let metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.content = CONFIG.meta.description;

  let appTitle = document.querySelector('meta[name="apple-mobile-web-app-title"]');
  if (appTitle) appTitle.content = CONFIG.meta.appTitle;

  let themeColor = document.querySelector('meta[name="theme-color"]');
  if (themeColor) themeColor.content = CONFIG.theme.dark;

  let icon = document.querySelector('link[rel="apple-touch-icon"]');
  if (icon) icon.href = CONFIG.images.icon;

  let heroBg = document.querySelector('.d-hero-bg');
  if (heroBg) heroBg.style.backgroundImage = `url('${CONFIG.images.hero}')`;
}


/* ============================================================================
   3. SHARED STATE
   ============================================================================ */
const basket      = {};
const basketNotes = {}; // itemId → note text (Session 13 — per-item notes)

let orderCount       = 0;
let customerName     = null;   // cached after phone auth
let pendingOrderFn   = null;   // called after auth completes
let kitchenStatus    = 'open'; // updated live by Firestore listener (Section 31)
const orderCache     = {};     // orderId → order data, populated by loadUserOrders
let historyRemainder  = [];     // orders beyond initial 3, revealed by "Show more"
let historyAllOrders  = [];     // full list — used by showLessHistory()

/**
 * menuData — the active menu used by all render and basket functions.
 * Seeded from CONFIG.menu in Section 23, replaced by sheet data if available.
 * Always use menuData, never CONFIG.menu directly.
 */
let menuData = null;

/**
 * eventsData — upcoming events/locations used by Find Us renders.
 * Seeded from CONFIG.events in Section 23, replaced by sheet data if available.
 * Always use eventsData, never CONFIG.events directly.
 */
let eventsData = null;

/**
 * offersData — functional offer rows from the offers sheet.
 * Replaced by sheet data on load. Always use offersData, never CONFIG directly.
 */
let offersData = [];

/**
 * loyaltyConfig — loyalty programme settings parsed from the offers sheet.
 * null = no loyalty programme configured.
 * { title, description, stampsRequired, rewardType }
 */
let loyaltyConfig = null;

/**
 * selectedOffer — offer the customer has chosen to apply at checkout.
 * null = no offer selected. Cleared after order placed.
 */
let selectedOffer = null;

/**
 * userStampCount — customer's current stamp count, loaded from Firestore.
 * Updated live: incremented on collected, reset on loyalty redemption.
 */
let userStampCount = 0;

/**
 * userOfferUsage — map of offerId → number of times used by this customer.
 * Loaded from users/{uid}/offerUsage sub-collection on account page load.
 * Updated locally after offer used (Firestore write happens in submitOrder).
 */
let userOfferUsage = {};

let vanLocationUnsubscribe = null; // real-time listener handle (Session 14)
let vanLocationData        = null; // last received location doc (Session 14)
let locationAgeInterval    = null; // setInterval id for "Updated X mins ago" (Session 14)
let userProfileUnsubscribe    = null; // real-time user document listener (Session 21)
let userOfferUsageUnsubscribe = null; // real-time offer usage listener (Session 21)
let userOrdersQueryUnsubscribe = null; // live orders query listener (Session 21)


/* ============================================================================
   4. UTILITY FUNCTIONS
   ============================================================================ */

/**
 * HTML-encodes a string before insertion into innerHTML.
 * Applied to all sheet-sourced fields to prevent XSS if the vendor's
 * Google account is ever compromised.
 * @param {*} str — value to encode (coerced to string)
 * @returns {string} — HTML-safe string
 */
function esc(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function basketTotalQty() {
  return Object.values(basket).reduce((sum, qty) => sum + qty, 0);
}

function basketTotalPrice() {
  return Object.keys(basket).reduce((sum, id) => {
    const item = menuData.find(m => m.id === Number(id));
    return sum + (item ? item.price * basket[id] : 0);
  }, 0);
}

/**
 * Patches just the qty controls for one desktop menu card in-place.
 * Avoids rebuilding the whole grid + re-running initScrollReveal(),
 * which caused all cards to flash on every qty tap.
 */
function patchDesktopMenuItemControls(id) {
  const card = document.getElementById(`d-card-${id}`);
  if (!card) return;
  const el  = card.querySelector('.d-pizza-controls');
  if (!el)   return;
  const qty = basket[id] || 0;
  el.innerHTML = qty > 0
    ? `<button class="d-qty-btn"     data-id="${id}" data-delta="-1">−</button>
       <span   class="d-qty-num">${qty}</span>
       <button class="d-qty-btn add" data-id="${id}" data-delta="1">+</button>`
    : `<button class="d-qty-btn add" data-id="${id}" data-delta="1">+</button>`;
}

function updateBasket(id, delta) {
  id = Number(id);
  basket[id] = Math.max(0, (basket[id] || 0) + delta);
  if (basket[id] === 0) {
    delete basket[id];
    delete basketNotes[id]; // clear note when item removed via qty controls
  }
  patchDesktopMenuItemControls(id); // surgical patch — no flash, no scroll reveal reset
  renderMobileMenu();
  refreshDesktopBasket();
  refreshMobileBadge();
}

function generateOrderRef() {
  orderCount++;
  return CONFIG.ordering.refPrefix + String(orderCount).padStart(4, '0');
}

function buildOrderSummaryHTML(rowClass) {
  let subtotal = 0;
  let rows     = '';
  const c      = CONFIG.business.currency;

  Object.keys(basket).map(Number).forEach(id => {
    const item = menuData.find(m => m.id === id);
    const qty  = basket[id];
    const sub  = item.price * qty;
    subtotal += sub;
    rows += `<div class="${rowClass}">
               <span>${esc(item.name)} × ${qty}</span>
               <strong>${c}${sub.toFixed(2)}</strong>
             </div>`;
  });

  const disc  = getActiveDiscount();
  const total = Math.max(0, subtotal - (disc ? disc.amount : 0));

  rows += `<div class="${rowClass}" style="border-top:1px solid rgba(212,160,67,0.15);margin-top:8px;padding-top:8px;">
             <span>Subtotal</span>
             <strong>${c}${subtotal.toFixed(2)}</strong>
           </div>`;

  if (disc) {
    rows += `<div class="${rowClass}" style="color:#8de88d;">
               <span>🎉 ${esc(disc.description)}</span>
               <strong>−${c}${disc.amount.toFixed(2)}</strong>
             </div>`;
  }

  rows += `<div class="${rowClass}" style="border-top:1px solid rgba(212,160,67,0.15);margin-top:4px;padding-top:8px;">
             <span>Total</span>
             <strong style="color:var(--gold)">${c}${total.toFixed(2)}</strong>
           </div>`;
  rows += `<div class="${rowClass}">
             <span>Payment</span>
             <strong>${CONFIG.ordering.paymentNote}</strong>
           </div>`;
  return { rows, total };
}

function clearBasket() {
  Object.keys(basket).forEach(k => delete basket[k]);
  Object.keys(basketNotes).forEach(k => delete basketNotes[k]); // Session 13
  renderDesktopMenu();
  renderMobileMenu();
  refreshDesktopBasket();
  refreshMobileBadge();
}

/* ── Per-item notes helpers (Session 13) ───────────────────────────────────── */

/**
 * Saves note text for a basket item. Trims + caps at 200 chars.
 * Called from oninput on both mobile and desktop note textareas.
 * Updates toggle button labels on both surfaces after save.
 */
function saveNote(id, value) {
  id = Number(id);
  const trimmed = value.trim().substring(0, 200);
  if (trimmed) {
    basketNotes[id] = trimmed;
  } else {
    delete basketNotes[id];
  }
  // Keep toggle labels in sync across both surfaces
  _syncNoteToggle(document.getElementById(`m-notes-toggle-${id}`), id);
  _syncNoteToggle(document.getElementById(`d-notes-toggle-${id}`), id);
}

function _syncNoteToggle(toggleEl, id) {
  if (!toggleEl) return;
  const hasNote = !!basketNotes[Number(id)];
  toggleEl.textContent = hasNote ? 'Customisation added' : 'Add customisation';
  toggleEl.classList.toggle('has-note', hasNote);
}

/** Toggles the mobile note textarea for a basket item. */
function mToggleNote(id) {
  id = Number(id);
  const input  = document.getElementById(`m-notes-${id}`);
  const toggle = document.getElementById(`m-notes-toggle-${id}`);
  if (!input) return;
  const isHidden = input.style.display === 'none';
  input.style.display = isHidden ? 'block' : 'none';
  if (isHidden) input.focus();
  _syncNoteToggle(toggle, id);
}

/** Toggles the desktop note textarea for a basket item. */
function dToggleNote(id) {
  id = Number(id);
  const input  = document.getElementById(`d-notes-${id}`);
  const toggle = document.getElementById(`d-notes-toggle-${id}`);
  if (!input) return;
  const isHidden = input.style.display === 'none';
  input.style.display = isHidden ? 'block' : 'none';
  if (isHidden) input.focus();
  _syncNoteToggle(toggle, id);
}


/* ============================================================================
   5. DESKTOP — NAV + HERO
   ============================================================================ */
function renderDesktopNav() {
  const logo = document.querySelector('.d-nav-logo');
  if (logo) {
    const parts = CONFIG.business.nameShort.split(' ');
    const last  = parts.pop();
    logo.innerHTML = `${parts.join(' ')} <span>${last}</span>`;
  }
  // Nav CTA — "Order Now", no emoji
  const navCta = document.querySelector('.d-nav-cta');
  if (navCta) navCta.textContent = 'Order Now';
}

function renderDesktopHero() {
  const h = CONFIG.hero;
  const set = (sel, html) => { const el = document.querySelector(sel); if (el) el.innerHTML = html; };
  set('.d-hero-eyebrow',  h.eyebrow);
  set('.d-hero-title',    `${h.titleLine1}<br><em>${h.titleLine2}</em>`);
  set('.d-hero-sub',      h.subtitle.replace(/&/g, '&amp;'));
  // Strip emoji from desktop hero buttons — text only on desktop
  const stripEmoji = s => s.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '').trim();
  const primary   = document.querySelector('.d-btn-primary');
  const secondary = document.querySelector('.d-btn-ghost');
  if (primary)   primary.textContent   = stripEmoji(h.ctaPrimary);
  if (secondary) secondary.textContent = stripEmoji(h.ctaSecondary);
}


/* ============================================================================
   6. DESKTOP — CREDENTIAL LINE (replaces strip bar)
   Reads CONFIG.stripItems but renders as refined text inside the hero,
   not a full-width coloured band.
   ============================================================================ */
function renderDesktopStrip() {
  const el = document.getElementById('d-hero-credentials');
  if (!el || !CONFIG.stripItems || CONFIG.stripItems.length === 0) return;
  el.innerHTML = CONFIG.stripItems
    .map((item, i) => {
      const sep = i < CONFIG.stripItems.length - 1
        ? `<span class="d-cred-sep">·</span>`
        : '';
      return `<span class="d-cred-item">${item.text}</span>${sep}`;
    })
    .join('');
}


/* ============================================================================
   7. DESKTOP — MENU (card grid with optional food photography)
   ============================================================================
   Renders as a 3-column card grid. Each card has:
     - Food image at top (if item.image URL provided via sheet) or a no-image
       placeholder showing the item number in large italic Playfair type
     - Gold left border accent on the card
     - Name (Playfair), description (Cormorant italic), price (gold), qty controls
   Graceful degradation: no image URL → placeholder renders, card still complete.
   esc() applied to all sheet-sourced fields: name, desc, diet.
   Image URLs come from sheet and are used in src — not passed through esc()
   as they are URLs not HTML content. URLs are validated to start with http.
   ============================================================================ */
function renderDesktopMenu() {
  const grid = document.getElementById('d-menu-grid');
  if (!grid) return;

  const items = menuData.filter(m => m.available !== false);

  grid.innerHTML = items.map((item, i) => {
    const qty = basket[item.id] || 0;
    const num = String(i + 1).padStart(2, '0');

    const controls = qty > 0
      ? `<button class="d-qty-btn"     data-id="${item.id}" data-delta="-1">−</button>
         <span   class="d-qty-num">${qty}</span>
         <button class="d-qty-btn add" data-id="${item.id}" data-delta="1">+</button>`
      : `<button class="d-qty-btn add" data-id="${item.id}" data-delta="1">+</button>`;

    const dietTag = item.diet
      ? `<div class="d-pizza-diet">${esc(item.diet)}</div>`
      : '';

    // Image: only use URL if it looks like a real URL — basic safety check
    const imgUrl = item.image && item.image.startsWith('http') ? item.image : null;
    const imageBlock = imgUrl
      ? `<div class="d-pizza-img-wrap">
           <img class="d-pizza-img" src="${imgUrl}" alt="${esc(item.name)}" loading="lazy">
         </div>`
      : `<div class="d-pizza-no-img">
           <div class="d-pizza-no-img-num">${num}</div>
         </div>`;

    return `
      <div class="d-pizza-card reveal" id="d-card-${item.id}" style="--reveal-delay:${i * 60}ms">
        ${imageBlock}
        <div class="d-pizza-body">
          <div class="d-pizza-name">${esc(item.name)}</div>
          ${item.desc ? `<div class="d-pizza-desc">${esc(item.desc)}</div>` : '<div class="d-pizza-desc"></div>'}
          <div class="d-pizza-footer">
            <div class="d-pizza-price">${CONFIG.business.currency}${item.price.toFixed(2)}</div>
            <div style="display:flex;align-items:center;gap:8px;">
              ${dietTag}
              <div class="d-pizza-controls">${controls}</div>
            </div>
          </div>
        </div>
      </div>`;
  }).join('');

  // Re-run scroll reveal so newly rendered cards get observed
  initScrollReveal();
}

// Event delegation — catches all qty clicks across desktop menu + basket panel
document.addEventListener('click', function (e) {
  const btn = e.target.closest('[data-id][data-delta]');
  if (btn) {
    e.preventDefault();
    e.stopPropagation();
    updateBasket(Number(btn.dataset.id), Number(btn.dataset.delta));
  }
});


/* ============================================================================
   8. DESKTOP — STORY / ABOUT
   ============================================================================ */
function renderDesktopStory() {
  const a = CONFIG.about;

  const img = document.querySelector('.d-story-img img');
  if (img) { img.src = CONFIG.images.founders; img.alt = a.imageCaption; }
  const caption = document.querySelector('.d-story-img-caption');
  if (caption) caption.textContent = a.imageCaption;

  const eyebrow = document.querySelector('#d-story .d-eyebrow');
  if (eyebrow) eyebrow.textContent = a.eyebrow;
  const title = document.querySelector('#d-story .d-title');
  if (title) title.innerHTML = `${a.titleLine1}<em>${a.titleLine2}</em>`;

  const bodyEl = document.querySelector('.d-story-text');
  if (bodyEl) {
    bodyEl.querySelectorAll('p.d-body').forEach(p => p.remove());
    const foundersEl = bodyEl.querySelector('.d-founders-mini');
    a.storyParagraphs.forEach(text => {
      const p = document.createElement('p');
      p.className = 'd-body';
      p.textContent = text;
      bodyEl.insertBefore(p, foundersEl);
    });
  }

  const pills = document.querySelector('.d-founders-mini');
  if (pills) {
    pills.innerHTML = a.founders.map(f => {
      // Initials from name — styled circle, no emoji avatar
      const initials = f.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
      return `
        <div class="d-founder-pill">
          <div class="d-founder-pill-avatar">${initials}</div>
          <div>
            <div class="d-founder-pill-name">${f.name}</div>
            <div class="d-founder-pill-role">${f.role}</div>
          </div>
        </div>`;
    }).join('');
  }
}


/* ============================================================================
   9. DESKTOP — VALUES
   No-op — replaced by static "How It Works" section hardcoded in index.html.
   CONFIG.values retained for mobile about page via renderMobileAbout().
   ============================================================================ */
function renderDesktopValues() {
  // Intentionally empty — desktop values section replaced with
  // "How It Works" in HTML (#d-howitworks). Mobile still uses CONFIG.values.
}


/* ============================================================================
   10. DESKTOP — CONTACT + EVENTS
   Contact cards use inline SVG icons — no emoji.
   renderEventsList() reads from eventsData (Section 22b).
   ============================================================================ */

const SVG_ICONS = {
  phone: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.28h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7a2 2 0 0 1 1.72 2z"/></svg>`,
  email: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>`,
  web:   `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>`,
  social:`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>`
,instagram:`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>`
,messenger:`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/><path d="m6 14 3.5-4 2.5 2.5L15.5 8l2.5 4"/></svg>`
};

function renderDesktopContact() {
  const c = CONFIG.contact;
  // id-based selector matches new index.html — falls back to class selector
  const grid = document.getElementById('d-contact-grid') || document.querySelector('.d-contact-grid');
  if (grid) {
    grid.innerHTML = `
      <a href="tel:${c.phone.replace(/\s/g,'')}" class="d-contact-card">
        <div class="d-contact-icon">${SVG_ICONS.phone}</div>
        <div><div class="d-contact-label">Phone</div><div class="d-contact-value">${c.phone}</div></div>
      </a>
      <a href="mailto:${c.email}" class="d-contact-card">
        <div class="d-contact-icon">${SVG_ICONS.email}</div>
        <div><div class="d-contact-label">Email</div><div class="d-contact-value">${c.email}</div></div>
      </a>
      <a href="${c.websiteUrl}" target="_blank" rel="noopener" class="d-contact-card">
        <div class="d-contact-icon">${SVG_ICONS.web}</div>
        <div><div class="d-contact-label">Website</div><div class="d-contact-value">${c.website}</div></div>
      </a>
      <a href="${c.facebookUrl}" target="_blank" rel="noopener" class="d-contact-card">
        <div class="d-contact-icon">${SVG_ICONS.social}</div>
        <div><div class="d-contact-label">Facebook</div><div class="d-contact-value">${c.facebook}</div></div>
      </a>
      ${c.instagramUrl ? `<a href="${c.instagramUrl}" target="_blank" rel="noopener" class="d-contact-card"><div class="d-contact-icon">${SVG_ICONS.instagram}</div><div><div class="d-contact-label">Instagram</div><div class="d-contact-value">${c.instagram}</div></div></a>` : ''}
      ${c.messengerUrl ? `<a href="${c.messengerUrl}" target="_blank" rel="noopener" class="d-contact-card"><div class="d-contact-icon">${SVG_ICONS.messenger}</div><div><div class="d-contact-label">Messenger</div><div class="d-contact-value">Message us on Facebook</div></div></a>` : ''}` ;
  }

  // id-based selector for new HTML; class-based for old
  renderEventsList('#d-popup-list, .d-popup-list', 'd-popup-card', 'd-popup-date', 'd-popup-day', 'd-popup-month', 'd-popup-event', 'd-popup-loc');
}

/**
 * Renders the events/locations list from eventsData.
 * esc() applied to event name and location (sheet-sourced).
 */
function renderEventsList(containerSel, cardCls, dateCls, dayCls, monthCls, nameCls, locCls) {
  const el = document.querySelector(containerSel);
  if (!el) return;
  if (!eventsData || eventsData.length === 0) {
    el.innerHTML = `<p style="color:rgba(253,246,236,0.4);font-size:15px;font-style:italic;font-family:'Cormorant Garamond',serif;">No upcoming events — follow us on socials for updates.</p>`;
    return;
  }
  el.innerHTML = eventsData.map(ev => `
    <div class="${cardCls}">
      <div class="${dateCls}">
        <div class="${dayCls}">${esc(String(ev.day))}</div>
        <div class="${monthCls}">${esc(String(ev.month))}</div>
      </div>
      <div>
        <div class="${nameCls}">${esc(ev.name)}</div>
        <div class="${locCls}">${esc(ev.location)}</div>
      </div>
    </div>`).join('');
}


/* ============================================================================
   11. DESKTOP — BASKET
   esc() applied to item.name (sheet-sourced).
   Session 13: adds per-item notes toggle + textarea.
   ============================================================================ */
function refreshDesktopBasket() {
  const count = basketTotalQty();
  const total = basketTotalPrice();
  const ids   = Object.keys(basket).map(Number);

  const btn = document.getElementById('d-basket-btn');
  if (btn) btn.className = count > 0 ? 'd-basket-btn show' : 'd-basket-btn';

  const countEl = document.getElementById('d-basket-count');
  if (countEl) countEl.textContent = count;

  const body   = document.getElementById('d-basket-body');
  const footer = document.getElementById('d-basket-footer');
  if (!body || !footer) return;

  if (ids.length === 0) {
    body.innerHTML = `<div class="d-basket-panel-empty"><div>🍕</div>Your basket is empty.<br>Add some ${CONFIG.business.type} from the menu above.</div>`;
    footer.style.display = 'none';
    return;
  }

  body.innerHTML = ids.map(id => {
    const item        = menuData.find(m => m.id === id);
    const qty         = basket[id];
    const existNote   = basketNotes[id] || '';
    const noteLabel   = existNote ? 'Customisation added' : 'Add customisation';
    const noteCls     = existNote ? ' has-note' : '';
    return `
      <div class="d-bitem">
        <div class="d-bitem-name">${esc(item.name)}</div>
        <div class="d-bitem-controls">
          <button class="d-qty-btn"     data-id="${id}" data-delta="-1">−</button>
          <span   class="d-qty-num">${qty}</span>
          <button class="d-qty-btn add" data-id="${id}" data-delta="1">+</button>
        </div>
        <div class="d-bitem-price">${CONFIG.business.currency}${(item.price * qty).toFixed(2)}</div>
      </div>
      <div class="d-bitem-notes-row">
        <button class="d-bitem-notes-toggle${noteCls}" id="d-notes-toggle-${id}"
                onclick="dToggleNote(${id})">${noteLabel}</button>
        <textarea class="d-bitem-notes-input" id="d-notes-${id}"
                  maxlength="200" rows="1"
                  placeholder="e.g. no olives, well done"
                  oninput="saveNote(${id},this.value);this.style.height='auto';this.style.height=this.scrollHeight+'px'"
                  style="display:${existNote ? 'block' : 'none'}">${esc(existNote)}</textarea>
      </div>`;
  }).join('');

  footer.style.display = 'block';

  // ── Discount section ─────────────────────────────────────────────────────
  const discSection = document.getElementById('d-basket-discount-section');
  if (discSection) discSection.innerHTML = buildBasketDiscountHTML('d');

  const totalEl = document.getElementById('d-basket-total');
  if (totalEl) totalEl.textContent = CONFIG.business.currency + basketFinalTotal().toFixed(2);
}

function dToggleBasket() {
  const panel = document.getElementById('d-basket-panel');
  if (panel) panel.classList.toggle('open');
}

function dToggleAccount() {
  const panel = document.getElementById('d-account-panel');
  if (!panel) return;
  panel.classList.toggle('open');
  // No loadAccountPage call needed — name/stamps/offers are kept live by
  // listenUserProfile and listenUserOfferUsage; orders by loadUserOrders
  // called from onAuthStateChanged (Session 21).
}


/* ============================================================================
   12. DESKTOP — ORDER CONFIRMATION
   Routes through authGateway → Firestore submission → live status listener.
   Session 13: unlockAudio() called on user tap before authGateway.
   ============================================================================ */
function dPlaceOrder() {
  if (kitchenStatus !== 'open') return;
  unlockAudio(); // Session 13 — unlock audio context on user interaction

  authGateway(async () => {
    const btn = document.querySelector('#d-basket-footer .d-btn-primary');
    if (btn) { btn.textContent = 'Placing order...'; btn.disabled = true; }
    try {
      const { orderRef, orderId, discount } = await submitOrderToFirestore();
      console.log(`[Stalliq] Order placed. orderId: ${orderId} | orderRef: ${orderRef}`);

      // ── Post-order: record loyalty reset or offer usage ──────────────────
      if (discount?.type === 'loyalty') {
        await resetUserStamps();
      } else if (discount?.type === 'offer') {
        await recordOfferUsage(discount.offerId);
      }
      const { rows } = buildOrderSummaryHTML('d-order-row');

      selectedOffer = null;
      document.getElementById('d-order-ref').textContent   = 'Order ref ' + orderRef;
      document.getElementById('d-order-details').innerHTML = rows;

      const timeEl  = document.getElementById('d-order-time');
      const labelEl = document.getElementById('d-order-timelabel');
      const iconEl  = document.querySelector('#d-order-overlay .d-order-icon');
      const titleEl = document.querySelector('#d-order-overlay .d-order-title');
      const doneBtn = document.querySelector('#d-order-overlay .d-btn-primary');
      if (timeEl)  timeEl.textContent  = '⏳';
      if (labelEl) labelEl.textContent = 'Waiting for kitchen to accept…';
      if (iconEl)  iconEl.textContent  = '🙌';
      if (titleEl) titleEl.textContent = 'Order Placed!';
      if (doneBtn) doneBtn.textContent = 'Done — See you soon!';

      document.getElementById('d-order-overlay').classList.add('show');
      document.getElementById('d-basket-panel').classList.remove('open');
      clearBasket();
      startOrderStatusListener(orderId);
    } catch (err) {
      console.error('Order error:', err);
      const errEl = document.getElementById('d-order-err');
      if (errEl) errEl.textContent = 'Could not place order. Please try again.';
    } finally {
      if (btn) { btn.textContent = 'Place Order'; btn.disabled = false; }
    }
  });
}

function dDismissOrder() {
  stopOrderStatusListener();
  document.getElementById('d-order-overlay').classList.remove('show');
}


/* ============================================================================
   13. DESKTOP — NAV SCROLL EFFECT
   ============================================================================ */
window.addEventListener('scroll', () => {
  const nav = document.getElementById('d-nav');
  if (nav) nav.classList.toggle('scrolled', window.scrollY > 60);
});


/* ============================================================================
   14. MOBILE — PAGE NAVIGATION
   ============================================================================ */
function mShowPage(page) {
  if (page === 'basket')  renderMobileBasket();
  if (page === 'account') loadAccountPage('m');

  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.m-nav-item').forEach(n => n.classList.remove('active'));
  const pageEl = document.getElementById('page-' + page);
  const navEl  = document.getElementById('m-nav-'  + page);
  if (pageEl) { pageEl.classList.add('active'); pageEl.scrollTop = 0; }
  if (navEl)  navEl.classList.add('active');
}


/* ============================================================================
   15. MOBILE — HOME PAGE
   ============================================================================ */
function renderMobileHome() {
  document.querySelectorAll('.m-hero img').forEach(img => {
    if (img.closest('#page-home')) img.src = CONFIG.images.hero;
  });

  const heroTitle = document.querySelector('#page-home .m-hero-title');
  if (heroTitle) heroTitle.textContent = CONFIG.business.name;

  const pillsEl = document.querySelector('#page-home .m-pills');
  if (pillsEl) {
    pillsEl.innerHTML = CONFIG.homePills.map(p => `
      <div class="m-pill">
        <div class="m-pill-icon">${p.icon}</div>
        <div class="m-pill-text"><strong>${p.title}</strong><span>${p.desc}</span></div>
      </div>`).join('');
  }
}


/* ============================================================================
   16. MOBILE — MENU
   esc() applied to all sheet-sourced fields: name, desc, diet.
   ============================================================================ */
function renderMobileMenu() {
  const list = document.getElementById('m-menu-list');
  if (!list) return;

  const items = menuData.filter(m => m.available !== false);

  list.innerHTML = items.map(item => {
    const qty = basket[item.id] || 0;
    const controls = qty > 0
      ? `<button class="qty-btn"     onclick="mQty(${item.id},-1)">−</button>
         <span   class="qty-display">${qty}</span>
         <button class="qty-btn add" onclick="mQty(${item.id}, 1)">+</button>`
      : `<button class="qty-btn add" onclick="mQty(${item.id}, 1)">+</button>`;
    const dietTag = item.diet ? ` <span class="m-card-diet">${esc(item.diet)}</span>` : '';

    // Image support — only use URL if it looks like a real URL
    const imgUrl = item.image && item.image.startsWith('http') ? item.image : null;

    if (imgUrl) {
      // Image card — stacked layout with photo at top
      return `
        <div class="m-menu-card has-image">
          <img class="m-menu-card-img" src="${imgUrl}" alt="${esc(item.name)}" loading="lazy">
          <div class="m-card-info">
            <div class="m-card-name">${esc(item.name)}${dietTag}</div>
            <div class="m-card-desc">${esc(item.desc)}</div>
            <div class="m-card-price">${CONFIG.business.currency}${item.price.toFixed(2)}</div>
          </div>
          <div class="m-card-controls">${controls}</div>
        </div>`;
    }

    // No image — original side-by-side layout
    return `
      <div class="m-menu-card">
        <div class="m-card-info">
          <div class="m-card-name">${esc(item.name)}${dietTag}</div>
          <div class="m-card-desc">${esc(item.desc)}</div>
          <div class="m-card-price">${CONFIG.business.currency}${item.price.toFixed(2)}</div>
        </div>
        <div class="m-card-controls">${controls}</div>
      </div>`;
  }).join('');
}

function mQty(id, delta) { updateBasket(id, delta); }


/* ============================================================================
   17. MOBILE — BASKET
   esc() applied to item.name (sheet-sourced).
   Session 13: adds per-item notes toggle + textarea per basket line.
   ============================================================================ */
function refreshMobileBadge() {
  const count = basketTotalQty();
  const badge = document.getElementById('m-basket-badge');
  if (!badge) return;
  badge.textContent = count;
  badge.className   = count > 0 ? 'm-basket-badge show' : 'm-basket-badge';
}

function renderMobileBasket() {
  const ids   = Object.keys(basket).map(Number);
  const empty = ids.length === 0;
  const emptyEl   = document.getElementById('m-basket-empty');
  const contentEl = document.getElementById('m-basket-content');
  if (!emptyEl || !contentEl) return;
  emptyEl.style.display   = empty ? 'block' : 'none';
  contentEl.style.display = empty ? 'none'  : 'block';
  if (empty) return;

  let total = 0;
  const listEl = document.getElementById('m-basket-list');
  listEl.innerHTML = ids.map(id => {
    const item      = menuData.find(m => m.id === id);
    const qty       = basket[id];
    const sub       = item.price * qty;
    total += sub;
    const existNote = basketNotes[id] || '';
    const noteLabel = existNote ? 'Customisation added' : 'Add customisation';
    const noteCls   = existNote ? ' has-note' : '';
    return `
      <div class="m-basket-item">
        <div class="m-bi-name">${esc(item.name)}</div>
        <div class="m-bi-qty">× ${qty}</div>
        <div class="m-bi-price">${CONFIG.business.currency}${sub.toFixed(2)}</div>
        <button class="m-bi-remove" onclick="mRemoveItem(${id})">×</button>
      </div>
      <div class="m-bi-notes-row">
        <button class="m-bi-notes-toggle${noteCls}" id="m-notes-toggle-${id}"
                onclick="mToggleNote(${id})">${noteLabel}</button>
        <textarea class="m-bi-notes-input" id="m-notes-${id}"
                  maxlength="200" rows="1"
                  placeholder="e.g. no olives, well done"
                  oninput="saveNote(${id},this.value);this.style.height='auto';this.style.height=this.scrollHeight+'px'"
                  style="display:${existNote ? 'block' : 'none'}">${esc(existNote)}</textarea>
      </div>`;
  }).join('');

  // ── Discount section ─────────────────────────────────────────────────────
  const discSection = document.getElementById('m-basket-discount-section');
  if (discSection) discSection.innerHTML = buildBasketDiscountHTML('m');

  const finalTotal = basketFinalTotal();
  const totalEl = document.getElementById('m-basket-total');
  if (totalEl) totalEl.textContent = CONFIG.business.currency + finalTotal.toFixed(2);
}

function mRemoveItem(id) {
  id = Number(id);
  delete basket[id];
  delete basketNotes[id]; // Session 13 — clear note on remove
  refreshMobileBadge();
  refreshDesktopBasket();
  renderMobileBasket();
}


/* ============================================================================
   18. MOBILE — ORDER CONFIRMATION
   Routes through authGateway → Firestore submission → live status listener.
   Session 13: unlockAudio() called on user tap before authGateway.
   ============================================================================ */
function mPlaceOrder() {
  if (kitchenStatus !== 'open') return;
  unlockAudio(); // Session 13 — unlock audio context on user interaction

  authGateway(async () => {
    const btn = document.querySelector('#page-basket .m-btn');
    if (btn) { btn.textContent = 'Placing order...'; btn.disabled = true; }
    const errEl = document.getElementById('m-order-err');
    if (errEl) errEl.textContent = '';
    try {
      const { orderRef, orderId, discount } = await submitOrderToFirestore();
      console.log(`[Stalliq] Order placed. orderId: ${orderId} | orderRef: ${orderRef}`);

      // ── Post-order: record loyalty reset or offer usage ──────────────────
      if (discount?.type === 'loyalty') {
        await resetUserStamps();
      } else if (discount?.type === 'offer') {
        await recordOfferUsage(discount.offerId);
      }
      const { rows } = buildOrderSummaryHTML('m-confirm-row');

      selectedOffer = null;
      document.getElementById('m-confirm-ref').textContent   = 'Order ref ' + orderRef;
      document.getElementById('m-confirm-details').innerHTML = rows;
      document.getElementById('m-confirm-msg').textContent   = CONFIG.ordering.confirmMsg;

      const timeEl  = document.getElementById('m-confirm-time');
      const labelEl = document.getElementById('m-confirm-timelabel');
      const iconEl  = document.querySelector('#m-order-confirm .m-confirm-icon');
      const titleEl = document.querySelector('#m-order-confirm .m-confirm-title');
      const doneBtn = document.querySelector('#m-order-confirm .m-btn');
      if (timeEl)  timeEl.textContent  = '⏳';
      if (labelEl) labelEl.textContent = 'Waiting for kitchen to accept…';
      if (iconEl)  iconEl.textContent  = '🙌';
      if (titleEl) titleEl.textContent = 'Order Placed!';
      if (doneBtn) doneBtn.textContent = 'Done — See you soon!';

      document.getElementById('m-order-confirm').classList.add('show');
      clearBasket();
      startOrderStatusListener(orderId);
    } catch (err) {
      console.error('Order error:', err);
      if (errEl) errEl.textContent = 'Could not place order. Please try again.';
    } finally {
      if (btn) { btn.textContent = 'Place Order'; btn.disabled = false; }
    }
  });
}

function mDismissOrder() {
  stopOrderStatusListener();
  document.getElementById('m-order-confirm').classList.remove('show');
  mShowPage('account'); // go to account so customer can see their live order
}


/* ============================================================================
   19. MOBILE — ABOUT
   ============================================================================ */
function renderMobileAbout() {
  const a = CONFIG.about;

  const cartoon = document.querySelector('.m-cartoon img');
  if (cartoon) { cartoon.src = CONFIG.images.founders; cartoon.alt = a.imageCaption; }

  const storyBody = document.querySelector('.m-story-body');
  if (storyBody) {
    storyBody.innerHTML = a.storyParagraphs.map(p => `<p>${p}</p>`).join('');
  }

  const cards = document.querySelector('.m-founder-cards');
  if (cards) {
    cards.innerHTML = a.founders.map(f => `
      <div class="m-founder-card">
        <div class="m-founder-avatar">${f.avatar}</div>
        <div>
          <div class="m-founder-name">${f.name}</div>
          <div class="m-founder-role">${f.role}</div>
          <div class="m-founder-bio">${f.bio}</div>
        </div>
      </div>`).join('');
  }

  const valGrid = document.querySelector('#page-about .m-values-grid');
  if (valGrid) {
    valGrid.innerHTML = CONFIG.values.items.map(item => `
      <div class="m-value-card">
        <div class="m-value-icon">${item.icon}</div>
        <div class="m-value-name">${item.name}</div>
        <div class="m-value-desc">${item.desc}</div>
      </div>`).join('');
  }
}


/* ============================================================================
   20. MOBILE — FIND US
   renderEventsList() reads from eventsData (Section 22b), not CONFIG.events.
   ============================================================================ */
function renderMobileFindUs() {
  const c = CONFIG.contact;
  const contactList = document.querySelector('.m-contact-list');
  if (contactList) {
    contactList.innerHTML = `
      <a href="tel:${c.phone.replace(/\s/g,'')}" class="m-contact-card"><div class="m-ci">📞</div><div><div class="m-cl">Phone</div><div class="m-cv">${c.phone}</div></div><div class="m-ca">›</div></a>
      <a href="mailto:${c.email}" class="m-contact-card"><div class="m-ci">✉️</div><div><div class="m-cl">Email</div><div class="m-cv">${c.email}</div></div><div class="m-ca">›</div></a>
      <a href="${c.websiteUrl}" target="_blank" rel="noopener" class="m-contact-card"><div class="m-ci">🌐</div><div><div class="m-cl">Website</div><div class="m-cv">${c.website}</div></div><div class="m-ca">›</div></a>
      <a href="${c.facebookUrl}" target="_blank" rel="noopener" class="m-contact-card"><div class="m-ci">📘</div><div><div class="m-cl">Facebook</div><div class="m-cv">${c.facebook}</div></div><div class="m-ca">›</div></a>
      ${c.instagramUrl ? `<a href="${c.instagramUrl}" target="_blank" rel="noopener" class="m-contact-card"><div class="m-ci">📷</div><div><div class="m-cl">Instagram</div><div class="m-cv">${c.instagram}</div></div><div class="m-ca">›</div></a>` : ''}
      ${c.messengerUrl ? `<a href="${c.messengerUrl}" target="_blank" rel="noopener" class="m-contact-card"><div class="m-ci">💬</div><div><div class="m-cl">Messenger</div><div class="m-cv">Message us on Facebook</div></div><div class="m-ca">›</div></a>` : ''}` ;
  }

  renderEventsList('.m-popup-list', 'm-popup-card', 'm-popup-date', 'm-popup-day', 'm-popup-month', 'm-popup-ename', 'm-popup-loc');
}


/* ============================================================================
   21. SCROLL REVEAL
   ============================================================================ */
function initScrollReveal() {
  const els = document.querySelectorAll('.reveal:not(.visible)');
  if (!els.length) return;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  els.forEach(el => observer.observe(el));
}


/* ============================================================================
   22. GOOGLE SHEETS — MENU, EVENTS & OFFERS
   ============================================================================
   All three content areas support live Google Sheets editing:
     - Menu      → CONFIG.menuSheetUrl   → menuData
     - Events    → CONFIG.eventsSheetUrl → eventsData
     - Offers    → CONFIG.offersSheetUrl → offersData

   Common pattern for all three:
     1. Seed module-level var with config fallback (guaranteed data)
     2. Attempt fetch from published CSV URL
     3. Replace module-level var on success
     4. Fail silently on any error — config fallback always wins

   XSS defence: all sheet-sourced strings pass through esc() before
   innerHTML insertion. Firestore writes always use raw values.

   Shared CSV utility: parseCSVLine() handles quoted fields with commas.
   ============================================================================ */

/**
 * Parses a single CSV line, handling quoted fields correctly.
 * Supports commas inside quoted fields (e.g. "Tomato, basil, mozzarella").
 * @param {string} line — a single CSV line
 * @returns {string[]} — array of field values (unquoted, untrimmed)
 */
function parseCSVLine(line) {
  const result = [];
  let current  = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

/** Normalises line endings and splits into lines. */
function splitCSVLines(csvText) {
  return csvText.trim().replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
}


/* ----------------------------------------------------------------------------
   22a. MENU FETCH
   ---------------------------------------------------------------------------- */
function parseMenuCSV(csvText) {
  const lines = splitCSVLines(csvText);

  if (lines.length < 2) {
    console.warn('[Stalliq] Menu sheet: CSV has no data rows.');
    return [];
  }

  const headers = parseCSVLine(lines[0]).map(h => h.trim().toLowerCase());
  const col = {
    id:    headers.indexOf('id'),
    name:  headers.indexOf('name'),
    price: headers.indexOf('price'),
    desc:  headers.findIndex(h => h === 'description' || h === 'desc'),
    diet:  headers.indexOf('diet'),
    avail: headers.findIndex(h => h === 'available' || h === 'avail'),
    image: headers.findIndex(h => h === 'image' || h === 'img' || h === 'photo')
  };

  if (col.id === -1 || col.name === -1 || col.price === -1) {
    console.warn('[Stalliq] Menu sheet: Missing required columns (id, name, price). Check sheet headers.');
    return [];
  }

  const items = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const cols  = parseCSVLine(line);
    const id    = parseInt(cols[col.id], 10);
    const name  = col.name  >= 0 ? cols[col.name].trim()  : '';
    const price = col.price >= 0 ? parseFloat(cols[col.price]) : NaN;

    if (!id || !name || isNaN(price) || price < 0) continue;

    const desc  = col.desc  >= 0 && cols[col.desc]  ? cols[col.desc].trim()  : '';
    const diet  = col.diet  >= 0 && cols[col.diet]  ? cols[col.diet].trim()  : null;
    const image = col.image >= 0 && cols[col.image] ? cols[col.image].trim() : null;

    let available = true;
    if (col.avail >= 0 && cols[col.avail]) {
      const v = cols[col.avail].trim().toUpperCase();
      available = (v !== 'FALSE' && v !== 'N' && v !== 'NO' && v !== '0');
    }

    items.push({ id, name, price, desc, diet: diet || null, image: image || null, available });
  }

  return items;
}

async function fetchMenuFromSheet() {
  const url = CONFIG.menuSheetUrl;

  if (!url) {
    console.log('[Stalliq] No menuSheetUrl in config — using config.js menu.');
    return false;
  }

  try {
    const response = await fetch(url);

    if (!response.ok) {
      console.warn(`[Stalliq] Menu sheet fetch failed (HTTP ${response.status}) — using config.js fallback.`);
      return false;
    }

    const csvText = await response.text();
    const parsed  = parseMenuCSV(csvText);

    if (parsed.length === 0) {
      console.warn('[Stalliq] Menu sheet parsed 0 items — using config.js fallback.');
      return false;
    }

    menuData = parsed;
    console.log(`[Stalliq] Menu loaded from sheet: ${parsed.length} item(s).`);
    initScrollReveal();
    return true;

  } catch (err) {
    console.warn('[Stalliq] Menu sheet fetch error — using config.js fallback.', err.message);
    return false;
  }
}


/* ----------------------------------------------------------------------------
   22b. EVENTS FETCH
   ---------------------------------------------------------------------------- */
function parseEventsCSV(csvText) {
  const lines = splitCSVLines(csvText);
  if (lines.length < 1) return null;

  const headers = parseCSVLine(lines[0]).map(h => h.trim().toLowerCase());
  const col = {
    day:      headers.indexOf('day'),
    month:    headers.indexOf('month'),
    name:     headers.findIndex(h => h === 'name' || h === 'event'),
    location: headers.findIndex(h => h === 'location' || h === 'loc'),
    active:   headers.findIndex(h => h === 'active' || h === 'avail')
  };

  if (col.day === -1 || col.month === -1 || col.name === -1) {
    console.warn('[Stalliq] Events sheet: Missing required columns (day, month, name). Check sheet headers.');
    return null;
  }

  const items = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const cols     = parseCSVLine(line);
    const day      = cols[col.day]      ? cols[col.day].trim()      : '';
    const month    = cols[col.month]    ? cols[col.month].trim()    : '';
    const name     = cols[col.name]     ? cols[col.name].trim()     : '';
    const location = col.location >= 0 && cols[col.location]
      ? cols[col.location].trim() : '';

    if (!day || !month || !name) continue;

    let active = true;
    if (col.active >= 0 && cols[col.active]) {
      const v = cols[col.active].trim().toUpperCase();
      active = (v !== 'FALSE' && v !== 'N' && v !== 'NO' && v !== '0');
    }
    if (!active) continue;

    items.push({ day, month, name, location });
  }

  return items;
}

async function fetchEventsFromSheet() {
  const url = CONFIG.eventsSheetUrl;

  if (!url) {
    console.log('[Stalliq] No eventsSheetUrl in config — using config.js events.');
    return false;
  }

  try {
    const response = await fetch(url);

    if (!response.ok) {
      console.warn(`[Stalliq] Events sheet fetch failed (HTTP ${response.status}) — using config.js fallback.`);
      return false;
    }

    const csvText = await response.text();
    const parsed  = parseEventsCSV(csvText);

    if (parsed === null) {
      console.warn('[Stalliq] Events sheet: parse error — using config.js fallback.');
      return false;
    }

    eventsData = parsed;
    console.log(`[Stalliq] Events loaded from sheet: ${parsed.length} item(s).`);
    return true;

  } catch (err) {
    console.warn('[Stalliq] Events sheet fetch error — using config.js fallback.', err.message);
    return false;
  }
}


/* ----------------------------------------------------------------------------
   22c. OFFERS FETCH
   ---------------------------------------------------------------------------- */
/**
 * Parses the offers/loyalty CSV into loyaltyConfig and offersData.
 *
 * Expected columns (order-independent, matched by header name):
 *   type | id | title | description | discount_type | discount_value |
 *   stamps_required | reward_type | max_uses | start_date | end_date | active
 *
 * Row types:
 *   loyalty — sets loyaltyConfig (one row only; last one wins)
 *   offer   — appended to offersData array
 *
 * Returns { loyalty, offers } or null on fatal parse error.
 */
function parseOffersCSV(csvText) {
  const lines = splitCSVLines(csvText);
  if (lines.length < 2) return null;

  const headers = parseCSVLine(lines[0]).map(h => h.trim().toLowerCase().replace(/\s+/g, '_'));
  const ci = name => headers.indexOf(name);

  const col = {
    type:          ci('type'),
    id:            ci('id'),
    title:         ci('title'),
    desc:          ci('description'),
    discountType:  ci('discount_type'),
    discountValue: ci('discount_value'),
    stampsReq:     ci('stamps_required'),
    rewardType:    ci('reward_type'),
    maxUses:       ci('max_uses'),
    startDate:     ci('start_date'),
    endDate:       ci('end_date'),
    active:        ci('active'),
  };

  if (col.type === -1 || col.title === -1) {
    console.warn('[Stalliq] Offers sheet: Missing required columns (type, title). Check headers.');
    return null;
  }

  const str = (cols, idx) => (idx >= 0 && cols[idx]) ? cols[idx].trim() : '';
  const num = (cols, idx) => { const v = str(cols, idx); return v ? parseFloat(v) : 0; };
  const isActive = (cols) => {
    const v = str(cols, col.active).toUpperCase();
    return !v || (v !== 'FALSE' && v !== 'N' && v !== 'NO' && v !== '0');
  };

  let loyalty = null;
  const offers = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const cols  = parseCSVLine(line);
    const type  = str(cols, col.type).toLowerCase();
    const title = str(cols, col.title);
    if (!title) continue;
    if (!isActive(cols)) continue;

    if (type === 'loyalty') {
      loyalty = {
        title,
        description:    str(cols, col.desc),
        stampsRequired: num(cols, col.stampsReq) || 10,
        rewardType:     str(cols, col.rewardType) || 'free_item',
      };
    } else if (type === 'offer') {
      const id = str(cols, col.id) || `offer_${i}`;
      offers.push({
        id,
        title,
        description:   str(cols, col.desc),
        discountType:  str(cols, col.discountType),  // 'fixed' | 'percent'
        discountValue: num(cols, col.discountValue),
        maxUses:       num(cols, col.maxUses),        // 0 = unlimited
        startDate:     str(cols, col.startDate),      // 'YYYY-MM-DD' or ''
        endDate:       str(cols, col.endDate),        // 'YYYY-MM-DD' or ''
      });
    }
  }

  return { loyalty, offers };
}

async function fetchOffersFromSheet() {
  const url = CONFIG.offersSheetUrl;

  if (!url) {
    console.log('[Stalliq] No offersSheetUrl in config — offers/loyalty disabled.');
    return false;
  }

  try {
    const response = await fetch(url);

    if (!response.ok) {
      console.warn(`[Stalliq] Offers sheet fetch failed (HTTP ${response.status}).`);
      return false;
    }

    const csvText = await response.text();
    const parsed  = parseOffersCSV(csvText);

    if (parsed === null) {
      console.warn('[Stalliq] Offers sheet: parse error.');
      return false;
    }

    loyaltyConfig = parsed.loyalty;
    offersData    = parsed.offers;
    console.log(`[Stalliq] Offers loaded: ${offersData.length} offer(s), loyalty: ${loyaltyConfig ? 'yes' : 'no'}.`);
    return true;

  } catch (err) {
    console.warn('[Stalliq] Offers sheet fetch error.', err.message);
    return false;
  }
}


/* ============================================================================
   20a. LIVE VAN LOCATION (Session 14)
   ============================================================================ */

/**
 * listenVanLocation — real-time Firestore listener on vendors/{vendorId}/location/current.
 * Calls renderMobileVanLocation() and renderDesktopVanLocation() on every change.
 */
function listenVanLocation() {
  const locationRef = db.collection('vendors').doc(CONFIG.vendor.id)
                        .collection('location').doc('current');

  vanLocationUnsubscribe = locationRef.onSnapshot((snap) => {
    vanLocationData = snap.exists ? snap.data() : null;
    renderMobileVanLocation();
    renderDesktopVanLocation();
  }, (err) => {
    console.warn('[Stalliq] listenVanLocation error:', err.message);
  });
}

/**
 * buildMapHTML — returns the inner HTML for the van location widget.
 * @param {number} lat
 * @param {number} lng
 * @param {object} updatedAt — Firestore Timestamp
 * @returns {string} HTML string
 */
function buildMapHTML(lat, lng, updatedAt) {
  const mapSrc = `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`;
  const ageLabel = updatedAt
    ? (() => {
        const mins = Math.round((Date.now() - updatedAt.toMillis()) / 60000);
        return mins < 1 ? 'Just updated' : `Updated ${mins} min${mins !== 1 ? 's' : ''} ago`;
      })()
    : '';
  return `
    <div class="van-map-wrap">
      <span class="van-live-badge">
        <svg width="8" height="8" viewBox="0 0 8 8"><circle cx="4" cy="4" r="4" fill="#27AE60"/></svg>
        Live location
      </span>
      <p class="van-location-tagline">We are operating in this location right now — come and find us!</p>
      <iframe
        class="van-map-iframe"
        src="${mapSrc}"
        allowfullscreen
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade"
      ></iframe>
      <div class="van-map-age" id="van-map-age-label">${ageLabel}</div>
    </div>`;
}

/**
 * renderMobileVanLocation — shows or hides #m-van-location based on vanLocationData.
 */
function renderMobileVanLocation() {
  const el = document.getElementById('m-van-location');
  if (!el) return;

  if (vanLocationData && vanLocationData.active) {
    el.innerHTML = buildMapHTML(vanLocationData.lat, vanLocationData.lng, vanLocationData.updatedAt);
    el.style.display = 'block';
    _startAgeTimer();
  } else {
    el.style.display = 'none';
    el.innerHTML = '';
    _stopAgeTimer();
  }
}

/**
 * renderDesktopVanLocation — shows or hides #d-van-location based on vanLocationData.
 */
function renderDesktopVanLocation() {
  const el = document.getElementById('d-van-location');
  if (!el) return;

  if (vanLocationData && vanLocationData.active) {
    el.innerHTML = buildMapHTML(vanLocationData.lat, vanLocationData.lng, vanLocationData.updatedAt);
    el.style.display = 'block';
  } else {
    el.style.display = 'none';
    el.innerHTML = '';
  }
}

/**
 * _startAgeTimer — updates the "Updated X mins ago" label every 60 seconds.
 * Stops itself if the label element is no longer in the DOM.
 */
function _startAgeTimer() {
  _stopAgeTimer();
  locationAgeInterval = setInterval(() => {
    const label = document.getElementById('van-map-age-label');
    if (!label) { _stopAgeTimer(); return; }
    if (!vanLocationData || !vanLocationData.updatedAt) return;
    const mins = Math.round((Date.now() - vanLocationData.updatedAt.toMillis()) / 60000);
    label.textContent = mins < 1 ? 'Just updated' : `Updated ${mins} min${mins !== 1 ? 's' : ''} ago`;
  }, 60000);
}

/**
 * _stopAgeTimer — clears the age update interval.
 */
function _stopAgeTimer() {
  if (locationAgeInterval) {
    clearInterval(locationAgeInterval);
    locationAgeInterval = null;
  }
}

/**
 * renderFindUsKitchenStatus — writes a live status pill to the Find Us page
 * on both mobile (#m-findus-status) and desktop (#d-findus-status).
 * Called from applyKitchenStatus so it stays in sync with the kitchen toggle.
 * @param {string} status — 'open' | 'closed_busy' | 'closed_end' | 'closed_today'
 */
function renderFindUsKitchenStatus(status) {
  const isOpen = status === 'open';
  const LABELS = {
    open:         "Open now — we're ready to serve you",
    closed_busy:  "Really busy right now — back shortly",
    closed_end:   "Closing up for tonight — see you next time",
    closed_today: "Not trading today — see you soon"
  };
  const text      = LABELS[status] || (isOpen ? 'Open now' : 'Currently closed');
  const dotClass  = isOpen ? 'open' : 'closed';
  const html      = `<span class="fs-dot ${dotClass}"></span><span class="fs-text">${text}</span>`;

  const mEl = document.getElementById('m-findus-status');
  const dEl = document.getElementById('d-findus-status');
  if (mEl) { mEl.innerHTML = html; mEl.style.display = 'flex'; }
  if (dEl) { dEl.innerHTML = html; dEl.style.display = 'flex'; }
}


/* ============================================================================
   22d. LOYALTY & OFFERS — DISCOUNT HELPERS
   ============================================================================ */

/**
 * Returns the loyalty discount for the current basket, or null if not earned.
 * Reward: one free dish — the cheapest item currently in the basket.
 */
function getLoyaltyDiscount() {
  if (!loyaltyConfig || !auth.currentUser) return null;
  if (userStampCount < loyaltyConfig.stampsRequired) return null;
  if (basketTotalQty() === 0) return null;

  let cheapest = null;
  Object.keys(basket).forEach(id => {
    const item = menuData.find(m => m.id === Number(id));
    if (item && (!cheapest || item.price < cheapest.price)) cheapest = item;
  });
  if (!cheapest) return null;

  return {
    type:        'loyalty',
    description: `Free ${cheapest.name} (loyalty reward)`,
    amount:      cheapest.price,
    itemId:      cheapest.id,
  };
}

/**
 * Returns the discount for the currently selectedOffer, or null.
 */
function getOfferDiscount() {
  if (!selectedOffer) return null;
  const raw = basketTotalPrice();
  let amount;
  if (selectedOffer.discountType === 'fixed') {
    amount = Math.min(selectedOffer.discountValue, raw);
  } else if (selectedOffer.discountType === 'percent') {
    amount = parseFloat((raw * selectedOffer.discountValue / 100).toFixed(2));
  } else {
    return null;
  }
  return {
    type:        'offer',
    offerId:     selectedOffer.id,
    description: selectedOffer.title,
    amount,
  };
}

/**
 * Returns the active discount object (loyalty takes priority; no stacking).
 */
function getActiveDiscount() {
  const loyalty = getLoyaltyDiscount();
  if (loyalty) return loyalty;
  return getOfferDiscount();
}

/** Final total after any discount. Never negative. */
function basketFinalTotal() {
  const disc = getActiveDiscount();
  return Math.max(0, basketTotalPrice() - (disc ? disc.amount : 0));
}

/**
 * Returns offers that are currently available to this customer:
 *   — date range valid (or unset)
 *   — per-customer use count < maxUses (0 = unlimited)
 */
function getAvailableOffers() {
  if (!offersData || offersData.length === 0) return [];
  const now = new Date();
  return offersData.filter(offer => {
    if (offer.startDate) {
      const start = new Date(offer.startDate);
      if (start > now) return false;
    }
    if (offer.endDate) {
      const end = new Date(offer.endDate);
      end.setHours(23, 59, 59, 999);
      if (end < now) return false;
    }
    if (offer.maxUses > 0) {
      const used = userOfferUsage[offer.id] || 0;
      if (used >= offer.maxUses) return false;
    }
    return true;
  });
}

function applyOffer(offerId) {
  const offer = offersData.find(o => o.id === offerId);
  if (!offer) return;
  selectedOffer = offer;
  renderMobileBasket();
  refreshDesktopBasket();
}

function removeOffer() {
  selectedOffer = null;
  renderMobileBasket();
  refreshDesktopBasket();
}

/**
 * Builds the HTML for the discount section inside the basket.
 * prefix = 'm' (mobile) | 'd' (desktop)
 *
 * Shows:
 *  — Loyalty reward banner (auto) if stamps earned, suppressing offers
 *  — Offers picker (manual) otherwise, if any available offers
 *  — Discount row showing the saving in both cases
 */
function buildBasketDiscountHTML(prefix) {
  if (basketTotalQty() === 0) return '';

  const loyaltyDisc = getLoyaltyDiscount();
  const c = CONFIG.business.currency;
  let html = '';

  if (loyaltyDisc) {
    // Loyalty auto-applies — show locked reward banner
    html += `
      <div class="bsk-loyalty-reward">
        <span class="bsk-reward-icon">🎉</span>
        <span class="bsk-reward-text">${esc(loyaltyDisc.description)}</span>
        <span class="bsk-reward-amount">−${c}${loyaltyDisc.amount.toFixed(2)}</span>
      </div>`;
  } else {
    // Show offers picker if any are available
    const available = getAvailableOffers();
    if (available.length > 0) {
      html += `<div class="bsk-offers-wrap">`;
      html += `<div class="bsk-offers-label">Available offers</div>`;
      available.forEach(offer => {
        const isSelected = selectedOffer && selectedOffer.id === offer.id;
        const valLabel = offer.discountType === 'percent'
          ? `${offer.discountValue}% off`
          : `${c}${offer.discountValue} off`;
        html += `
          <div class="bsk-offer-row${isSelected ? ' selected' : ''}">
            <div class="bsk-offer-info">
              <div class="bsk-offer-name">${esc(offer.title)}</div>
              <div class="bsk-offer-val">${esc(valLabel)}</div>
            </div>
            ${isSelected
              ? `<button class="bsk-offer-btn applied" onclick="removeOffer()">Remove</button>`
              : `<button class="bsk-offer-btn" onclick="applyOffer('${esc(offer.id)}')">Apply</button>`
            }
          </div>`;
      });
      html += `</div>`;

      // Discount row if an offer is selected
      if (selectedOffer) {
        const disc = getOfferDiscount();
        if (disc) {
          html += `
            <div class="bsk-discount-row">
              <span class="bsk-discount-label">🏷 ${esc(disc.description)}</span>
              <span class="bsk-discount-amount">−${c}${disc.amount.toFixed(2)}</span>
            </div>`;
        }
      }
    }
  }

  return html;
}

/* ============================================================================
   22e. LOYALTY & OFFERS — FIRESTORE HELPERS
   ============================================================================ */

/**
 * Opens a real-time Firestore listener on the customer's user document.
 * Fires immediately with current data AND subscribes for cross-device changes
 * (e.g. stamps awarded on mobile while desktop is open).
 * Replaces the one-shot loadUserStampCount call in onAuthStateChanged.
 */
function listenUserProfile(uid) {
  if (userProfileUnsubscribe) { userProfileUnsubscribe(); userProfileUnsubscribe = null; }
  userProfileUnsubscribe = db.collection('users').doc(uid).onSnapshot(doc => {
    if (!doc.exists) return;
    const profileData = doc.data();
    userStampCount = profileData.stampCount ?? 0;
    // Always sync customerName from Firestore so any auth refresh self-heals
    // (Session 21). Don't gate on !customerName — stale null must be overwritten.
    if (profileData.firstName) customerName = profileData.firstName;
    ['m', 'd'].forEach(p => {
      const nameEl = document.getElementById(`${p}-account-name`);
      if (nameEl) nameEl.textContent = customerName ? `Hi, ${customerName}!` : 'Welcome back!';
      renderStampCard(buildAccountIds(p));
    });
    // Refresh basket — loyalty reward eligibility may have changed
    const discM = document.getElementById('m-basket-discount-section');
    if (discM) discM.innerHTML = buildBasketDiscountHTML('m');
    const totalMEl = document.getElementById('m-basket-total');
    if (totalMEl && basketTotalQty() > 0)
      totalMEl.textContent = CONFIG.business.currency + basketFinalTotal().toFixed(2);
    const discD = document.getElementById('d-basket-discount-section');
    if (discD) discD.innerHTML = buildBasketDiscountHTML('d');
    const totalDEl = document.getElementById('d-basket-total');
    if (totalDEl && basketTotalQty() > 0)
      totalDEl.textContent = CONFIG.business.currency + basketFinalTotal().toFixed(2);
  }, err => console.error('[Stalliq] User profile listener error:', err.message));
}

/**
 * Opens a real-time Firestore listener on the customer's offerUsage sub-collection.
 * Fires immediately with current data AND subscribes for cross-device changes
 * (e.g. offer used on mobile while desktop is open).
 * Replaces the one-shot loadUserOfferUsage call in onAuthStateChanged.
 */
function listenUserOfferUsage(uid) {
  if (userOfferUsageUnsubscribe) { userOfferUsageUnsubscribe(); userOfferUsageUnsubscribe = null; }
  userOfferUsageUnsubscribe = db.collection('users').doc(uid).collection('offerUsage').onSnapshot(snapshot => {
    userOfferUsage = {};
    snapshot.forEach(doc => { userOfferUsage[doc.id] = doc.data().count || 0; });
    ['m', 'd'].forEach(p => renderAccountOffers(buildAccountIds(p)));
    const discM = document.getElementById('m-basket-discount-section');
    if (discM) discM.innerHTML = buildBasketDiscountHTML('m');
    const discD = document.getElementById('d-basket-discount-section');
    if (discD) discD.innerHTML = buildBasketDiscountHTML('d');
  }, err => console.error('[Stalliq] Offer usage listener error:', err.message));
}

/**
 * Awards one stamp for an order, guarded by stampsAwarded flag on the order doc.
 * Called by the account order listener when status → collected.
 */
async function awardStamp(orderId) {
  const user = auth.currentUser;
  if (!user || !loyaltyConfig) return;

  // Use a Firestore transaction to atomically check-and-set stampsAwarded.
  // This prevents a race where both mobile and desktop tabs call awardStamp
  // simultaneously (both see stampsAwarded:false before either write lands),
  // which would increment stampCount twice. The transaction serialises the
  // check: the second client to run finds stampsAwarded:true and aborts.
  try {
    const orderRef = db.collection('orders').doc(orderId);
    const userRef  = db.collection('users').doc(user.uid);
    await db.runTransaction(async txn => {
      const orderSnap = await txn.get(orderRef);
      if (!orderSnap.exists || orderSnap.data().stampsAwarded) return; // already awarded
      txn.update(orderRef, { stampsAwarded: true });
      txn.set(userRef, { stampCount: firebase.firestore.FieldValue.increment(1) }, { merge: true });
    });
    // listenUserProfile fires automatically when stampCount changes in Firestore
    // and updates userStampCount + renders the stamp card on both surfaces.
    console.log(`[Stalliq] Stamp awarded for order ${orderId}.`);
  } catch (err) {
    console.error('[Stalliq] Error awarding stamp:', err.message);
  }
}

/** Resets customer's stamp count to 0 in Firestore after loyalty redemption. */
async function resetUserStamps() {
  const user = auth.currentUser;
  if (!user) return;
  try {
    await db.collection('users').doc(user.uid).set({ stampCount: 0 }, { merge: true });
    userStampCount = 0;
    ['m', 'd'].forEach(p => renderStampCard(buildAccountIds(p)));
  } catch (err) {
    console.error('[Stalliq] Error resetting stamps:', err.message);
  }
}

/** Increments per-customer offer usage in Firestore and local cache. */
async function recordOfferUsage(offerId) {
  const user = auth.currentUser;
  if (!user) return;
  try {
    await db.collection('users').doc(user.uid)
      .collection('offerUsage').doc(offerId)
      .set(
        { count: firebase.firestore.FieldValue.increment(1), lastUsedAt: firebase.firestore.FieldValue.serverTimestamp() },
        { merge: true }
      );
    userOfferUsage[offerId] = (userOfferUsage[offerId] || 0) + 1;
  } catch (err) {
    console.error('[Stalliq] Error recording offer usage:', err.message);
  }
}

/* ============================================================================
   23. INIT
   ============================================================================ */
document.addEventListener('DOMContentLoaded', async function () {
  applyTheme();
  bootstrapPage();

  // ── Seed all data vars with guaranteed fallbacks ─────────────────────────
  menuData      = CONFIG.menu;
  eventsData    = CONFIG.events || [];
  offersData    = [];
  loyaltyConfig = null;

  // ── Static renders — no network dependency, fire immediately ────────────
  // renderMobileHome uses only CONFIG.homePills — no sheet data needed.
  renderMobileHome();
  renderMobileAbout();

  // ── Fetch all sheets concurrently ─────────────────────────────────────────
  await Promise.all([
    fetchMenuFromSheet(),
    fetchEventsFromSheet(),
    fetchOffersFromSheet()
  ]);

  // Desktop renders
  renderDesktopNav();
  renderDesktopHero();
  renderDesktopStrip();
  renderDesktopMenu();
  renderDesktopStory();
  renderDesktopContact();

  // ── Mobile renders (sheet-dependent) ─────────────────────────────────────
  renderMobileMenu();
  renderMobileFindUs();

  // ── Footer ────────────────────────────────────────────────────────────────
  const footerLogo = document.querySelector('.d-footer-logo');
  if (footerLogo) {
    const parts = CONFIG.business.nameShort.split(' ');
    const last  = parts.pop();
    footerLogo.innerHTML = `${parts.join(' ')} <span>${last}</span> Pizza`;
  }
  const footerCopy = document.querySelector('.d-footer-copy');
  if (footerCopy) {
    footerCopy.textContent = `© ${CONFIG.business.year} ${CONFIG.business.name} · ${CONFIG.business.location} · ${CONFIG.contact.email}`;
  }

  initScrollReveal();

  // Kitchen status — live Firestore listener (Section 31)
  initKitchenStatusListener();

  // Van location — real-time listener (Section 20a)
  listenVanLocation();

  // ── Auth state — load stamp count + offer usage at auth time (Session 21) ─
  // Fixes: stamp count and offer usage reset on page reload if Account page
  // was not visited first. Both now load as soon as Firebase Auth is ready,
  // regardless of which page the user lands on.
  auth.onAuthStateChanged(async user => {
    // Ignore anonymous users — the kitchen signs in anonymously on the same
    // origin and would otherwise wipe the customer's account state (Session 21).
    if (user && user.uid && !user.isAnonymous) {
      // ── Load customer name for persisted sessions (page reload when already
      //    signed in — auth flow never runs again so customerName stays null).
      if (!customerName) {
        try {
          const userDoc = await db.collection('users').doc(user.uid).get();
          if (userDoc.exists && userDoc.data().firstName) {
            customerName = userDoc.data().firstName;
          }
        } catch (_) {}
      }

      // ── Real-time listeners — fire immediately with current Firestore data
      //    AND stay subscribed for cross-device updates (stamps, offer usage).
      // Claim any walk-in orders placed against this number since last login.
      if (user.phoneNumber) linkWalkinOrders(user.uid, user.phoneNumber);
      listenUserProfile(user.uid);
      listenUserOfferUsage(user.uid);

      // ── Render both account surfaces immediately (Session 21).
      //    loadAccountPage renders name/stamps/offers for each prefix.
      //    loadUserOrders is called once — it populates both m and d containers
      //    with prefix-aware card IDs so there are no duplicate-ID races.
      loadAccountPage('m');
      loadAccountPage('d');
      loadUserOrders(user.uid);
    } else {
      // User signed out — stop all real-time listeners
      if (userProfileUnsubscribe)     { userProfileUnsubscribe();     userProfileUnsubscribe     = null; }
      if (userOfferUsageUnsubscribe)  { userOfferUsageUnsubscribe();  userOfferUsageUnsubscribe  = null; }
      if (userOrdersQueryUnsubscribe) { userOrdersQueryUnsubscribe(); userOrdersQueryUnsubscribe = null; }
    }
  });
});


/* ============================================================================
   24. AUTH — STATE HELPERS
   ============================================================================ */

function authShowScreen(name) {
  document.querySelectorAll('.auth-screen').forEach(s => s.style.display = 'none');
  const screen = document.getElementById('auth-screen-' + name);
  if (screen) screen.style.display = 'block';
}

function authShowOverlay(firstScreen) {
  authShowScreen(firstScreen || 'phone');
  document.getElementById('auth-overlay').classList.add('show');
  setTimeout(() => {
    const input = document.querySelector('#auth-screen-' + firstScreen + ' .auth-input');
    if (input) input.focus();
  }, 150);
}

function authClose() {
  document.getElementById('auth-overlay').classList.remove('show');
  pendingOrderFn = null;
}

function authSetError(screen, msg) {
  const el = document.getElementById('auth-' + screen + '-err');
  if (el) el.textContent = msg;
}

function authClearErrors() {
  ['phone', 'code', 'name'].forEach(s => authSetError(s, ''));
}


/* ============================================================================
   25. AUTH — GATEWAY
   ============================================================================ */
function authGateway(orderFn) {
  pendingOrderFn = orderFn;

  const titleEl = document.getElementById('auth-title');
  const subEl   = document.getElementById('auth-sub-text');
  if (titleEl) titleEl.textContent = 'Confirm your order';
  if (subEl)   subEl.textContent   = "Enter your mobile and we'll text you when your order is ready to collect";

  const user = auth.currentUser;

  if (user) {
    if (customerName) {
      orderFn();
    } else {
      db.collection('users').doc(user.uid).get()
        .then(doc => {
          if (doc.exists && doc.data().firstName) {
            customerName = doc.data().firstName;
            orderFn();
          } else {
            authClearErrors();
            authShowOverlay('name');
          }
        })
        .catch(() => authShowOverlay('name'));
    }
  } else {
    authClearErrors();
    authShowOverlay('phone');
  }
}


/* ============================================================================
   26. AUTH — SEND SMS CODE
   ============================================================================ */
async function authSendCode() {
  authSetError('phone', '');

  const raw   = document.getElementById('auth-phone-input').value.trim().replace(/\s/g, '');
  const phone = '+44' + raw;

  if (!/^7\d{9}$/.test(raw)) {
    authSetError('phone', 'Please enter a valid UK mobile (e.g. 7911 123456)');
    return;
  }

  const btn = document.getElementById('auth-send-btn');
  btn.textContent = 'Sending…';
  btn.disabled    = true;

  try {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier(
        'recaptcha-container',
        { size: 'invisible' }
      );
    }
    window.confirmationResult = await auth.signInWithPhoneNumber(phone, window.recaptchaVerifier);
    document.getElementById('auth-code-msg').textContent =
      `We sent a 6-digit code to +44 ${raw}`;
    authShowScreen('code');
    setTimeout(() => document.getElementById('auth-code-input').focus(), 150);
  } catch (err) {
    console.error('SMS send error:', err);
    authSetError('phone', 'Could not send code. Check the number and try again.');
    if (window.recaptchaVerifier) {
      try { window.recaptchaVerifier.clear(); } catch (_) {}
      window.recaptchaVerifier = null;
    }
  } finally {
    btn.textContent = 'Send verification code';
    btn.disabled    = false;
  }
}


/* ============================================================================
   27. AUTH — VERIFY SMS CODE
   ============================================================================ */
async function authVerifyCode() {
  authSetError('code', '');

  const code = document.getElementById('auth-code-input').value.trim();
  if (code.length !== 6 || !/^\d{6}$/.test(code)) {
    authSetError('code', 'Please enter the 6-digit code');
    return;
  }

  const btn = document.querySelector('#auth-screen-code .auth-primary-btn');
  btn.textContent = 'Verifying…';
  btn.disabled    = true;

  try {
    const result = await window.confirmationResult.confirm(code);
    const user   = result.user;

    const userDoc = await db.collection('users').doc(user.uid).get();
    if (userDoc.exists && userDoc.data().firstName) {
      customerName = userDoc.data().firstName;
      // Keep phone index current and claim any walk-in orders for this number.
      writePhoneIndex(user.uid, user.phoneNumber, customerName);
      linkWalkinOrders(user.uid, user.phoneNumber);
      document.getElementById('auth-overlay').classList.remove('show');
      if (pendingOrderFn) pendingOrderFn();
    } else {
      authShowScreen('name');
      setTimeout(() => document.getElementById('auth-name-input').focus(), 150);
    }
  } catch (err) {
    console.error('Verify error:', err);
    authSetError('code', 'Incorrect code — please try again.');
  } finally {
    btn.textContent = 'Verify →';
    btn.disabled    = false;
  }
}


/* ============================================================================
   28. AUTH — SAVE NAME (first order only)
   ============================================================================ */
async function authSaveName() {
  authSetError('name', '');

  const firstName = document.getElementById('auth-name-input').value.trim();
  if (!firstName || firstName.length < 2) {
    authSetError('name', 'Please enter your first name');
    return;
  }

  const btn = document.querySelector('#auth-screen-name .auth-primary-btn');
  btn.textContent = 'Saving…';
  btn.disabled    = true;

  try {
    const user = auth.currentUser;
    await db.collection('users').doc(user.uid).set({
      firstName,
      phone:     user.phoneNumber,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    customerName = firstName;
    // Register in phone index and claim any walk-in orders for this number.
    writePhoneIndex(user.uid, user.phoneNumber, firstName);
    linkWalkinOrders(user.uid, user.phoneNumber);
    document.getElementById('auth-overlay').classList.remove('show');
    if (pendingOrderFn) pendingOrderFn();
  } catch (err) {
    console.error('Save name error:', err);
    authSetError('name', 'Something went wrong. Please try again.');
  } finally {
    btn.textContent = 'Continue →';
    btn.disabled    = false;
  }
}


/* ============================================================================
   28a. AUTH — PHONE INDEX + WALK-IN ORDER LINKING
   ============================================================================
   These three helpers wire up the phoneIndex collection and enable walk-in
   orders placed by the kitchen to be claimed by an existing or new account.
   ============================================================================ */

/** Normalise a raw UK phone string to E.164 format (+44XXXXXXXXXX).
 *  Returns null if the input cannot be parsed as a UK number. */
function normalizePhone(raw) {
  if (!raw) return null;
  const digits = raw.replace(/[\s\-\(\)]/g, '');
  if (digits.startsWith('+44')) return '+44' + digits.slice(3).replace(/\D/g, '');
  if (digits.startsWith('0'))   return '+44' + digits.slice(1).replace(/\D/g, '');
  return null;
}

/** Write/update the customer's entry in the phoneIndex lookup collection.
 *  Called on every successful sign-in so the index stays current.
 *  The kitchen reads this collection to resolve a walk-in phone → UID. */
async function writePhoneIndex(uid, phone, firstName) {
  if (!phone) return;
  try {
    await db.collection('phoneIndex').doc(phone).set({ uid, firstName }, { merge: true });
  } catch (err) {
    console.warn('[Stalliq] phoneIndex write failed (non-critical):', err);
  }
}

/** After sign-in, claim any walk-in orders placed against this customer's
 *  phone number that were not yet linked to an account (customerId == null).
 *  Uses a batch write so all orders are claimed atomically. */
async function linkWalkinOrders(uid, phone) {
  if (!phone) return;
  try {
    const snapshot = await db.collection('orders')
      .where('customerPhone', '==', phone)
      .where('customerId',    '==', null)
      .where('source',        '==', 'walkin')
      .get();
    if (snapshot.empty) return;
    const batch = db.batch();
    snapshot.forEach(doc => batch.update(doc.ref, { customerId: uid }));
    await batch.commit();
    console.log('[Stalliq] Linked ' + snapshot.size + ' walk-in order(s) to account ' + uid);
  } catch (err) {
    console.warn('[Stalliq] linkWalkinOrders failed (non-critical):', err);
  }
}


/* ============================================================================
   29. FIREBASE — GET NEXT ORDER REF
   ============================================================================ */
async function getNextOrderRef() {
  const today      = new Date().toISOString().split('T')[0];
  const counterRef = db.collection('vendors').doc(CONFIG.vendor.id)
                       .collection('counters').doc('daily');
  let count = 1;

  await db.runTransaction(async (tx) => {
    const doc = await tx.get(counterRef);
    if (!doc.exists || doc.data().date !== today) {
      tx.set(counterRef, { date: today, count: 1 });
      count = 1;
    } else {
      count = doc.data().count + 1;
      tx.update(counterRef, { count });
    }
  });

  return '#' + String(count).padStart(3, '0');
}


/* ============================================================================
   30. FIREBASE — SUBMIT ORDER TO FIRESTORE
   Session 13: item.notes populated from basketNotes[id].
   ============================================================================ */
async function submitOrderToFirestore() {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');

  const orderRef     = await getNextOrderRef();
  const timeoutMins  = CONFIG.ordering.timeoutMins || 10;
  const expiresAt    = new Date(Date.now() + timeoutMins * 60 * 1000);
  const deleteAt     = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // GDPR 90-day retention

  const items = Object.keys(basket).map(Number).map(id => {
    const item = menuData.find(m => m.id === id);
    return {
      id:       item.id,
      name:     item.name,
      price:    item.price,
      quantity: basket[id],
      notes:    basketNotes[id] || null  // Session 13 — per-item notes
    };
  });

  // ── Discount (Session 19) ─────────────────────────────────────────────────
  const activeDiscount = getActiveDiscount();
  const finalTotal     = basketFinalTotal();

  const orderDoc = {
    orderRef,
    vendorId:      CONFIG.vendor.id,
    customerId:    user.uid,
    customerName,
    customerPhone: user.phoneNumber,
    items,
    orderTotal:    finalTotal,
    discount:      activeDiscount || null,
    payment: {
      method: 'cash_on_collection',
      status: 'pending'
    },
    status:    'pending',
    waitMins:  null,
    expiresAt,
    deleteAt,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const docRef = await db.collection('orders').add(orderDoc);
  return { orderRef, orderId: docRef.id, discount: activeDiscount };
}


/* ============================================================================
   31. FIREBASE — KITCHEN STATUS LISTENER
   ============================================================================ */

const KITCHEN_CLOSED_MESSAGES = {
  closed_busy:  "We're really busy right now — back shortly!",
  closed_end:   "We're closing up for tonight — see you next time!",
  closed_today: "We're not trading today — see you soon!"
};

function applyKitchenStatus(status) {
  kitchenStatus    = status;
  const isOpen     = status === 'open';
  const msg        = isOpen ? '' : (KITCHEN_CLOSED_MESSAGES[status] || 'We are currently closed.');

  // ── Mobile: closed banner at top of home page ─────────────────────────────
  let mBanner = document.getElementById('m-kitchen-closed-banner');
  if (!isOpen) {
    if (!mBanner) {
      mBanner = document.createElement('div');
      mBanner.id = 'm-kitchen-closed-banner';
      mBanner.style.cssText = [
        'background:var(--fire)',
        'color:var(--cream)',
        'padding:12px 16px',
        'text-align:center',
        'font-size:14px',
        'font-weight:600',
        'letter-spacing:0.01em',
        'position:sticky',
        'top:0',
        'z-index:100'
      ].join(';');
      const homePage = document.getElementById('page-home');
      if (homePage) homePage.prepend(mBanner);
    }
    mBanner.textContent  = '🔴  ' + msg;
    mBanner.style.display = 'block';
  } else if (mBanner) {
    mBanner.style.display = 'none';
  }

  // ── Mobile: Place Order button state ──────────────────────────────────────
  const mBtn = document.querySelector('#page-basket .m-btn');
  if (mBtn) {
    mBtn.disabled    = !isOpen;
    mBtn.textContent = isOpen ? 'Place Order' : 'Kitchen Closed';
  }

  // ── Desktop: closed banner ────────────────────────────────────────────────
  let dBanner = document.getElementById('d-kitchen-closed-banner');
  if (!isOpen) {
    if (!dBanner) {
      dBanner = document.createElement('div');
      dBanner.id = 'd-kitchen-closed-banner';
      dBanner.style.cssText = [
        'position:sticky',
        'top:0',
        'left:0',
        'right:0',
        'width:100%',
        'background:var(--dark)',
        'color:var(--cream)',
        'border-bottom:3px solid var(--fire)',
        'padding:16px 24px',
        'text-align:center',
        'font-size:17px',
        'font-weight:700',
        'letter-spacing:0.02em',
        'z-index:9999',
        'box-sizing:border-box'
      ].join(';');
      document.body.prepend(dBanner);
    }
    dBanner.textContent   = '🔴  ' + msg;
    dBanner.style.display = 'block';
  } else if (dBanner) {
    dBanner.style.display = 'none';
  }

  // ── Desktop: Place Order button state ─────────────────────────────────────
  const dBtn = document.querySelector('#d-basket-footer .d-btn-primary');
  if (dBtn) {
    dBtn.disabled    = !isOpen;
    dBtn.textContent = isOpen ? 'Place Order' : 'Kitchen Closed';
  }

  // ── Find Us page kitchen status (Session 14) ──────────────────────────────
  renderFindUsKitchenStatus(status);
}

function initKitchenStatusListener() {
  const vendorRef = db.collection('vendors').doc(CONFIG.vendor.id);
  vendorRef.onSnapshot(
    doc => {
      const status = (doc.exists && doc.data().kitchenStatus) || 'open';
      applyKitchenStatus(status);
    },
    err => {
      console.warn('Kitchen status listener error:', err);
    }
  );
}


/* ============================================================================
   32. FIREBASE — ORDER STATUS LISTENER (confirmation modal)
   Session 13: fires ready beep when status transitions to 'ready'.
   ============================================================================ */

let orderStatusUnsubscribe = null;

const ORDER_STATUS_CONFIG = {
  pending: {
    icon:   '⏳',
    label:  'Waiting for the kitchen to accept your order…',
    colour: 'rgba(212,160,67,0.95)'
  },
  accepted: {
    icon:   '✅',
    label:  'Order accepted!',
    colour: '#7ec87e'
  },
  preparing: {
    icon:   '👨‍🍳',
    label:  'Your order is being prepared',
    colour: 'rgba(212,160,67,0.95)'
  },
  ready: {
    icon:   '🟢',
    label:  'Ready to collect — head to the van!',
    colour: '#7ec87e'
  }
};

function injectMobileStatusBlock() {
  if (document.getElementById('m-live-status')) return;
  const el = document.createElement('div');
  el.id = 'm-live-status';
  el.style.cssText = [
    'margin:12px 0 16px',
    'padding:16px',
    'background:rgba(255,255,255,0.06)',
    'border-radius:12px',
    'text-align:center',
    'border:1px solid rgba(212,160,67,0.15)'
  ].join(';');
  const anchor = document.getElementById('m-confirm-details');
  if (anchor) {
    anchor.parentNode.insertBefore(el, anchor);
  } else {
    const overlay = document.getElementById('m-order-confirm');
    if (overlay) overlay.appendChild(el);
  }
}

function injectDesktopStatusBlock() {
  if (document.getElementById('d-live-status')) return;
  const el = document.createElement('div');
  el.id = 'd-live-status';
  el.style.cssText = [
    'margin:10px 0 14px',
    'padding:12px 18px',
    'background:rgba(255,255,255,0.06)',
    'border-radius:10px',
    'text-align:center',
    'border:1px solid rgba(212,160,67,0.15)'
  ].join(';');
  const anchor = document.getElementById('d-order-ref');
  if (anchor) {
    anchor.insertAdjacentElement('afterend', el);
  } else {
    const overlay = document.getElementById('d-order-overlay');
    if (overlay) overlay.appendChild(el);
  }
}

function renderStatusBlock(elId, status, waitMins) {
  const el = document.getElementById(elId);
  if (!el) return;
  const cfg = ORDER_STATUS_CONFIG[status] || ORDER_STATUS_CONFIG.pending;
  const waitLine = (status === 'accepted' && waitMins)
    ? `<div style="margin-top:6px;font-size:13px;color:rgba(255,255,255,0.65);">Estimated wait: ~${waitMins} mins</div>`
    : '';
  el.innerHTML = `
    <div style="font-size:26px;margin-bottom:6px;">${cfg.icon}</div>
    <div style="font-weight:700;font-size:14px;letter-spacing:0.02em;color:${cfg.colour};">${cfg.label}</div>
    ${waitLine}`;
}

function startOrderStatusListener(orderId) {
  if (orderStatusUnsubscribe) {
    orderStatusUnsubscribe();
    orderStatusUnsubscribe = null;
  }

  injectMobileStatusBlock();
  injectDesktopStatusBlock();
  renderStatusBlock('m-live-status', 'pending', null);
  renderStatusBlock('d-live-status', 'pending', null);

  console.log(`[Stalliq] Starting order status listener. orderId: ${orderId}`);

  const docRef = db.collection('orders').doc(orderId);
  orderStatusUnsubscribe = docRef.onSnapshot(
    snapshot => {
      if (!snapshot.exists) return;
      const { status, waitMins } = snapshot.data();
      console.log(`[Stalliq] Status update received: ${status} | waitMins: ${waitMins ?? 'null'}`);

      renderStatusBlock('m-live-status', status, waitMins);
      renderStatusBlock('d-live-status', status, waitMins);

      if (status === 'accepted' && waitMins) {
        const mTime  = document.getElementById('m-confirm-time');
        const mLabel = document.getElementById('m-confirm-timelabel');
        if (mTime)  mTime.textContent  = `~${waitMins} mins`;
        if (mLabel) mLabel.textContent = 'Estimated pickup time from now';

        const dTime  = document.getElementById('d-order-time');
        const dLabel = document.getElementById('d-order-timelabel');
        if (dTime)  dTime.textContent  = `~${waitMins} mins`;
        if (dLabel) dLabel.textContent = 'Estimated pickup time from now';
      }

      if (status === 'ready') {
        // ── Session 13: Ready beep — fires once on transition ─────────────
        // If the page is backgrounded when this fires (e.g. user switched apps),
        // skip the beep and leave firedReadyBeep unset so the visibilitychange
        // handler can fire it when the user returns.
        if (!orderCache[orderId]?.firedReadyBeep) {
          if (document.visibilityState === 'visible') {
            playReadyBeep();
            if (orderCache[orderId]) orderCache[orderId].firedReadyBeep = true;
            else orderCache[orderId] = { firedReadyBeep: true };
          }
          // else: leave flag unset — visibilitychange handler will fire it
        }

        const mIcon  = document.querySelector('#m-order-confirm .m-confirm-icon');
        const mTitle = document.querySelector('#m-order-confirm .m-confirm-title');
        const mTime  = document.getElementById('m-confirm-time');
        const mLabel = document.getElementById('m-confirm-timelabel');
        const mBtn   = document.querySelector('#m-order-confirm .m-btn');
        if (mIcon)  mIcon.textContent  = '🟢';
        if (mTitle) mTitle.textContent = 'Ready to collect!';
        if (mTime)  mTime.textContent  = '';
        if (mLabel) mLabel.textContent = 'Head to the van — your pizza is ready! 🍕';
        if (mBtn)   mBtn.textContent   = '✓ Thanks — on my way!';

        const dIcon  = document.querySelector('#d-order-overlay .d-order-icon');
        const dTitle = document.querySelector('#d-order-overlay .d-order-title');
        const dTime  = document.getElementById('d-order-time');
        const dLabel = document.getElementById('d-order-timelabel');
        const dBtn   = document.querySelector('#d-order-overlay .d-btn-primary');
        if (dIcon)  dIcon.textContent  = '🟢';
        if (dTitle) dTitle.textContent = 'Ready to collect!';
        if (dTime)  dTime.textContent  = '';
        if (dLabel) dLabel.textContent = 'Head to the van — your pizza is ready! 🍕';
        if (dBtn)   dBtn.textContent   = '✓ Thanks — on my way!';

        orderStatusUnsubscribe();
        orderStatusUnsubscribe = null;
        console.log('[Stalliq] Order ready — listener unsubscribed.');
      }
    },
    err => {
      console.error(`[Stalliq] Listener error: ${err.code} |`, err.message);
      if (err.code === 'permission-denied') {
        console.warn('[Stalliq] Fix: add read rule to Firestore orders collection.');
        console.warn('  allow read: if request.auth != null && resource.data.customerId == request.auth.uid;');
      }
    }
  );
}

function stopOrderStatusListener() {
  if (orderStatusUnsubscribe) {
    orderStatusUnsubscribe();
    orderStatusUnsubscribe = null;
  }

  const mEl = document.getElementById('m-live-status');
  if (mEl) mEl.remove();
  const dEl = document.getElementById('d-live-status');
  if (dEl) dEl.remove();

  const mIcon  = document.querySelector('#m-order-confirm .m-confirm-icon');
  const mTitle = document.querySelector('#m-order-confirm .m-confirm-title');
  const mTime  = document.getElementById('m-confirm-time');
  const mLabel = document.getElementById('m-confirm-timelabel');
  const mBtn   = document.querySelector('#m-order-confirm .m-btn');
  if (mIcon)  mIcon.textContent  = '🙌';
  if (mTitle) mTitle.textContent = 'Order Placed!';
  if (mTime)  mTime.textContent  = '⏳';
  if (mLabel) mLabel.textContent = 'Waiting for kitchen to accept…';
  if (mBtn)   mBtn.textContent   = 'Done — See you soon!';

  const dIcon  = document.querySelector('#d-order-overlay .d-order-icon');
  const dTitle = document.querySelector('#d-order-overlay .d-order-title');
  const dTime  = document.getElementById('d-order-time');
  const dLabel = document.getElementById('d-order-timelabel');
  const dBtn   = document.querySelector('#d-order-overlay .d-btn-primary');
  if (dIcon)  dIcon.textContent  = '🙌';
  if (dTitle) dTitle.textContent = 'Order Placed!';
  if (dTime)  dTime.textContent  = '⏳';
  if (dLabel) dLabel.textContent = 'Waiting for kitchen to accept…';
  if (dBtn)   dBtn.textContent   = 'Done — See you soon!';

  console.log('[Stalliq] Order status listener stopped.');
}


/* ============================================================================
   32a. AUDIO — READY BEEP (Session 13)
   ============================================================================
   Audio context is unlocked on the user's Place Order tap (mPlaceOrder /
   dPlaceOrder call unlockAudio() before authGateway). The beep itself fires
   later when the Firestore listener detects status === 'ready'.

   Two beeps at 660 Hz, 300 ms apart — distinct from the kitchen alert (880 Hz).
   Silent fail if Web Audio API unavailable or AudioContext creation is blocked.
   ============================================================================ */

let audioCtx = null;

/**
 * Creates (or resumes) the shared AudioContext on a user gesture.
 * Must be called synchronously within a user interaction handler.
 */
function unlockAudio() {
  try {
    // Discard a closed context — iOS/Android can close it after extended lock
    if (audioCtx && audioCtx.state === 'closed') audioCtx = null;
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } else if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  } catch (_) {
    // AudioContext not available — beep will attempt a new context at fire time
  }
}

/**
 * Plays two short beeps to notify the customer their order is ready.
 * Uses the shared audioCtx if available, otherwise attempts a new context.
 * Silently fails if audio is unavailable.
 */
async function playReadyBeep() {
  try {
    // Discard closed context (iOS/Android close it after extended background)
    if (audioCtx && audioCtx.state === 'closed') audioCtx = null;
    const ctx  = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    if (!audioCtx) audioCtx = ctx;
    // Mobile (especially iOS) suspends AudioContext after inactivity.
    // Resume it now — this works because the context was already unlocked
    // by the user's "Place Order" tap gesture earlier in the session.
    if (ctx.state === 'suspended') await ctx.resume();
    const gain = ctx.createGain();
    gain.connect(ctx.destination);
    [0, 0.3].forEach(offset => {
      const osc = ctx.createOscillator();
      osc.connect(gain);
      osc.frequency.value = 660; // slightly lower than kitchen alert (880 Hz)
      gain.gain.setValueAtTime(0.35, ctx.currentTime + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + offset + 0.28);
      osc.start(ctx.currentTime + offset);
      osc.stop(ctx.currentTime  + offset + 0.28);
    });
    console.log('[Stalliq] Ready beep fired.');
  } catch (_) {
    // Audio unavailable — silent fail, order status still updates visually
  }
}

/**
 * Fires any ready beeps missed while the page was backgrounded, and shows a
 * visual "order ready" prompt as a guaranteed fallback for when audio is blocked.
 */
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState !== 'visible') return;
  let needsBeep = false;
  Object.values(orderCache).forEach(order => {
    if (order.status === 'ready' && !order.firedReadyBeep) {
      order.firedReadyBeep = true;
      needsBeep = true;
    }
  });
  if (needsBeep) {
    playReadyBeep();
    _showCustomerReadyPrompt();
  } else {
    _dismissCustomerReadyPrompt();
  }
});

/**
 * Shows a fixed green banner when the customer's order is ready.
 * Doubles as a guaranteed audio-unlock gesture on mobile browsers that block
 * audio after backgrounding. Dismissed on tap or when order is collected.
 */
function _showCustomerReadyPrompt() {
  if (document.getElementById('cust-ready-banner')) return;
  const btn = document.createElement('button');
  btn.id = 'cust-ready-banner';
  btn.textContent = '🟢 Your order is ready — tap here';
  btn.style.cssText = [
    'position:fixed', 'top:0', 'left:0', 'right:0', 'z-index:9999',
    'width:100%', 'padding:14px 16px',
    'background:#2a7a3b', 'color:#fff',
    'font-size:15px', 'font-weight:700', 'text-align:center',
    'border:none', 'cursor:pointer', 'letter-spacing:0.02em',
    'animation:cust-ready-pulse 1.2s ease-in-out infinite',
  ].join(';');
  if (!document.getElementById('cust-ready-style')) {
    const style = document.createElement('style');
    style.id = 'cust-ready-style';
    style.textContent = '@keyframes cust-ready-pulse{0%,100%{opacity:1}50%{opacity:0.7}}';
    document.head.appendChild(style);
  }
  btn.addEventListener('click', () => {
    _dismissCustomerReadyPrompt();
    unlockAudio();
    playReadyBeep();
  });
  document.body.appendChild(btn);
}

function _dismissCustomerReadyPrompt() {
  const el = document.getElementById('cust-ready-banner');
  if (el) el.remove();
}


/* ============================================================================
   33. ACCOUNT PAGE — MEMBERS AREA
   ============================================================================
   Session 13: loadUserOrders marks already-ready orders with firedReadyBeep:true
   so the beep guard in startAccountOrderListener correctly suppresses spurious
   beeps on page load (only transition to ready should beep, not loaded state).
   ============================================================================ */

const accountOrderListeners = {};

function buildAccountIds(prefix) {
  return {
    out:            `${prefix}-account-out`,
    in:             `${prefix}-account-in`,
    name:           `${prefix}-account-name`,
    currentSection: `${prefix}-current-orders-section`,
    currentList:    `${prefix}-current-orders-list`,
    stampTitle:     `${prefix}-stamp-title`,
    stampsGrid:     `${prefix}-stamps-grid`,
    stampProgress:  `${prefix}-stamp-progress`,
    stampSub:       `${prefix}-stamp-sub`,
    offersList:     `${prefix}-offers-list`,
    historyList:    `${prefix}-order-history-list`,
    historyEmpty:   `${prefix}-order-history-empty`,
  };
}

function stopAllAccountListeners() {
  Object.keys(accountOrderListeners).forEach(id => {
    if (typeof accountOrderListeners[id] === 'function') {
      accountOrderListeners[id]();
    }
    delete accountOrderListeners[id];
  });
  console.log('[Stalliq] All account order listeners stopped.');
}

function loadAccountPage(prefix = 'm') {
  const ids  = buildAccountIds(prefix);
  const user = auth.currentUser;

  const outEl = document.getElementById(ids.out);
  const inEl  = document.getElementById(ids.in);
  if (!outEl || !inEl) return;

  if (!user) {
    outEl.style.display = 'block';
    inEl.style.display  = 'none';
    return;
  }

  outEl.style.display = 'none';
  inEl.style.display  = 'block';

  const nameEl = document.getElementById(ids.name);
  if (nameEl) {
    nameEl.textContent = customerName ? `Hi, ${customerName}!` : 'Welcome back!';
  }

  // Render with currently cached data. listenUserProfile and listenUserOfferUsage
  // (set up in onAuthStateChanged) are the single source of truth for stamps and
  // offers — they fire immediately on setup and on every cross-device change.
  // We do NOT use one-shot Firestore reads here: they can fail during Firebase
  // session refresh (cross-device re-auth) and overwrite correct live state
  // with empty/stale data (Session 21 fix).
  renderStampCard(ids);
  renderAccountOffers(ids);
}

function renderStampCard(ids) {
  const title = document.getElementById(ids.stampTitle);
  const grid  = document.getElementById(ids.stampsGrid);
  const prog  = document.getElementById(ids.stampProgress);
  const sub   = document.getElementById(ids.stampSub);
  if (!grid) return;

  // Set the card heading dynamically so it follows CONFIG / sheet across tenants
  if (title) {
    title.textContent = (loyaltyConfig && loyaltyConfig.title)
      ? loyaltyConfig.title
      : (CONFIG.loyalty && CONFIG.loyalty.title) || `${CONFIG.business.name} Loyalty`;
  }

  const total  = loyaltyConfig ? loyaltyConfig.stampsRequired : 10;
  const filled = Math.min(userStampCount, total);

  grid.innerHTML = Array.from({ length: total }, (_, i) => {

    const isFilled = i < filled;
    return `<div class="m-stamp-dot${isFilled ? ' filled' : ''}">${isFilled ? '🍕' : ''}</div>`;
  }).join('');

  if (prog) prog.textContent = `${filled} of ${total} stamps collected`;

  if (sub && loyaltyConfig) {
    sub.textContent = `Buy ${total} pizzas, get your next one free`;
  }
}

function renderAccountOffers(ids) {
  const list = document.getElementById(ids.offersList);
  if (!list) return;

  if (!offersData || offersData.length === 0) {
    list.innerHTML = '';
    return;
  }

  const now = new Date();
  const c   = CONFIG.business.currency;

  list.innerHTML = offersData.map(offer => {
    // Determine status
    let status = 'available';
    if (offer.endDate) {
      const end = new Date(offer.endDate);
      end.setHours(23, 59, 59, 999);
      if (end < now) status = 'expired';
    }
    if (status === 'available' && offer.maxUses > 0) {
      const used = userOfferUsage[offer.id] || 0;
      if (used >= offer.maxUses) status = 'used';
    }

    const valLabel = offer.discountType === 'percent'
      ? `${offer.discountValue}% off`
      : `${c}${offer.discountValue} off`;

    const badgeHtml = status === 'available'
      ? `<div class="m-offer-badge-available">Available</div>`
      : status === 'used'
        ? `<div class="m-offer-badge-used">Used</div>`
        : `<div class="m-offer-badge-expired">Expired</div>`;

    const dimStyle = status !== 'available' ? ' style="opacity:0.45;"' : '';

    return `
      <div class="m-offer-card"${dimStyle}>
        <div class="m-offer-icon">🎁</div>
        <div class="m-offer-body">
          <div class="m-offer-title">${esc(offer.title)}</div>
          <div class="m-offer-desc">${esc(offer.description || valLabel)}</div>
        </div>
        ${badgeHtml}
      </div>`;
  }).join('');
}

function loadUserOrders(uid) {
  // Session 21 refactor: live onSnapshot query so new orders placed on mobile
  // appear instantly on desktop. Uses docChanges() type === 'added' to inject
  // cards without disturbing existing cards managed by startAccountOrderListener.
  // Renders into BOTH 'm' and 'd' containers with prefix-aware IDs.
  if (userOrdersQueryUnsubscribe) { userOrdersQueryUnsubscribe(); userOrdersQueryUnsubscribe = null; }
  stopAllAccountListeners();
  historyRemainder = [];

  ['m', 'd'].forEach(p => {
    const cs = document.getElementById(`${p}-current-orders-section`);
    const cl = document.getElementById(`${p}-current-orders-list`);
    const hl = document.getElementById(`${p}-order-history-list`);
    if (cs) cs.style.display = 'none';
    if (cl) cl.innerHTML = '';
    if (hl) hl.innerHTML = '<div class="m-account-loading">Loading your orders…</div>';
  });

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 90);

  userOrdersQueryUnsubscribe = db.collection('orders')
    .where('customerId', '==', uid)
    .where('createdAt', '>=', cutoff)
    .orderBy('createdAt', 'desc')
    .limit(50)
    .onSnapshot(snapshot => {
      const activeStatuses   = ['pending', 'accepted', 'preparing', 'ready'];
      const terminalStatuses = ['collected', 'cancelled'];

      snapshot.docChanges().forEach(change => {
        const order = { id: change.doc.id, ...change.doc.data() };

        if (change.type === 'added') {
          // New document: render live card and start per-order listener.
          // Pre-flag already-ready orders so beep only fires on transition (Session 13).
          if (order.status === 'ready') order.firedReadyBeep = true;
          orderCache[order.id] = order;

          if (!activeStatuses.includes(order.status)) return;

          // Inject card into both surfaces if not already present
          ['m', 'd'].forEach(prefix => {
            const currentSection = document.getElementById(`${prefix}-current-orders-section`);
            const currentList    = document.getElementById(`${prefix}-current-orders-list`);
            if (currentSection) currentSection.style.display = 'block';
            if (currentList && !document.getElementById(`${prefix}-coc-${order.id}`)) {
              const wrapper = document.createElement('div');
              wrapper.id        = `${prefix}-coc-${order.id}`;
              wrapper.className = 'm-current-order-card';
              wrapper.setAttribute('onclick', `openOrderDetail('${order.id}')`);
              wrapper.innerHTML = buildCurrentOrderCardHTML(order, prefix);
              currentList.appendChild(wrapper);
            }
          });
          // One per-order status listener (not per prefix)
          startAccountOrderListener(order.id);
        }

        if (change.type === 'modified') {
          // Status update from kitchen. The per-order document listener
          // (startAccountOrderListener) handles this too, but we also handle
          // it here as a belt-and-suspenders guarantee — the query listener
          // fires reliably for every field change on documents in its result set.
          orderCache[order.id] = { ...(orderCache[order.id] || {}), ...change.doc.data() };
          const { status, waitMins } = order;

          if (activeStatuses.includes(status)) {
            // Update status badge on both surfaces
            const cfg      = ORDER_STATUS_CONFIG[status] || ORDER_STATUS_CONFIG.pending;
            const waitLine = (status === 'accepted' && waitMins)
              ? `<div class="m-coc-wait">~${waitMins} mins estimated</div>`
              : '';
            const statusHTML = `
                <div class="m-coc-status-icon">${cfg.icon}</div>
                <div class="m-coc-status-body">
                  <div class="m-coc-status-text">${cfg.label}</div>
                  ${waitLine}
                </div>`;
            ['m', 'd'].forEach(p => {
              const statusEl = document.getElementById(`${p}-coc-status-${order.id}`);
              if (statusEl) statusEl.innerHTML = statusHTML;
            });
          }

          if (terminalStatuses.includes(status)) {
            // Fade and remove card from both surfaces (mirrors startAccountOrderListener)
            ['m', 'd'].forEach(p => {
              const cardEl = document.getElementById(`${p}-coc-${order.id}`);
              if (cardEl) {
                cardEl.style.transition = 'opacity 0.4s';
                cardEl.style.opacity    = '0';
                setTimeout(() => {
                  cardEl.remove();
                  const section = document.getElementById(`${p}-current-orders-section`);
                  const list    = document.getElementById(`${p}-current-orders-list`);
                  if (section && list && list.children.length === 0) {
                    section.style.display = 'none';
                  }
                }, 400);
              }
            });
          }
        }
      });

      // Rebuild history from full snapshot on every fire so collected/cancelled
      // orders appear immediately after the per-order listener removes the live card.
      const historyOrders = [];
      snapshot.forEach(doc => {
        const order = { id: doc.id, ...doc.data() };
        if (terminalStatuses.includes(order.status)) historyOrders.push(order);
      });
      historyAllOrders = historyOrders;

      if (historyOrders.length === 0) {
        ['m', 'd'].forEach(p => {
          const hl = document.getElementById(`${p}-order-history-list`);
          const he = document.getElementById(`${p}-order-history-empty`);
          if (hl) hl.innerHTML = '';
          if (he) he.style.display = 'block';
        });
      } else {
        ['m', 'd'].forEach(p => {
          const he = document.getElementById(`${p}-order-history-empty`);
          if (he) he.style.display = 'none';
        });
        _renderHistoryList(false);
      }
    }, err => {
      console.error('[Stalliq] Account orders load error:', err.code, err.message);
      if (err.code === 'failed-precondition') {
        console.warn('[Stalliq] Composite index required. Check Firestore console for a direct creation link.');
      }
      ['m', 'd'].forEach(p => {
        const hl = document.getElementById(`${p}-order-history-list`);
        if (hl) hl.innerHTML = '<div class="m-account-loading">Could not load orders — please try again.</div>';
      });
    });
}

function buildCurrentOrderCardHTML(order, prefix = 'm') {
  const cfg          = ORDER_STATUS_CONFIG[order.status] || ORDER_STATUS_CONFIG.pending;
  const itemsSummary = order.items
    ? order.items.map(i => `${esc(i.name)} × ${i.quantity}`).join(', ')
    : '';
  const total   = order.orderTotal != null
    ? CONFIG.business.currency + Number(order.orderTotal).toFixed(2)
    : '';
  const waitLine = (order.status === 'accepted' && order.waitMins)
    ? `<div class="m-coc-wait">~${order.waitMins} mins estimated</div>`
    : '';

  return `
    <div class="m-coc-header">
      <div class="m-coc-ref">${esc(order.orderRef) || '—'}</div>
      <div class="m-coc-total">${total}</div>
    </div>
    <div class="m-coc-items">${itemsSummary}</div>
    <div class="m-coc-status" id="${prefix}-coc-status-${order.id}">
      <div class="m-coc-status-icon">${cfg.icon}</div>
      <div class="m-coc-status-body">
        <div class="m-coc-status-text">${cfg.label}</div>
        ${waitLine}
      </div>
    </div>`;
}

function buildHistoryItemHTML(order) {
  let dateStr = '—';
  if (order.createdAt) {
    try {
      const d = order.createdAt.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
      dateStr = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch (_) {}
  }

  const itemsSummary = order.items
    ? order.items.map(i => `${esc(i.name)} × ${i.quantity}`).join(', ')
    : '';
  const total = order.orderTotal != null
    ? CONFIG.business.currency + Number(order.orderTotal).toFixed(2)
    : '';
  const statusLabel = order.status
    ? order.status.charAt(0).toUpperCase() + order.status.slice(1)
    : '';

  const reorderBtn = order.status === 'collected'
    ? `<button class="m-reorder-btn" onclick="event.stopPropagation();reorderItems('${order.id}')">🔁 Reorder</button>`
    : '';

  return `
    <div class="m-history-item" onclick="openOrderDetail('${order.id}')">
      <div class="m-history-header">
        <div class="m-history-ref">${esc(order.orderRef) || '—'}</div>
        <div class="m-history-date">${dateStr}</div>
      </div>
      <div class="m-history-items">${itemsSummary}</div>
      <div class="m-history-footer">
        <div class="m-history-total">${total}</div>
        <div class="m-history-status status-${order.status}">${statusLabel}</div>
        ${reorderBtn}
        <div class="m-history-chevron">›</div>
      </div>
    </div>`;
}

/**
 * Prepends a just-collected (or cancelled) order to the history list in real
 * time, without requiring a page reload.
 * Called by startAccountOrderListener() when an order reaches a terminal status.
 * Works for both 'm' and 'd' prefixes — only inserts into whichever containers
 * are currently in the DOM.
 */
function _prependToHistory(order) {
  // Keep the master list in sync so show more/less stays accurate
  historyAllOrders = [order, ...historyAllOrders.filter(o => o.id !== order.id)];

  ['m', 'd'].forEach(prefix => {
    const historyList  = document.getElementById(`${prefix}-order-history-list`);
    const historyEmpty = document.getElementById(`${prefix}-order-history-empty`);
    if (!historyList) return;

    // Hide the "no orders yet" empty state if visible
    if (historyEmpty) historyEmpty.style.display = 'none';

    // Insert the new item at the top, before any existing history
    historyList.insertAdjacentHTML('afterbegin', buildHistoryItemHTML(order));
  });
}

function showMoreHistory()  { _renderHistoryList(true);  }
function showLessHistory()  { _renderHistoryList(false); }

/**
 * Renders the order history list into both m and d containers.
 * showAll=false: first 3 orders + "Show N more" button.
 * showAll=true:  all orders + "Show less" button.
 */
function _renderHistoryList(showAll) {
  const INITIAL_SHOW = 3;
  const orders = historyAllOrders;
  if (!orders || orders.length === 0) return;

  const shown     = showAll ? orders : orders.slice(0, INITIAL_SHOW);
  const remaining = showAll ? 0 : orders.length - INITIAL_SHOW;

  let html = shown.map(o => buildHistoryItemHTML(o)).join('');

  if (!showAll && remaining > 0) {
    html += `
      <div id="history-show-more-wrap" style="padding:4px 0 8px;">
        <button class="m-signout-btn" style="margin:0;width:100%;"
          onclick="showMoreHistory()">
          Show ${remaining} more order${remaining === 1 ? '' : 's'}
        </button>
      </div>`;
  } else if (showAll && orders.length > INITIAL_SHOW) {
    html += `
      <div id="history-show-less-wrap" style="padding:4px 0 8px;">
        <button class="m-signout-btn" style="margin:0;width:100%;"
          onclick="showLessHistory()">
          Show less
        </button>
      </div>`;
  }

  html += `<div style="text-align:center;padding:10px 0 4px;font-size:11px;
             color:rgba(255,255,255,0.45);letter-spacing:0.08em;text-transform:uppercase;">
             Showing last 3 months
           </div>`;

  ['m', 'd'].forEach(prefix => {
    const el = document.getElementById(`${prefix}-order-history-list`);
    if (el) el.innerHTML = html;
  });
}

function startAccountOrderListener(orderId) {
  if (accountOrderListeners[orderId]) return;

  const docRef = db.collection('orders').doc(orderId);

  accountOrderListeners[orderId] = docRef.onSnapshot(
    snapshot => {
      if (!snapshot.exists) return;
      const data             = snapshot.data();
      const { status, waitMins } = data;

      if (orderCache[orderId]) {
        orderCache[orderId] = { ...orderCache[orderId], ...data };
      }

      // Update status element in BOTH m and d containers (Session 21 prefix-aware IDs)
      const cfg      = ORDER_STATUS_CONFIG[status] || ORDER_STATUS_CONFIG.pending;
      const waitLine = (status === 'accepted' && waitMins)
        ? `<div class="m-coc-wait">~${waitMins} mins estimated</div>`
        : '';
      const statusHTML = `
          <div class="m-coc-status-icon">${cfg.icon}</div>
          <div class="m-coc-status-body">
            <div class="m-coc-status-text">${cfg.label}</div>
            ${waitLine}
          </div>`;
      ['m', 'd'].forEach(p => {
        const statusEl = document.getElementById(`${p}-coc-status-${orderId}`);
        if (statusEl) statusEl.innerHTML = statusHTML;
      });

      // Session 13: fire ready beep on transition to ready
      if (status === 'ready') {
        if (!orderCache[orderId]?.firedReadyBeep) {
          if (document.visibilityState === 'visible') {
            playReadyBeep();
            if (orderCache[orderId]) orderCache[orderId].firedReadyBeep = true;
          }
          // else: leave flag unset — visibilitychange handler will fire it
        }
      }

      if (status === 'collected' || status === 'cancelled') {
        if (accountOrderListeners[orderId]) {
          accountOrderListeners[orderId]();
          delete accountOrderListeners[orderId];
        }

        // Award loyalty stamp on collection (guarded by stampsAwarded flag).
        // Skip if the order itself redeemed a loyalty reward — the customer
        // already received their benefit and stamps were reset on submission.
        if (status === 'collected') {
          const cachedOrder = orderCache[orderId];
          if (cachedOrder && !cachedOrder.stampsAwarded &&
              cachedOrder.discount?.type !== 'loyalty') {
            awardStamp(orderId);
          }
        }

        // Move order into history immediately — no reload needed
        const finalOrder = orderCache[orderId];
        if (finalOrder) _prependToHistory(finalOrder);
        _dismissCustomerReadyPrompt();

        // Fade and remove card from BOTH m and d containers
        ['m', 'd'].forEach(p => {
          const cardEl = document.getElementById(`${p}-coc-${orderId}`);
          if (cardEl) {
            cardEl.style.transition = 'opacity 0.4s';
            cardEl.style.opacity    = '0';
            setTimeout(() => {
              cardEl.remove();
              const section = document.getElementById(`${p}-current-orders-section`);
              const list    = document.getElementById(`${p}-current-orders-list`);
              if (section && list && list.children.length === 0) {
                section.style.display = 'none';
              }
            }, 400);
          }
        });
        console.log(`[Stalliq] Account listener stopped for ${orderId} (${status}).`);
      }
    },
    err => {
      console.error(`[Stalliq] Account order listener error for ${orderId}:`, err.code);
    }
  );

  console.log(`[Stalliq] Account order listener started for ${orderId}.`);
}

function accountSignIn() {
  pendingOrderFn = () => { const u = auth.currentUser; loadAccountPage('m'); loadAccountPage('d'); if (u) loadUserOrders(u.uid); };
  document.getElementById('auth-title').textContent = 'Sign in to your account';
  document.getElementById('auth-sub-text').textContent = 'Enter your mobile number to sign in';
  authClearErrors();
  authShowOverlay('phone');
}

function dAccountSignIn() {
  pendingOrderFn = () => { const u = auth.currentUser; loadAccountPage('d'); loadAccountPage('m'); if (u) loadUserOrders(u.uid); };
  document.getElementById('auth-title').textContent = 'Sign in to your account';
  document.getElementById('auth-sub-text').textContent = 'Enter your mobile number to sign in';
  authClearErrors();
  authShowOverlay('phone');
}

function accountSignOut(prefix = 'm') {
  stopAllAccountListeners();
  if (userProfileUnsubscribe)     { userProfileUnsubscribe();     userProfileUnsubscribe     = null; }
  if (userOfferUsageUnsubscribe)  { userOfferUsageUnsubscribe();  userOfferUsageUnsubscribe  = null; }
  if (userOrdersQueryUnsubscribe) { userOrdersQueryUnsubscribe(); userOrdersQueryUnsubscribe = null; }
  userStampCount = 0;
  userOfferUsage = {};
  // Clear order containers on both surfaces
  ['m', 'd'].forEach(p => {
    const cl = document.getElementById(`${p}-current-orders-list`);
    const cs = document.getElementById(`${p}-current-orders-section`);
    const hl = document.getElementById(`${p}-order-history-list`);
    if (cl) cl.innerHTML = '';
    if (cs) cs.style.display = 'none';
    if (hl) hl.innerHTML = '';
  });
  historyAllOrders = [];

  auth.signOut()
    .then(() => {
      customerName = null;
      loadAccountPage('m');
      loadAccountPage('d');
    })
    .catch(err => {
      console.error('[Stalliq] Sign out error:', err);
    });
}


/* ============================================================================
   34. ORDER DETAIL OVERLAY
   Session 13: per-item notes rendered below item name in detail sheet.
   ============================================================================ */

function openOrderDetail(orderId) {
  const cached = orderCache[orderId];
  if (cached) {
    renderOrderDetail(cached);
  } else {
    db.collection('orders').doc(orderId).get()
      .then(doc => {
        if (doc.exists) {
          const order = { id: doc.id, ...doc.data() };
          orderCache[orderId] = order;
          renderOrderDetail(order);
        }
      })
      .catch(err => console.error('[Stalliq] Detail fetch error:', err));
  }
}

function renderOrderDetail(order) {
  const refEl = document.getElementById('od-ref');
  if (refEl) refEl.textContent = order.orderRef || '—';

  const dateEl = document.getElementById('od-date');
  if (dateEl) {
    let dateStr = '—';
    if (order.createdAt) {
      try {
        const d = order.createdAt.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
        dateStr = d.toLocaleDateString('en-GB', {
          day: 'numeric', month: 'short', year: 'numeric',
          hour: '2-digit', minute: '2-digit'
        });
      } catch (_) {}
    }
    dateEl.textContent = dateStr;
  }

  const badgeEl = document.getElementById('od-status-badge');
  if (badgeEl) {
    const statusLabel = order.status
      ? order.status.charAt(0).toUpperCase() + order.status.slice(1)
      : '';
    badgeEl.textContent  = statusLabel;
    badgeEl.className    = `order-detail-status-badge status-${order.status}`;
  }

  const itemsEl = document.getElementById('od-items-list');
  if (itemsEl && order.items) {
    // Session 13: per-item notes rendered below item name
    itemsEl.innerHTML = order.items.map(item => {
      const lineTotal = (item.price * item.quantity).toFixed(2);
      const noteEl    = item.notes
        ? `<div class="order-detail-item-note">📝 ${esc(item.notes)}</div>`
        : '';
      return `
        <div class="order-detail-item">
          <div>
            <span class="order-detail-item-name">${esc(item.name)}</span>
            <span class="order-detail-item-qty">× ${item.quantity}</span>
            ${noteEl}
          </div>
          <div class="order-detail-item-price">${CONFIG.business.currency}${lineTotal}</div>
        </div>`;
    }).join('');
  }

  // ── Totals — rebuild with discount breakdown when applicable (Session 21) ──
  const totalsEl = document.getElementById('od-totals');
  if (totalsEl) {
    const c      = CONFIG.business.currency;
    const disc   = order.discount;
    const method = order.payment && order.payment.method === 'cash_on_collection'
      ? 'Cash on collection'
      : (order.payment && order.payment.method) || 'Cash on collection';

    let totalsHTML = `
      <div class="order-detail-total-row">
        <span>Payment</span>
        <span>${method}</span>
      </div>`;

    if (disc && disc.amount > 0) {
      const subtotal = Number(order.orderTotal) + Number(disc.amount);
      totalsHTML += `
      <div class="order-detail-total-row" style="margin-top:4px;">
        <span>Subtotal</span>
        <span>${c}${subtotal.toFixed(2)}</span>
      </div>
      <div class="order-detail-total-row" style="color:#8de88d;">
        <span>🎉 ${esc(disc.description)}</span>
        <span>−${c}${Number(disc.amount).toFixed(2)}</span>
      </div>`;
    }

    totalsHTML += `
      <div class="order-detail-total-row main">
        <span>Total</span>
        <span>${c}${Number(order.orderTotal).toFixed(2)}</span>
      </div>`;

    totalsEl.innerHTML = totalsHTML;
  }

  const reorderWrap = document.getElementById('od-reorder-wrap');
  if (reorderWrap) {
    if (order.status === 'collected') {
      reorderWrap.innerHTML = `
        <button class="m-btn" style="margin:16px 24px 0;width:calc(100% - 48px);"
          onclick="reorderItems('${order.id}')">🔁 Reorder This</button>`;
    } else {
      reorderWrap.innerHTML = '';
    }
  }

  document.getElementById('order-detail-overlay').classList.add('show');
}

function closeOrderDetail() {
  document.getElementById('order-detail-overlay').classList.remove('show');
}

function reorderItems(orderId) {
  const order = orderCache[orderId];
  if (!order || !order.items) return;

  Object.keys(basket).forEach(k => delete basket[k]);
  Object.keys(basketNotes).forEach(k => delete basketNotes[k]); // Session 13

  let added = 0;
  order.items.forEach(item => {
    const menuItem = menuData.find(m => m.id === item.id && m.available !== false);
    if (menuItem) {
      basket[menuItem.id] = item.quantity;
      // Restore notes from original order on reorder
      if (item.notes) basketNotes[menuItem.id] = item.notes;
      added++;
    }
  });

  refreshDesktopBasket();
  refreshMobileBadge();
  renderDesktopMenu();
  renderMobileMenu();

  closeOrderDetail();

  if (added === 0) {
    setTimeout(() => alert("Sorry — none of those items are currently available."), 200);
    return;
  }

  if (window.innerWidth < 768) {
    mShowPage('basket');
  } else {
    const acctPanel = document.getElementById('d-account-panel');
    if (acctPanel) acctPanel.classList.remove('open');
    const basketPanel = document.getElementById('d-basket-panel');
    if (basketPanel) basketPanel.classList.add('open');
  }

  console.log(`[Stalliq] Reorder: ${added} item type(s) added to basket from order ${orderId}.`);
}
