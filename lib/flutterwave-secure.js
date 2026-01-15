// app/lib/flutterwave-secure.js
import crypto from 'crypto';

export class SecureFlutterwaveClient {
  constructor() {
    this.secretKey = process.env.FLUTTERWAVE_SECRET_KEY;
    this.publicKey = process.env.FLUTTERWAVE_PUBLIC_KEY;
    this.encryptionKey = process.env.FLUTTERWAVE_ENCRYPTION_KEY;
  }
  
  // Generate virtual account with enhanced security
  async createVirtualAccount(userData) {
    // 1. Validate user data
    const validatedData = this.validateUserData(userData);
    
    // 2. Encrypt payload before sending to Flutterwave
    const encryptedPayload = this.encryptPayload(validatedData);
    
    // 3. Make request with timeout and retry logic
    const response = await this.makeSecureRequest(
      'https://api.flutterwave.com/v3/virtual-account-numbers',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.secretKey}`,
          'Content-Type': 'application/json',
          'X-Request-ID': crypto.randomUUID(),
          'X-Timestamp': Date.now().toString()
        },
        body: JSON.stringify(encryptedPayload),
        timeout: 10000 // 10 second timeout
      }
    );
    
    // 4. Verify response signature
    await this.verifyResponseSignature(response);
    
    // 5. Store only what's necessary
    return {
      account_number: response.data.account_number,
      bank_name: response.data.bank_name,
      // Store reference for webhook verification
      flw_ref: response.data.flw_ref,
      // Don't store full response in DB
    };
  }
  
  // Webhook verification
  async verifyWebhook(payload, signature) {
    const secretHash = process.env.FLUTTERWAVE_WEBHOOK_SECRET;
    const hash = crypto
      .createHmac('sha256', secretHash)
      .update(JSON.stringify(payload))
      .digest('hex');
    
    return hash === signature;
  }
  
  // Encrypt sensitive data before storing
  encryptPayload(data) {
    const algorithm = 'aes-256-gcm';
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, this.encryptionKey, iv);
    
    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();
    
    return {
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
      data: encrypted
    };
  }
}