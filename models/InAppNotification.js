// models/InAppNotification.js
import mongoose from 'mongoose';

const InAppNotificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    index: true
  },
  type: {
    type: String,
    enum: [
      'order_confirmation',
      'week_before_delivery',
      'three_days_before',
      'day_before',
      'delivery_day',
      'delivery_completed',
      'media_available',
      'system',
      'admin'
    ],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  actionUrl: String,
  actionLabel: String,
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  }
}, {
  timestamps: true
});

// Index for fetching unread notifications
InAppNotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

// Method to mark as read
InAppNotificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  return this.save();
};

// Method to archive
InAppNotificationSchema.methods.archive = function() {
  this.isArchived = true;
  return this.save();
};

// Static method to get user notifications
InAppNotificationSchema.statics.getUserNotifications = async function(userId, limit = 20) {
  return this.find({
    userId,
    isArchived: false,
    expiresAt: { $gt: new Date() }
  })
  .sort({ createdAt: -1 })
  .limit(limit)
  .populate('orderId', 'orderId status');
};

// Static method to mark all as read
InAppNotificationSchema.statics.markAllAsRead = async function(userId) {
  return this.updateMany(
    { userId, isRead: false },
    { isRead: true }
  );
};

export default mongoose.models.InAppNotification || mongoose.model('InAppNotification', InAppNotificationSchema);