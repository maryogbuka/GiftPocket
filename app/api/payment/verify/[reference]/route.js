// app/api/payment/initialize/route.js
import { NextResponse } from "next/server";
import { getFlw } from "@/lib/flutterwave";
import { connectDB } from "@/lib/mongodb";
import Transaction from "@/models/Transaction";

export async function POST(request) {
  try {
    const body = await request.json();
    const { amount, email, userId, reference } = body;
    
    // Get Flutterwave instance at runtime
    const flw = await getFlw();
    
    const response = await flw.Payment.initialize({
      amount: amount,
      email: email,
      tx_ref: reference,
      currency: "NGN",
      payment_options: "card,banktransfer,ussd",
      redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/verify?reference=${reference}`,
      customer: {
        email: email,
        name: body.name || "Customer",
      },
      customizations: {
        title: "GiftPocket NG",
        description: "Wallet Top-up",
        logo: `${process.env.NEXT_PUBLIC_BASE_URL}/logo.png`,
      },
    });
    
    if (response.status === "success") {
      // Create pending transaction
      await connectDB();
      await Transaction.create({
        userId,
        amount,
        reference,
        type: "credit",
        status: "pending",
        description: `Wallet top-up of ₦${amount}`,
        paymentMethod: "flutterwave",
        metadata: {
          flutterwaveReference: response.data.reference,
          flutterwaveLink: response.data.link,
        },
      });
      
      return NextResponse.json({
        success: true,
        data: response.data,
      });
    } else {
      throw new Error(response.message || "Payment initialization failed");
    }
    
  } catch (error) {
    console.error("Payment initialization error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}