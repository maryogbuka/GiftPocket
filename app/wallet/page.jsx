"use client";
import { useState, useEffect, useMemo, useCallback, useRef } from "react"; // Added useRef
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  Wallet, Plus, History, CreditCard, TrendingUp, ArrowUpRight, ArrowDownLeft, 
  Gift, ShoppingBag, Copy, Check, BanknoteIcon, Smartphone, QrCode, X, Loader2,
  ArrowLeft, Filter, Search, Calendar, MoreVertical, Eye, EyeOff, ChevronDown
} from "lucide-react";

export default function WalletPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [walletLoading, setWalletLoading] = useState(true);
  const [walletId, setWalletId] = useState("");
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState(0);
  const [customAmount, setCustomAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("bank");
  const [copied, setCopied] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [timeFilter, setTimeFilter] = useState("all");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showTransactionDetail, setShowTransactionDetail] = useState(false);

  // Add these state variables
  const [verificationAttempts, setVerificationAttempts] = useState({});
  const [failedTransactions, setFailedTransactions] = useState([]);

  // Add a ref to track if we're mounted
  const isMounted = useRef(true);
  const pollingIntervalRef = useRef(null);

  const presetAmounts = [5000, 10000, 20000, 50000, 100000, 200000];

  const paymentMethods = [
    { id: "bank", name: "Bank Transfer", icon: BanknoteIcon, description: "Transfer to our bank account" },
    { id: "card", name: "Debit/Credit Card", icon: CreditCard, description: "Pay with card securely" },
    { id: "mobile", name: "Mobile Money", icon: Smartphone, description: "Pay with mobile wallet" },
    { id: "qr", name: "QR Code", icon: QrCode, description: "Scan to pay" },
  ];

  const generateTempWalletId = useCallback(() => {
    const prefix = session?.user?.email?.substring(0, 4).toUpperCase() || "USER";
    return `GIFT${prefix}${Date.now().toString().slice(-6)}`;
  }, [session?.user?.email]);

  const fetchWalletData = useCallback(async () => {
    if (!session?.user || !isMounted.current) return;

    try {
      setWalletLoading(true);

      const response = await fetch("/api/wallet/balance");
      if (!response.ok) throw new Error("Failed to fetch wallet data");

      const data = await response.json();

      if (data.success && isMounted.current) {
        setBalance(data.balance || 0);
        setTransactions(data.transactions || []);

        // ONLY set walletId if backend provides it AND it hasn't been set
        if (!walletId && data.walletId) {
          setWalletId(data.walletId);
        }
      }
    } catch (error) {
      console.error("❌ Get wallet error:", error);
    } finally {
      if (isMounted.current) {
        setWalletLoading(false);
        setIsLoading(false);
      }
    }
  }, [session?.user, walletId]);

  // Enhanced verification with retry - wrapped in useCallback
  const verifyPaymentWithRetry = useCallback(async (reference, maxRetries = 3) => {
    const retryDelays = [2000, 5000, 10000]; // 2s, 5s, 10s
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        console.log(`Verification attempt ${attempt + 1} for ${reference}`);
        
        const response = await fetch(`/api/payment/verify/${reference}`, {
          signal: AbortSignal.timeout(15000) // 15 second timeout
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
          // Update local state
          await fetchWalletData();
          
          // Show success message
          alert(`✅ Payment verified! New balance: ₦${data.transaction.newBalance}`);
          
          return { success: true, data };
        } else {
          // Check if we should retry
          if (attempt < maxRetries - 1) {
            const delay = retryDelays[attempt];
            console.log(`Retrying in ${delay}ms...`);
            
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
          
          // Max retries reached
          alert(`❌ Payment verification failed: ${data.error}`);
          
          // Add to failed transactions for manual retry
          setFailedTransactions(prev => [...prev, {
            reference,
            lastAttempt: new Date(),
            error: data.error
          }]);
          
          return { success: false, error: data.error };
        }
        
      } catch (error) {
        console.error(`Verification attempt ${attempt + 1} failed:`, error);
        
        if (attempt < maxRetries - 1) {
          const delay = retryDelays[attempt];
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        alert(`❌ Verification failed after ${maxRetries} attempts`);
        return { success: false, error: error.message };
      }
    }
  }, [fetchWalletData]); // Added fetchWalletData dependency

  // Add manual retry function - wrapped in useCallback
  const retryFailedTransaction = useCallback(async (reference) => {
    alert("⏳ Retrying verification...");
    
    const result = await verifyPaymentWithRetry(reference);
    
    if (result.success) {
      // Remove from failed list
      setFailedTransactions(prev => 
        prev.filter(tx => tx.reference !== reference)
      );
    }
  }, [verifyPaymentWithRetry]); // Added verifyPaymentWithRetry dependency

  // Add periodic verification for pending transactions
  useEffect(() => {
    if (status !== "authenticated") return;
    
    const interval = setInterval(() => {
      // Check for pending transactions
      const pendingTransactions = transactions.filter(
        tx => tx.status === "pending" && tx.reference
      );
      
      pendingTransactions.forEach(async (tx) => {
        console.log(`Checking pending transaction: ${tx.reference}`);
        await verifyPaymentWithRetry(tx.reference, 1); // Single retry
      });
      
    }, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, [transactions, status, verifyPaymentWithRetry]); // Added verifyPaymentWithRetry dependency

  useEffect(() => {
    isMounted.current = true;
    
    return () => {
      isMounted.current = false;
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated" && session?.user && isMounted.current) {
      // Fetch data immediately
      fetchWalletData();

      // Clear any existing interval first
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }

      // Set up polling every 5 minutes instead of 2 minutes
      pollingIntervalRef.current = setInterval(() => {
        if (isMounted.current && document.visibilityState === 'visible') {
          fetchWalletData();
        }
      }, 300000); // 5 minutes in milliseconds

      // Also fetch when user comes back to tab
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible' && isMounted.current) {
          fetchWalletData();
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);

      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }
  }, [router, status, session?.user, fetchWalletData]);

  // Calculate spending stats
  const spendingStats = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];
    
    const categoryTotals = {};
    
    transactions
      .filter(tx => tx.type === "sent" || tx.category)
      .forEach(tx => {
        const category = tx.category || "Other";
        const amount = Math.abs(tx.amount) || 0;
        
        if (!categoryTotals[category]) {
          categoryTotals[category] = 0;
        }
        categoryTotals[category] += amount;
      });
    
    const totalSpent = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);
    
    return Object.entries(categoryTotals).map(([category, amount]) => ({
      category,
      amount,
      percentage: totalSpent > 0 ? (amount / totalSpent) * 100 : 0,
    }));
  }, [transactions]);

  const hasTransactions = transactions && transactions.length > 0;
  const hasSpending = spendingStats && spendingStats.length > 0;

  const handleAddMoney = () => setShowAddMoneyModal(true);
  const handleSendGift = () => router.push("/GiftsPage");

  const handleCopyWalletId = () => {
    if (walletId) {
      navigator.clipboard.writeText(walletId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleAmountSelect = (amount) => {
    setSelectedAmount(amount);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    setCustomAmount(value);
    setSelectedAmount(value ? parseInt(value) : 0);
  };

  // SINGLE handleProceedToPayment function (replacing both duplicates)
  const handleProceedToPayment = async () => {
    const amount = selectedAmount;
    if (amount < 100) {
      alert("Minimum amount is ₦100");
      return;
    }

    setIsProcessingPayment(true);

    try {
      const response = await fetch("/api/wallet/add-money", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, paymentMethod }),
      });
      
      const data = await response.json();

      if (!data.success) {
        alert(`Payment failed: ${data.error || "Unknown error"}`);
        return;
      }

      // Show processing message
      alert("⏳ Processing payment... Please wait.");

      // Start verification with retry (using the new function)
      const verificationResult = await verifyPaymentWithRetry(data.data.reference);
      
      if (verificationResult.success) {
        alert("✅ Payment successful! Wallet updated.");
        
        // Update local state immediately
        setBalance(prev => prev + amount);
        setTransactions(prev => [
          {
            id: Date.now(),
            type: "credit",
            amount,
            description: `Wallet Top-up via ${paymentMethods.find((m) => m.id === paymentMethod)?.name}`,
            date: new Date().toISOString(),
            category: "topup",
            status: "completed",
            reference: data.data.reference
          },
          ...prev,
        ]);
      } else {
        alert("❌ Payment failed or pending verification.");
        
        // Add to pending transactions
        setTransactions(prev => [
          {
            id: Date.now(),
            type: "pending",
            amount,
            description: `Pending top-up via ${paymentMethods.find((m) => m.id === paymentMethod)?.name}`,
            date: new Date().toISOString(),
            category: "topup",
            status: "pending",
            reference: data.data.reference
          },
          ...prev,
        ]);
      }

      setShowAddMoneyModal(false);
      setSelectedAmount(0);
      setCustomAmount("");
      
    } catch (error) {
      console.error("Payment initiation error:", error);
      alert("Network error. Please check your connection.");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const renderPaymentMethodContent = () => {
    switch (paymentMethod) {
      case "bank":
        return (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-700">Account Name</span>
                <span className="font-semibold text-gray-500">GiftPocket Limited</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-700">Account Number</span>
                <span className="font-semibold text-gray-500">0123456789</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-700">Bank Name</span>
                <span className="font-semibold text-gray-500">GiftPocket Bank</span>
              </div>
            </div>
            <div className="bg-[#1EB53A]/10 border border-[#1EB53A]/20 rounded-xl p-4">
              <p className="text-sm text-[#1EB53A] font-medium mb-2">Important Instructions:</p>
              <ul className="text-xs text-[#1EB53A] space-y-1">
                <li>• Use your Wallet ID as payment reference</li>
                <li>• Transfers usually reflect within 24 hours</li>
                <li>• Contact support if funds don&apos;t reflect</li>
              </ul>
            </div>
          </div>
        );

      case "card":
        return (
          <div className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                <input 
                  type="text" 
                  placeholder="1234 5678 9012 3456" 
                  className="w-full text-gray-500 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1EB53A]" 
                  disabled={isProcessingPayment} 
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                  <input 
                    type="text" 
                    placeholder="MM/YY" 
                    className="w-full text-gray-500 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1EB53A]" 
                    disabled={isProcessingPayment} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                  <input 
                    type="text" 
                    placeholder="123" 
                    className="w-full text-gray-500 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1EB53A]" 
                    disabled={isProcessingPayment} 
                  />
                </div>
              </div>
            </div>
            <div className="bg-[#1EB53A]/10 rounded-xl p-3">
              <p className="text-xs text-[#1EB53A]">Card payments are secured with SSL encryption</p>
            </div>
          </div>
        );

      case "mobile":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
              <input 
                type="tel" 
                placeholder="0800 000 0000" 
                className="w-full text-gray-500 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1EB53A]" 
                disabled={isProcessingPayment} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
              <select 
                className="w-full text-gray-500 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1EB53A]" 
                disabled={isProcessingPayment}
              >
                <option>MTN Mobile Money</option>
                <option>Airtel Money</option>
                <option>Glo Cash</option>
                <option>9Mobile Paga</option>
              </select>
            </div>
          </div>
        );

      case "qr":
        return (
          <div className="text-center space-y-4">
            <div className="bg-white p-6 rounded-xl inline-block">
              <div className="w-48 h-48 bg-gray-100 rounded flex items-center justify-center">
                <QrCode className="w-24 h-24 text-gray-400" />
              </div>
            </div>
            <p className="text-sm text-gray-600">Scan this QR code with your banking app to pay</p>
          </div>
        );

      default:
        return null;
    }
  };

  // Enhanced transaction rendering
  const renderTransactionItem = (tx) => {
    const isDebit = tx.type === "sent" || tx.amount < 0;
    const isCredit = tx.type === "received" || tx.type === "credit";
    const isFailed = tx.status === "failed";
    const isPending = tx.status === "pending";

    // Determine transaction icon
    const getTransactionIcon = () => {
      if (isFailed) return <X className="w-5 h-5 text-red-600" />;
      if (isPending) return <Loader2 className="w-5 h-5 text-yellow-600 animate-spin" />;
      
      switch(tx.category) {
        case "gift":
          return <Gift className="w-5 h-5 text-[#1EB53A]" />;
        case "topup":
          return <ArrowDownLeft className="w-5 h-5 text-[#1EB53A]" />;
        case "transfer":
          return <ArrowUpRight className="w-5 h-5 text-red-600" />;
        case "payment":
          return <CreditCard className="w-5 h-5 text-blue-600" />;
        default:
          return isDebit ? 
            <ArrowUpRight className="w-5 h-5 text-red-600" /> : 
            <ArrowDownLeft className="w-5 h-5 text-[#1EB53A]" />;
      }
    };

    // Get background color based on status
    const getIconBgColor = () => {
      if (isFailed) return "bg-red-50";
      if (isPending) return "bg-yellow-50";
      if (isCredit) return "bg-[#1EB53A]/10";
      return "bg-red-50";
    };

    // Format date
    const formatDate = (dateString) => {
      try {
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
      } catch (error) {
        return dateString;
      }
    };

    // Get status badge
    const getStatusBadge = () => {
      if (isFailed) return "bg-red-100 text-red-700";
      if (isPending) return "bg-yellow-100 text-yellow-700";
      return "bg-[#1EB53A]/10 text-[#1EB53A]";
    };

    // Get status text
    const getStatusText = () => {
      if (isFailed) return "Failed";
      if (isPending) return "Pending";
      return "Completed";
    };

    return (
      <div 
        key={tx.id || tx._id}
        onClick={() => {
          setSelectedTransaction(tx);
          setShowTransactionDetail(true);
        }}
        className="group flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-all duration-200 cursor-pointer border border-gray-100 hover:border-gray-200 hover:shadow-sm"
      >
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getIconBgColor()}`}>
            {getTransactionIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-medium text-gray-800 truncate">
                {tx.description || "Transaction"}
              </p>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge()}`}>
                {getStatusText()}
              </span>
            </div>
            
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDate(tx.date || tx.createdAt)}
              </span>
              {tx.reference && (
                <span className="font-mono truncate max-w-25">Ref: {tx.reference.substring(0, 8)}...</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          <div className={`text-lg font-semibold ${isFailed ? 'text-red-600' : isDebit ? 'text-gray-800' : 'text-[#1EB53A]'}`}>
            {isDebit ? '-' : '+'}₦{Math.abs(tx.amount || 0).toLocaleString()}
          </div>
          
          <div className="text-xs text-gray-500">
            {isDebit ? "Debit" : "Credit"}
          </div>
          
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      </div>
    );
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-6">
        <Loader2 className="w-8 h-8 text-[#1EB53A] animate-spin" />
        <span className="ml-3 text-gray-500 font-medium">Loading your wallet...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-4 md:p-6">
      {/* Add Money Modal */}
      {showAddMoneyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 rounded-t-2xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">Add Money to Wallet</h2>
                <button 
                  onClick={() => !isProcessingPayment && setShowAddMoneyModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
                  disabled={isProcessingPayment}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <p className="text-sm font-medium text-gray-700 mb-1">Your Wallet ID</p>
                <div className="flex items-center justify-between">
                  <code className="font-mono text-lg font-bold text-[#1EB53A]">{walletId}</code>
                  <button
                    onClick={handleCopyWalletId}
                    className="flex items-center gap-2 px-3 py-1 bg-[#1EB53A]/10 text-[#1EB53A] rounded-lg hover:bg-[#1EB53A]/20 transition-colors text-sm disabled:opacity-50"
                    disabled={isProcessingPayment}
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">Use this ID as payment reference</p>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Select Amount</h3>
                <div className="grid grid-cols-3 gap-3">
                  {presetAmounts.map((amount) => (
                    <button
                      key={amount}
                      onClick={() => handleAmountSelect(amount)}
                      disabled={isProcessingPayment}
                      className={`p-3 rounded-xl border text-gray-500 transition-all disabled:opacity-50 ${
                        selectedAmount === amount 
                          ? 'border-[#1EB53A] bg-[#1EB53A]/10 text-[#1EB53A] font-semibold' 
                          : 'border-gray-200 hover:border-[#1EB53A]/50'
                      }`}
                    >
                      ₦{amount.toLocaleString()}
                    </button>
                  ))}
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Custom Amount</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₦</span>
                    <input
                      type="text"
                      value={customAmount}
                      onChange={handleCustomAmountChange}
                      placeholder="Enter amount"
                      className="w-full text-gray-500 pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1EB53A] focus:border-transparent disabled:opacity-50"
                      disabled={isProcessingPayment}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Payment Method</h3>
                <div className="grid grid-cols-2 gap-3">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => !isProcessingPayment && setPaymentMethod(method.id)}
                      disabled={isProcessingPayment}
                      className={`p-4 rounded-xl border transition-all text-left disabled:opacity-50 ${
                        paymentMethod === method.id 
                          ? 'border-[#1EB53A] bg-[#1EB53A]/10' 
                          : 'border-gray-200 hover:border-[#1EB53A]/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          paymentMethod === method.id ? 'bg-[#1EB53A]/20' : 'bg-gray-100'
                        }`}>
                          <method.icon className={`w-5 h-5 ${
                            paymentMethod === method.id ? 'text-[#1EB53A]' : 'text-gray-600'
                          }`} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{method.name}</p>
                          <p className="text-xs text-gray-500">{method.description}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Payment Details</h3>
                {renderPaymentMethodContent()}
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t p-6 rounded-b-2xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-600">Amount to add</p>
                  <p className="text-2xl font-bold text-gray-800">₦{selectedAmount.toLocaleString()}</p>
                </div>
                <button
                  onClick={handleProceedToPayment}
                  disabled={selectedAmount < 100 || isProcessingPayment}
                  className={`px-8 py-3 rounded-xl font-semibold transition-colors flex items-center gap-2 ${
                    selectedAmount >= 100 && !isProcessingPayment
                      ? 'bg-[#1EB53A] text-white hover:bg-[#189531]'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isProcessingPayment ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Proceed to Pay'
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 text-center">
                By proceeding, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Detail Modal */}
      {showTransactionDetail && selectedTransaction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Transaction Details</h3>
                <button
                  onClick={() => setShowTransactionDetail(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="text-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                  selectedTransaction.type === "sent" || selectedTransaction.amount < 0
                    ? "bg-red-50"
                    : "bg-[#1EB53A]/10"
                }`}>
                  {selectedTransaction.type === "sent" || selectedTransaction.amount < 0
                    ? <ArrowUpRight className="w-8 h-8 text-red-600" />
                    : <ArrowDownLeft className="w-8 h-8 text-[#1EB53A]" />
                  }
                </div>
                <p className="text-2xl font-bold text-gray-800 mb-2">
                  {selectedTransaction.type === "sent" || selectedTransaction.amount < 0 ? "-" : "+"}
                  ₦{Math.abs(selectedTransaction.amount || 0).toLocaleString()}
                </p>
                <p className="text-gray-600">{selectedTransaction.description}</p>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedTransaction.status === "failed" 
                      ? "bg-red-100 text-red-700"
                      : selectedTransaction.status === "pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-[#1EB53A]/10 text-[#1EB53A]"
                  }`}>
                    {selectedTransaction.status?.charAt(0).toUpperCase() + selectedTransaction.status?.slice(1)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Date</span>
                  <span className="font-medium text-gray-800">
                    {new Date(selectedTransaction.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Time</span>
                  <span className="font-medium text-gray-800">
                    {new Date(selectedTransaction.date).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                
                {selectedTransaction.reference && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Reference</span>
                    <span className="font-mono text-sm">{selectedTransaction.reference}</span>
                  </div>
                )}
              </div>
              
              <div className="pt-4 border-t">
                <button
                  onClick={() => setShowTransactionDetail(false)}
                  className="w-full py-3 bg-[#1EB53A] text-white rounded-xl font-medium hover:bg-[#189531] transition-colors"
                >
                  Close Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <div className="mb-4">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-[#1EB53A] font-medium hover:text-[#189531] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </button>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Wallet</h1>
            <p className="text-gray-600">Manage your gift budget and transactions</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:block bg-white px-4 py-2 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600">Wallet ID</p>
              <div className="flex items-center gap-2">
                <code className="font-mono font-medium truncate max-w-30">{walletId || "Loading..."}</code>
                <button
                  onClick={handleCopyWalletId}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                  title="Copy Wallet ID"
                  disabled={!walletId}
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-[#1EB53A]" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-500" />
                  )}
                </button>
              </div>
            </div>
            <button 
              onClick={handleAddMoney}
              className="flex items-center gap-2 px-4 py-2 bg-[#1EB53A] text-white rounded-lg hover:bg-[#189531] transition-colors disabled:opacity-50"
              disabled={walletLoading}
            >
              {walletLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              {walletLoading ? "Loading..." : "Add Money"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Wallet Card */}
            <div className="bg-[#1EB53A] text-white rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <p className="text-sm opacity-90 mb-1">Available Balance</p>
                  <div className="flex items-center gap-3">
                    <h2 className="text-3xl sm:text-4xl font-bold">
                      {walletLoading ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-6 h-6 animate-spin" />
                          Loading...
                        </div>
                      ) : (
                        showBalance ? `₦${balance.toLocaleString()}` : '******'
                      )}
                    </h2>
                    <button
                      onClick={() => setShowBalance(!showBalance)}
                      className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    >
                      {showBalance ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    <p className="text-sm opacity-80">Active • GiftPocket Wallet</p>
                  </div>
                </div>
                
                <div className="hidden sm:block text-center">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-2 mx-auto">
                    <Wallet className="w-7 h-7" />
                  </div>
                  <p className="text-xs opacity-90">Virtual Wallet</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={handleAddMoney}
                  disabled={walletLoading}
                  className="flex-1 bg-white text-[#1EB53A] px-4 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all hover:scale-[1.02] disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
                >
                  {walletLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      {balance === 0 ? "Add Money" : "Top Up"}
                    </>
                  )}
                </button>
                <button 
                  onClick={handleSendGift}
                  disabled={balance === 0 || walletLoading}
                  className="flex-1 bg-white/20 text-white px-4 py-3 rounded-xl font-semibold hover:bg-white/30 transition-all hover:scale-[1.02] disabled:opacity-50 flex items-center justify-center gap-2 backdrop-blur-sm"
                >
                  <Gift className="w-5 h-5" />
                  Send Gift
                </button>
              </div>
            </div>

            {/* Transactions Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
              <div className="p-6 border-b">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Recent Transactions</h3>
                    <p className="text-sm text-gray-500 mt-1">All your wallet activities</p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1EB53A] focus:border-transparent text-sm w-full sm:w-48"
                      />
                    </div>
                    
                    <button
                      onClick={() => setShowFilterModal(true)}
                      className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                    >
                      <Filter className="w-4 h-4" />
                      Filter
                    </button>
                  </div>
                </div>
                
                <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                  {['All', 'Today', 'Week', 'Month', 'Credit', 'Debit'].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setTimeFilter(filter.toLowerCase())}
                      className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
                        timeFilter === filter.toLowerCase()
                          ? 'bg-[#1EB53A] text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6">
                {walletLoading ? (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-[#1EB53A]/10 rounded-full mb-4">
                      <Loader2 className="w-8 h-8 text-[#1EB53A] animate-spin" />
                    </div>
                    <p className="text-gray-500 font-medium">Loading transactions...</p>
                    <p className="text-sm text-gray-400 mt-1">Fetching your latest activities</p>
                  </div>
                ) : hasTransactions ? (
                  <div className="space-y-3">
                    {transactions
                      .filter(tx => {
                        if (searchQuery) {
                          return tx.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                 tx.reference?.toLowerCase().includes(searchQuery.toLowerCase());
                        }
                        return true;
                      })
                      .filter(tx => {
                        if (timeFilter === 'credit') return !(tx.type === "sent" || tx.amount < 0);
                        if (timeFilter === 'debit') return tx.type === "sent" || tx.amount < 0;
                        return true;
                      })
                      .slice(0, 10)
                      .map(renderTransactionItem)}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                      <History className="w-8 h-8 text-gray-400" />
                    </div>
                    <h4 className="text-lg font-medium text-gray-700 mb-2">No transactions yet</h4>
                    <p className="text-gray-500 mb-6">Your transaction history will appear here</p>
                    <button
                      onClick={handleAddMoney}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[#1EB53A] text-white rounded-lg hover:bg-[#189531] transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Make your first transaction
                    </button>
                  </div>
                )}
                
                {hasTransactions && (
                  <div className="mt-6 pt-6 border-t">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-sm text-gray-600 mb-1">Total Credits</p>
                        <p className="text-xl font-bold text-[#1EB53A]">
                          ₦{transactions
                            .filter(tx => !(tx.type === "sent" || tx.amount < 0))
                            .reduce((sum, tx) => sum + Math.abs(tx.amount || 0), 0)
                            .toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-sm text-gray-600 mb-1">Total Debits</p>
                        <p className="text-xl font-bold text-red-600">
                          ₦{transactions
                            .filter(tx => tx.type === "sent" || tx.amount < 0)
                            .reduce((sum, tx) => sum + Math.abs(tx.amount || 0), 0)
                            .toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-sm text-gray-600 mb-1">Transactions</p>
                        <p className="text-xl font-bold text-gray-800">
                          {transactions.length}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-4">Spending Overview</h3>
              {walletLoading ? (
                <div className="text-center py-4">
                  <Loader2 className="w-6 h-6 text-gray-400 animate-spin mx-auto" />
                </div>
              ) : hasSpending ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">This Month</span>
                    <span className="font-semibold text-red-600">
                      -₦{spendingStats.reduce((sum, stat) => sum + stat.amount, 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Gifts Sent</span>
                    <span className="font-semibold text-gray-800">
                      {transactions.filter(tx => tx.category === "gift").length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Average Gift</span>
                    <span className="font-semibold text-gray-800">
                      ₦{hasTransactions ? Math.round(transactions.reduce((sum, tx) => sum + Math.abs(tx.amount || 0), 0) / transactions.length).toLocaleString() : 0}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <TrendingUp className="w-6 h-6 text-gray-400" />
                  </div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">No spending yet</h4>
                  <p className="text-xs text-gray-500">Send your first gift to see stats</p>
                </div>
              )}
            </div>

            {/* Spending by Category */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-4">Spending by Category</h3>
              {walletLoading ? (
                <div className="text-center py-4">
                  <Loader2 className="w-6 h-6 text-gray-400 animate-spin mx-auto" />
                </div>
              ) : hasSpending ? (
                <div className="space-y-3">
                  {spendingStats.map((stat, index) => (
                    <div key={index}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">{stat.category}</span>
                        <span className="font-medium text-gray-800">₦{stat.amount.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-[#1EB53A] h-2 rounded-full"
                          style={{ width: `${stat.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <ShoppingBag className="w-6 h-6 text-gray-400" />
                  </div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">No category data</h4>
                  <p className="text-xs text-gray-500">Categories will appear after sending gifts</p>
                </div>
              )}
            </div>

            {/* Budget Setting */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-4">Monthly Budget</h3>
              {walletLoading ? (
                <div className="text-center py-4">
                  <Loader2 className="w-6 h-6 text-gray-400 animate-spin mx-auto" />
                </div>
              ) : balance > 0 ? (
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-sm text-gray-600">Budget Limit</span>
                    <span className="font-medium text-gray-800">₦100,000</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-orange-500 h-2 rounded-full"
                      style={{ width: '0%' }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500">₦0 of ₦100,000 spent</p>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CreditCard className="w-6 h-6 text-gray-400" />
                  </div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Set a budget</h4>
                  <p className="text-xs text-gray-500">Add money first to set a budget</p>
                </div>
              )}
            </div>

            {/* Wallet ID Card */}
            <div className="bg-[#1EB53A]/10 border border-[#1EB53A]/20 rounded-2xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-3">Your Wallet ID</h3>
              <div className="bg-white rounded-lg p-4 mb-3">
                <code className="font-mono font-bold text-lg text-[#1EB53A] block text-center mb-2 truncate">
                  {walletId || "Loading..."}
                </code>
                <p className="text-xs text-gray-500 text-center">
                  Use this ID when transferring funds
                </p>
              </div>
              <button
                onClick={handleCopyWalletId}
                disabled={!walletId || walletLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#1EB53A] text-white rounded-lg hover:bg-[#189531] transition-colors text-sm disabled:opacity-50"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Wallet ID Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy Wallet ID
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Empty State CTA */}
        {!walletLoading && balance === 0 && (
          <div className="mt-8 bg-[#1EB53A]/10 border border-[#1EB53A]/20 rounded-2xl p-6">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="mb-4 md:mb-0">
                <h3 className="font-semibold text-gray-800 text-lg">Ready to start gifting?</h3>
                <p className="text-gray-600 text-sm mt-1">Add money to your wallet to send your first gift!</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => router.push('/GiftsPage')}
                  className="bg-white text-[#1EB53A] border border-[#1EB53A]/30 px-5 py-2 rounded-lg font-medium hover:bg-[#1EB53A]/10 transition-colors"
                >
                  Browse Gifts
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}