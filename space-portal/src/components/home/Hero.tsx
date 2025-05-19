import { PublicNav } from '@/components/layout/PublicNav';

export function Hero() {
  return (
    <div className="relative h-screen w-full flex flex-col justify-between items-center text-white overflow-hidden">
      <PublicNav transparent />

      {/* Centered headline */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <h1 className="text-3xl md:text-5xl font-bold text-white text-center drop-shadow-lg">
          Unlocking a New Era in Space Licensing
        </h1>
      </div>

      {/* Video background with lighter gradient overlay */}
      <video
        src="/earthy.mp4"
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
