// models/User.js - Updated
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
  
  password: {
    type: String,
    required: [true, "Please provide a password"],
    select: false,
    minlength: [8, "Password must be at least 8 characters"],
  },

  // Security fields
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  
  twoFactorSecret: {
    type: String,
    select: false
  },
  
  failedLoginAttempts: {
    type: Number,
    default: 0,
    select: false
  },
  
  accountLockedUntil: {
    type: Date,
    select: false
  },
  
  lastLogin: {
    type: Date,
    select: false
  },
  
  loginHistory: [{
    ip: String,
    userAgent: String,
    timestamp: Date,
    success: Boolean
  }],

  // Wallet integration
  walletId: {
    type: String,
    unique: true,
    sparse: true,
    index: true
  },
  
  // Virtual account reference (encrypted data stored in Wallet model)
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
  
  kycVerifiedAt: {
    type: Date
  },
  
  resetToken: {
    type: String,
    select: false,
  },
  
  resetTokenExpiry: {
    type: Number,
    select: false,
  },
  
  // Account status
  status: {
    type: String,
    enum: ["active", "suspended", "deactivated"],
    default: "active"
  },
  
  // Audit fields
  createdAt: {
    type: Date,
    default: Date.now,
  },
  
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  
  deletedAt: {
    type: Date,
    select: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for account age
UserSchema.virtual('accountAge').get(function() {
  return Math.floor((new Date() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Update the updatedAt field on save
UserSchema.pre("save", function(next) {
  this.updatedAt = Date.now();
  next();
});

// Soft delete support
UserSchema.methods.softDelete = function() {
  this.deletedAt = new Date();
  this.status = "deactivated";
  return this.save();
};

// Check if account is locked
UserSchema.methods.isLocked = function() {
  if (this.accountLockedUntil && new Date() < this.accountLockedUntil) {
    return true;
  }
  return false;
};

// Reset failed login attempts
UserSchema.methods.resetFailedLogins = function() {
  this.failedLoginAttempts = 0;
  this.accountLockedUntil = null;
  return this.save();
};

// Add login attempt
UserSchema.methods.addLoginAttempt = async function(success, ip, userAgent) {
  this.loginHistory.push({
    ip,
    userAgent,
    timestamp: new Date(),
    success
  });
  
  // Keep only last 10 login attempts
  if (this.loginHistory.length > 10) {
    this.loginHistory = this.loginHistory.slice(-10);
  }
  
  if (success) {
    this.failedLoginAttempts = 0;
    this.accountLockedUntil = null;
    this.lastLogin = new Date();
  } else {
    this.failedLoginAttempts += 1;
    
    // Lock account after 5 failed attempts for 15 minutes
    if (this.failedLoginAttempts >= 5) {
      this.accountLockedUntil = new Date(Date.now() + 15 * 60 * 1000);
    }
  }
  
  return this.save();
};

// If model exists, use it; otherwise create it
const User = mongoose.models.User || mongoose.model("User", UserSchema);
export default User;