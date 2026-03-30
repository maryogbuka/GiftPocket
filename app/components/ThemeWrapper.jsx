// components/ThemeWrapper.jsx
// Handles theme and appearance settings for the app
"use client";

import { useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';

export default function ThemeWrapper({ children }) {
  const { settings } = useSettings();
  
  // Apply theme and appearance settings
  useEffect(() => {
    const html = document.documentElement;
    const { theme, fontSize, animations, reducedMotion } = settings.appearance;
    
    // Handle theme (light/dark)
    if (theme === 'dark') {
      html.classList.add('dark');
      document.body.style.colorScheme = 'dark';
    } else if (theme === 'light') {
      html.classList.remove('dark');
      document.body.style.colorScheme = 'light';
    } else {
      // Auto theme - follow system
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        html.classList.add('dark');
        document.body.style.colorScheme = 'dark';
      } else {
        html.classList.remove('dark');
        document.body.style.colorScheme = 'light';
      }
    }
    
    // Handle font size
    const fontSizeMap = {
      small: '14px',
      medium: '16px',
      large: '18px',
      xlarge: '20px'
    };
    
    const baseSize = fontSizeMap[fontSize] || '16px';
    html.style.fontSize = baseSize;
    
    // Set CSS variable for components
    document.documentElement.style.setProperty('--font-size-base', baseSize);
    
    // Handle animations
    if (reducedMotion || !animations) {
      html.classList.add('reduced-motion');
      html.style.setProperty('--animation-speed', '0.1s');
    } else {
      html.classList.remove('reduced-motion');
      html.style.setProperty('--animation-speed', '0.3s');
    }
    
  }, [settings.appearance]);
  
  // Listen for system theme changes
  useEffect(() => {
    if (settings.appearance.theme !== 'auto') return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      const html = document.documentElement;
      
      if (mediaQuery.matches) {
        html.classList.add('dark');
        document.body.style.colorScheme = 'dark';
      } else {
        html.classList.remove('dark');
        document.body.style.colorScheme = 'light';
      }
    };
    
    // Listen for changes
    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [settings.appearance.theme]);
  
  return <>{children}</>;
}