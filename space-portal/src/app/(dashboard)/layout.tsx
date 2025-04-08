"use client";

import { Navbar } from "@/components/layout/Navbar";
import { ApplicationProvider } from "@/components/providers/ApplicationProvider";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/signin');
    }
  }, [user, loading, router]);

  // Get user initials from display name or email
  const getUserInitials = () => {
    if (!user) return 'A';
    if (user.displayName) {
      return user.displayName
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase();
    }
    return user.email ? user.email[0].toUpperCase() : 'A';
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="space-y-4 text-center">
          <div className="w-16 h-16 border-4 border-t-white border-white/20 rounded-full animate-spin mx-auto"></div>
          <p className="text-white/60">Loading...</p>
        </div>
      </div>
    );
  }

  // Show loading state while redirecting
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="space-y-4 text-center">
          <div className="w-16 h-16 border-4 border-t-white border-white/20 rounded-full animate-spin mx-auto"></div>
          <p className="text-white/60">Redirecting to sign in...</p>
        </div>
      </div>
    );
  }

  return (
    <ApplicationProvider>
      <div className="min-h-screen flex flex-col bg-black">
        <Navbar userInitials={getUserInitials()} />
        <div className="flex-grow pt-16">
          {children}
        </div>
        <Footer />
      </div>
    </ApplicationProvider>
  );
}
