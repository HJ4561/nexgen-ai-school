// src/components/ui/Input.jsx
import React from "react";

export const Input = ({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  required = false,
  className = "",
  leftIcon,
  rightIcon,
  ...props
}) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block md:hidden text-sm md:text-base md:text-base font-medium text-gray-700 mb-1 px-4 sm:px-6 lg:px-8">
          {label}
          {required && <span className="text-red-500 ml-1 px-4 sm:px-6 lg:px-8">*</span>}
        </label>
      )}
      <div className="relative px-4 sm:px-6 lg:px-8">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 px-4 sm:px-6 lg:px-8">
            {leftIcon}
          </div>
        )}
        <input
          type={type}
          name={name}
          value={value || ""}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`
            w-full px-3 py-2 border border-gray-200 rounded-xl 
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
            outline-none transition-all
            ${leftIcon ? 'pl-10' : ''}
            ${rightIcon ? 'pr-10' : ''}
          `}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 px-4 sm:px-6 lg:px-8">
            {rightIcon}
          </div>
        )}
      </div>
    </div>
  );
};

// Also export as default for backward compatibility
export default Input;
