// app/api/notifications/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { connectDB } from "@/lib/mongodb";
import InAppNotification from "@/models/InAppNotification";

// GET - Fetch user notifications
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 20;
    const unreadOnly = searchParams.get('unread') === 'true';

    // Build query
    const query = {
      userId: session.user.id,
      isArchived: false,
      expiresAt: { $gt: new Date() }
    };

    if (unreadOnly) {
      query.isRead = false;
    }

    // Get notifications
    const notifications = await InAppNotification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('orderId', 'orderId status scheduledDate')
      .lean();

    // Get unread count
    const unreadCount = await InAppNotification.countDocuments({
      userId: session.user.id,
      isRead: false,
      isArchived: false,
      expiresAt: { $gt: new Date() }
    });

    return NextResponse.json({
      success: true,
      data: {
        notifications,
        unreadCount,
        totalCount: notifications.length
      }
    });

  } catch (error) {
    console.error('Notifications fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

// POST - Create notification (admin use)
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { userId, type, title, message, orderId, data } = body;

    await connectDB();

    const notification = await InAppNotification.create({
      userId,
      type,
      title,
      message,
      orderId,
      data: data || {},
      createdAt: new Date()
    });

    return NextResponse.json({
      success: true,
      data: notification
    });

  } catch (error) {
    console.error('Create notification error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create notification' },
      { status: 500 }
    );
  }
}