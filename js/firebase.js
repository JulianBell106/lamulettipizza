/**
 * ============================================================================
 * FIREBASE INITIALISATION — CDN compat mode
 * ============================================================================
 * Loaded after Firebase SDK <script> tags in index.html.
 * Exposes globals: db, auth
 * ============================================================================
 */

const firebaseConfig = {
  apiKey:            "AIzaSyAtM4FeUaEfzDJBoeODFqs7HOSHzpSaC5Y",
  authDomain:        "stalliq.firebaseapp.com",
  projectId:         "stalliq",
  storageBucket:     "stalliq.firebasestorage.app",
  messagingSenderId: "619290110631",
  appId:             "1:619290110631:web:6f98f7046d2e2b0f49c982"
};

firebase.initializeApp(firebaseConfig);

const db   = firebase.firestore();
const auth = firebase.auth();

// ── App Check (Session 15b) ───────────────────────────────────────────────────
// Protects Firestore + Auth from abuse. Using reCAPTCHA v3.
// ⚠️  Replace PASTE_SITE_KEY_HERE with the reCAPTCHA v3 site key from
//     https://www.google.com/recaptcha/admin once registered.
// Do NOT enforce in Firebase console until this is tested on the live domain.
// ─────────────────────────────────────────────────────────────────────────────
const _appCheckSiteKey = '6LdpxcwsAAAAAG16kVWZ7ZURiKERr6S8k3HBnZF-';
if (_appCheckSiteKey !== 'PASTE_SITE_KEY_HERE') {
  firebase.appCheck().activate(
    new firebase.appCheck.ReCaptchaV3Provider(_appCheckSiteKey),
    true  // auto-refresh tokens
  );
}
