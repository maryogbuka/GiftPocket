// components/SettingsSyncStatus.jsx
// Shows when settings were last synced and lets you trigger a sync
"use client";

import { useSettings } from "@/context/SettingsContext";
import { RefreshCw, CheckCircle, AlertCircle, Info } from "lucide-react";
import { useState } from "react";

export default function SettingsSyncStatus() {
  const { lastSaved, syncFromServer, isLoading } = useSettings();
  const [isSyncing, setIsSyncing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Handle manual sync
  const handleSyncClick = async () => {
    if (isSyncing || isLoading) return;
    
    setIsSyncing(true);
    
    try {
      const result = await syncFromServer();
      
      if (!result?.success) {
        console.log('Sync failed:', result?.error);
        // In a real app, we'd show a toast here
      }
    } catch (error) {
      console.log('Sync error:', error.message);
    } finally {
      setIsSyncing(false);
    }
  };

  // Format the time ago
  const getTimeAgo = (date) => {
    if (!date) return "Never";
    
    const now = new Date();
    const then = new Date(date);
    const diffMs = now - then;
    const diffMins = Math.floor(diffMs / 1000 / 60);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    
    // For older dates, show the actual date
    return then.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const lastSavedText = getTimeAgo(lastSaved);
  const hasSynced = !!lastSaved;

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <div className="relative">
        {/* Main status card */}
        <div className="
          bg-white
          dark:bg-gray-800
          rounded-lg
          shadow-md
          border
          border-gray-200
          dark:border-gray-700
          px-3
          py-2.5
          min-w-60
        ">
          <div className="flex items-center justify-between gap-3">
            {/* Status indicator */}
            <div className="flex items-center gap-2">
              {hasSynced ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-500" />
              )}
              
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {hasSynced ? "Synced" : "Not Synced"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {hasSynced ? `Saved ${lastSavedText}` : "Changes not saved"}
                </p>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="
                  p-1
                  rounded
                  hover:bg-gray-100
                  dark:hover:bg-gray-700
                  text-gray-500
                  dark:text-gray-400
                  transition-colors
                "
                title="Info"
              >
                <Info className="w-3.5 h-3.5" />
              </button>
              
              <button
                onClick={handleSyncClick}
                disabled={isSyncing || isLoading}
                className={`
                  p-1.5
                  rounded-lg
                  transition-colors
                  disabled:opacity-50
                  disabled:cursor-not-allowed
                  ${isSyncing 
                    ? 'text-blue-500' 
                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }
                `}
                title="Sync now"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
          
          {/* Details panel */}
          {showDetails && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1.5">
                <p>
                  <span className="font-medium">Status:</span>{' '}
                  {hasSynced ? 'Synced with server' : 'Local changes only'}
                </p>
                
                {lastSaved && (
                  <p>
                    <span className="font-medium">Last sync:</span>{' '}
                    {new Date(lastSaved).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                )}
                
                <p className="text-gray-500 dark:text-gray-500">
                  Sync ensures your settings are backed up.
                </p>
              </div>
            </div>
          )}
        </div>
        
        {/* Sync indicator */}
        {(isSyncing || isLoading) && (
          <div className="
            absolute
            -top-1
            -right-1
            w-2.5
            h-2.5
            bg-blue-500
            rounded-full
            animate-pulse
            border
            border-white
            dark:border-gray-800
          " />
        )}
      </div>
    </div>
  );
}