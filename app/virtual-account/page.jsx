"use client";
import { useState } from "react";

export default function CreateVA({ userId }) {
  const [bvn, setBVN] = useState("");
  const [nin, setNIN] = useState("");
  const [loading, setLoading] = useState(false);
  const [wallet, setWallet] = useState(null);

  const handleCreateVA = async () => {
    setLoading(true);
    const res = await fetch("/api/create-va", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, bvn, nin }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) setWallet(data.wallet);
    else alert(data.error);
  };

  return (
    <div>
      <h2>Create Your Wallet</h2>
      <input
        type="text"
        placeholder="BVN"
        value={bvn}
        onChange={(e) => setBVN(e.target.value)}
      />
      <input
        type="text"
        placeholder="NIN"
        value={nin}
        onChange={(e) => setNIN(e.target.value)}
      />
      <button onClick={handleCreateVA} disabled={loading}>
        {loading ? "Creating VA..." : "Create Wallet"}
      </button>

      {wallet && (
        <div>
          <h3>Your Virtual Account is ready!</h3>
          <p>Account Number: {wallet.virtualAccount}</p>
          <p>Bank: {wallet.bankName}</p>
        </div>
      )}
    </div>
  );
}
