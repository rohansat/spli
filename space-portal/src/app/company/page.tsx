import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Footer } from '@/components/layout/Footer';
import { Rocket, Award, Globe, ShieldCheck } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';

export default function CompanyPage() {
  return (
    <main className="min-h-screen bg-black">
      <Navbar />

      {/* Hero Section - Full Height */}
      <div className="min-h-screen flex items-center relative">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40 z-0"
          style={{
            backgroundImage: "url('https://ext.same-assets.com/2953234437/3242080397.jpeg')",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black via-black/80 to-black"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">OUR MISSION & VISION</h1>
            <p className="text-xl text-gray-300 mb-8">
              Building the future of space exploration through innovative licensing solutions and regulatory excellence. Join us on our journey to transform the industry.
            </p>
            <Link href="/signin" passHref>
              <Button variant="outline" size="lg" className="spacex-button min-w-[180px]">
                GET STARTED
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* About Section - Full Height */}
      <div className="min-h-screen flex items-center bg-zinc-950">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">ABOUT SPLI</h2>
            <div className="h-1 w-20 bg-white/20 mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-white/80 text-lg mb-6">
                Founded in 2025, SPLI is dedicated to democratizing access to space by removing the regulatory barriers that have historically slowed innovation in commercial space flight.
              </p>
              <p className="text-white/80 text-lg mb-6">
                Our platform connects commercial space operators with regulatory bodies through an intuitive interface that simplifies the complex application process for FAA Part 450 licensing and other aerospace permits.
              </p>
              <p className="text-white/80 text-lg">
                We leverage cutting-edge technology and deep aerospace industry expertise to ensure compliance while accelerating the path to launch approval.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="p-6 bg-black/50 border border-white/10 text-center">
                <Rocket className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">MISSION</h3>
                <p className="text-white/70">To accelerate humanity's journey to the stars</p>
              </div>

              <div className="p-6 bg-black/50 border border-white/10 text-center">
                <Globe className="h-12 w-12 text-green-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">VISION</h3>
                <p className="text-white/70">A multiplanetary future with simplified space access</p>
              </div>

              <div className="p-6 bg-black/50 border border-white/10 text-center">
                <Award className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">EXCELLENCE</h3>
                <p className="text-white/70">Setting the gold standard in aerospace compliance</p>
              </div>

              <div className="p-6 bg-black/50 border border-white/10 text-center">
                <ShieldCheck className="h-12 w-12 text-red-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">SAFETY</h3>
                <p className="text-white/70">Ensuring safe operations through rigorous protocols</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Team Section - Full Height */}
      <div className="min-h-screen flex items-center bg-black">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">MEET OUR TEAM</h2>
            <div className="h-1 w-20 bg-white/20 mx-auto mb-6"></div>
            <p className="text-white/70 max-w-2xl mx-auto">
              Our leadership team combines expertise in aerospace engineering, regulatory compliance, and cutting-edge technology to revolutionize the space licensing process.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            <a
              href="https://www.linkedin.com/in/harikesh-tambareni"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-zinc-900 border border-white/10 p-8 transition-transform hover:-translate-y-2 duration-300"
            >
              <div className="h-64 bg-gradient-to-br from-blue-900 to-indigo-900 mb-6 flex items-center justify-center">
                <div className="text-6xl font-bold text-white/30">HT</div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">HARIKESH TAMBARENI</h3>
              <p className="text-blue-400 mb-4">Co-Founder / CEO</p>
              <p className="text-white/70">
                With a background in aerospace engineering and regulatory policy, Harikesh leads the company's vision to streamline licensing processes for the industry's innovators.
              </p>
            </a>

            <a
              href="https://www.linkedin.com/in/rohansathisha"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-zinc-900 border border-white/10 p-8 transition-transform hover:-translate-y-2 duration-300"
            >
              <div className="h-64 bg-gradient-to-br from-purple-900 to-indigo-900 mb-6 flex items-center justify-center">
                <div className="text-6xl font-bold text-white/30">RS</div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">ROHAN SATHISHA</h3>
              <p className="text-blue-400 mb-4">Co-Founder / CTO</p>
              <p className="text-white/70">
                A technology visionary with expertise in secure systems and regulatory compliance software, Rohan architects the platform that is revolutionizing aerospace licensing.
              </p>
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
