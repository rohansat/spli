'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { useAuth } from '@/lib/auth-context';
import { PublicNav } from '@/components/layout/PublicNav';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function SignUpPage() {
  const router = useRouter();
  const { signInWithGoogle, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (user) {
    router.push('/dashboard');
    return null;
  }

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, {
        displayName: name
      });
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Error signing up:', error);
      setError(error.message || 'Failed to sign up');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      await signInWithGoogle();
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Error signing up with Google:', error);
      setError(error.message || 'Failed to sign up with Google');
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <PublicNav />

      <main className="flex-1 flex items-center justify-center z-10 p-4">
        <Card className="w-full max-w-md bg-black/80 border border-white/20 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <h1 className="text-3xl font-bold text-white">CREATE ACCOUNT</h1>
            <p className="text-white/60 mt-2">
              Join SPLI today
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleEmailSignUp} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm text-white font-medium">
                  NAME
                </label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
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
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm text-white font-medium">
                  CONFIRM PASSWORD
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                {isLoading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
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
              onClick={handleGoogleSignUp}
              type="button"
              className="w-full py-6 flex items-center justify-center space-x-2 bg-white hover:bg-gray-100 text-black"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Google</span>
            </Button>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-white/60 text-sm">
              Already have an account?{' '}
              <Link href="/signin" className="text-white hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
