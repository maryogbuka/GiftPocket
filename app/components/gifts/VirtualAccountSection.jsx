"use client";
import { useState, useEffect } from "react";
import { Copy, Banknote, RefreshCw, AlertCircle, Check } from "lucide-react";

// Loading State Component
const LoadingState = () => (
  <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-sm border">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
    <p className="text-gray-600 text-sm">
      Hang on a sec… we’re fetching your virtual account details.
    </p>
  </div>
);

// No Account Component
const NoAccount = ({ onCreate }) => (
  <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
    <div className="flex items-center mb-3">
      <AlertCircle className="h-6 w-6 text-yellow-600 mr-2" />
      <h3 className="text-lg font-semibold text-yellow-800">
        No virtual account yet
      </h3>
    </div>

    <p className="text-yellow-700 mb-5 text-sm leading-relaxed">
      You don’t have a virtual account right now.  
      Create one to start receiving payments directly into your wallet.
    </p>

    <button
      onClick={onCreate}
      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
    >
      <Banknote className="h-5 w-5 mr-2" />
      Create virtual account
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

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center mb-1">
            <Banknote className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">
              Your virtual account
            </h2>
          </div>
          <p className="text-gray-600 text-sm">
            Use the details below to receive payments anytime.
          </p>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="flex items-center text-sm text-blue-600 hover:text-blue-800"
        >
          <RefreshCw className="h-4 w-4 mr-1" />
          Refresh
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Bank
          </label>
          <div className="p-3 bg-gray-50 rounded-lg border">
            <p className="font-medium text-gray-900">
              {account.bankName}
            </p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Account number
          </label>
          <div className="flex items-center p-3 bg-gray-50 rounded-lg border">
            <p className="font-mono text-lg font-bold flex-1 tracking-wide">
              {account.accountNumber}
            </p>

            <button
              onClick={() => copyToClipboard(account.accountNumber)}
              className="flex items-center text-sm text-gray-600 hover:text-gray-900"
            >
              {copied ? (
                <>
                  <Check className="h-5 w-5 text-green-600" />
                  <span className="ml-1 text-green-600">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-5 w-5" />
                  <span className="ml-1">Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Account holder
          </label>
          <div className="p-3 bg-gray-50 rounded-lg border">
            <p className="font-medium text-gray-900">
              {account.accountHolderName}
            </p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Expires on
          </label>
          <div className="p-3 bg-gray-50 rounded-lg border">
            <p className="font-medium text-gray-900">
              {formatDate(account.expiryDate)}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800 leading-relaxed">
          <strong>Good to know:</strong> This account was created just for you.
          Any payment sent here will reflect in your wallet within
          <span className="font-semibold"> 24 hours</span>.
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
      console.error("Failed to fetch virtual account:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccount();
  }, []);

  if (loading) return <LoadingState />;
  if (!account) return <NoAccount onCreate={fetchAccount} />;

  return (
    <AccountDisplay
      account={account}
      copied={copied}
      setCopied={setCopied}
    />
  );
}
