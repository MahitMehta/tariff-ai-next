"use client";

import { useState, useEffect } from "react";
import { CheckIcon } from "@heroicons/react/24/outline";

interface CheckboxProps {
  label: React.ReactNode;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  id: string;
  className?: string;
  disabled?: boolean;
}

export default function Checkbox({
  label,
  checked = false,
  onChange,
  id,
  className = "",
  disabled = false,
}: CheckboxProps) {
  const [isChecked, setIsChecked] = useState(checked);

  // Sync with external checked prop
  useEffect(() => {
    setIsChecked(checked);
  }, [checked]);

  const handleChange = () => {
    if (disabled) return;
    
    const newValue = !isChecked;
    setIsChecked(newValue);
    
    if (onChange) {
      onChange(newValue);
    }
  };

  return (
    <div className={`inline-flex items-center ${className}`}>
      <div
        className={`
          relative w-5 h-5 flex-shrink-0 rounded-sm overflow-hidden
          border cursor-pointer transition-all duration-200
          ${isChecked 
            ? "border-gray-400 bg-transparent" 
            : "border-gray-400 bg-transparent"}
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        `}
        onClick={handleChange}
      >
        <input
          type="checkbox"
          id={id}
          checked={isChecked}
          onChange={handleChange}
          disabled={disabled}
          className="absolute h-0 w-0 opacity-0"
        />
        {isChecked && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-200">
            <CheckIcon className="w-4 h-4 stroke-2" />
          </div>
        )}
      </div>
      
      <label
        htmlFor={id}
        className={`ml-2 text-gray-200 text-sm cursor-pointer select-none
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        `}
        onClick={handleChange}
      >
        {label}
      </label>
    </div>
  );
}