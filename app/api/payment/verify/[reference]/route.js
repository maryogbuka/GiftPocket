import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Transaction from "@/models/Transaction";
import Wallet from "@/models/Wallet";
import User from "@/models/User";
import { flw } from "@/lib/flutterwave";
import { sendNotification } from "@/lib/notification-service";

// Maximum verification attempts
const MAX_VERIFICATION_ATTEMPTS = 3;
const VERIFICATION_TIMEOUT = 30000; // 30 seconds
const RETRY_DELAYS = [1000, 5000, 15000]; // Retry delays in ms

// Utility function for timeout
const withTimeout = (promise, ms) => {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Request timeout after ${ms}ms`)), ms)
    )
  ]);
};

// Verify with Flutterwave with retry logic
async function verifyWithFlutterwave(reference, attempt = 0) {
  try {
    console.log(`Attempt ${attempt + 1} to verify transaction: ${reference}`);
    
    const response = await withTimeout(
      flw.Transaction.verify({ id: reference }),
      VERIFICATION_TIMEOUT
    );
    
    console.log(`Flutterwave verification response:`, {
      status: response.status,
      reference: response.data?.tx_ref,
      amount: response.data?.amount,
      currency: response.data?.currency
    });
    
    if (response.status === "success") {
      return {
        success: true,
        data: response.data,
        message: "Transaction verified successfully"
      };
    } else {
      throw new Error(response.message || "Transaction verification failed");
    }
    
  } catch (error) {
    console.error(`Verification attempt ${attempt + 1} failed:`, error.message);
    
    // Check if we should retry
    if (attempt < MAX_VERIFICATION_ATTEMPTS - 1) {
      const delay = RETRY_DELAYS[attempt];
      console.log(`Retrying in ${delay}ms...`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      return verifyWithFlutterwave(reference, attempt + 1);
    }
    
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
}

// Check for duplicate verification
async function checkDuplicateVerification(reference) {
  const existingTx = await Transaction.findOne({ reference });
  
  if (existingTx && existingTx.status === "completed") {
    console.log(`Transaction ${reference} already verified`);
    return {
      duplicate: true,
      transaction: existingTx
    };
  }
  
  return { duplicate: false };
}

// Update wallet balance
async function updateWalletBalance(userId, amount, transactionId) {
  try {
    const wallet = await Wallet.findOneAndUpdate(
      { userId },
      { 
        $inc: { balance: amount },
        $push: { 
          transactions: transactionId,
          recentTopups: {
            amount,
            date: new Date(),
            transactionId
          }
        }
      },
      { new: true, upsert: true }
    );
    
    console.log(`Wallet updated for user ${userId}: New balance = ${wallet.balance}`);
    return wallet;
  } catch (error) {
    console.error("Wallet update error:", error);
    throw error;
  }
}

// Send notifications
async function sendPaymentNotifications(userId, transaction, isSuccess) {
  try {
    const user = await User.findById(userId);
    if (!user) return;
    
    // In-app notification
    await sendNotification({
      userId,
      type: isSuccess ? "payment_success" : "payment_failed",
      title: isSuccess ? "💰 Payment Successful!" : "❌ Payment Failed",
      message: isSuccess 
        ? `Your wallet has been credited with ₦${transaction.amount}`
        : `Payment of ₦${transaction.amount} failed. Please try again.`,
      data: {
        transactionId: transaction._id,
        amount: transaction.amount,
        reference: transaction.reference
      }
    });
    
    // Email notification (optional)
    if (user.email && isSuccess) {
      // Send email receipt
      await sendReceiptEmail(user.email, transaction);
    }
    
  } catch (error) {
    console.error("Notification error:", error);
    // Don't fail verification if notifications fail
  }
}

// Main verification handler
export async function GET(request, { params }) {
  try {
    const { reference } = params;
    
    console.log("=== Payment Verification Started ===");
    console.log(`Reference: ${reference}`);
    console.log(`Timestamp: ${new Date().toISOString()}`);
    
    if (!reference || reference.length < 10) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Invalid reference format",
          code: "INVALID_REFERENCE"
        },
        { status: 400 }
      );
    }
    
    await connectDB();
    
    // 1. Check for duplicate verification
    const duplicateCheck = await checkDuplicateVerification(reference);
    if (duplicateCheck.duplicate) {
      return NextResponse.json({
        success: true,
        message: "Payment already verified and processed",
        transaction: duplicateCheck.transaction,
        code: "ALREADY_PROCESSED"
      });
    }
    
    // 2. Find the pending transaction
    let transaction = await Transaction.findOne({ reference });
    
    if (!transaction) {
      console.log(`Transaction ${reference} not found in database`);
      
      // Transaction might be from webhook, check Flutterwave directly
      const flutterwaveResult = await verifyWithFlutterwave(reference);
      
      if (flutterwaveResult.success) {
        // Create transaction record if it doesn't exist
        const user = await User.findOne({ email: flutterwaveResult.data.customer.email });
        
        if (user) {
          transaction = await Transaction.create({
            userId: user._id,
            amount: flutterwaveResult.data.amount,
            reference: flutterwaveResult.data.tx_ref,
            type: "credit",
            status: "completed",
            description: `Wallet top-up via Flutterwave`,
            paymentMethod: flutterwaveResult.data.payment_type || "card",
            metadata: {
              flutterwaveId: flutterwaveResult.data.id,
              verifiedAt: new Date(),
              provider: "flutterwave",
              currency: flutterwaveResult.data.currency,
              customer: flutterwaveResult.data.customer,
              providerData: flutterwaveResult.data
            }
          });
          
          // Update wallet
          await updateWalletBalance(user._id, flutterwaveResult.data.amount, transaction._id);
          
          // Send notification
          await sendPaymentNotifications(user._id, transaction, true);
          
          return NextResponse.json({
            success: true,
            message: "Payment verified and wallet updated",
            transaction: {
              id: transaction._id,
              amount: transaction.amount,
              reference: transaction.reference,
              status: transaction.status,
              newBalance: (await Wallet.findOne({ userId: user._id })).balance
            },
            code: "VERIFIED_CREATED"
          });
        }
      }
      
      return NextResponse.json(
        { 
          success: false, 
          error: "Transaction not found",
          code: "TRANSACTION_NOT_FOUND"
        },
        { status: 404 }
      );
    }
    
    // 3. Verify with Flutterwave
    console.log(`Verifying transaction ${reference} with Flutterwave...`);
    const verificationResult = await verifyWithFlutterwave(reference);
    
    if (!verificationResult.success) {
      // Update transaction status to failed
      transaction.status = "failed";
      transaction.metadata = {
        ...transaction.metadata,
        lastVerificationAttempt: new Date(),
        verificationError: verificationResult.error,
        verificationAttempts: (transaction.metadata?.verificationAttempts || 0) + 1
      };
      await transaction.save();
      
      // Send failure notification
      await sendPaymentNotifications(transaction.userId, transaction, false);
      
      return NextResponse.json({
        success: false,
        message: "Payment verification failed",
        error: verificationResult.error,
        transaction: {
          id: transaction._id,
          status: transaction.status,
          reference: transaction.reference
        },
        code: "VERIFICATION_FAILED"
      });
    }
    
    // 4. Payment successful - update records
    const flutterwaveData = verificationResult.data;
    
    // Validate amount matches
    if (transaction.amount !== flutterwaveData.amount) {
      console.warn(`Amount mismatch: DB=${transaction.amount}, Flutterwave=${flutterwaveData.amount}`);
      // You might want to handle this differently
    }
    
    // Update transaction
    transaction.status = "completed";
    transaction.metadata = {
      ...transaction.metadata,
      verifiedAt: new Date(),
      provider: "flutterwave",
      flutterwaveId: flutterwaveData.id,
      paymentType: flutterwaveData.payment_type,
      currency: flutterwaveData.currency,
      customer: flutterwaveData.customer,
      card: flutterwaveData.card,
      providerData: flutterwaveData
    };
    await transaction.save();
    
    // Update wallet balance
    const updatedWallet = await updateWalletBalance(transaction.userId, transaction.amount, transaction._id);
    
    // Send success notification
    await sendPaymentNotifications(transaction.userId, transaction, true);
    
    // Log successful verification
    console.log(`=== Payment Verification Completed ===`);
    console.log(`Reference: ${reference}`);
    console.log(`Amount: ₦${transaction.amount}`);
    console.log(`User: ${transaction.userId}`);
    console.log(`New Balance: ₦${updatedWallet.balance}`);
    console.log(`Timestamp: ${new Date().toISOString()}`);
    
    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
      transaction: {
        id: transaction._id,
        amount: transaction.amount,
        reference: transaction.reference,
        status: transaction.status,
        newBalance: updatedWallet.balance
      },
      code: "VERIFIED_SUCCESS"
    });
    
  } catch (error) {
    console.error("=== Payment Verification Error ===", error);
    
    // Log detailed error for debugging
    console.error("Error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    return NextResponse.json(
      { 
        success: false, 
        error: "Internal server error during verification",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
        code: "INTERNAL_ERROR"
      },
      { status: 500 }
    );
  }
}

// Optional: POST method for webhook-style verification
export async function POST(request) {
  try {
    const body = await request.json();
    const { reference } = body;
    
    if (!reference) {
      return NextResponse.json(
        { success: false, error: "Reference is required" },
        { status: 400 }
      );
    }
    
    // Call the GET handler logic
    const url = new URL(request.url);
    url.pathname = `/api/payment/verify/${reference}`;
    
    const getRequest = new Request(url, {
      method: 'GET',
      headers: request.headers
    });
    
    return GET(getRequest, { params: { reference } });
    
  } catch (error) {
    console.error("POST verification error:", error);
    return NextResponse.json(
      { success: false, error: "Invalid request" },
      { status: 400 }
    );
  }
}