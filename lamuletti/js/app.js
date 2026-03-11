/**
 * La Muletti Pizza — App JavaScript
 * ============================================================================
 * Structure:
 *   1. Menu Data
 *   2. Shared State
 *   3. Utility Functions
 *   4. Desktop — Menu Rendering
 *   5. Desktop — Basket
 *   6. Desktop — Order Confirmation
 *   7. Desktop — Nav Scroll Effect
 *   8. Mobile — Page Navigation
 *   9. Mobile — Menu Rendering
 *  10. Mobile — Basket
 *  11. Mobile — Order Confirmation
 *  12. Scroll Reveal (IntersectionObserver)
 *  13. Init
 * ============================================================================
 */


/* ============================================================================
   1. MENU DATA
   Add, remove or edit pizzas here. All UI renders from this array.
   diet: "VE" = Vegan, "V" = Vegetarian, "🌶️" = Spicy, "" = none
   ============================================================================ */
const MENU = [
  {
    id: 1,
    name: 'Marinara',
    desc: 'Tomato base, garlic, oregano, olive oil with fresh basil',
    price: 8,
    diet: 'VE'
  },
  {
    id: 2,
    name: 'Margherita',
    desc: 'Tomato base, Parmesan, Fior di latte mozzarella, fresh basil and olive oil',
    price: 9,
    diet: 'V'
  },
  {
    id: 3,
    name: 'Prosciutto e Funghi',
    desc: 'Tomato base, Parmesan, Fior di latte mozzarella, prosciutto, mushrooms, fresh basil with olive oil',
    price: 10,
    diet: ''
  },
  {
    id: 4,
    name: 'Bella Pepperoni',
    desc: 'Tomato base, Parmesan, Fior di latte mozzarella, pepperoni, fresh basil with olive oil',
    price: 10,
    diet: ''
  },
  {
    id: 5,
    name: 'Capricciosa',
    desc: 'Tomato base, Parmesan, Fior di latte mozzarella, ham, mushrooms, würstel, artichokes, black olives, fresh basil and olive oil',
    price: 11,
    diet: ''
  },
  {
    id: 6,
    name: 'La Mamma Muletti',
    desc: 'Tomato base, Parmesan, Fior di latte mozzarella, fresh basil, salame di Napoli, nduja, red onions, hot honey',
    price: 12,
    diet: '🌶️'
  }
];


/* ============================================================================
   2. SHARED STATE
   basket is keyed by pizza id (number), value is quantity (number).
   Both desktop and mobile read/write the same object so they stay in sync.
   ============================================================================ */
const basket = {};

/** Running order counter — persists across the session for sequential ref numbers */
let orderCount = 0;


/* ============================================================================
   3. UTILITY FUNCTIONS
   ============================================================================ */

/**
 * Returns the total number of items across all basket entries.
 * @returns {number}
 */
function basketTotalQty() {
  return Object.values(basket).reduce((sum, qty) => sum + qty, 0);
}

/**
 * Returns the total cost of all basket items in pounds.
 * @returns {number}
 */
function basketTotalPrice() {
  return Object.keys(basket).reduce((sum, id) => {
    const item = MENU.find(m => m.id === Number(id));
    return sum + (item ? item.price * basket[id] : 0);
  }, 0);
}

/**
 * Adjusts qty for a given pizza id by delta, clamps to 0, removes if zero.
 * Triggers a full re-render of both desktop and mobile views.
 * @param {number} id    - pizza id
 * @param {number} delta - +1 or -1
 */
function updateBasket(id, delta) {
  id = Number(id);
  basket[id] = Math.max(0, (basket[id] || 0) + delta);
  if (basket[id] === 0) delete basket[id];

  // Keep all views in sync
  renderDesktopMenu();
  renderMobileMenu();
  refreshDesktopBasket();
  refreshMobileBadge();
}

/**
 * Generates a zero-padded order reference string, e.g. "#LM0012"
 * @returns {string}
 */
function generateOrderRef() {
  orderCount++;
  return 'LM' + String(orderCount).padStart(4, '0');
}

/**
 * Builds the HTML rows for an order summary (used in both desktop + mobile modals).
 * @param {string} rowClass - CSS class for each row element
 * @returns {{ rows: string, total: number }}
 */
function buildOrderSummaryHTML(rowClass) {
  let total = 0;
  let rows = '';

  Object.keys(basket).map(Number).forEach(id => {
    const item = MENU.find(m => m.id === id);
    const qty  = basket[id];
    const sub  = item.price * qty;
    total += sub;
    rows += `<div class="${rowClass}">
               <span>${item.name} × ${qty}</span>
               <strong>£${sub.toFixed(2)}</strong>
             </div>`;
  });

  // Total row
  rows += `<div class="${rowClass}" style="border-top:1px solid rgba(212,160,67,0.15);margin-top:8px;padding-top:8px;">
             <span>Total</span>
             <strong style="color:var(--gold)">£${total.toFixed(2)}</strong>
           </div>`;

  // Payment method
  rows += `<div class="${rowClass}">
             <span>Payment</span>
             <strong>💵 Cash / card on collection</strong>
           </div>`;

  return { rows, total };
}

/**
 * Clears all items from the basket and re-renders all views.
 */
function clearBasket() {
  Object.keys(basket).forEach(k => delete basket[k]);
  renderDesktopMenu();
  renderMobileMenu();
  refreshDesktopBasket();
  refreshMobileBadge();
}


/* ============================================================================
   4. DESKTOP — MENU RENDERING
   Generates pizza card HTML and injects into #d-menu-grid.
   Buttons use data-id / data-delta attributes caught by event delegation below.
   ============================================================================ */
function renderDesktopMenu() {
  const grid = document.getElementById('d-menu-grid');
  if (!grid) return;

  grid.innerHTML = MENU.map((item, i) => {
    const qty = basket[item.id] || 0;

    // Show qty controls only when item is in basket
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
          <div class="d-pizza-price">£${item.price.toFixed(2)}</div>
          <div style="display:flex;align-items:center;gap:8px;">
            ${item.diet ? `<div class="d-pizza-diet">${item.diet}</div>` : ''}
            ${controls}
          </div>
        </div>
      </div>`;
  }).join('');
}

/**
 * Event delegation for all desktop qty buttons (both menu cards and basket panel).
 * Catches clicks on any element with data-id + data-delta attributes.
 */
document.addEventListener('click', function (e) {
  const btn = e.target.closest('[data-id][data-delta]');
  if (btn) {
    e.preventDefault();
    e.stopPropagation();
    updateBasket(Number(btn.dataset.id), Number(btn.dataset.delta));
  }
});


/* ============================================================================
   5. DESKTOP — BASKET
   ============================================================================ */

/**
 * Re-renders the basket panel body + footer, and updates the floating button.
 */
function refreshDesktopBasket() {
  const ids   = Object.keys(basket).map(Number);
  const count = basketTotalQty();
  const total = basketTotalPrice();

  // Floating basket button — add/remove .show class (avoids inline style conflicts)
  const btn = document.getElementById('d-basket-btn');
  if (btn) btn.className = count > 0 ? 'd-basket-btn show' : 'd-basket-btn';

  const countEl = document.getElementById('d-basket-count');
  if (countEl) countEl.textContent = count;

  const body   = document.getElementById('d-basket-body');
  const footer = document.getElementById('d-basket-footer');
  if (!body || !footer) return;

  if (ids.length === 0) {
    body.innerHTML = `
      <div class="d-basket-panel-empty">
        <div>🍕</div>Your basket is empty.<br>Add pizzas from the menu above.
      </div>`;
    footer.style.display = 'none';
    return;
  }

  // Render basket line items (use data-id/data-delta so event delegation handles them)
  body.innerHTML = ids.map(id => {
    const item = MENU.find(m => m.id === id);
    const qty  = basket[id];
    return `
      <div class="d-bitem">
        <div class="d-bitem-name">${item.name}</div>
        <div class="d-bitem-controls">
          <button class="d-qty-btn"     data-id="${id}" data-delta="-1">−</button>
          <span   class="d-qty-num">${qty}</span>
          <button class="d-qty-btn add" data-id="${id}" data-delta="1">+</button>
        </div>
        <div class="d-bitem-price">£${(item.price * qty).toFixed(2)}</div>
      </div>`;
  }).join('');

  footer.style.display = 'block';
  const totalEl = document.getElementById('d-basket-total');
  if (totalEl) totalEl.textContent = '£' + total.toFixed(2);
}

/** Opens / closes the desktop basket slide-in panel. */
function dToggleBasket() {
  const panel = document.getElementById('d-basket-panel');
  if (panel) panel.classList.toggle('open');
}


/* ============================================================================
   6. DESKTOP — ORDER CONFIRMATION
   ============================================================================ */

/** Places the desktop order — populates the modal and clears the basket. */
function dPlaceOrder() {
  const ref = generateOrderRef();
  const { rows } = buildOrderSummaryHTML('d-order-row');

  document.getElementById('d-order-ref').textContent = 'Order ref #' + ref;
  document.getElementById('d-order-details').innerHTML = rows;
  document.getElementById('d-order-overlay').classList.add('show');
  document.getElementById('d-basket-panel').classList.remove('open');

  clearBasket();
}

/** Hides the desktop order confirmation modal. */
function dDismissOrder() {
  document.getElementById('d-order-overlay').classList.remove('show');
}


/* ============================================================================
   7. DESKTOP — NAV SCROLL EFFECT
   Adds .scrolled class to nav when page is scrolled past 60px.
   ============================================================================ */
window.addEventListener('scroll', () => {
  const nav = document.getElementById('d-nav');
  if (nav) nav.classList.toggle('scrolled', window.scrollY > 60);
});


/* ============================================================================
   8. MOBILE — PAGE NAVIGATION
   Switches between app pages by toggling .active class.
   ============================================================================ */

/**
 * Shows a named mobile page and activates its nav item.
 * @param {string} page - one of: 'home' | 'menu' | 'basket' | 'about' | 'findus'
 */
function mShowPage(page) {
  // Render basket on-demand when navigating to it
  if (page === 'basket') renderMobileBasket();

  // Deactivate all pages and nav items
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.m-nav-item').forEach(n => n.classList.remove('active'));

  // Activate target page and nav item
  const pageEl = document.getElementById('page-' + page);
  const navEl  = document.getElementById('m-nav-' + page);
  if (pageEl) { pageEl.classList.add('active'); pageEl.scrollTop = 0; }
  if (navEl)  navEl.classList.add('active');
}


/* ============================================================================
   9. MOBILE — MENU RENDERING
   Generates menu card HTML and injects into #m-menu-list.
   Uses inline onclick for mobile (no event delegation needed — simpler in PWA).
   ============================================================================ */
function renderMobileMenu() {
  const list = document.getElementById('m-menu-list');
  if (!list) return;

  list.innerHTML = MENU.map(item => {
    const qty = basket[item.id] || 0;

    const controls = qty > 0
      ? `<button class="qty-btn"     onclick="mQty(${item.id}, -1)">−</button>
         <span   class="qty-display">${qty}</span>
         <button class="qty-btn add" onclick="mQty(${item.id},  1)">+</button>`
      : `<button class="qty-btn add" onclick="mQty(${item.id},  1)">+</button>`;

    const dietTag = item.diet
      ? ` <span class="m-card-diet">${item.diet}</span>`
      : '';

    return `
      <div class="m-menu-card">
        <div class="m-card-info">
          <div class="m-card-name">${item.name}${dietTag}</div>
          <div class="m-card-desc">${item.desc}</div>
          <div class="m-card-price">£${item.price.toFixed(2)}</div>
        </div>
        <div class="m-card-controls">${controls}</div>
      </div>`;
  }).join('');
}

/**
 * Mobile quantity change handler.
 * @param {number} id    - pizza id
 * @param {number} delta - +1 or -1
 */
function mQty(id, delta) {
  updateBasket(id, delta);
}


/* ============================================================================
   10. MOBILE — BASKET
   ============================================================================ */

/** Updates the basket item-count badge on the nav bar. */
function refreshMobileBadge() {
  const count = basketTotalQty();
  const badge = document.getElementById('m-basket-badge');
  if (!badge) return;
  badge.textContent = count;
  badge.className = count > 0 ? 'm-basket-badge show' : 'm-basket-badge';
}

/** Re-renders the mobile basket page (called when navigating to basket tab). */
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
    const item = MENU.find(m => m.id === id);
    const qty  = basket[id];
    const sub  = item.price * qty;
    total += sub;
    return `
      <div class="m-basket-item">
        <div class="m-bi-name">${item.name}</div>
        <div class="m-bi-qty">× ${qty}</div>
        <div class="m-bi-price">£${sub.toFixed(2)}</div>
        <button class="m-bi-remove" onclick="mRemoveItem(${id})">×</button>
      </div>`;
  }).join('');

  const totalEl = document.getElementById('m-basket-total');
  if (totalEl) totalEl.textContent = '£' + total.toFixed(2);
}

/**
 * Removes an item entirely from the basket (mobile basket page).
 * @param {number} id - pizza id
 */
function mRemoveItem(id) {
  delete basket[Number(id)];
  refreshMobileBadge();
  refreshDesktopBasket();
  renderMobileBasket();
}


/* ============================================================================
   11. MOBILE — ORDER CONFIRMATION
   ============================================================================ */

/** Places the mobile order — populates confirm overlay and clears basket. */
function mPlaceOrder() {
  const ref = generateOrderRef();
  const { rows } = buildOrderSummaryHTML('m-confirm-row');

  document.getElementById('m-confirm-time').textContent  = '~15 mins';
  document.getElementById('m-confirm-ref').textContent   = 'Order ref #' + ref;
  document.getElementById('m-confirm-details').innerHTML = rows;
  document.getElementById('m-order-confirm').classList.add('show');

  clearBasket();
}

/** Hides the mobile order confirmation and returns to the home page. */
function mDismissOrder() {
  document.getElementById('m-order-confirm').classList.remove('show');
  mShowPage('home');
}


/* ============================================================================
   12. SCROLL REVEAL
   Uses IntersectionObserver to animate .reveal elements into view as they
   enter the viewport. Runs only once per element then stops observing.
   ============================================================================ */
function initScrollReveal() {
  const elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);   // fire once only
      }
    });
  }, { threshold: 0.12 });

  elements.forEach(el => observer.observe(el));
}


/* ============================================================================
   13. INIT
   Runs once the DOM is ready.
   ============================================================================ */
document.addEventListener('DOMContentLoaded', function () {
  renderDesktopMenu();  // Populate desktop menu grid
  renderMobileMenu();   // Populate mobile menu list
  initScrollReveal();   // Wire up scroll animations
});
