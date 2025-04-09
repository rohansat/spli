"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Rocket } from "lucide-react";
import Link from "next/link";
import { PublicNav } from "@/components/layout/PublicNav";

export default function DemoPage() {
  const router = useRouter();

  const handleNavigateToDashboard = () => {
    window.open("https://spliaidemo.netlify.app/dashboard", "_blank");
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Navigation Bar */}
      <PublicNav />

      {/* Main Content */}
      <div className="flex items-center justify-center p-4 flex-1 min-h-[calc(100vh-4rem)]">
        <div className="max-w-4xl w-full">
          <Card className="bg-zinc-900 border-zinc-800 text-white">
            <CardHeader className="space-y-1">
              <div className="flex items-center gap-2">
                <Rocket className="h-6 w-6 text-blue-500" />
                <CardTitle className="text-2xl font-bold">SPLI Portal Demo</CardTitle>
              </div>
              <CardDescription className="text-zinc-400">
                Experience our aerospace licensing platform in action
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-zinc-800 p-4 rounded-lg">
                  <h3 className="font-medium text-lg mb-2">Document Management</h3>
                  <p className="text-zinc-400 text-sm">Upload, organize, and track all your licensing documents in one place.</p>
                </div>
                <div className="bg-zinc-800 p-4 rounded-lg">
                  <h3 className="font-medium text-lg mb-2">Application Tracking</h3>
                  <p className="text-zinc-400 text-sm">Monitor the status of your applications in real-time.</p>
                </div>
                <div className="bg-zinc-800 p-4 rounded-lg">
                  <h3 className="font-medium text-lg mb-2">Compliance Tools</h3>
                  <p className="text-zinc-400 text-sm">Ensure your operations meet all regulatory requirements.</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button 
                onClick={handleNavigateToDashboard}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md flex items-center gap-2"
              >
                Launch Demo Dashboard
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
} 