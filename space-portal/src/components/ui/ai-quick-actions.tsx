"use client";

import React from "react";
import { Button } from "./button";
import { 
  FileText, 
  Rocket, 
  Shield, 
  MapPin, 
  Clock, 
  HelpCircle, 
  Zap,
  Lightbulb,
  Settings,
  CheckCircle,
  Brain,
  Globe,
  Satellite,
  Plane,
  Target,
  Database,
  BookOpen,
  Search,
  Upload,
  Edit3,
  BarChart3,
  AlertTriangle,
  Compass,
  Layers,
  Cpu,
  Battery,
  Wifi,
  Camera,
  Thermometer,
  Gauge
} from "lucide-react";

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  prompt: string;
  category: 'form' | 'help' | 'analysis' | 'general' | 'space' | 'aerospace' | 'document' | 'enhancement';
}

const quickActions: QuickAction[] = [
  // Form-related actions
  {
    id: 'auto-fill',
    title: 'Auto-fill Form',
    description: 'Automatically fill form fields from mission description',
    icon: <Zap className="h-4 w-4" />,
    prompt: 'Please analyze my mission description and auto-fill the relevant form fields',
    category: 'form'
  },
  {
    id: 'mission-description',
    title: 'Mission Description',
    description: 'Help me write a comprehensive mission description',
    icon: <Rocket className="h-4 w-4" />,
    prompt: 'Help me write a detailed mission description for my FAA Part 450 application',
    category: 'form'
  },
  {
    id: 'safety-analysis',
    title: 'Safety Analysis',
    description: 'Get help with safety considerations and risk assessment',
    icon: <Shield className="h-4 w-4" />,
    prompt: 'Help me analyze safety considerations and risks for my launch mission',
    category: 'form'
  },
  {
    id: 'site-selection',
    title: 'Launch Site Selection',
    description: 'Get guidance on launch site requirements and selection',
    icon: <MapPin className="h-4 w-4" />,
    prompt: 'Help me understand launch site requirements and select the best location',
    category: 'form'
  },
  {
    id: 'timeline-planning',
    title: 'Timeline Planning',
    description: 'Plan your application and launch timeline',
    icon: <Clock className="h-4 w-4" />,
    prompt: 'Help me plan the timeline for my FAA application and launch schedule',
    category: 'form'
  },

  // Space & Aerospace Expertise
  {
    id: 'orbital-mechanics',
    title: 'Orbital Mechanics',
    description: 'Learn about orbital dynamics and trajectory planning',
    icon: <Globe className="h-4 w-4" />,
    prompt: 'Explain orbital mechanics and how to plan trajectories for my mission',
    category: 'space'
  },
  {
    id: 'propulsion-systems',
    title: 'Propulsion Systems',
    description: 'Understand different propulsion technologies',
    icon: <Rocket className="h-4 w-4" />,
    prompt: 'Explain different propulsion systems and their applications for space missions',
    category: 'space'
  },
  {
    id: 'satellite-technology',
    title: 'Satellite Technology',
    description: 'Learn about satellite design and operations',
    icon: <Satellite className="h-4 w-4" />,
    prompt: 'Explain satellite technology, subsystems, and mission operations',
    category: 'space'
  },
  {
    id: 'interplanetary-missions',
    title: 'Interplanetary Missions',
    description: 'Understand deep space mission challenges',
    icon: <Compass className="h-4 w-4" />,
    prompt: 'Explain interplanetary mission design, challenges, and requirements',
    category: 'space'
  },
  {
    id: 'space-law',
    title: 'Space Law & Regulations',
    description: 'Learn about space law and international agreements',
    icon: <BookOpen className="h-4 w-4" />,
    prompt: 'Explain space law, international treaties, and regulatory frameworks',
    category: 'space'
  },

  // Aerospace Technology
  {
    id: 'launch-vehicle-design',
    title: 'Launch Vehicle Design',
    description: 'Understand rocket design principles',
    icon: <Layers className="h-4 w-4" />,
    prompt: 'Explain launch vehicle design principles and engineering considerations',
    category: 'aerospace'
  },
  {
    id: 'avionics-systems',
    title: 'Avionics & Guidance',
    description: 'Learn about flight control and navigation',
    icon: <Cpu className="h-4 w-4" />,
    prompt: 'Explain avionics systems, guidance, navigation, and control for space missions',
    category: 'aerospace'
  },
  {
    id: 'thermal-protection',
    title: 'Thermal Protection',
    description: 'Understand heat management in space',
    icon: <Thermometer className="h-4 w-4" />,
    prompt: 'Explain thermal protection systems and heat management for space vehicles',
    category: 'aerospace'
  },
  {
    id: 'power-systems',
    title: 'Power Systems',
    description: 'Learn about spacecraft power generation',
    icon: <Battery className="h-4 w-4" />,
    prompt: 'Explain spacecraft power systems, solar panels, and energy management',
    category: 'aerospace'
  },
  {
    id: 'communication-systems',
    title: 'Communication Systems',
    description: 'Understand space communication technology',
    icon: <Wifi className="h-4 w-4" />,
    prompt: 'Explain space communication systems, antennas, and data transmission',
    category: 'aerospace'
  },

  // Document Analysis
  {
    id: 'analyze-documents',
    title: 'Analyze Documents',
    description: 'Extract information from uploaded documents',
    icon: <Search className="h-4 w-4" />,
    prompt: 'Please analyze the uploaded documents and extract relevant information for my application',
    category: 'document'
  },
  {
    id: 'compliance-check',
    title: 'Compliance Check',
    description: 'Check documents for regulatory compliance',
    icon: <CheckCircle className="h-4 w-4" />,
    prompt: 'Review my documents and check for compliance with FAA Part 450 requirements',
    category: 'document'
  },
  {
    id: 'extract-specifications',
    title: 'Extract Specifications',
    description: 'Pull technical specs from documents',
    icon: <Database className="h-4 w-4" />,
    prompt: 'Extract technical specifications and data from my uploaded documents',
    category: 'document'
  },
  {
    id: 'identify-gaps',
    title: 'Identify Information Gaps',
    description: 'Find missing information in documents',
    icon: <AlertTriangle className="h-4 w-4" />,
    prompt: 'Analyze my documents and identify missing information needed for the application',
    category: 'document'
  },

  // Application Enhancement
  {
    id: 'strengthen-application',
    title: 'Strengthen Application',
    description: 'Improve your application quality',
    icon: <Edit3 className="h-4 w-4" />,
    prompt: 'Help me strengthen my application with better language and additional details',
    category: 'enhancement'
  },
  {
    id: 'sophisticated-language',
    title: 'Sophisticated Language',
    description: 'Rephrase content professionally',
    icon: <FileText className="h-4 w-4" />,
    prompt: 'Help me rephrase my application content to be more professional and FAA-ready',
    category: 'enhancement'
  },
  {
    id: 'add-technical-details',
    title: 'Add Technical Details',
    description: 'Enhance technical specifications',
    icon: <Settings className="h-4 w-4" />,
    prompt: 'Help me add more technical details and specifications to strengthen my application',
    category: 'enhancement'
  },
  {
    id: 'risk-mitigation',
    title: 'Risk Mitigation',
    description: 'Improve safety and risk analysis',
    icon: <Shield className="h-4 w-4" />,
    prompt: 'Help me enhance my risk assessment and safety considerations',
    category: 'enhancement'
  },

  // Help and guidance
  {
    id: 'faa-process',
    title: 'FAA Process Guide',
    description: 'Understand the FAA Part 450 application process',
    icon: <HelpCircle className="h-4 w-4" />,
    prompt: 'Explain the FAA Part 450 application process and requirements',
    category: 'help'
  },
  {
    id: 'best-practices',
    title: 'Best Practices',
    description: 'Learn industry best practices for applications',
    icon: <Lightbulb className="h-4 w-4" />,
    prompt: 'What are the best practices for preparing a successful FAA Part 450 application?',
    category: 'help'
  },
  {
    id: 'regulatory-updates',
    title: 'Regulatory Updates',
    description: 'Stay current with FAA regulations',
    icon: <BarChart3 className="h-4 w-4" />,
    prompt: 'What are the latest updates to FAA Part 450 regulations and requirements?',
    category: 'help'
  },
  {
    id: 'international-coordination',
    title: 'International Coordination',
    description: 'Understand international launch coordination',
    icon: <Globe className="h-4 w-4" />,
    prompt: 'Explain international launch coordination and cross-border considerations',
    category: 'help'
  },

  // Analysis and review
  {
    id: 'application-review',
    title: 'Application Review',
    description: 'Get a comprehensive review of your application',
    icon: <FileText className="h-4 w-4" />,
    prompt: 'Please review my application and provide feedback on completeness and quality',
    category: 'analysis'
  },
  {
    id: 'risk-assessment',
    title: 'Risk Assessment',
    description: 'Conduct a thorough risk assessment',
    icon: <Shield className="h-4 w-4" />,
    prompt: 'Help me conduct a comprehensive risk assessment for my launch mission',
    category: 'analysis'
  },
  {
    id: 'technical-review',
    title: 'Technical Review',
    description: 'Review technical specifications and requirements',
    icon: <Settings className="h-4 w-4" />,
    prompt: 'Review my technical specifications and ensure they meet FAA requirements',
    category: 'analysis'
  },
  {
    id: 'performance-analysis',
    title: 'Performance Analysis',
    description: 'Analyze mission performance metrics',
    icon: <Gauge className="h-4 w-4" />,
    prompt: 'Help me analyze performance metrics and mission success criteria',
    category: 'analysis'
  }
];

interface AIQuickActionsProps {
  onActionSelect: (prompt: string) => void;
  showCategories?: boolean;
  maxActions?: number;
}

export function AIQuickActions({ 
  onActionSelect, 
  showCategories = true, 
  maxActions = 12 
}: AIQuickActionsProps) {
  const [selectedCategory, setSelectedCategory] = React.useState<'all' | 'form' | 'help' | 'analysis' | 'general' | 'space' | 'aerospace' | 'document' | 'enhancement'>('all');

  const filteredActions = selectedCategory === 'all' 
    ? quickActions.slice(0, maxActions)
    : quickActions.filter(action => action.category === selectedCategory).slice(0, maxActions);

  const categories = [
    { id: 'all', label: 'All Actions', count: quickActions.length },
    { id: 'form', label: 'Form Help', count: quickActions.filter(a => a.category === 'form').length },
    { id: 'space', label: 'Space Expertise', count: quickActions.filter(a => a.category === 'space').length },
    { id: 'aerospace', label: 'Aerospace Tech', count: quickActions.filter(a => a.category === 'aerospace').length },
    { id: 'document', label: 'Document Analysis', count: quickActions.filter(a => a.category === 'document').length },
    { id: 'enhancement', label: 'Enhancement', count: quickActions.filter(a => a.category === 'enhancement').length },
    { id: 'help', label: 'Guidance', count: quickActions.filter(a => a.category === 'help').length },
    { id: 'analysis', label: 'Analysis', count: quickActions.filter(a => a.category === 'analysis').length },
  ];

  const handleActionClick = (prompt: string) => {
    console.log('Quick action clicked:', prompt);
    onActionSelect(prompt);
  };

  return (
    <div className={showCategories ? "space-y-4" : ""}>
      {/* Category Filter */}
      {showCategories && (
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id as any)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                selectedCategory === category.id
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                  : 'bg-zinc-700 text-zinc-400 hover:bg-zinc-600 hover:text-zinc-300'
              }`}
            >
              {category.label} ({category.count})
            </button>
          ))}
        </div>
      )}

      {/* Quick Actions - Grid for categories, List for dropdown */}
      {showCategories ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredActions.map((action) => (
            <button
              key={action.id}
              onClick={() => handleActionClick(action.prompt)}
              className="group p-3 bg-zinc-700 border border-zinc-600 rounded-lg hover:border-zinc-500 hover:bg-zinc-600 transition-all duration-200 text-left"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 p-2 bg-zinc-600 rounded-lg group-hover:bg-zinc-500 transition-all">
                  <div className="text-zinc-300 group-hover:text-zinc-200">
                    {action.icon}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-zinc-200 group-hover:text-zinc-100 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-sm text-zinc-400 group-hover:text-zinc-300 transition-colors mt-1">
                    {action.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-1">
          {filteredActions.map((action) => (
            <button
              key={action.id}
              onClick={() => handleActionClick(action.prompt)}
              className="flex items-center gap-3 px-3 py-2 text-white hover:bg-zinc-700 rounded cursor-pointer w-full text-left"
            >
              <div className="text-zinc-300">
                {action.icon}
              </div>
              <span className="text-sm">{action.title}</span>
            </button>
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredActions.length === 0 && (
        <div className="text-center py-8">
          <div className="text-zinc-500 text-sm">
            No actions available for this category
          </div>
        </div>
      )}
    </div>
  );
} 