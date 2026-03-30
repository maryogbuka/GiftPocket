// components/Toast.jsx
// Simple toast notification component
"use client";

import { useEffect } from "react";

export default function Toast({ 
  type = "success", 
  message, 
  duration = 3000,
  onClose,
  autoClose = true
}) {
  // Handle auto-dismiss
  useEffect(() => {
    if (!autoClose) return;
    if (!onClose) return;
    
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    
    return () => {
      clearTimeout(timer);
    };
  }, [onClose, duration, autoClose]);
  
  // Get styling based on type
  const getStyles = () => {
    switch (type) {
      case 'error':
        return {
          bg: 'bg-red-600',
          border: 'border-red-700',
          icon: '❌'
        };
      case 'warning':
        return {
          bg: 'bg-amber-500',
          border: 'border-amber-600',
          icon: '⚠️'
        };
      case 'info':
        return {
          bg: 'bg-blue-600',
          border: 'border-blue-700',
          icon: 'ℹ️'
        };
      case 'success':
      default:
        return {
          bg: 'bg-green-600',
          border: 'border-green-700',
          icon: '✅'
        };
    }
  };
  
  const styles = getStyles();
  
  // Handle manual close
  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };
  
  return (
    <div
      role="alert"
      className="fixed top-6 right-6 z-50 animate-in slide-in-from-right fade-in"
      onClick={handleClose}
    >
      <div
        className={`
          flex items-start gap-3
          px-4 py-3
          rounded-xl
          shadow-lg
          border
          text-white
          font-medium
          max-w-sm
          cursor-pointer
          hover:opacity-90
          active:scale-95
          transition-all
          ${styles.bg}
          ${styles.border}
        `}
      >
        {/* Icon */}
        <span className="text-lg">{styles.icon}</span>
        
        {/* Message */}
        <div className="flex-1 min-w-0">
          <p className="text-sm leading-relaxed wrap-break-word">
            {message}
          </p>
        </div>
        
        {/* Close button */}
        <button
          onClick={handleClose}
          className="
            ml-2
            text-white/80
            hover:text-white
            text-lg
            transition-colors
            -mt-1 -mr-1
          "
          aria-label="Dismiss notification"
        >
          ×
        </button>
      </div>
    </div>
  );
}