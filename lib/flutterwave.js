// lib/flutterwave.js
import Flutterwave from 'flutterwave-node-v3';

let flw = null;

const isProduction = process.env.NODE_ENV === 'production';
const baseUrl = 'https://api.flutterwave.com/v3';

// This will only run at runtime, not during build
const shouldInitialize = process.env.NEXT_PHASE !== 'phase-production-build' && 
                        typeof window === 'undefined' && // Ensure it's server-side
                        process.env.FLUTTERWAVE_PUBLIC_KEY && 
                        process.env.FLUTTERWAVE_SECRET_KEY;

if (shouldInitialize) {
  try {
    flw = new Flutterwave(
      process.env.FLUTTERWAVE_PUBLIC_KEY,
      process.env.FLUTTERWAVE_SECRET_KEY
    );
    console.log('✅ Flutterwave initialized');
  } catch (error) {
    console.error('Failed to initialize Flutterwave:', error);
  }
}

export function getFlw() {
  if (!flw) {
    throw new Error(
      'Flutterwave not initialized. ' +
      'Make sure your environment variables are set and you\'re not during build time.'
    );
  }
  return flw;
}

export { baseUrl, isProduction };