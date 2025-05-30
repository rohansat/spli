'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { useAuth } from '@/lib/auth-context';
import { PublicNav } from '@/components/layout/PublicNav';
import { signInWithEmailAndPassword, AuthError, OAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function SignInPage() {
  const router = useRouter();
  const { signInWithGoogle, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  if (user) {
    return null;
  }

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/dashboard');
    } catch (error) {
      console.error('Error signing in:', error);
      const authError = error as AuthError;
      setError(authError.message || 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      router.push('/dashboard');
    } catch (error) {
      console.error('Error signing in with Google:', error);
      const authError = error as AuthError;
      setError(authError.message || 'Failed to sign in with Google');
    }
  };

  const handleMicrosoftSignIn = async () => {
    try {
      const provider = new OAuthProvider('microsoft.com');
      provider.setCustomParameters({
        prompt: 'select_account',
        tenant: 'common'
      });
      const result = await signInWithPopup(auth, provider);
      const credential = OAuthProvider.credentialFromResult(result);
      const accessToken = credential?.accessToken;
      if (accessToken) {
        localStorage.setItem('ms_access_token', accessToken);
      }
      router.push('/dashboard');
    } catch (error) {
      console.error('Error signing in with Microsoft:', error);
      const authError = error as AuthError;
      setError(authError.message || 'Failed to sign in with Microsoft');
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <PublicNav />

      <main className="flex-1 flex items-center justify-center z-10 p-4">
        <Card className="w-full max-w-md bg-black/80 border border-white/20 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <h1 className="text-3xl font-bold text-white">SIGN IN</h1>
            <p className="text-white/60 mt-2">
              Welcome back to SPLI
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleEmailSignIn} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm text-white font-medium">
                  EMAIL
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm text-white font-medium">
                  PASSWORD
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              {error && (
                <p className="text-red-500 text-sm">{error}</p>
              )}
              <Button
                type="submit"
                className="w-full spacex-button"
                disabled={isLoading}
              >
                {isLoading ? 'SIGNING IN...' : 'SIGN IN'}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-black text-white/60">Or continue with</span>
              </div>
            </div>

            <Button
              onClick={handleMicrosoftSignIn}
              type="button"
              className="w-full py-6 flex items-center justify-center space-x-2 bg-white hover:bg-gray-100 text-black mt-2"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <rect fill="#F25022" x="2" y="2" width="9" height="9" />
                <rect fill="#7FBA00" x="13" y="2" width="9" height="9" />
                <rect fill="#00A4EF" x="2" y="13" width="9" height="9" />
                <rect fill="#FFB900" x="13" y="13" width="9" height="9" />
              </svg>
              <span>Microsoft</span>
            </Button>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-white/60 text-sm">
              Don't have an account?{' '}
              <a href="https://calendly.com/harikesh-tambareni/spli-ai-demo" target="_blank" rel="noopener noreferrer" className="text-white hover:underline font-semibold">
                Get Started
              </a>
            </p>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
