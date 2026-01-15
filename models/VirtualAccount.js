// models/VirtualAccount.js
import mongoose from 'mongoose';

const virtualAccountSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  accountNumber: {
    type: String,
    required: true,
    unique: true,
  },
  bankName: {
    type: String,
    required: true,
  },
  bankCode: {
    type: String,
    required: true,
  },
  accountName: {
    type: String,
    required: true,
  },
  flwRef: {
    type: String,
    required: true,
    unique: true,
  },
  orderRef: {
    type: String,
    required: true,
    unique: true,
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    default: 'daily',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isPermanent: {
    type: Boolean,
    default: true,
  },
  expiresAt: {
    type: Date,
  },
  metaData: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, {
  timestamps: true,
});

// Index for faster queries
virtualAccountSchema.index({ userId: 1 });
virtualAccountSchema.index({ accountNumber: 1 });
virtualAccountSchema.index({ flwRef: 1 });

export default mongoose.models.VirtualAccount || mongoose.model('VirtualAccount', virtualAccountSchema);