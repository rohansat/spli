"use client";

import React, { useState, useRef, useEffect } from 'react';
import { mockAIAnalysis, AIFormSuggestion } from '@/lib/ai-service';
import { Sparkles, Wand2, Check, X, Loader2, Zap, Brain } from 'lucide-react';

interface AICursorProps {
  onFillForm: (suggestions: Record<string, string>) => void;
  formFields: Array<{ name: string; label: string; type: string }>;
  isVisible: boolean;
  onClose: () => void;
  inline?: boolean;
}

interface AIResponse extends AIFormSuggestion {}

export function AICursor({ onFillForm, formFields, isVisible, onClose, inline = false }: AICursorProps) {
  const [userInput, setUserInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [suggestions, setSuggestions] = useState<AIResponse[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isVisible]);

  // Process user input with AI service
  const processWithAI = async (input: string) => {
    setIsProcessing(true);
    try {
      const response = await mockAIAnalysis(input);
      setSuggestions(response.suggestions);
      setShowSuggestions(true);
    } catch (error) {
      setSuggestions([{
        field: 'missionObjective',
        value: 'Mission objective based on your description.',
        confidence: 0.7,
        reasoning: 'Basic analysis of your input.'
      }]);
      setShowSuggestions(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async () => {
    if (!userInput.trim()) return;
    await processWithAI(userInput);
  };

  const acceptSuggestions = () => {
    const formData: Record<string, string> = {};
    suggestions.forEach(suggestion => {
      formData[suggestion.field] = suggestion.value;
    });
    onFillForm(formData);
    setShowSuggestions(false);
    setUserInput('');
    onClose();
  };

  const rejectSuggestions = () => {
    setShowSuggestions(false);
    setSuggestions([]);
  };

  if (!isVisible) return null;

  return (
    inline ? (
      <div className="w-full h-full flex flex-col bg-zinc-900 rounded-xl border border-zinc-800">
        <div className="border-b border-zinc-800 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="text-xl font-bold text-white">AI FORM ASSISTANT</div>
              <div className="text-sm text-zinc-400">Describe your mission and I'll help fill out the form</div>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white text-2xl font-bold"><X className="h-6 w-6" /></button>
        </div>
        {!showSuggestions ? (
          <div className="flex-1 flex flex-col p-6 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-zinc-300">
                <Sparkles className="h-4 w-4 text-blue-400" />
                <span>Tell me about your space mission, vehicle, and operations</span>
              </div>
              <textarea
                ref={textareaRef}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Describe your mission: e.g., 'We're launching a small satellite for telecommunications. Our rocket is a two-stage liquid-fueled vehicle with reusable first stage. We'll launch from Cape Canaveral and land the first stage back at the launch site...'"
                className="min-h-[120px] w-full bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-400 rounded p-3"
                disabled={isProcessing}
              />
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <Zap className="h-3 w-3" />
                <span>AI will analyze your description and suggest form field values</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSubmit}
                disabled={!userInput.trim() || isProcessing}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90 text-white rounded px-4 py-2 font-semibold flex items-center justify-center"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />
                    Generate Suggestions
                  </>
                )}
              </button>
              <button
                onClick={onClose}
                className="border border-zinc-700 text-zinc-300 hover:bg-zinc-800 rounded px-4 py-2 font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="flex items-center gap-2 text-sm text-green-400 mb-2">
                <Check className="h-4 w-4" />
                <span>AI Analysis Complete</span>
              </div>
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="p-4 bg-zinc-800 rounded-lg border border-zinc-700"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-white">
                      {formFields.find(f => f.name === suggestion.field)?.label || suggestion.field}
                    </h4>
                    <span className="text-xs bg-zinc-700 rounded px-2 py-1">
                      {Math.round(suggestion.confidence * 100)}% confidence
                    </span>
                  </div>
                  <p className="text-sm text-zinc-300 mb-2">{suggestion.value}</p>
                  <p className="text-xs text-zinc-500 italic">"{suggestion.reasoning}"</p>
                </div>
              ))}
            </div>
            <div className="flex gap-3 p-6 pt-4 border-t border-zinc-800 bg-zinc-900">
              <button
                onClick={acceptSuggestions}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded px-4 py-2 font-semibold"
              >
                Accept All Suggestions
              </button>
              <button
                onClick={rejectSuggestions}
                className="flex-1 border border-zinc-700 text-zinc-300 hover:bg-zinc-800 rounded px-4 py-2 font-semibold"
              >
                Reject & Try Again
              </button>
            </div>
          </>
        )}
      </div>
    ) : (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="w-full max-w-2xl max-h-[90vh] flex flex-col bg-zinc-900 rounded-xl border border-zinc-800">
          <div className="border-b border-zinc-800 p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-xl font-bold text-white">AI FORM ASSISTANT</div>
                <div className="text-sm text-zinc-400">Describe your mission and I'll help fill out the form</div>
              </div>
            </div>
            <button onClick={onClose} className="text-zinc-400 hover:text-white text-2xl font-bold"><X className="h-6 w-6" /></button>
          </div>
          {!showSuggestions ? (
            <div className="flex-1 flex flex-col p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-zinc-300">
                  <Sparkles className="h-4 w-4 text-blue-400" />
                  <span>Tell me about your space mission, vehicle, and operations</span>
                </div>
                <textarea
                  ref={textareaRef}
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Describe your mission: e.g., 'We're launching a small satellite for telecommunications. Our rocket is a two-stage liquid-fueled vehicle with reusable first stage. We'll launch from Cape Canaveral and land the first stage back at the launch site...'"
                  className="min-h-[120px] w-full bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-400 rounded p-3"
                  disabled={isProcessing}
                />
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <Zap className="h-3 w-3" />
                  <span>AI will analyze your description and suggest form field values</span>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleSubmit}
                  disabled={!userInput.trim() || isProcessing}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90 text-white rounded px-4 py-2 font-semibold flex items-center justify-center"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4 mr-2" />
                      Generate Suggestions
                    </>
                  )}
                </button>
                <button
                  onClick={onClose}
                  className="border border-zinc-700 text-zinc-300 hover:bg-zinc-800 rounded px-4 py-2 font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <div className="flex items-center gap-2 text-sm text-green-400 mb-2">
                  <Check className="h-4 w-4" />
                  <span>AI Analysis Complete</span>
                </div>
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="p-4 bg-zinc-800 rounded-lg border border-zinc-700"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-white">
                        {formFields.find(f => f.name === suggestion.field)?.label || suggestion.field}
                      </h4>
                      <span className="text-xs bg-zinc-700 rounded px-2 py-1">
                        {Math.round(suggestion.confidence * 100)}% confidence
                      </span>
                    </div>
                    <p className="text-sm text-zinc-300 mb-2">{suggestion.value}</p>
                    <p className="text-xs text-zinc-500 italic">"{suggestion.reasoning}"</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 p-6 pt-4 border-t border-zinc-800 bg-zinc-900">
                <button
                  onClick={acceptSuggestions}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded px-4 py-2 font-semibold"
                >
                  Accept All Suggestions
                </button>
                <button
                  onClick={rejectSuggestions}
                  className="flex-1 border border-zinc-700 text-zinc-300 hover:bg-zinc-800 rounded px-4 py-2 font-semibold"
                >
                  Reject & Try Again
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    )
  );
} 