// scripts/migrateScheduledGifts.js
require('dotenv').config();
const mongoose = require('mongoose');
const ScheduledGift = require('../app/models/ScheduledGift');

async function migrate() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Find all scheduled gifts without updates array
    const gifts = await ScheduledGift.find({ 
      $or: [
        { updates: { $exists: false } },
        { carrier: { $exists: false } },
        { estimatedDelivery: { $exists: false } }
      ]
    });
    
    console.log(`Found ${gifts.length} gifts to migrate`);
    
    for (const gift of gifts) {
      // Add missing fields
      const updates = [];
      
      // Add initial update if doesn't exist
      if (!gift.updates || gift.updates.length === 0) {
        updates.push({
          status: gift.status || 'scheduled',
          title: getDefaultTitle(gift.status),
          description: getDefaultDescription(gift.status),
          timestamp: gift.createdAt || new Date(),
          location: 'Initial',
          notes: 'Migrated from old data'
        });
      }
      
      // Set estimated delivery if not exists
      let estimatedDelivery = gift.estimatedDelivery;
      if (!estimatedDelivery && gift.deliveryDate) {
        const estDate = new Date(gift.deliveryDate);
        estDate.setDate(estDate.getDate() + 1);
        estimatedDelivery = estDate;
      }
      
      // Update the gift
      await ScheduledGift.findByIdAndUpdate(gift._id, {
        $set: {
          updates: updates,
          carrier: gift.carrier || 'GiftPocket Express',
          carrierPhone: gift.carrierPhone || '+234 700 GIFT NOW',
          estimatedDelivery: estimatedDelivery,
          isSurprise: gift.isSurprise !== undefined ? gift.isSurprise : true
        }
      });
      
      console.log(`Migrated gift: ${gift.trackingNumber}`);
    }
    
    console.log('Migration completed!');
    process.exit(0);
    
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

function getDefaultTitle(status) {
  const titles = {
    'scheduled': 'Gift Scheduled',
    'processing': 'Processing',
    'packaged': 'Packaged',
    'shipped': 'Shipped',
    'out_for_delivery': 'Out for Delivery',
    'delivered': 'Delivered',
    'cancelled': 'Cancelled'
  };
  return titles[status] || status;
}

function getDefaultDescription(status) {
  const descriptions = {
    'scheduled': 'Your gift has been scheduled for delivery',
    'processing': 'Your gift is being prepared for delivery',
    'packaged': 'Gift has been beautifully packaged',
    'shipped': 'Your gift has been dispatched for delivery',
    'out_for_delivery': 'Your gift is on its way to the recipient',
    'delivered': 'Gift delivered to recipient successfully',
    'cancelled': 'Order has been cancelled'
  };
  return descriptions[status] || 'Status update';
}

migrate();