"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, ChevronRight, FileText, Rocket, Shield, MapPin, Clock, Settings, Database, AlertTriangle, Brain } from "lucide-react";
import { part450FormTemplate } from "@/lib/mock-data";

interface ContextMenuItem {
  id: string;
  type: "section" | "field" | "quick_action";
  title: string;
  sectionTitle?: string;
  icon: React.ReactNode;
  path: string;
  description?: string;
}

interface AIContextMenuProps {
  isVisible: boolean;
  position: { x: number; y: number };
  onSelect: (item: ContextMenuItem) => void;
  onClose: () => void;
  searchTerm: string;
}

export function AIContextMenu({ 
  isVisible, 
  position, 
  onSelect, 
  onClose, 
  searchTerm 
}: AIContextMenuProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [viewMode, setViewMode] = useState<"sections" | "fields" | "quick_actions">("sections");
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Generate context menu items with enhanced functionality
  const generateItems = (): ContextMenuItem[] => {
    if (viewMode === "sections") {
      return part450FormTemplate.sections.map((section, index) => ({
        id: `section-${index}`,
        type: "section",
        title: section.title,
        icon: getSectionIcon(section.title),
        path: section.title,
        description: `${section.fields.length} fields available`
      }));
    } else if (viewMode === "fields") {
      // Show fields for selected section
      const sectionIndex = parseInt(selectedSection?.split('-')[1] || '0');
      const section = part450FormTemplate.sections[sectionIndex];
      return section.fields.map((field, index) => ({
        id: `field-${sectionIndex}-${index}`,
        type: "field",
        title: field.label,
        sectionTitle: section.title,
        icon: getFieldIcon(field.label),
        path: field.label,
        description: getFieldDescription(field.label)
      }));
    } else {
      // Quick actions for common tasks
      return [
        {
          id: 'auto-fill-all',
          type: "quick_action",
          title: "Auto-fill All Fields",
          icon: <Brain className="h-4 w-4" />,
          path: "Auto-fill All Fields",
          description: "Automatically fill all form fields from mission description"
        },
        {
          id: 'mission-objective',
          type: "quick_action",
          title: "Mission Objective",
          icon: <Rocket className="h-4 w-4" />,
          path: "Mission Objective",
          description: "Help write mission objective and purpose"
        },
        {
          id: 'safety-analysis',
          type: "quick_action",
          title: "Safety Analysis",
          icon: <Shield className="h-4 w-4" />,
          path: "Safety Analysis",
          description: "Analyze safety considerations and risks"
        },
        {
          id: 'technical-specs',
          type: "quick_action",
          title: "Technical Specifications",
          icon: <Settings className="h-4 w-4" />,
          path: "Technical Specifications",
          description: "Help with technical specifications and data"
        },
        {
          id: 'timeline-planning',
          type: "quick_action",
          title: "Timeline Planning",
          icon: <Clock className="h-4 w-4" />,
          path: "Timeline Planning",
          description: "Plan application and launch timeline"
        },
        {
          id: 'site-selection',
          type: "quick_action",
          title: "Launch Site Selection",
          icon: <MapPin className="h-4 w-4" />,
          path: "Launch Site Selection",
          description: "Help with launch site requirements and selection"
        }
      ];
    }
  };

  const getSectionIcon = (sectionTitle: string): React.ReactNode => {
    const lowerTitle = sectionTitle.toLowerCase();
    if (lowerTitle.includes('concept') || lowerTitle.includes('operations')) return <Rocket className="h-4 w-4" />;
    if (lowerTitle.includes('vehicle')) return <Settings className="h-4 w-4" />;
    if (lowerTitle.includes('location') || lowerTitle.includes('site')) return <MapPin className="h-4 w-4" />;
    if (lowerTitle.includes('launch')) return <Rocket className="h-4 w-4" />;
    if (lowerTitle.includes('risk') || lowerTitle.includes('safety')) return <Shield className="h-4 w-4" />;
    if (lowerTitle.includes('timeline')) return <Clock className="h-4 w-4" />;
    if (lowerTitle.includes('question')) return <AlertTriangle className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const getFieldIcon = (fieldLabel: string): React.ReactNode => {
    const lowerLabel = fieldLabel.toLowerCase();
    if (lowerLabel.includes('mission') || lowerLabel.includes('objective')) return <Rocket className="h-4 w-4" />;
    if (lowerLabel.includes('vehicle') || lowerLabel.includes('technical')) return <Settings className="h-4 w-4" />;
    if (lowerLabel.includes('safety') || lowerLabel.includes('risk')) return <Shield className="h-4 w-4" />;
    if (lowerLabel.includes('site') || lowerLabel.includes('location')) return <MapPin className="h-4 w-4" />;
    if (lowerLabel.includes('timeline') || lowerLabel.includes('window')) return <Clock className="h-4 w-4" />;
    if (lowerLabel.includes('propulsion') || lowerLabel.includes('engine')) return <Rocket className="h-4 w-4" />;
    if (lowerLabel.includes('trajectory') || lowerLabel.includes('path')) return <Database className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const getFieldDescription = (fieldLabel: string): string => {
    const lowerLabel = fieldLabel.toLowerCase();
    if (lowerLabel.includes('mission objective')) return "Primary purpose and goals of the mission";
    if (lowerLabel.includes('vehicle description')) return "Launch vehicle specifications and characteristics";
    if (lowerLabel.includes('safety considerations')) return "Safety measures and risk mitigation";
    if (lowerLabel.includes('technical summary')) return "Technical specifications and data";
    if (lowerLabel.includes('launch site')) return "Exact launch location and facility";
    if (lowerLabel.includes('timeline')) return "Application and launch schedule";
    if (lowerLabel.includes('propulsion')) return "Propulsion systems and engines";
    if (lowerLabel.includes('trajectory')) return "Flight path and orbital parameters";
    return "Form field for Part 450 application";
  };

  const items = generateItems();
  const filteredItems = items.filter(item => {
    const searchLower = searchTerm.toLowerCase().trim();
    const titleLower = item.title.toLowerCase();
    const pathLower = item.path.toLowerCase();
    const descriptionLower = item.description?.toLowerCase() || '';
    
    // If search is empty, show all items
    if (!searchLower) return true;
    
    // Check if search term matches title, path, or description
    if (titleLower.includes(searchLower) || 
        pathLower.includes(searchLower) || 
        descriptionLower.includes(searchLower)) {
      return true;
    }
    
    // Check individual words for better matching
    const searchWords = searchLower.split(' ').filter(word => word.length > 0);
    const titleWords = titleLower.split(' ').filter(word => word.length > 0);
    const pathWords = pathLower.split(' ').filter(word => word.length > 0);
    const descriptionWords = descriptionLower.split(' ').filter(word => word.length > 0);
    
    // Check if all search words are found in title, path, or description
    return searchWords.every(searchWord => 
      titleWords.some(titleWord => titleWord.includes(searchWord)) ||
      pathWords.some(pathWord => pathWord.includes(searchWord)) ||
      descriptionWords.some(descWord => descWord.includes(searchWord))
    );
  });

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isVisible) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < filteredItems.length - 1 ? prev + 1 : 0
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : filteredItems.length - 1
          );
          break;
        case "Enter":
          e.preventDefault();
          if (filteredItems[selectedIndex]) {
            handleItemSelect(filteredItems[selectedIndex]);
          }
          break;
        case "Escape":
          e.preventDefault();
          onClose();
          break;
        case "ArrowRight":
          e.preventDefault();
          if (viewMode === "sections" && filteredItems[selectedIndex]) {
            setSelectedSection(filteredItems[selectedIndex].id);
            setViewMode("fields");
            setSelectedIndex(0);
          }
          break;
        case "ArrowLeft":
          e.preventDefault();
          if (viewMode === "fields") {
            setViewMode("sections");
            setSelectedSection(null);
            setSelectedIndex(0);
          } else if (viewMode === "quick_actions") {
            setViewMode("sections");
            setSelectedIndex(0);
          }
          break;
        case "Tab":
          e.preventDefault();
          if (viewMode === "sections") {
            setViewMode("quick_actions");
            setSelectedIndex(0);
          } else if (viewMode === "quick_actions") {
            setViewMode("sections");
            setSelectedIndex(0);
          }
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isVisible, filteredItems, selectedIndex, viewMode, onClose]);

  // Reset selection when search term changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchTerm]);

  // Reset when menu becomes visible
  useEffect(() => {
    if (isVisible) {
      setSelectedIndex(0);
      setViewMode("sections");
      setSelectedSection(null);
    }
  }, [isVisible]);

  const handleItemSelect = (item: ContextMenuItem) => {
    if (viewMode === "sections") {
      setSelectedSection(item.id);
      setViewMode("fields");
      setSelectedIndex(0);
    } else {
      onSelect(item);
    }
  };

  const handleItemClick = (item: ContextMenuItem) => {
    handleItemSelect(item);
  };

  if (!isVisible) return null;

  return (
    <div
      ref={menuRef}
      className="absolute z-50 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl min-w-64 max-w-80 context-menu"
      style={{
        left: position.x,
        top: position.y,
        maxHeight: '300px',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-2 border-b border-zinc-700">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-zinc-400" />
          <span className="text-sm font-medium text-zinc-200">
            {viewMode === "sections" ? "Select Section" : 
             viewMode === "fields" ? "Select Field" : "Quick Actions"}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {viewMode === "fields" && (
            <button
              onClick={() => {
                setViewMode("sections");
                setSelectedSection(null);
                setSelectedIndex(0);
              }}
              className="text-zinc-400 hover:text-zinc-300 text-xs"
            >
              ← Back
            </button>
          )}
          {(viewMode === "sections" || viewMode === "quick_actions") && (
            <button
              onClick={() => {
                setViewMode(viewMode === "sections" ? "quick_actions" : "sections");
                setSelectedIndex(0);
              }}
              className="text-zinc-400 hover:text-zinc-300 text-xs"
            >
              {viewMode === "sections" ? "Quick Actions" : "Sections"}
            </button>
          )}
        </div>
      </div>

      {/* Search input */}
      <div className="p-1 border-b border-zinc-700">
        <input
          type="text"
          placeholder="Search sections, fields, and actions..."
          className="w-full px-2 py-1 text-sm bg-zinc-700 border border-zinc-600 rounded text-zinc-200 placeholder-zinc-400 focus:outline-none focus:border-zinc-500"
          value={searchTerm}
          readOnly
        />
      </div>

      {/* Items list */}
      <div className="max-h-48 overflow-y-auto" style={{
        scrollbarWidth: 'thin',
        scrollbarColor: '#52525b #27272a'
      }}>
        {filteredItems.length === 0 ? (
          <div className="p-3 text-center text-zinc-400 text-sm">
            No items found
          </div>
        ) : (
          filteredItems.map((item, index) => (
            <div
              key={item.id}
              className={`flex items-start gap-2 px-2 py-1 cursor-pointer transition-colors ${
                index === selectedIndex
                  ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-zinc-100 border border-blue-500/30"
                  : "text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100"
              }`}
              onClick={() => handleItemClick(item)}
            >
              <div className="flex-shrink-0 text-zinc-400 mt-0.5">
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">
                  {item.title}
                </div>
                {item.sectionTitle && (
                  <div className="text-xs text-zinc-500 truncate">
                    {item.sectionTitle}
                  </div>
                )}
                {item.description && (
                  <div className="text-xs text-zinc-500 truncate mt-1">
                    {item.description}
                  </div>
                )}
              </div>
              {viewMode === "sections" && (
                <ChevronRight className="h-4 w-4 text-zinc-400 flex-shrink-0 mt-0.5" />
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer with keyboard shortcuts */}
      <div className="p-2 border-t border-zinc-700 bg-zinc-900">
        <div className="flex items-center justify-between text-xs text-zinc-500">
          <span>Use ↑↓ to navigate</span>
          <span>Enter to select</span>
          <span>Esc to close</span>
        </div>
      </div>
    </div>
  );
} 