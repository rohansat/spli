'use client';

import { getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBxEh6MZVxRZNgVvFO5zQY_DLWtHGMOz8Y",
  authDomain: "spli-dev.firebaseapp.com",
  projectId: "spli-dev",
  storageBucket: "spli-dev.appspot.com",
  messagingSenderId: "1098979847391",
  appId: "1:1098979847391:web:a9a3d0b5c7a7b5b5b5b5b5"
};

// Initialize Firebase only if it hasn't been initialized
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Initialize Analytics only on client side
let analytics = null;
if (typeof window !== 'undefined') {
  import('firebase/analytics').then(({ getAnalytics }) => {
    analytics = getAnalytics(app);
  });
}

export { analytics };

// Export app by default
export default app; 