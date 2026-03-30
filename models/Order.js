// models/Order.js
import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema({
  giftId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gift'
  },
  name: String,
  price: Number,
  quantity: Number,
  wrapType: String,
  wrapCost: Number
});

const OrderSchema = new mongoose.Schema({
  // Order identification
  orderId: {
    type: String,
    unique: true,
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Customer info
  customerEmail: String,
  customerName: String,
  customerPhone: String,
  
  // Recipient info
  recipientName: String,
  recipientPhone: String,
  recipientEmail: String,
  recipientAddress: {
    street: String,
    city: String,
    state: String,
    country: { type: String, default: 'Nigeria' }
  },
  
  // Order details
  items: [OrderItemSchema],
  subtotal: Number,
  deliveryFee: Number,
  giftWrapCost: Number,
  totalAmount: Number,
  
  // Delivery info
  scheduledDate: Date,
  deliveryDate: Date,
  deliveryTime: String,
  actualDeliveryDate: Date,
  
  // Status tracking
  status: {
    type: String,
    enum: [
      'pending',
      'confirmed',
      'processing',
      'packaged',
      'shipped',
      'out_for_delivery',
      'delivered',
      'cancelled',
      'failed'
    ],
    default: 'pending',
    index: true
  },
  
  // Tracking
  trackingNumber: String,
  carrier: String,
  carrierTrackingId: String,
  
  // Payment
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: String,
  paymentId: String,
  
  // Personalization
  personalMessage: String,
  specialInstructions: String,
  occasion: String,
  relationship: String,
  isSurprise: { type: Boolean, default: true },
  
  // History
  statusHistory: [{
    status: String,
    changedAt: { type: Date, default: Date.now },
    notes: String
  }]
}, {
  timestamps: true
});

// Generate order ID before saving
OrderSchema.pre('save', function(next) {
  if (!this.orderId) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.random().toString(36).substr(2, 6).toUpperCase();
    this.orderId = `ORD-${year}${month}${day}-${random}`;
  }
  
  // Add to status history if status changed
  if (this.isModified('status')) {
    this.statusHistory.push({
      status: this.status,
      notes: 'Status updated'
    });
  }
  
  next();
});

// Create indexes
OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ status: 1, deliveryDate: 1 });

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);