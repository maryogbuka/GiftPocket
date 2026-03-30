// app/api/notifications/[id]/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { connectDB } from "@/lib/mongodb";
import InAppNotification from "@/models/InAppNotification";

// DELETE - Delete/archive a single notification
export async function DELETE(request, { params }) {
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

    // Use the model's instance method
    const notification = await InAppNotification.findOne({
      _id: id,
      userId: session.user.id
    });

    if (!notification) {
      return NextResponse.json(
        { success: false, message: 'Notification not found' },
        { status: 404 }
      );
    }

    await notification.archive(); // Using your model's archive method

    return NextResponse.json({
      success: true,
      data: notification
    });

  } catch (error) {
    console.error('Delete notification error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete notification' },
      { status: 500 }
    );
  }
}