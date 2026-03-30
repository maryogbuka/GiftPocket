// lib/email.js - IMPROVED VERSION
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendResetPasswordEmail(toEmail, resetUrl) {
  const { data, error } = await resend.emails.send({
    from: "GiftPocket <noreply@giftpocket.com>",
    to: [toEmail],
    subject: "Reset your password",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10B981;">Reset Your Password</h2>
        <p>Click the button below to reset your password:</p>
        <a href="${resetUrl}" style="background: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Reset Password
        </a>
        <p>Or copy this link: ${resetUrl}</p>
        <p>This link will expire in 1 hour.</p>
      </div>
    `,
  });

  if (error) {
    console.error("Error sending reset password email:", error);
    throw new Error("Failed to send reset password email");
  }

  return data;
}

export async function sendWelcomeEmail({ to, name, walletId, hasVirtualAccount, accountNumber, bankName }) {
  const { data, error } = await resend.emails.send({
    from: "GiftPocket <welcome@giftpocket.com>",
    to: [to],
    subject: "Welcome to GiftPocket! 🎁",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #10B981; margin-bottom: 10px;">Welcome to GiftPocket! 🎁</h1>
          <p style="color: #6B7280; font-size: 16px;">Thank you for joining our community</p>
        </div>
        
        <div style="background: #F3F4F6; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
          <h3 style="color: #374151; margin-bottom: 15px;">Hello ${name},</h3>
          <p style="color: #4B5563; line-height: 1.6;">
            Your account has been successfully created! Here are your account details:
          </p>
          
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <p style="margin: 8px 0;"><strong>Wallet ID:</strong> ${walletId}</p>
            <p style="margin: 8px 0;"><strong>Email:</strong> ${to}</p>
            ${hasVirtualAccount && accountNumber ? `
              <p style="margin: 8px 0;"><strong>Virtual Account:</strong> ${accountNumber}</p>
              <p style="margin: 8px 0;"><strong>Bank:</strong> ${bankName}</p>
            ` : '<p style="margin: 8px 0;"><strong>Virtual Account:</strong> Will be generated after BVN verification</p>'}
          </div>
        </div>
        
        <div style="background: #FEF3C7; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
          <h4 style="color: #92400E; margin-bottom: 10px;">🚀 Get Started</h4>
          <ul style="color: #92400E; padding-left: 20px;">
            <li>Complete your profile</li>
            <li>Verify your BVN to get a virtual account</li>
            <li>Start scheduling gifts for loved ones</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB;">
          <p style="color: #6B7280; font-size: 14px;">
            Need help? Contact our support team at <a href="mailto:support@giftpocket.com" style="color: #10B981;">support@giftpocket.com</a>
          </p>
          <p style="color: #9CA3AF; font-size: 12px; margin-top: 10px;">
            © ${new Date().getFullYear()} GiftPocket. All rights reserved.
          </p>
        </div>
      </div>
    `,
  });

  if (error) {
    console.error("Error sending welcome email:", error);
    // Don't throw error - email failure shouldn't block registration
    return null;
  }

  console.log("✅ Welcome email sent to:", to);
  return data;
}

// Create an email service object with all the email functions
const emailService = {
  sendResetPasswordEmail,
  sendWelcomeEmail,
  // You can add more email functions here in the future
  // sendVerificationEmail, sendNotificationEmail, etc.
};

// Export as default
export default emailService;