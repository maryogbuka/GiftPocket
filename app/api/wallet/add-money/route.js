// app/api/wallet/add-money/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { connectDB } from "../../../../lib/mongodb";
import Wallet from "../../../../models/Wallet";
import Transaction from "../../../../models/Transaction";
import axios from "axios";
import crypto from "crypto";

export async function POST(request) {
  try {
    // 1. Authenticate user
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { amount, paymentMethod = "virtual_account" } = await request.json();
    
    // 2. Validate input
    if (!amount || amount < 100) {
      return NextResponse.json(
        { success: false, error: "Minimum amount is ₦100" },
        { status: 400 }
      );
    }

    await connectDB();

    // 3. Get user's wallet
    let wallet = await Wallet.findOne({ userId: session.user.id });
    
    if (!wallet) {
      return NextResponse.json(
        { success: false, error: "Wallet not found. Please activate your virtual account first." },
        { status: 404 }
      );
    }

    // 4. Generate unique reference
    const reference = `GIFT-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;

    // 5. Create pending transaction
    const transaction = await Transaction.create({
      userId: session.user.id,
      walletId: wallet._id,
      type: "credit",
      amount: parseInt(amount, 10),
      description: `Wallet top-up via ${paymentMethod}`,
      category: "topup",
      status: "pending",
      reference,
      paymentMethod,
      metadata: {
        userEmail: session.user.email,
        userName: session.user.name,
        initiatedAt: new Date(),
      },
    });

    // 6. If using virtual account, show existing VA details
    if (paymentMethod === "virtual_account" && wallet.virtualAccount) {
      return NextResponse.json({
        success: true,
        message: "Use your virtual account to fund your wallet",
        data: {
          reference,
          amount,
          virtualAccount: wallet.virtualAccount,
          bankName: wallet.bankName,
          accountName: wallet.accountName || session.user.name,
          instructions: `Send ${amount} to the account above. It will be credited automatically.`,
          transactionId: transaction._id,
        },
      });
    }

    // 7. For other payment methods, initialize Flutterwave payment
    try {
      const paymentResponse = await axios.post(
        "https://api.flutterwave.com/v3/payments",
        {
          tx_ref: reference,
          amount: amount,
          currency: "NGN",
          redirect_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard?payment=success`,
          customer: {
            email: session.user.email,
            name: session.user.name,
          },
          customizations: {
            title: "GiftPocket Wallet Funding",
            description: `Wallet top-up of ₦${amount}`,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      return NextResponse.json({
        success: true,
        message: "Payment initialized",
        data: {
          reference,
          amount,
          paymentLink: paymentResponse.data.data.link,
          transactionId: transaction._id,
        },
      });

    } catch (flwError) {
      console.error("Flutterwave payment error:", flwError.response?.data);
      
      // Update transaction status
      transaction.status = "failed";
      transaction.metadata.flutterwaveError = flwError.response?.data;
      await transaction.save();

      return NextResponse.json(
        { 
          success: false, 
          error: "Payment initialization failed",
          details: process.env.NODE_ENV === 'development' ? flwError.response?.data : undefined
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error("❌ Add money error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}