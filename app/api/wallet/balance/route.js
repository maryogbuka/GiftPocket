import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { connectDB } from "../../../../lib/mongodb";
import Wallet from "../../../../models/Wallet";
import Transaction from "../../../../models/Transaction";

export async function GET(request) {
  try {
    // --------------------------
    // 1️⃣ Get logged-in user
    // --------------------------
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // --------------------------
    // 2️⃣ Connect to DB
    // --------------------------
    await connectDB();

    // --------------------------
    // 3️⃣ Get wallet
    // --------------------------
    const wallet = await Wallet.findOne({ userId });

    if (!wallet) {
      return NextResponse.json({
        success: true,
        balance: 0,
        walletId: null,
        transactions: []
      });
    }

    // --------------------------
    // 4️⃣ Get recent transactions (limit 10)
    // --------------------------
    const transactions = await Transaction.find({ walletId: wallet._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('amount type description status createdAt category')
      .lean(); // faster and returns plain objects

    // --------------------------
    // 5️⃣ Return clean JSON
    // --------------------------
    return NextResponse.json({
      success: true,
      balance: wallet.balance,
        walletId: wallet.walletId,
      transactions: transactions.map(t => ({
        id: t._id,
        amount: t.amount,
        type: t.type,
        description: t.description,
        status: t.status,
        date: t.createdAt,
        category: t.category
      }))
    });

  } catch (error) {
    console.error("❌ Get wallet error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch wallet data", details: error.message },
      { status: 500 }
    );
  }
}
