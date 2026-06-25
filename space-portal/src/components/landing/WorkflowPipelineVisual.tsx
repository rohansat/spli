'use client';

import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  ClipboardCheck,
  Lock,
  Mail,
  Send,
  Sparkles,
} from 'lucide-react';

const macroSteps = [
  { label: 'AI draft', detail: 'Mission → Part 450 fields' },
  { label: 'Gap check', detail: 'Compliance & blocking items' },
  { label: 'Submit', detail: 'Gated when ready' },
  { label: 'FAA track', detail: 'Messages & status' },
];

const sections = [
  { title: 'CONOPS', percent: 100, state: 'complete' as const },
  { title: 'Vehicle Overview', percent: 84, state: 'draft' as const },
  { title: 'Launch Location(s)', percent: 62, state: 'draft' as const },
  { title: 'Launch Information', percent: 0, state: 'locked' as const },
  { title: 'Safety Considerations', percent: 45, state: 'draft' as const },
  { title: 'Timeline & Intent', percent: 70, state: 'draft' as const },
  { title: 'List of Questions for FAA', percent: 0, state: 'locked' as const },
];

const blockingItems = [
  'Launch Information — complete Vehicle & Locations first',
  'Safety — trajectory cross-reference misaligned',
];

export function WorkflowPipelineVisual({ className = '' }: { className?: string }) {
  const [activeStep, setActiveStep] = useState(0);
  const [typedChars, setTypedChars] = useState(0);

  const missionSnippet =
    'Two-stage liquid launch from Cape Canaveral, 500 kg payload to LEO…';

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % macroSteps.length);
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeStep !== 0) return;
    setTypedChars(0);
    const interval = setInterval(() => {
      setTypedChars((n) => {
        if (n >= missionSnippet.length) {
          clearInterval(interval);
          return n;
        }
        return n + 1;
      });
    }, 28);
    return () => clearInterval(interval);
  }, [activeStep, missionSnippet.length]);

  return (
    <div className={`relative w-full ${className}`}>
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0c] shadow-2xl shadow-black/50">
        <div className="flex items-center justify-between border-b border-white/8 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04]">
              <Sparkles className="h-3.5 w-3.5 text-blue-300" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white/90">Nova LEO Launch · Part 450</p>
              <p className="text-[10px] text-white/40">Draft application</p>
            </div>
          </div>
          <span className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-2.5 py-1 text-[10px] font-medium text-yellow-300">
            Submit locked
          </span>
        </div>

        <div className="grid grid-cols-4 gap-1 border-b border-white/8 bg-black/30 px-3 py-2">
          {macroSteps.map((step, index) => {
            const isActive = index === activeStep;
            const isDone = index < activeStep;
            return (
              <div
                key={step.label}
                className={`rounded-lg px-2 py-1.5 transition-all duration-500 ${
                  isActive
                    ? 'bg-blue-500/15 ring-1 ring-blue-400/30'
                    : isDone
                      ? 'bg-emerald-500/8'
                      : 'bg-transparent'
                }`}
              >
                <p
                  className={`text-[10px] font-semibold ${
                    isActive ? 'text-blue-200' : isDone ? 'text-emerald-300/80' : 'text-white/35'
                  }`}
                >
                  {step.label}
                </p>
                <p className="hidden text-[9px] leading-tight text-white/35 sm:block">{step.detail}</p>
              </div>
            );
          })}
        </div>

        <div className="grid gap-0 md:grid-cols-[1.1fr_1fr]">
          <div className="border-b border-white/8 p-4 md:border-b-0 md:border-r">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="h-3.5 w-3.5 text-white/45" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-white/45">
                  Application readiness
                </span>
              </div>
              <span className="text-xs font-semibold tabular-nums text-yellow-300">78%</span>
            </div>

            <div className="mb-1.5 h-1.5 overflow-hidden rounded-full bg-white/8">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-400 transition-all duration-700"
                style={{ width: activeStep >= 2 ? '78%' : activeStep >= 1 ? '68%' : '54%' }}
              />
            </div>
            <div className="mb-4 flex justify-between text-[10px] text-white/35">
              <span>Compliance 82/100</span>
              <span>Min 72% to submit</span>
            </div>

            <div className="mb-4 space-y-1.5">
              {sections.map((section) => (
                <div
                  key={section.title}
                  className={`flex items-center justify-between rounded-lg border px-2.5 py-2 ${
                    section.state === 'locked'
                      ? 'border-white/5 bg-black/30 opacity-60'
                      : section.state === 'complete'
                        ? 'border-emerald-500/20 bg-emerald-500/5'
                        : 'border-white/8 bg-white/[0.02]'
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-2">
                    {section.state === 'locked' ? (
                      <Lock className="h-3 w-3 shrink-0 text-white/30" />
                    ) : section.state === 'complete' ? (
                      <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-400" />
                    ) : (
                      <div className="h-3 w-3 shrink-0 rounded-full border border-white/25" />
                    )}
                    <span className="truncate text-[11px] text-white/75">{section.title}</span>
                  </div>
                  <span className="text-[10px] tabular-nums text-white/40">
                    {section.state === 'locked' ? 'Locked' : `${section.percent}%`}
                  </span>
                </div>
              ))}
            </div>

            {(activeStep === 1 || activeStep === 2) && (
              <div className="mb-4 rounded-lg border border-red-500/20 bg-red-950/20 p-2.5">
                <div className="mb-1.5 flex items-center gap-1.5">
                  <AlertTriangle className="h-3 w-3 text-red-400" />
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-red-300">
                    {blockingItems.length} blocking
                  </span>
                </div>
                <ul className="space-y-1">
                  {blockingItems.map((item) => (
                    <li key={item} className="text-[10px] leading-snug text-red-200/70">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-[10px] font-semibold uppercase tracking-wide transition-all ${
                  activeStep >= 2
                    ? 'bg-white/10 text-white/35'
                    : 'bg-white/[0.04] text-white/25'
                }`}
              >
                <Send className="h-3 w-3" />
                Submit locked
              </button>
              <button
                type="button"
                className={`flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-[10px] font-semibold uppercase tracking-wide transition-all ${
                  activeStep === 3
                    ? 'border-blue-400/30 bg-blue-500/10 text-blue-200'
                    : 'border-white/10 text-white/40'
                }`}
              >
                <Mail className="h-3 w-3" />
                FAA
              </button>
            </div>
          </div>

          <div className="p-4">
            <div className="mb-3 flex items-center gap-2">
              <Bot className="h-3.5 w-3.5 text-blue-300" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-white/45">
                SPLI assistant
              </span>
            </div>

            <div className="space-y-2.5">
              <div className="rounded-xl rounded-tl-sm border border-white/8 bg-white/[0.03] px-3 py-2">
                <p className="text-[10px] text-white/35">You</p>
                <p className="mt-1 text-xs leading-relaxed text-white/75">
                  {activeStep === 0
                    ? missionSnippet.slice(0, typedChars)
                    : missionSnippet}
                  {activeStep === 0 && typedChars < missionSnippet.length && (
                    <span className="ml-0.5 inline-block h-3 w-px animate-pulse bg-blue-400" />
                  )}
                </p>
              </div>

              <div
                className={`rounded-xl rounded-tr-sm border px-3 py-2 transition-all duration-500 ${
                  activeStep === 0
                    ? 'border-blue-400/25 bg-blue-500/10'
                    : 'border-white/8 bg-white/[0.03]'
                }`}
              >
                <p className="text-[10px] text-blue-300/70">SPLI</p>
                <p className="mt-1 text-xs leading-relaxed text-white/70">
                  {activeStep === 0 && (
                    <>Parsing mission → filling CONOPS, Vehicle, Locations…</>
                  )}
                  {activeStep === 1 && (
                    <>Found 2 blocking items and 1 cross-reference warning before submit.</>
                  )}
                  {activeStep === 2 && (
                    <>78% complete · compliance 82/100 — need 72% + 70 to unlock submit.</>
                  )}
                  {activeStep === 3 && (
                    <>Tracking FAA thread · status pending approval · 1 reply draft ready.</>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className="pointer-events-none absolute -inset-4 -z-10 rounded-3xl opacity-60 blur-2xl"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(59, 130, 246, 0.12) 0%, transparent 70%)',
        }}
      />
    </div>
  );
}
