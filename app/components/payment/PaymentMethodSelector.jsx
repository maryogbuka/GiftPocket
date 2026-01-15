// app/components/PaymentMethodSelector.jsx
"use client";
import { useState } from "react";
import { 
  CreditCard, 
  Banknote, 
  Smartphone, 
  Wallet as WalletIcon,
  CheckCircle,
  Lock
} from "lucide-react";

export default function PaymentMethodSelector({ 
  selectedMethod, 
  onSelectMethod,
  walletBalance = 0 
}) {
  const paymentMethods = [
    {
      id: "virtual_account",
      name: "Virtual Account",
      description: "Send directly to your virtual account",
      icon: Banknote,
      color: "bg-green-100 text-green-600",
      recommended: true
    },
    {
      id: "wallet",
      name: "Wallet Balance",
      description: `Use available balance: ₦${walletBalance.toLocaleString()}`,
      icon: WalletIcon,
      color: "bg-purple-100 text-purple-600",
      disabled: walletBalance === 0
    },
    {
      id: "card",
      name: "Debit/Credit Card",
      description: "Pay with card securely",
      icon: CreditCard,
      color: "bg-blue-100 text-blue-600"
    },
    {
      id: "bank_transfer",
      name: "Bank Transfer",
      description: "Manual bank transfer",
      icon: Banknote,
      color: "bg-orange-100 text-orange-600"
    },
    {
      id: "ussd",
      name: "USSD",
      description: "*737# for GTBank, *894# for others",
      icon: Smartphone,
      color: "bg-indigo-100 text-indigo-600"
    }
  ];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Payment Method</h3>
          <p className="text-sm text-gray-600">Choose how you want to pay</p>
        </div>
        <Lock className="w-5 h-5 text-gray-400" />
      </div>

      <div className="space-y-3">
        {paymentMethods.map((method) => {
          const Icon = method.icon;
          const isSelected = selectedMethod === method.id;
          
          return (
            <button
              key={method.id}
              onClick={() => !method.disabled && onSelectMethod(method.id)}
              disabled={method.disabled}
              className={`w-full p-4 border rounded-xl text-left transition-all duration-200 ${
                isSelected 
                  ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-200' 
                  : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
              } ${method.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${method.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-800">{method.name}</span>
                      {method.recommended && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                          Recommended
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{method.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {method.disabled && (
                    <span className="text-sm text-gray-500">Not available</span>
                  )}
                  
                  {isSelected ? (
                    <CheckCircle className="w-5 h-5 text-purple-600" />
                  ) : (
                    <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
                  )}
                </div>
              </div>
              
              {method.id === "virtual_account" && isSelected && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>How it works:</strong> Send money to your virtual account, 
                    it auto-credits to your wallet instantly.
                  </p>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Security Note */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-start gap-3">
          <Lock className="w-5 h-5 text-gray-400 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-gray-800">Secure Payment</p>
            <p className="text-xs text-gray-600 mt-1">
              All payments are processed securely through Flutterwave. 
              We never store your card details.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}