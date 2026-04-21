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
