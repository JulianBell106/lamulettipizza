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


/* ============================================================================
   12. DESKTOP — ORDER CONFIRMATION
   Now routes through authGateway → Firestore submission.
   ============================================================================ */
function dPlaceOrder() {
  authGateway(async () => {
    const btn = document.querySelector('#d-basket-footer .d-btn-primary');
    if (btn) { btn.textContent = 'Placing order...'; btn.disabled = true; }
    try {
      const orderRef = await submitOrderToFirestore();
      const { rows } = buildOrderSummaryHTML('d-order-row');
      document.getElementById('d-order-ref').textContent   = 'Order ref ' + orderRef;
      document.getElementById('d-order-details').innerHTML = rows;
      document.getElementById('d-order-overlay').classList.add('show');
      document.getElementById('d-basket-panel').classList.remove('open');
      clearBasket();
    } catch (err) {
      console.error('Order error:', err);
      // Show error in basket footer
      const errEl = document.getElementById('d-order-err');
      if (errEl) errEl.textContent = 'Could not place order. Please try again.';
    } finally {
      if (btn) { btn.textContent = 'Place Order'; btn.disabled = false; }
    }
  });
}

function dDismissOrder() {
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
  if (page === 'basket') renderMobileBasket();
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
   Now routes through authGateway → Firestore submission.
   ============================================================================ */
function mPlaceOrder() {
  authGateway(async () => {
    const btn = document.querySelector('#page-basket .m-btn');
    if (btn) { btn.textContent = 'Placing order...'; btn.disabled = true; }
    // Clear any previous error
    const errEl = document.getElementById('m-order-err');
    if (errEl) errEl.textContent = '';
    try {
      const orderRef = await submitOrderToFirestore();
      const { rows } = buildOrderSummaryHTML('m-confirm-row');
      document.getElementById('m-confirm-time').textContent  = `~${CONFIG.ordering.waitMins} mins`;
      document.getElementById('m-confirm-ref').textContent   = 'Order ref ' + orderRef;
      document.getElementById('m-confirm-details').innerHTML = rows;
      document.getElementById('m-confirm-msg').textContent   = CONFIG.ordering.confirmMsg;
      document.getElementById('m-order-confirm').classList.add('show');
      clearBasket();
    } catch (err) {
      console.error('Order error:', err);
      if (errEl) errEl.textContent = 'Could not place order. Please try again.';
    } finally {
      if (btn) { btn.textContent = 'Place Order'; btn.disabled = false; }
    }
  });
}

function mDismissOrder() {
  document.getElementById('m-order-confirm').classList.remove('show');
  mShowPage('home');
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
  // Auto-focus the first input
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
  const user = auth.currentUser;

  if (user) {
    // Already authenticated this session
    if (customerName) {
      // Name cached — submit directly
      orderFn();
    } else {
      // Need to check Firestore for their name
      db.collection('users').doc(user.uid).get()
        .then(doc => {
          if (doc.exists && doc.data().firstName) {
            customerName = doc.data().firstName;
            orderFn();
          } else {
            // Authenticated but no name stored yet
            authClearErrors();
            authShowOverlay('name');
          }
        })
        .catch(() => authShowOverlay('name'));
    }
  } else {
    // Not authenticated — start phone flow
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

  // Basic UK mobile validation: starts with 7, 10 digits total
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
    // Update the sub-text on the code screen
    document.getElementById('auth-code-msg').textContent =
      `We sent a 6-digit code to +44 ${raw}`;
    authShowScreen('code');
    setTimeout(() => document.getElementById('auth-code-input').focus(), 150);
  } catch (err) {
    console.error('SMS send error:', err);
    authSetError('phone', 'Could not send code. Check the number and try again.');
    // Reset reCAPTCHA so user can retry
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

    // Check if we already have their name
    const userDoc = await db.collection('users').doc(user.uid).get();
    if (userDoc.exists && userDoc.data().firstName) {
      customerName = userDoc.data().firstName;
      document.getElementById('auth-overlay').classList.remove('show');
      if (pendingOrderFn) pendingOrderFn();
    } else {
      // First order — ask for their name
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
  const today      = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
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

  await db.collection('orders').add(orderDoc);
  return orderRef;
}
