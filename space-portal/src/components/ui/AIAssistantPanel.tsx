"use client";

import React, { useRef, useState, useImperativeHandle, forwardRef } from "react";
import { Paperclip, Send, UploadCloud, User, Bot } from "lucide-react";
import { Button } from "./button";
import dayjs from "dayjs";

interface Message {
  id: number;
  sender: "user" | "ai";
  content: string;
  timestamp: number;
}

export interface AIAssistantPanelHandle {
  addAIMsg: (msg: string) => void;
}

interface AIAssistantPanelProps {
  onCommand?: (command: string) => void;
  onFileDrop?: (files: FileList | File[]) => void;
  hideTabs?: boolean;
}

export const AIAssistantPanel = forwardRef<AIAssistantPanelHandle, AIAssistantPanelProps>(
  ({ onCommand, onFileDrop, hideTabs }, ref) => {
    const [messages, setMessages] = useState<Message[]>([
      {
        id: 1,
        sender: "ai",
        content: "Hi! I'm SPLI Chat, your AI assistant for aerospace compliance and FAA applications. How can I help you today?",
        timestamp: Date.now()
      }
    ]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [input, setInput] = useState("");
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => ({
      addAIMsg: (msg: string) => {
        setMessages((msgs) => [
          ...msgs,
          { id: Date.now(), sender: "ai", content: msg, timestamp: Date.now() }
        ]);
      }
    }), []);

    // Auto-scroll to latest message
    React.useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async (e?: React.FormEvent | React.KeyboardEvent | React.MouseEvent) => {
      if (e && typeof e.preventDefault === 'function') e.preventDefault();
      if (!input.trim()) return;
      
      const userMessage = input;
      setMessages((msgs) => [
        ...msgs,
        { id: Date.now(), sender: "user", content: userMessage, timestamp: Date.now() }
      ]);
      setInput("");

      // Call the unified AI API
      try {
        const response = await fetch('/api/ai', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userInput: userMessage,
            mode: 'unified',
            conversationHistory: messages // Send conversation history for context
          }),
        });

        if (!response.ok) {
          throw new Error('AI API request failed');
        }

        const data = await response.json();
        
        setMessages((msgs) => [
          ...msgs,
          { id: Date.now(), sender: "ai", content: data.message, timestamp: Date.now() }
        ]);

        // If there's a command handler, call it
        if (onCommand) onCommand(userMessage);
      } catch (error) {
        console.error('AI API Error:', error);
        let errorMessage = "Sorry, I'm having trouble connecting to the AI service. Please try again.";
        
        if (error instanceof Error) {
          errorMessage = `Error: ${error.message}`;
        }
        
        setMessages((msgs) => [
          ...msgs,
          { id: Date.now(), sender: "ai", content: errorMessage, timestamp: Date.now() }
        ]);
      }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const files = Array.from(e.dataTransfer.files);
      if (onFileDrop && files.length > 0) onFileDrop(files);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && onFileDrop) {
        onFileDrop(Array.from(e.target.files));
      }
    };

    return (
      <div className="flex flex-col h-full min-h-0">
        {/* Message List */}
        <div className="flex-1 min-h-0 overflow-y-auto space-y-3 pr-1 pb-2 bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 rounded-2xl shadow-xl border border-zinc-800">
          {messages.length === 0 ? (
            <div className="text-zinc-500 text-center mt-10">Loading chat...</div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-end gap-2 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.sender === "ai" && (
                  <div className="flex-shrink-0 mb-1">
                    <Bot className="h-6 w-6 text-purple-400 bg-zinc-800 rounded-full p-1 shadow" />
                  </div>
                )}
                <div
                  className={`px-5 py-3 max-w-[75%] text-sm flex flex-col gap-1 shadow-lg border transition-all duration-200 ${
                    msg.sender === "user"
                      ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-3xl rounded-br-md border-blue-400/30"
                      : "bg-gradient-to-br from-zinc-800 to-zinc-900 text-zinc-100 rounded-3xl rounded-bl-md border-purple-400/20"
                  }`}
                  style={{ boxShadow: msg.sender === "user" ? "0 2px 12px 0 rgba(80,80,255,0.10)" : "0 2px 12px 0 rgba(120,80,255,0.10)" }}
                >
                  <span>{msg.content}</span>
                  <span className={`text-xs mt-1 ${msg.sender === "user" ? "text-blue-100/80" : "text-purple-200/80"}`}>{dayjs(msg.timestamp).format("HH:mm")}</span>
                </div>
                {msg.sender === "user" && (
                  <div className="flex-shrink-0 mb-1">
                    <User className="h-6 w-6 text-blue-400 bg-zinc-800 rounded-full p-1 shadow" />
                  </div>
                )}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        {/* Input & Drag-and-Drop */}
        <div className="border-t border-zinc-800 p-0 bg-zinc-900 flex items-center gap-2 mt-0 mb-0" style={{ marginTop: 'auto' }}>
          <div
            className={`relative p-2 rounded-2xl border-2 border-dashed transition-colors shadow-lg w-full ${
              isDragging ? "border-blue-400 bg-blue-950/30" : "border-zinc-700 bg-zinc-900"
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <input
              type="file"
              multiple
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileInputChange}
            />
            <form className="flex items-center gap-2" onSubmit={handleSend} autoComplete="off">
              <button
                type="button"
                className="text-zinc-400 hover:text-blue-400 transition-transform hover:scale-110"
                onClick={() => fileInputRef.current?.click()}
                title="Attach files"
              >
                <Paperclip className="h-5 w-5" />
              </button>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSend(e);
                }}
                placeholder="Type a command, request, or drop a file..."
                className="flex-1 bg-zinc-800/60 outline-none text-white placeholder:text-zinc-400 px-3 py-2 rounded-xl border border-zinc-700 focus:border-blue-400 transition-all"
              />
              <Button
                size="icon"
                className="bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-md transition-transform hover:scale-110"
                onClick={handleSend}
                title="Send"
                type="submit"
              >
                <Send className="h-5 w-5" />
              </Button>
            </form>
            {isDragging && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-blue-500/80 text-white px-4 py-2 rounded-lg shadow-lg animate-pulse">
                  Drop files to upload
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

// Add display name for forwardRef component
AIAssistantPanel.displayName = "AIAssistantPanel"; 