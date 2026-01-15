import Flutterwave from 'flutterwave-node-v3';

const flw = new Flutterwave(
  process.env.FLUTTERWAVE_PUBLIC_KEY,
  process.env.FLUTTERWAVE_SECRET_KEY
);

// Production vs Test mode
const isProduction = process.env.NODE_ENV === 'production';
const baseUrl = isProduction 
  ? 'https://api.flutterwave.com/v3'
  : 'https://api.flutterwave.com/v3';

export { flw, baseUrl, isProduction };