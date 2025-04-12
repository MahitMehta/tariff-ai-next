"use client";

import { useState, useMemo, type ReactNode } from "react";
import { CommandLineIcon, XMarkIcon } from "@heroicons/react/24/outline";

// Define the option item structure
interface OptionItem {
  id: string;
  value: string;
  [key: string]: any; // Allow for additional properties
}

interface AutocompleteDropdownProps {
  id: string;
  options: OptionItem[];
  onSelect?: (values: OptionItem[]) => void;
  className?: string;
  title?: string;
  icon?: ReactNode;
  placeholder?: string;
  renderItem?: (item: OptionItem) => ReactNode;
  renderSelectedItem?: (item: OptionItem, onRemove: () => void) => ReactNode;
}

export default function AutocompleteDropdownMulti({
  id,
  options,
  onSelect,
  className = "",
  title = "Search",
  icon = <CommandLineIcon className="w-5 h-5 inline-block mr-2" />,
  placeholder = "Start typing...",
  renderItem,
  renderSelectedItem,
}: AutocompleteDropdownProps) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<OptionItem[]>([]);

  // Filter options based on query and already selected items
  const filteredOptions = useMemo(() => {
    return options.filter(
      (opt) =>
        !selectedItems.some((item) => item.id === opt.id) &&
        opt.value.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, options, selectedItems]);

  // Get suggestion for autocomplete
  const getSuggestion = () => {
    if (query && filteredOptions.length > 0) {
      const suggestion = filteredOptions[0].value;
      if (suggestion.toLowerCase().startsWith(query.toLowerCase())) {
        return suggestion.slice(query.length);
      }
    }
    return "";
  };

  // Handle selecting an item
  const handleSelect = (item: OptionItem) => {
    setQuery("");
    setIsOpen(false);
    const newSelectedItems = [...selectedItems, item];
    setSelectedItems(newSelectedItems);
    if (onSelect) onSelect(newSelectedItems);
  };

  // Handle removing an item
  const handleRemoveItem = (itemId: string) => {
    const newSelectedItems = selectedItems.filter((item) => item.id !== itemId);
    setSelectedItems(newSelectedItems);
    if (onSelect) onSelect(newSelectedItems);
  };

  // Default item renderer
  const defaultRenderItem = (item: OptionItem) => {
    return <span>{item.value}</span>;
  };

  // Default selected item renderer
  const defaultRenderSelectedItem = (item: OptionItem, onRemove: () => void) => {
    return (
      <div className="flex items-center text-gray-200 px-2 py-0.5 rounded-sm border border-white text-sm">
        <span>{item.value}</span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-2 text-gray-400 hover:text-gray-200 focus:outline-none"
        >
          <XMarkIcon className="w-3 h-3" />
        </button>
      </div>
    );
  };

  // Keyboard navigation handler
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => 
        Math.min(prev + 1, filteredOptions.length - 1)
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && filteredOptions[activeIndex]) {
        handleSelect(filteredOptions[activeIndex]);
      } else if (filteredOptions.length > 0) {
        handleSelect(filteredOptions[0]);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  // Use provided renderers or defaults
  const itemRenderer = renderItem || defaultRenderItem;
  const selectedItemRenderer = renderSelectedItem || defaultRenderSelectedItem;

  return (
    <div className={`w-full mx-auto relative p-1 rounded-md transition-all duration-500 ${className}`}>
      <div className="px-4 py-0 rounded-md">
        <label className="block text-sm font-medium text-gray-200 mb-1">
          {icon}
          {title}
        </label>
        
        <div className="relative">
          <div 
            className="w-full bg-black text-gray-200 border focus-within:ring-2 focus-within:ring-gray-300 transition-all duration-300 rounded-md px-2 py-1 flex flex-wrap items-center gap-2"
            onClick={() => document.getElementById(id)?.focus()}
          >
            {/* Selected items with custom renderer */}
            {selectedItems.map((item) => (
              <div key={item.id}>
                {selectedItemRenderer(item, () => handleRemoveItem(item.id))}
              </div>
            ))}
            
            {/* Input field */}
            <div className="relative flex-grow min-w-[120px]">
              <input
                id={id}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActiveIndex(-1);
                  setIsOpen(true);
                }}
                onFocus={() => setIsOpen(true)}
                onBlur={() => setTimeout(() => setIsOpen(false), 200)}
                onKeyDown={handleKeyDown}
                className="w-full bg-transparent text-sm border-none focus:outline-none focus:ring-0 text-gray-200 placeholder-gray-500"
                placeholder={selectedItems.length ? "add another..." : placeholder}
              />
              
              {/* Auto-suggestion text */}
              {query && getSuggestion() && (
                <div className="absolute inset-0 pointer-events-none">
                  <span className="invisible">{query}</span>
                  <span className="text-gray-500">{getSuggestion()}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Dropdown positioned absolutely */}
          {isOpen && (
            <div className="absolute left-0 right-0 z-10 mt-1 bg-black text-gray-200 border rounded-md shadow-lg transition-all duration-300">
              <div className="p-2 divide-y divide-gray-700 max-h-60 overflow-y-auto">
                {filteredOptions.length > 0 ? (
                  filteredOptions.map((item, idx) => (
                    <div
                      key={item.id}
                      className={`px-4 py-2 cursor-pointer transition-all duration-200 ${
                        idx === activeIndex ? "opacity-75" : ""
                      }`}
                      onMouseEnter={() => setActiveIndex(idx)}
                      onMouseLeave={() => setActiveIndex(-1)}
                      onClick={() => handleSelect(item)}
                    >
                      {itemRenderer(item)}
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-2 text-gray-500">
                    {query ? "No results found" : "No more options available"}
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