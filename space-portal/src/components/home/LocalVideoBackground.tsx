import React from 'react';

interface LocalVideoBackgroundProps {
  videoSrc: string;
  className?: string;
  overlayOpacity?: number;
  filter?: string;
}

export function LocalVideoBackground({ 
  videoSrc, 
  className = "", 
  overlayOpacity = 0.3,
  filter = 'saturate(1.2) blur(0px)'
}: LocalVideoBackgroundProps) {
  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Local video background */}
      <video
        src={videoSrc}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter }}
      />
      
      {/* Overlay for better text readability */}
      <div 
        className="absolute inset-0 bg-black"
        style={{ opacity: overlayOpacity }}
      />
    </div>
  );
} 