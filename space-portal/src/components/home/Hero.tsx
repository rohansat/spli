'use client';
import { PublicNav } from '@/components/layout/PublicNav';

export function Hero() {
  return (
    <div className="relative h-screen w-full flex flex-col justify-between items-center text-white overflow-hidden">
      <PublicNav transparent />

      {/* Centered headline */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="text-center max-w-4xl px-6">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight drop-shadow-lg">
            Unlocking a New Era in Space Licensing
          </h1>
          <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
            Streamline your aerospace licensing process with AI-powered efficiency
          </p>
        </div>
      </div>

      {/* Constellation background */}
      <div className="absolute inset-0 bg-black z-0">
        {/* Stars */}
        <div className="absolute inset-0">
          {Array.from({ length: 60 }, (_, i) => (
            <div
              key={i}
              className="absolute bg-white rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 2 + 1}px`,
                height: `${Math.random() * 2 + 1}px`,
                animationDelay: `${Math.random() * 4}s`,
                animationDuration: `${Math.random() * 3 + 2}s`,
                opacity: Math.random() * 0.5 + 0.1,
              }}
            />
          ))}
        </div>
        
        {/* Scorpio Constellation */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.2 }}>
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          {/* Scorpio stars and lines */}
          <circle cx="15%" cy="25%" r="2" fill="white" filter="url(#glow)" opacity="0.8"/>
          <circle cx="25%" cy="30%" r="1.5" fill="white" filter="url(#glow)" opacity="0.7"/>
          <circle cx="35%" cy="35%" r="2.5" fill="white" filter="url(#glow)" opacity="0.9"/>
          <circle cx="45%" cy="40%" r="1.8" fill="white" filter="url(#glow)" opacity="0.6"/>
          <circle cx="55%" cy="45%" r="2.2" fill="white" filter="url(#glow)" opacity="0.8"/>
          <circle cx="65%" cy="50%" r="1.6" fill="white" filter="url(#glow)" opacity="0.7"/>
          <circle cx="75%" cy="55%" r="2" fill="white" filter="url(#glow)" opacity="0.8"/>
          <circle cx="85%" cy="60%" r="1.4" fill="white" filter="url(#glow)" opacity="0.6"/>
          <circle cx="90%" cy="65%" r="1.8" fill="white" filter="url(#glow)" opacity="0.7"/>
          <circle cx="92%" cy="70%" r="1.2" fill="white" filter="url(#glow)" opacity="0.5"/>
          
          {/* Scorpio connecting lines */}
          <line x1="15%" y1="25%" x2="25%" y2="30%" stroke="white" strokeWidth="1" opacity="0.3"/>
          <line x1="25%" y1="30%" x2="35%" y2="35%" stroke="white" strokeWidth="1" opacity="0.3"/>
          <line x1="35%" y1="35%" x2="45%" y2="40%" stroke="white" strokeWidth="1" opacity="0.3"/>
          <line x1="45%" y1="40%" x2="55%" y2="45%" stroke="white" strokeWidth="1" opacity="0.3"/>
          <line x1="55%" y1="45%" x2="65%" y2="50%" stroke="white" strokeWidth="1" opacity="0.3"/>
          <line x1="65%" y1="50%" x2="75%" y2="55%" stroke="white" strokeWidth="1" opacity="0.3"/>
          <line x1="75%" y1="55%" x2="85%" y2="60%" stroke="white" strokeWidth="1" opacity="0.3"/>
          <line x1="85%" y1="60%" x2="90%" y2="65%" stroke="white" strokeWidth="1" opacity="0.3"/>
          <line x1="90%" y1="65%" x2="92%" y2="70%" stroke="white" strokeWidth="1" opacity="0.3"/>
        </svg>

        {/* Pisces Constellation */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.2 }}>
          <defs>
            <filter id="glow2">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          {/* Pisces stars and lines */}
          <circle cx="20%" cy="75%" r="2" fill="white" filter="url(#glow2)" opacity="0.8"/>
          <circle cx="30%" cy="80%" r="1.5" fill="white" filter="url(#glow2)" opacity="0.7"/>
          <circle cx="40%" cy="85%" r="2.5" fill="white" filter="url(#glow2)" opacity="0.9"/>
          <circle cx="50%" cy="80%" r="1.8" fill="white" filter="url(#glow2)" opacity="0.6"/>
          <circle cx="60%" cy="75%" r="2.2" fill="white" filter="url(#glow2)" opacity="0.8"/>
          <circle cx="70%" cy="70%" r="1.6" fill="white" filter="url(#glow2)" opacity="0.7"/>
          <circle cx="80%" cy="75%" r="2" fill="white" filter="url(#glow2)" opacity="0.8"/>
          <circle cx="85%" cy="80%" r="1.4" fill="white" filter="url(#glow2)" opacity="0.6"/>
          <circle cx="90%" cy="85%" r="1.8" fill="white" filter="url(#glow2)" opacity="0.7"/>
          
          {/* Pisces connecting lines */}
          <line x1="20%" y1="75%" x2="30%" y2="80%" stroke="white" strokeWidth="1" opacity="0.3"/>
          <line x1="30%" y1="80%" x2="40%" y2="85%" stroke="white" strokeWidth="1" opacity="0.3"/>
          <line x1="40%" y1="85%" x2="50%" y2="80%" stroke="white" strokeWidth="1" opacity="0.3"/>
          <line x1="50%" y1="80%" x2="60%" y2="75%" stroke="white" strokeWidth="1" opacity="0.3"/>
          <line x1="60%" y1="75%" x2="70%" y2="70%" stroke="white" strokeWidth="1" opacity="0.3"/>
          <line x1="70%" y1="70%" x2="80%" y2="75%" stroke="white" strokeWidth="1" opacity="0.3"/>
          <line x1="80%" y1="75%" x2="85%" y2="80%" stroke="white" strokeWidth="1" opacity="0.3"/>
          <line x1="85%" y1="80%" x2="90%" y2="85%" stroke="white" strokeWidth="1" opacity="0.3"/>
        </svg>
        

      </div>
    </div>
  );
}
