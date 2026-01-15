import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import VirtualAccount from "@/models/VirtualAccount";
import { flw } from "@/lib/flutterwave";

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401 }
      );
    }

    await connectDB();
    
    // Get user
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return new Response(
        JSON.stringify({ success: false, error: "User not found" }),
        { status: 404 }
      );
    }

    // Check if user already has a virtual account
    const existingAccount = await VirtualAccount.findOne({ 
      userId: user._id,
      isActive: true 
    });
    
    if (existingAccount) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          data: existingAccount,
          message: "Virtual account already exists" 
        }),
        { status: 200 }
      );
    }

    // Prepare payload for Flutterwave
    const payload = {
      email: user.email,
      is_permanent: true,
      bvn: user.bvn || "", // Optional
      tx_ref: `VA-${user._id}-${Date.now()}`,
      phonenumber: user.phone || "",
      firstname: user.name.split(' ')[0] || user.name,
      lastname: user.name.split(' ')[1] || user.name,
      narration: `GiftPocket Virtual Account for ${user.name}`,
    };

    console.log("Creating virtual account payload:", payload);

    // Create virtual account with Flutterwave
    const response = await flw.VirtualAcct.create(payload);
    
    if (response.status !== "success") {
      console.error("Flutterwave virtual account creation failed:", response);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: response.message || "Failed to create virtual account" 
        }),
        { status: 400 }
      );
    }

    // Save virtual account details to database
    const virtualAccount = await VirtualAccount.create({
      userId: user._id,
      accountNumber: response.data.account_number,
      bankName: response.data.bank_name,
      accountName: response.data.fullname || user.name,
      flwOrderRef: response.data.order_ref,
      flwAccountId: response.data.id,
      flwReference: response.data.flw_ref,
      bvn: response.data.bvn || "",
      isPermanent: response.data.is_permanent,
      createdAt: new Date(),
      expiresAt: response.data.expiry_date 
        ? new Date(response.data.expiry_date) 
        : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days default
      isActive: true,
    });

    console.log("Virtual account created successfully:", {
      userId: user._id,
      accountNumber: virtualAccount.accountNumber,
      bankName: virtualAccount.bankName
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          accountNumber: virtualAccount.accountNumber,
          bankName: virtualAccount.bankName,
          accountName: virtualAccount.accountName,
          expiresAt: virtualAccount.expiresAt,
          isPermanent: virtualAccount.isPermanent,
          reference: virtualAccount.flwReference,
        },
        message: "Virtual account created successfully"
      }),
      { status: 201 }
    );

  } catch (error) {
    console.error("Virtual account creation error:", error);
    
    // Check for specific Flutterwave errors
    if (error.response?.data) {
      console.error("Flutterwave error details:", error.response.data);
    }

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Internal server error",
        details: error.response?.data || null
      }),
      { status: 500 }
    );
  }
}

// Get virtual account details
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401 }
      );
    }

    await connectDB();
    
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return new Response(
        JSON.stringify({ success: false, error: "User not found" }),
        { status: 404 }
      );
    }

    const virtualAccount = await VirtualAccount.findOne({ 
      userId: user._id,
      isActive: true 
    });

    if (!virtualAccount) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          data: null,
          message: "No virtual account found" 
        }),
        { status: 200 }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          accountNumber: virtualAccount.accountNumber,
          bankName: virtualAccount.bankName,
          accountName: virtualAccount.accountName,
          expiresAt: virtualAccount.expiresAt,
          isPermanent: virtualAccount.isPermanent,
          createdAt: virtualAccount.createdAt,
          isActive: virtualAccount.isActive,
        }
      }),
      { status: 200 }
    );

  } catch (error) {
    console.error("Get virtual account error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Internal server error" 
      }),
      { status: 500 }
    );
  }
}