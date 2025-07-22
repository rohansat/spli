'use client';

import { signIn } from 'next-auth/react';
import { PublicNav } from '@/components/layout/PublicNav';
import { Footer } from '@/components/layout/Footer';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleMicrosoftSignIn = async () => {
    try {
      setIsLoading(true);
      await signIn('azure-ad', {
        callbackUrl: '/dashboard',
        redirect: true
      });
    } catch (error) {
      console.error('Error signing in with Microsoft:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <PublicNav />
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
              Welcome to SPLI
            </h1>
            <p className="text-lg text-white/70 leading-relaxed">
              Sign in to access your aerospace licensing portal
            </p>
          </div>

          {/* Sign In Card */}
          <Card className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-2xl shadow-2xl">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-white mb-2">
                Sign In
              </h2>
              <p className="text-white/60">
                Use your Microsoft account to continue
              </p>
            </div>

            {/* Microsoft Sign In Button */}
            <Button
              onClick={handleMicrosoftSignIn}
              disabled={isLoading}
              className="w-full h-14 bg-white hover:bg-gray-100 text-gray-900 font-semibold text-lg rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl border-0 mb-6 group"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900 mr-3"></div>
                  Signing in...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M0 0h11v11H0z"/>
                    <path d="M12 0h11v11H12z"/>
                    <path d="M0 12h11v11H0z"/>
                    <path d="M12 12h11v11H12z"/>
                  </svg>
                  Continue with Microsoft
                </div>
              )}
            </Button>

            {/* Additional Info */}
            <div className="text-center">
              <p className="text-sm text-white/50 leading-relaxed">
                By signing in, you agree to our{' '}
                <a href="/terms-of-service" className="text-blue-400 hover:text-blue-300 transition-colors">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="/privacy-policy" className="text-blue-400 hover:text-blue-300 transition-colors">
                  Privacy Policy
                </a>
              </p>
            </div>
          </Card>

          {/* Footer Info */}
          <div className="text-center mt-8">
            <p className="text-white/40 text-sm">
              Need help?{' '}
              <a 
                href="https://calendly.com/harikesh-tambareni/spli-ai-demo?month=2025-06"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
              >
                Schedule a demo
              </a>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
