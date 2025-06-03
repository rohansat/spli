'use client';

import { signIn } from 'next-auth/react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import Link from 'next/link';
import { useState } from 'react';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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
          <h2 className="text-3xl font-bold text-white text-center mb-2 tracking-wide">SIGN IN</h2>
          <p className="text-center text-white/60 mb-8">Enter your credentials to access your portal</p>
          <form className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-white mb-2">EMAIL</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-md bg-black border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-600"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-white mb-2">PASSWORD</label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-md bg-black border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-600"
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled
              />
            </div>
            <button
              type="button"
              className="w-full py-3 bg-white text-black rounded-md font-semibold text-lg transition cursor-not-allowed opacity-60"
              disabled
            >
              SIGN IN
            </button>
          </form>
          <div className="my-6 flex items-center justify-center">
            <div className="border-t border-white/20 flex-1" />
            <span className="mx-4 text-white/50 text-sm">or</span>
            <div className="border-t border-white/20 flex-1" />
          </div>
          <button
            onClick={handleMicrosoftSignIn}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold text-lg transition mb-4"
          >
            Sign in with Microsoft
          </button>
          <p className="text-center text-white/60 mt-6">
            Don't have an account?{' '}
            <Link
              href="https://calendly.com/harikesh-tambareni/spli-ai-demo?month=2025-06"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline font-semibold"
            >
              Get Started
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
