// models/KYCVerification.js
import mongoose from "mongoose";

const KYCVerificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  
  // BVN Verification
  bvn: {
    type: String,
    sparse: true
  },
  bvnVerified: {
    type: Boolean,
    default: false
  },
  bvnData: {
    firstName: String,
    lastName: String,
    dateOfBirth: Date,
    phone: String,
    verifiedAt: Date
  },
  
  // Selfie/Liveness Verification
  selfieImage: String,
  selfieVerified: {
    type: Boolean,
    default: false
  },
  livenessScore: Number,
  livenessChecks: {
    multipleFaces: Boolean,
    faceConfidence: Number,
    eyesOpen: Boolean,
    notBlurred: Boolean
  },
  
  // NIN Verification
  nin: String,
  ninVerified: Boolean,
  ninData: mongoose.Schema.Types.Mixed,
  
  // Status
  verificationStatus: {
    type: String,
    enum: ["pending", "verified", "rejected", "expired"],
    default: "pending"
  },
  verifiedAt: Date,
  
  // Metadata
  attempts: {
    type: Number,
    default: 0
  },
  lastAttempt: Date,
  
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.KYCVerification || 
  mongoose.model("KYCVerification", KYCVerificationSchema);