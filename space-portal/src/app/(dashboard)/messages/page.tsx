"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Mail, Search, Star, Trash2, Send, Plus, MessageSquare, AlertTriangle, Filter, X } from "lucide-react";
import { messages as mockMessages } from "@/lib/mock-data";
import { Message } from "@/types";
import { cn } from "@/lib/utils";
import { Footer } from "@/components/Footer";
import { useSession } from 'next-auth/react';

// Utility to strip HTML tags for preview
function stripHtml(html: string) {
  if (!html) return '';
  return html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

export default function MessagesPage() {
  const { data: session } = useSession();
  const accessToken = session?.accessToken;
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [newMessage, setNewMessage] = useState({
    recipient: "",
    subject: "",
    body: "",
  });
  const [mailbox, setMailbox] = useState<'inbox' | 'sent'>('inbox');
  
  // Filter states
  const [applicationFilter, setApplicationFilter] = useState<string>("all");
  const [applicationStatusFilter, setApplicationStatusFilter] = useState<string>("all");
  const [applicationTypeFilter, setApplicationTypeFilter] = useState<string>("all");
  const [faaFilter, setFaaFilter] = useState<string>("all");
  const [complianceFilter, setComplianceFilter] = useState<string>("all");
  const [licenseStatusFilter, setLicenseStatusFilter] = useState<string>("all");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  // Fetch Outlook emails from Microsoft Graph API
  useEffect(() => {
    if (!accessToken) return;
    const fetchEmails = async () => {
      try {
        const res = await fetch('https://graph.microsoft.com/v1.0/me/messages?$top=20', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        if (!res.ok) {
          const errorText = await res.text();
          console.error('Graph API error:', errorText);
          throw new Error('Failed to fetch emails');
        }
        const data = await res.json();
        const emails: Message[] = data.value.map((msg: unknown) => {
          const m = msg as {
            id: string;
            from?: { emailAddress?: { address?: string } };
            toRecipients?: { emailAddress: { address: string } }[];
            subject?: string;
            body?: { content?: string; contentType?: string };
            receivedDateTime?: string;
            isRead?: boolean;
          };
          return {
            id: m.id,
            sender: m.from?.emailAddress?.address || '',
            recipient: m.toRecipients?.map((r) => r.emailAddress.address).join(', ') || '',
            subject: m.subject || '',
            body: m.body?.content || '',
            bodyContentType: m.body?.contentType || 'text',
            createdAt: m.receivedDateTime,
            isRead: m.isRead,
            isAutomated: false,
            applicationId: undefined,
          };
        });
        setMessages(emails);
      } catch (error) {
        console.error('Error fetching Outlook emails:', error);
      }
    };
    fetchEmails();
  }, [accessToken]);

  // Filter messages based on mailbox and search
  const userEmail = session?.user?.email || '';
  const filteredMessages = messages.filter((msg) => {
    if (mailbox === 'inbox') {
      return msg.recipient.toLowerCase().includes(userEmail.toLowerCase());
    } else {
      return msg.sender.toLowerCase().includes(userEmail.toLowerCase());
    }
  }).filter(
    (msg) =>
      msg.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.sender.toLowerCase().includes(searchQuery.toLowerCase())
  ).filter((msg) => {
    // Application-related filters
    if (applicationFilter !== "all" && msg.applicationId !== applicationFilter) {
      return false;
    }
    
    // Application status filter (check subject/body for status keywords)
    if (applicationStatusFilter !== "all") {
      const content = `${msg.subject} ${msg.body}`.toLowerCase();
      const statusKeywords = {
        "pending": ["pending", "under review", "in progress", "submitted"],
        "approved": ["approved", "approval", "granted", "authorized"],
        "rejected": ["rejected", "denied", "not approved", "declined"]
      };
      if (!statusKeywords[applicationStatusFilter as keyof typeof statusKeywords]?.some(keyword => content.includes(keyword))) {
        return false;
      }
    }
    
    // Application type filter
    if (applicationTypeFilter !== "all") {
      const content = `${msg.subject} ${msg.body}`.toLowerCase();
      const typeKeywords = {
        "Part 450": ["part 450", "450", "commercial space"],
        "License Amendment": ["amendment", "modification", "change"],
        "Safety Approval": ["safety", "safety approval", "safety assessment"],
        "Site License": ["site license", "launch site", "facility"]
      };
      if (!typeKeywords[applicationTypeFilter as keyof typeof typeKeywords]?.some(keyword => content.includes(keyword))) {
        return false;
      }
    }
    
    // FAA Communications filter
    if (faaFilter !== "all") {
      const isFaaEmail = msg.sender.toLowerCase().includes("faa.gov") || 
                        msg.sender.toLowerCase().includes("faa") ||
                        msg.subject.toLowerCase().includes("faa") ||
                        msg.body.toLowerCase().includes("faa");
      if (faaFilter === "faa" && !isFaaEmail) return false;
      if (faaFilter === "non-faa" && isFaaEmail) return false;
    }
    
    // Compliance Updates filter
    if (complianceFilter !== "all") {
      const content = `${msg.subject} ${msg.body}`.toLowerCase();
      const complianceKeywords = ["compliance", "regulation", "regulatory", "requirement", "standard", "policy"];
      const hasComplianceContent = complianceKeywords.some(keyword => content.includes(keyword));
      if (complianceFilter === "compliance" && !hasComplianceContent) return false;
      if (complianceFilter === "non-compliance" && hasComplianceContent) return false;
    }
    
    // License Status filter
    if (licenseStatusFilter !== "all") {
      const content = `${msg.subject} ${msg.body}`.toLowerCase();
      const licenseKeywords = {
        "approval": ["license approved", "approval granted", "authorized"],
        "rejection": ["license denied", "rejection", "not approved"],
        "pending": ["license pending", "under review", "in process"]
      };
      if (!licenseKeywords[licenseStatusFilter as keyof typeof licenseKeywords]?.some(keyword => content.includes(keyword))) {
        return false;
      }
    }
    
    return true;
  });

  // Helper functions for filters
  const clearAllFilters = () => {
    setApplicationFilter("all");
    setApplicationStatusFilter("all");
    setApplicationTypeFilter("all");
    setFaaFilter("all");
    setComplianceFilter("all");
    setLicenseStatusFilter("all");
    setActiveFilters([]);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (applicationFilter !== "all") count++;
    if (applicationStatusFilter !== "all") count++;
    if (applicationTypeFilter !== "all") count++;
    if (faaFilter !== "all") count++;
    if (complianceFilter !== "all") count++;
    if (licenseStatusFilter !== "all") count++;
    return count;
  };

  // Update active filters display
  useEffect(() => {
    const active: string[] = [];
    if (applicationFilter !== "all") active.push(`Application: ${applicationFilter}`);
    if (applicationStatusFilter !== "all") active.push(`Status: ${applicationStatusFilter}`);
    if (applicationTypeFilter !== "all") active.push(`Type: ${applicationTypeFilter}`);
    if (faaFilter !== "all") active.push(`FAA: ${faaFilter === "faa" ? "FAA Only" : "Non-FAA"}`);
    if (complianceFilter !== "all") active.push(`Compliance: ${complianceFilter === "compliance" ? "Compliance Only" : "Non-Compliance"}`);
    if (licenseStatusFilter !== "all") active.push(`License: ${licenseStatusFilter}`);
    setActiveFilters(active);
  }, [applicationFilter, applicationStatusFilter, applicationTypeFilter, faaFilter, complianceFilter, licenseStatusFilter]);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();

    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  // Handle message selection
  const handleSelectMessage = (message: Message) => {
    setSelectedMessage(message);

    // Mark as read if not already
    if (!message.isRead) {
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === message.id ? { ...msg, isRead: true } : msg
        )
      );
    }
  };

  // Handle compose submission
  const handleSendMessage = async () => {
    if (!accessToken) return;
    try {
      const res = await fetch('https://graph.microsoft.com/v1.0/me/sendMail', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: {
            subject: newMessage.subject,
            body: {
              contentType: 'Text',
              content: newMessage.body,
            },
            toRecipients: [
              {
                emailAddress: {
                  address: newMessage.recipient,
                },
              },
            ],
          },
        }),
      });
      if (!res.ok) throw new Error('Failed to send email');
      // Optionally, refresh emails after sending
      setIsComposeOpen(false);
      setNewMessage({ recipient: '', subject: '', body: '' });
    } catch (err) {
      console.error('Error sending Outlook email:', err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <main className="flex-1 px-8 pt-24">
        <div className="max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">MESSAGES</h1>
          <p className="text-white/60">
            Communicate with FAA officials and receive automated notifications
          </p>
        </div>
        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          <button
            className={`px-4 py-2 rounded-md font-semibold border transition-colors ${mailbox === 'inbox' ? 'bg-white text-black border-white' : 'bg-black text-white border-white/40 hover:bg-white/10'}`}
            onClick={() => setMailbox('inbox')}
          >
            Inbox
          </button>
          <button
            className={`px-4 py-2 rounded-md font-semibold border transition-colors ${mailbox === 'sent' ? 'bg-white text-black border-white' : 'bg-black text-white border-white/40 hover:bg-white/10'}`}
            onClick={() => setMailbox('sent')}
          >
            Sent
          </button>
        </div>
        <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
          <DialogTrigger asChild>
            <Button className="spacex-button mt-4 md:mt-0">
              <Plus className="mr-2 h-4 w-4" />
              NEW MESSAGE
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-black text-white border border-white/20">
            <DialogHeader>
              <DialogTitle>Compose Message</DialogTitle>
              <DialogDescription className="text-white/60">
                Send a message to FAA officials
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="recipient" className="text-sm font-medium">
                  To
                </label>
                <Input
                  id="recipient"
                  value={newMessage.recipient}
                  onChange={(e) =>
                    setNewMessage({ ...newMessage, recipient: e.target.value })
                  }
                  placeholder="recipient@faa.gov"
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-medium">
                  Subject
                </label>
                <Input
                  id="subject"
                  value={newMessage.subject}
                  onChange={(e) =>
                    setNewMessage({ ...newMessage, subject: e.target.value })
                  }
                  placeholder="Enter subject"
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="body" className="text-sm font-medium">
                  Message
                </label>
                <Textarea
                  id="body"
                  value={newMessage.body}
                  onChange={(e) =>
                    setNewMessage({ ...newMessage, body: e.target.value })
                  }
                  placeholder="Type your message here"
                  rows={8}
                  className="bg-white/10 border-white/20 text-white max-h-[400px] overflow-y-auto"
                  autoResize={true}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsComposeOpen(false)}
                className="border-white/40 text-white"
              >
                Cancel
              </Button>
              <Button onClick={handleSendMessage} className="spacex-button">
                <Send className="mr-2 h-4 w-4" />
                Send
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card className="space-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Inbox</CardTitle>
                <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">
                  {messages.filter((m) => !m.isRead).length} Unread
                </span>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 h-4 w-4" />
                <Input
                  placeholder="Search messages..."
                  className="pl-10 bg-white/10 border-white/20 text-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              {/* Filter Controls */}
              <div className="flex flex-wrap gap-2 mt-3">
                {/* Application Filter */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 text-xs border-white/20 text-white/80 hover:text-white">
                      <Filter className="h-3 w-3 mr-1" />
                      Application
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-zinc-900 border-zinc-700">
                    <DropdownMenuItem onClick={() => setApplicationFilter("all")} className="text-white hover:bg-zinc-800">
                      All Applications
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setApplicationFilter("app-1")} className="text-white hover:bg-zinc-800">
                      Part 450 - Lunar Mission
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setApplicationFilter("app-2")} className="text-white hover:bg-zinc-800">
                      Site License - KSC
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Application Status Filter */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 text-xs border-white/20 text-white/80 hover:text-white">
                      <Filter className="h-3 w-3 mr-1" />
                      Status
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-zinc-900 border-zinc-700">
                    <DropdownMenuItem onClick={() => setApplicationStatusFilter("all")} className="text-white hover:bg-zinc-800">
                      All Statuses
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setApplicationStatusFilter("pending")} className="text-white hover:bg-zinc-800">
                      Pending
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setApplicationStatusFilter("approved")} className="text-white hover:bg-zinc-800">
                      Approved
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setApplicationStatusFilter("rejected")} className="text-white hover:bg-zinc-800">
                      Rejected
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Application Type Filter */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 text-xs border-white/20 text-white/80 hover:text-white">
                      <Filter className="h-3 w-3 mr-1" />
                      Type
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-zinc-900 border-zinc-700">
                    <DropdownMenuItem onClick={() => setApplicationTypeFilter("all")} className="text-white hover:bg-zinc-800">
                      All Types
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setApplicationTypeFilter("Part 450")} className="text-white hover:bg-zinc-800">
                      Part 450
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setApplicationTypeFilter("License Amendment")} className="text-white hover:bg-zinc-800">
                      License Amendment
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setApplicationTypeFilter("Safety Approval")} className="text-white hover:bg-zinc-800">
                      Safety Approval
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setApplicationTypeFilter("Site License")} className="text-white hover:bg-zinc-800">
                      Site License
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* FAA Communications Filter */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 text-xs border-white/20 text-white/80 hover:text-white">
                      <Filter className="h-3 w-3 mr-1" />
                      FAA
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-zinc-900 border-zinc-700">
                    <DropdownMenuItem onClick={() => setFaaFilter("all")} className="text-white hover:bg-zinc-800">
                      All Messages
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFaaFilter("faa")} className="text-white hover:bg-zinc-800">
                      FAA Only
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFaaFilter("non-faa")} className="text-white hover:bg-zinc-800">
                      Non-FAA
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Compliance Updates Filter */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 text-xs border-white/20 text-white/80 hover:text-white">
                      <Filter className="h-3 w-3 mr-1" />
                      Compliance
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-zinc-900 border-zinc-700">
                    <DropdownMenuItem onClick={() => setComplianceFilter("all")} className="text-white hover:bg-zinc-800">
                      All Messages
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setComplianceFilter("compliance")} className="text-white hover:bg-zinc-800">
                      Compliance Only
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setComplianceFilter("non-compliance")} className="text-white hover:bg-zinc-800">
                      Non-Compliance
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* License Status Filter */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 text-xs border-white/20 text-white/80 hover:text-white">
                      <Filter className="h-3 w-3 mr-1" />
                      License
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-zinc-900 border-zinc-700">
                    <DropdownMenuItem onClick={() => setLicenseStatusFilter("all")} className="text-white hover:bg-zinc-800">
                      All Statuses
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setLicenseStatusFilter("approval")} className="text-white hover:bg-zinc-800">
                      Approval
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setLicenseStatusFilter("rejection")} className="text-white hover:bg-zinc-800">
                      Rejection
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setLicenseStatusFilter("pending")} className="text-white hover:bg-zinc-800">
                      Pending
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Clear Filters Button */}
                {getActiveFiltersCount() > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={clearAllFilters}
                    className="h-8 text-xs border-red-500/50 text-red-400 hover:text-red-300 hover:border-red-400"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Clear ({getActiveFiltersCount()})
                  </Button>
                )}
              </div>

              {/* Active Filters Display */}
              {activeFilters.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {activeFilters.map((filter, index) => (
                    <Badge key={index} variant="secondary" className="text-xs bg-blue-500/20 text-blue-300 border-blue-500/30">
                      {filter}
                    </Badge>
                  ))}
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-1 max-h-[500px] overflow-y-auto pr-2 ai-chat-scrollbar">
                {filteredMessages.length > 0 ? (
                  filteredMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-3 cursor-pointer flex hover:bg-white/10 ${
                        selectedMessage?.id === message.id
                          ? "bg-white/10"
                          : ""
                      } ${
                        !message.isRead
                          ? "border-l-2 border-blue-400"
                          : "border-l-2 border-transparent"
                      }`}
                      onClick={() => handleSelectMessage(message)}
                    >
                      <div className="mr-3 mt-1">
                        {message.isAutomated ? (
                          <MessageSquare className="h-5 w-5 text-blue-400" />
                        ) : (
                          <Mail className="h-5 w-5 text-white/70" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-1">
                          <p
                            className={`text-sm font-medium truncate ${
                              !message.isRead
                                ? "text-white"
                                : "text-white/70"
                            }`}
                          >
                            {message.sender}
                          </p>
                          <span className="text-xs text-white/50 ml-2 whitespace-nowrap">
                            {formatDate(message.createdAt)}
                          </span>
                        </div>
                        <p
                          className={`text-sm truncate ${
                            !message.isRead
                              ? "text-white/90"
                              : "text-white/60"
                          }`}
                        >
                          {message.subject}
                        </p>
                        <p className="text-xs text-white/50 truncate">
                          {message.bodyContentType === 'html'
                            ? stripHtml(message.body).slice(0, 60)
                            : message.body.slice(0, 60)}
                          {(message.bodyContentType === 'html'
                            ? stripHtml(message.body).length
                            : message.body.length) > 60 ? "..." : ""}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-white/60">
                    <Mail className="mx-auto h-10 w-10 mb-4 opacity-50" />
                    <p>No messages found</p>
                    {searchQuery && (
                      <p className="text-sm">Try a different search query</p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          {selectedMessage ? (
            <Card className="space-card h-full">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{selectedMessage.subject}</CardTitle>
                    <CardDescription className="text-white/60 mt-1">
                      From: {selectedMessage.sender} | To: {selectedMessage.recipient}
                    </CardDescription>
                    <p className="text-xs text-white/40 mt-1">
                      {new Date(selectedMessage.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 border-white/40"
                    >
                      <Star className="h-4 w-4 text-yellow-400" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 border-white/40"
                    >
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </Button>
                  </div>
                </div>
                {selectedMessage.isAutomated && (
                  <div className="flex items-center space-x-2 mt-2 bg-blue-500/10 text-blue-300 px-3 py-2 rounded-md">
                    <AlertTriangle className="h-4 w-4" />
                    <p className="text-sm">This is an automated system message</p>
                  </div>
                )}
                {selectedMessage.applicationId && (
                  <div className="bg-white/10 px-3 py-2 rounded-md mt-2">
                    <p className="text-sm text-white/80">
                      Related to application: {selectedMessage.applicationId}
                    </p>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: selectedMessage.body }} />

                <div className="mt-8 border-t border-white/10 pt-6">
                  <p className="text-sm font-medium mb-3">Reply</p>
                  <Textarea
                    placeholder="Type your reply here..."
                    rows={4}
                    className="bg-white/10 border-white/20 text-white mb-4 max-h-[300px] overflow-y-auto"
                    autoResize={true}
                  />
                  <div className="flex justify-end">
                    <Button className="spacex-button">
                      <Send className="mr-2 h-4 w-4" />
                      Send Reply
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="space-card h-full flex items-center justify-center">
              <div className="text-center py-20 px-4">
                <Mail className="mx-auto h-16 w-16 mb-6 text-white/30" />
                <h3 className="text-xl font-medium text-white mb-2">No Message Selected</h3>
                <p className="text-white/60 max-w-md mx-auto">
                  Select a message from your inbox to view its contents, or compose a new
                  message to communicate with FAA officials.
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
