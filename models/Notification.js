// models/Notification.js
import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  // Who this notification is for
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // What triggered this notification
  triggerId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'triggerModel'
  },
  triggerModel: {
    type: String,
    enum: ['Order', 'Gift', 'Payment', 'System'],
    default: 'System'
  },
  
  // Notification details
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: [
      'order_confirmation',
      'order_shipped',
      'order_delivered',
      'order_cancelled',
      'payment_success',
      'payment_failed',
      'gift_reminder',
      'delivery_scheduled',
      'delivery_tomorrow',
      'delivery_today',
      'system_alert',
      'promotion'
    ],
    required: true,
    index: true
  },
  
  // Status
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  isArchived: {
    type: Boolean,
    default: false,
    index: true
  },
  
  // Additional data
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Links
  actionUrl: String,
  actionLabel: String,
  
  // Expiry
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  }
}, {
  timestamps: true
});

// Indexes for faster queries
NotificationSchema.index({ userId: 1, isRead: 1, isArchived: 1 });
NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ type: 1, isRead: 1 });

// Instance methods
NotificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  return this.save();
};

NotificationSchema.methods.archive = function() {
  this.isArchived = true;
  return this.save();
};

export default mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);