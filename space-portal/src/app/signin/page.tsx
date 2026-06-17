'use client';

import { signIn } from 'next-auth/react';
import { PublicNav } from '@/components/layout/PublicNav';
import { Footer } from '@/components/layout/Footer';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

const AUTH_ERRORS: Record<string, string> = {
  Configuration:
    'Server auth is misconfigured. Ensure NEXTAUTH_SECRET, NEXTAUTH_URL, AZURE_AD_CLIENT_ID, and AZURE_AD_CLIENT_SECRET are set in Netlify.',
  AccessDenied:
    'Access was denied. If you use a work/school account, your IT admin may need to approve the SPLI app in Azure AD.',
  Verification:
    'The sign-in link expired or was already used. Please try again.',
  OAuthSignin: 'Could not start Microsoft sign-in. Check Azure AD app registration settings.',
  OAuthCallback:
    'Microsoft sign-in callback failed. Verify the redirect URI in Azure matches your site URL.',
  OAuthCreateAccount: 'Could not create your account after sign-in.',
  Callback: 'Sign-in callback failed. The site URL may not match NEXTAUTH_URL in Netlify.',
  Default: 'Sign-in failed. Please try again or contact support.',
};

function SignInContent() {
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const errorCode = searchParams.get('error');
  const errorMessage = errorCode
    ? AUTH_ERRORS[errorCode] || AUTH_ERRORS.Default
    : null;

  useEffect(() => {
    if (errorCode) {
      setIsLoading(false);
    }
  }, [errorCode]);

  const handleMicrosoftSignIn = async () => {
    try {
      setIsLoading(true);
      const callbackUrl =
        typeof window !== 'undefined'
          ? `${window.location.origin}/dashboard`
          : '/dashboard';

      await signIn('azure-ad', {
        callbackUrl,
        redirect: true,
      });
    } catch (error) {
      console.error('Error signing in with Microsoft:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
          Welcome to SPLI
        </h1>
        <p className="text-lg text-white/70 leading-relaxed">
          Sign in to access your aerospace licensing portal
        </p>
      </div>

      <Card className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-2xl shadow-2xl">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-white mb-2">Sign In</h2>
          <p className="text-white/60">Use your Microsoft account to continue</p>
        </div>

        {errorMessage && (
          <Alert className="mb-6 border-orange-500/50 bg-orange-950/30 text-orange-100">
            <AlertTriangle className="h-4 w-4 text-orange-400" />
            <AlertTitle className="text-orange-200">Sign-in failed</AlertTitle>
            <AlertDescription className="text-orange-100/90 text-sm mt-1">
              {errorMessage}
              {errorCode && (
                <span className="block mt-2 text-xs text-orange-300/70">
                  Error code: {errorCode}
                </span>
              )}
            </AlertDescription>
          </Alert>
        )}

        <Button
          onClick={handleMicrosoftSignIn}
          disabled={isLoading}
          className="w-full h-14 bg-white hover:bg-gray-100 text-gray-900 font-semibold text-lg rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl border-0 mb-6 group"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900 mr-3" />
              Signing in...
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M0 0h11v11H0z" />
                <path d="M12 0h11v11H12z" />
                <path d="M0 12h11v11H0z" />
                <path d="M12 12h11v11H12z" />
              </svg>
              Continue with Microsoft
            </div>
          )}
        </Button>

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
  );
}

export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col bg-black">
      <PublicNav />
      <main className="flex-1 flex items-center justify-center px-4">
        <Suspense fallback={<div className="text-white/60">Loading...</div>}>
          <SignInContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
