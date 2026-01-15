// app/api/users/get-user/route.js
import { NextResponse } from "next/server";
import User from "../../../../models/User"; // your User model
import { connectDB } from "../../../../lib/mongodb";

export async function POST(req) {
  try {
    await connectDB();
    const { email } = await req.json();

    if (!email) return NextResponse.json({ success: false, message: "Email required" }, { status: 400 });

    const user = await User.findOne({ email }).select("-password -resetToken -resetTokenExpiry");

    if (!user) return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });

    return NextResponse.json({ success: true, user });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
