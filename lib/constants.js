// lib/constants.js
export const APP_NAME = 'GiftPocket';
export const SUPPORT_EMAIL = 'support@giftpocket.com';

export const TRANSACTION_TYPES = {
  CREDIT: 'credit',
  DEBIT: 'debit',
};

export const TRANSACTION_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
};

export const GIFT_CATEGORIES = [
  { value: 'electronics', label: 'Electronics' },
  { value: 'fashion', label: 'Fashion' },
  { value: 'home', label: 'Home & Living' },
  { value: 'experience', label: 'Experiences' },
  { value: 'other', label: 'Other' },
];

export const SCHEDULED_GIFT_STATUS = {
  SCHEDULED: 'scheduled',
  PROCESSING: 'processing',
  SENT: 'sent',
  CANCELLED: 'cancelled',
  FAILED: 'failed',
};

export const API_RATE_LIMIT = {
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  MAX_REQUESTS: 100,
};