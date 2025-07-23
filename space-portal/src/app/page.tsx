import { Hero } from "@/components/home/Hero";
import { Features } from "@/components/home/Features";
import { TimeComparison } from "@/components/home/TimeComparison";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";

export default function Home() {
  return (
    <main className="bg-black">
      {/* Full-screen hero section */}
      <section className="h-screen">
        <Hero />
      </section>

      {/* Content sections with smooth transitions */}
      <div className="py-16 transition-all duration-1000 ease-in-out">
        <TimeComparison />
      </div>
      
      <div className="py-16 transition-all duration-1000 ease-in-out">
        <Features />
      </div>
      
      <Footer />
    </main>
  );
}
