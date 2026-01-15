// app/components/TransactionHistory.jsx
"use client";
import { useState, useEffect } from "react";
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Filter, 
  Download, 
  Search,
  TrendingUp,
  TrendingDown,
  RefreshCw
} from "lucide-react";

export default function TransactionHistory({ limit = 10 }) {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [stats, setStats] = useState({
    totalCredit: 0,
    totalDebit: 0,
    count: 0
  });

  const calculateStats = (txs) => {
    const credit = txs
      .filter(tx => tx.type === "credit" && tx.status === "completed")
      .reduce((sum, tx) => sum + (tx.amount || 0), 0);
    
    const debit = txs
      .filter(tx => tx.type === "debit" && tx.status === "completed")
      .reduce((sum, tx) => sum + (tx.amount || 0), 0);
    
    setStats({
      totalCredit: credit,
      totalDebit: debit,
      count: txs.length
    });
  };

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/transactions");
        const data = await response.json();
        
        if (data.success) {
          setTransactions(data.transactions || []);
          setFilteredTransactions(data.transactions || []);
          calculateStats(data.transactions || []);
        }
      } catch (error) {
        console.error("Failed to fetch transactions:", error);
        setTransactions(mockTransactions);
        setFilteredTransactions(mockTransactions);
        calculateStats(mockTransactions);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  useEffect(() => {
    let filtered = transactions;
    
    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(tx => 
        tx.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply filter
    if (filter !== "all") {
      filtered = filtered.filter(tx => tx.type === filter || tx.status === filter);
    }
    
    setFilteredTransactions(filtered);
  }, [searchTerm, filter, transactions]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getTransactionIcon = (type) => {
    if (type === "credit") {
      return <ArrowDownRight className="w-4 h-4 text-green-600" />;
    } else if (type === "debit") {
      return <ArrowUpRight className="w-4 h-4 text-red-600" />;
    }
    return null;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "failed": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <div className="animate-pulse space-y-6">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Transaction History</h3>
          <p className="text-sm text-gray-600">Recent wallet activities</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setLoading(true);
              fetch("/api/transactions")
                .then(res => res.json())
                .then(data => {
                  if (data.success) {
                    setTransactions(data.transactions || []);
                    setFilteredTransactions(data.transactions || []);
                    calculateStats(data.transactions || []);
                  }
                })
                .catch(error => {
                  console.error("Failed to fetch transactions:", error);
                  setTransactions(mockTransactions);
                  setFilteredTransactions(mockTransactions);
                  calculateStats(mockTransactions);
                })
                .finally(() => setLoading(false));
            }}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4 text-gray-600" />
          </button>
          <button
            className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="text-sm">Export</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-800 mb-1">Total Credit</p>
              <p className="text-2xl font-bold text-gray-800">
                ₦{stats.totalCredit.toLocaleString()}
              </p>
            </div>
            <TrendingDown className="w-5 h-5 text-green-600" />
          </div>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-800 mb-1">Total Debit</p>
              <p className="text-2xl font-bold text-gray-800">
                ₦{stats.totalDebit.toLocaleString()}
              </p>
            </div>
            <TrendingUp className="w-5 h-5 text-red-600" />
          </div>
        </div>
        
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-800 mb-1">Total Transactions</p>
              <p className="text-2xl font-bold text-gray-800">{stats.count}</p>
            </div>
            <RefreshCw className="w-5 h-5 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="all">All Transactions</option>
            <option value="credit">Credits Only</option>
            <option value="debit">Debits Only</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Transactions List */}
      <div className="space-y-3">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
              <Search className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-gray-600">No transactions found</p>
            <p className="text-sm text-gray-500 mt-1">Try adjusting your search or filter</p>
          </div>
        ) : (
          filteredTransactions.slice(0, limit).map((tx, index) => (
            <div 
              key={index}
              className="p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    tx.type === "credit" ? "bg-green-100" : "bg-red-100"
                  }`}>
                    {getTransactionIcon(tx.type)}
                  </div>
                  
                  <div>
                    <p className="font-medium text-gray-800">{tx.description}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-500">
                        {formatDate(tx.date || tx.createdAt)} • {formatTime(tx.date || tx.createdAt)}
                      </span>
                      {tx.category && (
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                          {tx.category}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className={`font-bold ${
                    tx.type === "credit" ? "text-green-600" : "text-red-600"
                  }`}>
                    {tx.type === "credit" ? "+" : "-"}₦{tx.amount?.toLocaleString()}
                  </p>
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(tx.status)}`}>
                    {tx.status}
                  </span>
                </div>
              </div>
              
              {tx.reference && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    Reference: <code className="font-mono">{tx.reference}</code>
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {transactions.length > limit && (
        <button
          onClick={() => window.location.href = "/transactions"}
          className="w-full mt-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
        >
          View All Transactions
        </button>
      )}
    </div>
  );
}

// Mock data for fallback
const mockTransactions = [
  {
    id: 1,
    type: "credit",
    amount: 50000,
    description: "Wallet Top-up",
    category: "topup",
    status: "completed",
    createdAt: new Date().toISOString(),
    reference: "TX-123456"
  },
  {
    id: 2,
    type: "debit",
    amount: 25000,
    description: "Birthday Gift for Sarah",
    category: "gift",
    status: "completed",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    reference: "GIFT-789012"
  },
  {
    id: 3,
    type: "debit",
    amount: 15000,
    description: "Christmas Hamper",
    category: "gift",
    status: "pending",
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    reference: "GIFT-345678"
  },
  {
    id: 4,
    type: "credit",
    amount: 30000,
    description: "Refund - Canceled Gift",
    category: "refund",
    status: "completed",
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    reference: "REF-901234"
  }
];