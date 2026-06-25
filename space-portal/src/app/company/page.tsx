import Link from 'next/link';
import { Footer } from '@/components/layout/Footer';
import { Rocket, Award, Globe, ShieldCheck } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import Image from 'next/image';
import { LandingBackground } from '@/components/landing/LandingBackground';

export default function CompanyPage() {
  return (
    <main className="min-h-screen bg-black">
      <Navbar />

      <div className="relative flex min-h-screen items-center overflow-hidden">
        <LandingBackground variant="hero" />

        <div className="relative z-10 mx-auto w-full max-w-[1400px] px-6 pb-16 pt-28 lg:px-12 lg:pb-20 lg:pt-32">
          <div className="mx-auto max-w-3xl text-center lg:mx-0 lg:max-w-2xl lg:text-left">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/40">
              Company
            </p>
            <h1 className="mt-4 text-[clamp(2rem,4.5vw,3.75rem)] font-bold leading-[1.08] tracking-[-0.02em] text-white">
              OUR MISSION & VISION
            </h1>
            <p className="mt-6 text-base leading-relaxed text-white/55 md:text-lg">
              Building the future of space exploration through innovative licensing solutions and regulatory excellence. Join us on our journey to transform the industry.
            </p>
            <Link
              href="https://calendly.com/harikesh-tambareni/spli-ai-demo?month=2025-05"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-10 inline-flex items-center justify-center rounded-full bg-white px-8 py-3.5 text-sm font-bold uppercase tracking-[0.14em] text-black transition-colors hover:bg-white/90"
            >
              Get started
            </Link>
          </div>
        </div>
      </div>

      <div className="relative py-24 md:py-32">
        <LandingBackground variant="section" />
        <div className="relative z-10 mx-auto max-w-[1400px] px-6 lg:px-12">
          <div className="mb-16 max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/40">
              About
            </p>
            <h2 className="mt-3 text-[clamp(1.75rem,3.5vw,2.5rem)] font-bold leading-tight tracking-[-0.02em] text-white">
              ABOUT SPLI
            </h2>
          </div>

          <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
            <div className="space-y-6">
              <p className="text-base leading-relaxed text-white/55 md:text-lg">
                Founded in 2025, SPLI is dedicated to democratizing access to space by removing the regulatory barriers that have historically slowed innovation in commercial space flight.
              </p>
              <p className="text-base leading-relaxed text-white/55 md:text-lg">
                Our platform connects commercial space operators with regulatory bodies through an intuitive interface that simplifies the complex application process for FAA Part 450 licensing and other aerospace permits.
              </p>
              <p className="text-base leading-relaxed text-white/55 md:text-lg">
                We leverage cutting-edge technology and deep aerospace industry expertise to ensure compliance while accelerating the path to launch approval.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center">
                <Rocket className="mx-auto mb-4 h-10 w-10 text-white/60" />
                <h3 className="mb-2 text-sm font-bold text-white">MISSION</h3>
                <p className="text-sm text-white/45">To accelerate humanity's journey to the stars</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center">
                <Globe className="mx-auto mb-4 h-10 w-10 text-white/60" />
                <h3 className="mb-2 text-sm font-bold text-white">VISION</h3>
                <p className="text-sm text-white/45">A multiplanetary future with simplified space access</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center">
                <Award className="mx-auto mb-4 h-10 w-10 text-white/60" />
                <h3 className="mb-2 text-sm font-bold text-white">EXCELLENCE</h3>
                <p className="text-sm text-white/45">Setting the gold standard in aerospace compliance</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center">
                <ShieldCheck className="mx-auto mb-4 h-10 w-10 text-white/60" />
                <h3 className="mb-2 text-sm font-bold text-white">SAFETY</h3>
                <p className="text-sm text-white/45">Ensuring safe operations through rigorous protocols</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative py-24 md:py-32">
        <LandingBackground variant="section" />
        <div className="relative z-10 mx-auto max-w-[1400px] px-6 lg:px-12">
          <div className="mb-16 max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/40">
              Team
            </p>
            <h2 className="mt-3 text-[clamp(1.75rem,3.5vw,2.5rem)] font-bold leading-tight tracking-[-0.02em] text-white">
              MEET OUR TEAM
            </h2>
            <p className="mt-5 text-base leading-relaxed text-white/50">
              Our leadership team combines expertise in aerospace engineering, regulatory compliance, and cutting-edge technology to revolutionize the space licensing process.
            </p>
          </div>

          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-2">
            <a
              href="https://www.linkedin.com/in/harikesh-tambareni"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 transition-transform duration-300 hover:-translate-y-1"
            >
              <div className="relative mb-6 h-96 w-full overflow-hidden rounded-xl bg-zinc-950">
                <Image
                  src="/htam.jpeg"
                  alt="Harikesh Tambareni"
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 768px) 100vw, 400px"
                />
              </div>
              <h3 className="mb-2 text-2xl text-white">HARIKESH TAMBARENI</h3>
              <p className="text-sm font-medium text-white/55">Co-Founder / CEO</p>
            </a>

            <a
              href="https://www.linkedin.com/in/rohansathisha"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 transition-transform duration-300 hover:-translate-y-1"
            >
              <div className="relative mb-6 h-96 w-full overflow-hidden rounded-xl bg-zinc-950">
                <Image
                  src="/rohan.jpg"
                  alt="Rohan Sathisha"
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 768px) 100vw, 400px"
                />
              </div>
              <h3 className="mb-2 text-2xl text-white">ROHAN SATHISHA</h3>
              <p className="text-sm font-medium text-white/55">Co-Founder / CTO</p>
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
