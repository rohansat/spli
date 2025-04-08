"use client";

import { Navbar } from "@/components/layout/Navbar";
import { ApplicationProvider } from "@/components/providers/ApplicationProvider";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Skip auth check for demo access
    if (pathname.startsWith('/demo')) {
      return;
    }

    console.log('Dashboard layout effect:', { user: user?.email, loading });
    if (!loading && !user) {
      console.log('Redirecting to signin...');
      setIsRedirecting(true);
      router.replace('/signin');
    }
  }, [user, loading, router, pathname]);

  // Get user initials from display name or email
  const getUserInitials = () => {
    if (pathname.startsWith('/demo')) {
      return 'D';
    }
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

  const LoadingSpinner = ({ message }: { message: string }) => (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="space-y-4 text-center">
        <div className="w-16 h-16 border-4 border-t-white border-white/20 rounded-full animate-spin mx-auto"></div>
        <p className="text-white/60">{message}</p>
      </div>
    </div>
  );

  // Skip loading states for demo access
  if (pathname.startsWith('/demo')) {
    return (
      <ApplicationProvider>
        <div className="min-h-screen flex flex-col bg-black text-white">
          <Navbar userInitials="D" />
          <div className="flex-grow pt-16">
            {children}
          </div>
          <Footer />
        </div>
      </ApplicationProvider>
    );
  }

  // Show loading state while checking auth
  if (loading) {
    console.log('Showing loading spinner...');
    return <LoadingSpinner message="Loading..." />;
  }

  // Show loading state while redirecting
  if (isRedirecting || !user) {
    console.log('Showing redirect spinner...');
    return <LoadingSpinner message="Redirecting to sign in..." />;
  }

  console.log('Rendering dashboard layout...');
  return (
    <ApplicationProvider>
      <div className="min-h-screen flex flex-col bg-black text-white">
        <Navbar userInitials={getUserInitials()} />
        <div className="flex-grow pt-16">
          {children}
        </div>
        <Footer />
      </div>
    </ApplicationProvider>
  );
}
