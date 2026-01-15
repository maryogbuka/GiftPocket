// models/Wallet.js
import mongoose from "mongoose";

const WalletSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
    index: true
  },
  
  walletId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  balance: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  
  currency: {
    type: String,
    default: "NGN",
    enum: ["NGN", "USD", "EUR", "GBP"]
  },
  
  // Encrypted virtual account data
  encryptedVirtualAccount: {
    type: String,
    select: false // Never returned by default
  },
  
  // Virtual account metadata (non-sensitive)
  virtualAccountStatus: {
    type: String,
    enum: ["active", "inactive", "pending", "failed"],
    default: "pending"
  },
  
  virtualAccountNumber: {
    type: String,
    sparse: true
  },
  
  bankName: {
    type: String
  },
  
  // Security limits
  dailyLimit: {
    type: Number,
    default: 500000 // ₦500,000
  },
  
  transactionLimit: {
    type: Number,
    default: 100000 // ₦100,000 per transaction
  },
  
  // Statistics
  totalDeposited: {
    type: Number,
    default: 0
  },
  
  totalWithdrawn: {
    type: Number,
    default: 0
  },
  
  totalTransactions: {
    type: Number,
    default: 0
  },
  
  // Status
  status: {
    type: String,
    enum: ["active", "suspended", "frozen", "closed"],
    default: "active"
  },
  
  // Metadata
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  },
  
  lastTransactionAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Virtual getter for decrypted virtual account (requires special permission)
WalletSchema.virtual('virtualAccount').get(function() {
  // This would require decryption logic
  // Only callable by specific authorized functions
  return null;
});

// Methods to check limits
WalletSchema.methods.canWithdraw = function(amount) {
  if (this.status !== "active") return false;
  if (amount > this.balance) return false;
  if (amount > this.transactionLimit) return false;
  return true;
};

WalletSchema.methods.canDeposit = function(amount) {
  if (this.status !== "active") return false;
  // You could add deposit limits here
  return true;
};

// Pre-save hook
WalletSchema.pre("save", function(next) {
  this.updatedAt = Date.now();
  next();
});

const Wallet = mongoose.models.Wallet || mongoose.model("Wallet", WalletSchema);
export default Wallet;