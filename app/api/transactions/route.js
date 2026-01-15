import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { connectDB } from "../../../lib/mongodb";
import Transaction from "../../../models/Transaction";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ success: false }, { status: 401 });

    await connectDB();

    const transactions = await Transaction.find({
      userId: session.user.id,
    }).sort({ createdAt: -1 });

    const grouped = {};

    transactions.forEach(tx => {
      const date = new Date(tx.createdAt);
      const month = date.toLocaleString("default", { month: "long", year: "numeric" });

      if (!grouped[month]) grouped[month] = [];
      grouped[month].push(tx);
    });

    return NextResponse.json({
      success: true,
      transactions,
      grouped,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}


export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();

    const newTx = await Transaction.create({
      userId: session.user.id,
      amount: body.amount,
      type: body.type, // "credit" | "debit" | "failed"
      description: body.description || "",
      category: body.category || "general",
      status: body.status || "completed",
    });

    return NextResponse.json({
      success: true,
      transaction: newTx,
    });
  } catch (error) {
    console.error("CREATE TRANSACTION ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
