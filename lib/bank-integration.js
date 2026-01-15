// lib/bank-integration.js
import crypto from 'crypto';

export class BankIntegrationService {
  constructor() {
    this.flutterwaveSecret = process.env.FLUTTERWAVE_SECRET_KEY;
    this.flutterwavePublic = process.env.FLUTTERWAVE_PUBLIC_KEY;
    this.flutterwaveEncryption = process.env.FLUTTERWAVE_ENCRYPTION_KEY;
  }

  // Generate virtual account for user
  async generateVirtualAccount(userData) {
    try {
      // Validate user data
      const validatedData = this.validateUserData(userData);
      
      // Create payload with timestamp and nonce for replay attack protection
      const payload = {
        ...validatedData,
        email: validatedData.email.toLowerCase(),
        tx_ref: `VA_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
        is_permanent: true,
        narration: `GiftPocket VA for ${validatedData.name}`,
        amount: null // Optional: you can set initial amount
      };

      // Make secure request to Flutterwave
      const response = await this.makeSecureRequest(
        'https://api.flutterwave.com/v3/virtual-account-numbers',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.flutterwaveSecret}`,
            'Content-Type': 'application/json',
            'X-Request-ID': crypto.randomUUID(),
            'X-Timestamp': Date.now().toString(),
            'User-Agent': 'GiftPocket-Server/1.0'
          },
          body: JSON.stringify(payload),
          timeout: 15000 // 15 second timeout
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Flutterwave API Error: ${error.message || 'Unknown error'}`);
      }

      const data = await response.json();

      if (data.status !== 'success') {
        throw new Error(`Flutterwave Error: ${data.message}`);
      }

      // Return only necessary data
      return {
        account_number: data.data.account_number,
        bank_name: data.data.bank_name,
        flw_ref: data.data.flw_ref,
        order_ref: data.data.order_ref,
        created_at: new Date()
      };

    } catch (error) {
      console.error('Virtual account generation failed:', error);
      throw error;
    }
  }

  // Verify webhook signature
  async verifyWebhookSignature(payload, signature) {
    const secretHash = process.env.FLUTTERWAVE_WEBHOOK_SECRET;
    
    if (!secretHash) {
      throw new Error('Webhook secret not configured');
    }

    const hash = crypto
      .createHmac('sha256', secretHash)
      .update(JSON.stringify(payload))
      .digest('hex');

    return hash === signature;
  }

  // Validate user data
  validateUserData(userData) {
    const required = ['email', 'name'];
    for (const field of required) {
      if (!userData[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      throw new Error('Invalid email format');
    }

    // Sanitize name
    const sanitizedName = userData.name
      .trim()
      .replace(/[<>]/g, '') // Remove HTML tags
      .substring(0, 100); // Limit length

    return {
      ...userData,
      name: sanitizedName,
      email: userData.email.toLowerCase().trim()
    };
  }

  // Make secure HTTP request
  async makeSecureRequest(url, options) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), options.timeout || 10000);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });

      return response;
    } finally {
      clearTimeout(timeout);
    }
  }
}

// Singleton instance
const bankService = new BankIntegrationService();
export { bankService };
export const generateVirtualAccount = (userData) => 
  bankService.generateVirtualAccount(userData);
export const verifyWebhookSignature = (payload, signature) =>
  bankService.verifyWebhookSignature(payload, signature);