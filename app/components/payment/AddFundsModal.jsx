"use client";

import { useEffect, useState } from "react";
import {
  X,
  CreditCard,
  Banknote,
  Wallet,
  CheckCircle,
  AlertCircle
} from "lucide-react";

export default function AddFundsModal({
  isOpen,
  onClose,
  onSuccess,
  currentBalance = 0
}) {
  const [selectedAmount, setSelectedAmount] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const [method, setMethod] = useState("virtual_account");
  const [processing, setProcessing] = useState(false);
  const [fee, setFee] = useState(0);

  const quickAmounts = [1000, 3000, 5000, 10000, 20000, 50000];

  const paymentOptions = [
    {
      id: "virtual_account",
      label: "Virtual Account",
      icon: Banknote,
      tone: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
      tag: "Instant",
      note: "Send to your account number"
    },
    {
      id: "card",
      label: "Card Payment",
      icon: CreditCard,
      tone: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
      tag: "Secure",
      note: "Debit or credit card"
    },
    {
      id: "bank_transfer",
      label: "Bank Transfer",
      icon: Banknote,
      tone: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
      note: "Manual transfer to our account"
    }
  ];

  const rawAmount = Number(selectedAmount || customAmount || 0);
  const total = rawAmount + fee;

  useEffect(() => {
    if (method === "card" && rawAmount > 0) {
      const charge = Math.floor(rawAmount * 0.025);
      setFee(charge < 50 ? 50 : charge);
    } else {
      setFee(0);
    }
  }, [method, rawAmount]);

  const pickQuickAmount = (amt) => {
    setSelectedAmount(String(amt));
    setCustomAmount("");
  };

  const handleCustomInput = (e) => {
    setCustomAmount(e.target.value.replace(/\D/g, ""));
    setSelectedAmount("");
  };

  const closeModal = () => {
    if (processing) return;
    onClose();
  };

  const submit = async (e) => {
    e.preventDefault();

    if (rawAmount < 100) {
      alert("Minimum amount is ₦100");
      return;
    }

    if (rawAmount > 1_000_000) {
      alert("Maximum single transaction is ₦1,000,000");
      return;
    }

    setProcessing(true);

    try {
      const res = await fetch("/api/wallet/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: rawAmount,
          method,
          fee,
          total
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Payment failed");
      }

      if (method === "virtual_account" && data.virtualAccount) {
        alert(
          `Send ₦${rawAmount.toLocaleString()} to:\n\n` +
          `${data.virtualAccount.bankName}\n` +
          `${data.virtualAccount.accountNumber}\n` +
          `${data.virtualAccount.accountName}`
        );
      }

      if (method === "card" && data.paymentUrl) {
        window.open(data.paymentUrl, "_blank", "noopener,noreferrer");
      }

      onSuccess?.({
        amount: rawAmount,
        method,
        transactionId: data.transactionId
      });

      onClose();
    } catch (err) {
      alert(err.message || "Something went wrong");
    } finally {
      setProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={closeModal}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-800 border dark:border-gray-700 shadow-xl overflow-y-auto max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-6 border-b dark:border-gray-700 flex justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Add money
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Balance: ₦{currentBalance.toLocaleString()}
            </p>
          </div>

          <button onClick={closeModal} disabled={processing}>
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={submit} className="p-6 space-y-6">
          {/* Amount */}
          <div>
            <p className="text-sm font-medium mb-3">Amount</p>

            <div className="grid grid-cols-3 gap-2 mb-4">
              {quickAmounts.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => pickQuickAmount(amt)}
                  className={`py-3 rounded-lg border font-medium
                    ${selectedAmount === String(amt)
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-300 hover:border-blue-400"
                    }`}
                >
                  ₦{amt.toLocaleString()}
                </button>
              ))}
            </div>

            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2">₦</span>
              <input
                value={customAmount}
                onChange={handleCustomInput}
                placeholder="0"
                className="w-full pl-10 py-3 rounded-lg border text-xl"
              />
            </div>
          </div>

          {/* Payment method */}
          <div>
            <p className="text-sm font-medium mb-3">Payment method</p>

            <div className="space-y-2">
              {paymentOptions.map((opt) => {
                const Icon = opt.icon;
                const active = method === opt.id;

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setMethod(opt.id)}
                    className={`w-full p-4 rounded-xl border text-left
                      ${active
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-blue-300"
                      }`}
                  >
                    <div className="flex justify-between">
                      <div className="flex gap-4">
                        <div className={`p-2.5 rounded-lg ${opt.tone}`}>
                          <Icon className="w-5 h-5" />
                        </div>

                        <div>
                          <p className="font-medium">{opt.label}</p>
                          <p className="text-sm text-gray-500">{opt.note}</p>
                        </div>
                      </div>

                      {active ? (
                        <CheckCircle className="w-5 h-5 text-blue-600" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Summary */}
          {rawAmount > 0 && (
            <div className="p-4 rounded-xl border bg-gray-50">
              <div className="flex justify-between text-sm">
                <span>Amount</span>
                <span>₦{rawAmount.toLocaleString()}</span>
              </div>

              {fee > 0 && (
                <div className="flex justify-between text-sm text-red-600">
                  <span>Fee</span>
                  <span>₦{fee.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between font-bold mt-2 pt-2 border-t">
                <span>Total</span>
                <span className="text-blue-600 text-lg">
                  ₦{total.toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={closeModal}
              disabled={processing}
              className="flex-1 py-3 border rounded-lg"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={processing || rawAmount === 0}
              className={`flex-1 py-3 rounded-lg text-white flex justify-center gap-2
                ${processing || rawAmount === 0
                  ? "bg-gray-400"
                  : "bg-blue-600 hover:bg-blue-700"
                }`}
            >
              {processing ? "Processing…" : "Add money"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
