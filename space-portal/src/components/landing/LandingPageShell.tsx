'use client';

import { Footer } from '@/components/layout/Footer';
import { PublicNav } from '@/components/layout/PublicNav';
import { LandingBackground } from '@/components/landing/LandingBackground';

interface LandingPageShellProps {
  children: React.ReactNode;
  variant?: 'hero' | 'section' | 'minimal';
  className?: string;
}

export function LandingPageShell({
  children,
  variant = 'section',
  className = '',
}: LandingPageShellProps) {
  return (
    <div className={`relative min-h-screen bg-black text-white ${className}`}>
      <LandingBackground variant={variant} />
      <PublicNav />
      <div className="relative z-10">{children}</div>
      <Footer />
    </div>
  );
}
