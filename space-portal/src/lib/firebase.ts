'use client';

import { getApps, initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCland5-oqbKocaGPxtF8GoplpvwkFTzwA",
  authDomain: "spli-d031a.firebaseapp.com",
  projectId: "spli-d031a",
  storageBucket: "spli-d031a.firebasestorage.app",
  messagingSenderId: "728625628899",
  appId: "1:728625628899:web:0d188215d527430eb267d6",
  measurementId: "G-WEHZ89C02W"
};

// Initialize Firebase only if it hasn't been initialized
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize services
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