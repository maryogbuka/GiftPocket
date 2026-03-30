// services/notificationService.js
import Notification from '@/models/Notification';

export class NotificationService {
  static async createOrderNotification(userId, order, type) {
    let title = '';
    let message = '';
    let notificationType = '';
    
    switch(type) {
      case 'order_confirmed':
        title = '🎉 Order Confirmed!';
        message = `Your order ${order.orderId} has been confirmed and is being processed.`;
        notificationType = 'order_confirmation';
        break;
      case 'order_shipped':
        title = '📦 Order Shipped!';
        message = `Your order ${order.orderId} is on its way! Track it with code: ${order.trackingNumber}`;
        notificationType = 'order_shipped';
        break;
      case 'order_delivered':
        title = '✅ Order Delivered!';
        message = `Your order ${order.orderId} has been delivered to ${order.recipientName}. Hope they love it!`;
        notificationType = 'order_delivered';
        break;
      case 'delivery_scheduled':
        title = '📅 Delivery Scheduled';
        message = `Your gift will be delivered on ${new Date(order.scheduledDate).toLocaleDateString()}.`;
        notificationType = 'delivery_scheduled';
        break;
      case 'delivery_tomorrow':
        title = '🎁 Delivery Tomorrow!';
        message = `Your gift to ${order.recipientName} will be delivered tomorrow. Get excited!`;
        notificationType = 'delivery_tomorrow';
        break;
      case 'delivery_today':
        title = '🚚 Delivery Today!';
        message = `Today's the day! Your gift is being delivered to ${order.recipientName}.`;
        notificationType = 'delivery_today';
        break;
      default:
        return null;
    }
    
    const notification = await Notification.create({
      userId,
      triggerId: order._id,
      triggerModel: 'Order',
      title,
      message,
      type: notificationType,
      metadata: {
        orderId: order.orderId,
        amount: order.totalAmount,
        recipientName: order.recipientName,
        trackingNumber: order.trackingNumber
      },
      actionUrl: `/me/orders/${order._id}`,
      actionLabel: 'View Order'
    });
    
    return notification;
  }
  
  static async createPaymentNotification(userId, payment, type) {
    const notifications = {
      payment_success: {
        title: '💳 Payment Successful',
        message: `Payment of ₦${payment.amount.toLocaleString()} completed successfully.`
      },
      payment_failed: {
        title: '⚠️ Payment Failed',
        message: `Payment attempt failed. Please try again or use another method.`
      }
    };
    
    if (!notifications[type]) return null;
    
    const { title, message } = notifications[type];
    
    return await Notification.create({
      userId,
      triggerId: payment._id,
      triggerModel: 'Payment',
      title,
      message,
      type,
      metadata: {
        amount: payment.amount,
        method: payment.method
      },
      actionUrl: '/me/wallet',
      actionLabel: 'View Wallet'
    });
  }
}