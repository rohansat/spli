'use client';

import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyCland5-oqbKocaGPxtF8GoplpvwkFTzwA",
  authDomain: "spli-d031a.firebaseapp.com",
  projectId: "spli-d031a",
  storageBucket: "spli-d031a.firebasestorage.app",
  messagingSenderId: "728625628899",
  appId: "1:728625628899:web:0d188215d527430eb267d6",
  measurementId: "G-WEHZ89C02W"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Analytics and Auth
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}
const auth = getAuth(app);

export { auth, analytics }; 