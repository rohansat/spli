"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from './button';
import { Textarea } from './textarea';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { 
  Sparkles, 
  Wand2, 
  Check, 
  X, 
  Loader2, 
  MessageSquare,
  Zap,
  Brain
} from 'lucide-react';
import { mockAIAnalysis, AIFormSuggestion } from '@/lib/ai-service';

interface AICursorProps {
  onFillForm: (suggestions: Record<string, string>) => void;
  formFields: Array<{ name: string; label: string; type: string }>;
  isVisible: boolean;
  onClose: () => void;
}

interface AIResponse extends AIFormSuggestion {}

export function AICursor({ onFillForm, formFields, isVisible, onClose }: AICursorProps) {
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
      console.error('AI analysis failed:', error);
      // Fallback to basic suggestions
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] flex flex-col bg-zinc-900 border-zinc-800 text-white">
        <CardHeader className="border-b border-zinc-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-white">AI Form Assistant</CardTitle>
                <p className="text-sm text-zinc-400">Describe your mission and I'll help fill out the form</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-zinc-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-6">
          {!showSuggestions ? (
            <>
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-zinc-300">
                  <Sparkles className="h-4 w-4 text-blue-400" />
                  <span>Tell me about your space mission, vehicle, and operations</span>
                </div>
                
                <Textarea
                  ref={textareaRef}
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Describe your mission: e.g., 'We're launching a small satellite for telecommunications. Our rocket is a two-stage liquid-fueled vehicle with reusable first stage. We'll launch from Cape Canaveral and land the first stage back at the launch site...'"
                  className="min-h-[120px] bg-zinc-800 border-zinc-700 text-white placeholder-zinc-400"
                  disabled={isProcessing}
                />
                
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <Zap className="h-3 w-3" />
                  <span>AI will analyze your description and suggest form field values</span>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={handleSubmit}
                  disabled={!userInput.trim() || isProcessing}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90"
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
                </Button>
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                >
                  Cancel
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                <div className="space-y-3">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="p-4 bg-zinc-800 rounded-lg border border-zinc-700"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-white">
                          {formFields.find(f => f.name === suggestion.field)?.label || suggestion.field}
                        </h4>
                        <Badge 
                          variant={suggestion.confidence > 0.9 ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {Math.round(suggestion.confidence * 100)}% confidence
                        </Badge>
                      </div>
                      <p className="text-sm text-zinc-300 mb-2">{suggestion.value}</p>
                      <p className="text-xs text-zinc-500 italic">
                        "{suggestion.reasoning}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-4 border-t border-zinc-800 bg-zinc-900">
                <Button
                  onClick={acceptSuggestions}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Accept All Suggestions
                </Button>
                <Button
                  variant="outline"
                  onClick={rejectSuggestions}
                  className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                >
                  <X className="h-4 w-4 mr-2" />
                  Reject & Try Again
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 