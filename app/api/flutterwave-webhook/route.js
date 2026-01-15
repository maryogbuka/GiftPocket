// /app/api/flutterwave-webhook/route.js
import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/mongodb";
import Wallet from "../../../models/Wallet";

export async function POST(request) {
  try {
    await connectDB();

    const payload = await request.json();
    const signature = request.headers.get("verif-hash"); // Flutterwave sends signature for verification

    // Optional: Verify signature to ensure request is from Flutterwave
    // Flutterwave recommends verifying using your SECRET key

    if (payload.event === "virtual_account.credit") {
      const { account_number, amount, currency, customer } = payload.data;

      // Find wallet in DB by virtual account number
      const wallet = await Wallet.findOne({ virtualAccount: account_number });
      if (!wallet) return NextResponse.json({ message: "Wallet not found" }, { status: 404 });

      // Update wallet balance
      wallet.balance = (wallet.balance || 0) + amount;
      await wallet.save();

      console.log(`Wallet for user ${wallet.userId} credited with ${amount} ${currency}`);
    }

    return NextResponse.json({ message: "Webhook processed" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
