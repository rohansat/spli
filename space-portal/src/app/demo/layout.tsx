"use client";

import { Navbar } from "@/components/layout/Navbar";
import { ApplicationProvider } from "@/components/providers/ApplicationProvider";
import { Footer } from "@/components/layout/Footer";

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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