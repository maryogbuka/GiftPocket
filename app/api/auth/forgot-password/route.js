// app/api/auth/forgot-password/route.js
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import crypto from "crypto";

export async function POST(req) {
  try {
    const { email } = await req.json();
    
    if (!email) {
      return new Response(
        JSON.stringify({ 
          success: false,
          message: "Email is required" 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    await connectDB();
    
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    
    if (!user) {
      // Return success even if user doesn't exist (security best practice)
      return new Response(
        JSON.stringify({ 
          success: true,
          message: "If an account exists with this email, you will receive a reset link shortly." 
        }),
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Generate reset token and expiry
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now

    // Save token to user
    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();

    console.log("📧 Reset token generated for:", email);
    console.log("🔑 Reset token:", resetToken);

    // In production, you would send an email here
    // For now, we'll return the reset link in development
    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;
    
    console.log("🔗 Reset URL:", resetUrl);

    // TODO: Implement email sending
    // await sendResetPasswordEmail(email, resetUrl);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "If an account exists with this email, you will receive a reset link shortly.",
        // Only include debug info in development
        ...(process.env.NODE_ENV === "development" && { 
          debug: { resetUrl, resetToken } 
        })
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error("🚨 Forgot password error:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        message: "Something went wrong. Please try again." 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}