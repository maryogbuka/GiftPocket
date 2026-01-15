// models/Order.js
import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  // Order Identification
  orderId: {
    type: String,
    required: true,
    unique: true,
    default: () => `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
  },
  
  // User Information
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true
  },
  userEmail: {
    type: String,
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  
  // Gift Items
  gifts: [{
    giftId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Gift',
      required: true
    },
    name: String,
    quantity: { 
      type: Number, 
      default: 1,
      min: 1
    },
    price: { 
      type: Number, 
      required: true 
    },
    image: String,
    customization: {
      type: Map,
      of: String
    }
  }],
  
  // Order Totals
  subtotal: { 
    type: Number, 
    required: true 
  },
  deliveryFee: {
    type: Number,
    default: 0
  },
  tax: {
    type: Number,
    default: 0
  },
  discount: {
    type: Number,
    default: 0
  },
  totalAmount: { 
    type: Number, 
    required: true 
  },
  
  // Payment Information
  paymentStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'partially_refunded'],
    default: 'pending',
    index: true
  },
  paymentMethod: {
    type: String,
    enum: ['wallet', 'card', 'bank_transfer', 'virtual_account', 'cash_on_delivery'],
    required: true
  },
  paymentReference: String,
  paymentDate: Date,
  
  // Order Status & Timeline
  status: { 
    type: String, 
    enum: [
      'pending',           // Order placed, awaiting confirmation
      'confirmed',         // Payment confirmed, order being prepared
      'processing',        // Gift being curated/packaged
      'ready_for_delivery', // Ready for pickup
      'assigned_to_courier', // Assigned to delivery partner
      'picked_up',         // Courier picked up
      'in_transit',        // On the way to recipient
      'out_for_delivery',  // Near destination
      'delivery_attempted', // Attempt made
      'delivered',         // Successfully delivered
      'failed',            // Delivery failed
      'cancelled',         // Order cancelled
      'refunded'           // Order refunded
    ],
    default: 'pending',
    index: true
  },
  
  // Delivery Information
  scheduledDate: {
    type: Date,
    required: true,
    index: true
  },
  deliveryTimeSlot: {
    type: String,
    enum: ['morning', 'afternoon', 'evening', 'anytime']
  },
  estimatedDeliveryDate: Date,
  actualDeliveryDate: Date,
  
  // Recipient Information
  shippingAddress: {
    recipientName: {
      type: String,
      required: true
    },
    recipientPhone: {
      type: String,
      required: true
    },
    recipientEmail: String,
    address: String,
    city: String,
    state: String,
    zipCode: String,
    country: {
      type: String,
      default: 'Nigeria'
    },
    landmark: String,
    deliveryInstructions: String
  },
  
  // Gift Message
  message: String,
  includeCard: {
    type: Boolean,
    default: true
  },
  cardMessage: String,
  
  // Media Capture
  requireMediaCapture: {
    type: Boolean,
    default: false
  },
  mediaPreferences: {
    photos: { type: Boolean, default: true },
    video: { type: Boolean, default: false },
    liveStream: { type: Boolean, default: false }
  },
  mediaAssets: [{
    type: {
      type: String,
      enum: ['photo', 'video', 'audio']
    },
    url: String,
    thumbnail: String,
    caption: String,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    },
    uploadedAt: Date
  }],
  
  // Delivery Agent
  deliveryAgent: {
    name: String,
    phone: String,
    company: String,
    vehicleNumber: String,
    trackingUrl: String,
    assignedAt: Date
  },
  
  // Admin Assignment
  assignedAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  giftCurator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  
  // Timeline & Milestones
  timeline: [{
    event: {
      type: String,
      enum: [
        'order_placed',
        'payment_confirmed',
        'order_confirmed',
        'gift_preparation_started',
        'gift_wrapped',
        'quality_check',
        'ready_for_pickup',
        'courier_assigned',
        'picked_up',
        'in_transit',
        'out_for_delivery',
        'delivery_attempted',
        'delivered',
        'media_captured',
        'media_sent',
        'customer_notified',
        'feedback_requested'
      ]
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    description: String,
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'timeline.performedByModel'
    },
    performedByModel: {
      type: String,
      enum: ['User', 'Admin']
    },
    metadata: mongoose.Schema.Types.Mixed
  }],
  
  // Notifications Sent
  notifications: [{
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
      ]
    },
    sentAt: Date,
    channel: {
      type: String,
      enum: ['email', 'sms', 'push', 'whatsapp']
    },
    status: {
      type: String,
      enum: ['pending', 'sent', 'delivered', 'read', 'failed']
    },
    messageId: String
  }],
  
  // Delivery Proof
  deliveryProof: {
    photo: String,
    signature: String,
    recipientName: String,
    deliveryNotes: String,
    deliveredBy: String,
    deliveredAt: Date
  },
  
  // Customer Feedback
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  review: String,
  feedbackSubmittedAt: Date,
  
  // Internal Notes
  adminNotes: [{
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    },
    note: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Analytics
  source: {
    type: String,
    enum: ['web', 'mobile', 'admin', 'api']
  },
  referralCode: String,
  
  // System Fields
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  
  // Soft Delete
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtuals
OrderSchema.virtual('deliveryStatus').get(function() {
  const now = new Date();
  const scheduled = new Date(this.scheduledDate);
  const diffDays = Math.ceil((scheduled - now) / (1000 * 60 * 60 * 24));
  
  if (this.status === 'delivered') return 'delivered';
  if (this.status === 'cancelled') return 'cancelled';
  if (diffDays > 7) return 'upcoming';
  if (diffDays > 3) return 'week_before';
  if (diffDays > 1) return 'three_days_before';
  if (diffDays === 1) return 'day_before';
  if (diffDays === 0) return 'today';
  return 'overdue';
});

OrderSchema.virtual('nextNotification').get(function() {
  const scheduled = new Date(this.scheduledDate);
  const now = new Date();
  const diffDays = Math.ceil((scheduled - now) / (1000 * 60 * 60 * 24));
  
  if (diffDays > 7) return { type: 'week_before_delivery', days: diffDays - 7 };
  if (diffDays > 3) return { type: 'three_days_before', days: diffDays - 3 };
  if (diffDays > 1) return { type: 'day_before', days: diffDays - 1 };
  if (diffDays === 1) return { type: 'delivery_day', days: 0 };
  return null;
});

// Methods
OrderSchema.methods.addTimelineEvent = function(event, description, performedBy = null, metadata = {}) {
  this.timeline.push({
    event,
    timestamp: new Date(),
    description,
    performedBy,
    performedByModel: performedBy ? 'Admin' : 'System',
    metadata
  });
  return this.save();
};

OrderSchema.methods.addNotification = function(type, channel = 'email', status = 'sent', messageId = null) {
  this.notifications.push({
    type,
    channel,
    status,
    sentAt: new Date(),
    messageId
  });
  return this.save();
};

OrderSchema.methods.assignToAdmin = function(adminId, role = 'gift_curator') {
  if (role === 'gift_curator') {
    this.giftCurator = adminId;
  } else {
    this.assignedAdmin = adminId;
  }
  return this.save();
};

// Indexes
OrderSchema.index({ 'shippingAddress.city': 1, scheduledDate: 1 });
OrderSchema.index({ status: 1, scheduledDate: 1 });
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);