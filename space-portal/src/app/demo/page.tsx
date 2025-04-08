'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DemoPage() {
  const router = useRouter();

  useEffect(() => {
    // Set the demo mode cookie
    document.cookie = 'demoMode=true; path=/; max-age=86400; samesite=lax';
    
    // Redirect to dashboard
    router.push('/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="space-y-4 text-center">
        <div className="w-16 h-16 border-4 border-t-white border-white/20 rounded-full animate-spin mx-auto"></div>
        <p className="text-white/60">Loading demo...</p>
      </div>
    </div>
  );
} 