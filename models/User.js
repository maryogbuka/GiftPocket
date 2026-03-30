// models/User.js - MUST HAVE PHONE FIELD
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a name"],
    trim: true,
    maxlength: [100, "Name cannot exceed 100 characters"]
  },

  email: {
    type: String,
    required: [true, "Please provide an email"],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    index: true
  },

  // ⭐⭐ MUST HAVE PHONE FIELD ⭐⭐
  phone: {
    type: String,
    required: [true, "Please provide a phone number"],
    unique: true,
    trim: true,
    match: [/^[0-9]{11}$/, "Please provide a valid 11-digit Nigerian phone number"],
    index: true
  },
  
  password: {
    type: String,
    required: [true, "Please provide a password"],
    select: false,
    minlength: [8, "Password must be at least 8 characters"],
  },

  // Wallet integration
  walletId: {
    type: String,
    unique: true,
    index: true
  },
  
  // Virtual account reference
  hasVirtualAccount: {
    type: Boolean,
    default: false
  },
  
  // KYC Status
  kycStatus: {
    type: String,
    enum: ["pending", "verified", "rejected", "not_required"],
    default: "pending"
  },
  
  referralCode: {
    type: String,
    uppercase: true,
    unique: true,
    sparse: true
  },
  
  referredBy: {
    type: String,
    uppercase: true
  },
  
  // Account status
  status: {
    type: String,
    enum: ["active", "suspended", "deactivated"],
    default: "active"
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
  },
  
  updatedAt: {
    type: Date,
    default: Date.now,
  }
}, {
  timestamps: true
});

// Add pre-save middleware for referral code
UserSchema.pre('save', async function(next) {
  if (!this.referralCode) {
    const generateCode = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let code = '';
      for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return code;
    };
    
    let isUnique = false;
    while (!isUnique) {
      const code = generateCode();
      const existing = await mongoose.models.User.findOne({ referralCode: code });
      if (!existing) {
        this.referralCode = code;
        isUnique = true;
      }
    }
  }
  next();
});

export default mongoose.models.User || mongoose.model("User", UserSchema);