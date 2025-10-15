
import { initializeApp, getApps, getApp, FirebaseOptions } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
let app;
// Check if Firebase is already initialized
if (getApps().length === 0) {
  // Check that the config has been populated
  if (firebaseConfig.apiKey) {
    app = initializeApp(firebaseConfig);
  } else {
    // This will happen on the server-side, and is expected.
    // The client will have the env vars.
    // You can add a log here for debugging if you want.
    // console.log("Firebase config is missing. This is expected on the server.");
  }
} else {
  // If already initialized, get the app
  app = getApp();
}

// We need to be careful here because app might be undefined on the server.
const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;

// This check is for client-side debugging, it shouldn't log on the server.
if (typeof window !== 'undefined' && !auth && process.env.NODE_ENV !== 'test') {
    console.error("Firebase Auth could not be initialized on the client. Please check your configuration.");
}


export { app, auth, db };
