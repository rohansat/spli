"use client";

import { ApplicationProvider } from "@/components/providers/ApplicationProvider";
import { Navbar } from "@/components/Navbar";
import { useSession } from 'next-auth/react';
import { usePathname } from "next/navigation";
import { AICursorButton } from "@/components/ui/ai-cursor-button";
import { AIAssistantPanel, AIAssistantPanelHandle } from "@/components/ui/AIAssistantPanel";
import { Toaster } from "@/components/ui/toaster";
import React, { useRef, useState } from "react";
import { useApplication } from "@/components/providers/ApplicationProvider";

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [showFloatingChat, setShowFloatingChat] = useState(false);
  const floatingChatRef = useRef<AIAssistantPanelHandle>(null);
  const { uploadDocument } = useApplication();
  const user = session?.user;

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
    <>
      <Navbar />
      <div className="min-h-screen bg-black">
        <div className="flex flex-col min-h-screen">
          <main className="flex-1">
            {children}
          </main>
          {/* Floating AI Chat Button and Panel (not on application form page) */}
          {!(pathname && pathname.startsWith("/applications/")) && (
            <>
              <AICursorButton onClick={() => setShowFloatingChat(true)} />
              {showFloatingChat && (
                <div className="fixed bottom-24 right-8 z-50 w-full max-w-sm">
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden">
                    <AIAssistantPanel
                      ref={floatingChatRef}
                      onCommand={async (cmd) => {
                        // Example: handle general commands or show a message
                        floatingChatRef.current?.addAIMsg("This is a general assistant. For form-specific actions, open the application form.");
                      }}
                      onFileDrop={async (files) => {
                        if (!user) return;
                        for (const file of files) {
                          const newDocument = {
                            name: file.name,
                            type: "attachment" as const,
                            applicationId: undefined,
                            applicationName: undefined,
                            fileSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
                            url: URL.createObjectURL(file),
                            userId: user.email || "",
                          };
                          await uploadDocument(newDocument);
                          floatingChatRef.current?.addAIMsg(`Document "${file.name}" uploaded successfully and added to Document Management. You can find it in the Documents tab.`);
                        }
                      }}
                    />
                    <div className="flex justify-end p-2 bg-zinc-900 border-t border-zinc-800">
                      <button
                        className="text-zinc-400 hover:text-white text-xs px-3 py-1 rounded"
                        onClick={() => setShowFloatingChat(false)}
                        title="Close chat"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Toaster />
    </>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ApplicationProvider>
      <DashboardContent>{children}</DashboardContent>
    </ApplicationProvider>
  );
}
