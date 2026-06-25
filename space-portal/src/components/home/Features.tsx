'use client';

import { useEffect, useState } from 'react';
import {
  FileText,
  MessageSquare,
  Clock,
  Shield,
  Rocket,
  RefreshCw,
  type LucideIcon,
} from 'lucide-react';
import { LandingBackground } from '@/components/landing/LandingBackground';

type FeatureModule = {
  icon: LucideIcon;
  title: string;
  description: string;
  moduleId: string;
  status: string;
  signal: string;
};

const features: FeatureModule[] = [
  {
    icon: FileText,
    title: 'FAA PART 450 LICENSING',
    description:
      'Streamlined application process for commercial launch and reentry vehicle operations.',
    moduleId: 'MC-01',
    status: 'Active',
    signal: 'Form pipeline',
  },
  {
    icon: MessageSquare,
    title: 'INTEGRATED MESSAGING',
    description:
      'Direct communication with FAA officials and automatic notifications about your application status.',
    moduleId: 'MC-02',
    status: 'Linked',
    signal: 'FAA channel',
  },
  {
    icon: Clock,
    title: 'REAL-TIME UPDATES',
    description:
      'Receive instant updates on the status of your applications and any required changes.',
    moduleId: 'MC-03',
    status: 'Live',
    signal: 'Status feed',
  },
  {
    icon: Shield,
    title: 'SECURE DOCUMENT MANAGEMENT',
    description:
      'Centralized, secure storage for all your licensing documents and correspondence.',
    moduleId: 'MC-04',
    status: 'Secured',
    signal: 'Doc vault',
  },
  {
    icon: Rocket,
    title: 'LAUNCH TRACKING',
    description:
      'Monitor the entire lifecycle of your launch operations from application to completion.',
    moduleId: 'MC-05',
    status: 'Tracking',
    signal: 'Ops timeline',
  },
  {
    icon: RefreshCw,
    title: 'STREAMLINED WORKFLOW',
    description:
      'Optimized process flow to reduce paperwork and expedite approval timelines.',
    moduleId: 'MC-06',
    status: 'Synced',
    signal: 'Workflow engine',
  },
];

const consoleMetrics = [
  { label: 'Active filings', value: '3' },
  { label: 'Compliance', value: '82%' },
  { label: 'FAA queue', value: '1 thread' },
  { label: 'System', value: 'Nominal' },
];

function StatusDot({ tone = 'green' }: { tone?: 'green' | 'amber' | 'blue' }) {
  const colors = {
    green: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.45)]',
    amber: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.45)]',
    blue: 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.45)]',
  };
  return <span className={`inline-block h-1.5 w-1.5 rounded-full ${colors[tone]}`} />;
}

export function Features() {
  const [utcTime, setUtcTime] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => setUtcTime(new Date().toISOString().slice(11, 16));
    tick();
    const interval = setInterval(tick, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative overflow-hidden py-24 md:py-32">
      <LandingBackground variant="section" />

      <div className="relative mx-auto max-w-[1400px] px-6 lg:px-12">
        <div className="mb-12 max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/40">
            Platform
          </p>
          <h2 className="mt-3 text-[clamp(1.75rem,3.5vw,2.5rem)] font-bold leading-tight tracking-[-0.02em] text-white">
            MISSION CONTROL FOR YOUR LICENSING NEEDS
          </h2>
          <p className="mt-5 text-base leading-relaxed text-white/50 md:text-lg">
            Our platform simplifies the complex world of aerospace licensing with an intuitive
            interface and powerful features.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0c] shadow-2xl shadow-black/40">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-white/[0.02] px-4 py-3 md:px-5">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-black/50">
                <Rocket className="h-4 w-4 text-white/60" />
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">
                  SPLI · Mission control
                </p>
                <p className="text-xs font-medium text-white/75">Licensing operations console</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-emerald-300/90">
                <StatusDot tone="green" />
                Live
              </span>
              <span className="hidden font-mono text-[10px] text-white/30 sm:inline">
                UTC {utcTime ?? '—:—'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-px border-b border-white/10 bg-white/[0.06] md:grid-cols-4">
            {consoleMetrics.map((metric) => (
              <div key={metric.label} className="bg-[#0a0a0c] px-4 py-3">
                <p className="font-mono text-[10px] uppercase tracking-wider text-white/35">
                  {metric.label}
                </p>
                <p className="mt-1 text-sm font-semibold tabular-nums text-white/85">
                  {metric.value}
                </p>
              </div>
            ))}
          </div>

          <div className="relative p-4 md:p-5">
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            />

            <div className="relative grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <article
                    key={feature.moduleId}
                    className="group relative overflow-hidden rounded-xl border border-white/10 bg-black/40 p-4 transition-colors hover:border-white/20 hover:bg-white/[0.03]"
                  >
                    <div className="pointer-events-none absolute left-0 top-0 h-3 w-3 border-l border-t border-white/20" />
                    <div className="pointer-events-none absolute bottom-0 right-0 h-3 w-3 border-b border-r border-white/20" />

                    <div className="mb-3 flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-white/30">{feature.moduleId}</span>
                        <span className="text-white/15">·</span>
                        <span className="font-mono text-[10px] uppercase tracking-wide text-white/40">
                          {feature.signal}
                        </span>
                      </div>
                      <span className="inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider text-emerald-400/80">
                        <StatusDot tone={index % 3 === 0 ? 'green' : index % 3 === 1 ? 'blue' : 'amber'} />
                        {feature.status}
                      </span>
                    </div>

                    <div className="mb-3 inline-flex rounded-lg border border-white/10 bg-white/[0.04] p-2.5 text-white/70">
                      <Icon className="h-4 w-4" strokeWidth={1.75} />
                    </div>

                    <h3 className="mb-2 text-sm font-bold leading-snug text-white">{feature.title}</h3>
                    <p className="text-xs leading-relaxed text-white/45">{feature.description}</p>
                  </article>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 bg-black/30 px-4 py-2.5 font-mono text-[10px] uppercase tracking-wider text-white/30 md:px-5">
            <span>6 modules online</span>
            <span className="hidden sm:inline">Part 450 · Readiness · Messaging · Documents</span>
            <span className="inline-flex items-center gap-1.5">
              <StatusDot tone="green" />
              All systems nominal
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
