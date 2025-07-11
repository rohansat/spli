"use client";

import React, { useRef, useState, useImperativeHandle, forwardRef } from "react";
import { Paperclip, Send, UploadCloud } from "lucide-react";
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
}

export const AIAssistantPanel = forwardRef<AIAssistantPanelHandle, AIAssistantPanelProps>(
  ({ onCommand, onFileDrop }, ref) => {
    const [messages, setMessages] = useState<Message[]>([]);
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

    const handleSend = () => {
      if (!input.trim()) return;
      setMessages((msgs) => [
        ...msgs,
        { id: Date.now(), sender: "user", content: input, timestamp: Date.now() }
      ]);
      if (onCommand) onCommand(input);
      setInput("");
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
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center gap-2 border-b border-zinc-800 pb-3 mb-3">
          <UploadCloud className="h-6 w-6 text-blue-400" />
          <span className="text-lg font-semibold text-white">AI Assistant</span>
        </div>
        {/* Message List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 pb-2">
          {messages.length === 0 ? (
            <div className="text-zinc-500 text-center mt-10">How can I help you with your application?</div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`rounded-lg px-4 py-2 max-w-[80%] text-sm shadow-md flex flex-col gap-1 ${
                    msg.sender === "user"
                      ? "bg-blue-600 text-white self-end rounded-br-none"
                      : "bg-zinc-800 text-zinc-100 border border-zinc-700 self-start rounded-bl-none"
                  }`}
                >
                  <span>{msg.content}</span>
                  <span className={`text-xs mt-1 ${msg.sender === "user" ? "text-blue-200/80" : "text-zinc-400"}`}>{dayjs(msg.timestamp).format("HH:mm")}</span>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        {/* Input & Drag-and-Drop */}
        <div
          className={`sticky bottom-0 left-0 right-0 z-10 bg-zinc-900 pt-2 pb-2 px-0 border-t border-zinc-800`}
        >
          <div
            className={`relative p-2 rounded-lg border border-dashed transition-colors ${
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
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="text-zinc-400 hover:text-blue-400"
                onClick={() => fileInputRef.current?.click()}
                title="Attach files"
              >
                <Paperclip className="h-5 w-5" />
              </button>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type a command, request, or drop a file..."
                className="flex-1 bg-transparent outline-none text-white placeholder-zinc-500 px-2 py-1"
              />
              <Button
                size="icon"
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleSend}
                title="Send"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
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