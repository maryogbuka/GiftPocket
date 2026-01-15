import { flutterwaveService } from './flutterwave';
import { connectDB } from '@/lib/mongodb';
import Transaction from '@/models/Transaction';
import Wallet from '@/models/Wallet';
import User from '@/models/User';
import { v4 as uuidv4 } from 'uuid';

export class PaymentService {
  async initializePayment(userId, amount, metadata = {}) {
    try {
      await connectDB();
      
      const user = await User.findById(userId);
      if (!user) {
        return { success: false, message: 'User not found' };
      }

      const wallet = await Wallet.findOne({ userId });
      if (!wallet) {
        return { success: false, message: 'Wallet not found' };
      }

      // Generate unique transaction reference
      const txRef = `GP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const paymentData = {
        tx_ref: txRef,
        amount: amount,
        currency: 'NGN',
        redirect_url: `${process.env.NEXTAUTH_URL}/payment/verify?reference=${txRef}`,
        payment_options: 'card, banktransfer, ussd',
        customer: {
          email: user.email,
          phonenumber: user.phone || '',
          name: user.name
        },
        customizations: {
          title: 'GiftPocket Wallet Top-up',
          description: `Funding wallet with ₦${amount}`,
          logo: `${process.env.NEXTAUTH_URL}/logo.png`
        },
        meta: {
          userId: userId.toString(),
          walletId: wallet.walletId,
          type: 'wallet_funding',
          ...metadata
        }
      };

      // Initialize payment with Flutterwave
      const flutterwaveResult = await flutterwaveService.initializePayment(paymentData);
      
      if (!flutterwaveResult.success) {
        return flutterwaveResult;
      }

      // Create transaction record
      const transaction = new Transaction({
        userId,
        walletId: wallet.walletId,
        type: 'credit',
        amount,
        status: 'pending',
        reference: txRef,
        paymentMethod: 'flutterwave',
        description: `Wallet funding - ₦${amount}`,
        metadata: {
          flutterwaveRef: flutterwaveResult.data.data.tx_ref,
          checkoutUrl: flutterwaveResult.data.data.link,
          ...metadata
        }
      });

      await transaction.save();

      return {
        success: true,
        data: {
          paymentLink: flutterwaveResult.data.data.link,
          transactionId: transaction._id,
          reference: txRef,
          amount,
          status: 'pending'
        },
        message: 'Payment initialized successfully'
      };

    } catch (error) {
      console.error('Payment initialization error:', error);
      return {
        success: false,
        message: 'Payment initialization failed',
        error: error.message
      };
    }
  }

  async verifyPayment(reference) {
    try {
      await connectDB();
      
      // Find transaction
      const transaction = await Transaction.findOne({ reference });
      if (!transaction) {
        return { success: false, message: 'Transaction not found' };
      }

      // Check if already verified
      if (transaction.status === 'success') {
        return { 
          success: true, 
          message: 'Payment already verified',
          data: transaction 
        };
      }

      // Verify with Flutterwave
      const flutterwaveResult = await flutterwaveService.verifyPayment(reference);
      
      if (!flutterwaveResult.success) {
        // Update transaction as failed
        transaction.status = 'failed';
        transaction.metadata.verificationError = flutterwaveResult.message;
        await transaction.save();
        
        return flutterwaveResult;
      }

      const paymentData = flutterwaveResult.data.data;
      
      // Check if payment was successful
      if (paymentData.status !== 'successful') {
        transaction.status = 'failed';
        transaction.metadata.paymentStatus = paymentData.status;
        await transaction.save();
        
        return {
          success: false,
          message: `Payment ${paymentData.status}`,
          data: paymentData
        };
      }

      // Update transaction
      transaction.status = 'success';
      transaction.metadata.paymentDetails = {
        processor: 'flutterwave',
        processorId: paymentData.id,
        paymentType: paymentData.payment_type,
        processorResponse: paymentData.processor_response
      };
      await transaction.save();

      // Update wallet balance
      const wallet = await Wallet.findOne({ walletId: transaction.walletId });
      if (wallet) {
        wallet.balance += transaction.amount;
        wallet.lastTransaction = transaction._id;
        await wallet.save();
      }

      // Create notification for successful payment
      await this.createPaymentNotification(
        transaction.userId,
        'payment_success',
        {
          amount: transaction.amount,
          reference: transaction.reference
        }
      );

      return {
        success: true,
        message: 'Payment verified successfully',
        data: {
          transaction,
          walletBalance: wallet?.balance || 0,
          paymentData
        }
      };

    } catch (error) {
      console.error('Payment verification error:', error);
      return {
        success: false,
        message: 'Payment verification failed',
        error: error.message
      };
    }
  }

  async scheduleGiftPayment(userId, giftData) {
    try {
      await connectDB();
      
      const user = await User.findById(userId);
      const wallet = await Wallet.findOne({ userId });
      
      if (!user || !wallet) {
        return { success: false, message: 'User or wallet not found' };
      }

      // Check wallet balance
      if (wallet.balance < giftData.amount) {
        return { 
          success: false, 
          message: 'Insufficient balance',
          code: 'INSUFFICIENT_FUNDS'
        };
      }

      // Generate transaction reference
      const txRef = `GIFT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Create transaction record
      const transaction = new Transaction({
        userId,
        walletId: wallet.walletId,
        type: 'debit',
        amount: giftData.amount,
        status: 'pending',
        reference: txRef,
        description: `Gift to ${giftData.recipientName} - ${giftData.giftType}`,
        category: 'gift',
        metadata: {
          giftId: giftData.giftId,
          recipientName: giftData.recipientName,
          recipientEmail: giftData.recipientEmail,
          giftType: giftData.giftType,
          deliveryDate: giftData.deliveryDate,
          message: giftData.message,
          isScheduled: giftData.isScheduled || false,
          scheduleDate: giftData.scheduleDate
        }
      });

      await transaction.save();

      // Deduct from wallet
      wallet.balance -= giftData.amount;
      wallet.lastTransaction = transaction._id;
      await wallet.save();

      // Update transaction status
      transaction.status = 'success';
      await transaction.save();

      return {
        success: true,
        message: 'Gift payment processed successfully',
        data: {
          transactionId: transaction._id,
          reference: txRef,
          amount: giftData.amount,
          walletBalance: wallet.balance,
          giftData
        }
      };

    } catch (error) {
      console.error('Gift payment error:', error);
      return {
        success: false,
        message: 'Gift payment failed',
        error: error.message
      };
    }
  }

  async createPaymentNotification(userId, type, data) {
    try {
      // This would integrate with your notification service
      // For now, we'll just log it
      console.log(`Payment notification: ${type} for user ${userId}`, data);
      
      return { success: true };
    } catch (error) {
      console.error('Notification creation error:', error);
      return { success: false, error: error.message };
    }
  }

  async getTransactionHistory(userId, options = {}) {
    try {
      await connectDB();
      
      const { 
        page = 1, 
        limit = 20, 
        type, 
        status, 
        startDate, 
        endDate 
      } = options;
      
      const skip = (page - 1) * limit;
      
      const query = { userId };
      
      if (type) query.type = type;
      if (status) query.status = status;
      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
      }
      
      const transactions = await Transaction.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
      
      const total = await Transaction.countDocuments(query);
      
      return {
        success: true,
        data: {
          transactions,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        }
      };
      
    } catch (error) {
      console.error('Transaction history error:', error);
      return {
        success: false,
        message: 'Failed to fetch transaction history',
        error: error.message
      };
    }
  }
}

// Create and export a singleton instance
export const paymentService = new PaymentService();