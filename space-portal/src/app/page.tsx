import { Hero } from "@/components/home/Hero";
import { Features } from "@/components/home/Features";
import { Footer } from "@/components/layout/Footer";

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
    </main>
  );
}
