'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export function TimeComparison() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'without' | 'with'>('without');
  const [isLocked, setIsLocked] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  // Handle scroll-based automatic switching like Lawdie.co
  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current || hasTriggered) return;

      const rect = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Trigger when section is fully in view and user has scrolled to it
      if (rect.top <= 100 && rect.bottom >= windowHeight - 100) {
        console.log('Section in view - triggering auto-switch');
        setHasTriggered(true);
        setIsLocked(true);
        
        // Start with "Without SPLI"
        setActiveTab('without');
        
        // Switch to "With SPLI" after 1 second
        setTimeout(() => {
          setActiveTab('with');
        }, 1000);
        
        // Unlock after 3 seconds total
        setTimeout(() => {
          setIsLocked(false);
        }, 3000);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasTriggered]);

  // Manual tab switching (only when not locked)
  const handleTabSwitch = (tab: 'without' | 'with') => {
    if (!isLocked) {
      setActiveTab(tab);
    }
  };

  // Reset function for testing
  const resetSection = () => {
    setHasTriggered(false);
    setIsLocked(false);
    setActiveTab('without');
  };

  // Intersection Observer for smooth fade-in
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Lock scroll when section is locked
  useEffect(() => {
    if (isLocked) {
      // Add a small delay to ensure smooth transition
      setTimeout(() => {
        const scrollY = window.scrollY;
        document.body.style.position = 'fixed';
        document.body.style.top = `-${scrollY}px`;
        document.body.style.width = '100%';
        document.body.style.overflow = 'hidden';
        console.log('Scroll locked at position:', scrollY);
      }, 100);
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      
      if (scrollY) {
        const restorePosition = parseInt(scrollY.replace('px', '').replace('-', '')) || 0;
        window.scrollTo(0, restorePosition);
        console.log('Scroll unlocked, restored to position:', restorePosition);
      }
    }

    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
    };
  }, [isLocked]);

  const withoutSpliTimeline = [
    { time: 'Month 1', task: 'Manual document preparation and extensive review process', status: 'delayed' },
    { time: 'Month 2', task: 'Initial FAA submission and extended waiting period', status: 'delayed' },
    { time: 'Month 3', task: 'FAA feedback and multiple revision requests', status: 'delayed' },
    { time: 'Month 4', task: 'Document resubmission and additional review cycles', status: 'delayed' },
    { time: 'Month 5', task: 'Final approval process and coordination delays', status: 'delayed' },
    { time: 'Month 6+', task: 'Ongoing delays and missed launch window opportunities', status: 'delayed' },
  ];

  const withSpliTimeline = [
    { time: 'Week 1', task: 'AI-powered application completion and validation', status: 'completed' },
    { time: 'Week 2', task: 'Automated compliance review and document preparation', status: 'completed' },
    { time: 'Week 3', task: 'Direct FAA submission with pre-approval coordination', status: 'completed' },
    { time: 'Week 4', task: 'Real-time status tracking and automated updates', status: 'completed' },
    { time: 'Week 5', task: 'License approval process and final documentation', status: 'completed' },
    { time: 'Week 6', task: 'Launch operations preparation and readiness', status: 'completed' },
  ];

  return (
    <section 
      ref={sectionRef}
      className={`relative py-16 bg-black overflow-hidden transition-all duration-1000 ease-in-out transform section-fade-in ${
        isVisible ? 'visible' : ''
      }`}
    >
      {/* Constellation background - matching Hero section */}
      <div className="absolute inset-0 bg-black">
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

      <div className="relative z-10 max-w-6xl mx-auto px-6 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left Column - Value Proposition */}
          <div className="space-y-4">
            {/* Header moved to left column */}
            <div>
              <div className="inline-block bg-gradient-to-r from-red-500/20 to-green-500/20 backdrop-blur-sm border border-white/10 rounded-2xl px-6 py-3 mb-4">
                <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                  From 6+ months to 6 weeks
                </h2>
              </div>
              <p className="text-lg text-gray-300 leading-relaxed">
                Traditional FAA licensing processes waste months on paperwork and delays. 
                SPLI streamlines everything, getting you from application to approval in weeks.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-3">
                Take back your launch schedule
              </h3>
              <p className="text-sm text-gray-300 leading-relaxed">
                Space companies lose millions in delayed launches due to inefficient licensing processes. 
                SPLI eliminates the bottlenecks, reducing application time by 90% while improving accuracy.
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0 shadow-lg shadow-blue-400/30"></div>
                <div>
                  <h4 className="text-white font-semibold text-sm">90% faster processing</h4>
                  <p className="text-gray-400 text-xs">From months to weeks</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0 shadow-lg shadow-green-400/30"></div>
                <div>
                  <h4 className="text-white font-semibold text-sm">AI-powered validation</h4>
                  <p className="text-gray-400 text-xs">Reduce errors and revisions</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0 shadow-lg shadow-purple-400/30"></div>
                <div>
                  <h4 className="text-white font-semibold text-sm">Direct FAA communication</h4>
                  <p className="text-gray-400 text-xs">Streamlined coordination</p>
                </div>
              </div>
            </div>

            <button 
              onClick={() => router.push('/signin')}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Start your application
            </button>
          </div>

          {/* Right Column - Comparison Widget */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 shadow-2xl">
            {/* Tab Navigation */}
            <div className={`flex bg-white/10 rounded-lg p-1 mb-4 ${isLocked ? 'pointer-events-none opacity-50' : ''}`}>
              <button
                type="button"
                onClick={() => handleTabSwitch('without')}
                className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium transition-all duration-300 z-10 relative ${
                  activeTab === 'without'
                    ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg'
                    : isLocked 
                      ? 'text-gray-500 cursor-not-allowed'
                      : 'text-gray-400 hover:text-white hover:bg-white/10 cursor-pointer'
                }`}
              >
                Without SPLI
              </button>
              <button
                type="button"
                onClick={() => handleTabSwitch('with')}
                className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium transition-all duration-300 z-10 relative ${
                  activeTab === 'with'
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg'
                    : isLocked 
                      ? 'text-gray-500 cursor-not-allowed'
                      : 'text-gray-400 hover:text-white hover:bg-white/10 cursor-pointer'
                }`}
              >
                With SPLI
              </button>
            </div>
            
            {/* Lock indicator */}
            {isLocked && (
              <div className="text-center mb-3">
                <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-white/20 backdrop-blur-sm">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse mr-2"></div>
                  <span className="text-xs text-white/80 font-medium">
                    {activeTab === 'without' ? 'Showing traditional process...' : 'Switching to SPLI...'}
                  </span>
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className="space-y-2">
              {(activeTab === 'without' ? withoutSpliTimeline : withSpliTimeline).map((item, index) => (
                <div key={index} className="flex items-start space-x-2 p-2 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-200">
                  <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    item.status === 'completed' 
                      ? 'bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-400 border border-green-500/30' 
                      : 'bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-400 border border-red-500/30'
                  }`}>
                    {item.status === 'completed' ? '✓' : '✗'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-xs font-bold mb-0.5 ${
                      item.status === 'completed' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {item.time}
                    </div>
                    <div className="text-white/80 text-xs leading-tight">
                      {item.task}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="mt-4 p-3 bg-gradient-to-r from-white/10 to-white/5 rounded-lg border border-white/20 backdrop-blur-sm">
              <div className="text-center">
                <div className={`text-lg font-bold mb-1 ${
                  activeTab === 'with' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {activeTab === 'with' ? '6 weeks' : '6+ months'}
                </div>
                <div className="text-white/70 text-xs">
                  {activeTab === 'with' 
                    ? 'Total time to approval' 
                    : 'Average processing time'
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 