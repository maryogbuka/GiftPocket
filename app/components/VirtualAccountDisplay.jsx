// app/components/VirtualAccountDisplay.jsx
// Shows user's virtual account details for funding their wallet
"use client";

import { useState, useEffect } from "react";
import { 
  Copy, 
  Banknote, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  ExternalLink,
  Loader2,
  Wallet,
  Info
} from "lucide-react";

export default function VirtualAccountDisplay() {
  // State
  const [accountDetails, setAccountDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [copiedField, setCopiedField] = useState(null);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [lastRefreshed, setLastRefreshed] = useState(null);

  // Fetch account data
  const fetchAccountData = async () => {
    try {
      setIsLoading(true);
      
      const res = await fetch("/api/wallet/virtual-account");
      
      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }
      
      const data = await res.json();
      
      if (data?.success) {
        setAccountDetails(data.account || null);
        setCurrentBalance(data.balance || 0);
      }
      
    } catch (error) {
      console.log("Couldn't fetch account:", error.message);
      // Keep current data if fetch fails
    } finally {
      setIsLoading(false);
      setLastRefreshed(new Date());
    }
  };

  // Create a new virtual account
  const handleCreateAccount = async () => {
    if (isCreating) return;
    
    if (!window.confirm("Create a virtual account for receiving payments?")) {
      return;
    }
    
    setIsCreating(true);
    
    try {
      const res = await fetch("/api/wallet/virtual-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      
      const data = await res.json();
      
      if (data?.success) {
        // Update with new account
        setAccountDetails(data.account);
        alert("Virtual account created! ✅");
        fetchAccountData(); // Refresh all data
      } else {
        alert(data?.error || "Something went wrong");
      }
      
    } catch (error) {
      console.error("Create failed:", error);
      alert("Network error. Try again?");
    } finally {
      setIsCreating(false);
    }
  };

  // Copy text to clipboard
  const handleCopy = (text, fieldName) => {
    if (!text) return;
    
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopiedField(fieldName);
        
        // Reset after 2 seconds
        setTimeout(() => {
          setCopiedField(null);
        }, 2000);
      })
      .catch(err => {
        console.log("Copy failed:", err);
      });
  };

  // Handle balance refresh
  const handleRefresh = async () => {
    await fetchAccountData();
  };

  // Initial load
  useEffect(() => {
    fetchAccountData();
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <div className="animate-pulse space-y-5">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
            <div className="h-6 bg-gray-200 rounded w-32"></div>
          </div>
          <div className="h-24 bg-gray-200 rounded-lg"></div>
          <div className="h-12 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  // No account yet
  if (!accountDetails) {
    return (
      <div className="bg-linear-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Banknote className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Virtual Account</h3>
            <p className="text-sm text-gray-600">Get your own account number</p>
          </div>
        </div>
        
        <div className="space-y-5">
          <p className="text-gray-700">
            Get a unique bank account number that lets people send money directly to your GiftPocket wallet.
          </p>
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-900 mb-2">Why get one?</p>
                <ul className="text-sm text-amber-800 space-y-1.5">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600">•</span>
                    <span>Friends can send you money easily</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600">•</span>
                    <span>Works with any Nigerian bank</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600">•</span>
                    <span>Money arrives in minutes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600">•</span>
                    <span>No monthly fees</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          <button
            onClick={handleCreateAccount}
            disabled={isCreating}
            className={`w-full py-3.5 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
              isCreating
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-purple-600 text-white hover:bg-purple-700 active:scale-[0.99]'
            }`}
          >
            {isCreating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating your account...
              </>
            ) : (
              <>
                <Banknote className="w-5 h-5" />
                Create Virtual Account
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // Account exists - show details
  return (
    <div className="bg-linear-to-br from-green-50 to-emerald-50 border border-green-300 rounded-2xl p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Your Virtual Account</h3>
            <p className="text-sm text-gray-600">For receiving payments</p>
          </div>
        </div>
        
        <button
          onClick={handleRefresh}
          className="p-2 hover:bg-green-100 rounded-lg transition-colors group"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 text-green-600 group-hover:rotate-180 transition-transform ${lastRefreshed ? 'animate-pulse' : ''}`} />
        </button>
      </div>
      
      {/* Current balance */}
      <div className="mb-6 p-4 bg-white border border-green-400 rounded-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Wallet Balance</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              ₦{currentBalance.toLocaleString()}
            </p>
          </div>
          <div className="p-2 bg-green-100 rounded-lg">
            <Wallet className="w-5 h-5 text-green-600" />
          </div>
        </div>
        
        {lastRefreshed && (
          <p className="text-xs text-gray-500 mt-2">
            Updated {lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>
      
      {/* Account details */}
      <div className="space-y-5">
        {/* Account number */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">
              Account Number
            </label>
            <button
              onClick={() => handleCopy(accountDetails.accountNumber, 'accountNumber')}
              className="text-sm text-green-600 hover:text-green-700 flex items-center gap-1"
            >
              {copiedField === 'accountNumber' ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  Copy
                </>
              )}
            </button>
          </div>
          
          <div className="p-4 bg-white border border-green-400 rounded-xl">
            <p className="text-2xl font-bold text-gray-900 font-mono tracking-wider text-center">
              {accountDetails.accountNumber}
            </p>
          </div>
        </div>
        
        {/* Bank details grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Bank Name
            </label>
            <div className="p-3 bg-white border border-gray-300 rounded-lg">
              <p className="text-lg font-semibold text-gray-900">
                {accountDetails.bankName}
              </p>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Account Name
            </label>
            <div className="p-3 bg-white border border-gray-300 rounded-lg">
              <p className="text-lg font-semibold text-gray-900 truncate">
                {accountDetails.accountName}
              </p>
            </div>
          </div>
        </div>
        
        {/* How to use */}
        <div className="mt-4">
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-4 h-4 text-blue-600" />
            <h4 className="font-medium text-blue-900">How to use this account</h4>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <ol className="text-sm text-blue-800 space-y-3">
              <li className="flex items-start gap-3">
                <span className="shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">
                  1
                </span>
                <span>
                  Share the account number with anyone who wants to send you money
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">
                  2
                </span>
                <span>
                  They send money from <strong>any Nigerian bank</strong> to this account
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">
                  3
                </span>
                <span>
                  Money arrives in your wallet within minutes
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">
                  4
                </span>
                <span>
                  Use your wallet balance to send gifts instantly
                </span>
              </li>
            </ol>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4">
          <button
            onClick={() => window.location.href = "/wallet"}
            className="py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
          >
            <Wallet className="w-4 h-4" />
            Go to Wallet
          </button>
          
          <button
            onClick={handleRefresh}
            className="py-3 border-2 border-purple-600 text-purple-600 rounded-lg font-medium hover:bg-purple-50 transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Balance
          </button>
        </div>
      </div>
    </div>
  );
}