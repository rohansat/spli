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

      {/* Black background */}
      <div className="absolute inset-0 bg-black z-0" />
    </div>
  );
}
