"use client";

import { ApplicationProvider } from "@/components/providers/ApplicationProvider";
import { Navbar } from "@/components/Navbar";
import { useSession } from 'next-auth/react';
import { usePathname } from "next/navigation";
import { AICursorButton } from "@/components/ui/ai-cursor-button";
import { AIAssistantPanel, AIAssistantPanelHandle } from "@/components/ui/AIAssistantPanel";
import { Toaster } from "@/components/ui/toaster";
import React, { useRef, useState, useEffect } from "react";
import { useApplication } from "@/components/providers/ApplicationProvider";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [showFloatingChat, setShowFloatingChat] = useState(false);
  const floatingChatRef = useRef<AIAssistantPanelHandle>(null);
  const chatPanelRef = useRef<HTMLDivElement>(null);
  const { uploadDocument } = useApplication();
  
  // Dev mode: Check for mock session in localStorage
  const [devMode, setDevMode] = useState(false);
  const [devSession, setDevSession] = useState<any>(null);
  
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const stored = localStorage.getItem('dev_session');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setDevSession(parsed);
          setDevMode(true);
        } catch (e) {
          // Invalid stored session
        }
      }
    }
  }, []);

  // Use dev session if available in development mode
  const activeSession = process.env.NODE_ENV === 'development' && devSession ? devSession : session;
  const activeUser = activeSession?.user;

  // Close chat when clicking outside
  useEffect(() => {
    if (!showFloatingChat) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // Don't close if clicking the AI cursor button (fixed bottom-6 right-6)
      const aiCursorButtonContainer = target.closest('.fixed.bottom-6.right-6');
      if (aiCursorButtonContainer) {
        return;
      }
      
      // Don't close if clicking inside the chat panel
      if (chatPanelRef.current && chatPanelRef.current.contains(target)) {
        return;
      }
      
      // Close the chat for any other click outside
      setShowFloatingChat(false);
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFloatingChat]);

  if (status === 'loading' && !devMode) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="space-y-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="text-zinc-500">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!activeSession) {
    // In dev mode, show a dev signin option
    if (process.env.NODE_ENV === 'development') {
      return (
        <div className="flex items-center justify-center min-h-screen bg-black">
          <Card className="bg-zinc-900 border-zinc-800 p-8 max-w-md">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold text-white">Dev Mode Sign In</h2>
              <p className="text-zinc-400">Sign in with a mock account for local testing</p>
              <Button
                onClick={() => {
                  const mockSession = {
                    user: {
                      name: 'Dev User',
                      email: 'dev@example.com',
                      image: null
                    },
                    accessToken: 'dev-token'
                  };
                  localStorage.setItem('dev_session', JSON.stringify(mockSession));
                  setDevSession(mockSession);
                  setDevMode(true);
                  window.location.reload();
                }}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Sign In as Dev User
              </Button>
              <Button
                onClick={() => {
                  window.location.href = '/signin';
                }}
                variant="outline"
                className="w-full"
              >
                Use Real Authentication
              </Button>
            </div>
          </Card>
        </div>
      );
    }
    
    if (typeof window !== 'undefined') {
      window.location.href = '/signin';
    }
    return null;
  }

  return (
    <>
      <Navbar />
      {process.env.NODE_ENV === 'development' && devMode && (
        <div className="bg-yellow-500/10 border-b border-yellow-500/20 px-4 py-2 text-center">
          <p className="text-yellow-400 text-sm">
            🚧 Dev Mode Active - Using mock session ({activeUser?.email})
            <button
              onClick={() => {
                localStorage.removeItem('dev_session');
                setDevSession(null);
                setDevMode(false);
                window.location.href = '/signin';
              }}
              className="ml-4 text-yellow-300 hover:text-yellow-200 underline"
            >
              Sign Out
            </button>
          </p>
        </div>
      )}
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
                <div 
                  ref={chatPanelRef}
                  className="fixed bottom-24 right-8 z-50 w-full max-w-sm"
                >
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden">
                    <AIAssistantPanel
                      ref={floatingChatRef}
                      onCommand={async (cmd) => {
                        // Example: handle general commands or show a message
                        floatingChatRef.current?.addAIMsg("This is a general assistant. For form-specific actions, open the application form.");
                      }}
                      onFileDrop={async (files) => {
                        if (!activeUser) return;
                        for (const file of files) {
                          const newDocument = {
                            name: file.name,
                            type: "attachment" as const,
                            applicationId: undefined,
                            applicationName: undefined,
                            fileSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
                            url: URL.createObjectURL(file),
                            userId: activeUser.email || "",
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
