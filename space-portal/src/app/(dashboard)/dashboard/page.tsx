"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApplication } from "@/components/providers/ApplicationProvider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Application } from "@/types";
import { Clock, FilePlus, Rocket } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import { Footer } from "@/components/Footer";

export default function Dashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const { applications, createApplication, isLoading } = useApplication();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newApplicationName, setNewApplicationName] = useState("");
  const [newApplicationType, setNewApplicationType] = useState<Application["type"]>("Part 450");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateApplication = async () => {
    if (newApplicationName.trim() === "") return;
    
    try {
      setIsCreating(true);
      const newApp = await createApplication(newApplicationName, newApplicationType);
      setIsDialogOpen(false);
      setNewApplicationName("");
      router.push(`/applications/${newApp.id}`);
    } catch (error) {
      console.error("Error creating application:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadgeClass = (status: Application["status"]) => {
    switch (status) {
      case "draft":
        return "bg-zinc-500/20 text-zinc-300";
      case "under_review":
        return "bg-yellow-500/20 text-yellow-300";
      case "submitted":
        return "bg-blue-500/20 text-blue-300";
      case "approved":
        return "bg-green-500/20 text-green-300";
      default:
        return "bg-zinc-500/20 text-zinc-300";
    }
  };

  // Get active applications (not completed)
  const activeApplications = applications.filter(app => 
    app.status === "draft" || app.status === "under_review" || app.status === "submitted"
  );

  // Get launch status items
  const launchStatusItems = applications.filter(app => 
    app.status === "approved" || app.status === "under_review"
  );

  return (
    <div className="min-h-screen bg-black px-8 pt-24">
      <div className="max-w-[1400px] mx-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-[28px] font-medium text-white mb-2">
                  Welcome back{user?.displayName ? `, ${user.displayName}` : ''}
                </h1>
                <p className="text-zinc-500">
                  Manage your space launch license applications
                </p>
              </div>

              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-white hover:bg-white/90 text-black gap-2">
                    <FilePlus className="h-4 w-4" />
                    NEW APPLICATION
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-[#1A1A1A] border border-zinc-800">
                  <DialogHeader>
                    <DialogTitle className="text-white text-lg">Create New Application</DialogTitle>
                    <DialogDescription className="text-zinc-400">
                      Fill in the details to start a new license application.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white">
                        Application Name
                      </label>
                      <Input
                        value={newApplicationName}
                        onChange={(e) => setNewApplicationName(e.target.value)}
                        placeholder="Enter application name"
                        className="bg-[#111111] border-zinc-800 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white">
                        Application Type
                      </label>
                      <select
                        value={newApplicationType}
                        onChange={(e) => setNewApplicationType(e.target.value as Application["type"])}
                        className="w-full bg-[#111111] border-zinc-800 rounded-md p-2 text-white"
                      >
                        <option value="Part 450">Part 450</option>
                        <option value="License Amendment">License Amendment</option>
                        <option value="Safety Approval">Safety Approval</option>
                        <option value="Site License">Site License</option>
                      </select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      onClick={handleCreateApplication} 
                      className="bg-white hover:bg-white/90 text-black"
                      disabled={isCreating || !newApplicationName.trim()}
                    >
                      {isCreating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                          Creating...
                        </>
                      ) : (
                        "Create Application"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {applications.map((app) => (
                <Link key={app.id} href={`/applications/${app.id}`}>
                  <Card className="bg-[#1A1A1A] border-zinc-800 hover:border-zinc-700 transition-colors">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-white font-medium mb-1">{app.name}</h3>
                          <p className="text-sm text-zinc-400">{app.type}</p>
                        </div>
                        <div className={cn("px-2 py-1 rounded text-xs", getStatusBadgeClass(app.status))}>
                          {app.status}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-zinc-400">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {formatDate(app.createdAt)}
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}
