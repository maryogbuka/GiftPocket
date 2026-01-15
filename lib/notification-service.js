// lib/notification-service.js
import { Resend } from 'resend';
import Order from '@/models/Order';
import User from '@/models/User';
import NotificationTemplate from '@/models/NotificationTemplate';

class NotificationService {
  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  // Send notification (email + in-app)
  async sendOrderNotification(orderId, notificationType) {
    try {
      const order = await Order.findById(orderId)
        .populate('userId', 'name email')
        .populate('gifts.giftId', 'name image');

      if (!order) {
        throw new Error('Order not found');
      }

      // Get user for in-app notification
      const user = await User.findById(order.userId);

      // Send email via Resend
      const emailResult = await this.sendEmailNotification(order, notificationType);
      
      // Create in-app notification
      const inAppResult = await this.createInAppNotification(user._id, orderId, notificationType);

      // Record both notifications
      await order.addNotification(notificationType, 'email', 'sent', emailResult.id);
      await order.addNotification(notificationType, 'in_app', 'sent', inAppResult.notificationId);

      console.log(`✅ ${notificationType} notification sent for order ${orderId}`);
      return { email: emailResult, inApp: inAppResult };

    } catch (error) {
      console.error(`❌ Failed to send ${notificationType} notification:`, error);
      
      // Record failure
      await Order.findByIdAndUpdate(orderId, {
        $push: {
          notifications: {
            type: notificationType,
            channel: 'email',
            status: 'failed',
            sentAt: new Date()
          }
        }
      });
      
      throw error;
    }
  }

  // Send Email via Resend
  async sendEmailNotification(order, notificationType) {
    const data = this.prepareNotificationData(order, notificationType);
    
    // Get email template
    const template = await this.getEmailTemplate(notificationType, data);
    
    const emailData = {
      from: 'GiftPocket <notifications@giftpocket.com>',
      to: order.userEmail,
      subject: template.subject,
      html: template.content,
      reply_to: 'support@giftpocket.com'
    };

    const result = await this.resend.emails.send(emailData);
    return result;
  }

  // Create In-App Notification
  async createInAppNotification(userId, orderId, notificationType) {
    const notification = await InAppNotification.create({
      userId,
      orderId,
      type: notificationType,
      title: this.getNotificationTitle(notificationType),
      message: this.getNotificationMessage(notificationType),
      isRead: false,
      createdAt: new Date()
    });

    // Real-time update via WebSocket (optional)
    this.sendRealTimeNotification(userId, notification);

    return notification;
  }

  // Prepare notification data
  prepareNotificationData(order, notificationType) {
    const scheduledDate = new Date(order.scheduledDate);
    const now = new Date();
    const daysUntil = Math.ceil((scheduledDate - now) / (1000 * 60 * 60 * 24));

    return {
      // Order Details
      orderId: order.orderId,
      orderDate: order.createdAt.toLocaleDateString(),
      scheduledDate: scheduledDate.toLocaleDateString(),
      deliveryDate: scheduledDate.toLocaleDateString(),
      deliveryTime: order.deliveryTimeSlot,
      
      // Customer Details
      customerName: order.userName,
      customerEmail: order.userEmail,
      
      // Recipient Details
      recipientName: order.shippingAddress.recipientName,
      recipientAddress: order.shippingAddress.address,
      recipientCity: order.shippingAddress.city,
      recipientPhone: order.shippingAddress.recipientPhone,
      
      // Gift Details
      giftNames: order.gifts.map(g => g.name).join(', '),
      giftCount: order.gifts.length,
      totalAmount: `₦${order.totalAmount.toLocaleString()}`,
      
      // Delivery Info
      deliveryStatus: order.status,
      daysUntilDelivery: daysUntil,
      
      // Company Info
      companyName: 'GiftPocket',
      supportEmail: 'support@giftpocket.com',
      supportPhone: '+234 800 000 0000',
      website: 'https://giftpocket.com'
    };
  }

  // Get email template
  async getEmailTemplate(notificationType, data) {
    // Define templates inline (no database needed for templates)
    const templates = {
      order_confirmation: {
        subject: '🎁 Order Confirmed - GiftPocket',
        content: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #7c3aed;">🎁 Your Gift Order is Confirmed!</h2>
            <p>Hello ${data.customerName},</p>
            <p>Thank you for your order! We're excited to help you deliver joy to ${data.recipientName}.</p>
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <h3 style="color: #4b5563;">Order Details</h3>
              <p><strong>Order ID:</strong> ${data.orderId}</p>
              <p><strong>Recipient:</strong> ${data.recipientName}</p>
              <p><strong>Delivery Date:</strong> ${data.deliveryDate}</p>
              <p><strong>Total Amount:</strong> ${data.totalAmount}</p>
            </div>
            
            <p>You'll receive updates about your order as we prepare it for delivery.</p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p>Need help? <a href="mailto:support@giftpocket.com">Contact our support team</a></p>
              <p>View your order status: <a href="${data.website}/dashboard/orders/${data.orderId}">Track Order</a></p>
            </div>
          </div>
        `
      },
      week_before_delivery: {
        subject: '⏰ Your Gift Delivery is in 1 Week!',
        content: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #7c3aed;">⏰ Your Gift is Scheduled for Delivery Next Week!</h2>
            <p>Hello ${data.customerName},</p>
            <p>We wanted to remind you that your gift to ${data.recipientName} is scheduled for delivery in 1 week.</p>
            
            <div style="background: #fef3c7; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <h3 style="color: #92400e;">📅 Delivery Scheduled</h3>
              <p><strong>Date:</strong> ${data.deliveryDate}</p>
              <p><strong>Recipient:</strong> ${data.recipientName}</p>
              <p><strong>Address:</strong> ${data.recipientAddress}, ${data.recipientCity}</p>
            </div>
            
            <p>Our team is preparing the gift and will keep you updated throughout the process.</p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p>Need to make changes? <a href="${data.website}/dashboard/orders/${data.orderId}">Update Order</a></p>
              <p>Questions? <a href="mailto:support@giftpocket.com">We're here to help</a></p>
            </div>
          </div>
        `
      },
      three_days_before: {
        subject: '🎯 3 Days Until Your Gift Delivery!',
        content: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #7c3aed;">🎯 Your Gift Delivery is in 3 Days!</h2>
            <p>Hello ${data.customerName},</p>
            <p>Just a quick reminder that your gift to ${data.recipientName} will be delivered in 3 days.</p>
            
            <div style="background: #dbeafe; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <h3 style="color: #1e40af;">📦 Getting Ready</h3>
              <p>Your gift is currently being prepared and will soon be on its way!</p>
              <p><strong>Delivery Date:</strong> ${data.deliveryDate}</p>
            </div>
            
            <p>Excited? We are too! We'll send another update the day before delivery.</p>
          </div>
        `
      },
      day_before: {
        subject: '🚀 Tomorrow is the Big Day! Your Gift Delivery',
        content: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #7c3aed;">🚀 Tomorrow is Delivery Day!</h2>
            <p>Hello ${data.customerName},</p>
            <p>Great news! Your gift to ${data.recipientName} is scheduled for delivery tomorrow.</p>
            
            <div style="background: #dcfce7; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <h3 style="color: #166534;">📅 Delivery Tomorrow</h3>
              <p><strong>Date:</strong> ${data.deliveryDate}</p>
              <p><strong>Recipient:</strong> ${data.recipientName}</p>
              <p><strong>Address:</strong> ${data.recipientAddress}</p>
              ${data.deliveryTime ? `<p><strong>Time:</strong> ${data.deliveryTime}</p>` : ''}
            </div>
            
            <p>Our delivery team will handle everything with care. You'll receive another update when the gift is on its way!</p>
          </div>
        `
      },
      delivery_day: {
        subject: '📦 Your Gift is Out for Delivery Today!',
        content: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #7c3aed;">📦 Today is Delivery Day!</h2>
            <p>Hello ${data.customerName},</p>
            <p>Exciting news! Your gift to ${data.recipientName} is out for delivery today.</p>
            
            <div style="background: #fae8ff; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <h3 style="color: #86198f;">🎁 On the Way</h3>
              <p>The gift has been picked up by our delivery team and is on its way to ${data.recipientName}.</p>
              <p>We'll notify you once it's been successfully delivered!</p>
            </div>
            
            <p>Get ready to spread some joy! 🎉</p>
          </div>
        `
      },
      delivery_completed: {
        subject: '✅ Your Gift Has Been Delivered!',
        content: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #059669;">✅ Delivery Successful!</h2>
            <p>Hello ${data.customerName},</p>
            <p>Great news! Your gift has been successfully delivered to ${data.recipientName}.</p>
            
            <div style="background: #dcfce7; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <h3 style="color: #166534;">🎉 Delivery Confirmed</h3>
              <p><strong>Delivered To:</strong> ${data.recipientName}</p>
              <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
              <p><strong>Time:</strong> ${new Date().toLocaleTimeString()}</p>
            </div>
            
            ${order.requireMediaCapture ? `
              <div style="background: #fef3c7; padding: 20px; border-radius: 10px; margin: 20px 0;">
                <h3 style="color: #92400e;">📸 Media Capture</h3>
                <p>You requested media capture for this delivery. Our team will send you photos/videos shortly!</p>
              </div>
            ` : ''}
            
            <p>Thank you for choosing GiftPocket to help spread joy! We hope ${data.recipientName} loves the gift.</p>
            
            <div style="margin-top: 30px; padding: 20px; background: #f3f4f6; border-radius: 10px;">
              <h4>💬 We'd Love Your Feedback</h4>
              <p>How was your experience? <a href="${data.website}/feedback/${data.orderId}">Share your feedback</a></p>
            </div>
          </div>
        `
      },
      media_available: {
        subject: '📸 Your Gift Delivery Media is Ready!',
        content: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #7c3aed;">📸 Delivery Media Available</h2>
            <p>Hello ${data.customerName},</p>
            <p>As requested, we've captured media of your gift delivery to ${data.recipientName}.</p>
            
            <div style="background: #fef3c7; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <h3 style="color: #92400e;">🎁 Delivery Moments</h3>
              <p>You can view the captured media by visiting your order page:</p>
              <p style="text-align: center; margin: 20px 0;">
                <a href="${data.website}/dashboard/orders/${data.orderId}/media" 
                   style="background: #7c3aed; color: white; padding: 12px 24px; 
                          text-decoration: none; border-radius: 8px; display: inline-block;">
                  View Media
                </a>
              </p>
            </div>
            
            <p>These special moments have been preserved for you to cherish.</p>
          </div>
        `
      }
    };

    return templates[notificationType] || templates.order_confirmation;
  }

  // Get notification title for in-app
  getNotificationTitle(type) {
    const titles = {
      order_confirmation: '🎁 Order Confirmed',
      week_before_delivery: '⏰ Delivery in 1 Week',
      three_days_before: '🎯 3 Days Until Delivery',
      day_before: '🚀 Delivery Tomorrow',
      delivery_day: '📦 Out for Delivery',
      delivery_completed: '✅ Gift Delivered',
      media_available: '📸 Delivery Media Ready'
    };
    return titles[type] || 'New Notification';
  }

  // Get notification message for in-app
  getNotificationMessage(type) {
    const messages = {
      order_confirmation: 'Your gift order has been confirmed and is being prepared.',
      week_before_delivery: 'Your gift delivery is scheduled for next week.',
      three_days_before: 'Your gift will be delivered in 3 days.',
      day_before: 'Your gift delivery is scheduled for tomorrow.',
      delivery_day: 'Your gift is out for delivery today.',
      delivery_completed: 'Your gift has been successfully delivered.',
      media_available: 'Media from your gift delivery is now available.'
    };
    return messages[type] || 'You have a new notification';
  }

  // Send real-time notification via WebSocket
  sendRealTimeNotification(userId, notification) {
    // Implement WebSocket logic here
    // This would push to the user's dashboard in real-time
    console.log(`📢 Real-time notification sent to user ${userId}`);
  }
}

// Singleton instance
const notificationService = new NotificationService();
export default notificationService;