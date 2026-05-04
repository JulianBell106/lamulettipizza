/**
 * ============================================================================
 * FIREBASE INITIALISATION — CDN compat mode
 * ============================================================================
 * ✅  PRODUCTION CONFIG — stalliq-production Firebase project (La Muletti live)
 * This file is branch-specific. See BRANCHES.md.
 * Do NOT merge this file from main into develop (enforced by .gitattributes).
 * ============================================================================
 * Loaded after Firebase SDK <script> tags in index.html.
 * Exposes globals: db, auth
 * ============================================================================
 */

const firebaseConfig = {
  apiKey:            "AIzaSyDEc-BcU0QZ0_omV-6sQj3papm6xphzuHI",
  authDomain:        "stalliq-production.firebaseapp.com",
  projectId:         "stalliq-production",
  storageBucket:     "stalliq-production.firebasestorage.app",
  messagingSenderId: "275171575630",
  appId:             "1:275171575630:web:f743be2295ef2b808b001f"
};

firebase.initializeApp(firebaseConfig);

const db   = firebase.firestore();
const auth = firebase.auth();

// ── App Check ─────────────────────────────────────────────────────────────────
// Protects Firestore + Auth from abuse. Using reCAPTCHA v3.
// Registered for: lamuletti-stalliq.netlify.app
// ─────────────────────────────────────────────────────────────────────────────
const _appCheckSiteKey = '6LelNtksAAAAAPEoa2QCW0RDzB7FHMsTNwyDaq4t';
if (_appCheckSiteKey !== 'PASTE_SITE_KEY_HERE') {
  firebase.appCheck().activate(
    new firebase.appCheck.ReCaptchaV3Provider(_appCheckSiteKey),
    true  // auto-refresh tokens
  );
}
