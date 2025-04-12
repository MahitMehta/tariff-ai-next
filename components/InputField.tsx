"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { CommandLineIcon } from "@heroicons/react/24/outline";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

interface StyledInputFieldProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  title?: string;
  icon?: ReactNode;
  placeholder?: string;
  type?: "text" | "password";
}

export default function InputField({
  value,
  onChange,
  className = "",
  title = "Input",
  icon = <CommandLineIcon className="w-5 h-5 inline-block mr-2" />,
  placeholder = "Type here...",
  type = "text",
}: StyledInputFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const isPassword = type === "password";
  const inputType = isPassword && !showPassword ? "password" : "text";

  return (
    <div className={`w-full mx-auto relative rounded-md transition-all duration-500 ${className}`}>
      <div className="p-4 rounded-md">
        {/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
        <label className="block text-sm font-medium text-white mb-1">
          {icon}
          {title}
        </label>
        <div className="relative">
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full text-white border border-[rgba(255,255,255,0.2)] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white transition-all duration-300 rounded-md pr-10 px-3 py-2"
            placeholder={placeholder}
            type={inputType}
          />
          
          {isPassword && (
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors duration-200"
              onClick={togglePasswordVisibility}
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5" aria-hidden="true" />
              ) : (
                <EyeIcon className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}