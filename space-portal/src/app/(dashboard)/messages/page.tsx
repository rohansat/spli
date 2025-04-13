"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Mail, Search, Star, Trash2, Send, Plus, MessageSquare, AlertTriangle } from "lucide-react";
import { messages as mockMessages } from "@/lib/mock-data";
import { Message } from "@/types";
import { cn } from "@/lib/utils";
import { Footer } from "@/components/Footer";

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [newMessage, setNewMessage] = useState({
    recipient: "",
    subject: "",
    body: "",
  });

  // Filter messages based on search
  const filteredMessages = messages.filter(
    (msg) =>
      msg.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.sender.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
  const handleSendMessage = () => {
    // Reset form
    setIsComposeOpen(false);
    setNewMessage({
      recipient: "",
      subject: "",
      body: "",
    });

    // Display success alert or something similar
  };

  return (
    <div className="space-container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">MESSAGES</h1>
          <p className="text-white/60">
            Communicate with FAA officials and receive automated notifications
          </p>
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
                  className="bg-white/10 border-white/20 text-white"
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
            </CardHeader>
            <CardContent>
              <div className="space-y-1 max-h-[500px] overflow-y-auto pr-2">
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
                          {message.body.slice(0, 60)}
                          {message.body.length > 60 ? "..." : ""}
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
                <div className="prose prose-invert max-w-none">
                  <p className="text-white/80 whitespace-pre-line">
                    {selectedMessage.body}
                  </p>
                </div>

                <div className="mt-8 border-t border-white/10 pt-6">
                  <p className="text-sm font-medium mb-3">Reply</p>
                  <Textarea
                    placeholder="Type your reply here..."
                    rows={4}
                    className="bg-white/10 border-white/20 text-white mb-4"
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
      <Footer />
    </div>
  );
}
