import axios from 'axios';

export class FlutterwaveService {
  constructor() {
    this.secretKey = process.env.FLUTTERWAVE_SECRET_KEY;
    this.publicKey = process.env.FLUTTERWAVE_PUBLIC_KEY;
    this.encryptionKey = process.env.FLUTTERWAVE_ENCRYPTION_KEY;
    this.baseUrl = process.env.FLUTTERWAVE_BASE_URL || 'https://api.flutterwave.com/v3';
  }

  getHeaders() {
    return {
      Authorization: `Bearer ${this.secretKey}`,
      'Content-Type': 'application/json',
    };
  }

  async initializePayment(paymentData) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/payments`,
        paymentData,
        { headers: this.getHeaders() }
      );
      
      return {
        success: true,
        data: response.data,
        message: 'Payment initialized successfully'
      };
    } catch (error) {
      console.error('Flutterwave payment error:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 'Payment initialization failed',
        error: error.response?.data
      };
    }
  }

  async verifyPayment(transactionId) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/transactions/${transactionId}/verify`,
        { headers: this.getHeaders() }
      );
      
      return {
        success: true,
        data: response.data,
        message: 'Payment verified successfully'
      };
    } catch (error) {
      console.error('Flutterwave verification error:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 'Payment verification failed',
        error: error.response?.data
      };
    }
  }

  async createVirtualAccount(userData) {
    try {
      const payload = {
        email: userData.email,
        is_permanent: true,
        bvn: userData.bvn,
        tx_ref: `VA-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        phonenumber: userData.phone,
        firstname: userData.firstName,
        lastname: userData.lastName,
        narration: `Virtual Account for ${userData.firstName} ${userData.lastName}`
      };

      const response = await axios.post(
        `${this.baseUrl}/virtual-account-numbers`,
        payload,
        { headers: this.getHeaders() }
      );
      
      return {
        success: true,
        data: response.data,
        message: 'Virtual account created successfully'
      };
    } catch (error) {
      console.error('Flutterwave VA creation error:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 'Virtual account creation failed',
        error: error.response?.data
      };
    }
  }

  async validateWebhookSignature(payload, signature, secret) {
    try {
      // Import crypto for signature verification
      const crypto = await import('crypto');
      
      const hash = crypto
        .createHmac('sha256', secret)
        .update(JSON.stringify(payload))
        .digest('hex');
      
      return hash === signature;
    } catch (error) {
      console.error('Webhook signature validation error:', error);
      return false;
    }
  }

  async transferFunds(transferData) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/transfers`,
        transferData,
        { headers: this.getHeaders() }
      );
      
      return {
        success: true,
        data: response.data,
        message: 'Transfer initiated successfully'
      };
    } catch (error) {
      console.error('Flutterwave transfer error:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 'Transfer failed',
        error: error.response?.data
      };
    }
  }
}

// Create and export a singleton instance
export const flutterwaveService = new FlutterwaveService();