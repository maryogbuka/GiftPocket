// app/api/orders/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 20;
    const status = searchParams.get('status');

    // Build query
    const query = { customerEmail: session.user.email };
    if (status && status !== 'all') {
      query.status = status;
    }

    // Get orders with pagination
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    // Get counts for different statuses
    const counts = await Order.aggregate([
      { $match: { customerEmail: session.user.email } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const statusCounts = {};
    counts.forEach(item => {
      statusCounts[item._id] = item.count;
    });

    return NextResponse.json({
      success: true,
      data: {
        orders,
        counts: statusCounts,
        total: orders.length
      }
    });

  } catch (error) {
    console.error('Orders fetch error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch orders',
        data: { orders: [], counts: {}, total: 0 }
      },
      { status: 500 }
    );
  }
}