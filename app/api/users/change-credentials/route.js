// app/api/users/change-credentials/route.js
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    await connectDB();
    
    const { email, currentPassword, newPassword, confirmNewPassword } = await request.json();
    
    if (!email || !currentPassword || !newPassword || !confirmNewPassword) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }
    
    if (newPassword !== confirmNewPassword) {
      return NextResponse.json(
        { success: false, message: "New passwords do not match" },
        { status: 400 }
      );
    }
    
    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: "New password must be at least 6 characters" },
        { status: 400 }
      );
    }
    
    // Find user
    const user = await User.findOne({ email });
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }
    
    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: "Current password is incorrect" },
        { status: 401 }
      );
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    // Update password
    user.password = hashedPassword;
    user.passwordChangedAt = new Date();
    await user.save();
    
    return NextResponse.json({
      success: true,
      message: "Password updated successfully"
    });
    
  } catch (error) {
    console.error("Change credentials error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}