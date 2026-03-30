// app/context/SettingsContext.jsx
// Settings management - handles user preferences across the app
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

// Default settings - I like to keep these at the top for easy tweaking
const DEFAULT_SETTINGS = {
  // Notifications
  notifications: {
    transactionAlerts: true,
    giftReminders: true,
    marketingEmails: false,
    pushNotifications: true,
    soundEffects: true,
    securityAlerts: true,
    balanceUpdates: true
  },
  
  // Security stuff
  security: {
    twoFactorAuth: false,
    biometricLogin: true,
    autoLogout: 30, // minutes
    loginNotifications: true,
    sessionManagement: true,
    deviceWhitelist: false
  },
  
  // Privacy preferences
  privacy: {
    showBalance: true,
    transactionHistory: true,
    profileVisibility: "contacts",
    dataSharing: false,
    activityStatus: true,
    searchVisibility: true
  },
  
  // Look and feel
  appearance: {
    theme: "light", // light, dark, auto
    fontSize: "medium", // small, medium, large
    currency: "NGN",
    language: "English",
    animations: true,
    reducedMotion: false
  },
  
  // Account preferences
  account: {
    autoTopUp: false,
    spendingLimits: 50000,
    defaultPaymentMethod: "wallet",
    giftReminderDays: 3,
    currencyFormat: "₦1,000.00"
  }
};

// Create context
const SettingsContext = createContext();

// Main provider component
export function SettingsProvider({ children }) {
  const { data: session } = useSession();
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [lastSync, setLastSync] = useState(null);
  
  // Load settings from localStorage on mount
  useEffect(() => {
    const loadSettings = () => {
      try {
        // Try to get saved settings from localStorage
        const saved = localStorage.getItem('app-settings');
        
        if (saved) {
          const parsed = JSON.parse(saved);
          
          // Merge with defaults to ensure we have all properties
          const merged = {
            ...DEFAULT_SETTINGS,
            ...parsed,
            notifications: { ...DEFAULT_SETTINGS.notifications, ...parsed.notifications },
            security: { ...DEFAULT_SETTINGS.security, ...parsed.security },
            privacy: { ...DEFAULT_SETTINGS.privacy, ...parsed.privacy },
            appearance: { ...DEFAULT_SETTINGS.appearance, ...parsed.appearance },
            account: { ...DEFAULT_SETTINGS.account, ...parsed.account }
          };
          
          setSettings(merged);
        }
        
      } catch (error) {
        console.warn('Failed to load settings from localStorage:', error);
        // Just use defaults if we can't load saved settings
      } finally {
        setLoading(false);
      }
    };
    
    loadSettings();
  }, []);
  
  // Load from server when user is logged in
  useEffect(() => {
    const fetchServerSettings = async () => {
      if (!session?.user?.email) return;
      
      try {
        const res = await fetch('/api/user/settings');
        
        if (res.ok) {
          const data = await res.json();
          
          if (data?.settings) {
            // Merge server settings with current (keeping unsaved local changes)
            const merged = {
              ...settings,
              ...data.settings,
              notifications: { ...settings.notifications, ...data.settings?.notifications },
              security: { ...settings.security, ...data.settings?.security },
              privacy: { ...settings.privacy, ...data.settings?.privacy },
              appearance: { ...settings.appearance, ...data.settings?.appearance },
              account: { ...settings.account, ...data.settings?.account }
            };
            
            setSettings(merged);
            localStorage.setItem('app-settings', JSON.stringify(merged));
            setLastSync(new Date());
          }
        }
      } catch (error) {
        console.log('Could not fetch server settings:', error.message);
        // It's okay, we'll use local settings
      }
    };
    
    fetchServerSettings();
  }, [session?.user?.email]);
  
  // Apply theme and other appearance settings to document
  useEffect(() => {
    if (typeof document === 'undefined') return;
    
    const root = document.documentElement;
    const { theme, fontSize, reducedMotion } = settings.appearance;
    
    // Handle theme
    if (theme === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else if (theme === 'light') {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    } else {
      // Auto - follow system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
        root.style.colorScheme = 'dark';
      } else {
        root.classList.remove('dark');
        root.style.colorScheme = 'light';
      }
    }
    
    // Font size
    const sizes = {
      small: '14px',
      medium: '16px',
      large: '18px',
      xlarge: '20px'
    };
    
    if (sizes[fontSize]) {
      root.style.fontSize = sizes[fontSize];
    }
    
    // Reduced motion
    if (reducedMotion) {
      document.body.classList.add('reduced-motion');
    } else {
      document.body.classList.remove('reduced-motion');
    }
    
  }, [settings.appearance]);
  
  // Save to localStorage whenever settings change
  useEffect(() => {
    if (loading) return;
    
    try {
      localStorage.setItem('app-settings', JSON.stringify(settings));
    } catch (error) {
      console.warn('Failed to save settings to localStorage:', error);
    }
  }, [settings, loading]);
  
  // Helper to update a setting
  const updateSetting = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };
  
  // Toggle boolean settings (most common operation)
  const toggleSetting = (category, key) => {
    updateSetting(category, key, !settings[category][key]);
  };
  
  // Save to server (async, doesn't block UI)
  const saveToServer = async () => {
    if (!session?.user?.email) {
      console.log('No session, saving locally only');
      return { success: true, localOnly: true };
    }
    
    try {
      const res = await fetch('/api/user/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings })
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setLastSync(new Date());
          return { success: true, synced: true };
        }
      }
      
      return { success: false, error: 'Server error' };
      
    } catch (error) {
      console.log('Failed to save to server:', error.message);
      return { success: false, error: error.message };
    }
  };
  
  // Reset to defaults
  const resetSettings = () => {
    if (window.confirm('Reset all settings to defaults?')) {
      setSettings(DEFAULT_SETTINGS);
      
      // Try to save to server too
      if (session?.user?.email) {
        fetch('/api/user/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ settings: DEFAULT_SETTINGS })
        }).catch(() => {
          // Silently fail - it's just a background sync
        });
      }
    }
  };
  
  // Sync from server (pull changes)
  const syncFromServer = async () => {
    if (!session?.user?.email) {
      alert('Sign in to sync settings');
      return;
    }
    
    try {
      const res = await fetch('/api/user/settings');
      
      if (res.ok) {
        const data = await res.json();
        
        if (data?.settings) {
          const merged = {
            ...DEFAULT_SETTINGS,
            ...data.settings,
            notifications: { ...DEFAULT_SETTINGS.notifications, ...data.settings?.notifications },
            security: { ...DEFAULT_SETTINGS.security, ...data.settings?.security },
            privacy: { ...DEFAULT_SETTINGS.privacy, ...data.settings?.privacy },
            appearance: { ...DEFAULT_SETTINGS.appearance, ...data.settings?.appearance },
            account: { ...DEFAULT_SETTINGS.account, ...data.settings?.account }
          };
          
          setSettings(merged);
          localStorage.setItem('app-settings', JSON.stringify(merged));
          setLastSync(new Date());
          
          return { success: true, synced: true };
        }
      }
      
      return { success: false, error: 'No settings found' };
      
    } catch (error) {
      console.log('Sync failed:', error.message);
      return { success: false, error: error.message };
    }
  };
  
  // Manual save (for explicit save buttons)
  const saveSettings = async () => {
    const result = await saveToServer();
    
    if (result.success) {
      if (result.localOnly) {
        alert('Settings saved locally');
      } else {
        alert('Settings saved successfully');
      }
    } else {
      alert('Saved locally - will sync when possible');
    }
    
    return result;
  };
  
  // Value to provide to consumers
  const value = {
    settings,
    updateSetting,
    toggleSetting,
    resetSettings,
    saveSettings,
    syncFromServer,
    lastSync,
    isLoading: loading
  };
  
  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

// Hook to use settings context
export const useSettings = () => {
  const context = useContext(SettingsContext);
  
  if (!context) {
    throw new Error('useSettings must be used inside SettingsProvider');
  }
  
  return context;
};