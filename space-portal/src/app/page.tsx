import { Hero } from "@/components/home/Hero";
import { Features } from "@/components/home/Features";
import { TimeComparison } from "@/components/home/TimeComparison";
import { Footer } from "@/components/layout/Footer";

export default function Home() {
  return (
    <main className="bg-black">
      <Hero />
      <TimeComparison />
      <Features />
      <Footer />
    </main>
  );
}
