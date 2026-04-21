/**
 * Stalliq — Kitchen Dashboard JS
 * ============================================================================
 * Reads CONFIG from js/config.js (same file as customer app).
 * Uses db + auth globals from js/firebase.js.
 *
 * Structure:
 *   1.  State
 *   2.  Theme + page identity
 *   3.  Clock
 *   4.  PIN screen
 *   5.  Kitchen status
 *   6.  Firestore orders listener
 *   7.  Render orders
 *   8.  Order card HTML
 *   9.  Wait time modal
 *   10. Accept order
 *   11. Status progression
 *   12. Ready confirm modal
 *   13. Elapsed time + sound alert
 *   14. Dashboard start + init
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


/* ============================================================================
   2. THEME + PAGE IDENTITY
   Applies CONFIG colours as CSS variables and sets vendor name in UI.
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

  // Vendor name in PIN screen and dashboard header — last word in gold
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
   Updates the time display in the header every 10 seconds.
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
   4-digit PIN read from CONFIG.kitchen.pin.
   Auto-submits on 4th digit. Shakes and clears on wrong entry.
   ============================================================================ */
let pinEntry = '';

function pinPress(digit) {
  if (pinEntry.length >= 4) return;
  pinEntry += digit;
  renderPinDots();
  if (pinEntry.length === 4) setTimeout(checkPin, 120);
}

function pinBackspace() {
  pinEntry = pinEntry.slice(0, -1);
  renderPinDots();
  document.getElementById('pin-error').textContent = '';
}

function renderPinDots() {
  for (let i = 0; i < 4; i++) {
    const dot = document.getElementById(`pin-dot-${i}`);
    if (dot) dot.classList.toggle('filled', i < pinEntry.length);
  }
}

function checkPin() {
  const correctPin = String(CONFIG.kitchen?.pin || '1234');
  if (pinEntry === correctPin) {
    document.getElementById('pin-overlay').classList.add('hidden');
    document.getElementById('k-dashboard').style.display = 'block';
    startDashboard();
  } else {
    document.getElementById('pin-error').textContent = 'Incorrect PIN — try again';
    pinEntry = '';
    renderPinDots();
    // Shake the dots
    const dots = document.querySelector('.pin-dots');
    if (dots) {
      dots.classList.remove('shake');
      void dots.offsetWidth; // force reflow
      dots.classList.add('shake');
    }
  }
}


/* ============================================================================
   5. KITCHEN STATUS
   Listens to vendors/{vendorId}.kitchenStatus in Firestore.
   Writing to Firestore triggers the listener on all open dashboard instances.
   ============================================================================ */
function listenKitchenStatus() {
  db.collection('vendors').doc(CONFIG.vendor.id)
    .onSnapshot(doc => {
      kitchenStatus = (doc.exists && doc.data().kitchenStatus) || 'open';
      renderKitchenStatusBtn();
    }, err => console.error('Kitchen status listener:', err));
}

function renderKitchenStatusBtn() {
  const btn = document.getElementById('k-status-btn');
  if (!btn) return;
  const map = {
    open:         { label: '🟢 Open',         cls: 'open'   },
    closed_busy:  { label: '🟡 Busy',          cls: 'closed' },
    closed_end:   { label: '🔴 Closing',        cls: 'closed' },
    closed_today: { label: '⚫ Not Trading',    cls: 'closed' },
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
    console.error('Set kitchen status error:', err);
  }
  closeKitchenModal();
}

function openKitchenModal()  { document.getElementById('kitchen-modal').classList.add('show'); }
function closeKitchenModal() { document.getElementById('kitchen-modal').classList.remove('show'); }


/* ============================================================================
   6. FIRESTORE ORDERS LISTENER
   Listens to all active orders for this vendor in real time.
   Sorted client-side to avoid requiring a Firestore composite index.
   Plays a sound alert when a new pending order arrives.
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
  }, err => console.error('Orders listener:', err));
}


/* ============================================================================
   7. RENDER ORDERS
   Clears and rebuilds the order grid on every Firestore update.
   Restarts per-card elapsed timers after re-render.
   ============================================================================ */
function renderOrders() {
  const container = document.getElementById('k-orders');
  if (!container) return;

  const orders = Object.values(currentOrders);

  // Queue count — excludes ready orders
  const active  = orders.filter(o => o.status !== 'ready').length;
  const countEl = document.getElementById('k-queue-count');
  if (countEl) countEl.textContent = active > 0 ? `${active} active` : '';

  if (orders.length === 0) {
    clearElapsedTimers();
    container.innerHTML = `
      <div class="k-empty">
        <div class="k-empty-icon">🍕</div>
        <div class="k-empty-text">No active orders — standing by</div>
      </div>`;
    return;
  }

  // Sort: pending first, then by createdAt ascending
  const statusOrder = { pending: 0, accepted: 1, preparing: 2, ready: 3 };
  const sorted = orders.sort((a, b) => {
    if (statusOrder[a.status] !== statusOrder[b.status]) {
      return statusOrder[a.status] - statusOrder[b.status];
    }
    const aTime = a.createdAt?.toDate?.()?.getTime() || 0;
    const bTime = b.createdAt?.toDate?.()?.getTime() || 0;
    return aTime - bTime;
  });

  clearElapsedTimers();
  container.innerHTML = sorted.map(order => orderCardHTML(order)).join('');
  sorted.forEach(order => {
    if (order.status !== 'ready') startElapsedTimer(order.id);
  });
}


/* ============================================================================
   8. ORDER CARD HTML
   ============================================================================ */
function orderCardHTML(order) {
  const statusLabels = {
    pending:   'Awaiting Acceptance',
    accepted:  'Accepted',
    preparing: 'In Progress',
    ready:     'Ready to Collect',
  };

  const itemsHTML = (order.items || []).map(item =>
    `<li class="k-card-item">
       <span>${item.name}</span>
       <span class="k-card-item-qty">× ${item.quantity}</span>
     </li>`
  ).join('');

  const waitLabel = order.waitMins ? `${order.waitMins} min wait` : '';

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
        <div class="k-card-ref">${order.orderRef || '—'}</div>
        <div class="k-card-meta">
          <div class="k-card-name">${order.customerName || 'Customer'}</div>
          <div class="k-card-elapsed" id="elapsed-${order.id}">0:00</div>
        </div>
      </div>
      <div class="k-card-body">
        <ul class="k-card-items">${itemsHTML}</ul>
        <div class="k-card-total">£${(order.orderTotal || 0).toFixed(2)} · cash on collection</div>
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

  // Build wait option buttons from config
  const opts   = CONFIG.ordering.waitOptions || [10, 15, 20, 25];
  const optsEl = document.getElementById('wait-options');
  if (optsEl) {
    optsEl.innerHTML = opts.map(mins =>
      `<button class="k-wait-opt" onclick="selectWait(${mins}, this)">
         ${mins}<span>mins</span>
       </button>`
    ).join('');
  }

  // Custom wait row
  const customRow   = document.getElementById('custom-wait-row');
  const customInput = document.getElementById('custom-wait-input');
  if (customRow)  customRow.style.display  = CONFIG.ordering.allowCustomWait !== false ? 'flex' : 'none';
  if (customInput) customInput.value = '';

  // Reset confirm button
  const confirmBtn = document.getElementById('wait-confirm-btn');
  if (confirmBtn) { confirmBtn.textContent = 'Accept Order →'; confirmBtn.disabled = false; }

  document.getElementById('wait-modal').classList.add('show');
}

function selectWait(mins, btn) {
  selectedWaitMins = mins;
  // Clear any custom value
  const customInput = document.getElementById('custom-wait-input');
  if (customInput) customInput.value = '';
  // Highlight selected button
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
   Reads selected wait time (preset or custom), writes to Firestore.
   ============================================================================ */
async function confirmAccept() {
  // Prefer custom input if filled
  const customInput = document.getElementById('custom-wait-input');
  if (customInput && customInput.value) {
    const val = parseInt(customInput.value, 10);
    if (val > 0 && val <= 240) selectedWaitMins = val;
  }

  if (!selectedWaitMins) {
    // Flash options to indicate a selection is required
    const optsEl = document.getElementById('wait-options');
    if (optsEl) {
      optsEl.style.outline = '2px solid var(--fire)';
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
    console.error('Accept order error:', err);
    if (btn) btn.textContent = 'Error — try again';
  } finally {
    if (btn) { btn.textContent = 'Accept Order →'; btn.disabled = false; }
  }
}


/* ============================================================================
   11. STATUS PROGRESSION
   advanceStatus — single tap, no confirm (accepted → preparing).
   markCollected — removes order from active queue.
   ============================================================================ */
async function advanceStatus(orderId, newStatus) {
  try {
    await db.collection('orders').doc(orderId).update({
      status:    newStatus,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
  } catch (err) {
    console.error('Advance status error:', err);
  }
}

async function markCollected(orderId) {
  try {
    await db.collection('orders').doc(orderId).update({
      status:    'collected',
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
  } catch (err) {
    console.error('Mark collected error:', err);
  }
}


/* ============================================================================
   12. READY CONFIRM MODAL
   preparing → ready requires explicit confirmation (two-tap as per spec).
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
    console.error('Confirm ready error:', err);
    if (btn) btn.textContent = 'Error — try again';
  } finally {
    if (btn) { btn.textContent = 'Mark as Ready ✓'; btn.disabled = false; }
  }
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

    // Colour escalation
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
    // Two short beeps
    [0, 0.25].forEach(offset => {
      const osc = ctx.createOscillator();
      osc.connect(gain);
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.3, ctx.currentTime + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + offset + 0.2);
      osc.start(ctx.currentTime + offset);
      osc.stop(ctx.currentTime + offset + 0.2);
    });
  } catch (_) {
    // Audio not available — silent fail
  }
}


/* ============================================================================
   14. DASHBOARD START + INIT
   ============================================================================ */
function startDashboard() {
  startClock();
  listenKitchenStatus();
  listenOrders();
}

document.addEventListener('DOMContentLoaded', () => {
  applyKitchenTheme();
  initPageIdentity();
});
