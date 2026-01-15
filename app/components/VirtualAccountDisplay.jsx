// app/components/VirtualAccountDisplay.jsx
"use client";
import { useState, useEffect } from "react";
import { Copy, Banknote, CheckCircle, AlertCircle, RefreshCw, ExternalLink } from "lucide-react";

export default function VirtualAccountDisplay() {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [balance, setBalance] = useState(0);

  const fetchVirtualAccount = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/wallet");
      const data = await response.json();
      
      if (data.success) {
        setAccount(data.virtualAccount || null);
        setBalance(data.balance || 0);
      }
    } catch (error) {
      console.error("Failed to fetch virtual account:", error);
    } finally {
      setLoading(false);
    }
  };

  const createVirtualAccount = async () => {
    try {
      setCreating(true);
      const response = await fetch("/api/wallet/create-virtual-account", {
        method: "POST",
      });
      
      const data = await response.json();
      
      if (data.success) {
        setAccount(data.data);
        alert("🎉 Virtual account created successfully!");
        fetchVirtualAccount(); // Refresh data
      } else {
        alert(`Failed: ${data.error}`);
      }
    } catch (error) {
      console.error("Failed to create virtual account:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const refreshBalance = async () => {
    await fetchVirtualAccount();
  };

  useEffect(() => {
    fetchVirtualAccount();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // No virtual account state
  if (!account) {
    return (
      <div className="bg-linear-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Banknote className="w-6 h-6 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-800">Virtual Account</h3>
        </div>
        
        <div className="space-y-4">
          <p className="text-gray-600">
            Get a dedicated bank account number to receive payments directly into your GiftPocket wallet.
          </p>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="text-sm text-yellow-800 font-medium">Benefits</p>
                <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                  <li>• Instant activation - No documents required</li>
                  <li>• Receive payments from any bank in Nigeria</li>
                  <li>• Funds auto-credit to your wallet</li>
                  <li>• No monthly maintenance fees</li>
                </ul>
              </div>
            </div>
          </div>
          
          <button
            onClick={createVirtualAccount}
            disabled={creating}
            className="w-full py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {creating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              <>
                <Banknote className="w-4 h-4" />
                Activate Virtual Account
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // Active virtual account display
  return (
    <div className="bg-linear-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-6 h-6 text-green-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Your Virtual Account</h3>
            <p className="text-sm text-gray-600">Fund your wallet by sending money to this account</p>
          </div>
        </div>
        <button
          onClick={refreshBalance}
          className="p-2 hover:bg-green-100 rounded-lg transition-colors"
          title="Refresh balance"
        >
          <RefreshCw className="w-4 h-4 text-green-600" />
        </button>
      </div>

      {/* Current Balance */}
      <div className="mb-6 p-4 bg-white border border-green-300 rounded-lg">
        <p className="text-sm text-gray-600 mb-1">Current Wallet Balance</p>
        <p className="text-3xl font-bold text-gray-800">₦{balance.toLocaleString()}</p>
      </div>

      <div className="space-y-4">
        {/* Account Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Account Number
          </label>
          <div className="flex items-center justify-between p-4 bg-white border border-green-300 rounded-lg">
            <code className="text-2xl font-mono font-bold text-gray-800 tracking-wider">
              {account.accountNumber}
            </code>
            <div className="flex gap-2">
              <button
                onClick={() => copyToClipboard(account.accountNumber)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-green-600 hover:bg-green-50 rounded-lg border border-green-300 transition-colors"
              >
                {copied ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
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
          </div>
        </div>

        {/* Bank Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bank Name
            </label>
            <div className="p-3 bg-white border border-gray-200 rounded-lg">
              <span className="text-lg font-medium text-gray-800">{account.bankName}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Account Name
            </label>
            <div className="p-3 bg-white border border-gray-200 rounded-lg">
              <span className="text-lg font-medium text-gray-800">{account.accountName}</span>
            </div>
          </div>
        </div>

        {/* Usage Instructions */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
            <ExternalLink className="w-4 h-4" />
            How to Use Your Virtual Account
          </h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li className="flex items-start gap-2">
              <span className="text-blue-600">1.</span>
              <span>Send money from any bank app to the account above</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600">2.</span>
              <span>Use <strong>{account.accountName}</strong> as the account name</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600">3.</span>
              <span>Funds will auto-credit to your wallet within minutes</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600">4.</span>
              <span>Use wallet balance to send gifts instantly</span>
            </li>
          </ul>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
          <button
            onClick={() => window.location.href = "/wallet"}
            className="py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
          >
            View Wallet
          </button>
          <button
            onClick={refreshBalance}
            className="py-3 border-2 border-purple-600 text-purple-600 rounded-lg font-medium hover:bg-purple-50 transition-colors"
          >
            Refresh Balance
          </button>
        </div>
      </div>
    </div>
  );
}