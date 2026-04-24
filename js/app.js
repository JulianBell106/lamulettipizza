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
 *   22. Init
 *   23. Auth — State helpers
 *   24. Auth — Gateway (intercepts Place Order)
 *   25. Auth — Send SMS code
 *   26. Auth — Verify code
 *   27. Auth — Save name (first order only)
 *   28. Firebase — Get next order ref (daily counter)
 *   29. Firebase — Submit order to Firestore
 *   30. Firebase — Kitchen status listener
 *   31. Firebase — Order status listener (confirmation modal)
 *   32. Account page — Members area
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
const basket = {};
let orderCount      = 0;
let customerName    = null;   // cached after phone auth
let pendingOrderFn  = null;   // called after auth completes
let kitchenStatus   = 'open'; // updated live by Firestore listener (Section 30)
const orderCache    = {};     // orderId → order data, populated by loadUserOrders
let historyRemainder = [];    // orders beyond initial 5, revealed by "Show more"


/* ============================================================================
   4. UTILITY FUNCTIONS
   ============================================================================ */

function basketTotalQty() {
  return Object.values(basket).reduce((sum, qty) => sum + qty, 0);
}

function basketTotalPrice() {
  return Object.keys(basket).reduce((sum, id) => {
    const item = CONFIG.menu.find(m => m.id === Number(id));
    return sum + (item ? item.price * basket[id] : 0);
  }, 0);
}

function updateBasket(id, delta) {
  id = Number(id);
  basket[id] = Math.max(0, (basket[id] || 0) + delta);
  if (basket[id] === 0) delete basket[id];
  renderDesktopMenu();
  renderMobileMenu();
  refreshDesktopBasket();
  refreshMobileBadge();
}

function generateOrderRef() {
  orderCount++;
  return CONFIG.ordering.refPrefix + String(orderCount).padStart(4, '0');
}

function buildOrderSummaryHTML(rowClass) {
  let total = 0;
  let rows  = '';
  Object.keys(basket).map(Number).forEach(id => {
    const item = CONFIG.menu.find(m => m.id === id);
    const qty  = basket[id];
    const sub  = item.price * qty;
    total += sub;
    rows += `<div class="${rowClass}">
               <span>${item.name} × ${qty}</span>
               <strong>${CONFIG.business.currency}${sub.toFixed(2)}</strong>
             </div>`;
  });
  rows += `<div class="${rowClass}" style="border-top:1px solid rgba(212,160,67,0.15);margin-top:8px;padding-top:8px;">
             <span>Total</span>
             <strong style="color:var(--gold)">${CONFIG.business.currency}${total.toFixed(2)}</strong>
           </div>`;
  rows += `<div class="${rowClass}">
             <span>Payment</span>
             <strong>${CONFIG.ordering.paymentNote}</strong>
           </div>`;
  return { rows, total };
}

function clearBasket() {
  Object.keys(basket).forEach(k => delete basket[k]);
  renderDesktopMenu();
  renderMobileMenu();
  refreshDesktopBasket();
  refreshMobileBadge();
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
  const navCta = document.querySelector('.d-nav-cta');
  if (navCta) navCta.textContent = CONFIG.hero.navCta;
}

function renderDesktopHero() {
  const h = CONFIG.hero;
  const set = (sel, html) => { const el = document.querySelector(sel); if (el) el.innerHTML = html; };
  set('.d-hero-eyebrow',  h.eyebrow);
  set('.d-hero-title',    `${h.titleLine1}<br><em>${h.titleLine2}</em>`);
  set('.d-hero-sub',      h.subtitle.replace(/&/g, '&amp;'));
  const primary   = document.querySelector('.d-btn-primary');
  const secondary = document.querySelector('.d-btn-ghost');
  if (primary)   primary.textContent   = h.ctaPrimary;
  if (secondary) secondary.textContent = h.ctaSecondary;
}


/* ============================================================================
   6. DESKTOP — STRIP BAR
   ============================================================================ */
function renderDesktopStrip() {
  const strip = document.querySelector('.d-strip');
  if (!strip) return;
  strip.innerHTML = CONFIG.stripItems
    .map(i => `<div class="d-strip-item"><span>${i.icon}</span> ${i.text}</div>`)
    .join('');
}


/* ============================================================================
   7. DESKTOP — MENU
   ============================================================================ */
function renderDesktopMenu() {
  const grid = document.getElementById('d-menu-grid');
  if (!grid) return;

  const items = CONFIG.menu.filter(m => m.available !== false);

  grid.innerHTML = items.map((item, i) => {
    const qty = basket[item.id] || 0;
    const controls = qty > 0
      ? `<button class="d-qty-btn"     data-id="${item.id}" data-delta="-1">−</button>
         <span   class="d-qty-num">${qty}</span>
         <button class="d-qty-btn add" data-id="${item.id}" data-delta="1">+</button>`
      : `<button class="d-qty-btn add" data-id="${item.id}" data-delta="1">+</button>`;

    return `
      <div class="d-pizza-card" id="d-card-${item.id}">
        <div class="d-pizza-num">0${i + 1}</div>
        <div class="d-pizza-name">${item.name}</div>
        <div class="d-pizza-desc">${item.desc}</div>
        <div class="d-pizza-footer">
          <div class="d-pizza-price">${CONFIG.business.currency}${item.price.toFixed(2)}</div>
          <div style="display:flex;align-items:center;gap:8px;">
            ${item.diet ? `<div class="d-pizza-diet">${item.diet}</div>` : ''}
            ${controls}
          </div>
        </div>
      </div>`;
  }).join('');
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
    pills.innerHTML = a.founders.map(f => `
      <div class="d-founder-pill">
        <div class="d-founder-pill-avatar">${f.avatar}</div>
        <div class="d-founder-pill-name">${f.name}</div>
        <div class="d-founder-pill-role">${f.role}</div>
      </div>`).join('');
  }
}


/* ============================================================================
   9. DESKTOP — VALUES
   ============================================================================ */
function renderDesktopValues() {
  const v = CONFIG.values;

  const eyebrow = document.querySelector('#d-values .d-eyebrow');
  if (eyebrow) eyebrow.textContent = v.eyebrow;
  const title = document.querySelector('#d-values .d-title');
  if (title) title.innerHTML = `${v.titleLine1} <em>${v.titleLine2}</em>`;

  const grid = document.querySelector('.d-values-grid');
  if (grid) {
    grid.innerHTML = v.items.map(item => `
      <div class="d-value-card reveal">
        <div class="d-value-icon">${item.icon}</div>
        <div class="d-value-name">${item.name}</div>
        <div class="d-value-desc">${item.desc}</div>
      </div>`).join('');
  }
}


/* ============================================================================
   10. DESKTOP — CONTACT + EVENTS
   ============================================================================ */
function renderDesktopContact() {
  const c = CONFIG.contact;
  const grid = document.querySelector('.d-contact-grid');
  if (grid) {
    grid.innerHTML = `
      <a href="tel:${c.phone.replace(/\s/g,'')}" class="d-contact-card">
        <div class="d-contact-icon">📞</div>
        <div class="d-contact-label">Phone</div>
        <div class="d-contact-value">${c.phone}</div>
      </a>
      <a href="mailto:${c.email}" class="d-contact-card">
        <div class="d-contact-icon">✉️</div>
        <div class="d-contact-label">Email</div>
        <div class="d-contact-value">${c.email}</div>
      </a>
      <a href="${c.websiteUrl}" target="_blank" rel="noopener" class="d-contact-card">
        <div class="d-contact-icon">🌐</div>
        <div class="d-contact-label">Website</div>
        <div class="d-contact-value">${c.website}</div>
      </a>
      <a href="${c.facebookUrl}" target="_blank" rel="noopener" class="d-contact-card">
        <div class="d-contact-icon">📘</div>
        <div class="d-contact-label">Facebook</div>
        <div class="d-contact-value">${c.facebook}</div>
      </a>`;
  }

  renderEventsList('.d-popup-list', 'd-popup-card', 'd-popup-date', 'd-popup-day', 'd-popup-month', 'd-popup-event', 'd-popup-loc');
}

function renderEventsList(containerSel, cardCls, dateCls, dayCls, monthCls, nameCls, locCls) {
  const el = document.querySelector(containerSel);
  if (!el) return;
  if (!CONFIG.events || CONFIG.events.length === 0) {
    el.innerHTML = `<p style="color:rgba(253,246,236,0.45);font-size:14px;">No upcoming events — follow us on socials for updates!</p>`;
    return;
  }
  el.innerHTML = CONFIG.events.map(ev => `
    <div class="${cardCls}">
      <div class="${dateCls}">
        <div class="${dayCls}">${ev.day}</div>
        <div class="${monthCls}">${ev.month}</div>
      </div>
      <div>
        <div class="${nameCls}">${ev.name}</div>
        <div class="${locCls}">${ev.location}</div>
      </div>
    </div>`).join('');
}


/* ============================================================================
   11. DESKTOP — BASKET
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
    const item = CONFIG.menu.find(m => m.id === id);
    const qty  = basket[id];
    return `
      <div class="d-bitem">
        <div class="d-bitem-name">${item.name}</div>
        <div class="d-bitem-controls">
          <button class="d-qty-btn"     data-id="${id}" data-delta="-1">−</button>
          <span   class="d-qty-num">${qty}</span>
          <button class="d-qty-btn add" data-id="${id}" data-delta="1">+</button>
        </div>
        <div class="d-bitem-price">${CONFIG.business.currency}${(item.price * qty).toFixed(2)}</div>
      </div>`;
  }).join('');

  footer.style.display = 'block';
  const totalEl = document.getElementById('d-basket-total');
  if (totalEl) totalEl.textContent = CONFIG.business.currency + total.toFixed(2);
}

function dToggleBasket() {
  const panel = document.getElementById('d-basket-panel');
  if (panel) panel.classList.toggle('open');
}

function dToggleAccount() {
  const panel = document.getElementById('d-account-panel');
  if (!panel) return;
  const opening = !panel.classList.contains('open');
  panel.classList.toggle('open');
  if (opening) loadAccountPage('d');
}


/* ============================================================================
   12. DESKTOP — ORDER CONFIRMATION
   Routes through authGateway → Firestore submission → live status listener.

   The overlay starts in pending state (⏳ / "Waiting…") from HTML defaults.
   startOrderStatusListener() takes over from there and updates elements live.
   ============================================================================ */
function dPlaceOrder() {
  if (kitchenStatus !== 'open') return;

  authGateway(async () => {
    const btn = document.querySelector('#d-basket-footer .d-btn-primary');
    if (btn) { btn.textContent = 'Placing order...'; btn.disabled = true; }
    try {
      const { orderRef, orderId } = await submitOrderToFirestore();
      console.log(`[Stalliq] Order placed. orderId: ${orderId} | orderRef: ${orderRef}`);

      const { rows } = buildOrderSummaryHTML('d-order-row');
      document.getElementById('d-order-ref').textContent   = 'Order ref ' + orderRef;
      document.getElementById('d-order-details').innerHTML = rows;

      // Reset overlay to pending state (HTML defaults already set, but reset
      // here so it's correct if the customer places a second order this session)
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
   ============================================================================ */
function renderMobileMenu() {
  const list = document.getElementById('m-menu-list');
  if (!list) return;

  const items = CONFIG.menu.filter(m => m.available !== false);

  list.innerHTML = items.map(item => {
    const qty = basket[item.id] || 0;
    const controls = qty > 0
      ? `<button class="qty-btn"     onclick="mQty(${item.id},-1)">−</button>
         <span   class="qty-display">${qty}</span>
         <button class="qty-btn add" onclick="mQty(${item.id}, 1)">+</button>`
      : `<button class="qty-btn add" onclick="mQty(${item.id}, 1)">+</button>`;
    const dietTag = item.diet ? ` <span class="m-card-diet">${item.diet}</span>` : '';
    return `
      <div class="m-menu-card">
        <div class="m-card-info">
          <div class="m-card-name">${item.name}${dietTag}</div>
          <div class="m-card-desc">${item.desc}</div>
          <div class="m-card-price">${CONFIG.business.currency}${item.price.toFixed(2)}</div>
        </div>
        <div class="m-card-controls">${controls}</div>
      </div>`;
  }).join('');
}

function mQty(id, delta) { updateBasket(id, delta); }


/* ============================================================================
   17. MOBILE — BASKET
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
    const item = CONFIG.menu.find(m => m.id === id);
    const qty  = basket[id];
    const sub  = item.price * qty;
    total += sub;
    return `
      <div class="m-basket-item">
        <div class="m-bi-name">${item.name}</div>
        <div class="m-bi-qty">× ${qty}</div>
        <div class="m-bi-price">${CONFIG.business.currency}${sub.toFixed(2)}</div>
        <button class="m-bi-remove" onclick="mRemoveItem(${id})">×</button>
      </div>`;
  }).join('');

  const totalEl = document.getElementById('m-basket-total');
  if (totalEl) totalEl.textContent = CONFIG.business.currency + total.toFixed(2);
}

function mRemoveItem(id) {
  delete basket[Number(id)];
  refreshMobileBadge();
  refreshDesktopBasket();
  renderMobileBasket();
}


/* ============================================================================
   18. MOBILE — ORDER CONFIRMATION
   Routes through authGateway → Firestore submission → live status listener.

   The modal starts in pending state (⏳ / "Waiting…") from HTML defaults.
   startOrderStatusListener() takes over from there and updates elements live.
   ============================================================================ */
function mPlaceOrder() {
  if (kitchenStatus !== 'open') return;

  authGateway(async () => {
    const btn = document.querySelector('#page-basket .m-btn');
    if (btn) { btn.textContent = 'Placing order...'; btn.disabled = true; }
    const errEl = document.getElementById('m-order-err');
    if (errEl) errEl.textContent = '';
    try {
      const { orderRef, orderId } = await submitOrderToFirestore();
      console.log(`[Stalliq] Order placed. orderId: ${orderId} | orderRef: ${orderRef}`);

      const { rows } = buildOrderSummaryHTML('m-confirm-row');
      document.getElementById('m-confirm-ref').textContent   = 'Order ref ' + orderRef;
      document.getElementById('m-confirm-details').innerHTML = rows;
      document.getElementById('m-confirm-msg').textContent   = CONFIG.ordering.confirmMsg;

      // Reset modal to pending state (HTML defaults already set, but reset
      // here so it's correct if the customer places a second order this session)
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
   ============================================================================ */
function renderMobileFindUs() {
  const c = CONFIG.contact;
  const contactList = document.querySelector('.m-contact-list');
  if (contactList) {
    contactList.innerHTML = `
      <a href="tel:${c.phone.replace(/\s/g,'')}" class="m-contact-card"><div class="m-ci">📞</div><div><div class="m-cl">Phone</div><div class="m-cv">${c.phone}</div></div><div class="m-ca">›</div></a>
      <a href="mailto:${c.email}" class="m-contact-card"><div class="m-ci">✉️</div><div><div class="m-cl">Email</div><div class="m-cv">${c.email}</div></div><div class="m-ca">›</div></a>
      <a href="${c.websiteUrl}" target="_blank" rel="noopener" class="m-contact-card"><div class="m-ci">🌐</div><div><div class="m-cl">Website</div><div class="m-cv">${c.website}</div></div><div class="m-ca">›</div></a>
      <a href="${c.facebookUrl}" target="_blank" rel="noopener" class="m-contact-card"><div class="m-ci">📘</div><div><div class="m-cl">Facebook / Socials</div><div class="m-cv">${c.facebook}</div></div><div class="m-ca">›</div></a>`;
  }

  renderEventsList('.m-popup-list', 'm-popup-card', 'm-popup-date', 'm-popup-day', 'm-popup-month', 'm-popup-ename', 'm-popup-loc');
}


/* ============================================================================
   21. SCROLL REVEAL
   ============================================================================ */
function initScrollReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  els.forEach(el => observer.observe(el));
}


/* ============================================================================
   22. INIT
   ============================================================================ */
document.addEventListener('DOMContentLoaded', function () {
  applyTheme();
  bootstrapPage();

  // Desktop
  renderDesktopNav();
  renderDesktopHero();
  renderDesktopStrip();
  renderDesktopMenu();
  renderDesktopStory();
  renderDesktopValues();
  renderDesktopContact();

  // Mobile
  renderMobileHome();
  renderMobileMenu();
  renderMobileAbout();
  renderMobileFindUs();

  // Footer
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

  // Kitchen status — live Firestore listener (Section 30)
  initKitchenStatusListener();
});


/* ============================================================================
   23. AUTH — STATE HELPERS
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
   24. AUTH — GATEWAY
   Called by mPlaceOrder() and dPlaceOrder() before submitting.
   Checks auth state and routes to the right screen.
   ============================================================================ */
function authGateway(orderFn) {
  pendingOrderFn = orderFn;

  // Reset auth overlay to order-placement context
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
   25. AUTH — SEND SMS CODE
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
   26. AUTH — VERIFY SMS CODE
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
   27. AUTH — SAVE NAME (first order only)
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
   28. FIREBASE — GET NEXT ORDER REF
   Daily sequential counter via Firestore transaction.
   Resets to #001 each day. Concurrency-safe.
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
   29. FIREBASE — SUBMIT ORDER TO FIRESTORE
   Returns { orderRef, orderId } — orderId is the Firestore document ID,
   used by the order status listener in Section 31.
   ============================================================================ */
async function submitOrderToFirestore() {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');

  const orderRef     = await getNextOrderRef();
  const timeoutMins  = CONFIG.ordering.timeoutMins || 10;
  const expiresAt    = new Date(Date.now() + timeoutMins * 60 * 1000);

  const items = Object.keys(basket).map(Number).map(id => {
    const item = CONFIG.menu.find(m => m.id === id);
    return {
      id:       item.id,
      name:     item.name,
      price:    item.price,
      quantity: basket[id],
      notes:    null
    };
  });

  const orderDoc = {
    orderRef,
    vendorId:      CONFIG.vendor.id,
    customerId:    user.uid,
    customerName,
    customerPhone: user.phoneNumber,
    items,
    orderTotal:    basketTotalPrice(),
    payment: {
      method: 'cash_on_collection',
      status: 'pending'
    },
    status:    'pending',
    waitMins:  null,
    expiresAt,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  };

  const docRef = await db.collection('orders').add(orderDoc);
  return { orderRef, orderId: docRef.id };
}


/* ============================================================================
   30. FIREBASE — KITCHEN STATUS LISTENER
   Reads kitchenStatus from vendors/{vendorId} in real time.
   Updates shared state and blocks/unblocks ordering across mobile + desktop.
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
        'background:#C8410B',
        'color:#FDF6EC',
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

  // ── Desktop: closed banner — full width, top of page, above nav ──────────
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
        'background:#1A0A00',
        'color:#FDF6EC',
        'border-bottom:3px solid #C8410B',
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
      // Fail open — do not block ordering if Firestore is unreachable
    }
  );
}


/* ============================================================================
   31. FIREBASE — ORDER STATUS LISTENER (confirmation modal)
   After order placement, listens on the specific order document and updates
   the customer's confirmation modal/overlay with live status.

   This is a SINGLE listener for the active confirmation modal.
   The Account page (Section 32) uses a separate map of listeners.

   Mobile:  updates m-confirm-time, m-confirm-timelabel, icon, title, button.
   Desktop: updates d-order-time, d-order-timelabel, icon, title, button.
   Both:    a live status block is injected below the order ref.

   Status flow:
     pending   → ⏳ "Waiting for kitchen to accept…"
     accepted  → ✅ "Order accepted!" + ~X mins shown in time display
     preparing → 👨‍🍳 "Your order is being prepared"
     ready     → 🟢 "Ready to collect!" + button text changes + listener stops

   Firestore rules required (customer must be able to read their own order):
     match /orders/{orderId} {
       allow read: if request.auth != null
                   && resource.data.customerId == request.auth.uid;
       allow create: if request.auth != null;
     }

   If the listener fires a permission-denied error, check the rules above.
   Console will show: [Stalliq] Listener error: permission-denied
   ============================================================================ */

let orderStatusUnsubscribe = null;

// Status display config — icon, label, colour per status value
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

/**
 * Injects the mobile status block into m-order-confirm if not already present.
 * Inserted before m-confirm-details so it sits between the ref and order summary.
 */
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

/**
 * Injects the desktop status block into d-order-overlay if not already present.
 * Inserted after d-order-ref.
 */
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

/**
 * Renders the current status into a given status block element.
 * Shows wait time on 'accepted' only.
 */
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

/**
 * Starts a Firestore onSnapshot listener on the placed order document.
 * Updates status blocks and key UI elements live.
 * Called immediately after successful order submission.
 */
function startOrderStatusListener(orderId) {
  // Clean up any previous listener
  if (orderStatusUnsubscribe) {
    orderStatusUnsubscribe();
    orderStatusUnsubscribe = null;
  }

  // Inject status blocks and render initial pending state immediately
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

      // Update the injected status blocks
      renderStatusBlock('m-live-status', status, waitMins);
      renderStatusBlock('d-live-status', status, waitMins);

      // ── Accepted: update the big time display with actual kitchen wait time ──
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

      // ── Ready: celebrate, update modal, stop listening ────────────────────
      if (status === 'ready') {
        // Mobile
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

        // Desktop
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

        // Stop listener — no further updates needed
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

/**
 * Stops the order status listener and removes the injected status blocks.
 * Also resets the mobile modal and desktop overlay to their initial state
 * so they're clean for the next order in the same session.
 * Called on dismiss (mDismissOrder / dDismissOrder).
 */
function stopOrderStatusListener() {
  if (orderStatusUnsubscribe) {
    orderStatusUnsubscribe();
    orderStatusUnsubscribe = null;
  }

  // Remove injected status blocks
  const mEl = document.getElementById('m-live-status');
  if (mEl) mEl.remove();
  const dEl = document.getElementById('d-live-status');
  if (dEl) dEl.remove();

  // Reset mobile modal to initial state for next use
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

  // Reset desktop overlay to initial state for next use
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
   32. ACCOUNT PAGE — MEMBERS AREA
   ============================================================================
   Supports both mobile (prefix 'm') and desktop (prefix 'd') panels.
   buildAccountIds(prefix) maps the prefix to the correct element IDs.
   All render functions accept an ids object so both panels share the same logic.

   Listener architecture:
     accountOrderListeners — map keyed by orderId.
     Separate from the single orderStatusUnsubscribe in Section 31.
     Section 31 serves the confirmation modal only (ephemeral).
     Section 32 serves the account page/panel (persistent).

   Firestore query for orders:
     orders where customerId == uid, orderBy createdAt desc
     Requires composite index on (customerId, createdAt).
     Firestore surfaces a one-click creation link on first run — not a blocker.
   ============================================================================ */

// Map of active account-page order listeners: { orderId: unsubscribeFn }
const accountOrderListeners = {};

/**
 * Builds the element ID map for a given panel prefix ('m' or 'd').
 */
function buildAccountIds(prefix) {
  return {
    out:            `${prefix}-account-out`,
    in:             `${prefix}-account-in`,
    name:           `${prefix}-account-name`,
    currentSection: `${prefix}-current-orders-section`,
    currentList:    `${prefix}-current-orders-list`,
    stampsGrid:     `${prefix}-stamps-grid`,
    stampProgress:  `${prefix}-stamp-progress`,
    offersList:     `${prefix}-offers-list`,
    historyList:    `${prefix}-order-history-list`,
    historyEmpty:   `${prefix}-order-history-empty`,
  };
}

/**
 * Stops all account-page order listeners.
 * Called before reloading the page and on sign-out.
 */
function stopAllAccountListeners() {
  Object.keys(accountOrderListeners).forEach(id => {
    if (typeof accountOrderListeners[id] === 'function') {
      accountOrderListeners[id]();
    }
    delete accountOrderListeners[id];
  });
  console.log('[Stalliq] All account order listeners stopped.');
}

/**
 * Main entry point for the Account page/panel.
 * @param {string} prefix — 'm' for mobile page, 'd' for desktop panel
 * Called by mShowPage('account') and dToggleAccount().
 */
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

  // Welcome name
  const nameEl = document.getElementById(ids.name);
  if (nameEl) {
    nameEl.textContent = customerName ? `Hi, ${customerName}!` : 'Welcome back!';
  }

  // Static sections
  renderStampCard(3, 10, ids);
  renderAccountOffers(ids);

  // Orders — fresh load every visit
  loadUserOrders(user.uid, ids);
}

/**
 * Renders the loyalty stamp card.
 * @param {number} filled — stamps filled (3 for demo)
 * @param {number} total  — total stamps needed (10)
 * @param {object} ids    — element ID map from buildAccountIds()
 */
function renderStampCard(filled, total, ids) {
  const grid = document.getElementById(ids.stampsGrid);
  const prog = document.getElementById(ids.stampProgress);
  if (!grid) return;

  grid.innerHTML = Array.from({ length: total }, (_, i) => {
    const isFilled = i < filled;
    return `<div class="m-stamp-dot${isFilled ? ' filled' : ''}">${isFilled ? '🍕' : ''}</div>`;
  }).join('');

  if (prog) prog.textContent = `${filled} of ${total} stamps collected`;
}

/**
 * Renders static offer placeholder cards.
 * @param {object} ids — element ID map from buildAccountIds()
 */
function renderAccountOffers(ids) {
  const list = document.getElementById(ids.offersList);
  if (!list) return;
  list.innerHTML = `
    <div class="m-offer-card">
      <div class="m-offer-icon">🎉</div>
      <div class="m-offer-body">
        <div class="m-offer-title">Welcome Offer</div>
        <div class="m-offer-desc">10% off your next order — launching soon</div>
      </div>
      <div class="m-offer-badge">Coming soon</div>
    </div>
    <div class="m-offer-card">
      <div class="m-offer-icon">🍕</div>
      <div class="m-offer-body">
        <div class="m-offer-title">Buy 9, Get 1 Free</div>
        <div class="m-offer-desc">Collect 9 stamps to unlock your free pizza</div>
      </div>
      <div class="m-offer-badge">Coming soon</div>
    </div>`;
}

/**
 * Loads orders for the current user from Firestore.
 * - 90-day window (display concern, not storage — Cloud Function handles actual deletion later)
 * - Limit 50 per load
 * - Splits into live (active statuses) and history (collected/cancelled only)
 * - History shows 5 initially with "Show X more" button
 * - Requires composite index on (customerId, createdAt) — one-click creation on first run
 * @param {string} uid  — Firebase UID
 * @param {object} ids  — element ID map from buildAccountIds()
 */
function loadUserOrders(uid, ids) {
  stopAllAccountListeners();
  historyRemainder = [];

  const currentSection = document.getElementById(ids.currentSection);
  const currentList    = document.getElementById(ids.currentList);
  const historyList    = document.getElementById(ids.historyList);
  const historyEmpty   = document.getElementById(ids.historyEmpty);

  if (historyList) {
    historyList.innerHTML = `<div class="m-account-loading">Loading your orders…</div>`;
  }

  // 90-day cutoff — keeps display manageable; actual DB cleanup via Cloud Function later
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 90);

  db.collection('orders')
    .where('customerId', '==', uid)
    .where('createdAt', '>=', cutoff)
    .orderBy('createdAt', 'desc')
    .limit(50)
    .get()
    .then(snapshot => {
      const orders = [];
      snapshot.forEach(doc => {
        const order = { id: doc.id, ...doc.data() };
        orders.push(order);
        orderCache[order.id] = order;
      });

      const activeStatuses   = ['pending', 'accepted', 'preparing', 'ready'];
      const terminalStatuses = ['collected', 'cancelled'];
      const liveOrders       = orders.filter(o => activeStatuses.includes(o.status));
      const historyOrders    = orders.filter(o => terminalStatuses.includes(o.status));

      // ── Live orders ──────────────────────────────────────────────────────
      if (liveOrders.length > 0) {
        if (currentSection) currentSection.style.display = 'block';
        if (currentList) {
          currentList.innerHTML = '';
          liveOrders.forEach(order => {
            const wrapper = document.createElement('div');
            wrapper.id        = `m-coc-${order.id}`;
            wrapper.className = 'm-current-order-card';
            wrapper.setAttribute('onclick', `openOrderDetail('${order.id}')`);
            wrapper.innerHTML = buildCurrentOrderCardHTML(order);
            currentList.appendChild(wrapper);
            startAccountOrderListener(order.id);
          });
        }
      } else {
        if (currentSection) currentSection.style.display = 'none';
      }

      // ── Order history — collected/cancelled only ─────────────────────────
      if (historyOrders.length === 0) {
        if (historyList)  historyList.innerHTML = '';
        if (historyEmpty) historyEmpty.style.display = 'block';
      } else {
        if (historyEmpty) historyEmpty.style.display = 'none';

        const INITIAL_SHOW   = 3;
        const shownOrders    = historyOrders.slice(0, INITIAL_SHOW);
        historyRemainder     = historyOrders.slice(INITIAL_SHOW);

        let html = shownOrders.map(order => buildHistoryItemHTML(order)).join('');

        if (historyRemainder.length > 0) {
          const n = historyRemainder.length;
          html += `
            <div id="history-show-more-wrap" style="padding:4px 0 8px;">
              <button class="m-signout-btn" style="margin:0;width:100%;"
                onclick="showMoreHistory()">
                Show ${n} more order${n === 1 ? '' : 's'}
              </button>
            </div>`;
        }

        html += `<div style="text-align:center;padding:10px 0 4px;font-size:11px;color:rgba(255,255,255,0.45);letter-spacing:0.08em;text-transform:uppercase;">
                   Showing last 3 months
                 </div>`;

        if (historyList) historyList.innerHTML = html;
      }
    })
    .catch(err => {
      console.error('[Stalliq] Account orders load error:', err.code, err.message);
      if (err.code === 'failed-precondition') {
        console.warn('[Stalliq] Composite index required. Check Firestore console for a direct creation link.');
      }
      if (historyList) {
        historyList.innerHTML = `<div class="m-account-loading">Could not load orders — please try again.</div>`;
      }
    });
}

/**
 * Builds the inner HTML for a current-order card.
 * The status row has a predictable ID (m-coc-status-{orderId}) so the
 * live listener can update it in place.
 */
function buildCurrentOrderCardHTML(order) {
  const cfg          = ORDER_STATUS_CONFIG[order.status] || ORDER_STATUS_CONFIG.pending;
  const itemsSummary = order.items
    ? order.items.map(i => `${i.name} × ${i.quantity}`).join(', ')
    : '';
  const total   = order.orderTotal != null
    ? CONFIG.business.currency + Number(order.orderTotal).toFixed(2)
    : '';
  const waitLine = (order.status === 'accepted' && order.waitMins)
    ? `<div class="m-coc-wait">~${order.waitMins} mins estimated</div>`
    : '';

  return `
    <div class="m-coc-header">
      <div class="m-coc-ref">${order.orderRef || '—'}</div>
      <div class="m-coc-total">${total}</div>
    </div>
    <div class="m-coc-items">${itemsSummary}</div>
    <div class="m-coc-status" id="m-coc-status-${order.id}">
      <div class="m-coc-status-icon">${cfg.icon}</div>
      <div class="m-coc-status-body">
        <div class="m-coc-status-text">${cfg.label}</div>
        ${waitLine}
      </div>
    </div>`;
}

/**
 * Builds the HTML for a single order history row.
 */
function buildHistoryItemHTML(order) {
  let dateStr = '—';
  if (order.createdAt) {
    try {
      const d = order.createdAt.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
      dateStr = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch (_) { /* leave as '—' */ }
  }

  const itemsSummary = order.items
    ? order.items.map(i => `${i.name} × ${i.quantity}`).join(', ')
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
        <div class="m-history-ref">${order.orderRef || '—'}</div>
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
 * Reveals the remaining history orders hidden behind "Show more".
 * Reads from historyRemainder (populated by loadUserOrders).
 * Replaces the "Show more" button with the additional rows.
 */
function showMoreHistory() {
  const wrap = document.getElementById('history-show-more-wrap');
  if (!wrap || historyRemainder.length === 0) return;
  const html = historyRemainder.map(order => buildHistoryItemHTML(order)).join('');
  wrap.outerHTML = html;
  historyRemainder = [];
}

/**
 * Starts a Firestore onSnapshot listener on a single order for the account panel.
 * Updates the status row in place. Stops on terminal state.
 */
function startAccountOrderListener(orderId) {
  if (accountOrderListeners[orderId]) return;

  const docRef = db.collection('orders').doc(orderId);

  accountOrderListeners[orderId] = docRef.onSnapshot(
    snapshot => {
      if (!snapshot.exists) return;
      const data             = snapshot.data();
      const { status, waitMins } = data;

      // Keep cache fresh so detail overlay reflects current status
      if (orderCache[orderId]) {
        orderCache[orderId] = { ...orderCache[orderId], ...data };
      }

      const statusEl = document.getElementById(`m-coc-status-${orderId}`);
      if (statusEl) {
        const cfg      = ORDER_STATUS_CONFIG[status] || ORDER_STATUS_CONFIG.pending;
        const waitLine = (status === 'accepted' && waitMins)
          ? `<div class="m-coc-wait">~${waitMins} mins estimated</div>`
          : '';
        statusEl.innerHTML = `
          <div class="m-coc-status-icon">${cfg.icon}</div>
          <div class="m-coc-status-body">
            <div class="m-coc-status-text">${cfg.label}</div>
            ${waitLine}
          </div>`;
      }

      if (status === 'collected' || status === 'cancelled') {
        if (accountOrderListeners[orderId]) {
          accountOrderListeners[orderId]();
          delete accountOrderListeners[orderId];
        }
        const cardEl = document.getElementById(`m-coc-${orderId}`);
        if (cardEl) {
          cardEl.style.transition = 'opacity 0.4s';
          cardEl.style.opacity    = '0';
          setTimeout(() => {
            cardEl.remove();
            // Hide section if no cards remain in either panel
            ['m', 'd'].forEach(prefix => {
              const section = document.getElementById(`${prefix}-current-orders-section`);
              const list    = document.getElementById(`${prefix}-current-orders-list`);
              if (section && list && list.children.length === 0) {
                section.style.display = 'none';
              }
            });
          }, 400);
        }
        console.log(`[Stalliq] Account listener stopped for ${orderId} (${status}).`);
      }
    },
    err => {
      console.error(`[Stalliq] Account order listener error for ${orderId}:`, err.code);
    }
  );

  console.log(`[Stalliq] Account order listener started for ${orderId}.`);
}

/**
 * Sign In from mobile account page.
 * Sets pendingOrderFn to reload mobile account page after auth.
 */
function accountSignIn() {
  pendingOrderFn = () => loadAccountPage('m');
  document.getElementById('auth-title').textContent = 'Sign in to your account';
  document.getElementById('auth-sub-text').textContent = 'Enter your mobile number to sign in';
  authClearErrors();
  authShowOverlay('phone');
}

/**
 * Sign In from desktop account panel.
 * Sets pendingOrderFn to reload desktop account panel after auth.
 */
function dAccountSignIn() {
  pendingOrderFn = () => loadAccountPage('d');
  document.getElementById('auth-title').textContent = 'Sign in to your account';
  document.getElementById('auth-sub-text').textContent = 'Enter your mobile number to sign in';
  authClearErrors();
  authShowOverlay('phone');
}

/**
 * Signs the current user out.
 * @param {string} prefix — 'm' or 'd' — which panel triggered the sign-out
 */
function accountSignOut(prefix = 'm') {
  stopAllAccountListeners();
  auth.signOut()
    .then(() => {
      customerName = null;
      loadAccountPage(prefix);
    })
    .catch(err => {
      console.error('[Stalliq] Sign out error:', err);
    });
}


/* ============================================================================
   33. ORDER DETAIL OVERLAY
   Shared between mobile and desktop. Slide-up sheet on mobile,
   centred modal on desktop (CSS handles the difference).

   openOrderDetail(orderId) — looks up orderCache first, falls back to
   Firestore fetch if the order isn't cached (e.g. direct deep link).
   closeOrderDetail() — hides the overlay.
   ============================================================================ */

/**
 * Opens the order detail overlay for a given order.
 * @param {string} orderId — Firestore document ID
 */
function openOrderDetail(orderId) {
  const cached = orderCache[orderId];
  if (cached) {
    renderOrderDetail(cached);
  } else {
    // Fallback: fetch from Firestore
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

/**
 * Populates and shows the order detail overlay.
 * @param {object} order — order data object
 */
function renderOrderDetail(order) {
  // Ref
  const refEl = document.getElementById('od-ref');
  if (refEl) refEl.textContent = order.orderRef || '—';

  // Date
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

  // Status badge
  const badgeEl = document.getElementById('od-status-badge');
  if (badgeEl) {
    const statusLabel = order.status
      ? order.status.charAt(0).toUpperCase() + order.status.slice(1)
      : '';
    badgeEl.textContent  = statusLabel;
    badgeEl.className    = `order-detail-status-badge status-${order.status}`;
  }

  // Items
  const itemsEl = document.getElementById('od-items-list');
  if (itemsEl && order.items) {
    itemsEl.innerHTML = order.items.map(item => {
      const lineTotal = (item.price * item.quantity).toFixed(2);
      return `
        <div class="order-detail-item">
          <div>
            <span class="order-detail-item-name">${item.name}</span>
            <span class="order-detail-item-qty">× ${item.quantity}</span>
          </div>
          <div class="order-detail-item-price">${CONFIG.business.currency}${lineTotal}</div>
        </div>`;
    }).join('');
  }

  // Payment method
  const payEl = document.getElementById('od-payment');
  if (payEl) {
    const method = order.payment && order.payment.method === 'cash_on_collection'
      ? 'Cash on collection'
      : (order.payment && order.payment.method) || 'Cash on collection';
    payEl.textContent = method;
  }

  // Total
  const totalEl = document.getElementById('od-total');
  if (totalEl && order.orderTotal != null) {
    totalEl.textContent = CONFIG.business.currency + Number(order.orderTotal).toFixed(2);
  }

  // Reorder button — collected orders only
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

  // Show overlay
  document.getElementById('order-detail-overlay').classList.add('show');
}

/**
 * Closes the order detail overlay.
 */
function closeOrderDetail() {
  document.getElementById('order-detail-overlay').classList.remove('show');
}

/**
 * Populates the basket from a previous collected order and routes to checkout.
 * Items no longer on the menu are silently skipped.
 * On mobile: closes overlay, navigates to basket page.
 * On desktop: closes overlay + account panel, opens basket panel.
 * @param {string} orderId — Firestore document ID
 */
function reorderItems(orderId) {
  const order = orderCache[orderId];
  if (!order || !order.items) return;

  // Clear current basket
  Object.keys(basket).forEach(k => delete basket[k]);

  // Add items still available on the menu
  let added = 0;
  order.items.forEach(item => {
    const menuItem = CONFIG.menu.find(m => m.id === item.id && m.available !== false);
    if (menuItem) {
      basket[menuItem.id] = item.quantity;
      added++;
    }
  });

  refreshDesktopBasket();
  refreshMobileBadge();
  renderDesktopMenu();
  renderMobileMenu();

  closeOrderDetail();

  if (added === 0) {
    // All items have been removed from the menu — nothing to add
    // Show a gentle message rather than routing to an empty basket
    setTimeout(() => alert("Sorry — none of those items are currently available."), 200);
    return;
  }

  if (window.innerWidth < 768) {
    // Mobile: close account page, go to basket
    mShowPage('basket');
  } else {
    // Desktop: close account panel, open basket panel
    const acctPanel = document.getElementById('d-account-panel');
    if (acctPanel) acctPanel.classList.remove('open');
    const basketPanel = document.getElementById('d-basket-panel');
    if (basketPanel) basketPanel.classList.add('open');
  }

  console.log(`[Stalliq] Reorder: ${added} item type(s) added to basket from order ${orderId}.`);
}

