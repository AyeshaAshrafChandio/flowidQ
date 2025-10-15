'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, onAuthStateChanged, User } from 'firebase/auth';

// Define types for context values
interface FirebaseContextValue {
  app: FirebaseApp;
  auth: Auth;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  error: Error | null;
}

// Create contexts
const FirebaseContext = createContext<FirebaseContextValue | null>(null);
const AuthContext = createContext<AuthContextValue>({ user: null, loading: true, error: null });

// --- Firebase Initialization ---
// This configuration will be populated by environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let firebaseApp: FirebaseApp;
let auth: Auth;

// Initialize Firebase only once
if (getApps().length === 0) {
  if (!firebaseConfig.apiKey) {
    throw new Error('Missing Firebase API Key. Please check your .env file.');
  }
  firebaseApp = initializeApp(firebaseConfig);
} else {
  firebaseApp = getApp();
}
auth = getAuth(firebaseApp);
// --- End Initialization ---


// Auth Provider Component: Manages user state
function AuthContextProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        setUser(user);
        setLoading(false);
      },
      (error) => {
        console.error('Firebase Auth State Error:', error);
        setError(error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const value = { user, loading, error };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Main Firebase Provider
export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const value = { app: firebaseApp, auth };
  return (
    <FirebaseContext.Provider value={value}>
      <AuthContextProvider>{children}</AuthContextProvider>
    </FirebaseContext.Provider>
  );
}

// Custom Hooks
export const useFirebase = (): FirebaseContextValue => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseClientProvider');
  }
  return context;
};

export const useAuth = (): Auth => {
  return useFirebase().auth;
}

export const useUser = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a FirebaseClientProvider');
  }
  return context;
};
