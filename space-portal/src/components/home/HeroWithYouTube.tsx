import { PublicNav } from '@/components/layout/PublicNav';
import { YouTubeBackground } from './YouTubeBackground';

interface HeroWithYouTubeProps {
  videoId: string;
  title?: string;
  overlayOpacity?: number;
}

export function HeroWithYouTube({ 
  videoId, 
  title = "Unlocking a New Era in Space Licensing",
  overlayOpacity = 0.4 
}: HeroWithYouTubeProps) {
  return (
    <div className="relative h-screen w-full flex flex-col justify-between items-center text-white overflow-hidden">
      <PublicNav transparent />

      {/* YouTube video background */}
      <YouTubeBackground 
        videoId={videoId} 
        className="absolute inset-0 z-0"
        overlayOpacity={overlayOpacity}
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