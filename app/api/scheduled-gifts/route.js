// app/api/scheduled-gifts/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ScheduledGift from "@/models/ScheduledGift"; // Make sure you have this model

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }
    
    await connectDB();
    
    // Find gifts for this user
    const gifts = await ScheduledGift.find({ userEmail: email })
      .sort({ scheduledDate: 1 })
      .lean();
    
    return NextResponse.json({
      success: true,
      gifts: gifts || []
    });
    
  } catch (error) {
    console.error("Error fetching scheduled gifts:", error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch scheduled gifts' },
      { status: 500 }
    );
  }
}