"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Mail, Search, Star, Trash2, Send, Plus, MessageSquare, AlertTriangle, RefreshCw } from "lucide-react";
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
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Function to fetch emails
  const fetchEmails = async () => {
    if (!accessToken) return;
    try {
      setIsRefreshing(true);
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
    } finally {
      setIsRefreshing(false);
    }
  };

  // Fetch Outlook emails from Microsoft Graph API
  useEffect(() => {
    fetchEmails();
  }, [accessToken]);

  // Filter messages based on mailbox, search, and application/Part 450 relevance
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
    // Only show emails related to applications or Part 450
    const content = `${msg.subject} ${msg.body}`.toLowerCase();
    
    // Keywords that indicate application or Part 450 relevance
    const applicationKeywords = [
      "part 450", "450", "commercial space", "space license", "launch license",
      "application", "submission", "approval", "rejection", "pending",
      "faa", "federal aviation", "regulatory", "compliance", "license",
      "mission", "launch", "vehicle", "safety", "trajectory", "ground operations",
      "propulsion", "recovery", "site license", "amendment", "modification"
    ];
    
    // Check if email has applicationId or contains relevant keywords
    return msg.applicationId || applicationKeywords.some(keyword => content.includes(keyword));
  });



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

  const toolbarButtonClass =
    'h-10 rounded-full border border-white/[0.12] bg-white/[0.03] text-sm text-white shadow-none hover:!border-white/20 hover:!bg-white/[0.08] hover:!text-white';
  const fieldClass =
    'rounded-lg border border-white/[0.08] bg-white/[0.03] text-white placeholder:text-white/35 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10';
  const glassCardClass =
    'overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] shadow-xl shadow-black/20 backdrop-blur-sm';

  const unreadCount = messages.filter((m) => !m.isRead).length;

  return (
    <div className="relative flex min-h-screen flex-col bg-black">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-64"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% -20%, rgba(59, 130, 246, 0.12) 0%, transparent 70%)',
        }}
        aria-hidden
      />

      <main className="relative flex-1 px-6 pb-32 pt-24 lg:px-10">
        <div className="mx-auto max-w-[1400px]">
          <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/40">
                Communications
              </p>
              <h1 className="mt-3 text-[clamp(1.5rem,3vw,2rem)] font-bold tracking-tight text-white">
                Channel
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/50">
                Communicate with FAA officials and receive automated notifications
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex rounded-full border border-white/[0.12] bg-white/[0.03] p-1">
                <button
                  type="button"
                  className={cn(
                    'rounded-full px-4 py-2 text-sm font-medium transition-colors',
                    mailbox === 'inbox'
                      ? 'bg-white text-black'
                      : 'text-white/60 hover:text-white'
                  )}
                  onClick={() => setMailbox('inbox')}
                >
                  Inbox
                </button>
                <button
                  type="button"
                  className={cn(
                    'rounded-full px-4 py-2 text-sm font-medium transition-colors',
                    mailbox === 'sent'
                      ? 'bg-white text-black'
                      : 'text-white/60 hover:text-white'
                  )}
                  onClick={() => setMailbox('sent')}
                >
                  Sent
                </button>
              </div>
              <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
                <DialogTrigger asChild>
                  <Button className="h-10 gap-2 rounded-full border-0 bg-white px-5 text-sm font-semibold text-black hover:bg-white/90">
                    <Plus className="h-4 w-4" />
                    New message
                  </Button>
                </DialogTrigger>
              <DialogContent className="max-w-md w-full overflow-hidden border border-white/[0.08] bg-black/95 p-0 text-white shadow-2xl shadow-black/50 backdrop-blur-xl sm:rounded-2xl [&>button]:right-5 [&>button]:top-5 [&>button]:rounded-full [&>button]:border [&>button]:border-white/[0.08] [&>button]:bg-white/[0.03] [&>button]:p-2 [&>button]:text-white/50 [&>button]:opacity-100 [&>button]:hover:bg-white/[0.06] [&>button]:hover:text-white">
                <div className="border-b border-white/[0.06] px-6 pb-4 pt-6">
                  <DialogHeader className="space-y-0">
                    <DialogTitle className="text-sm font-semibold uppercase tracking-wide text-white">
                      Compose message
                    </DialogTitle>
                    <DialogDescription className="mt-1 text-xs text-white/45">
                      Send a message to FAA officials
                    </DialogDescription>
                  </DialogHeader>
                </div>
                <div className="space-y-5 px-6 py-5">
                  <div className="space-y-2">
                    <label htmlFor="recipient" className="text-xs font-medium uppercase tracking-wide text-white/60">
                      To
                    </label>
                    <Input
                      id="recipient"
                      value={newMessage.recipient}
                      onChange={(e) =>
                        setNewMessage({ ...newMessage, recipient: e.target.value })
                      }
                      placeholder="recipient@faa.gov"
                      className={fieldClass}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="subject" className="text-xs font-medium uppercase tracking-wide text-white/60">
                      Subject
                    </label>
                    <Input
                      id="subject"
                      value={newMessage.subject}
                      onChange={(e) =>
                        setNewMessage({ ...newMessage, subject: e.target.value })
                      }
                      placeholder="Enter subject"
                      className={fieldClass}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="body" className="text-xs font-medium uppercase tracking-wide text-white/60">
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
                      className={cn(fieldClass, 'max-h-[400px] overflow-y-auto')}
                      autoResize={true}
                    />
                  </div>
                </div>
                <DialogFooter className="gap-2 border-t border-white/[0.06] px-6 py-4 sm:justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setIsComposeOpen(false)}
                    className="h-10 rounded-full border border-white/[0.12] bg-transparent px-6 text-sm text-white/70 hover:!bg-white/[0.04] hover:!text-white"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSendMessage}
                    className="h-10 gap-2 rounded-full bg-white px-6 text-sm font-semibold text-black hover:bg-white/90"
                  >
                    <Send className="h-4 w-4" />
                    Send
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            </div>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-3">
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <Mail className="h-4 w-4 text-blue-300/70" />
                <span className="text-2xl font-semibold tabular-nums text-white">{filteredMessages.length}</span>
              </div>
              <p className="mt-2 text-[11px] font-medium uppercase tracking-wide text-white/40">
                {mailbox === 'inbox' ? 'Inbox messages' : 'Sent messages'}
              </p>
            </div>
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <MessageSquare className="h-4 w-4 text-blue-300/70" />
                <span className="text-2xl font-semibold tabular-nums text-white">{unreadCount}</span>
              </div>
              <p className="mt-2 text-[11px] font-medium uppercase tracking-wide text-white/40">Unread</p>
            </div>
            <div className="col-span-2 rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 backdrop-blur-sm lg:col-span-1">
              <div className="flex items-center justify-between">
                <AlertTriangle className="h-4 w-4 text-amber-300/70" />
                <span className="text-2xl font-semibold tabular-nums text-white">
                  {messages.filter((m) => m.isAutomated).length}
                </span>
              </div>
              <p className="mt-2 text-[11px] font-medium uppercase tracking-wide text-white/40">Automated</p>
            </div>
          </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card className={glassCardClass}>
            <CardHeader className="space-y-4 border-b border-white/[0.06] p-0 px-5 py-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold uppercase tracking-wide text-white">
                  {mailbox === 'inbox' ? 'Inbox' : 'Sent'}
                </CardTitle>
                <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-0.5 text-[10px] font-medium text-blue-200">
                  {unreadCount} unread
                </span>
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                  <Input
                    placeholder="Search messages..."
                    className={cn(fieldClass, 'h-10 pl-10')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button
                  onClick={fetchEmails}
                  disabled={isRefreshing}
                  variant="outline"
                  size="sm"
                  className={cn(toolbarButtonClass, 'h-10 w-10 shrink-0 px-0')}
                  title="Refresh emails"
                >
                  <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
                </Button>
              </div>
              <Badge variant="outline" className="w-fit border-blue-500/20 bg-blue-500/[0.06] text-[10px] font-normal text-blue-200/80">
                Application & Part 450 related only
              </Badge>
            </CardHeader>
            <CardContent className="p-3">
              <div className="ai-chat-scrollbar max-h-[500px] space-y-1 overflow-y-auto pr-1">
                {filteredMessages.length > 0 ? (
                  filteredMessages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        'flex cursor-pointer rounded-xl border border-transparent p-3 transition-colors',
                        'hover:border-white/[0.06] hover:bg-white/[0.04]',
                        selectedMessage?.id === message.id && 'border-white/[0.1] bg-white/[0.06]',
                        !message.isRead && 'border-l-2 border-l-blue-400/80'
                      )}
                      onClick={() => handleSelectMessage(message)}
                    >
                      <div className="mr-3 mt-0.5">
                        {message.isAutomated ? (
                          <MessageSquare className="h-4 w-4 text-blue-300/80" />
                        ) : (
                          <Mail className="h-4 w-4 text-white/40" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-baseline justify-between">
                          <p
                            className={cn(
                              'truncate text-sm font-medium',
                              !message.isRead ? 'text-white' : 'text-white/65'
                            )}
                          >
                            {message.sender}
                          </p>
                          <span className="ml-2 whitespace-nowrap text-[10px] text-white/35">
                            {formatDate(message.createdAt)}
                          </span>
                        </div>
                        <p
                          className={cn(
                            'truncate text-sm',
                            !message.isRead ? 'text-white/85' : 'text-white/50'
                          )}
                        >
                          {message.subject}
                        </p>
                        <p className="truncate text-xs text-white/35">
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
                  <div className="py-10 text-center text-white/40">
                    <Mail className="mx-auto mb-4 h-10 w-10 opacity-40" />
                    <p className="text-sm">No messages found</p>
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
            <Card className={cn(glassCardClass, 'h-full')}>
              <CardHeader className="space-y-3 border-b border-white/[0.06] p-0 px-6 py-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <CardTitle className="text-lg font-semibold text-white">{selectedMessage.subject}</CardTitle>
                    <CardDescription className="mt-2 text-sm text-white/45">
                      From: {selectedMessage.sender} · To: {selectedMessage.recipient}
                    </CardDescription>
                    <p className="mt-1 text-xs text-white/30">
                      {new Date(selectedMessage.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full border-white/[0.12] bg-white/[0.03] hover:!bg-white/[0.06]"
                    >
                      <Star className="h-4 w-4 text-amber-400" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full border-white/[0.12] bg-white/[0.03] hover:!bg-white/[0.06]"
                    >
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </Button>
                  </div>
                </div>
                {selectedMessage.isAutomated && (
                  <div className="flex items-center gap-2 rounded-lg border border-blue-500/20 bg-blue-500/[0.06] px-3 py-2 text-blue-200/90">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <p className="text-xs">Automated system message</p>
                  </div>
                )}
                {selectedMessage.applicationId && (
                  <div className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2">
                    <p className="text-xs text-white/60">
                      Related to application: {selectedMessage.applicationId}
                    </p>
                  </div>
                )}
              </CardHeader>
              <CardContent className="px-6 py-5">
                <div className="prose prose-invert max-w-none text-sm text-white/80" dangerouslySetInnerHTML={{ __html: selectedMessage.body }} />

                <div className="mt-8 border-t border-white/[0.06] pt-6">
                  <p className="mb-3 text-xs font-medium uppercase tracking-wide text-white/50">Reply</p>
                  <Textarea
                    placeholder="Type your reply here..."
                    rows={4}
                    className={cn(fieldClass, 'mb-4 max-h-[300px] overflow-y-auto')}
                    autoResize={true}
                  />
                  <div className="flex justify-end">
                    <Button className="h-10 gap-2 rounded-full bg-white px-5 text-sm font-semibold text-black hover:bg-white/90">
                      <Send className="h-4 w-4" />
                      Send reply
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className={cn(glassCardClass, 'flex h-full min-h-[420px] items-center justify-center')}>
              <div className="px-6 py-16 text-center">
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.04]">
                  <Mail className="h-6 w-6 text-white/30" />
                </div>
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-white">No message selected</h3>
                <p className="mx-auto max-w-md text-sm leading-relaxed text-white/45">
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
