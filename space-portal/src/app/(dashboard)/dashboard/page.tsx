"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApplication } from "@/components/providers/ApplicationProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { currentUser } from "@/lib/mock-data";
import { Application } from "@/types";
import { FilePlus, Rocket, PlusCircle } from "lucide-react";

export default function Dashboard() {
  const router = useRouter();
  const { applications, createApplication } = useApplication();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newApplicationName, setNewApplicationName] = useState("");
  const [newApplicationType, setNewApplicationType] = useState<Application["type"]>("Part 450");

  const handleCreateApplication = () => {
    if (newApplicationName.trim() === "") return;

    const newApp = createApplication(newApplicationName, newApplicationType);
    setIsDialogOpen(false);
    setNewApplicationName("");

    // Redirect to the new application form
    router.push(`/applications/${newApp.id}`);
  };

  // Format date to be more readable
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get status badge class based on status
  const getStatusBadgeClass = (status: Application["status"]) => {
    switch (status) {
      case "draft":
        return "bg-gray-500/20 text-gray-200";
      case "under_review":
        return "bg-yellow-500/20 text-yellow-300";
      case "awaiting_action":
        return "bg-blue-500/20 text-blue-300";
      case "active":
        return "bg-green-500/20 text-green-300";
      default:
        return "bg-gray-500/20 text-gray-200";
    }
  };

  return (
    <div className="space-container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">MISSION CONTROL</h1>
          <p className="text-white/60">
            Welcome back, {currentUser.name}. Manage your aerospace licensing applications.
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="spacex-button mt-4 md:mt-0">
              <PlusCircle className="mr-2 h-4 w-4" />
              NEW APPLICATION
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-black text-white border border-white/20">
            <DialogHeader>
              <DialogTitle>Create New Application</DialogTitle>
              <DialogDescription className="text-white/60">
                Fill in the details to start a new license application.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Application Name
                </label>
                <Input
                  id="name"
                  value={newApplicationName}
                  onChange={(e) => setNewApplicationName(e.target.value)}
                  placeholder="e.g., Mars Lander Launch Vehicle"
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="type" className="text-sm font-medium">
                  Application Type
                </label>
                <select
                  id="type"
                  value={newApplicationType}
                  onChange={(e) => setNewApplicationType(e.target.value as Application["type"])}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 text-white rounded-md"
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
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="border-white/40 text-white"
              >
                Cancel
              </Button>
              <Button onClick={handleCreateApplication} className="spacex-button">
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <Card className="space-card bg-gradient-to-br from-black to-zinc-900">
          <CardHeader>
            <CardTitle>Pending Actions</CardTitle>
            <CardDescription className="text-white/60">
              Applications awaiting your attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            {applications.length > 0 ? (
              <div className="space-y-2">
                {applications.filter(app => app.status !== 'active').map((app) => (
                  <Link
                    key={app.id}
                    href={`/applications/${app.id}`}
                    className="block p-4 border border-white/10 hover:border-white/30 bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-white font-medium">{app.name}</h3>
                        <p className="text-sm text-white/60">
                          {app.type} • Last updated {formatDate(app.updatedAt)}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(
                          app.status
                        )}`}
                      >
                        {app.status === 'awaiting_action' ? 'ACTION NEEDED' : app.status.replace("_", " ").toUpperCase()}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-white/60">
                <FilePlus className="mx-auto h-10 w-10 mb-4 opacity-50" />
                <p>No pending actions</p>
                <p className="text-sm">Create a new application to get started</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="space-card bg-gradient-to-br from-black to-zinc-900">
          <CardHeader>
            <CardTitle>Launch Status</CardTitle>
            <CardDescription className="text-white/60">
              Recent and upcoming launches
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border border-white/10 bg-white/5">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <h3 className="text-white font-medium">Approved Launch Window</h3>
                </div>
                <p className="text-sm text-white/60 mb-1">
                  Orbital Facility Deployment
                </p>
                <p className="text-xs text-white/40">
                  May 15, 2025 - June 30, 2025
                </p>
              </div>

              <div className="p-4 border border-white/10 bg-white/5">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                  <h3 className="text-white font-medium">Pending Approval</h3>
                </div>
                <p className="text-sm text-white/60 mb-1">
                  Falcon X Launch Vehicle
                </p>
                <p className="text-xs text-white/40">
                  Submitted on {formatDate("2025-02-20T14:30:00Z")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="space-card">
        <CardHeader>
          <CardTitle>All Applications</CardTitle>
          <CardDescription className="text-white/60">
            Complete history of your license applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-white/10">
                <TableHead className="text-white">Name</TableHead>
                <TableHead className="text-white">Type</TableHead>
                <TableHead className="text-white">Status</TableHead>
                <TableHead className="text-white">Created</TableHead>
                <TableHead className="text-white">Last Update</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((app) => (
                <TableRow
                  key={app.id}
                  className="border-white/10 hover:bg-white/5 cursor-pointer"
                  onClick={() => router.push(`/applications/${app.id}`)}
                >
                  <TableCell className="font-medium text-white">{app.name}</TableCell>
                  <TableCell className="text-white/80">{app.type}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(
                        app.status
                      )}`}
                    >
                      {app.status.replace("_", " ").toUpperCase()}
                    </span>
                  </TableCell>
                  <TableCell className="text-white/60">{formatDate(app.createdAt)}</TableCell>
                  <TableCell className="text-white/60">{formatDate(app.updatedAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
