'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from './firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Handle auth state changes
  useEffect(() => {
    console.log('Setting up auth state listener');
    
    const unsubscribe = auth.onAuthStateChanged((user) => {
      console.log('Auth state changed:', user ? `User logged in: ${user.email}` : 'No user');
      setUser(user);
      setLoading(false);
    }, (error) => {
      console.error('Auth state change error:', error);
      setLoading(false);
    });

    return () => {
      console.log('Cleaning up auth state listener');
      unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    console.log('Starting Google sign in...');
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      console.log('Google sign in successful:', result.user.email);
      // Don't set loading false here - let the auth state listener handle it
    } catch (error) {
      console.error('Error signing in with Google:', error);
      setLoading(false);
      throw error;
    }
  };

  const signOut = async () => {
    console.log('Starting sign out...');
    try {
      await auth.signOut();
      console.log('Sign out successful');
      // Don't set loading false here - let the auth state listener handle it
    } catch (error) {
      console.error('Error signing out:', error);
      setLoading(false);
      throw error;
    }
  };

  console.log('Current auth state:', { user: user?.email, loading });

  const value = {
    user,
    loading,
    signInWithGoogle,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 