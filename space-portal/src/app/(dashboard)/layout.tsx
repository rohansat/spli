"use client";

import { ApplicationProvider } from "@/components/providers/ApplicationProvider";
import { Navbar } from "@/components/Navbar";
import { useSession } from 'next-auth/react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="space-y-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="text-zinc-500">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    if (typeof window !== 'undefined') {
      window.location.href = '/signin';
    }
    return null;
  }

  return (
    <ApplicationProvider>
      <Navbar />
      <div className="min-h-screen bg-black">
        <div className="flex flex-col min-h-screen">
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </ApplicationProvider>
  );
}
