// app/api/notifications/read-all/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongodb";
import InAppNotification from "@/models/InAppNotification";

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    // Mark all user notifications as read
    const result = await InAppNotification.updateMany(
      {
        userId: session.user.id,
        isRead: false
      },
      { isRead: true }
    );

    return NextResponse.json({
      success: true,
      data: {
        modifiedCount: result.modifiedCount
      }
    });

  } catch (error) {
    console.error('Mark all as read error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to mark all as read' },
      { status: 500 }
    );
  }
}