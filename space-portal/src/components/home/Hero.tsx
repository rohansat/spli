import { PublicNav } from '@/components/layout/PublicNav';

export function Hero() {
  return (
    <div className="relative h-screen w-full flex flex-col justify-between items-center text-white overflow-hidden">
      <PublicNav transparent />

      {/* Video background with lighter gradient overlay */}
      <video
        src="/spli4.mp4"
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
        style={{ filter: 'saturate(1.2) blur(0px)' }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/30 z-0" />
    </div>
  );
}
