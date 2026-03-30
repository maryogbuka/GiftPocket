// lib/flutterwave-integration.js
import axios from 'axios';

// Initialize Flutterwave API
const FLUTTERWAVE_BASE_URL = 'https://api.flutterwave.com/v3';
const FLUTTERWAVE_SECRET_KEY = process.env.FLUTTERWAVE_SECRET_KEY;

const flutterwaveClient = axios.create({
  baseURL: FLUTTERWAVE_BASE_URL,
  headers: {
    'Authorization': `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
    'Content-Type': 'application/json',
  },
});

/**
 * Verify BVN with Flutterwave
 * @param {string} bvn - 11-digit BVN
 */
export const verifyBVN = async (bvn) => {
  try {
    // For development/testing, you can mock the response
    if (process.env.NODE_ENV === 'development' && !FLUTTERWAVE_SECRET_KEY) {
      console.log('Mocking BVN verification for development');
      return {
        status: 'success',
        message: 'BVN details fetched',
        data: {
          first_name: 'Test',
          last_name: 'User',
          phone_number: '08012345678',
          date_of_birth: '1990-01-01',
        }
      };
    }

    const response = await flutterwaveClient.post('/kyc/bvns', {
      bvn: bvn
    });

    return response.data;
  } catch (error) {
    console.error('BVN Verification Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'BVN verification failed');
  }
};

/**
 * Generate virtual account via Flutterwave
 * @param {Object} userData - User data for virtual account
 */
export const generateVirtualAccount = async (userData) => {
  try {
    const { email, name, phone, bvn, is_permanent = true, tx_ref } = userData;

    // For development/testing, mock response
    if (process.env.NODE_ENV === 'development' && !FLUTTERWAVE_SECRET_KEY) {
      console.log('Mocking virtual account generation for development');
      const mockAccountNumber = `7${Math.floor(1000000000 + Math.random() * 9000000000)}`;
      return {
        status: 'success',
        message: 'Virtual account created',
        data: {
          order_ref: tx_ref || `REF_${Date.now()}`,
          account_number: mockAccountNumber,
          bank_name: 'WEMA BANK',
          flw_ref: `FLWREF_${Date.now()}`,
          created_at: new Date().toISOString()
        }
      };
    }

    const response = await flutterwaveClient.post('/virtual-account-numbers', {
      email: email,
      is_permanent: is_permanent,
      bvn: bvn,
      tx_ref: tx_ref,
      phonenumber: phone,
      firstname: name.split(' ')[0],
      lastname: name.split(' ').slice(1).join(' ') || name.split(' ')[0],
      narration: `${name} GiftPocket Account`
    });

    if (response.data.status === 'success') {
      return {
        account_number: response.data.data.account_number,
        bank_name: response.data.data.bank_name,
        flw_ref: response.data.data.flw_ref,
        order_ref: response.data.data.order_ref,
        created_at: response.data.data.created_at
      };
    } else {
      throw new Error(response.data.message || 'Failed to generate virtual account');
    }
  } catch (error) {
    console.error('Virtual Account Generation Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Virtual account generation failed');
  }
};

/**
 * Verify virtual account transaction
 */
export const verifyTransaction = async (transactionId) => {
  try {
    const response = await flutterwaveClient.get(`/transactions/${transactionId}/verify`);
    return response.data;
  } catch (error) {
    console.error('Transaction Verification Error:', error);
    throw error;
  }
};

// Create an object first, then export it as default
const flutterwaveIntegration = {
  verifyBVN,
  generateVirtualAccount,
  verifyTransaction
};

export default flutterwaveIntegration;