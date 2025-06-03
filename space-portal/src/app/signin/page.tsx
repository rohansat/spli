'use client';

import { signIn } from 'next-auth/react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function SignInPage() {
  const handleMicrosoftSignIn = async () => {
    try {
      await signIn('azure-ad', {
        callbackUrl: '/dashboard',
        redirect: true
      });
    } catch (error) {
      console.error('Error signing in with Microsoft:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <Navbar />
      <main className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md p-8 bg-black/80 rounded-lg shadow-lg border border-white/20 mt-24 mb-12">
          <h2 className="text-3xl font-bold text-white text-center mb-8 tracking-wide">Sign in to SPLI</h2>
          <button
            onClick={handleMicrosoftSignIn}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold text-lg transition"
          >
            Sign in with Microsoft
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
