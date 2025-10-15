
'use client';

import React, { ReactNode } from 'react';
import { FirebaseProvider, FirebaseContextValue } from './provider';
import { initializeFirebase } from './index';
import { FirebaseOptions } from 'firebase/app';

let firebaseContextValue: FirebaseContextValue | null = null;

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function getFirebaseContextValue(): FirebaseContextValue {
  if (firebaseContextValue) {
    return firebaseContextValue;
  }
  firebaseContextValue = initializeFirebase(firebaseConfig);
  return firebaseContextValue;
}

export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const value = getFirebaseContextValue();
  return <FirebaseProvider value={value}>{children}</FirebaseProvider>;
}
