/**
 * kitchen.js — La Muletti Pizza Kitchen Dashboard
 * ============================================================================
 * Sections:
 *   1.  State
 *   2.  Theme + page identity
 *   3.  Clock
 *   4.  PIN screen
 *   5.  Kitchen status
 *   5a. Location broadcast (Session 14)
 *   6.  Firestore orders listener
 *   7.  Render orders
 *   8.  Order card HTML
 *   9.  Wait time modal
 *   10. Accept order
 *   11. Status progression
 *   12. Ready confirm modal + Order detail modal
 *   13. Elapsed time + sound alert
 *   14. Kanban drag scroll
 *   15. Dashboard start + init
 *   16. Walk-in order modal
 * ============================================================================
 */


/* ============================================================================
   1. STATE
   ============================================================================ */
let kitchenStatus     = 'open';
let currentOrders     = {};       // { orderId: orderObject }
let pendingAcceptId   = null;     // orderId waiting for wait time selection
let pendingReadyId    = null;     // orderId waiting for ready confirmation
let selectedWaitMins  = null;     // chosen wait time value
let elapsedTimers     = {};       // setInterval handles keyed by orderId
let ordersUnsubscribe = null;

// Location broadcast state (Session 14)
let broadcastActive     = false;
let broadcastIntervalId = null;

// Walk-in modal state
let walkinQty   = {};  // { menuItemId: qty }
let walkinNotes = {};  // { menuItemId: noteText } — Session 13

// Multi-staff PIN state (Session 15)
let loggedInStaffId   = null;  // Firestore doc ID of the logged-in staff member
let loggedInStaffName = null;  // Display name of the logged-in staff member
let failedPinAttempts = 0;     // Failed attempts this session (persisted in sessionStorage)
let pinLockedUntil    = null;  // Timestamp (ms) — null if not locked
let pinLockTimer      = null;  // setInterval handle for lockout countdown display

// Staff management state (Session 15)
let staffConfirmEntry = '';    // PIN entry on settings re-auth screen
let editingStaffId    = null;  // Staff doc ID currently being edited


/* ============================================================================
   2. THEME + PAGE IDENTITY
   ============================================================================ */
function applyKitchenTheme() {
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

function initPageIdentity() {
  document.title = `Kitchen · ${CONFIG.business.nameShort}`;

  ['pin-logo', 'k-logo'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const parts = CONFIG.business.nameShort.split(' ');
    const last  = parts.pop();
    el.innerHTML = `${parts.join(' ')} <span>${last}</span>`;
  });
}


/* ============================================================================
   3. CLOCK
   ============================================================================ */
function startClock() {
  function tick() {
    const now = new Date();
    const h   = String(now.getHours()).padStart(2, '0');
    const m   = String(now.getMinutes()).padStart(2, '0');
    const el  = document.getElementById('k-time');
    if (el) el.textContent = `${h}:${m}`;
  }
  tick();
  setInterval(tick, 10000);
}


/* ============================================================================
   4. PIN SCREEN
   ============================================================================ */
let pinEntry = '';

function pinPress(digit) {
  if (pinEntry.length >= 6) return;
  pinEntry += digit;
  renderPinDots();
  if (pinEntry.length === 6) setTimeout(checkPinMultiStaff, 120);
}

function pinBackspace() {
  pinEntry = pinEntry.slice(0, -1);
  renderPinDots();
  document.getElementById('pin-error').textContent = '';
}

function renderPinDots() {
  for (let i = 0; i < 6; i++) {
    const dot = document.getElementById(`pin-dot-${i}`);
    if (dot) dot.classList.toggle('filled', i < pinEntry.length);
  }
}

/** Hashes a PIN string using SHA-256. Returns a lowercase hex string. */
async function hashPin(pin) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pin));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

/** Shows a message in the main PIN error element. */
function showPinError(msg) {
  const el = document.getElementById('pin-error');
  if (el) el.textContent = msg;
}

/** Triggers the shake animation on the main PIN dots. */
function shakePinDots() {
  const dots = document.querySelector('.pin-dots');
  if (!dots) return;
  dots.classList.remove('shake');
  void dots.offsetWidth;
  dots.classList.add('shake');
}

/** Starts a 15-minute lockout countdown shown in the PIN error element. */
function startLockoutCountdown() {
  if (pinLockTimer) clearInterval(pinLockTimer);
  const keypad = document.querySelector('.pin-keypad');
  if (keypad) keypad.style.opacity = '0.3';

  function tick() {
    if (!pinLockedUntil) { clearInterval(pinLockTimer); return; }
    const remaining = Math.max(0, Math.ceil((pinLockedUntil - Date.now()) / 1000));
    if (remaining === 0) {
      clearInterval(pinLockTimer);
      pinLockedUntil    = null;
      failedPinAttempts = 0;
      sessionStorage.removeItem('pinFailCount');
      sessionStorage.removeItem('pinLockUntil');
      showPinError('');
      if (keypad) keypad.style.opacity = '';
      return;
    }
    const mins = Math.floor(remaining / 60);
    const secs = String(remaining % 60).padStart(2, '0');
    showPinError(`Too many attempts — locked for ${mins}:${secs}`);
  }
  tick();
  pinLockTimer = setInterval(tick, 1000);
}

/**
 * Multi-staff PIN check (Session 15).
 * Hashes the entered PIN and queries the Firestore staff collection for a match.
 * Replaces the old single-PIN checkPin().
 */
async function checkPinMultiStaff() {
  // Respect lockout
  if (pinLockedUntil && Date.now() < pinLockedUntil) {
    showPinError('Too many attempts — please wait for the timer to clear.');
    pinEntry = '';
    renderPinDots();
    return;
  }

  const hash = await hashPin(pinEntry);
  pinEntry = '';
  renderPinDots();

  try {
    const snapshot = await db.collection('vendors').doc(CONFIG.vendor.id)
      .collection('staff')
      .where('active', '==', true)
      .get();

    let match = null;
    snapshot.forEach(doc => {
      if (doc.data().pinHash === hash) match = { id: doc.id, ...doc.data() };
    });

    if (match) {
      // ✅ Correct PIN — grant access
      failedPinAttempts = 0;
      pinLockedUntil    = null;
      sessionStorage.removeItem('pinFailCount');
      sessionStorage.removeItem('pinLockUntil');
      loggedInStaffId   = match.id;
      loggedInStaffName = match.name;

      document.getElementById('pin-overlay').classList.add('hidden');
      const dashboard = document.getElementById('k-dashboard');
      if (dashboard) dashboard.style.display = 'flex';
      startDashboard();
      showToast(`Welcome, ${match.name}!`);
    } else {
      // ❌ Wrong PIN
      failedPinAttempts++;
      sessionStorage.setItem('pinFailCount', String(failedPinAttempts));

      if (failedPinAttempts >= 5) {
        pinLockedUntil = Date.now() + 15 * 60 * 1000;
        sessionStorage.setItem('pinLockUntil', String(pinLockedUntil));
        startLockoutCountdown();
      } else {
        const left = 5 - failedPinAttempts;
        showPinError(`Incorrect PIN — ${left} attempt${left === 1 ? '' : 's'} remaining`);
      }
      shakePinDots();
    }
  } catch (err) {
    console.error('[Stalliq] PIN check error:', err);
    showPinError('Connection error — please try again');
    shakePinDots();
  }
}


/* ============================================================================
   5. KITCHEN STATUS
   ============================================================================ */
function listenKitchenStatus() {
  db.collection('vendors').doc(CONFIG.vendor.id)
    .onSnapshot(doc => {
      kitchenStatus = (doc.exists && doc.data().kitchenStatus) || 'open';
      renderKitchenStatusBtn();
    }, err => console.error('[Stalliq] Kitchen status listener:', err));
}

function renderKitchenStatusBtn() {
  const btn = document.getElementById('k-status-btn');
  if (!btn) return;
  const map = {
    open:         { label: '🟢 Open',       cls: 'open'   },
    closed_busy:  { label: '🟡 Busy',        cls: 'closed' },
    closed_end:   { label: '🔴 Closing',      cls: 'closed' },
    closed_today: { label: '⚫ Not Trading',  cls: 'closed' },
  };
  const s = map[kitchenStatus] || map.open;
  btn.textContent = s.label;
  btn.className   = `k-status-btn ${s.cls}`;
}

async function setKitchenStatus(status) {
  try {
    await db.collection('vendors').doc(CONFIG.vendor.id)
      .set({ kitchenStatus: status }, { merge: true });
  } catch (err) {
    console.error('[Stalliq] Set kitchen status error:', err);
  }
  closeKitchenModal();
}

function openKitchenModal()  { document.getElementById('kitchen-modal').classList.add('show'); }
function closeKitchenModal() { document.getElementById('kitchen-modal').classList.remove('show'); }


/* ============================================================================
   5a. LOCATION BROADCAST (Session 14)
   ============================================================================
   Kitchen toggle — van GPS pushed to Firestore every 10 minutes when active.
   State persisted in Firestore so it survives page reloads on the kitchen
   tablet. listenBroadcastState() keeps the button in sync if another device
   changes the state.

   Firestore path: vendors/{vendorId}/location/current
     active:    boolean
     lat:       number
     lng:       number
     accuracy:  number  (metres, from Geolocation API)
     updatedAt: timestamp

   iOS caveat: iOS Safari kills background JS when the screen sleeps.
   Use a dedicated Android device in the van for production.
   ============================================================================ */

const BROADCAST_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

/** Syncs the broadcast toggle button label and colour with broadcastActive. */
function renderBroadcastBtn() {
  const btn = document.getElementById('k-broadcast-btn');
  if (!btn) return;
  if (broadcastActive) {
    btn.textContent = '📍 Live: ON';
    btn.className   = 'k-broadcast-btn active';
  } else {
    btn.textContent = '📍 Broadcast';
    btn.className   = 'k-broadcast-btn';
  }
}

/**
 * Real-time listener on vendors/{vendorId}/location/current.
 * Keeps broadcastActive in sync and manages the ping interval automatically
 * if another device toggles the broadcast state.
 */
function listenBroadcastState() {
  const locRef = db.collection('vendors').doc(CONFIG.vendor.id)
                   .collection('location').doc('current');

  locRef.onSnapshot(snap => {
    const data      = snap.exists ? snap.data() : null;
    broadcastActive = !!(data && data.active);
    renderBroadcastBtn();

    if (broadcastActive && !broadcastIntervalId) {
      _startLocationPing();
    } else if (!broadcastActive && broadcastIntervalId) {
      clearInterval(broadcastIntervalId);
      broadcastIntervalId = null;
    }
  }, err => console.error('[Stalliq] Broadcast state listener:', err));
}

/** Broadcast button tap handler — toggles on or off. */
async function toggleBroadcast() {
  if (broadcastActive) {
    await stopLocationBroadcast();
  } else {
    await startLocationBroadcast();
  }
}

/**
 * Turns broadcast on:
 *   1. Checks geolocation availability
 *   2. Pushes current position immediately (sets active:true in Firestore)
 *   3. Starts 10-minute repeating ping interval
 */
async function startLocationBroadcast() {
  if (!navigator.geolocation) {
    alert('Location is not available on this device.');
    return;
  }
  await pushLocation();    // immediate first push
  _startLocationPing();   // then every 10 mins
}

/** Internal: creates/resets the repeating ping setInterval. */
function _startLocationPing() {
  if (broadcastIntervalId) clearInterval(broadcastIntervalId);
  broadcastIntervalId = setInterval(pushLocation, BROADCAST_INTERVAL_MS);
  console.log('[Stalliq] Location ping interval started (10-min cadence).');
}

/**
 * Gets the device's current GPS position and writes it to Firestore.
 * Returns a Promise that resolves when the write completes (or on any error).
 */
function pushLocation() {
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          await db.collection('vendors').doc(CONFIG.vendor.id)
                  .collection('location').doc('current')
                  .set({
                    active:    true,
                    lat:       pos.coords.latitude,
                    lng:       pos.coords.longitude,
                    accuracy:  pos.coords.accuracy,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                  });
          console.log(
            `[Stalliq] Location pushed: ` +
            `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)} ` +
            `(±${Math.round(pos.coords.accuracy)}m)`
          );
        } catch (err) {
          console.error('[Stalliq] Location push error:', err);
        }
        resolve();
      },
      (err) => {
        console.error('[Stalliq] Geolocation error:', err.message);
        resolve(); // don't block on GPS failure — just log
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  });
}

/**
 * Turns broadcast off:
 *   1. Clears the ping interval
 *   2. Writes active:false to Firestore so the customer app removes the map
 */
async function stopLocationBroadcast() {
  if (broadcastIntervalId) {
    clearInterval(broadcastIntervalId);
    broadcastIntervalId = null;
    console.log('[Stalliq] Location ping interval stopped.');
  }
  try {
    await db.collection('vendors').doc(CONFIG.vendor.id)
            .collection('location').doc('current')
            .set({ active: false }, { merge: true });
    console.log('[Stalliq] Broadcast set inactive in Firestore.');
  } catch (err) {
    console.error('[Stalliq] Stop broadcast error:', err);
  }
}


/* ============================================================================
   6. FIRESTORE ORDERS LISTENER
   ============================================================================ */
function listenOrders() {
  if (ordersUnsubscribe) ordersUnsubscribe();

  const q = db.collection('orders')
    .where('vendorId', '==', CONFIG.vendor.id)
    .where('status', 'in', ['pending', 'accepted', 'preparing', 'ready']);

  ordersUnsubscribe = q.onSnapshot(snapshot => {
    const incoming = {};
    snapshot.forEach(doc => {
      incoming[doc.id] = { id: doc.id, ...doc.data() };
    });

    // Sound on new pending order
    Object.keys(incoming).forEach(id => {
      if (!currentOrders[id] && incoming[id].status === 'pending') {
        playOrderAlert();
      }
    });

    currentOrders = incoming;
    renderOrders();
  }, err => console.error('[Stalliq] Orders listener:', err));
}


/* ============================================================================
   7. RENDER ORDERS — KANBAN
   ============================================================================ */
function renderOrders() {
  const container = document.getElementById('k-orders');
  if (!container) return;

  const orders = Object.values(currentOrders);

  const active  = orders.filter(o => o.status !== 'ready').length;
  const countEl = document.getElementById('k-queue-count');
  if (countEl) countEl.textContent = active > 0 ? `${active} active` : '';

  clearElapsedTimers();

  if (orders.length === 0) {
    container.classList.add('is-empty');
    container.innerHTML = `
      <div class="k-empty">
        <div class="k-empty-icon">🍕</div>
        <div class="k-empty-text">No active orders — standing by</div>
      </div>`;
    return;
  }

  container.classList.remove('is-empty');

  const statuses = ['pending', 'accepted', 'preparing', 'ready'];
  const labels   = { pending: 'Pending', accepted: 'Accepted', preparing: 'Preparing', ready: 'Ready' };

  container.innerHTML = statuses.map(status => {
    const colOrders = orders
      .filter(o => o.status === status)
      .sort((a, b) => {
        const aTime = a.createdAt?.toDate?.()?.getTime() || 0;
        const bTime = b.createdAt?.toDate?.()?.getTime() || 0;
        return aTime - bTime;
      });

    const cardsHTML = colOrders.length > 0
      ? colOrders.map(o => orderCardHTML(o)).join('')
      : `<div class="k-col-empty">No orders</div>`;

    return `
      <div class="k-col k-col-${status}">
        <div class="k-col-header">
          <span class="k-col-title">${labels[status]}</span>
          <span class="k-col-count">${colOrders.length}</span>
        </div>
        <div class="k-col-cards">${cardsHTML}</div>
      </div>`;
  }).join('');

  orders.forEach(order => {
    if (order.status !== 'ready') startElapsedTimer(order.id);
  });
}


/* ============================================================================
   8. ORDER CARD HTML
   Session 13: notes shown on kanban card per item where present.
   ============================================================================ */
function orderCardHTML(order) {
  const currency    = CONFIG.business.currency    || '£';
  const paymentNote = CONFIG.ordering.paymentNote || 'Cash on collection';

  const statusLabels = {
    pending:   'Awaiting Acceptance',
    accepted:  'Accepted',
    preparing: 'In Progress',
    ready:     'Ready to Collect',
  };

  const itemsHTML = (order.items || []).map(item => {
    const noteEl = item.notes
      ? `<li class="k-card-item-note">📝 ${item.notes}</li>`
      : '';
    return `
      <li class="k-card-item">
        <span>${item.name}</span>
        <span class="k-card-item-qty">× ${item.quantity}</span>
      </li>
      ${noteEl}`;
  }).join('');

  const waitLabel = order.waitMins ? `${order.waitMins} min wait` : '';

  const sourceBadge = order.source === 'walkin'
    ? `<span class="k-card-source-badge">Walk-in</span>`
    : '';

  let actionBtn = '';
  switch (order.status) {
    case 'pending':
      actionBtn = `<button class="k-btn k-btn-accept" onclick="openWaitModal('${order.id}')">Accept Order →</button>`;
      break;
    case 'accepted':
      actionBtn = `<button class="k-btn k-btn-preparing" onclick="advanceStatus('${order.id}', 'preparing')">Start Preparing →</button>`;
      break;
    case 'preparing':
      actionBtn = `<button class="k-btn k-btn-ready" onclick="openReadyModal('${order.id}')">Mark Ready ✓</button>`;
      break;
    case 'ready':
      actionBtn = `<button class="k-btn k-btn-collected" onclick="markCollected('${order.id}')">Collected ✓</button>`;
      break;
  }

  return `
    <div class="k-card status-${order.status}" id="k-card-${order.id}">
      <div class="k-card-header">
        <div class="k-card-ref">${order.orderRef || '—'}${sourceBadge}</div>
        <div class="k-card-meta">
          <div class="k-card-name">${order.customerName || 'Customer'}</div>
          <div class="k-card-elapsed" id="elapsed-${order.id}">0:00</div>
        </div>
      </div>
      <div class="k-card-body k-card-tappable" onclick="openDetailModal('${order.id}')">
        <ul class="k-card-items">${itemsHTML}</ul>
        <div class="k-card-total">${currency}${(order.orderTotal || 0).toFixed(2)} · ${paymentNote}</div>
        <div class="k-card-drill-hint">Tap for full details</div>
      </div>
      <div class="k-card-status-bar">
        <span class="k-card-status-badge">${statusLabels[order.status] || order.status}</span>
        <span class="k-card-wait">${waitLabel}</span>
      </div>
      <div class="k-card-footer">${actionBtn}</div>
    </div>`;
}


/* ============================================================================
   9. WAIT TIME MODAL
   ============================================================================ */
function openWaitModal(orderId) {
  pendingAcceptId  = orderId;
  selectedWaitMins = null;

  const order = currentOrders[orderId];
  const refEl = document.getElementById('wait-modal-ref');
  if (refEl) refEl.textContent = order ? order.orderRef : '';

  const opts   = CONFIG.ordering.waitOptions || [10, 15, 20, 25];
  const optsEl = document.getElementById('wait-options');
  if (optsEl) {
    optsEl.innerHTML = opts.map(mins =>
      `<button class="k-wait-opt" onclick="selectWait(${mins}, this)">
         ${mins}<span>mins</span>
       </button>`
    ).join('');
  }

  const customRow   = document.getElementById('custom-wait-row');
  const customInput = document.getElementById('custom-wait-input');
  if (customRow)   customRow.style.display  = CONFIG.ordering.allowCustomWait !== false ? 'flex' : 'none';
  if (customInput) customInput.value = '';

  const confirmBtn = document.getElementById('wait-confirm-btn');
  if (confirmBtn) { confirmBtn.textContent = 'Accept Order →'; confirmBtn.disabled = false; }

  document.getElementById('wait-modal').classList.add('show');
}

function selectWait(mins, btn) {
  selectedWaitMins = mins;
  const customInput = document.getElementById('custom-wait-input');
  if (customInput) customInput.value = '';
  document.querySelectorAll('.k-wait-opt').forEach(b => b.classList.remove('selected'));
  if (btn) btn.classList.add('selected');
}

function closeWaitModal() {
  document.getElementById('wait-modal').classList.remove('show');
  pendingAcceptId  = null;
  selectedWaitMins = null;
}


/* ============================================================================
   10. ACCEPT ORDER
   ============================================================================ */
async function confirmAccept() {
  const customInput = document.getElementById('custom-wait-input');
  if (customInput && customInput.value) {
    const val = parseInt(customInput.value, 10);
    if (val > 0 && val <= 240) selectedWaitMins = val;
  }

  if (!selectedWaitMins) {
    const optsEl = document.getElementById('wait-options');
    if (optsEl) {
      optsEl.style.outline      = '2px solid var(--fire)';
      optsEl.style.borderRadius = '8px';
      setTimeout(() => { optsEl.style.outline = ''; }, 700);
    }
    return;
  }

  const btn = document.getElementById('wait-confirm-btn');
  if (btn) { btn.textContent = 'Accepting…'; btn.disabled = true; }

  try {
    await db.collection('orders').doc(pendingAcceptId).update({
      status:    'accepted',
      waitMins:  selectedWaitMins,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    closeWaitModal();
  } catch (err) {
    console.error('[Stalliq] Accept order error:', err);
    if (btn) { btn.textContent = 'Error — try again'; btn.disabled = false; }
  }
}


/* ============================================================================
   11. STATUS PROGRESSION
   ============================================================================ */
async function advanceStatus(orderId, newStatus) {
  try {
    await db.collection('orders').doc(orderId).update({
      status:    newStatus,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
  } catch (err) {
    console.error('[Stalliq] Advance status error:', err);
  }
}

async function markCollected(orderId) {
  try {
    await db.collection('orders').doc(orderId).update({
      status:    'collected',
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
  } catch (err) {
    console.error('[Stalliq] Mark collected error:', err);
  }
}


/* ============================================================================
   12. READY CONFIRM MODAL + ORDER DETAIL MODAL
   Session 13: detail modal renders per-item notes.
   ============================================================================ */

function openReadyModal(orderId) {
  pendingReadyId = orderId;
  const order = currentOrders[orderId];
  const refEl = document.getElementById('ready-modal-ref');
  if (refEl) refEl.textContent = order ? order.orderRef : '';
  document.getElementById('ready-modal').classList.add('show');
}

function closeReadyModal() {
  document.getElementById('ready-modal').classList.remove('show');
  pendingReadyId = null;
}

async function confirmReady() {
  if (!pendingReadyId) return;
  const btn = document.querySelector('#ready-modal .k-modal-btn.primary');
  if (btn) { btn.textContent = 'Updating…'; btn.disabled = true; }
  try {
    await advanceStatus(pendingReadyId, 'ready');
    closeReadyModal();
  } catch (err) {
    console.error('[Stalliq] Confirm ready error:', err);
    if (btn) { btn.textContent = 'Error — try again'; btn.disabled = false; }
  } finally {
    if (btn) { btn.textContent = 'Mark as Ready ✓'; btn.disabled = false; }
  }
}

function openDetailModal(orderId) {
  const order = currentOrders[orderId];
  if (!order) return;

  const currency    = CONFIG.business.currency    || '£';
  const paymentNote = CONFIG.ordering.paymentNote || 'Cash on collection';

  const statusLabels = {
    pending:   'Awaiting Acceptance',
    accepted:  'Accepted',
    preparing: 'In Progress',
    ready:     'Ready to Collect',
    collected: 'Collected',
  };

  const placed  = order.createdAt?.toDate?.();
  const timeStr = placed
    ? placed.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    : '—';
  const dateStr = placed
    ? placed.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
    : '';

  const phone   = order.customerPhone || null;
  const phoneEl = phone
    ? `<a href="tel:${phone}" class="k-detail-phone">${phone} 📞</a>`
    : `<span class="k-detail-phone muted">No phone on record</span>`;

  const itemsHTML = (order.items || []).map(item => {
    const noteEl = item.notes
      ? `<div class="k-detail-item-note">📝 ${item.notes}</div>`
      : '';
    return `
      <div class="k-detail-item">
        <div>
          <span class="k-detail-item-name">${item.name}</span>
          ${noteEl}
        </div>
        <span class="k-detail-item-qty">× ${item.quantity}</span>
        <span class="k-detail-item-price">${currency}${(item.price * item.quantity).toFixed(2)}</span>
      </div>`;
  }).join('');

  const waitEl = order.waitMins
    ? `<div class="k-detail-row"><span>Wait set</span><strong>${order.waitMins} mins</strong></div>`
    : '';

  const sourceEl = order.source === 'walkin'
    ? `<div class="k-detail-row"><span>Source</span><strong>Walk-in</strong></div>`
    : '';

  document.getElementById('detail-modal-body').innerHTML = `
    <div class="k-detail-header">
      <div class="k-detail-ref status-${order.status}">${order.orderRef || '—'}</div>
      <div class="k-detail-status status-${order.status}">${statusLabels[order.status] || order.status}</div>
    </div>

    <div class="k-detail-section">
      <div class="k-detail-label">Customer</div>
      <div class="k-detail-value">${order.customerName || '—'}</div>
      <div class="k-detail-value">${phoneEl}</div>
    </div>

    <div class="k-detail-section">
      <div class="k-detail-label">Order placed</div>
      <div class="k-detail-value">${timeStr}${dateStr ? ' · ' + dateStr : ''}</div>
    </div>

    <div class="k-detail-section">
      <div class="k-detail-label">Items</div>
      <div class="k-detail-items">${itemsHTML}</div>
    </div>

    <div class="k-detail-section k-detail-totals">
      <div class="k-detail-row"><span>Order total</span><strong>${currency}${(order.orderTotal || 0).toFixed(2)}</strong></div>
      <div class="k-detail-row"><span>Payment</span><strong>${paymentNote}</strong></div>
      ${waitEl}
      ${sourceEl}
    </div>`;

  document.getElementById('detail-modal').classList.add('show');
}

function closeDetailModal() {
  document.getElementById('detail-modal').classList.remove('show');
}


/* ============================================================================
   13. ELAPSED TIME + SOUND ALERT
   ============================================================================ */
function startElapsedTimer(orderId) {
  const order = currentOrders[orderId];
  if (!order || !order.createdAt) return;

  const created = order.createdAt?.toDate?.() || new Date();

  function tick() {
    const el = document.getElementById(`elapsed-${orderId}`);
    if (!el) { clearInterval(elapsedTimers[orderId]); return; }

    const diffMs = Date.now() - created.getTime();
    const mins   = Math.floor(diffMs / 60000);
    const secs   = Math.floor((diffMs % 60000) / 1000);
    el.textContent = `${mins}:${String(secs).padStart(2, '0')}`;

    el.className = 'k-card-elapsed';
    if (mins >= 20)      el.classList.add('urgent');
    else if (mins >= 10) el.classList.add('warning');
  }

  tick();
  elapsedTimers[orderId] = setInterval(tick, 1000);
}

function clearElapsedTimers() {
  Object.values(elapsedTimers).forEach(t => clearInterval(t));
  elapsedTimers = {};
}

function playOrderAlert() {
  try {
    const ctx  = new (window.AudioContext || window.webkitAudioContext)();
    const gain = ctx.createGain();
    gain.connect(ctx.destination);
    [0, 0.25].forEach(offset => {
      const osc = ctx.createOscillator();
      osc.connect(gain);
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.3, ctx.currentTime + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + offset + 0.2);
      osc.start(ctx.currentTime + offset);
      osc.stop(ctx.currentTime + offset + 0.2);
    });
  } catch (_) {}
}


/* ============================================================================
   14. KANBAN DRAG SCROLL
   ============================================================================ */
function initKanbanDrag() {
  const el = document.getElementById('k-orders');
  if (!el) return;

  let isDragging = false;
  let hasDragged = false;
  let startX     = 0;
  let scrollLeft = 0;

  const DRAG_THRESHOLD = 6;

  el.addEventListener('pointerdown', e => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    isDragging = true;
    hasDragged = false;
    startX     = e.clientX;
    scrollLeft = el.scrollLeft;
    el.classList.add('dragging');
  });

  el.addEventListener('pointerup',     () => { isDragging = false; el.classList.remove('dragging'); });
  el.addEventListener('pointercancel', () => { isDragging = false; hasDragged = false; el.classList.remove('dragging'); });

  el.addEventListener('pointermove', e => {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > DRAG_THRESHOLD) {
      hasDragged    = true;
      el.scrollLeft = scrollLeft - dx;
    }
  });

  el.addEventListener('click', e => {
    if (hasDragged) {
      e.stopPropagation();
      hasDragged = false;
    }
  }, true);
}


/* ============================================================================
   15. DASHBOARD START + INIT
   ============================================================================ */
function startDashboard() {
  startClock();
  listenKitchenStatus();
  listenBroadcastState(); // Session 14 — live location broadcast
  listenOrders();
  initKanbanDrag();
}

document.addEventListener('DOMContentLoaded', () => {
  applyKitchenTheme();
  initPageIdentity();

  // Restore lockout state from sessionStorage (Session 15)
  const savedFails    = parseInt(sessionStorage.getItem('pinFailCount') || '0', 10);
  const savedLockUntil = parseInt(sessionStorage.getItem('pinLockUntil') || '0', 10);
  if (savedFails) failedPinAttempts = savedFails;
  if (savedLockUntil > Date.now()) {
    pinLockedUntil = savedLockUntil;
    startLockoutCountdown();
  } else if (savedLockUntil) {
    // Lockout expired while page was closed — clear it
    sessionStorage.removeItem('pinFailCount');
    sessionStorage.removeItem('pinLockUntil');
  }
});


/* ============================================================================
   16. WALK-IN ORDER MODAL
   Session 13: per-item notes (walkinNotes{}) added alongside walkinQty{}.
   ============================================================================ */

async function getNextOrderRef() {
  const today      = new Date().toISOString().slice(0, 10);
  const counterRef = db.collection('vendors').doc(CONFIG.vendor.id)
                       .collection('counters').doc('daily');
  let orderNumber  = 1;

  await db.runTransaction(async tx => {
    const snap = await tx.get(counterRef);
    if (snap.exists && snap.data().date === today) {
      orderNumber = (snap.data().count || 0) + 1;
    }
    tx.set(counterRef, { date: today, count: orderNumber });
  });

  return `#${String(orderNumber).padStart(3, '0')}`;
}

function openWalkinModal() {
  walkinQty   = {};
  walkinNotes = {};

  const nameInput  = document.getElementById('walkin-name');
  const phoneInput = document.getElementById('walkin-phone');
  const nudge      = document.getElementById('walkin-nudge');
  if (nameInput)  { nameInput.value  = ''; nameInput.classList.remove('error'); }
  if (phoneInput) phoneInput.value  = '';
  if (nudge)      nudge.textContent = '';

  renderWalkinItems();
  updateWalkinTotal();

  const btn = document.getElementById('walkin-submit-btn');
  if (btn) { btn.textContent = 'Place Order →'; btn.disabled = false; }

  document.getElementById('walkin-modal').classList.add('show');
  setTimeout(() => { if (nameInput) nameInput.focus(); }, 300);
}

function closeWalkinModal() {
  document.getElementById('walkin-modal').classList.remove('show');
}

function renderWalkinItems() {
  const menu     = (CONFIG.menu || []).filter(item => item.available !== false);
  const currency = CONFIG.business.currency || '£';
  const el       = document.getElementById('walkin-items');
  if (!el) return;

  if (menu.length === 0) {
    el.innerHTML = `<div style="color:var(--ash);font-size:13px;padding:12px 0;">No menu items available</div>`;
    return;
  }

  el.innerHTML = menu.map(item => `
    <div class="k-walkin-item" id="walkin-row-${item.id}">
      <div class="k-walkin-item-top">
        <div class="k-walkin-item-info">
          <div class="k-walkin-item-name">${item.name}</div>
          <div class="k-walkin-item-price">${currency}${Number(item.price).toFixed(2)}</div>
        </div>
        <div class="k-walkin-qty-controls">
          <button class="k-walkin-qty-btn" onclick="adjustWalkinQty('${item.id}', -1)">−</button>
          <span class="k-walkin-qty-val" id="walkin-qty-${item.id}">0</span>
          <button class="k-walkin-qty-btn" onclick="adjustWalkinQty('${item.id}', 1)">+</button>
        </div>
      </div>
      <input class="k-walkin-note-input" id="walkin-note-${item.id}"
             type="text" maxlength="200"
             placeholder="Customisation / special request (optional)"
             oninput="saveWalkinNote('${item.id}', this.value)">
    </div>`).join('');
}

function adjustWalkinQty(itemId, delta) {
  const current = walkinQty[itemId] || 0;
  const next    = Math.max(0, current + delta);

  if (next === 0) delete walkinQty[itemId];
  else walkinQty[itemId] = next;

  const qtyEl = document.getElementById(`walkin-qty-${itemId}`);
  if (qtyEl) qtyEl.textContent = next;

  const rowEl = document.getElementById(`walkin-row-${itemId}`);
  if (rowEl) rowEl.classList.toggle('selected', next > 0);

  updateWalkinTotal();
}

function saveWalkinNote(itemId, value) {
  const trimmed = value.trim().substring(0, 200);
  if (trimmed) walkinNotes[itemId] = trimmed;
  else delete walkinNotes[itemId];
}

function updateWalkinTotal() {
  const currency = CONFIG.business.currency || '£';
  const menu     = CONFIG.menu || [];
  let total      = 0;

  Object.entries(walkinQty).forEach(([id, qty]) => {
    const item = menu.find(m => String(m.id) === String(id));
    if (item) total += Number(item.price) * qty;
  });

  const el = document.getElementById('walkin-total');
  if (el) el.textContent = total > 0 ? `Total: ${currency}${total.toFixed(2)}` : '';
}

async function submitWalkinOrder() {
  const nameInput = document.getElementById('walkin-name');
  const nudge     = document.getElementById('walkin-nudge');
  const name      = (nameInput?.value || '').trim();

  if (Object.keys(walkinQty).length === 0) {
    if (nudge) nudge.textContent = 'Please add at least one item.';
    const itemsEl = document.getElementById('walkin-items');
    if (itemsEl) {
      itemsEl.style.outline      = '2px solid var(--s-urgent)';
      itemsEl.style.borderRadius = '10px';
      setTimeout(() => { itemsEl.style.outline = ''; }, 800);
    }
    return;
  }

  if (!name) {
    if (nudge) nudge.textContent = 'Customer name is required.';
    if (nameInput) {
      nameInput.classList.add('error');
      nameInput.focus();
      setTimeout(() => nameInput.classList.remove('error'), 2000);
    }
    return;
  }

  if (nudge) nudge.textContent = '';

  const menu  = CONFIG.menu || [];
  const items = Object.entries(walkinQty).map(([id, qty]) => {
    const item = menu.find(m => String(m.id) === String(id));
    return {
      id:       item.id,
      name:     item.name,
      price:    Number(item.price),
      quantity: qty,
      notes:    walkinNotes[id] || null,
    };
  });

  const orderTotal  = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const phoneRaw    = (document.getElementById('walkin-phone')?.value || '').trim();
  const phone       = phoneRaw || null;
  const paymentNote = CONFIG.ordering.paymentNote || 'Cash on collection';

  const btn = document.getElementById('walkin-submit-btn');
  if (btn) { btn.textContent = 'Placing…'; btn.disabled = true; }

  try {
    const orderRef = await getNextOrderRef();

    await db.collection('orders').add({
      vendorId:      CONFIG.vendor.id,
      orderRef,
      source:        'walkin',
      customerId:    null,
      customerName:  name,
      customerPhone: phone,
      items,
      orderTotal,
      payment:       paymentNote,
      status:        'pending',
      waitMins:      null,
      expiresAt:     null,
      createdAt:     firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt:     firebase.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`[Stalliq] Walk-in order placed: ${orderRef} for "${name}"`);
    closeWalkinModal();

  } catch (err) {
    console.error('[Stalliq] Walk-in order error:', err);
    if (btn) { btn.textContent = 'Error — try again'; btn.disabled = false; }
  }
}


/* ============================================================================
   17. STAFF MANAGEMENT PANEL (Session 15)
   ============================================================================
   Accessible via ⚙️ icon in the kitchen header (visible once logged in).
   Requires re-entering the logged-in staff member's own PIN before any
   changes can be made — prevents casual tampering on an unlocked tablet.

   Screens (all inside #staff-modal):
     staff-confirm-screen  — re-auth mini keypad
     staff-list-screen     — list of active staff with Edit / Remove actions
     staff-add-screen      — add a new staff member (name + PIN)
     staff-edit-screen     — rename or change PIN for an existing member
   ============================================================================ */

/** Simple toast notification — appears briefly then fades. */
function showToast(message, duration = 2500) {
  const toast = document.getElementById('k-toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}

// ── Settings panel open / close ──────────────────────────────────────────────

async function openSettingsPanel() {
  showStaffScreen('staff-list-screen');
  document.getElementById('staff-modal').classList.add('show');
  await loadStaffList();
}

function closeSettingsPanel() {
  document.getElementById('staff-modal').classList.remove('show');
  staffConfirmEntry = '';
  editingStaffId    = null;
}

// ── Screen switcher ──────────────────────────────────────────────────────────

function showStaffScreen(screenId) {
  ['staff-list-screen', 'staff-add-screen', 'staff-edit-screen']
    .forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.toggle('hidden', id !== screenId);
    });
}

// ── Settings re-auth (mini PIN keypad) ───────────────────────────────────────

function staffConfirmPress(digit) {
  if (staffConfirmEntry.length >= 4) return;
  staffConfirmEntry += digit;
  renderStaffConfirmDots();
  if (staffConfirmEntry.length === 4) setTimeout(confirmStaffIdentity, 120);
}

function staffConfirmBack() {
  staffConfirmEntry = staffConfirmEntry.slice(0, -1);
  renderStaffConfirmDots();
  const errEl = document.getElementById('staff-confirm-error');
  if (errEl) errEl.textContent = '';
}

function renderStaffConfirmDots() {
  for (let i = 0; i < 4; i++) {
    const dot = document.getElementById(`sc-dot-${i}`);
    if (dot) dot.classList.toggle('filled', i < staffConfirmEntry.length);
  }
}

async function confirmStaffIdentity() {
  const hash = await hashPin(staffConfirmEntry);
  staffConfirmEntry = '';
  renderStaffConfirmDots();

  try {
    const doc = await db.collection('vendors').doc(CONFIG.vendor.id)
                        .collection('staff').doc(loggedInStaffId).get();
    if (doc.exists && doc.data().pinHash === hash) {
      await loadStaffList();
      showStaffScreen('staff-list-screen');
    } else {
      const errEl = document.getElementById('staff-confirm-error');
      if (errEl) errEl.textContent = 'Incorrect PIN — try again';
      const dots = document.querySelector('.sc-dots');
      if (dots) { dots.classList.remove('shake'); void dots.offsetWidth; dots.classList.add('shake'); }
    }
  } catch (err) {
    console.error('[Stalliq] Staff confirm error:', err);
    const errEl = document.getElementById('staff-confirm-error');
    if (errEl) errEl.textContent = 'Connection error — try again';
  }
}

// ── Staff list ───────────────────────────────────────────────────────────────

async function loadStaffList() {
  const snapshot = await db.collection('vendors').doc(CONFIG.vendor.id)
                            .collection('staff')
                            .where('active', '==', true)
                            .get();

  // Sort by createdAt client-side (avoids needing a composite Firestore index)
  const staffDocs = [];
  snapshot.forEach(doc => staffDocs.push({ id: doc.id, ...doc.data() }));
  staffDocs.sort((a, b) => {
    const aT = a.createdAt?.toDate?.()?.getTime() || 0;
    const bT = b.createdAt?.toDate?.()?.getTime() || 0;
    return aT - bT;
  });

  const listEl = document.getElementById('staff-list');
  if (!listEl) return;

  if (staffDocs.length === 0) {
    listEl.innerHTML = `<div class="staff-empty">No staff members yet — add one below.</div>`;
    return;
  }

  listEl.innerHTML = staffDocs.map(d => {
    const isSelf = d.id === loggedInStaffId;
    const safeName = d.name.replace(/'/g, "\\'");
    return `
      <div class="staff-row${isSelf ? ' staff-row-self' : ''}">
        <div class="staff-row-name">
          ${d.name}
          ${isSelf ? '<span class="staff-you-badge">You</span>' : ''}
        </div>
        <div class="staff-row-actions">
          <button class="staff-action-btn" onclick="openEditStaff('${d.id}', '${safeName}')">Edit</button>
          ${!isSelf
            ? `<button class="staff-action-btn danger" onclick="deactivateStaff('${d.id}', '${safeName}')">Remove</button>`
            : ''}
        </div>
      </div>`;
  }).join('');
}

// ── Deactivate staff ─────────────────────────────────────────────────────────

async function deactivateStaff(staffId, name) {
  if (!confirm(`Remove ${name} from the kitchen? They will no longer be able to log in.`)) return;
  try {
    await db.collection('vendors').doc(CONFIG.vendor.id)
            .collection('staff').doc(staffId)
            .update({ active: false });
    showToast(`${name} removed.`);
    await loadStaffList();
  } catch (err) {
    console.error('[Stalliq] Deactivate staff error:', err);
    showToast('Error — please try again');
  }
}

// ── Add staff ────────────────────────────────────────────────────────────────

function openAddStaff() {
  ['add-staff-name', 'add-staff-pin', 'add-staff-pin2'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  const errEl = document.getElementById('add-staff-error');
  if (errEl) errEl.textContent = '';
  showStaffScreen('staff-add-screen');
  setTimeout(() => { const el = document.getElementById('add-staff-name'); if (el) el.focus(); }, 200);
}

async function submitAddStaff() {
  const nameEl = document.getElementById('add-staff-name');
  const pinEl  = document.getElementById('add-staff-pin');
  const pin2El = document.getElementById('add-staff-pin2');
  const errEl  = document.getElementById('add-staff-error');
  const btn    = document.getElementById('add-staff-btn');

  const name = (nameEl?.value || '').trim();
  const pin  = (pinEl?.value  || '').trim();
  const pin2 = (pin2El?.value || '').trim();

  if (!name)                   { errEl.textContent = 'Name is required.'; return; }
  if (!/^\d{6}$/.test(pin))    { errEl.textContent = 'PIN must be exactly 6 digits.'; return; }
  if (pin !== pin2)             { errEl.textContent = 'PINs do not match.'; return; }
  errEl.textContent = '';
  if (btn) { btn.textContent = 'Adding…'; btn.disabled = true; }

  try {
    const pinHash = await hashPin(pin);
    await db.collection('vendors').doc(CONFIG.vendor.id)
            .collection('staff').add({
              name,
              pinHash,
              active:    true,
              createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            });
    showToast(`${name} added!`);
    await loadStaffList();
    showStaffScreen('staff-list-screen');
  } catch (err) {
    console.error('[Stalliq] Add staff error:', err);
    if (errEl) errEl.textContent = 'Error — please try again';
  } finally {
    if (btn) { btn.textContent = 'Add Staff Member'; btn.disabled = false; }
  }
}

// ── Edit staff (rename / change PIN) ─────────────────────────────────────────

function openEditStaff(staffId, name) {
  editingStaffId = staffId;
  const nameEl = document.getElementById('edit-staff-name');
  if (nameEl) nameEl.value = name;
  ['edit-staff-pin', 'edit-staff-pin2'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  const errEl = document.getElementById('edit-staff-error');
  if (errEl) errEl.textContent = '';
  showStaffScreen('staff-edit-screen');
}

async function submitEditStaff() {
  const nameEl = document.getElementById('edit-staff-name');
  const pinEl  = document.getElementById('edit-staff-pin');
  const pin2El = document.getElementById('edit-staff-pin2');
  const errEl  = document.getElementById('edit-staff-error');
  const btn    = document.getElementById('edit-staff-btn');

  const name = (nameEl?.value || '').trim();
  const pin  = (pinEl?.value  || '').trim();
  const pin2 = (pin2El?.value || '').trim();

  if (!name) { errEl.textContent = 'Name is required.'; return; }

  const updates = { name };
  if (pin) {
    if (!/^\d{6}$/.test(pin)) { errEl.textContent = 'PIN must be exactly 6 digits.'; return; }
    if (pin !== pin2)          { errEl.textContent = 'PINs do not match.'; return; }
    updates.pinHash = await hashPin(pin);
  }

  errEl.textContent = '';
  if (btn) { btn.textContent = 'Saving…'; btn.disabled = true; }

  try {
    await db.collection('vendors').doc(CONFIG.vendor.id)
            .collection('staff').doc(editingStaffId)
            .update(updates);
    if (editingStaffId === loggedInStaffId) loggedInStaffName = name;
    showToast('Changes saved!');
    await loadStaffList();
    showStaffScreen('staff-list-screen');
  } catch (err) {
    console.error('[Stalliq] Edit staff error:', err);
    if (errEl) errEl.textContent = 'Error — please try again';
  } finally {
    if (btn) { btn.textContent = 'Save Changes'; btn.disabled = false; }
  }
}


/* ============================================================================
   18. FORGOT PIN / OWNER RESET FLOW (Session 15)
   ============================================================================
   Triggered from the lock screen when all PINs are forgotten.
   Uses Firebase Phone Auth to verify the owner's registered phone number
   (stored at vendors/{vendorId}/ownerPhone — set manually during onboarding).
   On success, writes/updates a staff doc at staff/owner and logs straight in.

   Firestore prerequisite: vendors/{vendorId}/ownerPhone must be set to the
   owner's phone in E.164 format (e.g. +447951050383) before this flow works.

   Screens (inside #forgot-modal):
     forgot-phone-screen   — enter owner phone number
     forgot-code-screen    — enter 6-digit SMS code
     forgot-newpin-screen  — choose a new 4-digit PIN
   ============================================================================ */

let forgotPhoneVerifier      = null;
let forgotConfirmationResult = null;

function openForgotPin() {
  ['forgot-phone-input', 'forgot-code-input', 'forgot-newpin-input', 'forgot-newpin2-input']
    .forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  ['forgot-phone-error', 'forgot-code-error', 'forgot-newpin-error']
    .forEach(id => { const el = document.getElementById(id); if (el) el.textContent = ''; });
  showForgotScreen('forgot-phone-screen');
  document.getElementById('forgot-modal').classList.add('show');
}

function closeForgotPin() {
  document.getElementById('forgot-modal').classList.remove('show');
  if (forgotPhoneVerifier) {
    try { forgotPhoneVerifier.clear(); } catch (_) {}
    forgotPhoneVerifier = null;
  }
  forgotConfirmationResult = null;
}

function showForgotScreen(screenId) {
  ['forgot-phone-screen', 'forgot-code-screen', 'forgot-newpin-screen']
    .forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.toggle('hidden', id !== screenId);
    });
}

/** Normalises a UK phone number to E.164 (+44...). */
function toE164UK(raw) {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('44'))  return '+' + digits;
  if (digits.startsWith('0'))   return '+44' + digits.slice(1);
  if (digits.length === 10)     return '+44' + digits;
  return raw;
}

async function submitForgotPhone() {
  const phoneInput = document.getElementById('forgot-phone-input');
  const errEl      = document.getElementById('forgot-phone-error');
  const btn        = document.getElementById('forgot-phone-btn');
  const phone      = toE164UK((phoneInput?.value || '').trim());

  if (!phone || phone.length < 11) { errEl.textContent = 'Please enter a valid phone number.'; return; }
  errEl.textContent = '';
  if (btn) { btn.textContent = 'Checking…'; btn.disabled = true; }

  try {
    // Verify the entered number matches the stored owner phone
    const vendorDoc  = await db.collection('vendors').doc(CONFIG.vendor.id).get();
    const ownerPhone = vendorDoc.exists ? toE164UK(String(vendorDoc.data().ownerPhone || '')) : null;

    if (!ownerPhone || ownerPhone !== phone) {
      errEl.textContent = 'This number is not registered as the owner phone. Contact your administrator.';
      if (btn) { btn.textContent = 'Send Code'; btn.disabled = false; }
      return;
    }

    // Set up invisible reCAPTCHA and send SMS
    if (!forgotPhoneVerifier) {
      forgotPhoneVerifier = new firebase.auth.RecaptchaVerifier('forgot-recaptcha', {
        size: 'invisible',
        callback: () => {},
      });
    }

    forgotConfirmationResult = await firebase.auth().signInWithPhoneNumber(phone, forgotPhoneVerifier);
    showForgotScreen('forgot-code-screen');
    setTimeout(() => { const el = document.getElementById('forgot-code-input'); if (el) el.focus(); }, 200);
  } catch (err) {
    console.error('[Stalliq] Forgot PIN — phone submit error:', err);
    let msg = 'Error sending SMS — please try again.';
    if (err.code === 'auth/too-many-requests')    msg = 'Too many requests — please try again later.';
    if (err.code === 'auth/invalid-phone-number') msg = 'Invalid phone number format.';
    errEl.textContent = msg;
    if (forgotPhoneVerifier) { try { forgotPhoneVerifier.clear(); } catch (_) {} forgotPhoneVerifier = null; }
  } finally {
    if (btn) { btn.textContent = 'Send Code'; btn.disabled = false; }
  }
}

async function submitForgotCode() {
  const codeEl = document.getElementById('forgot-code-input');
  const errEl  = document.getElementById('forgot-code-error');
  const btn    = document.getElementById('forgot-code-btn');
  const code   = (codeEl?.value || '').trim();

  if (!code) { errEl.textContent = 'Please enter the 6-digit code.'; return; }
  errEl.textContent = '';
  if (btn) { btn.textContent = 'Verifying…'; btn.disabled = true; }

  try {
    await forgotConfirmationResult.confirm(code);
    showForgotScreen('forgot-newpin-screen');
    setTimeout(() => { const el = document.getElementById('forgot-newpin-input'); if (el) el.focus(); }, 200);
  } catch (err) {
    console.error('[Stalliq] Forgot PIN — code confirm error:', err);
    let msg = 'Invalid code — please try again.';
    if (err.code === 'auth/code-expired') msg = 'Code has expired — go back and request a new one.';
    errEl.textContent = msg;
  } finally {
    if (btn) { btn.textContent = 'Verify Code'; btn.disabled = false; }
  }
}

async function submitNewOwnerPin() {
  const pinEl  = document.getElementById('forgot-newpin-input');
  const pin2El = document.getElementById('forgot-newpin2-input');
  const errEl  = document.getElementById('forgot-newpin-error');
  const btn    = document.getElementById('forgot-newpin-btn');

  const pin  = (pinEl?.value  || '').trim();
  const pin2 = (pin2El?.value || '').trim();

  if (!/^\d{4}$/.test(pin)) { errEl.textContent = 'PIN must be exactly 4 digits.'; return; }
  if (pin !== pin2)          { errEl.textContent = 'PINs do not match.'; return; }
  errEl.textContent = '';
  if (btn) { btn.textContent = 'Saving…'; btn.disabled = true; }

  try {
    const pinHash = await hashPin(pin);
    // Upsert the owner staff document (fixed ID 'owner' for easy identification)
    await db.collection('vendors').doc(CONFIG.vendor.id)
            .collection('staff').doc('owner')
            .set({
              name:      'Owner',
              pinHash,
              active:    true,
              createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            }, { merge: true });

    closeForgotPin();

    // Log straight in as Owner
    failedPinAttempts = 0;
    pinLockedUntil    = null;
    sessionStorage.removeItem('pinFailCount');
    sessionStorage.removeItem('pinLockUntil');
    loggedInStaffId   = 'owner';
    loggedInStaffName = 'Owner';

    document.getElementById('pin-overlay').classList.add('hidden');
    const dashboard = document.getElementById('k-dashboard');
    if (dashboard) dashboard.style.display = 'flex';
    startDashboard();
    showToast('PIN reset — welcome back!');
  } catch (err) {
    console.error('[Stalliq] Set new owner PIN error:', err);
    if (errEl) errEl.textContent = 'Error saving PIN — please try again.';
  } finally {
    if (btn) { btn.textContent = 'Set New PIN'; btn.disabled = false; }
  }
}
