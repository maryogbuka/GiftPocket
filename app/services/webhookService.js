import { flutterwaveService } from './flutterwave';
import { paymentService } from './payment';
import { virtualAccountService } from './virtualAccount';
import { connectDB } from '@/lib/mongodb';

export class WebhookService {
  constructor() {
    this.webhookSecret = process.env.FLUTTERWAVE_WEBHOOK_SECRET;
  }

  async validateSignature(req) {
    try {
      const signature = req.headers['verif-hash'];
      
      if (!signature) {
        console.error('No signature provided in webhook');
        return false;
      }

      if (!this.webhookSecret) {
        console.error('Webhook secret not configured');
        return false;
      }

      // Clone the request body for verification
      const rawBody = JSON.stringify(req.body);
      
      const crypto = await import('crypto');
      const hash = crypto
        .createHmac('sha256', this.webhookSecret)
        .update(rawBody)
        .digest('hex');
      
      return hash === signature;
      
    } catch (error) {
      console.error('Signature validation error:', error);
      return false;
    }
  }

  async processFlutterwaveWebhook(payload) {
    try {
      console.log('Processing Flutterwave webhook:', payload.event);
      
      const { event, data } = payload;
      
      switch (event) {
        case 'charge.completed':
          return await this.handlePaymentCompletion(data);
          
        case 'transfer.completed':
          return await this.handleTransferCompletion(data);
          
        case 'virtual-account-credit':
          return await virtualAccountService.handleVirtualAccountWebhook(payload);
          
        case 'subscription.charge':
          return await this.handleSubscriptionCharge(data);
          
        default:
          console.log(`Unhandled webhook event: ${event}`);
          return {
            success: false,
            message: `Unhandled event type: ${event}`
          };
      }
      
    } catch (error) {
      console.error('Webhook processing error:', error);
      return {
        success: false,
        message: 'Webhook processing failed',
        error: error.message
      };
    }
  }

  async handlePaymentCompletion(paymentData) {
    try {
      await connectDB();
      
      console.log('Handling payment completion:', paymentData.tx_ref);
      
      // Find transaction by reference
      const Transaction = (await import('@/models/Transaction')).default;
      const transaction = await Transaction.findOne({ 
        reference: paymentData.tx_ref 
      });
      
      if (!transaction) {
        console.error('Transaction not found:', paymentData.tx_ref);
        return { success: false, message: 'Transaction not found' };
      }
      
      // Update transaction based on payment status
      if (paymentData.status === 'successful') {
        transaction.status = 'success';
        transaction.metadata.paymentDetails = {
          processor: 'flutterwave',
          processorId: paymentData.id,
          paymentType: paymentData.payment_type,
          processorResponse: paymentData.processor_response,
          currency: paymentData.currency,
          chargedAmount: paymentData.charged_amount
        };
        
        // Update wallet balance if it's a wallet funding
        if (transaction.type === 'credit' && transaction.category === 'wallet_funding') {
          const Wallet = (await import('@/models/Wallet')).default;
          const wallet = await Wallet.findOne({ walletId: transaction.walletId });
          
          if (wallet) {
            wallet.balance += transaction.amount;
            wallet.lastTransaction = transaction._id;
            await wallet.save();
            
            console.log(`Wallet ${wallet.walletId} credited with ${transaction.amount}`);
          }
        }
        
      } else {
        transaction.status = 'failed';
        transaction.metadata.paymentError = paymentData.status;
      }
      
      await transaction.save();
      
      // Create notification
      await this.createPaymentNotification(
        transaction.userId,
        transaction.status,
        transaction.amount,
        transaction.reference
      );
      
      return {
        success: true,
        message: `Payment ${transaction.status} processed`,
        data: {
          transactionId: transaction._id,
          status: transaction.status,
          amount: transaction.amount
        }
      };
      
    } catch (error) {
      console.error('Payment completion error:', error);
      return {
        success: false,
        message: 'Payment completion handling failed',
        error: error.message
      };
    }
  }

  async handleTransferCompletion(transferData) {
    try {
      await connectDB();
      
      console.log('Handling transfer completion:', transferData.reference);
      
      // Find transaction by reference
      const Transaction = (await import('@/models/Transaction')).default;
      const transaction = await Transaction.findOne({ 
        reference: transferData.reference 
      });
      
      if (!transaction) {
        console.error('Transfer transaction not found:', transferData.reference);
        return { success: false, message: 'Transfer transaction not found' };
      }
      
      // Update transaction status
      if (transferData.status === 'SUCCESSFUL') {
        transaction.status = 'success';
        transaction.metadata.transferDetails = {
          processor: 'flutterwave',
          processorId: transferData.id,
          beneficiaryName: transferData.full_name,
          beneficiaryAccount: transferData.account_number,
          beneficiaryBank: transferData.bank_name,
          processorResponse: transferData.complete_message
        };
      } else {
        transaction.status = 'failed';
        transaction.metadata.transferError = transferData.status;
        
        // Refund wallet if transfer failed
        if (transaction.type === 'debit') {
          const Wallet = (await import('@/models/Wallet')).default;
          const wallet = await Wallet.findOne({ walletId: transaction.walletId });
          
          if (wallet) {
            wallet.balance += transaction.amount; // Refund
            await wallet.save();
            
            console.log(`Wallet ${wallet.walletId} refunded ${transaction.amount}`);
          }
        }
      }
      
      await transaction.save();
      
      return {
        success: true,
        message: `Transfer ${transaction.status} processed`,
        data: {
          transactionId: transaction._id,
          status: transaction.status,
          amount: transaction.amount
        }
      };
      
    } catch (error) {
      console.error('Transfer completion error:', error);
      return {
        success: false,
        message: 'Transfer completion handling failed',
        error: error.message
      };
    }
  }

  async handleSubscriptionCharge(subscriptionData) {
    try {
      console.log('Handling subscription charge:', subscriptionData.tx_ref);
      
      // Implement subscription logic here
      // This would handle recurring payments for premium features
      
      return {
        success: true,
        message: 'Subscription charge processed',
        data: subscriptionData
      };
      
    } catch (error) {
      console.error('Subscription charge error:', error);
      return {
        success: false,
        message: 'Subscription charge handling failed',
        error: error.message
      };
    }
  }

  async createPaymentNotification(userId, status, amount, reference) {
    try {
      await connectDB();
      
      const InAppNotification = (await import('@/models/InAppNotification')).default;
      
      const titles = {
        success: 'Payment Successful',
        failed: 'Payment Failed',
        pending: 'Payment Processing'
      };
      
      const messages = {
        success: `Your payment of ₦${amount.toLocaleString()} was successful. Reference: ${reference}`,
        failed: `Your payment of ₦${amount.toLocaleString()} failed. Please try again. Reference: ${reference}`,
        pending: `Your payment of ₦${amount.toLocaleString()} is being processed. Reference: ${reference}`
      };
      
      const notification = new InAppNotification({
        userId,
        type: 'payment_notification',
        title: titles[status] || 'Payment Update',
        message: messages[status] || `Payment ${status} for ₦${amount.toLocaleString()}`,
        data: {
          amount,
          reference,
          status,
          type: 'payment'
        },
        priority: status === 'failed' ? 'high' : 'normal'
      });
      
      await notification.save();
      
      console.log(`Payment notification created for user ${userId}`);
      
      return { success: true };
      
    } catch (error) {
      console.error('Create payment notification error:', error);
      return { success: false, error: error.message };
    }
  }

  async logWebhook(payload, status, response) {
    try {
      await connectDB();
      
      const WebhookLog = (await import('@/models/WebhookLog')).default || 
                        (await import('@/models/WebhookLog'));
      
      const log = new WebhookLog({
        event: payload.event,
        provider: 'flutterwave',
        payload,
        status,
        response,
        processedAt: new Date()
      });
      
      await log.save();
      
      return { success: true };
      
    } catch (error) {
      console.error('Webhook logging error:', error);
      // Don't throw error for logging failures
      return { success: false };
    }
  }
}

// Create and export a singleton instance
export const webhookService = new WebhookService();