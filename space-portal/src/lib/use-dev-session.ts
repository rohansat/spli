'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';

/**
 * Custom hook that provides session data, with dev mode support
 * In development, checks localStorage for a mock session first
 */
export function useDevSession() {
  const { data: session, status } = useSession();
  const [devSession, setDevSession] = useState<any>(null);
  const [isDevMode, setIsDevMode] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const stored = localStorage.getItem('dev_session');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setDevSession(parsed);
          setIsDevMode(true);
        } catch (e) {
          // Invalid stored session
        }
      }
    }
  }, []);

  // Return dev session if available, otherwise real session
  const activeSession = process.env.NODE_ENV === 'development' && devSession ? devSession : session;
  
  return {
    data: activeSession,
    status: isDevMode ? 'authenticated' : status,
    user: activeSession?.user
  };
}

