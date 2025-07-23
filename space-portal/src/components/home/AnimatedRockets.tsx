'use client';

export function AnimatedRockets() {
  return (
    <>
      <style jsx>{`
        @keyframes travelLeft {
          0% { 
            transform: translateX(-100px) rotate(45deg);
            opacity: 0;
          }
          10% { 
            opacity: 1;
          }
          90% { 
            opacity: 1;
          }
          100% { 
            transform: translateX(100vw) rotate(45deg);
            opacity: 0;
          }
        }
        @keyframes travelRight {
          0% { 
            transform: translateX(100vw) rotate(45deg);
            opacity: 0;
          }
          10% { 
            opacity: 1;
          }
          90% { 
            opacity: 1;
          }
          100% { 
            transform: translateX(-100px) rotate(45deg);
            opacity: 0;
          }
        }
        .rocket-travel-1 {
          animation: travelLeft 10s linear infinite;
        }
        .rocket-travel-2 {
          animation: travelRight 10s linear infinite;
          animation-delay: 5s;
        }
      `}</style>
      
      {/* Top Left Rocket - Travels horizontally from right to left */}
      <div className="absolute top-60 left-0 z-20">
        <div className="relative rocket-travel-1">
          <div className="text-6xl text-blue-400 drop-shadow-lg">
            🚀
          </div>
        </div>
      </div>

      {/* Bottom Right Rocket - Travels horizontally from right to left */}
      <div className="absolute bottom-60 left-0 z-20">
        <div className="relative rocket-travel-2">
          <div className="text-6xl text-purple-400 drop-shadow-lg">
            🚀
          </div>
        </div>
      </div>

      {/* Additional floating elements for visual interest */}
      <div className="absolute top-40 left-40 w-2 h-2 bg-white/10 rounded-full animate-ping"></div>
      <div className="absolute bottom-40 right-40 w-3 h-3 bg-white/10 rounded-full animate-ping" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-60 right-60 w-1 h-1 bg-white/20 rounded-full animate-pulse"></div>
      <div className="absolute bottom-60 left-60 w-1 h-1 bg-white/20 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
    </>
  );
} 