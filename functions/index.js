// ============================================================================
// Stalliq — Cloud Functions
// Feature 16 — Order Ready Notifications (SMS / WhatsApp)
// Session 37 — 2026-05-17 | Updated Session 38 — 2026-05-18
// WhatsApp support added — Session 45 — 2026-06-02 (B3)
//
// Feature 19 — Geofenced Flash Sale Alerts
// Session 39 — 2026-05-18
//   geocodePostcode  — callable: validates UK postcode, geocodes via Google API,
//                      writes postcode + postcodeLatLng to users/{uid}.
//   flashSaleBroadcast — onCreate trigger on flashSales/{id}:
//                      queries all opted-in users, filters to within 3 miles of
//                      van position using Haversine, sends SMS via Twilio.
//
// Trigger: Firestore onUpdate on orders/{orderId}
//   Fires when status changes to 'ready'.
//   1. Reads customerPhone + firstName from order / user profile.
//   2. Reads vendor displayName + messagingEnabled + messagingChannel from vendors/{vendorId}.
//   3. If messagingEnabled === false, skips notification.
//   4. Sends SMS or WhatsApp (based on messagingChannel) via Twilio.
//   5. Logs outcome back to the order doc.
//
// WhatsApp — requires a Meta-approved template named 'order_ready_notification'.
// The Twilio Content SID for that template goes in TWILIO_WHATSAPP_CONTENT_SID.
// Template variables: {{1}} = firstName, {{2}} = vendorName.
//
// Required: create functions/.env with your Twilio credentials (never commit this file).
//   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
//   TWILIO_AUTH_TOKEN=your_auth_token
//   TWILIO_SMS_FROM=+44XXXXXXXXXX
//   TWILIO_WHATSAPP_CONTENT_SID=HXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
//   GOOGLE_GEOCODING_API_KEY=your_google_geocoding_api_key
//
// Required Firestore field (set once per vendor in Firebase Console):
//   vendors/lamuletti  ->  displayName: "La Muletti"
// ============================================================================

const functions = require('firebase-functions');
const admin     = require('firebase-admin');
const twilio    = require('twilio');

admin.initializeApp();

// -- Feature 16 - orderReadyNotification -------------------------------------

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

    // No phone - nothing to notify
    if (!customerPhone) {
      console.log('[F16] Order ' + orderId + ' (' + orderRef + ') has no customerPhone - skipping');
      return null;
    }

    // -- Resolve firstName --------------------------------------------------
    let firstName = 'there';

    if (customerId) {
      try {
        const userDoc = await admin.firestore()
          .collection('users')
          .doc(customerId)
          .get();
        if (userDoc.exists && userDoc.data().firstName) {
          firstName = userDoc.data().firstName;
        }
      } catch (err) {
        console.warn('[F16] Could not read user profile for ' + customerId + ':', err.message);
      }
    } else if (customerName) {
      firstName = customerName.trim().split(' ')[0];
    }

    // -- Resolve vendor display name, messaging flag + channel --------------
    let vendorName       = 'the kitchen';
    let messagingChannel = 'sms'; // 'sms' | 'whatsapp' — default sms

    try {
      const vendorDoc = await admin.firestore()
        .collection('vendors')
        .doc(vendorId)
        .get();

      if (vendorDoc.exists) {
        const vd = vendorDoc.data();
        if (vd.displayName)               vendorName       = vd.displayName;
        if (vd.messagingEnabled === false) {
          console.log('[F16] Messaging disabled for vendor ' + vendorId + ' - skipping order ' + orderRef);
          return null;
        }
        if (vd.messagingChannel === 'whatsapp') messagingChannel = 'whatsapp';
      }
    } catch (err) {
      console.warn('[F16] Could not read vendor doc for ' + vendorId + ':', err.message);
    }

    // -- Twilio credentials from environment (.env file) -------------------
    const client  = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    const fromSMS = process.env.TWILIO_SMS_FROM;

    let notificationSent = false;
    let channel          = null;
    let errorDetail      = null;

    if (messagingChannel === 'whatsapp') {
      // -- WhatsApp notification via Meta-approved template ------------------
      // Template: 'order_ready_notification'
      // Variables: {{1}} = firstName, {{2}} = vendorName
      const contentSid = process.env.TWILIO_WHATSAPP_CONTENT_SID;

      if (!contentSid) {
        console.error('[F16] TWILIO_WHATSAPP_CONTENT_SID not set — falling back to SMS for order ' + orderRef);
        // Fall through to SMS below
      } else {
        try {
          await client.messages.create({
            from:             'whatsapp:' + fromSMS,
            to:               'whatsapp:' + customerPhone,
            contentSid:       contentSid,
            contentVariables: JSON.stringify({ '1': firstName, '2': vendorName }),
          });
          notificationSent = true;
          channel          = 'whatsapp';
          console.log('[F16] WhatsApp sent -> ' + customerPhone + ' | order ' + orderRef);
        } catch (waErr) {
          console.error('[F16] WhatsApp failed for order ' + orderRef + ':', waErr.message);
          errorDetail = 'WhatsApp: ' + waErr.message;
        }
      }
    }

    // Send SMS if: channel is 'sms', OR WhatsApp was attempted but failed/not configured
    if (!notificationSent) {
      try {
        await client.messages.create({
          from: fromSMS,
          to:   customerPhone,
          body: 'Hi ' + firstName + ', your order from ' + vendorName + ' is ready for collection! Thanks for your order – see you soon.',
        });
        notificationSent = true;
        channel          = 'sms';
        console.log('[F16] SMS sent -> ' + customerPhone + ' | order ' + orderRef);
      } catch (smsErr) {
        console.error('[F16] SMS failed for order ' + orderRef + ':', smsErr.message);
        errorDetail = 'SMS: ' + smsErr.message;
      }
    }

    // -- Log outcome back to order doc -------------------------------------

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
// Called by the customer app when they submit their postcode on the account page.
// Validates the postcode format, geocodes via Google Geocoding API (server-side
// so the API key is never exposed to the browser), then writes postcode +
// postcodeLatLng to users/{uid} in Firestore.
// ============================================================================

const UK_POSTCODE_RE = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i;

exports.geocodePostcode = functions
  .region('europe-west2')
  .https.onCall(async (data, context) => {

    // Auth guard — must be signed in
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Must be signed in.');
    }

    const uid      = context.auth.uid;
    const postcode = (data.postcode || '').trim();

    // Server-side postcode validation
    if (!UK_POSTCODE_RE.test(postcode)) {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid UK postcode.');
    }

    const apiKey = process.env.GOOGLE_GEOCODING_API_KEY;
    if (!apiKey) {
      console.error('[F19] GOOGLE_GEOCODING_API_KEY not set in environment.');
      throw new functions.https.HttpsError('internal', 'Geocoding not configured.');
    }

    // Call Google Geocoding API
    const url = 'https://maps.googleapis.com/maps/api/geocode/json'
      + '?address=' + encodeURIComponent(postcode + ', UK')
      + '&key=' + apiKey;

    let lat, lng;
    try {
      const res  = await fetch(url);
      const json = await res.json();

      if (json.status !== 'OK' || !json.results || json.results.length === 0) {
        console.warn('[F19] Geocoding returned status:', json.status, 'for postcode:', postcode);
        throw new functions.https.HttpsError('not-found', 'Could not geocode postcode.');
      }

      const location = json.results[0].geometry.location;
      lat = location.lat;
      lng = location.lng;
    } catch (err) {
      if (err instanceof functions.https.HttpsError) throw err;
      console.error('[F19] Geocoding fetch error:', err.message);
      throw new functions.https.HttpsError('internal', 'Geocoding request failed.');
    }

    // Write to Firestore
    await admin.firestore()
      .collection('users')
      .doc(uid)
      .set({ postcode, postcodeLatLng: { lat, lng } }, { merge: true });

    console.log('[F19] Postcode saved for user ' + uid + ': ' + postcode + ' -> ' + lat + ',' + lng);
    return { success: true };
  });

// ============================================================================
// Feature 19 — flashSaleBroadcast (Firestore onCreate trigger)
// Triggered when a new doc is written to flashSales/{id} by the kitchen dashboard.
// Expected doc shape:
//   { vendorId, message, vanLat, vanLng, createdAt, sentBy }
//
// Steps:
//   1. Reads all users who have a postcodeLatLng set.
//   2. Filters to those within FLASH_SALE_RADIUS_MILES of the van's position.
//   3. Sends each an SMS via Twilio.
//   4. Logs results (sentCount, skippedCount, errors) back to the flashSales doc.
//
// Note: Flash sale broadcasts always use SMS. WhatsApp marketing templates
// require separate Meta approval — add WhatsApp routing here once approved.
// ============================================================================

const FLASH_SALE_RADIUS_MILES = 3;

/** Haversine distance in miles between two lat/lng pairs. */
function haversineMiles(lat1, lng1, lat2, lng2) {
  const R    = 3958.8; // Earth radius in miles
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

    const data = snap.data();
    const { vendorId, message, vanLat, vanLng } = data;

    if (!vendorId || !message || vanLat == null || vanLng == null) {
      console.error('[F19] flashSaleBroadcast: missing required fields on doc', context.params.flashSaleId);
      await snap.ref.update({ status: 'error', error: 'Missing required fields.' });
      return null;
    }

    // Check vendor messagingEnabled + read displayName for SMS prefix
    let vendorName = null;
    try {
      const vendorDoc = await admin.firestore().collection('vendors').doc(vendorId).get();
      if (vendorDoc.exists) {
        if (vendorDoc.data().messagingEnabled === false) {
          console.log('[F19] Messaging disabled for vendor ' + vendorId + ' — aborting flash sale broadcast.');
          await snap.ref.update({ status: 'skipped', reason: 'messagingEnabled=false' });
          return null;
        }
        vendorName = vendorDoc.data().displayName || null;
      }
    } catch (err) {
      console.warn('[F19] Could not read vendor doc:', err.message);
    }

    // Prefix the message with the vendor name so recipients immediately know who's texting them
    const smsBody = vendorName ? vendorName + ': ' + message : message;

    // Query all users with a postcode location
    const usersSnap = await admin.firestore()
      .collection('users')
      .where('postcodeLatLng', '!=', null)
      .get();

    if (usersSnap.empty) {
      console.log('[F19] No opted-in users found.');
      await snap.ref.update({ status: 'done', sentCount: 0, skippedCount: 0 });
      return null;
    }

    const client  = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    const fromSMS = process.env.TWILIO_SMS_FROM;

    let sentCount    = 0;
    let skippedCount = 0;
    const errors     = [];

    for (const userDoc of usersSnap.docs) {
      const user = userDoc.data();
      if (!user.postcodeLatLng || !user.phone) {
        skippedCount++;
        continue;
      }

      const dist = haversineMiles(vanLat, vanLng, user.postcodeLatLng.lat, user.postcodeLatLng.lng);

      if (dist > FLASH_SALE_RADIUS_MILES) {
        skippedCount++;
        continue;
      }

      try {
        await client.messages.create({
          from: fromSMS,
          to:   user.phone,
          body: smsBody,
        });
        sentCount++;
        console.log('[F19] SMS sent to ' + userDoc.id + ' (' + dist.toFixed(1) + ' miles away)');
      } catch (smsErr) {
        console.error('[F19] SMS failed for user ' + userDoc.id + ':', smsErr.message);
        errors.push(userDoc.id + ': ' + smsErr.message);
      }
    }

    await snap.ref.update({
      status:       'done',
      sentCount,
      skippedCount,
      errors:       errors.length ? errors : [],
      completedAt:  admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log('[F19] Flash sale broadcast complete. Sent: ' + sentCount + ', Skipped: ' + skippedCount);
    return null;
  });
