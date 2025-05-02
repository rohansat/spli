'use client';

import { getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDYtXNHMoFN2dF4lqRDxPAFtUQqxPw4MXE",
  authDomain: "space-portal-dev.firebaseapp.com",
  projectId: "space-portal-dev",
  storageBucket: "space-portal-dev.appspot.com",
  messagingSenderId: "1098979847391",
  appId: "1:1098979847391:web:a9a3d0b5c7a7b5b5b5b5b5"
};

// Initialize Firebase only if it hasn't been initialized
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Export app by default
export default app; 