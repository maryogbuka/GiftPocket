// app/api/webhooks/flutterwave/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Transaction from "@/models/Transaction";
import Wallet from "@/models/Wallet";
import VirtualAccount from "@/models/VirtualAccount";
import { sendNotification } from "@/lib/notification-service";

// Simple Flutterwave signature verification
function verifyWebhookSignature(signature, secret) {
  return signature === secret;
}

// Handle virtual account or bank transfer credit
async function handleVirtualAccountCredit(data) {
  await connectDB();

  const accountNumber = data.account_number;
  const amount = parseFloat(data.amount);
  const reference = data.tx_ref;

  // Find virtual account
  const virtualAccount = await VirtualAccount.findOne({
    accountNumber,
    isActive: true,
  });

  if (!virtualAccount) {
    console.log("No virtual account matched:", accountNumber);
    return { processed: false, message: "Virtual account not found" };
  }

  const wallet = await Wallet.findOne({ userId: virtualAccount.userId });
  if (!wallet) {
    return { processed: false, message: "Wallet not found" };
  }

  // Prevent double credit
  const existingTx = await Transaction.findOne({ reference });
  if (existingTx) {
    console.log("Transaction already processed:", reference);
    return { processed: true, transactionId: existingTx._id };
  }

  // Create transaction
  const transaction = await Transaction.create({
    userId: virtualAccount.userId,
    walletId: wallet.walletId,
    type: "credit",
    amount,
    status: "success",
    reference,
    paymentMethod: "virtual_account",
    description: `VA Deposit from ${data.sender_account_name || 'Unknown sender'}`,
    metadata: data,
  });

  // Update wallet
  wallet.balance += amount;
  wallet.totalDeposited = (wallet.totalDeposited || 0) + amount;
  wallet.totalTransactions = (wallet.totalTransactions || 0) + 1;
  wallet.lastTransactionAt = new Date();
  await wallet.save();

  // Notify user
  await sendNotification({
    userId: virtualAccount.userId,
    type: "wallet_credit",
    title: "Wallet Credited",
    message: `Your wallet has been credited with ₦${amount}`,
    data: {
      amount,
      reference,
    },
  });

  console.log(`Successfully credited user ${virtualAccount.userId} with ₦${amount}`);

  return { processed: true, transactionId: transaction._id };
}

export async function POST(request) {
  try {
    const payload = await request.json();
    const signature = request.headers.get("verif-hash");
    const webhookSecret = process.env.FLUTTERWAVE_WEBHOOK_SECRET;

    // Verify signature
    if (!verifyWebhookSignature(signature, webhookSecret)) {
      return NextResponse.json(
        { status: "error", message: "Invalid signature" },
        { status: 401 }
      );
    }

    console.log("Webhook received:", payload.event);

    // Only handle relevant events
    if (payload.event === "virtual_account_credit" || payload.event === "charge.completed") {
      const data = payload.data;

      // For charge.completed, ensure it's a bank transfer
      if (payload.event === "charge.completed" && data.payment_type !== "bank_transfer") {
        return NextResponse.json({ status: "ignored", message: "Not a bank transfer" });
      }

      const result = await handleVirtualAccountCredit(data);

      return NextResponse.json({
        status: "success",
        processed: result.processed,
        transactionId: result.transactionId,
      });
    }

    return NextResponse.json({
      status: "ignored",
      message: "Event not relevant",
    });

  } catch (error) {
    console.error("Webhook error:", error);

    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 }
    );
  }
}
