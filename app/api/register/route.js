// app/api/register-with-kyc/route.js
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Wallet from "@/models/Wallet";
import VirtualAccount from "@/models/VirtualAccount";
import { verifyBVN, generateVirtualAccount } from "@/lib/flutterwave-integration";

export async function POST(request) {
  try {
    const formData = await request.formData();
    
    // Extract form data
    const name = formData.get("name");
    const email = formData.get("email");
    const phone = formData.get("phone");
    const password = formData.get("password");
    const bvn = formData.get("bvn");
    const nin = formData.get("nin");
    const dateOfBirth = formData.get("dateOfBirth");
    const address = formData.get("address");
    const state = formData.get("state");
    const lga = formData.get("lga");
    const gender = formData.get("gender");
    const nationality = formData.get("nationality");
    const idType = formData.get("idType");
    const idNumber = formData.get("idNumber");
    const referralCode = formData.get("referralCode");
    
    // Get uploaded files (in a real app, you'd upload to cloud storage)
    const idImage = formData.get("idImage");
    const selfieImage = formData.get("selfieImage");
    
    console.log("📝 KYC Registration attempt:", { name, email, phone, bvn: bvn ? "***" : null });

    // Validation
    if (!name || !email || !password || !phone || !bvn) {
      return NextResponse.json(
        { success: false, error: "All required fields are missing" },
        { status: 400 }
      );
    }

    // Validate BVN
    if (!/^\d{11}$/.test(bvn)) {
      return NextResponse.json(
        { success: false, error: "Invalid BVN format. Must be 11 digits." },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Check existing user
    const existingUser = await User.findOne({ 
      $or: [
        { email: email.toLowerCase().trim() },
        { phone: phone.replace(/\D/g, '') },
        { bvn: bvn }
      ]
    });
    
    if (existingUser) {
      return NextResponse.json(
        { 
          success: false, 
          error: "An account already exists with this email, phone, or BVN" 
        },
        { status: 409 }
      );
    }

    // Verify BVN with Flutterwave
    console.log("🔐 Verifying BVN...");
    let bvnVerified = false;
    let bvnData = null;
    
    try {
      const bvnResult = await verifyBVN(bvn);
      if (bvnResult.status === "success") {
        bvnVerified = true;
        bvnData = {
          firstName: bvnResult.data.first_name,
          lastName: bvnResult.data.last_name,
          phoneNumber: bvnResult.data.phone_number,
          dateOfBirth: bvnResult.data.date_of_birth,
          verifiedAt: new Date()
        };
        console.log("✅ BVN verified successfully");
      }
    } catch (bvnError) {
      console.error("BVN verification failed:", bvnError);
      // In production, you might want to fail here
      // For development, we'll continue
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json(
          { success: false, error: "BVN verification failed. Please check your BVN and try again." },
          { status: 400 }
        );
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate wallet ID
    const walletId = `GIFT${Date.now().toString().slice(-8)}`;

    // Create KYC data object
    const kycData = {
      bvn: bvn,
      bvnVerified: bvnVerified,
      bvnData: bvnData,
      nin: nin || null,
      dateOfBirth: dateOfBirth || null,
      address: address || null,
      state: state || null,
      lga: lga || null,
      gender: gender || null,
      nationality: nationality || "Nigerian",
      idType: idType || null,
      idNumber: idNumber || null,
      kycStatus: bvnVerified ? "verified" : "pending",
      kycVerifiedAt: bvnVerified ? new Date() : null,
      kycDocuments: {
        idImage: idImage ? "uploaded" : null,
        selfieImage: selfieImage ? "uploaded" : null
      }
    };

    // Create user with KYC data
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.replace(/\D/g, ''),
      password: hashedPassword,
      walletId: walletId,
      ...kycData,
      referralCode: referralCode?.toUpperCase() || undefined,
      status: "active",
      accountTier: "basic" // basic, verified, premium
    });

    await user.save();
    console.log("✅ User created:", user._id);

    // Create wallet
    const wallet = new Wallet({
      userId: user._id,
      walletId: walletId,
      balance: 0,
      currency: "NGN",
      status: "active",
      dailyLimit: 50000, // ₦50,000 for basic tier
      transactionLimit: 20000, // ₦20,000 per transaction
    });

    await wallet.save();
    console.log("✅ Wallet created");

    // Generate virtual account if BVN is verified
    let virtualAccount = null;
    if (bvnVerified && process.env.FLUTTERWAVE_SECRET_KEY) {
      try {
        console.log("🏦 Creating virtual account...");
        const vaResult = await generateVirtualAccount({
          email: user.email,
          name: user.name,
          phone: user.phone,
          bvn: bvn,
          is_permanent: true,
          tx_ref: `VA_${user._id}_${Date.now()}`
        });

        // Create virtual account record
        virtualAccount = new VirtualAccount({
          userId: user._id,
          accountNumber: vaResult.account_number,
          bankName: vaResult.bank_name,
          accountName: `${user.name} - GiftPocket`,
          flwRef: vaResult.flw_ref,
          orderRef: vaResult.order_ref,
          isActive: true,
          isPermanent: true,
          metaData: vaResult
        });

        await virtualAccount.save();
        
        // Update wallet with virtual account info
        wallet.virtualAccountId = virtualAccount._id;
        wallet.virtualAccountStatus = "active";
        wallet.virtualAccountNumber = vaResult.account_number;
        wallet.bankName = vaResult.bank_name;
        await wallet.save();

        // Update user
        user.hasVirtualAccount = true;
        user.virtualAccountId = virtualAccount._id;
        await user.save();

        console.log("✅ Virtual account created:", vaResult.account_number);
      } catch (vaError) {
        console.error("Virtual account creation failed:", vaError);
        // User can still use the app, just won't have a virtual account yet
      }
    }

    return NextResponse.json({
      success: true,
      message: "🎉 Registration successful!",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        walletId: walletId,
        hasVirtualAccount: !!virtualAccount,
        virtualAccountNumber: virtualAccount?.account_number,
        bankName: virtualAccount?.bank_name,
        accountTier: "basic",
        dailyLimit: 50000,
        transactionLimit: 20000,
        kycStatus: user.kycStatus,
        nextStep: virtualAccount ? "dashboard" : "verify_bvn"
      }
    }, { status: 201 });

  } catch (error) {
    console.error("🔥 KYC Registration error:", error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: "An account with these details already exists" },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}