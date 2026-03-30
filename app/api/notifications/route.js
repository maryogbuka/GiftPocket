// app/api/notifications/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { connectDB } from "@/lib/mongodb";
import InAppNotification from "@/models/InAppNotification";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Return early if no session
    if (!session?.user) {
      console.log('No session found');
      return NextResponse.json(
        { 
          success: false, 
          message: 'Unauthorized',
          data: { notifications: [], unreadCount: 0, totalCount: 0 }
        },
        { status: 401 }
      );
    }

    console.log('Fetching notifications for user:', session.user.id);
    
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

    console.log('Query:', query);

    // Get notifications
    const notifications = await InAppNotification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('orderId', 'orderId status scheduledDate deliveryDate')
      .lean();

    console.log('Found notifications:', notifications.length);

    // Get unread count
    const unreadCount = await InAppNotification.countDocuments({
      userId: session.user.id,
      isRead: false,
      isArchived: false,
      expiresAt: { $gt: new Date() }
    });

    console.log('Unread count:', unreadCount);

    return NextResponse.json({
      success: true,
      data: {
        notifications: notifications || [],
        unreadCount: unreadCount || 0,
        totalCount: notifications.length || 0
      }
    });

  } catch (error) {
    console.error('Notifications fetch error:', error);
    
    // Return empty data but with success false
    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to fetch notifications',
      data: {
        notifications: [],
        unreadCount: 0,
        totalCount: 0
      }
    }, { status: 500 });
  }
}