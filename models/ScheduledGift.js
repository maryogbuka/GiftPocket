// models/ScheduledGift.js
import mongoose from "mongoose";

const CartItemSchema = new mongoose.Schema({
  name: String,
  price: Number,
  quantity: Number,
  image: String,
  giftId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gift'
  }
});

const UpdateSchema = new mongoose.Schema({
  status: String,
  title: String,
  description: String,
  timestamp: {
    type: Date,
    default: Date.now
  },
  location: String,
  notes: String
});

const ScheduledGiftSchema = new mongoose.Schema(
  {
    // Customer Information
    customerEmail: { 
      type: String, 
      required: true,
      index: true 
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    
    // Recipient Information
    recipientName: { 
      type: String, 
      required: true 
    },
    recipientPhone: { 
      type: String, 
      required: true 
    },
    recipientEmail: String,
    relationship: String,
    
    // Delivery Information
    recipientAddress: { type: String, required: true },
    recipientCity: { type: String, required: true },
    recipientState: { type: String, required: true },
    deliveryDate: { 
      type: Date, 
      required: true 
    },
    deliveryTime: String,
    
    // Gift Details
    cartItems: [CartItemSchema],
    totalAmount: { 
      type: Number, 
      required: true 
    },
    
    // Personalization
    personalMessage: String,
    specialInstructions: String,
    giftWrap: { 
      type: Boolean, 
      default: false 
    },
    includeCard: { 
      type: Boolean, 
      default: false 
    },
    
    // Tracking
    trackingNumber: { 
      type: String, 
      unique: true,
      index: true 
    },
    status: { 
      type: String, 
      default: "scheduled",
      enum: ['scheduled', 'processing', 'packaged', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'],
      index: true
    },
    
    // Delivery Updates
    updates: [UpdateSchema],
    
    // Carrier Information
    carrier: {
      type: String,
      default: 'GiftPocket Express'
    },
    carrierPhone: {
      type: String,
      default: '+234 700 GIFT NOW'
    },
    carrierTrackingId: String,
    
    // Delivery Agent
    deliveryAgent: {
      name: String,
      phone: String,
      vehicle: String
    },
    
    // Estimated & Actual Delivery
    estimatedDelivery: Date,
    actualDelivery: Date,
    
    // Payment Information
    paymentId: String,
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending'
    },
    
    // Surprise Feature
    isSurprise: {
      type: Boolean,
      default: true
    },
    
    // Additional Fields
    occasion: String,
    notes: String,
    
    // Analytics
    deliveryAttempts: {
      type: Number,
      default: 0
    }
  },
  { 
    timestamps: true 
  }
);

// Generate tracking number before saving
ScheduledGiftSchema.pre('save', function(next) {
  if (!this.trackingNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.random().toString(36).substr(2, 8).toUpperCase();
    this.trackingNumber = `NG-${year}${month}${day}-${random}`;
  }
  
  // Set estimated delivery (delivery date + 1 day buffer)
  if (!this.estimatedDelivery && this.deliveryDate) {
    const estDate = new Date(this.deliveryDate);
    estDate.setDate(estDate.getDate() + 1);
    this.estimatedDelivery = estDate;
  }
  
  // Add initial update if none exists
  if (this.updates.length === 0) {
    this.updates.push({
      status: 'scheduled',
      title: 'Gift Scheduled',
      description: 'Your surprise gift has been scheduled for delivery',
      location: 'Scheduled',
      notes: 'Recipient will be surprised on delivery day!'
    });
  }
  
  next();
});

// Virtual for days until delivery
ScheduledGiftSchema.virtual('daysUntil').get(function() {
  if (!this.deliveryDate) return null;
  const today = new Date();
  const delivery = new Date(this.deliveryDate);
  const diffTime = delivery - today;
  const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return days > 0 ? days : 0;
});

// Virtual for formatted address
ScheduledGiftSchema.virtual('fullAddress').get(function() {
  return `${this.recipientAddress}, ${this.recipientCity}, ${this.recipientState}`;
});

// Indexes for better performance
ScheduledGiftSchema.index({ customerEmail: 1, status: 1 });
ScheduledGiftSchema.index({ deliveryDate: 1, status: 1 });
ScheduledGiftSchema.index({ createdAt: -1 });

export default mongoose.models.ScheduledGift ||
  mongoose.model("ScheduledGift", ScheduledGiftSchema);