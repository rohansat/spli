"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, ChevronRight, FileText } from "lucide-react";
import { part450FormTemplate } from "@/lib/mock-data";

interface ContextMenuItem {
  id: string;
  type: "section" | "field";
  title: string;
  sectionTitle?: string;
  icon: React.ReactNode;
  path: string;
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
  const [viewMode, setViewMode] = useState<"sections" | "fields">("sections");
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Generate context menu items
  const generateItems = (): ContextMenuItem[] => {
    if (viewMode === "sections") {
      return part450FormTemplate.sections.map((section, index) => ({
        id: `section-${index}`,
        type: "section",
        title: section.title,
        icon: <FileText className="h-4 w-4" />,
        path: `Section ${index + 1}: ${section.title}`
      }));
    } else {
      // Show fields for selected section
      const sectionIndex = parseInt(selectedSection?.split('-')[1] || '0');
      const section = part450FormTemplate.sections[sectionIndex];
      return section.fields.map((field, index) => ({
        id: `field-${sectionIndex}-${index}`,
        type: "field",
        title: field.label,
        sectionTitle: section.title,
        icon: <FileText className="h-4 w-4" />,
        path: `${section.title} > ${field.label}`
      }));
    }
  };

  const items = generateItems();
  const filteredItems = items.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.path.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        maxHeight: '200px',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-2 border-b border-zinc-700">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-zinc-400" />
          <span className="text-sm font-medium text-zinc-200">
            {viewMode === "sections" ? "Select Section" : "Select Field"}
          </span>
        </div>
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
      </div>

      {/* Search input */}
      <div className="p-1 border-b border-zinc-700">
        <input
          type="text"
          placeholder="Search sections and fields..."
          className="w-full px-2 py-1 text-sm bg-zinc-700 border border-zinc-600 rounded text-zinc-200 placeholder-zinc-400 focus:outline-none focus:border-zinc-500"
          value={searchTerm}
          readOnly
        />
      </div>

      {/* Items list */}
      <div className="max-h-32 overflow-y-auto" style={{
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
              className={`flex items-center gap-2 px-2 py-1 cursor-pointer transition-colors ${
                index === selectedIndex
                  ? "bg-zinc-600 text-zinc-100"
                  : "text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100"
              }`}
              onClick={() => handleItemClick(item)}
            >
              <div className="flex-shrink-0 text-zinc-400">
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
              </div>
              {viewMode === "sections" && (
                <ChevronRight className="h-4 w-4 text-zinc-400 flex-shrink-0" />
              )}
            </div>
          ))
        )}
      </div>


    </div>
  );
} 