// app/components/AddFundsModal.jsx
"use client";
import { useState } from "react";
import { X, Plus, CreditCard, Banknote, Wallet, CheckCircle } from "lucide-react";

export default function AddFundsModal({ isOpen, onClose, onSuccess }) {
  const [amount, setAmount] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("virtual_account");
  const [loading, setLoading] = useState(false);
  const [customAmount, setCustomAmount] = useState("");

  const quickAmounts = [1000, 3000, 5000, 10000, 20000, 50000];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const finalAmount = customAmount || amount;
    if (!finalAmount || parseInt(finalAmount) < 100) {
      alert("Minimum amount is ₦100");
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch("/api/wallet/add-money", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseInt(finalAmount),
          paymentMethod: selectedMethod
        })
      });

      const data = await response.json();
      
      if (data.success) {
        if (selectedMethod === "virtual_account" && data.data?.virtualAccount) {
          // Show VA details
          alert(
            `🎉 Payment initiated!\n\n` +
            `Send ₦${finalAmount} to:\n` +
            `Account: ${data.data.virtualAccount}\n` +
            `Bank: ${data.data.bankName}\n\n` +
            `Funds will be credited automatically.`
          );
        } else if (data.data?.paymentLink) {
          // Redirect to payment page
          window.open(data.data.paymentLink, "_blank");
        }
        
        onSuccess?.(data);
        onClose();
      } else {
        alert(data.error || "Failed to initiate payment");
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAmount = (amt) => {
    setAmount(amt.toString());
    setCustomAmount("");
  };

  const handleCustomAmount = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    setCustomAmount(value);
    setAmount("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Add Funds to Wallet</h2>
            <p className="text-sm text-gray-600 mt-1">Top up your gift wallet</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Amount Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Amount (₦)
            </label>
            
            <div className="grid grid-cols-3 gap-3 mb-4">
              {quickAmounts.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleQuickAmount(amt)}
                  className={`py-3 border rounded-lg font-medium transition-colors ${
                    amount === amt.toString()
                      ? "border-purple-500 bg-purple-50 text-purple-700"
                      : "border-gray-300 hover:border-purple-300 hover:bg-purple-50"
                  }`}
                >
                  ₦{amt.toLocaleString()}
                </button>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Or enter custom amount
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                  ₦
                </span>
                <input
                  type="text"
                  value={customAmount}
                  onChange={handleCustomAmount}
                  placeholder="Enter amount"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Payment Method
            </label>
            
            <div className="space-y-3">
              {[
                { id: "virtual_account", label: "Virtual Account", icon: Banknote, description: "Send to your VA" },
                { id: "card", label: "Debit/Credit Card", icon: CreditCard, description: "Pay with card" },
                { id: "bank_transfer", label: "Bank Transfer", icon: Banknote, description: "Manual transfer" },
              ].map((method) => {
                const Icon = method.icon;
                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setSelectedMethod(method.id)}
                    className={`w-full p-4 border rounded-xl text-left transition-all duration-200 ${
                      selectedMethod === method.id
                        ? "border-purple-500 bg-purple-50 ring-2 ring-purple-200"
                        : "border-gray-200 hover:border-purple-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-lg ${
                          selectedMethod === method.id 
                            ? "bg-purple-100 text-purple-600" 
                            : "bg-gray-100 text-gray-600"
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="font-medium text-gray-800">{method.label}</span>
                          <p className="text-sm text-gray-600 mt-1">{method.description}</p>
                        </div>
                      </div>
                      
                      {selectedMethod === method.id ? (
                        <CheckCircle className="w-5 h-5 text-purple-600" />
                      ) : (
                        <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Summary */}
          {(amount || customAmount) && (
            <div className="p-4 bg-gray-50 rounded-xl">
              <h4 className="font-medium text-gray-800 mb-2">Summary</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount</span>
                  <span className="font-medium">
                    ₦{parseInt(amount || customAmount).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fee</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Total</span>
                    <span className="text-lg font-bold text-purple-600">
                      ₦{parseInt(amount || customAmount).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Info Note */}
          {selectedMethod === "virtual_account" && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
              <p className="text-sm text-green-800">
                <strong>💡 How it works:</strong> After submitting, you&apos;ll see your virtual account details. 
                Send money to it from any bank, and it will be credited to your wallet automatically.
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || (!amount && !customAmount)}
              className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Wallet className="w-4 h-4" />
                  Continue to Payment
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}