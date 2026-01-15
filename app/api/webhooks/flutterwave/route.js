import { NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/mongodb";
import Transaction from "@/models/Transaction";
import Wallet from "@/models/Wallet";
import User from "@/models/User";
import { sendNotification } from "@/lib/notification-service";

// Verify webhook signature
function verifyWebhookSignature(payload, signature, secret) {
  const hash = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  return hash === signature;
}

// Process webhook event
async function processWebhookEvent(event) {
  console.log(`Processing Flutterwave webhook: ${event.type}`);
  
  switch (event.type) {
    case 'charge.completed':
      return await handleChargeCompleted(event);
    case 'transfer.completed':
      return await handleTransferCompleted(event);
    case 'virtual-account.credit':
      return await handleVirtualAccountCredit(event);
    default:
      console.log(`Unhandled event type: ${event.type}`);
      return { processed: false, message: "Event type not handled" };
  }
}

// Handle successful charge
async function handleChargeCompleted(event) {
  try {
    const { data } = event;
    
    await connectDB();
    
    // Find user by email
    const user = await User.findOne({ email: data.customer.email });
    if (!user) {
      console.error(`User not found for email: ${data.customer.email}`);
      return { processed: false, error: "User not found" };
    }
    
    // Check if transaction already exists
    let transaction = await Transaction.findOne({ reference: data.tx_ref });
    
    if (!transaction) {
      // Create new transaction
      transaction = await Transaction.create({
        userId: user._id,
        amount: data.amount,
        reference: data.tx_ref,
        type: "credit",
        status: "completed",
        description: `Payment via ${data.payment_type}`,
        paymentMethod: data.payment_type,
        metadata: {
          flutterwaveId: data.id,
          verifiedAt: new Date(),
          provider: "flutterwave",
          currency: data.currency,
          customer: data.customer,
          providerData: data,
          source: "webhook"
        }
      });
    } else {
      // Update existing transaction
      transaction.status = "completed";
      transaction.metadata = {
        ...transaction.metadata,
        webhookVerifiedAt: new Date(),
        webhookData: data
      };
      await transaction.save();
    }
    
    // Update wallet
    const wallet = await Wallet.findOneAndUpdate(
      { userId: user._id },
      { 
        $inc: { balance: data.amount },
        $push: { 
          transactions: transaction._id,
          recentTopups: {
            amount: data.amount,
            date: new Date(),
            transactionId: transaction._id,
            source: "webhook"
          }
        }
      },
      { new: true, upsert: true }
    );
    
    // Send notification
    await sendNotification({
      userId: user._id,
      type: "payment_success",
      title: "💰 Payment Received!",
      message: `Your wallet has been credited with ₦${data.amount} via webhook`,
      data: {
        transactionId: transaction._id,
        amount: data.amount,
        reference: data.tx_ref
      }
    });
    
    console.log(`Webhook processed successfully for TX: ${data.tx_ref}`);
    return { processed: true, transactionId: transaction._id };
    
  } catch (error) {
    console.error("Webhook processing error:", error);
    return { processed: false, error: error.message };
  }
}

// Handle virtual account credit
async function handleVirtualAccountCredit(event) {
  try {
    const { data } = event;
    
    await connectDB();
    
    // Find transaction by reference
    const transaction = await Transaction.findOne({ 
      reference: data.tx_ref,
      status: "pending"
    });
    
    if (transaction) {
      // Update transaction
      transaction.status = "completed";
      transaction.metadata = {
        ...transaction.metadata,
        virtualAccountCredit: true,
        creditedAt: new Date(),
        webhookData: data
      };
      await transaction.save();
      
      // Update wallet
      await Wallet.findOneAndUpdate(
        { userId: transaction.userId },
        { 
          $inc: { balance: transaction.amount },
          $push: { 
            transactions: transaction._id
          }
        }
      );
      
      return { processed: true, transactionId: transaction._id };
    }
    
    return { processed: false, message: "No pending transaction found" };
    
  } catch (error) {
    console.error("Virtual account credit processing error:", error);
    return { processed: false, error: error.message };
  }
}

// Main webhook handler
export async function POST(request) {
  try {
    const payload = await request.json();
    const signature = request.headers.get('verif-hash');
    
    // Verify webhook signature
    const webhookSecret = process.env.FLUTTERWAVE_WEBHOOK_SECRET;
    
    if (!verifyWebhookSignature(payload, signature, webhookSecret)) {
      console.error("Invalid webhook signature");
      return NextResponse.json(
        { status: 'error', message: 'Invalid signature' },
        { status: 401 }
      );
    }
    
    console.log("Valid webhook received:", {
      type: payload.event.type,
      reference: payload.data?.tx_ref,
      amount: payload.data?.amount,
      timestamp: new Date().toISOString()
    });
    
    // Process the webhook event
    const result = await processWebhookEvent(payload.event);
    
    if (result.processed) {
      return NextResponse.json(
        { 
          status: 'success', 
          message: 'Webhook processed',
          transactionId: result.transactionId 
        }
      );
    } else {
      return NextResponse.json(
        { 
          status: 'partial', 
          message: 'Webhook received but not fully processed',
          details: result.message 
        },
        { status: 202 }
      );
    }
    
  } catch (error) {
    console.error("Webhook handler error:", error);
    
    // Alert monitoring
    await sendErrorAlert('webhook_error', {
      error: error.message,
      timestamp: new Date().toISOString()
    });
    
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Webhook processing failed',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}