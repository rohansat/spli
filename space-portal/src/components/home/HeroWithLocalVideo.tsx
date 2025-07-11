import { PublicNav } from '@/components/layout/PublicNav';
import { LocalVideoBackground } from './LocalVideoBackground';

interface HeroWithLocalVideoProps {
  videoSrc: string;
  title?: string;
  overlayOpacity?: number;
  filter?: string;
}

export function HeroWithLocalVideo({ 
  videoSrc, 
  title = "Unlocking a New Era in Space Licensing",
  overlayOpacity = 0.4,
  filter = 'saturate(1.2) blur(0px)'
}: HeroWithLocalVideoProps) {
  return (
    <div className="relative h-screen w-full flex flex-col justify-between items-center text-white overflow-hidden">
      <PublicNav transparent />

      {/* Local video background */}
      <LocalVideoBackground 
        videoSrc={videoSrc} 
        className="absolute inset-0 z-0"
        overlayOpacity={overlayOpacity}
        filter={filter}
      />

      {/* Centered headline */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <h1 className="text-3xl md:text-5xl font-bold text-white text-center drop-shadow-lg px-4">
          {title}
        </h1>
      </div>
    </div>
  );
} 