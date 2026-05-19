// ============================================================================
// Stalliq — Cloud Functions
// Feature 16  — Order Ready Notifications (SMS)        Session 37/38 2026-05-17/18
// Feature 19  — geocodePostcode (callable)             Session 39    2026-05-18
// Feature 19b — flashSaleBroadcast (Firestore trigger) Session 39/40 2026-05-18/19
//
// Required: functions/.env (never committed)
//   TWILIO_ACCOUNT_SID=ACxxxxxxxx
//   TWILIO_AUTH_TOKEN=xxxx
//   TWILIO_SMS_FROM=+447782218609
//   GOOGLE_GEOCODING_API_KEY=AIza...
// ============================================================================

const functions = require('firebase-functions');
const admin     = require('firebase-admin');
const twilio    = require('twilio');

admin.initializeApp();

// ============================================================================
// Feature 16 — orderReadyNotification
// Trigger: orders/{orderId} onUpdate — status transitions to 'ready'
// ============================================================================

exports.orderReadyNotification = functions
  .region('europe-west2')
  .firestore
  .document('orders/{orderId}')
  .onUpdate(async (change, context) => {

    const before = change.before.data();
    const after  = change.after.data();

    // Only fire when status transitions TO 'ready'
    if (before.status === after.status || after.status !== 'ready') {
      return null;
    }

    const { customerPhone, customerId, customerName, vendorId, orderRef } = after;
    const orderId = context.params.orderId;

    if (!customerPhone) {
      console.log('[F16] Order ' + orderId + ' (' + orderRef + ') has no customerPhone - skipping');
      return null;
    }

    // -- Resolve firstName --------------------------------------------------
    let firstName = 'there';

    if (customerId) {
      try {
        const userDoc = await admin.firestore().collection('users').doc(customerId).get();
        if (userDoc.exists && userDoc.data().firstName) {
          firstName = userDoc.data().firstName;
        }
      } catch (err) {
        console.warn('[F16] Could not read user profile for ' + customerId + ':', err.message);
      }
    } else if (customerName) {
      firstName = customerName.trim().split(' ')[0];
    }

    // -- Resolve vendor display name + messaging flag -----------------------
    let vendorName = 'the kitchen';

    try {
      const vendorDoc = await admin.firestore().collection('vendors').doc(vendorId).get();
      if (vendorDoc.exists) {
        if (vendorDoc.data().displayName)               vendorName = vendorDoc.data().displayName;
        if (vendorDoc.data().messagingEnabled === false) {
          console.log('[F16] Messaging disabled for vendor ' + vendorId + ' - skipping order ' + orderRef);
          return null;
        }
      }
    } catch (err) {
      console.warn('[F16] Could not read vendor doc for ' + vendorId + ':', err.message);
    }

    const client  = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    const fromSMS = process.env.TWILIO_SMS_FROM;

    let notificationSent = false;
    let channel          = null;
    let errorDetail      = null;

    try {
      await client.messages.create({
        from: fromSMS,
        to:   customerPhone,
        body: 'Hi ' + firstName + ', your order from ' + vendorName + ' is ready for collection! See you soon.',
      });
      notificationSent = true;
      channel          = 'sms';
      console.log('[F16] SMS sent -> ' + customerPhone + ' | order ' + orderRef);
    } catch (smsErr) {
      console.error('[F16] SMS failed for order ' + orderRef + ':', smsErr.message);
      errorDetail = 'SMS: ' + smsErr.message;
    }

    const update = notificationSent
      ? {
          notificationSent:    true,
          notificationChannel: channel,
          notificationSentAt:  admin.firestore.FieldValue.serverTimestamp(),
        }
      : {
          notificationSent:  false,
          notificationError: errorDetail,
        };

    await change.after.ref.update(update);
    return null;
  });


// ============================================================================
// Feature 19 — geocodePostcode (callable)
// Called by the customer app on postcode opt-in.
// Validates UK postcode, geocodes via Google, writes to users/{uid}.
// ============================================================================

exports.geocodePostcode = functions
  .region('europe-west2')
  .https
  .onCall(async (data, context) => {

    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Must be signed in.');
    }

    const uid      = context.auth.uid;
    const postcode = (data.postcode || '').trim().toUpperCase().replace(/\s+/g, ' ');

    const postcodeRegex = /^[A-Z]{1,2}[0-9][0-9A-Z]?\s?[0-9][A-Z]{2}$/i;
    if (!postcodeRegex.test(postcode)) {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid UK postcode format.');
    }

    const apiKey = process.env.GOOGLE_GEOCODING_API_KEY;
    if (!apiKey) {
      throw new functions.https.HttpsError('internal', 'Geocoding API key not configured.');
    }

    const encoded = encodeURIComponent(postcode + ', UK');
    const url     = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + encoded + '&key=' + apiKey;

    let lat, lng;
    try {
      const response = await fetch(url);
      const json     = await response.json();

      if (json.status !== 'OK' || !json.results || json.results.length === 0) {
        console.warn('[F19] Geocode failed for', postcode, '- status:', json.status);
        throw new functions.https.HttpsError('not-found', 'Could not geocode postcode.');
      }

      lat = json.results[0].geometry.location.lat;
      lng = json.results[0].geometry.location.lng;
    } catch (err) {
      if (err instanceof functions.https.HttpsError) throw err;
      console.error('[F19] Geocode fetch error:', err.message);
      throw new functions.https.HttpsError('internal', 'Geocoding request failed.');
    }

    await admin.firestore().collection('users').doc(uid).set(
      {
        postcode:       postcode,
        postcodeLatLng: new admin.firestore.GeoPoint(lat, lng),
      },
      { merge: true }
    );

    console.log('[F19] Postcode', postcode, 'geocoded for uid', uid, '->', lat, lng);
    return { lat, lng };
  });


// ============================================================================
// Feature 19b — flashSaleBroadcast
// Trigger: flashSales/{flashSaleId} onCreate
// Finds opted-in users within 3 miles of vendor location, sends SMS.
// ============================================================================

function haversineMiles(lat1, lng1, lat2, lng2) {
  const R    = 3958.8;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a    = Math.sin(dLat / 2) * Math.sin(dLat / 2)
             + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180)
             * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

exports.flashSaleBroadcast = functions
  .region('europe-west2')
  .firestore
  .document('flashSales/{flashSaleId}')
  .onCreate(async (snap, context) => {

    const flashSaleId = context.params.flashSaleId;
    const sale        = snap.data();
    const vendorId    = sale.vendorId;
    const message     = sale.message || '';

    if (!vendorId) {
      console.warn('[F19b] flashSales/' + flashSaleId + ' has no vendorId — skipping');
      return null;
    }

    // -- Vendor name + messaging flag --------------------------------------
    let vendorName       = 'the kitchen';
    let messagingEnabled = true;

    try {
      const vendorDoc = await admin.firestore().collection('vendors').doc(vendorId).get();
      if (vendorDoc.exists) {
        if (vendorDoc.data().displayName)                vendorName       = vendorDoc.data().displayName;
        if (vendorDoc.data().messagingEnabled === false)  messagingEnabled = false;
      }
    } catch (err) {
      console.warn('[F19b] Could not read vendor doc:', err.message);
    }

    if (!messagingEnabled) {
      console.log('[F19b] Messaging disabled for ' + vendorId + ' — skipping broadcast');
      await snap.ref.update({ broadcastSkipped: true, broadcastSkipReason: 'messaging_disabled' });
      return null;
    }

    // -- Vendor current location -------------------------------------------
    let vendorLat = null;
    let vendorLng = null;

    try {
      const locDoc = await admin.firestore()
        .collection('vendors').doc(vendorId)
        .collection('location').doc('current')
        .get();
      if (locDoc.exists) {
        vendorLat = locDoc.data().lat || null;
        vendorLng = locDoc.data().lng || null;
      }
    } catch (err) {
      console.warn('[F19b] Could not read vendor location:', err.message);
    }

    // -- Opted-in users (have postcodeLatLng) ------------------------------
    let usersSnap;
    try {
      usersSnap = await admin.firestore()
        .collection('users')
        .where('postcodeLatLng', '!=', null)
        .get();
    } catch (err) {
      console.error('[F19b] Could not query users:', err.message);
      await snap.ref.update({ broadcastError: err.message });
      return null;
    }

    if (usersSnap.empty) {
      console.log('[F19b] No opted-in users — nothing to send');
      await snap.ref.update({ broadcastSent: 0, broadcastFailed: 0, broadcastSkipped: true, broadcastSkipReason: 'no_opted_in_users' });
      return null;
    }

    // -- Haversine filter: keep users within 3 miles -----------------------
    const MAX_MILES = 3;
    const nearbyUids = [];

    usersSnap.forEach(doc => {
      const latlng = doc.data().postcodeLatLng;
      if (!latlng) return;
      if (vendorLat !== null && vendorLng !== null) {
        const dist = haversineMiles(vendorLat, vendorLng, latlng.latitude, latlng.longitude);
        if (dist > MAX_MILES) return;
      }
      nearbyUids.push(doc.id);
    });

    console.log('[F19b] ' + nearbyUids.length + ' users within ' + MAX_MILES + ' miles');

    if (nearbyUids.length === 0) {
      await snap.ref.update({ broadcastSent: 0, broadcastFailed: 0, broadcastOutOfRange: usersSnap.size });
      return null;
    }

    // -- Send SMS to each nearby user --------------------------------------
    const client  = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    const fromSMS = process.env.TWILIO_SMS_FROM;
    const smsBody = vendorName + ': ' + message;

    let sent   = 0;
    let failed = 0;

    await Promise.all(nearbyUids.map(async uid => {
      let phone = null;
      try {
        const authUser = await admin.auth().getUser(uid);
        phone = authUser.phoneNumber || null;
      } catch (err) {
        console.warn('[F19b] Could not get Auth record for uid ' + uid + ':', err.message);
        failed++;
        return;
      }

      if (!phone) {
        failed++;
        return;
      }

      try {
        await client.messages.create({ from: fromSMS, to: phone, body: smsBody });
        sent++;
        console.log('[F19b] SMS sent -> ' + phone);
      } catch (err) {
        console.error('[F19b] SMS failed -> ' + phone + ':', err.message);
        failed++;
      }
    }));

    await snap.ref.update({
      broadcastSent:        sent,
      broadcastFailed:      failed,
      broadcastCompletedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log('[F19b] Broadcast complete — sent:', sent, 'failed:', failed);
    return null;
  });
