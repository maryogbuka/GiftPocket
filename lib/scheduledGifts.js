// app/lib/scheduledGifts.js

import mongoose from 'mongoose';

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI;



let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('✅ MongoDB connected successfully');
      return mongoose;
    }).catch((error) => {
      console.error('❌ MongoDB connection error:', error);
      throw error;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}

// Schema definitions
const cartItemSchema = new mongoose.Schema({
  id: String,
  name: String,
  price: Number,
  quantity: Number,
  category: String,
  description: String
});

const scheduledGiftSchema = new mongoose.Schema({
  customerEmail: { type: String, required: true, index: true },
  recipientName: { type: String, required: true },
  recipientEmail: { type: String, required: false, default: null, },
  recipientPhone: { type: String, required: true },
  recipientAddress: { type: String, required: true },
  recipientCity: { type: String, required: true },
  recipientState: { type: String, required: true },
  relationship: { type: String, required: true },
  deliveryDate: { type: String, required: true },
  deliveryTime: { type: String, required: true },
  personalMessage: String,
  specialInstructions: String,
  giftWrap: { type: Boolean, default: false },
  includeCard: { type: Boolean, default: false },
  trackingNumber: { type: String, required: true, unique: true },
  cartItems: [cartItemSchema],
  totalAmount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['scheduled', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'scheduled'
  }
}, {
  timestamps: true
});

// Safe model definition
function getScheduledGiftModel() {
  if (mongoose.models && mongoose.models.ScheduledGift) {
    return mongoose.models.ScheduledGift;
  } else {
    return mongoose.model('ScheduledGift', scheduledGiftSchema);
  }
}

// Export functions
export async function addScheduledGift(giftData) {
  try {
    await connectDB();
    const ScheduledGift = getScheduledGiftModel();
    
    const gift = new ScheduledGift(giftData);
    const savedGift = await gift.save();
    
    console.log('✅ Gift saved to MongoDB:', savedGift);
    return savedGift;
  } catch (error) {
    console.error('❌ Error saving gift to database:', error);
    throw error;
  }
}

export async function getScheduledGiftsByEmail(email) {
  try {
    if (!email) return [];
    
    await connectDB();
    const ScheduledGift = getScheduledGiftModel();
    
    const gifts = await ScheduledGift.find({ customerEmail: email })
      .sort({ createdAt: -1 })
      .lean();
    
    console.log(`✅ Found ${gifts.length} gifts for ${email}`);
    return gifts;
  } catch (error) {
    console.error('❌ Error fetching gifts from database:', error);
    return [];
  }
}