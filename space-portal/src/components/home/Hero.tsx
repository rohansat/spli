'use client';

import Link from 'next/link';
import { PublicNav } from '@/components/layout/PublicNav';
import { LandingBackground } from '@/components/landing/LandingBackground';
import { WorkflowPipelineVisual } from '@/components/landing/WorkflowPipelineVisual';

const audience = [
  'Launch operators',
  'Satellite companies',
  'Spaceports filing Part 450',
];

export function Hero() {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden text-white">
      <LandingBackground variant="hero" />
      <PublicNav transparent />

      <div className="relative z-10 mx-auto flex w-full max-w-[1400px] flex-1 flex-col justify-center px-6 pb-16 pt-28 lg:px-12 lg:pb-20 lg:pt-32">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] lg:gap-16">
          <div className="max-w-xl text-center lg:text-left">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/40">
              SPLI - SPECIALIZED LICENSING
            </p>

            <h1 className="mt-4 text-[clamp(1.75rem,4vw,3.25rem)] font-bold leading-[1.1] tracking-[-0.02em] text-white">
              Unlocking a New Era in Space Licensing
            </h1>

            <p className="mt-5 text-base leading-relaxed text-white/55 md:text-lg">
              Streamline your aerospace licensing process with efficiency
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-2 lg:justify-start">
              {audience.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-white/55"
                >
                  {item}
                </span>
              ))}
            </div>

            <div className="mt-8 space-y-4 border-t border-white/10 pt-8 text-left">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-red-300/80">
                  The bottleneck
                </p>
                <p className="mt-2 text-sm leading-relaxed text-white/50 md:text-base">
                  Part 450 reviews are slow, manual, and error-prone — companies miss launch
                  windows over paperwork.
                </p>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-300/80">
                  What SPLI does
                </p>
                <p className="mt-2 text-sm leading-relaxed text-white/50 md:text-base">
                  AI fills and checks your application, flags missing items, and manages the
                  FAA back-and-forth.
                </p>
              </div>
            </div>

            <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
              <Link
                href="/signin"
                className="inline-flex items-center justify-center rounded-full bg-white px-8 py-3.5 text-sm font-bold uppercase tracking-[0.14em] text-black transition-colors hover:bg-white/90"
              >
                Start your application
              </Link>
              <Link
                href="/company"
                className="inline-flex items-center justify-center rounded-full border border-white/15 px-8 py-3.5 text-sm font-semibold uppercase tracking-[0.12em] text-white/70 transition-colors hover:border-white/30 hover:text-white"
              >
                Company
              </Link>
            </div>
          </div>

          <div className="mx-auto w-full max-w-lg lg:max-w-none">
            <WorkflowPipelineVisual />
          </div>
        </div>
      </div>
    </div>
  );
}
