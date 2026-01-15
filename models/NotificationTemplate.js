// models/NotificationTemplate.js
import mongoose from 'mongoose';

const NotificationTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: [
      'order_confirmation',
      'payment_confirmation',
      'order_processing',
      'week_before_delivery',
      'three_days_before',
      'day_before',
      'delivery_day',
      'out_for_delivery',
      'delivery_completed',
      'media_available',
      'thank_you',
      'feedback_request'
    ],
    required: true,
    index: true
  },
  channel: {
    type: String,
    enum: ['email', 'sms', 'push', 'whatsapp', 'all'],
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  variables: [String],
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.models.NotificationTemplate || mongoose.model('NotificationTemplate', NotificationTemplateSchema);