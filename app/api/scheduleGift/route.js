// app/api/scheduleGift/route.js
// This file is the backend API route in Next.js.
// It powers the entire “Schedule a Gift” feature in this app.

import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { addScheduledGift, getScheduledGiftsByEmail } from '@/lib/scheduledGifts';


const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    console.log('🎁 Schedule gift API called');
    
    const body = await request.json();
    console.log('Received data:', body);

    // Ensure customerEmail exists
    const customerEmail = body.customerEmail || (body.sessionUserEmail ?? null);
    if (!customerEmail) {
      return NextResponse.json(
        { success: false, message: 'Missing required field: customerEmail' },
        { status: 400 }
      );
    }

    const {
      recipientName,
      recipientPhone,
      deliveryDate,
      deliveryTime,
      personalMessage,
      specialInstructions,
      giftWrap,
      includeCard,
      trackingNumber,
      cartItems = [],
      totalAmount = 0,
      recipientAddress,
      recipientCity,
      recipientState,
      relationship
    } = body;

    // Validate required fields
    const requiredFields = [
      'recipientName', 
      'customerEmail', 
      'recipientPhone', 
      'deliveryDate', 
      'recipientAddress',
      'recipientCity',
      'recipientState',
      'relationship'
    ];
    
    const missingFields = requiredFields.filter(field => !body[field]);
    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: `Missing required fields: ${missingFields.join(', ')}`
        },
        { status: 400 }
      );
    }

    // Save to MongoDB
    const scheduledGift = await addScheduledGift({
      customerEmail,
      recipientName,
      recipientPhone,
      deliveryDate,
      deliveryTime,
      personalMessage: personalMessage || '',
      specialInstructions: specialInstructions || '',
      giftWrap: giftWrap || false,
      includeCard: includeCard || false,
      trackingNumber,
      cartItems,
      totalAmount,
      recipientAddress,
      recipientCity,
      recipientState,
      relationship,
      status: 'scheduled'
    });

    console.log('✅ Gift saved to MongoDB:', scheduledGift);

    let emailsSent = {
  customer: false, // Email ONLY to you (the scheduler)
  recipient: false // No emails to recipient - IT'S A SURPRISE!
};

// Send confirmation email ONLY to CUSTOMER (you - the person scheduling)
try {
  await resend.emails.send({
    from: 'Naija Gifts <mhycienth57@gmail.com>',
    to: customerEmail, // Only send to you
    subject: `🎁 Surprise Gift Scheduled Successfully - ${trackingNumber}`,
    html: generateCustomerConfirmationEmail({
      trackingNumber,
      recipientName,
      deliveryDate,
      deliveryTime,
      totalAmount,
      cartItems,
      customerEmail,
      recipientAddress: `${recipientAddress}, ${recipientCity}, ${recipientState}`,
      personalMessage,
      specialInstructions
    })
  });
  emailsSent.customer = true;
  console.log('✅ Surprise gift confirmation sent to customer:', customerEmail);
} catch (customerError) {
  console.error('❌ Failed to send customer confirmation email:', customerError);
}

// NO EMAILS SENT TO RECIPIENT - IT'S A SURPRISE!

    return NextResponse.json({ 
      success: true,
      message: 'Gift scheduled and saved to database successfully!',
      trackingNumber,
      scheduledGift,
      emailsSent
    });

  } catch (error) {
    console.error('❌ Error in schedule-gift API:', error);
    return NextResponse.json(
      { success: false, message: 'Server error: ' + error.message },
      { status: 500 }
    );
  }
}

// Email templates (keep your existing ones)
function generateCustomerConfirmationEmail(details) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #007bff; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .tracking-number { 
            background: #007bff; 
            color: white; 
            padding: 15px; 
            text-align: center; 
            font-size: 18px; 
            margin: 20px 0; 
            border-radius: 8px;
          }
          .surprise-note { 
            background: #ffeb3b; 
            padding: 15px; 
            border-radius: 8px; 
            margin: 15px 0;
            text-align: center;
            font-weight: bold;
          }
          .detail-section { margin: 15px 0; padding: 15px; background: white; border-radius: 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎁 Surprise Gift Scheduled!</h1>
          </div>
          <div class="content">
            <div class="surprise-note">
              🤫 This is a SURPRISE gift! The recipient will not be notified.
            </div>
            
            <div class="tracking-number">
              <strong>Tracking Number:</strong> ${details.trackingNumber}
            </div>
            
            <div class="detail-section">
              <h3>🎯 Delivery Details</h3>
              <p><strong>Recipient:</strong> ${details.recipientName}</p>
              <p><strong>Delivery Address:</strong> ${details.recipientAddress}</p>
              <p><strong>Delivery Date:</strong> ${details.deliveryDate}</p>
              <p><strong>Delivery Time:</strong> ${details.deliveryTime}</p>
            </div>

            <div class="detail-section">
              <h3>🎁 Gift Items</h3>
              <ul>
                ${details.cartItems.map(item => `
                  <li>${item.name} × ${item.quantity} - ₦${(item.price * item.quantity).toLocaleString()}</li>
                `).join('')}
              </ul>
              <p><strong>Total Amount:</strong> ₦${details.totalAmount.toLocaleString()}</p>
            </div>

            ${details.personalMessage ? `
            <div class="detail-section">
              <h3>💌 Your Personal Message</h3>
              <p><em>"${details.personalMessage}"</em></p>
            </div>
            ` : ''}

            ${details.specialInstructions ? `
            <div class="detail-section">
              <h3>📝 Special Instructions</h3>
              <p>${details.specialInstructions}</p>
            </div>
            ` : ''}

            <div class="detail-section">
              <h3>📞 Need Help?</h3>
              <p>Contact us if you need to make changes to your surprise gift delivery.</p>
            </div>

            <p>Thank you for choosing Naija Gifts for your surprise delivery! 🎀</p>
          </div>
        </div>
      </body>
    </html>
  `;
}


export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ success: false, message: 'Missing email', gifts: [] }, { status: 400 });
    }

    const gifts = await getScheduledGiftsByEmail(email);
    return NextResponse.json({ success: true, gifts });
  } catch (err) {
    console.error('❌ Error fetching gifts:', err);
    return NextResponse.json({ success: false, message: err.message, gifts: [] }, { status: 500 });
  }
}
