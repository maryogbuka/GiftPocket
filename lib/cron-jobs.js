// lib/cron-jobs.js
import cron from 'node-cron';
import notificationService from './notification-service';
import Order from '@/models/Order';
import { connectDB } from './mongodb';

// Schedule daily notification check at 9 AM
cron.schedule('0 9 * * *', async () => {
  console.log('⏰ Running daily notification scheduler...');
  
  try {
    await connectDB();
    await scheduleUpcomingNotifications();
    console.log('✅ Daily notifications scheduled');
  } catch (error) {
    console.error('❌ Failed to schedule notifications:', error);
  }
});

// Check for deliveries every hour
cron.schedule('0 * * * *', async () => {
  console.log('⏰ Checking for completed deliveries...');
  
  try {
    await connectDB();
    await checkCompletedDeliveries();
    console.log('✅ Delivery notifications checked');
  } catch (error) {
    console.error('❌ Delivery check failed:', error);
  }
});

// Function to schedule upcoming notifications
async function scheduleUpcomingNotifications() {
  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const threeDays = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const today = new Date(now.getTime());

  // Helper function to check if notification was already sent
  const notificationNotSent = (order, type) => {
    return !order.notifications.some(n => n.type === type);
  };

  // Find orders that need week-before notifications
  const weekBeforeOrders = await Order.find({
    scheduledDate: { 
      $gte: nextWeek, 
      $lt: new Date(nextWeek.getTime() + 24 * 60 * 60 * 1000) 
    },
    status: { $in: ['confirmed', 'processing', 'ready_for_delivery'] },
    isActive: true
  }).populate('userId', 'email name');

  for (const order of weekBeforeOrders) {
    if (notificationNotSent(order, 'week_before_delivery')) {
      await notificationService.sendOrderNotification(order._id, 'week_before_delivery');
    }
  }

  // Find orders that need 3-days-before notifications
  const threeDaysOrders = await Order.find({
    scheduledDate: { 
      $gte: threeDays, 
      $lt: new Date(threeDays.getTime() + 24 * 60 * 60 * 1000) 
    },
    status: { $in: ['confirmed', 'processing', 'ready_for_delivery'] },
    isActive: true
  }).populate('userId', 'email name');

  for (const order of threeDaysOrders) {
    if (notificationNotSent(order, 'three_days_before')) {
      await notificationService.sendOrderNotification(order._id, 'three_days_before');
    }
  }

  // Find orders that need day-before notifications
  const dayBeforeOrders = await Order.find({
    scheduledDate: { 
      $gte: tomorrow, 
      $lt: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000) 
    },
    status: { $in: ['confirmed', 'processing', 'ready_for_delivery'] },
    isActive: true
  }).populate('userId', 'email name');

  for (const order of dayBeforeOrders) {
    if (notificationNotSent(order, 'day_before')) {
      await notificationService.sendOrderNotification(order._id, 'day_before');
    }
  }

  // Find orders for today
  const todayOrders = await Order.find({
    scheduledDate: { 
      $gte: today, 
      $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) 
    },
    status: { $in: ['ready_for_delivery', 'assigned_to_courier', 'picked_up'] },
    isActive: true
  }).populate('userId', 'email name');

  for (const order of todayOrders) {
    if (notificationNotSent(order, 'delivery_day')) {
      await notificationService.sendOrderNotification(order._id, 'delivery_day');
    }
  }

  console.log(`✅ Scheduled: ${weekBeforeOrders.length} week, ${threeDaysOrders.length} 3-days, ${dayBeforeOrders.length} day, ${todayOrders.length} today`);
}

// Function to check completed deliveries
async function checkCompletedDeliveries() {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  
  const deliveredOrders = await Order.find({
    status: 'delivered',
    actualDeliveryDate: { $gte: oneHourAgo },
    isActive: true
  }).populate('userId', 'email name');

  for (const order of deliveredOrders) {
    const notificationSent = order.notifications.some(n => n.type === 'delivery_completed');
    
    if (!notificationSent) {
      await notificationService.sendOrderNotification(order._id, 'delivery_completed');
      
      // If media was captured, send media notification after 1 hour
      if (order.requireMediaCapture && order.mediaAssets.length > 0) {
        setTimeout(async () => {
          const mediaSent = order.notifications.some(n => n.type === 'media_available');
          if (!mediaSent) {
            await notificationService.sendOrderNotification(order._id, 'media_available');
          }
        }, 60 * 60 * 1000); // 1 hour delay
      }
    }
  }

  console.log(`✅ Checked ${deliveredOrders.length} delivered orders`);
}

console.log('⏰ Cron jobs initialized');