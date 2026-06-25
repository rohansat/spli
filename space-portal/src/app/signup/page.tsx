'use client';

import { LandingPageShell } from '@/components/landing/LandingPageShell';

export default function SignUpPage() {
  return (
    <LandingPageShell>
      <main className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 pb-16 pt-28">
        <div className="w-full max-w-md space-y-6 rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-center shadow-2xl shadow-black/30 backdrop-blur-md">
          <h2 className="text-3xl font-bold text-white">Create Account</h2>
          <p className="text-white/60">
            Account creation is handled by your Microsoft account. Please sign in with Microsoft or contact support for access.
          </p>
        </div>
      </main>
    </LandingPageShell>
  );
}
