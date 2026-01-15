// app/components/BalanceCard.jsx
"use client";
import { useState, useEffect } from "react";
import { Wallet, TrendingUp, TrendingDown, Plus, Gift } from "lucide-react";

export default function BalanceCard({ onAddFunds }) {
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [recentTransactions, setRecentTransactions] = useState([]);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/wallet");
      const data = await response.json();
      
      if (data.success) {
        setBalance(data.balance || 0);
        setRecentTransactions(data.transactions || []);
      }
    } catch (error) {
      console.error("Failed to fetch wallet data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRecentGiftsCount = () => {
    return recentTransactions.filter(tx => 
      tx.category === "gift" || tx.description?.toLowerCase().includes("gift")
    ).length;
  };

  useEffect(() => {
    fetchWalletData();
    // Refresh every 30 seconds for real-time updates
    const interval = setInterval(fetchWalletData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-10 bg-gray-200 rounded w-1/2"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const recentGiftsCount = getRecentGiftsCount();
  const isLowBalance = balance < 1000;

  return (
    <div className="bg-linear-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Wallet Balance</h3>
            <p className="text-sm text-gray-600">Your available gift funds</p>
          </div>
        </div>
        
        <button
          onClick={() => onAddFunds?.()}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Funds
        </button>
      </div>

      {/* Balance Amount */}
      <div className="mb-6">
        <p className="text-4xl font-bold text-gray-800 mb-2">
          ₦{balance.toLocaleString()}
        </p>
        
        {isLowBalance ? (
          <div className="flex items-center gap-2 text-amber-600">
            <TrendingDown className="w-4 h-4" />
            <span className="text-sm font-medium">Low balance. Add funds to send gifts.</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-green-600">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-medium">Ready to send gifts!</span>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Recent Gifts</p>
              <p className="text-2xl font-bold text-gray-800">{recentGiftsCount}</p>
            </div>
            <Gift className="w-5 h-5 text-purple-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div>
            <p className="text-sm text-gray-600">Min. Gift Amount</p>
            <p className="text-2xl font-bold text-gray-800">₦1,000</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-sm text-gray-600 mb-3">Quick Actions</p>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => window.location.href = "/schedule"}
            className="py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
          >
            Send Gift
          </button>
          <button
            onClick={() => window.location.href = "/transactions"}
            className="py-2 border border-purple-600 text-purple-600 rounded-lg text-sm font-medium hover:bg-purple-50 transition-colors"
          >
            View History
          </button>
        </div>
      </div>
    </div>
  );
}