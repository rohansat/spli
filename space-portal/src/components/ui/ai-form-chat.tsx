import React, { useRef, useState, useEffect } from 'react';
import { Sparkles, Wand2, Loader2, Check, User, Brain } from 'lucide-react';

interface Message {
  sender: 'user' | 'ai' | 'system';
  content: string;
  suggestions?: Array<{ field: string; value: string; confidence: number; reasoning: string }>;
}

interface AIFormChatProps {
  onFillForm: (suggestions: Record<string, string>) => void;
  formFields: Array<{ name: string; label: string; type: string }>;
  onClose: () => void;
  aiAnalyze: (input: string) => Promise<any>;
}

export function AIFormChat({ onFillForm, formFields, onClose, aiAnalyze }: AIFormChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'system', content: "Describe your mission and I'll help fill out the form." }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!userInput.trim()) return;
    setMessages((msgs) => [...msgs, { sender: 'user', content: userInput }]);
    setIsProcessing(true);
    setUserInput('');
    setMessages((msgs) => [...msgs, { sender: 'system', content: 'AI is analyzing your description...' }]);
    try {
      const response = await aiAnalyze(userInput);
      setMessages((msgs) => [
        ...msgs.slice(0, -1),
        {
          sender: 'ai',
          content: 'Here are my suggestions:',
          suggestions: response.suggestions
        }
      ]);
    } catch (e) {
      setMessages((msgs) => [
        ...msgs.slice(0, -1),
        { sender: 'system', content: 'Sorry, something went wrong. Please try again.' }
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAccept = (suggestions: any) => {
    const formData: Record<string, string> = {};
    suggestions.forEach((s: any) => {
      formData[s.field] = s.value;
    });
    onFillForm(formData);
    setMessages((msgs) => [
      ...msgs,
      { sender: 'system', content: 'Suggestions accepted and form updated.' }
    ]);
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-lg px-4 py-2 text-sm shadow ${
              msg.sender === 'user'
                ? 'bg-blue-600 text-white self-end'
                : msg.sender === 'ai'
                ? 'bg-zinc-800 text-white self-start'
                : 'bg-zinc-700 text-zinc-100 self-start'
            }`}>
              {msg.sender === 'user' && (
                <div className="flex items-center gap-2 mb-1">
                  <User className="h-4 w-4" />
                  <span className="font-semibold">You</span>
                </div>
              )}
              {msg.sender === 'ai' && (
                <div className="flex items-center gap-2 mb-1">
                  <Brain className="h-4 w-4 text-purple-400" />
                  <span className="font-semibold">AI Form Assistant</span>
                </div>
              )}
              {msg.sender === 'system' && (
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="h-4 w-4 text-blue-400" />
                  <span className="font-semibold">System</span>
                </div>
              )}
              <div>{msg.content}</div>
              {msg.suggestions && (
                <div className="mt-3 space-y-2">
                  {msg.suggestions.map((s, i) => (
                    <div key={i} className="p-2 bg-zinc-900 rounded border border-zinc-700">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-white">{formFields.find(f => f.name === s.field)?.label || s.field}</span>
                        <span className="text-xs bg-zinc-700 rounded px-2 py-1">{Math.round(s.confidence * 100)}% confidence</span>
                      </div>
                      <div className="text-sm text-zinc-300 mb-1">{s.value}</div>
                      <div className="text-xs text-zinc-500 italic">"{s.reasoning}"</div>
                    </div>
                  ))}
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleAccept(msg.suggestions)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded px-4 py-2 font-semibold"
                    >
                      Accept All Suggestions
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
      <div className="border-t border-zinc-800 p-3 bg-zinc-900 flex items-center gap-2 mt-0 mb-0">
        <textarea
          value={userInput}
          onChange={e => setUserInput(e.target.value)}
          placeholder="Describe your mission, vehicle, or operations..."
          className="flex-1 min-h-[60px] max-h-[180px] bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-400 rounded p-3 resize-none"
          disabled={isProcessing}
          rows={3}
          style={{ lineHeight: '1.5' }}
        />
        <button
          onClick={handleSend}
          disabled={!userInput.trim() || isProcessing}
          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90 text-white rounded px-4 py-2 font-semibold flex items-center justify-center"
        >
          {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4 mr-1" />}
          Send
        </button>
      </div>
    </div>
  );
} 