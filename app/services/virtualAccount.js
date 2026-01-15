import { flutterwaveService } from './flutterwave';
import { connectDB } from '@/lib/mongodb';
import VirtualAccount from '@/models/VirtualAccount';
import User from '@/models/User';
import Wallet from '@/models/Wallet';

export class VirtualAccountService {
  async createVirtualAccount(userId, userData) {
    try {
      await connectDB();
      
      const user = await User.findById(userId);
      if (!user) {
        return { success: false, message: 'User not found' };
      }

      // Check if user already has a virtual account
      const existingVA = await VirtualAccount.findOne({ userId });
      if (existingVA) {
        return {
          success: true,
          message: 'Virtual account already exists',
          data: existingVA
        };
      }

      // Prepare data for Flutterwave
      const vaData = {
        email: user.email,
        firstName: user.name.split(' ')[0],
        lastName: user.name.split(' ').slice(1).join(' ') || user.name.split(' ')[0],
        phone: user.phone || userData.phone,
        bvn: userData.bvn
      };

      // Create virtual account with Flutterwave
      const flutterwaveResult = await flutterwaveService.createVirtualAccount(vaData);
      
      if (!flutterwaveResult.success) {
        return flutterwaveResult;
      }

      const vaDetails = flutterwaveResult.data.data;

      // Create virtual account record
      const virtualAccount = new VirtualAccount({
        userId,
        bankName: vaDetails.bank_name,
        accountNumber: vaDetails.account_number,
        accountName: vaDetails.order_ref,
        reference: vaDetails.flw_ref,
        provider: 'flutterwave',
        status: 'active',
        metadata: {
          flutterwaveResponse: vaDetails,
          bvn: userData.bvn
        }
      });

      await virtualAccount.save();

      // Update user with virtual account info
      user.virtualAccountId = virtualAccount._id;
      user.hasVirtualAccount = true;
      await user.save();

      return {
        success: true,
        message: 'Virtual account created successfully',
        data: {
          bankName: virtualAccount.bankName,
          accountNumber: virtualAccount.accountNumber,
          accountName: virtualAccount.accountName,
          reference: virtualAccount.reference,
          createdAt: virtualAccount.createdAt
        }
      };

    } catch (error) {
      console.error('Virtual account creation error:', error);
      return {
        success: false,
        message: 'Virtual account creation failed',
        error: error.message
      };
    }
  }

  async getVirtualAccount(userId) {
    try {
      await connectDB();
      
      const virtualAccount = await VirtualAccount.findOne({ userId });
      
      if (!virtualAccount) {
        return { 
          success: false, 
          message: 'Virtual account not found',
          code: 'NOT_FOUND'
        };
      }

      return {
        success: true,
        data: virtualAccount
      };

    } catch (error) {
      console.error('Get virtual account error:', error);
      return {
        success: false,
        message: 'Failed to fetch virtual account',
        error: error.message
      };
    }
  }

  async handleVirtualAccountWebhook(payload) {
    try {
      await connectDB();
      
      const { event, data } = payload;
      
      if (event !== 'virtual-account-credit') {
        return { success: false, message: 'Unsupported event type' };
      }

      // Find virtual account by account number
      const virtualAccount = await VirtualAccount.findOne({ 
        accountNumber: data.account_number 
      });
      
      if (!virtualAccount) {
        return { success: false, message: 'Virtual account not found' };
      }

      // Find user and wallet
      const user = await User.findById(virtualAccount.userId);
      const wallet = await Wallet.findOne({ userId: virtualAccount.userId });
      
      if (!user || !wallet) {
        return { success: false, message: 'User or wallet not found' };
      }

      // Create transaction record
      const Transaction = (await import('@/models/Transaction')).default;
      
      const transaction = new Transaction({
        userId: virtualAccount.userId,
        walletId: wallet.walletId,
        type: 'credit',
        amount: parseFloat(data.amount),
        status: 'success',
        reference: data.tx_ref,
        paymentMethod: 'virtual_account',
        description: `Virtual account deposit from ${data.sender_account_name || 'Unknown sender'}`,
        category: 'wallet_funding',
        metadata: {
          senderAccount: data.sender_account_number,
          senderName: data.sender_account_name,
          senderBank: data.sender_bank,
          narration: data.narration,
          flutterwaveData: data
        }
      });

      await transaction.save();

      // Update wallet balance
      wallet.balance += parseFloat(data.amount);
      wallet.lastTransaction = transaction._id;
      await wallet.save();

      // Create notification
      await this.createFundingNotification(
        virtualAccount.userId,
        data.amount,
        transaction._id
      );

      return {
        success: true,
        message: 'Virtual account webhook processed successfully',
        data: {
          transactionId: transaction._id,
          amount: data.amount,
          newBalance: wallet.balance
        }
      };

    } catch (error) {
      console.error('Virtual account webhook error:', error);
      return {
        success: false,
        message: 'Webhook processing failed',
        error: error.message
      };
    }
  }

  async createFundingNotification(userId, amount, transactionId) {
    try {
      // Import notification model
      const InAppNotification = (await import('@/models/InAppNotification')).default;
      
      const notification = new InAppNotification({
        userId,
        type: 'wallet_credited',
        title: 'Account Credited',
        message: `Your wallet has been credited with ₦${parseFloat(amount).toLocaleString()} via virtual account`,
        data: {
          amount: parseFloat(amount),
          transactionId,
          type: 'virtual_account_deposit'
        },
        priority: 'high'
      });

      await notification.save();
      
      return { success: true };

    } catch (error) {
      console.error('Funding notification error:', error);
      return { success: false, error: error.message };
    }
  }

  async deactivateVirtualAccount(userId) {
    try {
      await connectDB();
      
      const virtualAccount = await VirtualAccount.findOne({ userId });
      
      if (!virtualAccount) {
        return { 
          success: false, 
          message: 'Virtual account not found' 
        };
      }

      // In a real implementation, you would call Flutterwave API to deactivate
      // For now, we'll just mark it as inactive in our database
      virtualAccount.status = 'inactive';
      virtualAccount.deactivatedAt = new Date();
      await virtualAccount.save();

      // Update user
      const user = await User.findById(userId);
      if (user) {
        user.hasVirtualAccount = false;
        await user.save();
      }

      return {
        success: true,
        message: 'Virtual account deactivated successfully',
        data: virtualAccount
      };

    } catch (error) {
      console.error('Deactivate virtual account error:', error);
      return {
        success: false,
        message: 'Failed to deactivate virtual account',
        error: error.message
      };
    }
  }

  async getVirtualAccountTransactions(userId, options = {}) {
    try {
      await connectDB();
      
      const { page = 1, limit = 20 } = options;
      const skip = (page - 1) * limit;
      
      const Transaction = (await import('@/models/Transaction')).default;
      
      const transactions = await Transaction.find({
        userId,
        paymentMethod: 'virtual_account'
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
      
      const total = await Transaction.countDocuments({
        userId,
        paymentMethod: 'virtual_account'
      });
      
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
      console.error('Get VA transactions error:', error);
      return {
        success: false,
        message: 'Failed to fetch virtual account transactions',
        error: error.message
      };
    }
  }
}

// Create and export a singleton instance
export const virtualAccountService = new VirtualAccountService();