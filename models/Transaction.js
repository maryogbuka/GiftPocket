// models/Transaction.js
import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  // Reference fields
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  walletId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Wallet",
    required: true,
  },
  
  // Transaction details
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  type: {
    type: String,
    enum: ["credit", "debit", "transfer", "refund"],
    required: true,
  },
  category: {
    type: String,
    enum: ["topup", "gift", "withdrawal", "fee", "refund", "transfer", "other"],
    default: "other",
  },
  
  // Status and tracking
  status: {
    type: String,
    enum: ["pending", "completed", "failed", "cancelled"],
    default: "pending",
  },
  reference: {
    type: String,
    required: true,
    unique: true,
  },
  externalReference: String, // For Flutterwave transaction ID
  
  // Descriptive fields
  description: {
    type: String,
    required: true,
  },
  narration: String,
  
  // Party information
  sender: {
    type: String,
    required: function() { return this.type === "debit"; }
  },
  recipient: {
    type: String,
    required: function() { return this.type === "credit"; }
  },
  recipientEmail: String,
  recipientPhone: String,
  
  // Balance tracking
  balanceBefore: Number,
  balanceAfter: Number,
  
  // Payment method
  paymentMethod: {
    type: String,
    enum: ["virtual_account", "card", "transfer", "wallet", "bank", "ussd", "qr"],
  },
  
  // Virtual account specific
  virtualAccount: String,
  bankName: String,
  bankCode: String,
  
  // Metadata
  metadata: {
    type: Object,
    default: {},
  },
  
  // Webhook data
  webhookData: {
    type: Object,
    default: {},
  },
}, {
  timestamps: true,
});

// Indexes for performance
transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ reference: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ type: 1 });
transactionSchema.index({ createdAt: -1 });
transactionSchema.index({ walletId: 1 });

// Virtual for formatted amount
transactionSchema.virtual('formattedAmount').get(function() {
  return `₦${this.amount.toLocaleString()}`;
});

// Method to mark as completed
transactionSchema.methods.markAsCompleted = async function(balanceAfter) {
  this.status = "completed";
  this.balanceAfter = balanceAfter;
  await this.save();
};

const Transaction = mongoose.models.Transaction || mongoose.model("Transaction", transactionSchema);

export default Transaction;