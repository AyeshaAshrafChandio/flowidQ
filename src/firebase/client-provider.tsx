
'use client';

import React, { ReactNode } from 'react';
import { FirebaseProvider, FirebaseContextValue } from './provider';
import { initializeFirebase } from './index';
import { firebaseConfig } from './config';

let firebaseContextValue: FirebaseContextValue | null = null;

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
