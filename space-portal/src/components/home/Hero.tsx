import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowDown } from 'lucide-react';

export function Hero() {
  return (
    <div className="relative h-screen w-full flex flex-col justify-center items-center text-white overflow-hidden">
      {/* Top Navigation */}
      <div className="absolute top-0 right-0 left-0 z-20 p-6">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="text-white text-xl font-bold tracking-wider">
            SPLI
          </Link>
          <div className="flex space-x-6 items-center">
            <Link href="/" className="text-sm font-medium text-white/80 hover:text-white transition-colors">
              HOME
            </Link>
            <Link href="/company" className="text-sm font-medium text-white/80 hover:text-white transition-colors">
              COMPANY
            </Link>
            <Link href="/signin" className="text-sm font-medium text-white/80 hover:text-white transition-colors">
              LOG IN
            </Link>
          </div>
        </div>
      </div>

      {/* Background image with gradient overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{
          backgroundImage: "url('https://ext.same-assets.com/1000355058/1037260420.jpeg')",
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/80"></div>
      </div>

      {/* Content */}
      <div className="z-10 space-y-8 text-center max-w-4xl px-4">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
          PIONEERING SPACE LICENSING
        </h1>
        <p className="text-xl md:text-2xl font-light text-gray-300 max-w-3xl mx-auto">
          We're revolutionizing the aerospace industry by streamlining the complex licensing process for commercial space operations.
        </p>
        <div className="pt-10">
          <Link href="/signin" passHref>
            <Button variant="outline" size="lg" className="spacex-button min-w-[180px]">
              GET STARTED
            </Button>
          </Link>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-10">
        <ArrowDown className="h-8 w-8 text-white opacity-80 animated-arrow" />
      </div>
    </div>
  );
}
