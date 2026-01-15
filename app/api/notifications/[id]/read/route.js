// app/api/notifications/[id]/read/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongodb";
import InAppNotification from "@/models/InAppNotification";

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;
    await connectDB();

    // Find and update notification
    const notification = await InAppNotification.findOneAndUpdate(
      {
        _id: id,
        userId: session.user.id
      },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return NextResponse.json(
        { success: false, message: 'Notification not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: notification
    });

  } catch (error) {
    console.error('Mark as read error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to mark as read' },
      { status: 500 }
    );
  }
}