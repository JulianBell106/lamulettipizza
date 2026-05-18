// ============================================================================
// Stalliq — Cloud Functions
// Feature 16 — Order Ready Notifications (WhatsApp + SMS fallback)
// Session 37 — 2026-05-17
//
// Trigger: Firestore onUpdate on orders/{orderId}
//   Fires when status changes to 'ready'.
//   1. Reads customerPhone + firstName from order / user profile.
//   2. Reads vendor displayName from vendors/{vendorId}.
//   3. Attempts WhatsApp send via Twilio content template.
//   4. Falls back to SMS if WhatsApp fails.
//   5. Logs outcome back to the order doc.
//
// Required: create functions/.env with your Twilio credentials (never commit this file).
//   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
//   TWILIO_AUTH_TOKEN=your_auth_token
//   TWILIO_WHATSAPP_FROM=whatsapp:+44XXXXXXXXXX
//   TWILIO_SMS_FROM=+44XXXXXXXXXX
//   TWILIO_TEMPLATE_SID=HXb0f2b4e74995392bf1f82095d577036c
//
// Required Firestore field (set once per vendor in Firebase Console):
//   vendors/lamuletti  →  displayName: "La Muletti"
// ============================================================================

const functions = require('firebase-functions');
const admin     = require('firebase-admin');
const twilio    = require('twilio');

admin.initializeApp();

// ── Feature 16 — orderReadyNotification ─────────────────────────────────────

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

    // No phone — nothing to notify
    if (!customerPhone) {
      console.log(`[F16] Order ${orderId} (${orderRef}) has no customerPhone — skipping`);
      return null;
    }

    // ── Resolve firstName ──────────────────────────────────────────────────
    // Phone-auth customers: look up users/{customerId}.firstName
    // Walk-in customers:    use first word of customerName
    // Fallback:             'there'

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
        console.warn(`[F16] Could not read user profile for ${customerId}:`, err.message);
      }
    } else if (customerName) {
      firstName = customerName.trim().split(' ')[0];
    }

    // ── Resolve vendor display name ────────────────────────────────────────
    // Set vendors/{vendorId}/displayName in Firebase Console at onboarding.

    let vendorName = 'the kitchen';

    try {
      const vendorDoc = await admin.firestore()
        .collection('vendors')
        .doc(vendorId)
        .get();
      if (vendorDoc.exists && vendorDoc.data().displayName) {
        vendorName = vendorDoc.data().displayName;
      }
    } catch (err) {
      console.warn(`[F16] Could not read vendor doc for ${vendorId}:`, err.message);
    }

    // ── Twilio credentials from environment (.env file) ───────────────────────

    const client      = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    const fromWA      = process.env.TWILIO_WHATSAPP_FROM;   // e.g. 'whatsapp:+44XXXXXXXXXX'
    const fromSMS     = process.env.TWILIO_SMS_FROM;        // e.g. '+44XXXXXXXXXX'
    const templateSid = process.env.TWILIO_TEMPLATE_SID;   // HXb0f2b4e74995392bf1f82095d577036c

    let notificationSent = false;
    let channel          = null;
    let errorDetail      = null;

    // ── SMS notification ───────────────────────────────────────────────────
    // WhatsApp available as a premium upgrade (future).

    try {
      await client.messages.create({
        from: fromSMS,
        to:   customerPhone,
        body: `Hi ${firstName}, your order from ${vendorName} is ready for collection! See you soon.`,
      });
      notificationSent = true;
      channel          = 'sms';
      console.log(`[F16] SMS sent → ${customerPhone} | order ${orderRef}`);
    } catch (smsErr) {
      console.error(`[F16] SMS failed for order ${orderRef}:`, smsErr.message);
      errorDetail = `SMS: ${smsErr.message}`;
    }

    // ── Log outcome back to order doc ──────────────────────────────────────

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
