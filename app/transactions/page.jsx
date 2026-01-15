"use client";
import { useEffect, useState } from "react";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/wallet/transactions");
        const data = await res.json();

        if (data.success) setTransactions(data.transactions || []);
      } catch (err) {
        console.error("Fetch error:", err);
      }

      setLoading(false);
    };

    load();
  }, []);

  const groupByMonth = (txs = []) => {
    return txs.reduce((groups, tx) => {
      const date = new Date(tx.date);
      const label = date.toLocaleString("en-US", { month: "long", year: "numeric" });

      if (!groups[label]) groups[label] = [];
      groups[label].push(tx);

      return groups;
    }, {});
  };

  const grouped = groupByMonth(transactions);

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Wallet Statement</h1>

      {Object.keys(grouped).length === 0 && (
        <p>No transactions yet.</p>
      )}

      {Object.keys(grouped).map(month => (
        <div key={month} className="mb-8">
          <h2 className="text-lg font-semibold mb-3">{month}</h2>

          <div className="space-y-3">
            {grouped[month].map(tx => (
              <div 
                key={tx._id || tx.id}
                className="flex justify-between border p-3 rounded-lg"
              >
                <div>
                  <p className="font-medium">{tx.description}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(tx.date).toLocaleString()}
                  </p>
                </div>

                <div className="text-right">
                  <p className={`font-bold ${
                    tx.status === "failed"
                      ? "text-red-600"
                      : tx.type === "credit"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}>
                    {tx.type === "credit" ? "+" : "-"}₦{tx.amount.toLocaleString()}
                  </p>

                  <p className="text-xs text-gray-500">
                    {tx.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

    </div>
  );
}
