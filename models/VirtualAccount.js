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
    default: "",
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

export default mongoose.models.VirtualAccount ||
  mongoose.model('VirtualAccount', virtualAccountSchema);
