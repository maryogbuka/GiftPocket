// app/api/notifications/clear-all/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { connectDB } from "@/lib/mongodb";
import InAppNotification from "@/models/InAppNotification";

export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    // Soft delete all by marking as archived
    const result = await InAppNotification.updateMany(
      {
        userId: session.user.id,
        isArchived: false
      },
      { isArchived: true }
    );

    return NextResponse.json({
      success: true,
      data: {
        modifiedCount: result.modifiedCount
      }
    });

  } catch (error) {
    console.error('Clear all notifications error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to clear all notifications' },
      { status: 500 }
    );
  }
}