// app/api/create-va/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import VirtualAccount from "@/models/VirtualAccount";
import Wallet from "@/models/Wallet";

export async function POST(request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();
    
    // Get user from database
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Check if user already has a virtual account
    const existingAccount = await VirtualAccount.findOne({ userId: user._id });
    
    if (existingAccount) {
      return NextResponse.json({
        success: true,
        data: {
          account: existingAccount,
          message: "Virtual account already exists"
        }
      });
    }

    // Check if user has a wallet, create if not
    let wallet = await Wallet.findOne({ userId: user._id });
    if (!wallet) {
      wallet = await Wallet.create({
        userId: user._id,
        balance: 0,
        currency: 'NGN',
        status: 'active',
        walletId: `GIFT${user._id.toString().slice(-8)}`,
      });
    }

    // Get request body (optional BVN/NIN)
    const { bvn, nin } = await request.json();

    // Prepare Flutterwave API payload
    const flwPayload = {
      email: user.email,
      is_permanent: true,
      bvn: bvn || "",
      nin: nin || "",
      tx_ref: `GIFT_${user._id.toString().slice(-8)}_${Date.now()}`,
      narration: `GiftPocket Wallet - ${user.name || user.email.split('@')[0]}`,
      amount: null, // Null allows any amount, 0 for fixed amount
    };

    // DEVELOPMENT MODE: Return demo data if no Flutterwave key
    if (!process.env.FLW_SECRET_KEY) {
      console.log("DEV MODE: Creating demo virtual account");
      
      const demoAccount = await VirtualAccount.create({
        userId: user._id,
        accountNumber: "0123456789",
        bankName: "Demo Bank",
        bankCode: "044",
        accountName: `GiftPocket - ${user.name || user.email.split('@')[0]}`,
        flwRef: `DEMO_${Date.now()}`,
        orderRef: `DEMO_ORDER_${Date.now()}`,
        isActive: true,
        isPermanent: true,
        isDemo: true,
        metaData: {
          demo: true,
          created_at: new Date().toISOString(),
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          account: demoAccount,
          message: "Demo virtual account created successfully"
        }
      });
    }

    // PRODUCTION: Create real Flutterwave virtual account
    const response = await fetch('https://api.flutterwave.com/v3/virtual-account-numbers', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.FLW_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(flwPayload),
    });

    const flwData = await response.json();

    if (flwData.status !== 'success') {
      console.error("Flutterwave error:", flwData);
      throw new Error(flwData.message || 'Failed to create virtual account');
    }

    const vaData = flwData.data;

    // Save virtual account to database
    const virtualAccount = await VirtualAccount.create({
      userId: user._id,
      accountNumber: vaData.account_number,
      bankName: vaData.bank_name,
      bankCode: vaData.bank_code,
      accountName: vaData.account_name || `GiftPocket - ${user.name || user.email.split('@')[0]}`,
      flwRef: vaData.flw_ref,
      orderRef: vaData.order_ref,
      frequency: 'daily',
      isActive: true,
      isPermanent: true,
      expiresAt: vaData.expiry_date ? new Date(vaData.expiry_date) : null,
      metaData: vaData,
    });

    // Also update wallet with virtual account info
    wallet.virtualAccountId = virtualAccount._id;
    await wallet.save();

    return NextResponse.json({
      success: true,
      data: {
        account: virtualAccount,
        message: "Virtual account created successfully"
      }
    });

  } catch (error) {
    console.error("Create VA error:", error);
    
    // Provide a helpful error response
    let errorMessage = error.message || "Failed to create virtual account";
    let statusCode = 500;
    
    if (errorMessage.includes("bvn")) {
      errorMessage = "BVN verification failed. Please provide a valid BVN.";
      statusCode = 400;
    } else if (errorMessage.includes("customer")) {
      errorMessage = "Customer information incomplete. Please update your profile.";
      statusCode = 400;
    }

    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: statusCode }
    );
  }
}

// GET endpoint to fetch existing virtual account
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();
    
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const virtualAccount = await VirtualAccount.findOne({ userId: user._id });
    
    if (!virtualAccount) {
      return NextResponse.json({
        success: true,
        data: null,
        message: "No virtual account found"
      });
    }

    return NextResponse.json({
      success: true,
      data: virtualAccount
    });

  } catch (error) {
    console.error("Get VA error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch virtual account" },
      { status: 500 }
    );
  }
}

// DELETE endpoint to deactivate virtual account
export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();
    
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const virtualAccount = await VirtualAccount.findOne({ userId: user._id });
    
    if (!virtualAccount) {
      return NextResponse.json({
        success: true,
        message: "No virtual account to delete"
      });
    }

    // In production, you might want to deactivate with Flutterwave
    if (!virtualAccount.isDemo && process.env.FLW_SECRET_KEY) {
      try {
        await fetch(`https://api.flutterwave.com/v3/virtual-account-numbers/${virtualAccount.flwRef}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${process.env.FLW_SECRET_KEY}`,
          },
        });
      } catch (flwError) {
        console.error("Failed to deactivate VA with Flutterwave:", flwError);
      }
    }

    // Mark as inactive in our database
    virtualAccount.isActive = false;
    await virtualAccount.save();

    return NextResponse.json({
      success: true,
      message: "Virtual account deactivated successfully"
    });

  } catch (error) {
    console.error("Delete VA error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to deactivate virtual account" },
      { status: 500 }
    );
  }
}