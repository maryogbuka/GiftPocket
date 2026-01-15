// app/api/wallet/debit/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { connectDB } from "../../../../lib/mongodb";
import Wallet from "../../../../models/Wallet";
import Transaction from "../../../../models/Transaction";
import mongoose from "mongoose";

export async function POST(request) {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();

    // 1. Authenticate
    const authSession = await getServerSession(authOptions);
    if (!authSession?.user) {
      await session.abortTransaction();
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { amount, description, category = "gift", reference } = await request.json();

    // 2. Validate
    if (!amount || amount <= 0) {
      await session.abortTransaction();
      return NextResponse.json(
        { success: false, error: "Invalid amount" },
        { status: 400 }
      );
    }

    if (!reference) {
      await session.abortTransaction();
      return NextResponse.json(
        { success: false, error: "Reference is required" },
        { status: 400 }
      );
    }

    await connectDB();

    // 3. Check for duplicate transaction
    const existingTx = await Transaction.findOne({ reference }).session(session);
    if (existingTx) {
      await session.abortTransaction();
      return NextResponse.json(
        { success: false, error: "Transaction already processed" },
        { status: 409 }
      );
    }

    // 4. Get wallet with enough balance
    const wallet = await Wallet.findOne({ 
      userId: authSession.user.id,
      balance: { $gte: amount }
    }).session(session);

    if (!wallet) {
      await session.abortTransaction();
      return NextResponse.json(
        { success: false, error: "Insufficient balance" },
        { status: 400 }
      );
    }

    // 5. Update wallet balance
    wallet.balance -= amount;
    await wallet.save({ session });

    // 6. Create transaction record
    const transaction = await Transaction.create([{
      userId: authSession.user.id,
      walletId: wallet._id,
      amount,
      type: "debit",
      description: description || "Wallet debit",
      category,
      status: "completed",
      reference,
      balanceBefore: wallet.balance + amount,
      balanceAfter: wallet.balance,
      metadata: {
        processedAt: new Date(),
      },
    }], { session });

    await session.commitTransaction();

    return NextResponse.json({
      success: true,
      balance: wallet.balance,
      transaction: transaction[0],
    });

  } catch (error) {
    await session.abortTransaction();
    console.error("❌ Debit error:", error);
    return NextResponse.json(
      { success: false, error: "Transaction failed" },
      { status: 500 }
    );
  } finally {
    session.endSession();
  }
}