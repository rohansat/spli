'use client';

import { useEffect, useRef, useState } from 'react';
import { LandingBackground } from '@/components/landing/LandingBackground';
import { Check, X } from 'lucide-react';

const withoutSpliTimeline = [
  { time: 'Month 1', task: 'Manual document preparation and extensive review process' },
  { time: 'Month 2', task: 'Initial FAA submission and extended waiting period' },
  { time: 'Month 3', task: 'FAA feedback and multiple revision requests' },
  { time: 'Month 4', task: 'Document resubmission and additional review cycles' },
  { time: 'Month 5', task: 'Final approval process and coordination delays' },
  { time: 'Month 6+', task: 'Ongoing delays and missed launch window opportunities' },
];

const withSpliTimeline = [
  { time: 'Week 1', task: 'AI-powered application completion and validation' },
  { time: 'Week 2', task: 'Automated compliance review and document preparation' },
  { time: 'Week 3', task: 'Direct FAA submission with pre-approval coordination' },
  { time: 'Week 4', task: 'Real-time status tracking and automated updates' },
  { time: 'Week 5', task: 'License approval process and final documentation' },
  { time: 'Week 6', task: 'Launch operations preparation and readiness' },
];

const highlights = [
  { title: '90% faster processing', detail: 'From months to weeks' },
  { title: 'AI-powered validation', detail: 'Reduce errors and revisions' },
  { title: 'Direct FAA communication', detail: 'Streamlined coordination' },
];

export function TimeComparison() {
  const [activeTab, setActiveTab] = useState<'without' | 'with'>('without');
  const panelRef = useRef<HTMLDivElement>(null);
  const hasAutoSwitchedRef = useRef(false);
  const isWithSpli = activeTab === 'with';
  const timeline = isWithSpli ? withSpliTimeline : withoutSpliTimeline;

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || hasAutoSwitchedRef.current) return;
        hasAutoSwitchedRef.current = true;
        observer.disconnect();

        window.setTimeout(() => {
          setActiveTab('with');
        }, 700);
      },
      { threshold: 0.45, rootMargin: '0px 0px -8% 0px' }
    );

    observer.observe(panel);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="relative overflow-hidden py-24 md:py-32">
      <LandingBackground variant="section" />

      <div className="relative z-10 mx-auto w-full max-w-[1400px] px-6 lg:px-12">
        <div className="grid items-start gap-14 lg:grid-cols-2 lg:gap-16">
          <div className="max-w-xl">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/40">
              Timeline
            </p>
            <h2 className="mt-3 text-[clamp(1.75rem,3.5vw,2.5rem)] font-bold leading-tight tracking-[-0.02em] text-white">
              From 6+ months to 6 weeks
            </h2>
            <p className="mt-5 text-base leading-relaxed text-white/50 md:text-lg">
              Traditional FAA licensing processes waste months on paperwork and delays.
              SPLI streamlines everything, getting you from application to approval in weeks.
            </p>

            <div className="mt-8 border-t border-white/10 pt-8">
              <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-white/70">
                Take back your launch schedule
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-white/45">
                Space companies lose millions in delayed launches due to inefficient licensing processes.
                SPLI eliminates the bottlenecks, reducing application time by 90% while improving accuracy.
              </p>
            </div>

            <ul className="mt-8 space-y-4">
              {highlights.map((item) => (
                <li key={item.title} className="flex gap-3">
                  <span className="mt-2 h-px w-4 shrink-0 bg-white/25" />
                  <div>
                    <p className="text-sm font-medium text-white/85">{item.title}</p>
                    <p className="text-xs text-white/40">{item.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div
            ref={panelRef}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6"
          >
            <div className="mb-5 flex rounded-full border border-white/10 bg-black/40 p-1">
              <button
                type="button"
                onClick={() => setActiveTab('without')}
                className={`flex-1 rounded-full py-2.5 px-3 text-[11px] font-semibold uppercase tracking-wide transition-colors ${
                  activeTab === 'without'
                    ? 'bg-white text-black'
                    : 'text-white/45 hover:text-white/70'
                }`}
              >
                Without SPLI
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('with')}
                className={`flex-1 rounded-full py-2.5 px-3 text-[11px] font-semibold uppercase tracking-wide transition-colors ${
                  activeTab === 'with'
                    ? 'bg-white text-black'
                    : 'text-white/45 hover:text-white/70'
                }`}
              >
                With SPLI
              </button>
            </div>

            <div className="mb-4 flex items-baseline justify-between gap-4 border-b border-white/10 pb-4 transition-opacity duration-300">
              <div>
                <p
                  className={`text-2xl font-bold tabular-nums tracking-tight ${
                    isWithSpli ? 'text-white' : 'text-white/55'
                  }`}
                >
                  {isWithSpli ? '6 weeks' : '6+ months'}
                </p>
                <p className="mt-1 text-[11px] uppercase tracking-wider text-white/35">
                  {isWithSpli ? 'Total time to approval' : 'Average processing time'}
                </p>
              </div>
              <p className="max-w-[160px] text-right text-[11px] leading-snug text-white/40">
                {isWithSpli
                  ? 'Structured workflow from draft through FAA coordination'
                  : 'Manual back-and-forth across disconnected tools'}
              </p>
            </div>

            <ul className="space-y-0 divide-y divide-white/[0.06] transition-opacity duration-300">
              {timeline.map((item) => (
                <li key={item.time} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                  <span
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                      isWithSpli
                        ? 'border-white/20 bg-white/[0.06] text-white/70'
                        : 'border-white/10 bg-transparent text-white/35'
                    }`}
                  >
                    {isWithSpli ? (
                      <Check className="h-3 w-3" strokeWidth={2.5} />
                    ) : (
                      <X className="h-3 w-3" strokeWidth={2.5} />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-white/45">
                      {item.time}
                    </p>
                    <p className="mt-0.5 text-sm leading-snug text-white/70">{item.task}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
