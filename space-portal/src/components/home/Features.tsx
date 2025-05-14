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
    icon: <FileText className="h-10 w-10 mb-4" />,
    title: 'FAA PART 450 LICENSING',
    description: 'Streamlined application process for commercial launch and reentry vehicle operations.'
  },
  {
    icon: <MessageSquare className="h-10 w-10 mb-4" />,
    title: 'INTEGRATED MESSAGING',
    description: 'Direct communication with FAA officials and automatic notifications about your application status.'
  },
  {
    icon: <Clock className="h-10 w-10 mb-4" />,
    title: 'REAL-TIME UPDATES',
    description: 'Receive instant updates on the status of your applications and any required changes.'
  },
  {
    icon: <Shield className="h-10 w-10 mb-4" />,
    title: 'SECURE DOCUMENT MANAGEMENT',
    description: 'Centralized, secure storage for all your licensing documents and correspondence.'
  },
  {
    icon: <Rocket className="h-10 w-10 mb-4" />,
    title: 'LAUNCH TRACKING',
    description: 'Monitor the entire lifecycle of your launch operations from application to completion.'
  },
  {
    icon: <RefreshCw className="h-10 w-10 mb-4" />,
    title: 'STREAMLINED WORKFLOW',
    description: 'Optimized process flow to reduce paperwork and expedite approval timelines.'
  },
];

export function Features() {
  return (
    <div className="py-20 bg-gradient-to-b from-zinc-900/90 via-black/95 to-black">
      <div className="space-container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            MISSION CONTROL FOR YOUR LICENSING NEEDS
          </h2>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto">
            Our platform simplifies the complex world of aerospace licensing with an intuitive interface and powerful features.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-8 border border-white/10 bg-white/10 rounded-2xl shadow-lg flex flex-col items-center text-center hover:bg-white/20 transition-colors backdrop-blur-sm"
            >
              {feature.icon}
              <h3 className="text-xl font-bold mb-2 text-white drop-shadow-lg">{feature.title}</h3>
              <p className="text-gray-200/90 drop-shadow">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
