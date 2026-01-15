// app/components/VAStatusCard.jsx
"use client";
import { useState, useEffect } from "react";
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Clock, 
  RefreshCw,
  Banknote,
  Shield,
  ExternalLink,
  Copy
} from "lucide-react";

export default function VAStatusCard() {
  const [status, setStatus] = useState("loading");
  const [account, setAccount] = useState(null);
  const [lastTransaction, setLastTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const fetchVAStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/wallet/virtual-account/status");
      const data = await response.json();
      
      if (data.success) {
        setStatus(data.data.status || "pending");
        setAccount(data.data);
        setLastTransaction(data.data.lastTransaction);
      }
    } catch (error) {
      console.error("Failed to fetch VA status:", error);
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVAStatus();
    // Poll for status updates every 30 seconds
    const interval = setInterval(fetchVAStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusConfig = (status) => {
    const configs = {
      "active": {
        icon: CheckCircle,
        title: "Virtual Account Active",
        description: "Your account is ready to receive payments",
        color: "bg-green-100 text-green-800 border-green-300",
        iconColor: "text-green-600",
        bgColor: "bg-gradient-to-r from-green-50 to-emerald-50"
      },
      "pending": {
        icon: Clock,
        title: "Activation Pending",
        description: "Your virtual account is being created",
        color: "bg-yellow-100 text-yellow-800 border-yellow-300",
        iconColor: "text-yellow-600",
        bgColor: "bg-gradient-to-r from-yellow-50 to-amber-50"
      },
      "verifying": {
        icon: Shield,
        title: "Under Verification",
        description: "We're verifying your account details",
        color: "bg-blue-100 text-blue-800 border-blue-300",
        iconColor: "text-blue-600",
        bgColor: "bg-gradient-to-r from-blue-50 to-cyan-50"
      },
      "suspended": {
        icon: AlertCircle,
        title: "Account Suspended",
        description: "Your account has been temporarily suspended",
        color: "bg-red-100 text-red-800 border-red-300",
        iconColor: "text-red-600",
        bgColor: "bg-gradient-to-r from-red-50 to-pink-50"
      },
      "error": {
        icon: XCircle,
        title: "Activation Failed",
        description: "Failed to create virtual account",
        color: "bg-red-100 text-red-800 border-red-300",
        iconColor: "text-red-600",
        bgColor: "bg-gradient-to-r from-red-50 to-pink-50"
      },
      "loading": {
        icon: RefreshCw,
        title: "Loading Status...",
        description: "Checking your account status",
        color: "bg-gray-100 text-gray-800 border-gray-300",
        iconColor: "text-gray-600",
        bgColor: "bg-gradient-to-r from-gray-50 to-slate-50"
      }
    };
    
    return configs[status] || configs.loading;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const config = getStatusConfig(status);

  if (loading && status === "loading") {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl p-6 border ${config.bgColor} ${config.color.replace('bg-', 'border-')}`}>
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-lg ${config.color.split(' ')[0]}`}>
            <config.icon className={`w-6 h-6 ${config.iconColor}`} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{config.title}</h3>
            <p className="text-sm text-gray-600">{config.description}</p>
          </div>
        </div>
        <button
          onClick={fetchVAStatus}
          className="p-2 hover:bg-white/50 rounded-lg transition-colors"
          title="Refresh status"
        >
          <RefreshCw className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {/* Account Details */}
      {account && status === "active" && (
        <div className="mb-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/80 p-4 rounded-xl border">
              <p className="text-xs text-gray-500 mb-1">Account Number</p>
              <div className="flex items-center justify-between">
                <code className="font-mono text-lg font-bold text-gray-800">
                  {account.accountNumber}
                </code>
                <button
                  onClick={() => copyToClipboard(account.accountNumber)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <Copy className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>
            
            <div className="bg-white/80 p-4 rounded-xl border">
              <p className="text-xs text-gray-500 mb-1">Bank Name</p>
              <p className="font-medium text-gray-800">{account.bankName}</p>
            </div>
          </div>
          
          <div className="bg-white/80 p-4 rounded-xl border">
            <p className="text-xs text-gray-500 mb-1">Account Name</p>
            <p className="font-medium text-gray-800">{account.accountName}</p>
          </div>
        </div>
      )}

      {/* Status Actions */}
      <div className="space-y-3">
        {status === "pending" && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  Activation in Progress
                </p>
                <p className="text-sm text-yellow-700 mt-1">
                  Your virtual account will be ready within 2-3 minutes. 
                  You&apos;ll receive a notification when it&apos;s active.
                </p>
              </div>
            </div>
          </div>
        )}

        {status === "verifying" && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-800">
                  Security Verification
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  We&apos;re verifying your identity for security purposes. 
                  This usually takes 1-2 business days.
                </p>
              </div>
            </div>
          </div>
        )}

        {status === "suspended" && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">
                  Account Suspended
                </p>
                <p className="text-sm text-red-700 mt-1">
                  Please contact support to resolve this issue. 
                  Email: support@giftpocket.com
                </p>
              </div>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">
                  Activation Failed
                </p>
                <p className="text-sm text-red-700 mt-1">
                  We couldn&apos;t create your virtual account. Please try again 
                  or contact support if the issue persists.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Last Transaction */}
        {lastTransaction && status === "active" && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-700">Last Transaction</p>
              <span className={`text-xs px-2 py-1 rounded-full ${
                lastTransaction.status === 'successful' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {lastTransaction.status}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800">
                  ₦{lastTransaction.amount?.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(lastTransaction.date).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => window.location.href = "/transactions"}
                className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
              >
                View All
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-4 mt-4 border-t border-gray-200">
          <div className="flex gap-3">
            {status === "active" && (
              <>
                <button
                  onClick={() => window.location.href = "/wallet"}
                  className="flex-1 py-2.5 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
                >
                  View Wallet
                </button>
                <button
                  onClick={() => window.location.href = "/virtual-account"}
                  className="flex-1 py-2.5 border border-purple-600 text-purple-600 rounded-lg font-medium hover:bg-purple-50 transition-colors"
                >
                  Account Details
                </button>
              </>
            )}
            
            {status === "pending" && (
              <button
                onClick={fetchVAStatus}
                className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4 animate-spin" />
                Checking Status...
              </button>
            )}
            
            {(status === "error" || status === "suspended") && (
              <button
                onClick={() => window.location.href = "/support"}
                className="w-full py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Contact Support
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}