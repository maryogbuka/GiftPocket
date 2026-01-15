// app/api/register/route.js
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Wallet from "@/models/Wallet";
import { generateVirtualAccount } from "@/lib/bank-integration";
import { encrypt } from "@/lib/encryption";
import { sendWelcomeEmail } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request) {
  try {
    // 1. Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const limit = await rateLimit(ip, 3, '10m'); // 3 registrations per 10 minutes
    
    if (limit.isLimited) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Too many registration attempts. Please try again later." 
        },
        { status: 429 }
      );
    }

    const { name, email, password } = await request.json();

    // 2. Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: "All fields are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // 3. Connect to database
    await connectDB();

    // 4. Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "User already exists" },
        { status: 409 }
      );
    }

    // 5. Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 6. Generate wallet ID
    const walletId = `GIFT${Date.now().toString().slice(-8)}`;

    // 7. Generate virtual account via Flutterwave (in production)
    let virtualAccount = null;
    let encryptedAccountData = null;
    
    if (process.env.NODE_ENV === 'production' && process.env.FLUTTERWAVE_SECRET_KEY) {
      try {
        virtualAccount = await generateVirtualAccount({
          email: email.toLowerCase().trim(),
          name: name.trim(),
          is_permanent: true,
          tx_ref: `REG_${Date.now()}`
        });

        // Encrypt virtual account data before storing
        encryptedAccountData = encrypt(JSON.stringify({
          account_number: virtualAccount.account_number,
          bank_name: virtualAccount.bank_name,
          flw_ref: virtualAccount.flw_ref,
          order_ref: virtualAccount.order_ref,
          created_at: new Date()
        }));
        
        console.log("✅ Virtual account generated for:", email);
      } catch (error) {
        console.error("❌ Virtual account generation failed:", error.message);
        // Continue without virtual account - user can generate later
      }
    }

    // 8. Create user with encrypted virtual account
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      walletId: walletId,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // 9. Create wallet for user
    const wallet = await Wallet.create({
      userId: user._id,
      walletId: walletId,
      balance: 0,
      currency: "NGN",
      virtualAccountData: encryptedAccountData,
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // 10. Send welcome email (async - don't await)
    if (process.env.NODE_ENV === 'production') {
      sendWelcomeEmail({
        to: email,
        name: name,
        walletId: walletId,
        hasVirtualAccount: !!virtualAccount,
        ...(virtualAccount && {
          accountNumber: virtualAccount.account_number,
          bankName: virtualAccount.bank_name
        })
      }).catch(error => {
        console.error("Email sending failed:", error);
        // Don't fail registration if email fails
      });
    }

    // 11. Return success (without sensitive data)
    return NextResponse.json({
      success: true,
      message: "Registration successful",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        walletId: walletId,
        hasVirtualAccount: !!virtualAccount
      }
    }, { status: 201 });

  } catch (error) {
    console.error("❌ Registration error:", error);
    
    // Don't expose internal errors
    return NextResponse.json(
      { 
        success: false, 
        error: "Registration failed. Please try again." 
      },
      { status: 500 }
    );
  }
}