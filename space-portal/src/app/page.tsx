import { HeroWithLocalVideo } from "@/components/home/HeroWithLocalVideo";
import { Features } from "@/components/home/Features";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";

export default function Home() {
  return (
    <main className="bg-black">
      {/* Full-screen hero section with local video background */}
      <section className="h-screen">
        <HeroWithLocalVideo 
          videoSrc="/earthy.mp4" // Using existing video for now
          title="Unlocking a New Era in Space Licensing"
          overlayOpacity={0.4}
          filter="saturate(1.1) blur(0px)"
        />
      </section>

      {/* Content sections */}
      <Features />
      <Footer />
    </main>
  );
}
