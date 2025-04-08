"use client";

import { Navbar } from "@/components/layout/Navbar";
import { ApplicationProvider } from "@/components/providers/ApplicationProvider";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const router = useRouter();

  if (!user) {
    router.push('/signin');
    return null;
  }

  // Get user initials from display name or email
  const getUserInitials = () => {
    if (user.displayName) {
      return user.displayName
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase();
    }
    return user.email ? user.email[0].toUpperCase() : 'A';
  };

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
