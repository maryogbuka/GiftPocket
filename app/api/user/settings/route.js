// app/api/user/settings/route.js - FIXED
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

// Default settings
const defaultSettings = {
  notifications: {
    transactionAlerts: true,
    giftReminders: true,
    marketingEmails: false,
    pushNotifications: true,
    soundEffects: true,
    securityAlerts: true,
    balanceUpdates: true
  },
  security: {
    twoFactorAuth: false,
    biometricLogin: true,
    autoLogout: 30,
    loginNotifications: true,
    sessionManagement: true,
    deviceWhitelist: false
  },
  privacy: {
    showBalance: true,
    transactionHistory: true,
    profileVisibility: "contacts",
    dataSharing: false,
    activityStatus: true,
    searchVisibility: true
  },
  appearance: {
    theme: "light",
    fontSize: "medium",
    currency: "NGN",
    language: "English",
    animations: true,
    reducedMotion: false
  },
  account: {
    autoTopUp: false,
    spendingLimits: 50000,
    defaultPaymentMethod: "wallet",
    giftReminderDays: 3,
    currencyFormat: "₦1,000.00"
  }
};

export async function GET() {
  try {
    console.log('⚙️ Settings GET API called');
    
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ 
        success: false, 
        error: "Unauthorized" 
      }, { status: 401 });
    }

    await connectDB();
    
    let user = await User.findOne({ email: session.user.email });
    
    // If user doesn't exist, create with default settings
    if (!user) {
      user = await User.create({
        email: session.user.email,
        name: session.user.name || "User",
        settings: defaultSettings
      });
    }
    
    // If user exists but has no settings, add default settings
    if (user && !user.settings) {
      user.settings = defaultSettings;
      await user.save();
    }

    return NextResponse.json({
      success: true,
      settings: user.settings || defaultSettings
    });

  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to fetch settings",
      settings: defaultSettings
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    console.log('⚙️ Settings POST API called');
    
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ 
        success: false, 
        error: "Unauthorized" 
      }, { status: 401 });
    }

    const settings = await request.json();
    
    if (!settings) {
      return NextResponse.json({ 
        success: false, 
        error: "Settings data required" 
      }, { status: 400 });
    }

    await connectDB();
    
    // Find or create user
    let user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      // Create new user with settings
      user = await User.create({
        email: session.user.email,
        name: session.user.name || "User",
        settings: settings
      });
    } else {
      // Update existing user's settings
      user.settings = settings;
      user.updatedAt = new Date();
      await user.save();
    }

    return NextResponse.json({
      success: true,
      message: "Settings saved successfully",
      settings: user.settings
    });

  } catch (error) {
    console.error("Error saving settings:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to save settings" 
    }, { status: 500 });
  }
}