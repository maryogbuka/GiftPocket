// components/ToggleButton.jsx
// Custom toggle switch component
"use client";

import { useSettings } from '../context/SettingsContext';

export default function ToggleButton({ 
  checked = false, 
  onChange,
  size = 'md',
  disabled = false,
  label,
  id,
  ...props 
}) {
  const { settings } = useSettings();
  
  // Size mappings - I like to keep these separate for clarity
  const sizes = {
    sm: {
      container: 'h-5 w-9',
      knob: 'h-3 w-3',
      knobOn: 'translate-x-4',
      knobOff: 'translate-x-1'
    },
    md: {
      container: 'h-6 w-11',
      knob: 'h-4 w-4',
      knobOn: 'translate-x-6',
      knobOff: 'translate-x-1'
    },
    lg: {
      container: 'h-7 w-14',
      knob: 'h-5 w-5',
      knobOn: 'translate-x-7',
      knobOff: 'translate-x-1'
    }
  };
  
  // Get current size config
  const sizeConfig = sizes[size] || sizes.md;
  
  // Handle theme-aware colors
  const getBgColor = () => {
    const isDark = settings.appearance.theme === 'dark';
    
    if (checked) {
      return 'bg-green-500';
    }
    
    return isDark ? 'bg-gray-700' : 'bg-gray-300';
  };
  
  // Handle click
  const handleClick = (e) => {
    if (disabled) return;
    
    if (onChange) {
      onChange(!checked);
    }
  };
  
  // Handle keyboard
  const handleKeyDown = (e) => {
    if (disabled) return;
    
    // Space or Enter toggles
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleClick();
    }
  };
  
  const bgColor = getBgColor();
  const knobPosition = checked ? sizeConfig.knobOn : sizeConfig.knobOff;
  
  return (
    <div className="flex items-center gap-2">
      {/* The actual toggle switch */}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={`
          relative inline-flex items-center justify-center
          ${sizeConfig.container}
          rounded-full
          border-2 border-transparent
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-90'}
          ${bgColor}
        `}
        id={id}
        {...props}
      >
        {/* Toggle knob */}
        <span
          className={`
            absolute left-0
            ${sizeConfig.knob}
            rounded-full
            bg-white
            shadow-sm
            transform
            transition-all duration-200 ease-in-out
            ${knobPosition}
          `}
        />
      </button>
      
      {/* Optional label */}
      {label && (
        <label 
          htmlFor={id} 
          className={`text-sm ${disabled ? 'text-gray-400' : 'text-gray-700'} cursor-pointer select-none`}
          onClick={!disabled ? handleClick : undefined}
        >
          {label}
        </label>
      )}
    </div>
  );
}