import { Hero } from "@/components/home/Hero";
import { Features } from "@/components/home/Features";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";

export default function Home() {
  return (
    <main className="bg-black">
      {/* Full-screen hero section */}
      <section className="h-screen">
        <Hero />
      </section>

      {/* Content sections */}
      <Features />
      <Footer />

      <div className="relative min-h-screen bg-[url('/launch.jpg')] bg-cover bg-center">
        <div className="absolute inset-0 bg-black/60" />
        
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-4">
          <h1 className="text-6xl font-bold text-white mb-6 tracking-tight">
            PIONEERING SPACE<br />LICENSING
          </h1>
          <p className="text-xl text-white/80 mb-12 max-w-3xl">
            We're revolutionizing the aerospace industry by streamlining the
            complex licensing process for commercial space operations.
          </p>
          <Link 
            href="/signin" 
            className="bg-white hover:bg-white/90 text-black px-8 py-3 rounded-md font-medium"
          >
            GET STARTED
          </Link>
        </div>
      </div>
    </main>
  );
}
