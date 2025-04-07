'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Footer } from '@/components/layout/Footer';

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // For demo purposes, we're simulating authentication
  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // Redirect to dashboard on successful login
      router.push('/dashboard');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Background */}
      <div
        className="fixed inset-0 bg-cover bg-center opacity-20 z-0"
        style={{
          backgroundImage: "url('https://ext.same-assets.com/2380861668/2947458795.jpeg')",
        }}
      />

      {/* Header */}
      <header className="z-10 p-6">
        <Link href="/" className="text-white text-xl font-bold tracking-wider">
          SPACE PORTAL
        </Link>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center z-10 p-4">
        <Card className="w-full max-w-md bg-black/80 border border-white/20 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <h1 className="text-3xl font-bold text-white">SIGN IN</h1>
            <p className="text-white/60 mt-2">
              Enter your credentials to access your portal
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignIn} className="space-y-4">
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
              <Button
                type="submit"
                className="w-full spacex-button mt-6"
                disabled={isLoading}
              >
                {isLoading ? 'SIGNING IN...' : 'SIGN IN'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-white/60 text-sm">
              Don't have an account?{' '}
              <Link href="/signup" className="text-white hover:underline">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
