'use client';

import { useRouter } from "next/navigation";
import { ApplicationProvider } from "@/components/providers/ApplicationProvider";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function DemoPage() {
  const router = useRouter();

  return (
    <ApplicationProvider>
      <div className="min-h-screen flex flex-col bg-black">
        <Navbar userInitials="JD" />
        <div className="flex-grow pt-16">
          <div className="space-container py-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">MISSION CONTROL</h1>
                <p className="text-white/60">
                  Welcome to the demo. Manage your aerospace licensing applications.
                </p>
              </div>
            </div>
            <div className="grid gap-8">
              <iframe src="/demo/dashboard" className="w-full min-h-[800px] bg-transparent border-0" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </ApplicationProvider>
  );
} 