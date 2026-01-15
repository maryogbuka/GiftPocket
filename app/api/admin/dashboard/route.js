// app/api/admin/dashboard/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import User from "@/models/User";
import Gift from "@/models/Gift";
import { adminAuthMiddleware } from "@/middleware/admin-auth";

export async function GET(request) {
  try {
    // Check admin authentication
    const authCheck = await adminAuthMiddleware(request);
    if (authCheck.status !== 200) return authCheck;

    await connectDB();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    const lastMonth = new Date(today);
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    // Get all stats in parallel
    const [
      totalOrders,
      todayOrders,
      todayDeliveries,
      pendingOrders,
      totalCustomers,
      newCustomers,
      totalGifts,
      lowStockGifts,
      recentOrders,
      upcomingDeliveries,
      revenueStats
    ] = await Promise.all([
      // Total orders
      Order.countDocuments({ isActive: true }),
      
      // Today's orders
      Order.countDocuments({
        createdAt: { $gte: today },
        isActive: true
      }),
      
      // Today's deliveries
      Order.countDocuments({
        scheduledDate: { $gte: today, $lt: tomorrow },
        status: 'delivered',
        isActive: true
      }),
      
      // Pending orders
      Order.countDocuments({
        status: { $in: ['pending', 'confirmed', 'processing'] },
        isActive: true
      }),
      
      // Total customers
      User.countDocuments(),
      
      // New customers (last 7 days)
      User.countDocuments({
        createdAt: { $gte: lastWeek }
      }),
      
      // Total gifts
      Gift.countDocuments({ isActive: true }),
      
      // Low stock gifts
      Gift.countDocuments({
        stockQuantity: { $lte: 10 },
        inStock: true,
        isActive: true
      }),
      
      // Recent orders (last 10)
      Order.find({ isActive: true })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('userId', 'name email')
        .select('orderId totalAmount status scheduledDate createdAt'),
      
      // Upcoming deliveries (next 3 days)
      Order.find({
        scheduledDate: { $gte: today, $lt: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000) },
        status: { $in: ['confirmed', 'processing', 'ready_for_delivery', 'assigned_to_courier'] },
        isActive: true
      })
      .sort({ scheduledDate: 1 })
      .limit(10)
      .select('orderId recipientName scheduledDate status deliveryTimeSlot'),
      
      // Revenue stats
      Order.aggregate([
        {
          $match: {
            paymentStatus: 'completed',
            isActive: true,
            createdAt: { $gte: lastMonth }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' }
            },
            totalRevenue: { $sum: '$totalAmount' },
            orderCount: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': -1, '_id.month': -1, '_id.day': -1 } },
        { $limit: 30 }
      ])
    ]);

    // Calculate today's revenue
    const todayRevenue = revenueStats
      .filter(stat => 
        stat._id.year === today.getFullYear() &&
        stat._id.month === today.getMonth() + 1 &&
        stat._id.day === today.getDate()
      )
      .reduce((sum, stat) => sum + stat.totalRevenue, 0);

    // Calculate monthly revenue
    const monthlyRevenue = revenueStats
      .filter(stat => 
        stat._id.year === today.getFullYear() &&
        stat._id.month === today.getMonth() + 1
      )
      .reduce((sum, stat) => sum + stat.totalRevenue, 0);

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalOrders,
          todayOrders,
          todayDeliveries,
          pendingOrders,
          totalCustomers,
          newCustomers,
          totalGifts,
          lowStockGifts,
          todayRevenue,
          monthlyRevenue
        },
        recentOrders,
        upcomingDeliveries,
        revenueTrend: revenueStats
      }
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to load dashboard' },
      { status: 500 }
    );
  }
}