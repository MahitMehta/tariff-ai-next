"use client";

import { ChevronDownIcon, CommandLineIcon } from "@heroicons/react/24/outline";
import React, { useEffect, useMemo, useState, type ReactNode } from "react";

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

const DropdownSelect: React.FC<DropdownSelectProps> = ({
  id,
  options,
  onSelect,
  className = "",
  title = "Select",
  icon = <CommandLineIcon className="w-5 h-5 inline-block mr-2" />,
  placeholder = "Select an option...",
  renderItem,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<OptionItem | null>(null);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [currentPage, setCurrentPage] = useState<number>(0);

  // Number of items to display per page
  const ITEMS_PER_PAGE = 40;

  // Calculate total pages based on the options length
  const totalPages = Math.ceil(options.length / ITEMS_PER_PAGE);

  /**
   * Memoized calculation of items visible on the current page.
   * Optimizes performance by recalculating only when options or currentPage change.
   */
  const visibleItems = useMemo(() => {
    const startIndex = currentPage * ITEMS_PER_PAGE;
    return options.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [options, currentPage]); // Dependency array includes options and currentPage

  /**
   * Effect hook to reset pagination to the first page when the options array changes.
   */
  useEffect(() => {
    setCurrentPage(0);
  }, [options]);

  /**
   * Effect hook to reset the active index when the current page changes.
   * Ensures keyboard navigation starts fresh on a new page.
   */
  useEffect(() => {
    setActiveIndex(-1);
  }, [currentPage]);

  /**
   * Navigates to the next page of options if not already on the last page.
   */
  const nextPage = (): void => {
    if (currentPage < totalPages - 1) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  /**
   * Navigates to the previous page of options if not already on the first page.
   */
  const prevPage = (): void => {
    if (currentPage > 0) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  /**
   * Handles the selection of an item from the dropdown.
   * Closes the dropdown, updates the selected item state, and calls the onSelect callback.
   * @param item - The OptionItem that was selected.
   */
  const handleSelect = (item: OptionItem): void => {
    setIsOpen(false);
    setSelectedItem(item);
    if (onSelect) onSelect(item);
  };

  /**
   * Default renderer for an option item. Displays the item's value.
   * @param item - The OptionItem to render.
   * @returns A ReactNode representing the default item view.
   */
  const defaultRenderItem = (item: OptionItem): React.ReactNode => {
    return <span>{item.value}</span>;
  };

  /**
   * Handles keyboard navigation within the dropdown.
   * Supports ArrowUp, ArrowDown, Enter, Escape, PageUp, and PageDown keys.
   * @param e - The React KeyboardEvent object.
   */
  const handleKeyDown = (e: React.KeyboardEvent): void => {
    // Open dropdown with Enter, Space, or ArrowDown if closed
    if (
      !isOpen &&
      (e.key === "Enter" || e.key === " " || e.key === "ArrowDown")
    ) {
      e.preventDefault();
      setIsOpen(true);
      setActiveIndex(0); // Set focus to the first item when opening
      return;
    }

    if (!isOpen) return; // Ignore other keys if dropdown is closed

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
        if (activeIndex >= 0 && activeIndex < visibleItems.length) {
          handleSelect(visibleItems[activeIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        break;
      case "PageDown": // Navigate to next page
        e.preventDefault();
        nextPage();
        break;
      case "PageUp": // Navigate to previous page
        e.preventDefault();
        prevPage();
        break;
      default:
        break;
    }
  };

  // Use the provided renderItem function or the default one
  const itemRenderer = renderItem || defaultRenderItem;

  return (
    <div
      className={`w-full mx-auto relative p-1 rounded-md transition-all duration-500 ${className}`}
    >
      <div className="px-4 py-0 rounded-md">
        {/* Label with transition */}
        <label className="block text-sm font-medium text-gray-200 mb-1 transition-colors duration-300">
          {icon}
          {title}
        </label>

        <div className="relative">
          {/* Dropdown trigger button with transitions */}
          <button
            id={id}
            type="button"
            onKeyDown={handleKeyDown}
            onClick={() => setIsOpen(!isOpen)}
            className="w-full bg-black text-gray-200 border border-gray-700 hover:opacity-75 focus:ring-2 focus:ring-gray-500 focus:border-gray-500 focus:outline-none transition-all duration-300 rounded-md px-3 py-2 flex items-center justify-between"
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            tabIndex={0} // Make button focusable
          >
            {/* Selected item display or placeholder with transition */}
            <span className="text-sm truncate transition-opacity duration-300">
              {selectedItem ? selectedItem.value : placeholder}
            </span>
            {/* Chevron icon with rotation transition */}
            <ChevronDownIcon
              className={`w-4 h-4 transition-transform duration-300 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Dropdown options container with transitions */}
          <div
            className={`absolute left-0 right-0 z-10 mt-1 bg-black text-gray-200 border border-gray-700 rounded-md shadow-lg transition-all duration-300 transform origin-top ${
              isOpen
                ? "opacity-100 scale-100" // Open state styles
                : "opacity-0 scale-95 pointer-events-none" // Closed state styles
            }`}
            role="listbox"
            style={{
              // Animate max-height for smooth opening/closing
              maxHeight: isOpen ? "300px" : "0", // Adjust max-height as needed
              overflow: "hidden", // Hide overflow during transition
              transitionProperty: "transform, opacity, max-height", // Properties to transition
              transitionDuration: "300ms", // Duration of the transition
              transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)", // Easing function
            }}
          >
            {/* Inner container for scrolling content */}
            <div
              className="divide-y divide-[#222222] overflow-y-auto transition-all duration-300"
              style={{ maxHeight: "240px" }} // Max height for scrollable area
            >
              {/* Render visible items */}
              {visibleItems.length > 0 ? (
                visibleItems.map((item, idx) => (
                  <div
                    key={item.id}
                    role="option"
                    aria-selected={selectedItem?.id === item.id}
                    className={`px-4 py-2 cursor-pointer text-sm transition-all duration-200 ${
                      idx === activeIndex ? "bg-gray-800" : "" // Highlight active item
                    } ${
                      selectedItem?.id === item.id
                        ? "opacity-50 cursor-default" // Style selected item differently
                        : "hover:bg-gray-800" // Hover effect
                    }`}
                    onMouseEnter={() => setActiveIndex(idx)} // Update active index on hover
                    // onMouseLeave={() => setActiveIndex(-1)} // Optionally reset active index on leave
                    onClick={() => handleSelect(item)} // Select item on click
                  >
                    {itemRenderer(item)} {/* Use the item renderer */}
                  </div>
                ))
              ) : (
                // Display message when no options are available
                <div className="px-4 py-2 text-sm text-gray-500 transition-colors duration-300">
                  No options available
                </div>
              )}
            </div> {/* End scrollable content */}

            {/* Pagination controls - only show if more than one page */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-2 border-t border-[#222222] transition-all duration-300">
                {/* Previous Page Button */}
                <button
                  onClick={prevPage}
                  disabled={currentPage === 0} // Disable if on the first page
                  className={`px-3 py-1 text-xs rounded transition-all duration-300 ${
                    currentPage === 0
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-gray-800"
                  }`}
                >
                  Previous
                </button>
                {/* Page Indicator */}
                <span className="text-xs text-gray-400 transition-all duration-300">
                  Page {currentPage + 1} / {totalPages}
                </span>
                {/* Next Page Button */}
                <button
                  onClick={nextPage}
                  disabled={currentPage >= totalPages - 1} // Disable if on the last page
                  className={`px-3 py-1 text-xs rounded transition-all duration-300 ${
                    currentPage >= totalPages - 1
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-gray-800"
                  }`}
                >
                  Next
                </button>
              </div>
            )} {/* End pagination controls */}
          </div> {/* End dropdown options container */}
        </div>
      </div>
    </div>
  );
};

export default DropdownSelect;