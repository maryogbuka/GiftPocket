// models/ScheduledGift.js
import mongoose from "mongoose";

const ScheduledGiftSchema = new mongoose.Schema(
  {
    customerEmail: { type: String, required: true },

    recipientName: String,
    recipientPhone: String,

    deliveryDate: String,
    deliveryTime: String,

    personalMessage: String,
    specialInstructions: String,

    giftWrap: Boolean,
    includeCard: Boolean,

    trackingNumber: String,

    cartItems: [
      {
        name: String,
        price: Number,
        quantity: Number,
        image: String,
      }
    ],

    totalAmount: Number,

    recipientAddress: String,
    recipientCity: String,
    recipientState: String,

    relationship: String,

    status: { type: String, default: "scheduled" }
  },
  { timestamps: true }
);

export default mongoose.models.ScheduledGift ||
  mongoose.model("ScheduledGift", ScheduledGiftSchema);
