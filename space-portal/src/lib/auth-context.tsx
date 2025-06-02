'use client';

import { createContext, useContext } from 'react';

const AuthContext = createContext({ user: null, loading: false, signInWithGoogle: async () => {}, signOut: async () => {} });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <AuthContext.Provider value={{ user: null, loading: false, signInWithGoogle: async () => {}, signOut: async () => {} }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
} 