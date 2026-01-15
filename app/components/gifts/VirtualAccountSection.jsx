"use client";
import { useState, useEffect } from "react";
import { Copy, Banknote, RefreshCw, AlertCircle, Check } from "lucide-react";

// Loading State Component
const LoadingState = () => (
  <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-sm border">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
    <p className="text-gray-600">Loading virtual account details...</p>
  </div>
);

// No Account Component
const NoAccount = ({ onCreate }) => (
  <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
    <div className="flex items-center mb-4">
      <AlertCircle className="h-6 w-6 text-yellow-600 mr-2" />
      <h3 className="text-lg font-semibold text-yellow-800">No Virtual Account</h3>
    </div>
    <p className="text-yellow-700 mb-4">
      You don&apos;t have a virtual account yet. Create one to start receiving payments.
    </p>
    <button
      onClick={onCreate}
      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
    >
      <Banknote className="h-5 w-5 mr-2" />
      Create Virtual Account
    </button>
  </div>
);

// Account Display Component
const AccountDisplay = ({ account, copied, setCopied }) => {
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center mb-2">
            <Banknote className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Virtual Account</h2>
          </div>
          <p className="text-gray-600">Your dedicated account for receiving payments</p>
        </div>
        <button className="flex items-center text-blue-600 hover:text-blue-800">
          <RefreshCw className="h-5 w-5 mr-1" />
          Refresh
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bank Name
          </label>
          <div className="p-3 bg-gray-50 rounded-lg border">
            <p className="font-medium">{account.bankName}</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Account Number
          </label>
          <div className="flex items-center p-3 bg-gray-50 rounded-lg border">
            <p className="font-mono text-lg font-bold flex-1">{account.accountNumber}</p>
            <button
              onClick={() => copyToClipboard(account.accountNumber)}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              {copied ? (
                <Check className="h-5 w-5 text-green-600" />
              ) : (
                <Copy className="h-5 w-5" />
              )}
              <span className="ml-1">{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Account Holder Name
          </label>
          <div className="p-3 bg-gray-50 rounded-lg border">
            <p className="font-medium">{account.accountHolderName}</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Expiry Date
          </label>
          <div className="p-3 bg-gray-50 rounded-lg border">
            <p className="font-medium">{formatDate(account.expiryDate)}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> This virtual account is automatically generated for you.
          Payments received will be credited to your wallet within 24 hours.
        </p>
      </div>
    </div>
  );
};

// Main Component
export default function VirtualAccountSection() {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const fetchAccount = async () => {
    try {
      const res = await fetch("/api/wallet/virtual-account/details");
      const data = await res.json();
      if (data.success) setAccount(data.data);
    } catch (error) {
      console.error("Failed to fetch VA:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccount();
  }, []);

  if (loading) return <LoadingState />;
  if (!account) return <NoAccount onCreate={fetchAccount} />;
  
  return <AccountDisplay account={account} copied={copied} setCopied={setCopied} />;
}