"use client";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { LayoutDashboard, Wallet, Gift, Calendar, Users, LogOut, Plus, ShoppingCart, Clock, ArrowRight, Sparkles, Zap, ArrowUpRight, ArrowDownLeft, TrendingUp, BarChart3, CreditCard, Bell, Settings, Search, Filter, Eye, EyeOff, ChevronRight, Download, MoreVertical, CheckCircle, XCircle, AlertCircle, Menu, X } from "lucide-react";

// Action Card Component - Updated with green colors
function ActionCard({ label, icon, description, onClick, color = "green" }) {
  const colorClasses = {
    green: "bg-green-50 text-green-600 hover:bg-green-100",
    blue: "bg-blue-50 text-blue-600 hover:bg-blue-100",
    emerald: "bg-emerald-50 text-emerald-600 hover:bg-emerald-100",
    teal: "bg-teal-50 text-teal-600 hover:bg-teal-100",
    lime: "bg-lime-50 text-lime-600 hover:bg-lime-100"
  };
  
  return (
    <button
      onClick={onClick}
      className={`${colorClasses[color]} rounded-lg md:rounded-xl p-3 md:p-4 flex flex-col items-center text-center transition-all duration-200 hover:shadow-sm`}
    >
      <div className="p-1 md:p-2 rounded-lg bg-white mb-1 md:mb-2">
        {icon}
      </div>
      <p className="font-semibold text-xs md:text-sm">{label}</p>
      <p className="text-xs text-gray-600 mt-0.5 md:mt-1">{description}</p>
    </button>
  );
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [fetchError, setFetchError] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  // Navigation items
  const navItems = [
    { label: "Dashboard", id: "dashboard", icon: LayoutDashboard, href: "/" },
    { label: "Gift Store", id: "gifts", icon: Gift, href: "/giftsPage" },
    { label: "Scheduled", id: "scheduled", icon: Calendar, href: "/schedule" },
    { label: "Wallet", id: "wallet", icon: Wallet, href: "/wallet" },
  ];

  // Initialize state
  const [balance, setBalance] = useState(0);
  const [scheduledGifts, setScheduledGifts] = useState([]);
  const [recentGifts, setRecentGifts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Quick action functions
  const handleBrowseGifts = () => router.push('/GiftsPage');
  const handleViewScheduled = () => router.push('/schedule');
  const handleViewWallet = () => router.push('/wallet');
  const handleAddMoney = () => router.push('/wallet?tab=add-money');

  // Extract user email
  const userEmail = session?.user?.email;

  // Fetch dashboard data with timeout protection
  const fetchDashboardData = useCallback(async () => {
  if (!userEmail) {
    console.log("No user email, skipping fetch");
    return;
  }
  
  console.log("Starting dashboard fetch for:", userEmail);
  setLoading(true);
  setFetchError(false);
  
  try {
    // Test each API endpoint individually
    console.time("API Fetch Total");
    
    // 1. Test wallet API
    console.time("Wallet API");
    let walletData = { success: false, balance: 0, transactions: [] };
    try {
      const walletRes = await fetch("/api/wallet/balance");
      console.log("Wallet API response status:", walletRes.status);
      if (walletRes.ok) {
        walletData = await walletRes.json();
        console.log("Wallet API success:", walletData.success);
      } else {
        console.log("Wallet API failed with status:", walletRes.status);
      }
    } catch (walletErr) {
      console.error("Wallet API error:", walletErr);
    }
    console.timeEnd("Wallet API");
    
    // 2. Test scheduled gifts API
    console.time("Scheduled Gifts API");
    let scheduledData = { success: false, gifts: [] };
    try {
      const scheduledRes = await fetch(`/api/scheduled-gifts?email=${userEmail}`);
      console.log("Scheduled API response status:", scheduledRes.status);
      if (scheduledRes.ok) {
        scheduledData = await scheduledRes.json();
        console.log("Scheduled API success:", scheduledData.success);
      } else {
        console.log("Scheduled API failed with status:", scheduledRes.status);
      }
    } catch (scheduledErr) {
      console.error("Scheduled API error:", scheduledErr);
    }
    console.timeEnd("Scheduled Gifts API");
    
    // 3. Test user API (optional - don't block on this)
    console.time("User API");
    let userData = { success: false, user: { isNewUser: false } };
    try {
      const userRes = await fetch("/api/users/get-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail }),
      });
      console.log("User API response status:", userRes?.status);
      if (userRes?.ok) {
        userData = await userRes.json();
        console.log("User API success:", userData.success);
      }
    } catch (userErr) {
      console.log("User API non-critical error:", userErr.message);
    }
    console.timeEnd("User API");
    
    console.timeEnd("API Fetch Total");
    
    // Always set data even if APIs fail
    setBalance(walletData.balance ?? 0);
    setRecentGifts(walletData.transactions?.slice(0, 5) ?? []);
    setScheduledGifts(scheduledData.gifts?.slice(0, 3) ?? []);
    setIsNewUser(userData.user?.isNewUser || false);
    
    console.log("Dashboard data set successfully");
    
  } catch (err) {
    console.error("Dashboard fetch error:", err);
    setFetchError(true);
    // Set safe defaults
    setBalance(0);
    setRecentGifts([]);
    setScheduledGifts([]);
  } finally {
    console.log("Setting loading to false");
    setLoading(false);
  }
}, [userEmail]);
  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      router.push("/login");
      return;
    }
    
    // Fetch data initially
    fetchDashboardData();
    
    // Set up polling every 3 minutes
    const interval = setInterval(fetchDashboardData, 180000);
    
    return () => clearInterval(interval);
  }, [status, session, router, fetchDashboardData]);

  // Format currency
  const formatCurrency = (amount) => {
    return `₦${amount?.toLocaleString() || '0'}`;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: diffDays > 365 ? 'numeric' : undefined
    });
  };

  // Get transaction icon
  const getTransactionIcon = (transaction) => {
    const isCredit = transaction.amount > 0;
    const isFailed = transaction.status === 'failed';
    const isPending = transaction.status === 'pending';
    
    if (isFailed) return <XCircle className="w-5 h-5 text-red-600" />;
    if (isPending) return <AlertCircle className="w-5 h-5 text-yellow-600" />;
    if (transaction.category === 'gift') {
      return <Gift className="w-5 h-5 text-green-600" />;
    }
    return isCredit ? <ArrowDownLeft className="w-5 h-5 text-green-600" /> : <ArrowUpRight className="w-5 h-5 text-red-600" />;
  };

  // Show error state
  if (fetchError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-6">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Unable to Load Dashboard</h2>
          <p className="text-gray-600 mb-6">
            We encountered an error loading your dashboard data. Please try again.
          </p>
          <button
            onClick={() => {
              setFetchError(false);
              fetchDashboardData();
            }}
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            Retry
          </button>
          <button
            onClick={() => {
              setFetchError(false);
              setLoading(false);
            }}
            className="ml-3 bg-white text-green-600 border border-green-200 px-6 py-3 rounded-lg font-medium hover:bg-green-50 transition-colors"
          >
            Continue Anyway
          </button>
        </div>
      </div>
    );
  }

  // Show loading state
  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your dashboard...</p>
          {loadingTimeout && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg max-w-md">
              <p className="text-sm text-yellow-800">
                Taking longer than expected.{" "}
                <button
                  onClick={() => {
                    setLoading(false);
                    setLoadingTimeout(false);
                  }}
                  className="text-green-600 underline hover:text-green-800"
                >
                  Show dashboard anyway
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Main return - rest of your component remains the same
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 md:hidden" onClick={() => setMobileMenuOpen(false)}>
          <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center">
                    <Gift className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-800">GiftPocket</h1>
                    <p className="text-xs text-gray-500">Fintech Gifting</p>
                  </div>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
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
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                    className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm transition-all duration-200 text-gray-600 hover:bg-green-50 hover:text-green-700"
                  >
                    <item.icon className="w-4.5 h-4.5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                ))}
              </nav>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 text-white flex items-center justify-center font-semibold">
                  {session?.user?.name?.charAt(0)?.toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{session?.user?.name}</p>
                  <p className="text-xs text-gray-500 truncate">{session?.user?.email}</p>
                </div>
              </div>
              <button
                onClick={() => signOut()}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-colors text-sm"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:z-50 md:w-64 md:bg-white md:border-r md:shadow-lg md:flex md:flex-col">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center">
              <Gift className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">GiftPocket</h1>
              <p className="text-xs text-gray-500">Fintech Gifting</p>
            </div>
          </div>
        </div>
        <div className="px-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-gray-800 pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => router.push(item.href)}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm transition-all duration-200 text-gray-600 hover:bg-green-50 hover:text-green-700 hover:shadow-sm group"
            >
              <item.icon className="w-4.5 h-4.5 transition-transform group-hover:scale-110" />
              <span className="font-medium">{item.label}</span>
              <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}
        </nav>
        <div className="mt-auto p-6 border-t">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 text-white flex items-center justify-center font-semibold">
              {session?.user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">{session?.user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{session?.user?.email}</p>
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <MoreVertical className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          <button
            onClick={() => signOut()}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-colors text-sm"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="md:ml-64">
        {/* Top Header with Mobile Menu Button */}
        <header className="sticky top-0 z-40 bg-white border-b px-4 py-3 md:px-6 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-lg md:text-xl font-bold text-gray-800">
                  {isNewUser ? (
                    <>Welcome, {session?.user?.name?.split(" ")[0]}! 🎉</>
                  ) : (
                    <>Welcome back, {session?.user?.name?.split(" ")[0]}! 👋</>
                  )}
                </h1>
                <p className="text-xs md:text-sm text-gray-600">
                  {isNewUser ? "Let's start your gifting journey" : "Here's your financial overview"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              <button className="p-2 hover:bg-gray-100 rounded-lg md:rounded-xl transition-colors">
                <Bell className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg md:rounded-xl transition-colors">
                <Settings className="w-5 h-5 text-gray-600" />
              </button>
              <div className="hidden sm:block">
                <div className="text-right">
                  <p className="text-xs md:text-sm text-gray-600">Account Status</p>
                  <div className="flex items-center gap-1 md:gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs md:text-sm font-medium text-gray-800">Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="p-4 md:p-6">
          {/* Stats Overview - Responsive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {/* Balance Card */}
            <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <div>
                  <p className="text-xs md:text-sm text-gray-600">Total Balance</p>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800">
                      {showBalance ? formatCurrency(balance) : '******'}
                    </h2>
                    <button
                      onClick={() => setShowBalance(!showBalance)}
                      className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      {showBalance ? <EyeOff className="w-4 h-4 text-gray-500" /> : <Eye className="w-4 h-4 text-gray-500" />}
                    </button>
                  </div>
                </div>
                <div className="w-10 h-10 md:w-12 md:h-12 bg-green-50 rounded-lg md:rounded-xl flex items-center justify-center">
                  <Wallet className="w-5 md:w-6 h-5 md:h-6 text-green-600" />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAddMoney}
                  className="flex-1 bg-green-600 text-white px-3 md:px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors text-xs md:text-sm"
                >
                  Top Up
                </button>
                <button
                  onClick={handleViewWallet}
                  className="flex-1 bg-white text-green-600 border border-green-200 px-3 md:px-4 py-2 rounded-lg font-medium hover:bg-green-50 transition-colors text-xs md:text-sm"
                >
                  Details
                </button>
              </div>
            </div>

            {/* Scheduled Gifts Card */}
            <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <div>
                  <p className="text-xs md:text-sm text-gray-600">Scheduled Gifts</p>
                  <h2 className="text-xl md:text-2xl font-bold text-gray-800">{scheduledGifts.length}</h2>
                </div>
                <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-50 rounded-lg md:rounded-xl flex items-center justify-center">
                  <Calendar className="w-5 md:w-6 h-5 md:h-6 text-emerald-600" />
                </div>
              </div>
              <button
                onClick={handleViewScheduled}
                className="w-full bg-emerald-50 text-emerald-600 px-3 md:px-4 py-2 rounded-lg font-medium hover:bg-emerald-100 transition-colors text-xs md:text-sm flex items-center justify-center gap-1 md:gap-2"
              >
                View All <ChevronRight className="w-3 md:w-4 h-3 md:h-4" />
              </button>
            </div>

            {/* Recent Activity Card */}
            <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm sm:col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <div>
                  <p className="text-xs md:text-sm text-gray-600">Recent Activity</p>
                  <h2 className="text-xl md:text-2xl font-bold text-gray-800">{recentGifts.length}</h2>
                </div>
                <div className="w-10 h-10 md:w-12 md:h-12 bg-teal-50 rounded-lg md:rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 md:w-6 h-5 md:h-6 text-teal-600" />
                </div>
              </div>
              <button
                onClick={handleViewWallet}
                className="w-full bg-teal-50 text-teal-600 px-3 md:px-4 py-2 rounded-lg font-medium hover:bg-teal-100 transition-colors text-xs md:text-sm flex items-center justify-center gap-1 md:gap-2"
              >
                View Transactions <ChevronRight className="w-3 md:w-4 h-3 md:h-4" />
              </button>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-4 md:space-y-6">
              {/* Welcome Banner for New Users */}
              {isNewUser && (
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl md:rounded-2xl p-4 md:p-6 text-white">
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="w-12 h-12 md:w-14 md:h-14 bg-white/20 backdrop-blur-sm rounded-lg md:rounded-xl flex items-center justify-center">
                      <Sparkles className="w-6 md:w-7 h-6 md:h-7" />
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                      <h3 className="font-bold text-base md:text-lg mb-1">Welcome to GiftPocket!</h3>
                      <p className="text-white/90 text-xs md:text-sm mb-3">
                        Start your gifting journey by funding your wallet and exploring gifts.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
                        <button
                          onClick={handleAddMoney}
                          className="bg-white text-green-600 px-3 md:px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors text-xs md:text-sm"
                        >
                          Add Money First
                        </button>
                        <button
                          onClick={handleBrowseGifts}
                          className="bg-white/20 text-white border border-white/30 px-3 md:px-4 py-2 rounded-lg font-medium hover:bg-white/30 transition-colors text-xs md:text-sm"
                        >
                          Browse Gifts
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Recent Transactions */}
              <div className="bg-white rounded-xl md:rounded-2xl shadow-sm">
                <div className="p-4 md:p-6 border-b">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-base md:text-lg font-semibold text-gray-800">Recent Transactions</h3>
                      <p className="text-xs md:text-sm text-gray-500 mt-1">Latest wallet activities</p>
                    </div>
                    <button
                      onClick={handleViewWallet}
                      className="text-green-600 text-xs md:text-sm font-medium hover:text-green-700 flex items-center gap-1"
                    >
                      View All <ChevronRight className="w-3 md:w-4 h-3 md:h-4" />
                    </button>
                  </div>
                </div>
                <div className="p-4 md:p-6">
                  {recentGifts.length > 0 ? (
                    <div className="space-y-3 md:space-y-4">
                      {recentGifts.map((transaction, index) => (
                        <div
                          key={transaction.id || index}
                          onClick={() => router.push('/wallet')}
                          className="flex items-center justify-between p-3 md:p-4 hover:bg-gray-50 rounded-lg md:rounded-xl transition-all duration-200 cursor-pointer border border-gray-100 hover:border-gray-200 hover:shadow-sm"
                        >
                          <div className="flex items-center gap-3 md:gap-4">
                            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center ${
                              transaction.status === 'failed' ? 'bg-red-50' :
                              transaction.amount > 0 ? 'bg-green-50' : 'bg-emerald-50'
                            }`}>
                              {getTransactionIcon(transaction)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2 mb-1">
                                <p className="font-medium text-gray-800 truncate text-sm md:text-base">
                                  {transaction.description || "Transaction"}
                                </p>
                                {transaction.status && (
                                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                    transaction.status === 'failed' ? 'bg-red-100 text-red-700' :
                                    transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-green-100 text-green-700'
                                  }`}>
                                    {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                <span>{formatDate(transaction.date)}</span>
                                {transaction.reference && (
                                  <span className="font-mono truncate max-w-20 md:max-w-25">
                                    Ref: {transaction.reference.substring(0, 6)}...
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <div className={`text-base md:text-lg font-semibold ${
                              transaction.status === 'failed' ? 'text-red-600' :
                              transaction.amount > 0 ? 'text-green-600' : 'text-gray-800'
                            }`}>
                              {transaction.amount > 0 ? '+' : ''}{formatCurrency(Math.abs(transaction.amount || 0))}
                            </div>
                            <div className="text-xs text-gray-500">
                              {transaction.amount > 0 ? "Credit" : "Debit"}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 md:py-12">
                      <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-gray-100 rounded-full mb-3 md:mb-4">
                        <Clock className="w-6 md:w-8 h-6 md:h-8 text-gray-400" />
                      </div>
                      <h3 className="text-base md:text-lg font-medium text-gray-700 mb-2">No transactions yet</h3>
                      <p className="text-gray-500 text-xs md:text-sm mb-4 md:mb-6 max-w-md mx-auto">
                        Your transaction history will appear here once you start using GiftPocket
                      </p>
                      <button
                        onClick={handleAddMoney}
                        className="inline-flex items-center gap-2 px-3 md:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs md:text-sm"
                      >
                        <Plus className="w-4 h-4" />
                        Make your first transaction
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4 md:space-y-6">
              {/* Quick Actions */}
              <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm">
                <h3 className="font-semibold text-gray-800 mb-3 md:mb-4 text-base md:text-lg">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-2 md:gap-3">
                  <ActionCard
                    label="Add Money"
                    icon={<Plus className="w-4 md:w-5 h-4 md:h-5" />}
                    onClick={handleAddMoney}
                    color="green"
                    description="Top up wallet"
                  />
                  <ActionCard
                    label="Send Gift"
                    icon={<Gift className="w-4 md:w-5 h-4 md:h-5" />}
                    onClick={handleBrowseGifts}
                    color="emerald"
                    description="Browse gifts"
                  />
                  <ActionCard
                    label="Schedule"
                    icon={<Calendar className="w-4 md:w-5 h-4 md:h-5" />}
                    onClick={handleViewScheduled}
                    color="teal"
                    description="Plan delivery"
                  />
                  <ActionCard
                    label="Wallet"
                    icon={<Wallet className="w-4 md:w-5 h-4 md:h-5" />}
                    onClick={handleViewWallet}
                    color="lime"
                    description="View details"
                  />
                </div>
              </div>

              {/* Scheduled Gifts */}
              <div className="bg-white rounded-xl md:rounded-2xl shadow-sm">
                <div className="p-4 md:p-6 border-b">
                  <div className="flex items-center justify-between mb-3 md:mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-800 text-base md:text-lg">Upcoming Deliveries</h3>
                      <p className="text-xs md:text-sm text-gray-500 mt-1">Next scheduled gifts</p>
                    </div>
                    <button
                      onClick={handleViewScheduled}
                      className="text-green-600 text-xs md:text-sm font-medium hover:text-green-700"
                    >
                      View All
                    </button>
                  </div>
                </div>
                <div className="p-4 md:p-6">
                  {scheduledGifts.length > 0 ? (
                    <div className="space-y-3 md:space-y-4">
                      {scheduledGifts.map((gift, index) => (
                        <div
                          key={gift.id || index}
                          onClick={() => router.push('/schedule')}
                          className="flex items-center justify-between p-3 md:p-4 hover:bg-gray-50 rounded-lg md:rounded-xl transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 md:w-10 md:h-10 bg-green-100 rounded-lg flex items-center justify-center">
                              <Gift className="w-3 md:w-4 h-3 md:h-4 text-green-600" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-gray-800 text-sm md:text-base truncate">{gift.person || "Recipient"}</p>
                              <p className="text-xs md:text-sm text-gray-600 truncate">{gift.gift || "Gift"}</p>
                              <p className="text-xs text-gray-500">
                                {gift.deliveryDate ? new Date(gift.deliveryDate).toLocaleDateString() : "No date"} • {gift.daysUntil ?? "-"} days
                              </p>
                            </div>
                          </div>
                          <div className="text-right min-w17.5 md:min-w-20">
                            <p className="font-semibold text-gray-800 text-sm md:text-base">{formatCurrency(gift.amount || 0)}</p>
                            <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${
                              gift.status === 'scheduled' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {gift.status?.charAt(0).toUpperCase() + gift.status?.slice(1) || "Scheduled"}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 md:py-8">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-3">
                        <Calendar className="w-5 md:w-6 h-5 md:h-6 text-gray-400" />
                      </div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">No scheduled gifts</h4>
                      <p className="text-xs text-gray-500">Schedule gifts for special occasions</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Stats */}
              {balance > 0 && (
                <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl md:rounded-2xl p-4 md:p-6 text-white">
                  <h3 className="font-semibold mb-3 md:mb-4 text-base md:text-lg">Your Stats</h3>
                  <div className="space-y-3 md:space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs md:text-sm opacity-90">Wallet Balance</span>
                      <span className="font-semibold text-sm md:text-base">{formatCurrency(balance)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs md:text-sm opacity-90">Scheduled Gifts</span>
                      <span className="font-semibold text-sm md:text-base">{scheduledGifts.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs md:text-sm opacity-90">Total Transactions</span>
                      <span className="font-semibold text-sm md:text-base">{recentGifts.length}</span>
                    </div>
                  </div>
                  <button
                    onClick={handleViewWallet}
                    className="w-full mt-4 md:mt-6 bg-white/20 text-white px-3 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl font-medium hover:bg-white/30 transition-colors text-xs md:text-sm flex items-center justify-center gap-2"
                  >
                    View Full Report <BarChart3 className="w-3 md:w-4 h-3 md:h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Empty State for New Users */}
          {balance === 0 && !isNewUser && (
            <div className="mt-6 md:mt-8 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 rounded-xl md:rounded-2xl p-4 md:p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-center md:text-left">
                  <h3 className="font-semibold text-gray-800 text-base md:text-lg">Ready to start gifting?</h3>
                  <p className="text-gray-600 text-xs md:text-sm mt-1">Add money to your wallet to send your first gift!</p>
                </div>
                <div className="flex gap-2 md:gap-3">
                  <button
                    onClick={() => router.push('/GiftsPage')}
                    className="bg-white text-green-600 border border-green-200 px-3 md:px-5 py-2 rounded-lg font-medium hover:bg-green-50 transition-colors text-xs md:text-sm"
                  >
                    Browse Gifts
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-lg rounded-t-xl md:hidden border-t z-40">
          <div className="flex justify-around py-3">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => router.push(item.href)}
                className="flex flex-col items-center text-xs text-gray-500 hover:text-green-600 transition-colors"
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