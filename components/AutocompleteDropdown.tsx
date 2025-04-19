"use client";

import { CommandLineIcon, XMarkIcon } from "@heroicons/react/24/outline";
import React, { useEffect, useMemo, useState, type ReactNode } from "react";

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
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedItems, setSelectedItems] = useState<OptionItem[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(0);

  // Number of items to display per page
  const ITEMS_PER_PAGE = 40;

  /**
   * Memoized calculation of options filtered by the current query
   * and excluding already selected items.
   */
  const filteredOptions = useMemo(() => {
    return options.filter(
      (opt) =>
        !selectedItems.some((item) => item.id === opt.id) &&
        opt.value.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, options, selectedItems]);

  // Calculate total pages based on the filtered options
  const totalPages = Math.ceil(filteredOptions.length / ITEMS_PER_PAGE);

  /**
   * Memoized calculation of items visible on the current page from the filtered options.
   */
  const visibleItems = useMemo(() => {
    const startIndex = currentPage * ITEMS_PER_PAGE;
    return filteredOptions.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredOptions, currentPage]); // Depends on filteredOptions and currentPage

  /**
   * Effect hook to reset pagination to the first page whenever the filter query changes.
   */
  useEffect(() => {
    setCurrentPage(0);
  }, [query, selectedItems]); // Reset page when query or selected items change filter

  /**
   * Effect hook to reset the active index when the current page changes.
   */
  useEffect(() => {
    setActiveIndex(-1);
  }, [currentPage]);

  /**
   * Navigates to the next page of filtered options.
   */
  const nextPage = (): void => {
    if (currentPage < totalPages - 1) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  /**
   * Navigates to the previous page of filtered options.
   */
  const prevPage = (): void => {
    if (currentPage > 0) {
      setCurrentPage((prevPage) => prevPage + 1); // Typo fixed: should be prevPage - 1
    }
  };

  /**
   * Gets the suggestion text for autocompletion based on the first visible item.
   * @returns The suggestion string or an empty string.
   */
  const getSuggestion = (): string => {
    if (query && visibleItems.length > 0 && currentPage === 0) {
      // Only suggest from first page
      const suggestion = visibleItems[0].value;
      if (suggestion.toLowerCase().startsWith(query.toLowerCase())) {
        return suggestion.slice(query.length);
      }
    }
    return "";
  };

  /**
   * Handles selecting an item from the dropdown list.
   * Adds the item to selectedItems, clears query, closes dropdown, and calls onSelect.
   * @param item - The OptionItem selected.
   */
  const handleSelect = (item: OptionItem): void => {
    setQuery("");
    setIsOpen(false);
    setActiveIndex(-1); // Reset active index after selection
    const newSelectedItems = [...selectedItems, item];
    setSelectedItems(newSelectedItems);
    if (onSelect) onSelect(newSelectedItems);
  };

  /**
   * Handles removing a previously selected item.
   * Removes item from selectedItems and calls onSelect.
   * @param itemId - The id of the OptionItem to remove.
   */
  const handleRemoveItem = (itemId: string): void => {
    const newSelectedItems = selectedItems.filter((item) => item.id !== itemId);
    setSelectedItems(newSelectedItems);
    if (onSelect) onSelect(newSelectedItems);
  };

  /**
   * Default renderer for an option item in the dropdown list.
   * @param item - The OptionItem to render.
   * @returns A ReactNode representing the item.
   */
  const defaultRenderItem = (item: OptionItem): ReactNode => {
    return <span>{item.value}</span>;
  };

  /**
   * Default renderer for a selected item (pill/tag).
   * Includes the item value and a remove button.
   * @param item - The selected OptionItem.
   * @param onRemove - Callback function to trigger item removal.
   * @returns A ReactNode representing the selected item pill.
   */
  const defaultRenderSelectedItem = (
    item: OptionItem,
    onRemove: () => void
  ): ReactNode => {
    return (
      <div className="flex items-center bg-gray-700 text-gray-200 px-2 py-0.5 rounded-sm text-sm transition-all duration-200">
        <span>{item.value}</span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation(); // Prevent triggering container onClick
            onRemove();
          }}
          className="ml-2 text-gray-400 hover:text-gray-100 focus:outline-none transition-colors duration-200"
          aria-label={`Remove ${item.value}`}
        >
          <XMarkIcon className="w-3 h-3" />
        </button>
      </div>
    );
  };

  /**
   * Handles keyboard navigation within the input and dropdown.
   * Supports ArrowUp, ArrowDown, Enter, Escape, PageUp, PageDown.
   * @param e - The React KeyboardEvent object.
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    // Ensure dropdown is open for most navigation keys if there are options
    if (
      !isOpen &&
      filteredOptions.length > 0 &&
      ["ArrowDown", "ArrowUp", "Enter", "PageDown", "PageUp"].includes(e.key)
    ) {
      setIsOpen(true);
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((prev) => Math.min(prev + 1, visibleItems.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((prev) => Math.max(prev - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (isOpen && activeIndex >= 0 && activeIndex < visibleItems.length) {
          // Select highlighted item if dropdown is open and item is active
          handleSelect(visibleItems[activeIndex]);
        } else if (query && visibleItems.length > 0 && currentPage === 0) {
          // Select first visible item if query exists and dropdown might be implicitly showing suggestion
          handleSelect(visibleItems[0]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setActiveIndex(-1);
        break;
      case "PageDown":
        if (isOpen) {
          e.preventDefault();
          nextPage();
        }
        break;
      case "PageUp":
        if (isOpen) {
          e.preventDefault();
          prevPage();
        }
        break;
      default:
        // Reset active index if user types something else
        if (e.key.length === 1) {
          // Heuristic for actual typing
          setActiveIndex(-1);
        }
        break;
    }
  };

  // Use provided renderers or defaults
  const itemRenderer = renderItem || defaultRenderItem;
  const selectedItemRenderer = renderSelectedItem || defaultRenderSelectedItem;

  return (
    <div
      className={`w-full mx-auto relative p-1 rounded-md ${className}`} // Removed outer transition as inner elements handle it
    >
      <div className="px-4 py-0 rounded-md">
        {/* Label */}
        <label className="block text-sm font-medium text-gray-200 mb-1 transition-colors duration-300">
          {icon}
          {title}
        </label>

        <div className="relative">
          {/* Input container with selected items */}
          <div
            className="w-full bg-black text-gray-200 border border-gray-700 focus-within:ring-2 focus-within:ring-gray-500 focus-within:border-gray-500 transition-all duration-300 rounded-md px-2 py-1 flex flex-wrap items-center gap-2 cursor-text"
            onClick={() => document.getElementById(id)?.focus()} // Focus input on container click
          >
            {/* Render selected items */}
            {selectedItems.map((item) => (
              <div key={item.id}>
                {selectedItemRenderer(item, () => handleRemoveItem(item.id))}
              </div>
            ))}
            {/* Input field wrapper */}
            <div className="relative flex-grow min-w-[120px]">
              <input
                id={id}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActiveIndex(-1); // Reset index on query change
                  if (!isOpen) setIsOpen(true); // Open dropdown on type if closed
                }}
                onFocus={() => setIsOpen(true)}
                // Delay blur to allow clicks on dropdown items/pagination
                onBlur={() => setTimeout(() => setIsOpen(false), 200)}
                onKeyDown={handleKeyDown}
                className="w-full bg-transparent text-sm border-none focus:outline-none focus:ring-0 text-gray-200 placeholder-gray-500"
                placeholder={
                  selectedItems.length ? "Add another..." : placeholder
                }
                autoComplete="off" // Disable browser autocomplete
              />

              {/* Auto-suggestion overlay - only show if dropdown isn't fully obstructing */}
              {isOpen && query && getSuggestion() && (
                <div className="absolute inset-0 top-0 left-0 pointer-events-none text-sm">
                  <span className="invisible">{query}</span>
                  {/* Maintain layout */}
                  <span className="text-gray-500">{getSuggestion()}</span>
                </div>
              )}
            </div>{" "}
            {/* End input field wrapper */}
          </div>{" "}
          {/* End Input container */}
          {/* Dropdown options container with transitions */}
          <div
            className={`absolute left-0 right-0 z-10 mt-1 bg-black text-gray-200 border border-gray-700 rounded-md shadow-lg transition-all duration-300 transform origin-top ${
              isOpen && filteredOptions.length > 0 // Only show if open AND has options
                ? "opacity-100 scale-100 no-scrollbar" // Open state styles
                : "opacity-0 scale-95 pointer-events-none no-scrollbar" // Closed state styles
            }`}
            role="listbox"
            style={{
              maxHeight: isOpen && filteredOptions.length > 0 ? "320px" : "0", // Adjust max-height (consider pagination)
              overflow: "hidden",
              transitionProperty: "transform, opacity, max-height",
              transitionDuration: "300ms",
              transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            {/* Inner container for scrolling content */}
            <div
              className="overflow-y-auto transition-all duration-300 divide-y divide-[#222222]"
              style={{ maxHeight: "260px" }} // Max height for scrollable items area
            >
              {/* Render visible items */}
              {visibleItems.map((item, idx) => (
                <div
                  key={item.id}
                  role="option"
                  aria-selected={idx === activeIndex}
                  className={`px-4 py-2 cursor-pointer text-sm transition-all duration-200 no-scrollbar ${
                    idx === activeIndex ? "bg-gray-900" : "hover:bg-gray-900" // Highlight active/hovered item
                  }`}
                  onMouseEnter={() => setActiveIndex(idx)} // Update active index on hover
                  // Prevent blur closing dropdown when clicking item
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelect(item)} // Select item on click
                >
                  {itemRenderer(item)} {/* Use the item renderer */}
                </div>
              ))}

              {/* No results message */}
              {query && visibleItems.length === 0 && (
                <div className="px-4 py-2 text-sm text-gray-500 transition-colors duration-300 no-scrollbar">
                  No results found for "{query}"
                </div>
              )}
              {!query &&
                visibleItems.length === 0 &&
                selectedItems.length < options.length && (
                  <div className="px-4 py-2 text-sm text-gray-500 transition-colors duration-300">
                    Start typing to search...
                  </div>
                )}
              {!query &&
                visibleItems.length === 0 &&
                selectedItems.length >= options.length && (
                  <div className="px-4 py-2 text-sm text-gray-500 transition-colors duration-300">
                    All options selected
                  </div>
                )}
            </div>{" "}
            {/* End scrollable content */}
            {/* Pagination controls - only show if needed */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-2 border-t border-[#222222] bg-black transition-all duration-300">
                {" "}
                {/* Added bg-black */}
                {/* Previous Page Button */}
                <button
                  type="button" // Prevent form submission if nested
                  onClick={prevPage}
                  onMouseDown={(e) => e.preventDefault()} // Prevent blur closing dropdown
                  disabled={currentPage === 0}
                  className={`px-3 py-1 text-xs rounded transition-all duration-300 ${
                    currentPage === 0
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-gray-800"
                  }`}
                >
                  Previous
                </button>
                {/* Page Indicator */}
                <span className="text-xs text-gray-400 transition-opacity duration-300">
                  Page {currentPage + 1} / {totalPages}
                </span>
                {/* Next Page Button */}
                <button
                  type="button" // Prevent form submission
                  onClick={nextPage}
                  onMouseDown={(e) => e.preventDefault()} // Prevent blur closing dropdown
                  disabled={currentPage >= totalPages - 1}
                  className={`px-3 py-1 text-xs rounded transition-all duration-300 ${
                    currentPage >= totalPages - 1
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-gray-800"
                  }`}
                >
                  Next
                </button>
              </div>
            )}{" "}
            {/* End pagination controls */}
          </div>{" "}
          {/* End dropdown options container */}
        </div>
      </div>
    </div>
  );
}
