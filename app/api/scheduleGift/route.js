// app/api/scheduleGift/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth-options";
import { connectDB } from "@/lib/mongodb";  // This is what we actually have
import ScheduledGift from '@/models/ScheduledGift';

// Helper function to format the date nicely
const formatDateForDisplay = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-NG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export async function POST(request) {
  let giftSaved = false;
  let giftId = null;
  
  try {
    console.log('🎁 Someone is trying to schedule a gift...');
    
    // Check if user is logged in
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Hey, you need to be signed in to schedule a gift!'
        },
        { status: 401 }
      );
    }
    
    // Get the data from the request
    const body = await request.json();
    
    // Log what we got (but not the sensitive info)
    console.log('Got data from:', session.user.email);
    console.log('Gift details:', {
      for: body.recipientName,
      date: body.deliveryDate,
      items: body.cartItems?.length || 0
    });

    // Connect to the database - USE THE RIGHT FUNCTION!
    await connectDB();  // Changed from connectToDatabase()
    console.log('✅ Database connected');

    // Check if we have everything we need
    const missingStuff = [];
    
    if (!body.recipientName?.trim()) missingStuff.push("recipient's name");
    if (!body.recipientPhone?.trim()) missingStuff.push("recipient's phone");
    if (!body.deliveryDate?.trim()) missingStuff.push("delivery date");
    if (!body.recipientAddress?.trim()) missingStuff.push("delivery address");
    
    if (missingStuff.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: `Oops! We need a few more details: ${missingStuff.join(', ')}`
        },
        { status: 400 }
      );
    }

    if (!body.cartItems || body.cartItems.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Your cart seems empty. Add some gifts first!'
        },
        { status: 400 }
      );
    }

    const scheduledGift = await ScheduledGift.create({
      customerEmail: session.user.email,
      customerName: session.user.name || 'Gift Giver',
      recipientName: body.recipientName,
      recipientPhone: body.recipientPhone,
      recipientEmail: body.recipientEmail || '',
      deliveryDate: new Date(body.deliveryDate),
      deliveryTime: body.deliveryTime || '12:00',
      personalMessage: body.personalMessage || '',
      specialInstructions: body.specialInstructions || '',
      giftWrap: body.giftWrap || false,
      includeCard: body.includeCard || false,
      cartItems: body.cartItems || [],
      totalAmount: body.totalAmount || 0,
      recipientAddress: body.recipientAddress || '',
      recipientCity: body.recipientCity || '',
      recipientState: body.recipientState || '',
      relationship: body.relationship || 'friend',
      occasion: body.occasion || 'just because',
      status: 'scheduled',
      isSurprise: true,
      paymentStatus: 'paid'
    });

    giftSaved = true;
    giftId = scheduledGift._id;
    
    console.log('✅ Gift saved! ID:', giftId);
    console.log('📦 Tracking number:', scheduledGift.trackingNumber);

    // You could send an email here if you have email setup
    // But for now, let's just return success
    
    return NextResponse.json({ 
      success: true,
      message: 'Awesome! Your surprise gift is scheduled! 🎉',
      data: {
        trackingNumber: scheduledGift.trackingNumber,
        giftId: giftId,
        deliveryDate: body.deliveryDate,
        formattedDeliveryDate: formatDateForDisplay(body.deliveryDate),
        totalAmount: body.totalAmount || 0,
        recipientName: body.recipientName
      }
    });

  } catch (error) {
    console.error('❌ Oh no, something went wrong:', error);
    
    // Try to clean up if we saved the gift but something else failed
    if (giftSaved && giftId) {
      try {
        await ScheduledGift.findByIdAndDelete(giftId);
        console.log('🗑️ Cleaned up gift after error');
      } catch (cleanupError) {
        console.error('Could not cleanup:', cleanupError);
      }
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: error.message.includes('duplicate') 
          ? 'Looks like this gift was already scheduled.'
          : 'Sorry, something went wrong on our end. Please try again.'
      },
      { status: 500 }
    );
  }
}

// Also add a GET endpoint if you need to fetch scheduled gifts
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Need to be signed in',
          gifts: [] 
        },
        { status: 401 }
      );
    }

    await connectDB();

    const gifts = await ScheduledGift.find({ 
      customerEmail: session.user.email 
    })
    .sort({ deliveryDate: 1, createdAt: -1 })
    .limit(20);

    return NextResponse.json({ 
      success: true,
      gifts: gifts.map(gift => ({
        id: gift._id,
        trackingNumber: gift.trackingNumber,
        recipientName: gift.recipientName,
        deliveryDate: gift.deliveryDate,
        status: gift.status,
        totalAmount: gift.totalAmount,
        items: gift.cartItems?.length || 0
      }))
    });

  } catch (error) {
    console.error('Error fetching gifts:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Could not load gifts',
        gifts: [] 
      },
      { status: 500 }
    );
  }
}