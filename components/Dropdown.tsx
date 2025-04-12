"use client";

import { useState, type ReactNode } from "react";
import { CommandLineIcon, ChevronDownIcon } from "@heroicons/react/24/outline";

// Define the option item structure
interface OptionItem {
  id: string;
  value: string;
  [key: string]: any; // Allow for additional properties
}

interface DropdownSelectProps {
  id: string;
  options: OptionItem[];
  onSelect?: (value: OptionItem | null) => void;
  className?: string;
  title?: string;
  icon?: ReactNode;
  placeholder?: string;
  renderItem?: (item: OptionItem) => ReactNode;
}

export default function DropdownSelect({
  id,
  options,
  onSelect,
  className = "",
  title = "Select",
  icon = <CommandLineIcon className="w-5 h-5 inline-block mr-2" />,
  placeholder = "Select an option...",
  renderItem,
}: DropdownSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<OptionItem | null>(null);
  const [activeIndex, setActiveIndex] = useState(-1);

  // Handle selecting an item
  const handleSelect = (item: OptionItem) => {
    setIsOpen(false);
    setSelectedItem(item);
    if (onSelect) onSelect(item);
  };

  // Default item renderer
  const defaultRenderItem = (item: OptionItem) => {
    return <span>{item.value}</span>;
  };

  // Keyboard navigation handler
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen && (e.key === "Enter" || e.key === " " || e.key === "ArrowDown")) {
      e.preventDefault();
      setIsOpen(true);
      return;
    }
    
    if (!isOpen) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => 
        Math.min(prev + 1, options.length - 1)
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && options[activeIndex]) {
        handleSelect(options[activeIndex]);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  // Use provided renderer or default
  const itemRenderer = renderItem || defaultRenderItem;

  return (
    <div className={`w-full mx-auto relative p-1 rounded-md transition-all duration-500 ${className}`}>
      <div className="px-4 py-0 rounded-md">
        <label className="block text-sm font-medium text-gray-200 mb-1">
          {icon}
          {title}
        </label>
        
        <div className="relative">
          {/* Dropdown trigger button */}
          <button
            id={id}
            type="button"
            onKeyDown={handleKeyDown}
            onClick={() => setIsOpen(!isOpen)}
            className="w-full bg-black text-gray-200 border hover:opacity-75 focus:ring-2 focus:ring-gray-300 focus:outline-none transition-all duration-300 rounded-md px-3 py-2 flex items-center justify-between"
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            tabIndex={0}
          >
            <span className="text-sm truncate">
              {selectedItem ? selectedItem.value : placeholder}
            </span>
            <ChevronDownIcon className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {/* Dropdown options */}
          {isOpen && (
            <div 
              className="absolute left-0 right-0 z-10 mt-1 bg-black text-gray-200 border rounded-md shadow-lg transition-all duration-300"
              role="listbox"
            >
              <div className="p-2 divide-y divide-[#222222] max-h-60 overflow-y-auto">
                {options.length > 0 ? (
                  options.map((item, idx) => (
                    <div
                      key={item.id}
                      role="option"
                      aria-selected={selectedItem?.id === item.id}
                      className={`px-4 py-2 cursor-pointer transition-all duration-200 ${
                        idx === activeIndex ? "opacity-50" : ""
                      } ${selectedItem?.id === item.id ? "opacity-50" : ""}`}
                      onMouseEnter={() => setActiveIndex(idx)}
                      onMouseLeave={() => setActiveIndex(-1)}
                      onClick={() => handleSelect(item)}
                    >
                      {itemRenderer(item)}
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-2 text-gray-500">
                    No options available
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}