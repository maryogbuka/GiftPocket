// hooks/useTheme.js
"use client";
import { useSettings } from '@/context/SettingsContext';

export function useTheme() {
  const { settings } = useSettings();
  
  const isDark = settings.appearance.theme === 'dark';
  const isLight = settings.appearance.theme === 'light';
  const isAuto = settings.appearance.theme === 'auto';
  
  const themeClasses = (lightClass, darkClass) => {
    if (isDark) return darkClass;
    if (isLight) return lightClass;
    // For auto theme, we can use both and let CSS media queries handle it
    return `${lightClass} dark:${darkClass}`;
  };

  return {
    theme: settings.appearance.theme,
    isDark,
    isLight,
    isAuto,
    themeClasses,
    animations: settings.appearance.animations,
    reducedMotion: settings.appearance.reducedMotion,
    fontSize: settings.appearance.fontSize
  };
}