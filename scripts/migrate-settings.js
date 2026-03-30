// scripts/migrate-settings.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '@/models/User';

dotenv.config();

const defaultSettings = {
  notifications: {
    transactionAlerts: true,
    giftReminders: true,
    marketingEmails: false,
    pushNotifications: true,
    soundEffects: true,
    securityAlerts: true,
    balanceUpdates: true
  },
  // ... rest of default settings
};

async function migrateSettings() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to database');

    // Find users without settings
    const usersWithoutSettings = await User.find({
      $or: [
        { settings: { $exists: false } },
        { settings: null }
      ]
    });

    console.log(`Found ${usersWithoutSettings.length} users without settings`);

    // Add default settings to each user
    for (const user of usersWithoutSettings) {
      await User.updateOne(
        { _id: user._id },
        { $set: { settings: defaultSettings } }
      );
      console.log(`Updated settings for user: ${user.email}`);
    }

    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateSettings();