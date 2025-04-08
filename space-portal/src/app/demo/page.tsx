'use client';

import { useEffect } from 'react';
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApplication } from "@/components/providers/ApplicationProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Application } from "@/types";
import { FilePlus, Rocket, PlusCircle, Upload, X, Search, Filter, Download, Trash2, Star, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock data
const ACTIVE_APPLICATIONS = [
  {
    name: "FALCON X LAUNCH VEHICLE LICENSE",
    type: "Part 450",
    lastUpdated: "Feb 20, 2025",
    status: "UNDER REVIEW"
  },
  {
    name: "STARCRUISER REENTRY VEHICLE",
    type: "Part 450",
    lastUpdated: "Feb 27, 2025",
    status: "DRAFT"
  },
  {
    name: "LAUNCH SITE EXPANSION AMENDMENT",
    type: "License Amendment",
    lastUpdated: "Mar 5, 2025",
    status: "SUBMITTED"
  }
];

const LAUNCH_STATUS = [
  {
    type: "APPROVED LAUNCH WINDOW",
    name: "Orbital Facility Deployment",
    date: "May 15, 2025 - June 30, 2025",
    status: "approved"
  },
  {
    type: "PENDING APPROVAL",
    name: "Falcon X Launch Vehicle",
    date: "July 10, 2025 - August 5, 2025",
    status: "pending"
  },
  {
    type: "APPROVED LAUNCH WINDOW",
    name: "Starcruiser Reentry Test",
    date: "September 1, 2025 - September 15, 2025",
    status: "approved"
  }
];

export default function DemoPage() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newApplicationName, setNewApplicationName] = useState("");
  const [newApplicationType, setNewApplicationType] = useState("Part 450");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  useEffect(() => {
    // Set the demo mode cookie
    document.cookie = 'demoMode=true; path=/; max-age=86400; samesite=lax';
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles([...files, ...Array.from(e.target.files)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleCreateApplication = () => {
    if (newApplicationName.trim()) {
      // In a real app, this would create a new application
      setIsCreateDialogOpen(false);
      setNewApplicationName("");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "DRAFT":
        return "bg-gray-500";
      case "SUBMITTED":
        return "bg-blue-500";
      case "UNDER REVIEW":
        return "bg-yellow-500";
      case "APPROVED":
        return "bg-green-500";
      case "REJECTED":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const filteredApplications = ACTIVE_APPLICATIONS.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = !filterStatus || app.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="pt-16 space-container py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <div className="flex space-x-4">
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  New Application
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-zinc-900 text-white border-zinc-800">
                <DialogHeader>
                  <DialogTitle>Create New Application</DialogTitle>
                  <DialogDescription className="text-zinc-400">
                    Fill in the details to create a new application.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Application Name</label>
                    <Input 
                      value={newApplicationName}
                      onChange={(e) => setNewApplicationName(e.target.value)}
                      className="bg-zinc-800 border-zinc-700 text-white"
                      placeholder="Enter application name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Application Type</label>
                    <select 
                      value={newApplicationType}
                      onChange={(e) => setNewApplicationType(e.target.value)}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white"
                    >
                      <option value="Part 450">Part 450</option>
                      <option value="License Amendment">License Amendment</option>
                      <option value="Experimental Permit">Experimental Permit</option>
                    </select>
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsCreateDialogOpen(false)}
                    className="bg-transparent border-zinc-700 text-white hover:bg-zinc-800"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateApplication}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Create
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Active Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{ACTIVE_APPLICATIONS.length}</p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Approved Launches</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {LAUNCH_STATUS.filter(launch => launch.status === "approved").length}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Pending Approvals</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {LAUNCH_STATUS.filter(launch => launch.status === "pending").length}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Active Applications</h2>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input 
                placeholder="Search applications..." 
                className="pl-10 bg-zinc-900 border-zinc-800 text-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className={cn(
                  "bg-zinc-900 border-zinc-800 text-white",
                  !filterStatus && "bg-zinc-800"
                )}
                onClick={() => setFilterStatus(null)}
              >
                All
              </Button>
              <Button 
                variant="outline" 
                className={cn(
                  "bg-zinc-900 border-zinc-800 text-white",
                  filterStatus === "DRAFT" && "bg-zinc-800"
                )}
                onClick={() => setFilterStatus("DRAFT")}
              >
                Draft
              </Button>
              <Button 
                variant="outline" 
                className={cn(
                  "bg-zinc-900 border-zinc-800 text-white",
                  filterStatus === "SUBMITTED" && "bg-zinc-800"
                )}
                onClick={() => setFilterStatus("SUBMITTED")}
              >
                Submitted
              </Button>
              <Button 
                variant="outline" 
                className={cn(
                  "bg-zinc-900 border-zinc-800 text-white",
                  filterStatus === "UNDER REVIEW" && "bg-zinc-800"
                )}
                onClick={() => setFilterStatus("UNDER REVIEW")}
              >
                Under Review
              </Button>
            </div>
          </div>
          <div className="bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800 hover:bg-zinc-800/50">
                  <TableHead className="text-zinc-400">Application Name</TableHead>
                  <TableHead className="text-zinc-400">Type</TableHead>
                  <TableHead className="text-zinc-400">Last Updated</TableHead>
                  <TableHead className="text-zinc-400">Status</TableHead>
                  <TableHead className="text-zinc-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.map((app, index) => (
                  <TableRow key={index} className="border-zinc-800 hover:bg-zinc-800/50">
                    <TableCell className="font-medium">{app.name}</TableCell>
                    <TableCell>{app.type}</TableCell>
                    <TableCell>{app.lastUpdated}</TableCell>
                    <TableCell>
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        getStatusBadgeClass(app.status as string)
                      )}>
                        {app.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-4">Launch Schedule</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {LAUNCH_STATUS.map((launch, index) => (
              <Card key={index} className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{launch.name}</CardTitle>
                      <CardDescription className="text-zinc-400">
                        {launch.type}
                      </CardDescription>
                    </div>
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      launch.status === "approved" ? "bg-green-500" : "bg-yellow-500"
                    )}>
                      {launch.status === "approved" ? "Approved" : "Pending"}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-zinc-400">{launch.date}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 