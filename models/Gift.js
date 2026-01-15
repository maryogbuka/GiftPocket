// models/Gift.js
import mongoose from 'mongoose';

const GiftSchema = new mongoose.Schema({
  // Basic Information
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  description: { 
    type: String, 
    required: true 
  },
  detailedDescription: String,
  
  // Pricing
  price: { 
    type: Number, 
    required: true,
    min: 0
  },
  comparePrice: Number, // For showing discounts
  costPrice: Number, // For profit calculation
  
  // Inventory
  sku: {
    type: String,
    unique: true,
    sparse: true
  },
  inStock: { 
    type: Boolean, 
    default: true 
  },
  stockQuantity: {
    type: Number,
    default: 0
  },
  lowStockThreshold: {
    type: Number,
    default: 10
  },
  
  // Categories & Tags
  category: { 
    type: String, 
    required: true,
    index: true
  },
  subCategory: String,
  tags: [String],
  
  // Images
  image: { 
    type: String, 
    required: true 
  },
  images: [String],
  
  // Specifications
  weight: Number,
  dimensions: {
    length: Number,
    width: Number,
    height: Number
  },
  
  // Curation Details
  isCurated: {
    type: Boolean,
    default: false
  },
  curationLevel: {
    type: String,
    enum: ['basic', 'premium', 'luxury', 'exclusive'],
    default: 'basic'
  },
  curationNotes: String,
  
  // Gift Details
  occasion: [{
    type: String,
    enum: ['birthday', 'anniversary', 'wedding', 'graduation', 'corporate', 'romantic', 'get_well', 'thank_you', 'holiday', 'other']
  }],
  recipient: [{
    type: String,
    enum: ['male', 'female', 'couple', 'family', 'kids', 'corporate', 'all']
  }],
  
  // Delivery Info
  requiresSpecialDelivery: {
    type: Boolean,
    default: false
  },
  deliveryNotes: String,
  estimatedPrepTime: {
    type: Number, // in hours
    default: 24
  },
  
  // Admin Fields
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  
  // Analytics
  timesOrdered: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  
  // Metadata
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

// Virtual for stock status
GiftSchema.virtual('stockStatus').get(function() {
  if (!this.inStock) return 'out_of_stock';
  if (this.stockQuantity <= 0) return 'out_of_stock';
  if (this.stockQuantity <= this.lowStockThreshold) return 'low_stock';
  return 'in_stock';
});

// Indexes
GiftSchema.index({ category: 1, price: 1 });
GiftSchema.index({ tags: 1 });
GiftSchema.index({ isCurated: 1, curationLevel: 1 });
GiftSchema.index({ featured: 1, createdAt: -1 });

export default mongoose.models.Gift || mongoose.model('Gift', GiftSchema);