'use client';

import { useState, useRef, useEffect } from 'react';
import {
  FileText,
  MessageSquare,
  Clock,
  Shield,
  Rocket,
  RefreshCw
} from 'lucide-react';

const features = [
  {
    icon: <FileText className="h-8 w-8" />,
    title: 'FAA PART 450 LICENSING',
    description: 'Streamlined application process for commercial launch and reentry vehicle operations.',
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    icon: <MessageSquare className="h-8 w-8" />,
    title: 'INTEGRATED MESSAGING',
    description: 'Direct communication with FAA officials and automatic notifications about your application status.',
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    icon: <Clock className="h-8 w-8" />,
    title: 'REAL-TIME UPDATES',
    description: 'Receive instant updates on the status of your applications and any required changes.',
    gradient: 'from-green-500 to-emerald-500'
  },
  {
    icon: <Shield className="h-8 w-8" />,
    title: 'SECURE DOCUMENT MANAGEMENT',
    description: 'Centralized, secure storage for all your licensing documents and correspondence.',
    gradient: 'from-orange-500 to-red-500'
  },
  {
    icon: <Rocket className="h-8 w-8" />,
    title: 'LAUNCH TRACKING',
    description: 'Monitor the entire lifecycle of your launch operations from application to completion.',
    gradient: 'from-indigo-500 to-purple-500'
  },
  {
    icon: <RefreshCw className="h-8 w-8" />,
    title: 'STREAMLINED WORKFLOW',
    description: 'Optimized process flow to reduce paperwork and expedite approval timelines.',
    gradient: 'from-teal-500 to-blue-500'
  },
];

export function Features() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

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
  return (
    <section 
      ref={sectionRef}
      className={`relative py-20 bg-black overflow-hidden transition-all duration-1000 ease-in-out transform section-fade-in ${
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

        {/* Orion Constellation */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.2 }}>
          <defs>
            <filter id="glow3">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          {/* Orion stars and lines */}
          <circle cx="20%" cy="20%" r="2.5" fill="white" filter="url(#glow3)" opacity="0.9"/>
          <circle cx="30%" cy="25%" r="2" fill="white" filter="url(#glow3)" opacity="0.8"/>
          <circle cx="40%" cy="30%" r="2.2" fill="white" filter="url(#glow3)" opacity="0.9"/>
          <circle cx="50%" cy="35%" r="1.8" fill="white" filter="url(#glow3)" opacity="0.7"/>
          <circle cx="60%" cy="40%" r="2.3" fill="white" filter="url(#glow3)" opacity="0.8"/>
          <circle cx="70%" cy="45%" r="1.6" fill="white" filter="url(#glow3)" opacity="0.6"/>
          <circle cx="80%" cy="50%" r="2" fill="white" filter="url(#glow3)" opacity="0.8"/>
          <circle cx="25%" cy="60%" r="1.8" fill="white" filter="url(#glow3)" opacity="0.7"/>
          <circle cx="35%" cy="65%" r="2.1" fill="white" filter="url(#glow3)" opacity="0.8"/>
          <circle cx="45%" cy="70%" r="1.9" fill="white" filter="url(#glow3)" opacity="0.7"/>

          {/* Orion connecting lines */}
          <line x1="20%" y1="20%" x2="30%" y2="25%" stroke="white" strokeWidth="1" opacity="0.3"/>
          <line x1="30%" y1="25%" x2="40%" y2="30%" stroke="white" strokeWidth="1" opacity="0.3"/>
          <line x1="40%" y1="30%" x2="50%" y2="35%" stroke="white" strokeWidth="1" opacity="0.3"/>
          <line x1="50%" y1="35%" x2="60%" y2="40%" stroke="white" strokeWidth="1" opacity="0.3"/>
          <line x1="60%" y1="40%" x2="70%" y2="45%" stroke="white" strokeWidth="1" opacity="0.3"/>
          <line x1="70%" y1="45%" x2="80%" y2="50%" stroke="white" strokeWidth="1" opacity="0.3"/>
          <line x1="25%" y1="60%" x2="35%" y2="65%" stroke="white" strokeWidth="1" opacity="0.3"/>
          <line x1="35%" y1="65%" x2="45%" y2="70%" stroke="white" strokeWidth="1" opacity="0.3"/>
        </svg>

        {/* Ursa Major (Big Dipper) Constellation */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.2 }}>
          <defs>
            <filter id="glow4">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          {/* Ursa Major stars and lines */}
          <circle cx="10%" cy="80%" r="2" fill="white" filter="url(#glow4)" opacity="0.8"/>
          <circle cx="20%" cy="75%" r="2.3" fill="white" filter="url(#glow4)" opacity="0.9"/>
          <circle cx="30%" cy="70%" r="1.8" fill="white" filter="url(#glow4)" opacity="0.7"/>
          <circle cx="40%" cy="65%" r="2.1" fill="white" filter="url(#glow4)" opacity="0.8"/>
          <circle cx="50%" cy="60%" r="1.9" fill="white" filter="url(#glow4)" opacity="0.7"/>
          <circle cx="60%" cy="55%" r="2.2" fill="white" filter="url(#glow4)" opacity="0.8"/>
          <circle cx="70%" cy="50%" r="1.7" fill="white" filter="url(#glow4)" opacity="0.6"/>
          <circle cx="80%" cy="45%" r="2" fill="white" filter="url(#glow4)" opacity="0.8"/>

          {/* Ursa Major connecting lines */}
          <line x1="10%" y1="80%" x2="20%" y2="75%" stroke="white" strokeWidth="1" opacity="0.3"/>
          <line x1="20%" y1="75%" x2="30%" y2="70%" stroke="white" strokeWidth="1" opacity="0.3"/>
          <line x1="30%" y1="70%" x2="40%" y2="65%" stroke="white" strokeWidth="1" opacity="0.3"/>
          <line x1="40%" y1="65%" x2="50%" y2="60%" stroke="white" strokeWidth="1" opacity="0.3"/>
          <line x1="50%" y1="60%" x2="60%" y2="55%" stroke="white" strokeWidth="1" opacity="0.3"/>
          <line x1="60%" y1="55%" x2="70%" y2="50%" stroke="white" strokeWidth="1" opacity="0.3"/>
          <line x1="70%" y1="50%" x2="80%" y2="45%" stroke="white" strokeWidth="1" opacity="0.3"/>
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 tracking-tight">
            MISSION CONTROL FOR YOUR LICENSING NEEDS
          </h2>
          <p className="text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
            Our platform simplifies the complex world of aerospace licensing with an intuitive interface and powerful features.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative"
            >
              {/* Card */}
              <div className="relative p-8 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm transition-all duration-300 hover:bg-white/10 hover:border-white/20">
                {/* Icon */}
                <div className="text-white mb-5 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                
                {/* Content */}
                <h3 className="text-lg font-bold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-sm text-white/70 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
