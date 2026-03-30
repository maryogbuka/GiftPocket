// app/scheduled/page.jsx
"use client";

import toast from "react-hot-toast";
import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  Calendar, Clock, MapPin, Gift, Package, Truck, 
  CheckCircle, AlertCircle, Search, Filter, ArrowLeft,
  ChevronRight, Eye, Download, RefreshCw, MoreVertical,
  CalendarDays, TrendingUp, PackageOpen, Clock3,
  Plus, Bell, Settings, Menu, X, BarChart3,
  Wallet as WalletIcon, Sparkles, Zap
} from "lucide-react";
import { useSettings } from "@/app/context/SettingsContext";




function getThemeClasses(settings) {
  const isDark = settings.appearance.theme === 'dark';
  
  return {
    bg: {
      primary: isDark ? "bg-gray-900" : "bg-gray-50",
      secondary: isDark ? "bg-gray-800" : "bg-white",
      card: isDark ? "bg-gray-800" : "bg-white",
      overlay: isDark ? "bg-black/50" : "bg-black/50",
      sidebar: isDark ? "bg-gray-800" : "bg-white",
      header: isDark ? "bg-gray-800" : "bg-white",
      nav: isDark ? "bg-gray-800" : "bg-white",
      green: isDark ? "bg-[#1EB53A]/10" : "bg-[#1EB53A]/10",
      gray: isDark ? "bg-gray-700" : "bg-gray-50",
      hover: isDark ? "bg-gray-700" : "bg-gray-50",
    },
    text: {
      primary: isDark ? "text-white" : "text-gray-800",
      secondary: isDark ? "text-gray-300" : "text-gray-600",
      muted: isDark ? "text-gray-400" : "text-gray-500",
      green: "text-[#1EB53A]",
    },
    border: {
      primary: isDark ? "border-gray-700" : "border-gray-200",
      secondary: isDark ? "border-gray-600" : "border-gray-200",
      green: isDark ? "border-[#1EB53A]/30" : "border-[#1EB53A]/30",
    },
    shadow: isDark ? "shadow-lg shadow-black/20" : "shadow-sm",
    isDark
  };
}

export default function SchedulePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { settings } = useSettings();
  const theme = getThemeClasses(settings);
  
  const [gifts, setGifts] = useState([]);
  const [filteredGifts, setFilteredGifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const statusOptions = [
    { id: "all", label: "All Status", color: "gray" },
    { id: "scheduled", label: "Scheduled", color: "blue" },
    { id: "processing", label: "Processing", color: "yellow" },
    { id: "shipped", label: "Shipped", color: "orange" },
    { id: "delivered", label: "Delivered", color: "green" },
    { id: "cancelled", label: "Cancelled", color: "red" }
  ];

  // Navigation items matching dashboard
  const navItems = [
    { label: "Dashboard", id: "dashboard", icon: BarChart3, href: "/" },
    { label: "Gift Store", id: "gifts", icon: Gift, href: "/giftsPage" },
    { label: "Scheduled", id: "scheduled", icon: Calendar, href: "/schedule" },
    { label: "Wallet", id: "wallet", icon: WalletIcon, href: "/wallet" },
    { label: "Me", id: "me", icon: Sparkles, href: "/me" },
    { label: "Settings", id: "settings", icon: Settings, href: "/settings" },
  ];

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    fetchScheduledGifts();
  }, []);

  const filterGifts = useCallback(() => {
    let filtered = [...gifts];
    
    if (searchTerm) {
      filtered = filtered.filter(gift =>
        gift.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gift.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gift.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== "all") {
      filtered = filtered.filter(gift => gift.status === statusFilter);
    }
    
    setFilteredGifts(filtered);
  }, [searchTerm, statusFilter, gifts]);

  useEffect(() => {
    filterGifts();
  }, [filterGifts]);

  // app/scheduled/page.jsx - Update fetchScheduledGifts
const fetchScheduledGifts = async () => {
  try {
    setLoading(true);
    
    // Get the user's email from session or context
    const userEmail = "demo@giftpocket.com"; // Replace with actual user email
    
    const response = await fetch(`/api/scheduled-gifts?email=${encodeURIComponent(userEmail)}`);
    
    console.log("API Response status:", response.status);
    
    if (!response.ok) {
      // Get more detailed error info
      const errorText = await response.text();
      console.error("API Error response:", errorText);
      
      // Check if it's a 404 (endpoint not found)
      if (response.status === 404) {
        toast.error('API endpoint not found. Check if the route exists.');
      } else {
        toast.error(`Failed to fetch gifts: ${response.status} ${response.statusText}`);
      }
      throw new Error(`Failed to fetch gifts: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Gifts data received:", data);
    
    if (data.success) {
      setGifts(data.gifts || []);
      setFilteredGifts(data.gifts || []);
    } else {
      toast.error(data.error || 'Failed to load gifts');
      setGifts([]);
      setFilteredGifts([]);
    }
    
  } catch (error) {
    console.error("Error fetching gifts:", error);
    // Make sure toast is imported and available
    if (typeof toast !== 'undefined') {
      toast.error('Failed to load scheduled gifts');
    } else {
      console.error('Toast not available:', error.message);
    }
    setGifts([]);
    setFilteredGifts([]);
  } finally {
    setLoading(false);
  }
};

  const getStatusColor = (status) => {
    switch(status) {
      case "scheduled": return "bg-blue-100 text-blue-800 border-blue-200";
      case "processing": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "shipped": return "bg-orange-100 text-orange-800 border-orange-200";
      case "delivered": return "bg-green-100 text-green-800 border-green-200";
      case "cancelled": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case "scheduled": return <Calendar className="w-4 h-4" />;
      case "processing": return <Package className="w-4 h-4" />;
      case "shipped": return <Truck className="w-4 h-4" />;
      case "delivered": return <CheckCircle className="w-4 h-4" />;
      case "cancelled": return <AlertCircle className="w-4 h-4" />;
      default: return <Clock3 className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-NG", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric"
    });
  };

  const naira = (amount = 0) => `₦${Number(amount).toLocaleString()}`;

  const handleTrackGift = (trackingNumber) => {
    router.push(`/GiftStatuaTracker/${trackingNumber}`);
  };

  const handleReorder = (gift) => {
    console.log("Reordering gift:", gift);
    router.push("/giftsPage");
  };

  if (status === "loading") {
    return (
      <div className={`min-h-screen ${theme.bg.primary} flex items-center justify-center`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1EB53A]"></div>
      </div>
    );
  }
  
  if (status === "unauthenticated") {
    return null;
  }

  return (
    <div className={`min-h-screen ${theme.bg.primary}`}>
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 md:hidden" onClick={() => setMobileMenuOpen(false)}>
          <div className={`fixed inset-y-0 left-0 w-64 ${theme.bg.sidebar} shadow-xl transform transition-transform duration-300 ease-in-out`} onClick={(e) => e.stopPropagation()}>
            <div className={`p-6 ${theme.border.primary}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-linear-to-br from-[#1EB53A] to-emerald-600 rounded-xl flex items-center justify-center">
                    <Gift className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className={`text-xl font-bold ${theme.text.primary}`}>GiftPocket</h1>
                    <p className={`text-xs ${theme.text.muted}`}>Fintech Gifting</p>
                  </div>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className={`p-2 hover:${theme.bg.gray} rounded-lg`}>
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-4">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 ${theme.bg.gray} ${theme.border.primary} rounded-xl text-sm focus:ring-2 focus:ring-[#1EB53A] focus:border-transparent ${theme.text.primary}`}
                />
              </div>
              <nav className="space-y-1">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      router.push(item.href);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm transition-all duration-200 ${theme.text.secondary} hover:${theme.bg.green} hover:text-[#1EB53A]`}
                  >
                    <item.icon className="w-4.5 h-4.5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className={`hidden md:fixed md:inset-y-0 md:left-0 md:z-50 md:w-64 ${theme.bg.sidebar} ${theme.border.primary} md:shadow-lg md:flex md:flex-col`}>
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-linear-to-br from-[#1EB53A] to-emerald-600 rounded-xl flex items-center justify-center">
              <Gift className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className={`text-xl font-bold ${theme.text.primary}`}>GiftPocket</h1>
              <p className={`text-xs ${theme.text.muted}`}>Fintech Gifting</p>
            </div>
          </div>
        </div>
        <div className="px-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full ${theme.text.primary} pl-10 pr-4 py-2.5 ${theme.bg.gray} ${theme.border.primary} rounded-xl text-sm focus:ring-2 focus:ring-[#1EB53A] focus:border-transparent`}
            />
          </div>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => router.push(item.href)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm transition-all duration-200 ${
                item.id === "scheduled" 
                  ? `${theme.bg.green} text-[#1EB53A]` 
                  : `${theme.text.secondary} hover:${theme.bg.green} hover:text-[#1EB53A]`
              } hover:shadow-sm group`}
            >
              <item.icon className="w-4.5 h-4.5 transition-transform group-hover:scale-110" />
              <span className="font-medium">{item.label}</span>
              <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="md:ml-64">
        {/* Top Header */}
        <header className={`sticky top-0 z-40 ${theme.bg.header} ${theme.border.primary} border-b px-4 py-3 md:px-6 md:py-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className={`text-lg md:text-xl font-bold ${theme.text.primary}`}>
                  Scheduled Gifts
                </h1>
                <p className={`text-xs md:text-sm ${theme.text.secondary}`}>
                  Track your upcoming gift deliveries
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 md:gap-3">
              <button
                onClick={fetchScheduledGifts}
                className={`p-2 hover:${theme.bg.gray} rounded-lg md:rounded-xl transition-colors`}
                disabled={loading}
              >
                <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
              </button>
              <button
                onClick={() => router.push("/giftsPage")}
                className="px-4 py-2 bg-[#1EB53A] text-white rounded-lg hover:bg-[#189531] transition-colors"
              >
                <Plus className="w-4 h-4 inline mr-2" />
                New Gift
              </button>
            </div>
          </div>
        </header>

        {/* Stats Overview */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className={`${theme.bg.card} p-4 md:p-6 rounded-xl md:rounded-2xl ${theme.shadow} border ${theme.border.primary}`}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className={`text-sm ${theme.text.secondary}`}>Scheduled</p>
                  <p className={`text-xl font-bold ${theme.text.primary}`}>
                    {gifts.filter(g => g.status === "scheduled").length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className={`${theme.bg.card} p-4 md:p-6 rounded-xl md:rounded-2xl ${theme.shadow} border ${theme.border.primary}`}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 text-yellow-600 rounded-lg">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <p className={`text-sm ${theme.text.secondary}`}>Processing</p>
                  <p className={`text-xl font-bold ${theme.text.primary}`}>
                    {gifts.filter(g => g.status === "processing").length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className={`${theme.bg.card} p-4 md:p-6 rounded-xl md:rounded-2xl ${theme.shadow} border ${theme.border.primary}`}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <p className={`text-sm ${theme.text.secondary}`}>In Transit</p>
                  <p className={`text-xl font-bold ${theme.text.primary}`}>
                    {gifts.filter(g => g.status === "shipped").length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className={`${theme.bg.card} p-4 md:p-6 rounded-xl md:rounded-2xl ${theme.shadow} border ${theme.border.primary}`}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className={`text-sm ${theme.text.secondary}`}>Delivered</p>
                  <p className={`text-xl font-bold ${theme.text.primary}`}>
                    {gifts.filter(g => g.status === "delivered").length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className={`${theme.bg.card} rounded-xl md:rounded-2xl ${theme.shadow} border ${theme.border.primary} p-4 md:p-6 mb-6`}>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by recipient name, tracking number, or address..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 ${theme.text.primary} ${theme.bg.gray} border ${theme.border.primary} rounded-lg focus:ring-2 focus:ring-[#1EB53A] focus:border-transparent`}
                />
              </div>
              
              <div className="flex gap-2 overflow-x-auto pb-2">
                {statusOptions.map(option => (
                  <button
                    key={option.id}
                    onClick={() => setStatusFilter(option.id)}
                    className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                      statusFilter === option.id
                        ? `bg-[#1EB53A] text-white`
                        : `${theme.bg.gray} ${theme.text.primary} hover:${theme.bg.hover}`
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Gifts List */}
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1EB53A] mx-auto"></div>
                <p className={`mt-4 ${theme.text.secondary}`}>Loading your scheduled gifts...</p>
              </div>
            ) : filteredGifts.length === 0 ? (
              <div className={`${theme.bg.card} rounded-xl md:rounded-2xl ${theme.shadow} border ${theme.border.primary} p-12 text-center`}>
                <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className={`text-xl font-bold ${theme.text.primary} mb-2`}>No scheduled gifts found</h3>
                <p className={`${theme.text.secondary} mb-6`}>
                  {searchTerm || statusFilter !== "all" 
                    ? "Try adjusting your filters" 
                    : "Schedule your first gift to see it here"}
                </p>
                <button
                  onClick={() => router.push("/giftsPage")}
                  className="px-6 py-3 bg-[#1EB53A] text-white rounded-lg hover:bg-[#189531] transition-colors"
                >
                  Schedule Your First Gift
                </button>
              </div>
            ) : (
              filteredGifts.map(gift => (
                <div key={gift.id} className={`${theme.bg.card} rounded-xl md:rounded-2xl ${theme.shadow} border ${theme.border.primary} overflow-hidden hover:${theme.bg.hover} transition-colors`}>
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          <div className={`p-3 ${theme.bg.green} rounded-lg`}>
                            <Gift className="w-6 h-6 text-[#1EB53A]" />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                              <h3 className={`text-lg font-bold ${theme.text.primary}`}>
                                {gift.recipientName}
                              </h3>
                              <div className="flex items-center gap-2">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${getStatusColor(gift.status)}`}>
                                  {getStatusIcon(gift.status)}
                                  {gift.status.charAt(0).toUpperCase() + gift.status.slice(1)}
                                </span>
                                <span className={`text-sm ${theme.text.secondary}`}>
                                  {gift.occasion.charAt(0).toUpperCase() + gift.occasion.slice(1)}
                                </span>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <span className={theme.text.secondary}>
                                  {formatDate(gift.deliveryDate)} at {gift.deliveryTime}
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-gray-400" />
                                <span className={`${theme.text.secondary} truncate`}>{gift.address}</span>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <PackageOpen className="w-4 h-4 text-gray-400" />
                                <span className={theme.text.secondary}>
                                  {gift.items.length} item{gift.items.length !== 1 ? "s" : ""}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-3">
                              <code className={`px-3 py-1 ${theme.bg.gray} ${theme.text.primary} rounded-lg font-mono text-sm`}>
                                {gift.trackingNumber}
                              </code>
                              <span className={`font-bold ${theme.text.green}`}>
                                {naira(gift.totalAmount)}
                              </span>
                              {gift.daysUntil && gift.status !== "delivered" && (
                                <span className={`text-sm ${theme.text.secondary}`}>
                                  Delivery in {gift.daysUntil} day{gift.daysUntil !== 1 ? "s" : ""}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleTrackGift(gift.trackingNumber)}
                          className="px-4 py-2 bg-[#1EB53A] text-white rounded-lg hover:bg-[#189531] transition-colors flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          Track
                        </button>
                        
                        <button
                          onClick={() => handleReorder(gift)}
                          className={`px-4 py-2 border ${theme.border.green} ${theme.text.green} rounded-lg hover:${theme.bg.green} transition-colors flex items-center gap-2`}
                        >
                          <TrendingUp className="w-4 h-4" />
                          Reorder
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className={`fixed bottom-0 left-0 right-0 ${theme.bg.nav} shadow-lg rounded-t-xl md:hidden ${theme.border.primary} z-40`}>
          <div className="flex justify-around py-3">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => router.push(item.href)}
                className={`flex flex-col items-center text-xs ${
                  item.id === "scheduled" 
                    ? "text-[#1EB53A]" 
                    : theme.text.secondary
                } hover:text-[#1EB53A] transition-colors`}
              >
                <item.icon size={20} />
                <p className="mt-1">{item.label}</p>
              </button>
            ))}
          </div>
        </nav>
      </main>
    </div>
  );
}