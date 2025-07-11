import React from 'react';

interface YouTubeBackgroundProps {
  videoId: string;
  className?: string;
  overlayOpacity?: number;
}

export function YouTubeBackground({ 
  videoId, 
  className = "", 
  overlayOpacity = 0.3 
}: YouTubeBackgroundProps) {
  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* YouTube iframe */}
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&enablejsapi=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`}
        title="Background Video"
        className="absolute inset-0 w-full h-full object-cover"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
      
      {/* Overlay for better text readability */}
      <div 
        className="absolute inset-0 bg-black"
        style={{ opacity: overlayOpacity }}
      />
    </div>
  );
} 