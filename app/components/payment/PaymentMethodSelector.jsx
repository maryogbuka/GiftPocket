"use client";

import {
  CreditCard,
  Banknote,
  Smartphone,
  Wallet,
  CheckCircle,
  Lock,
  AlertCircle,
  Shield
} from "lucide-react";

export default function PaymentMethodSelector({
  selectedMethod,
  onSelectMethod,
  walletBalance = 0,
  showDetails = true
}) {
  const methods = [
    {
      id: "virtual_account",
      label: "Virtual Account",
      note: "Send money to your account number",
      icon: Banknote,
      tone: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
      hint: "Money arrives instantly in your wallet",
      badge: "Recommended",
      badgeStyle: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
    },
    {
      id: "wallet",
      label: "Wallet Balance",
      note: `Available balance: ₦${walletBalance.toLocaleString()}`,
      icon: Wallet,
      tone: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
      disabled: walletBalance <= 0,
      disabledText: "Wallet is empty"
    },
    {
      id: "card",
      label: "Card Payment",
      note: "Debit or credit card",
      icon: CreditCard,
      tone: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
    },
    {
      id: "bank_transfer",
      label: "Bank Transfer",
      note: "Manual transfer to our account",
      icon: Banknote,
      tone: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
      hint: "Confirmation usually takes 1–2 hours"
    },
    {
      id: "ussd",
      label: "USSD",
      note: "Dial *737# or *894#",
      icon: Smartphone,
      tone: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"
    }
  ];

  const pickMethod = (id) => {
    const method = methods.find(m => m.id === id);
    if (!method || method.disabled) return;
    onSelectMethod(id);
  };

  return (
    <div className="rounded-2xl border bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b dark:border-gray-700 flex justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Payment method
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Choose how you want to pay
          </p>
        </div>

        <div className="flex items-center gap-2 text-gray-400">
          <Shield className="w-4 h-4" />
          <span className="text-xs">Secure</span>
        </div>
      </div>

      {/* Options */}
      <div className="p-6 space-y-3">
        {methods.map((method) => {
          const Icon = method.icon;
          const active = selectedMethod === method.id;

          return (
            <button
              key={method.id}
              type="button"
              disabled={method.disabled}
              onClick={() => pickMethod(method.id)}
              className={`
                w-full p-4 rounded-xl border text-left transition
                ${method.disabled ? "opacity-50 cursor-not-allowed" : ""}
                ${active
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-300 dark:ring-blue-700"
                  : "border-gray-200 dark:border-gray-700 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/10"
                }
              `}
            >
              <div className="flex justify-between gap-4">
                <div className="flex gap-4 flex-1">
                  <div className={`p-2.5 rounded-lg ${method.tone}`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {method.label}
                      </span>

                      {method.badge && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${method.badgeStyle}`}>
                          {method.badge}
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {method.note}
                    </p>

                    {method.disabled && method.disabledText && (
                      <div className="flex items-center gap-1 mt-1 text-gray-500">
                        <AlertCircle className="w-3 h-3" />
                        <span className="text-xs">{method.disabledText}</span>
                      </div>
                    )}

                    {showDetails && active && method.hint && (
                      <div className="mt-2 px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800">
                        <p className="text-xs text-blue-800 dark:text-blue-300">
                          {method.hint}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {active ? (
                  <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
        <div className="flex gap-3">
          <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800">
            <Lock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Secure payments
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Payments are encrypted end-to-end. We never store your card or bank details.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
