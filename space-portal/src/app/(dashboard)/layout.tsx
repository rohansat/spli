"use client";

import { Navbar } from "@/components/layout/Navbar";
import { ApplicationProvider } from "@/components/providers/ApplicationProvider";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/lib/auth-context";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/signin');
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

  const LoadingSpinner = ({ message }: { message: string }) => (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="space-y-4 text-center">
        <div className="w-16 h-16 border-4 border-t-white border-white/20 rounded-full animate-spin mx-auto"></div>
        <p className="text-white/60">{message}</p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-zinc-900">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
