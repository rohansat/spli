"use client";

import { Navbar } from "@/components/layout/Navbar";
import { ApplicationProvider } from "@/components/providers/ApplicationProvider";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      console.log('No user found, redirecting to signin');
      router.replace('/signin');
    } else if (user && window.location.pathname === '/') {
      console.log('User found, redirecting to dashboard');
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="space-y-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="text-zinc-500">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // If no user, render nothing (redirect will happen)
  if (!user) {
    return null;
  }

  // User is authenticated, render dashboard layout
  return (
    <div className="min-h-screen bg-black">
      <ApplicationProvider>
        <div className="flex flex-col min-h-screen">
          <Navbar userInitials={user.displayName?.[0] || user.email?.[0] || 'A'} />
          <main className="flex-1">
            {children}
          </main>
        </div>
      </ApplicationProvider>
    </div>
  );
}
