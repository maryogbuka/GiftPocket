// app/data/page.jsx
// Data management page - where users can see and manage their stored data
"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Database,
  Download,
  Trash2,
  Shield,
  ChevronLeft,
  AlertTriangle,
  CheckCircle,
  HardDrive,
  Cloud,
  CreditCard,
  Image,
  Mail,
  Users,
  Clock,
  CheckSquare,
  Square,
  FileDown,
  AlertCircle,
  Info,
  ExternalLink
} from "lucide-react";

// Local helper function - I like to keep these simple
const formatBytes = (bytes) => {
  if (bytes < 1024) return `${bytes} MB`;
  return `${(bytes / 1024).toFixed(1)} GB`;
};

export default function DataPage() {
  const router = useRouter();
  
  // State for selected items - using Set for better performance with many items
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastAction, setLastAction] = useState(null);

  // Data categories - moved outside component if this were real, but keeping here for now
  const dataCategories = useMemo(() => [
    {
      id: "transactions",
      title: "Transactions",
      icon: <CreditCard className="w-5 h-5" />,
      size: "4.2 GB",
      itemCount: 1245,
      updatedAt: "Today",
      description: "Payment history, gifts, and transfers",
      formats: ["CSV", "PDF", "JSON"],
      color: "blue"
    },
    {
      id: "media",
      title: "Media",
      icon: <Image className="w-5 h-5" />,
      size: "2.1 GB",
      itemCount: 342,
      updatedAt: "2 days ago",
      description: "Photos, videos, and attachments",
      formats: ["ZIP", "Original"],
      color: "purple"
    },
    {
      id: "messages",
      title: "Messages",
      icon: <Mail className="w-5 h-5" />,
      size: "1.5 GB",
      itemCount: 5890,
      updatedAt: "Yesterday",
      description: "Chats and conversations",
      formats: ["TXT", "PDF"],
      color: "green"
    },
    {
      id: "contacts",
      title: "Contacts",
      icon: <Users className="w-5 h-5" />,
      size: "850 MB",
      itemCount: 287,
      updatedAt: "Today",
      description: "Your contacts and connections",
      formats: ["VCF", "CSV"],
      color: "orange"
    },
    {
      id: "profile",
      title: "Profile",
      icon: <Users className="w-5 h-5" />,
      size: "150 MB",
      itemCount: 45,
      updatedAt: "1 week ago",
      description: "Account info and preferences",
      formats: ["JSON", "PDF"],
      color: "gray"
    },
    {
      id: "analytics",
      title: "Analytics",
      icon: <Database className="w-5 h-5" />,
      size: "320 MB",
      itemCount: 890,
      updatedAt: "Today",
      description: "Usage data and insights",
      formats: ["CSV", "JSON"],
      color: "indigo"
    }
  ], []);

  // Storage stats - in a real app, this would come from an API
  const storageStats = {
    total: 15,
    used: 8.7,
    free: 6.3,
    percentUsed: 58
  };

  // Helper to get color classes - I keep this simple
  const getColorClasses = (color) => {
    const map = {
      blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
      purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' },
      green: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' },
      orange: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200' },
      gray: { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200' },
      indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200' }
    };
    return map[color] || map.gray;
  };

  // Handle single item selection
  const handleSelectItem = (id) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Select all items
  const handleSelectAll = () => {
    if (selectedIds.size === dataCategories.length) {
      setSelectedIds(new Set());
    } else {
      const allIds = dataCategories.map(item => item.id);
      setSelectedIds(new Set(allIds));
    }
  };

  // Download single category
  const handleDownload = async (categoryId, format = 'CSV') => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    setLastAction({ type: 'download', categoryId });
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    alert(`Starting download: ${categoryId} as ${format}`);
    setIsProcessing(false);
  };

  // Delete single category
  const handleDelete = (categoryId) => {
    const categoryName = dataCategories.find(c => c.id === categoryId)?.title;
    
    if (!window.confirm(`Delete all ${categoryName} data? This can't be undone.`)) {
      return;
    }
    
    // In real app, this would call an API
    alert(`${categoryName} data deleted`);
    setLastAction({ type: 'delete', categoryId });
  };

  // Bulk operations
  const handleBulkDownload = async () => {
    if (selectedIds.size === 0 || isProcessing) return;
    
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    alert(`Downloading ${selectedIds.size} categories...`);
    setIsProcessing(false);
    setSelectedIds(new Set());
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    
    if (!window.confirm(`Delete ${selectedIds.size} selected categories?`)) {
      return;
    }
    
    alert(`Deleted ${selectedIds.size} categories`);
    setSelectedIds(new Set());
    setLastAction({ type: 'bulk_delete', count: selectedIds.size });
  };

  // Are all items selected?
  const allSelected = selectedIds.size === dataCategories.length;
  // Are some items selected?
  const someSelected = selectedIds.size > 0 && selectedIds.size < dataCategories.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - keeping it clean */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 md:px-6 md:py-5">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Go back"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <div className="flex-1">
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">Data Management</h1>
              <p className="text-gray-600 text-sm">View and manage your stored data</p>
            </div>
            
            {lastAction && (
              <div className="text-xs text-gray-500 px-3 py-1 bg-gray-100 rounded-full">
                {lastAction.type === 'download' ? 'Downloaded' : 'Deleted'}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 md:px-6">
        {/* Storage Overview */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Storage Usage</h2>
            <span className="text-sm text-gray-500">15 GB total</span>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-5 md:p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg mb-1">Cloud Storage</h3>
                  <p className="text-gray-600">Securely stored and encrypted</p>
                </div>
                
                <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg border border-green-200">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-700">Secure</span>
                </div>
              </div>

              {/* Storage progress bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-700 mb-2">
                  <span>{storageStats.used.toFixed(1)} GB used</span>
                  <span>{storageStats.free.toFixed(1)} GB free</span>
                </div>
                
                <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-linear-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-500"
                    style={{ width: `${storageStats.percentUsed}%` }}
                  />
                </div>
                
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                  <span>0 GB</span>
                  <span>{storageStats.total} GB</span>
                </div>
              </div>

              {/* Storage breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
                  <div className="flex items-center gap-3">
                    <HardDrive className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-700 font-medium">Local Cache</p>
                      <p className="text-lg font-bold text-gray-900">1.2 GB</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-green-50 border border-green-100 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Cloud className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-700 font-medium">Cloud Storage</p>
                      <p className="text-lg font-bold text-gray-900">7.5 GB</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Trash2 className="w-5 h-5 text-amber-600" />
                    <div>
                      <p className="text-sm text-gray-700 font-medium">Can Clear</p>
                      <p className="text-lg font-bold text-gray-900">3.8 GB</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bulk Actions - only show when items are selected */}
        {selectedIds.size > 0 && (
          <div className="mb-6 p-4 bg-linear-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl animate-in slide-in-from-top">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900">
                    {selectedIds.size} item{selectedIds.size !== 1 ? 's' : ''} selected
                  </p>
                  <p className="text-sm text-blue-700">
                    Choose what to do with them
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleBulkDownload}
                  disabled={isProcessing}
                  className={`px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm font-medium ${
                    isProcessing ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  <Download className="w-4 h-4" />
                  Download Selected
                </button>
                
                <button
                  onClick={handleBulkDelete}
                  className="px-4 py-2.5 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2 text-sm font-medium"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Selected
                </button>
                
                <button
                  onClick={() => setSelectedIds(new Set())}
                  className="px-3 py-2.5 text-gray-600 hover:text-gray-800 transition-colors text-sm"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Data Categories */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Data Categories</h2>
              <p className="text-gray-600 text-sm">Select items to download or delete</p>
            </div>
            
            <button
              onClick={handleSelectAll}
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              {allSelected ? (
                <>
                  <CheckSquare className="w-4 h-4" />
                  Deselect All
                </>
              ) : (
                <>
                  <Square className="w-4 h-4" />
                  Select All
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {dataCategories.map((category) => {
              const isSelected = selectedIds.has(category.id);
              const colorClasses = getColorClasses(category.color);
              
              return (
                <div 
                  key={category.id}
                  className={`bg-white border rounded-xl transition-all duration-200 ${
                    isSelected 
                      ? 'border-blue-400 shadow-sm bg-blue-50/20' 
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  <div className="p-5">
                    {/* Header with checkbox and title */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3 flex-1">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectItem(category.id)}
                          className="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          disabled={isProcessing}
                        />
                        
                        <div className={`p-2.5 rounded-lg border ${colorClasses.border} ${colorClasses.bg}`}>
                          <div className={colorClasses.text}>
                            {category.icon}
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">{category.title}</h3>
                          <div className="flex items-center gap-3 text-sm text-gray-500">
                            <span className="font-medium">{category.size}</span>
                            <span className="text-gray-300">•</span>
                            <span>{category.itemCount.toLocaleString()} items</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Description */}
                    <p className="text-gray-600 text-sm mb-4">
                      {category.description}
                    </p>
                    
                    {/* Metadata row */}
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        Updated {category.updatedAt}
                      </span>
                      
                      <span className="flex items-center gap-1.5">
                        <Shield className="w-4 h-4" />
                        Encrypted
                      </span>
                    </div>
                    
                    {/* Formats */}
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-2">Available formats:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {category.formats.map((format, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleDownload(category.id, format)}
                            disabled={isProcessing}
                            className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
                              isProcessing
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {format}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Action buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDownload(category.id)}
                        disabled={isProcessing}
                        className={`flex-1 py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm ${
                          isProcessing
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                        }`}
                      >
                        <FileDown className="w-4 h-4" />
                        Download
                      </button>
                      
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:text-red-600 hover:border-red-300 transition-colors flex items-center gap-2 text-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Help Section */}
        <section>
          <div className="p-5 bg-linear-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg shrink-0">
                <AlertTriangle className="w-5 h-5 text-emerald-700" />
              </div>
              
              <div className="flex-1">
                <h3 className="font-semibold text-emerald-900 mb-2">Data Tips</h3>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <p className="text-sm text-emerald-800">
                      Regular downloads serve as good backups. We recommend downloading important data monthly.
                    </p>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <p className="text-sm text-emerald-800">
                      Deleted data can&apos;t be recovered. Make sure you have backups before deleting.
                    </p>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <Shield className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <p className="text-sm text-emerald-800">
                      All data is encrypted at rest and in transit. Your information is secure.
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-emerald-200">
                  <a 
                    href="/help/data-management"
                    className="inline-flex items-center gap-1 text-sm font-medium text-emerald-700 hover:text-emerald-900"
                  >
                    Learn more about data management
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}