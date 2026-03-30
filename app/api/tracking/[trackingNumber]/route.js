// app/api/tracking/[trackingNumber]/route.js
import { NextResponse } from 'next/server';
import connectToDatabase from "../../../lib/mongodb";
import ScheduledGift from '@/models/ScheduledGift';
;

export async function GET(request, { params }) {
  try {
    const { trackingNumber } = params;
    
    if (!trackingNumber) {
      return NextResponse.json(
        { success: false, error: 'Tracking number is required' },
        { status: 400 }
      );
    }
    
    // Connect to MongoDB
    await connectToDatabase();
    
    // Find scheduled gift by tracking number
    const gift = await ScheduledGift.findOne({ 
      trackingNumber,
      status: { $ne: 'cancelled' }
    }).populate('customerId', 'name email');
    
    if (!gift) {
      return NextResponse.json(
        { success: false, error: 'Tracking number not found' },
        { status: 404 }
      );
    }
    
    // Format the response
    const trackingData = {
      id: gift._id.toString(),
      trackingNumber: gift.trackingNumber,
      recipientName: gift.recipientName,
      recipientPhone: gift.recipientPhone,
      recipientEmail: gift.recipientEmail,
      occasion: gift.relationship || gift.occasion,
      deliveryDate: gift.deliveryDate,
      deliveryTime: gift.deliveryTime,
      items: gift.cartItems,
      totalAmount: gift.totalAmount,
      status: gift.status,
      address: `${gift.recipientAddress}, ${gift.recipientCity}, ${gift.recipientState}`,
      senderName: gift.customerId?.name || 'You',
      senderNote: gift.personalMessage,
      specialInstructions: gift.specialInstructions,
      estimatedDelivery: gift.estimatedDelivery,
      carrier: gift.carrier || 'GiftPocket Express',
      carrierPhone: gift.carrierPhone || '+234 700 GIFT NOW',
      carrierTrackingId: gift.carrierTrackingId,
      deliveryAgent: gift.deliveryAgent,
      trackingSteps: formatTrackingSteps(gift.updates, gift.status),
      isSurprise: gift.isSurprise !== false,
      createdAt: gift.createdAt,
      updatedAt: gift.updatedAt
    };
    
    return NextResponse.json({ 
      success: true, 
      data: trackingData 
    });
    
  } catch (error) {
    console.error('Tracking API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function formatTrackingSteps(updates, currentStatus) {
  // If there are updates in the database, use them
  if (updates && updates.length > 0) {
    return updates.map((update, index) => ({
      id: index + 1,
      status: update.status || currentStatus,
      title: update.title || getDefaultTitle(update.status || currentStatus),
      description: update.description || getDefaultDescription(update.status || currentStatus),
      timestamp: update.timestamp ? new Date(update.timestamp).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }) : 'Pending',
      location: update.location,
      completed: isStepCompleted(update.status || currentStatus, currentStatus)
    }));
  }
  
  // Default steps based on current status
  const defaultSteps = [
    { id: 1, status: 'scheduled', title: 'Gift Scheduled', description: 'Your surprise gift has been scheduled' },
    { id: 2, status: 'processing', title: 'Processing', description: 'Gift is being prepared for delivery' },
    { id: 3, status: 'packaged', title: 'Packaged', description: 'Gift has been beautifully packaged' },
    { id: 4, status: 'shipped', title: 'Shipped', description: 'Gift has been dispatched for delivery' },
    { id: 5, status: 'out_for_delivery', title: 'Out for Delivery', description: 'Gift is on its way to recipient' },
    { id: 6, status: 'delivered', title: 'Delivered', description: 'Gift delivered successfully!' },
  ];
  
  return defaultSteps.map((step, index) => ({
    ...step,
    timestamp: getTimestampForStep(index, step.status, currentStatus),
    completed: isStepCompleted(step.status, currentStatus)
  }));
}

function getDefaultTitle(status) {
  const titles = {
    'scheduled': 'Gift Scheduled',
    'processing': 'Processing',
    'packaged': 'Packaged',
    'shipped': 'Shipped',
    'out_for_delivery': 'Out for Delivery',
    'delivered': 'Delivered',
    'cancelled': 'Cancelled'
  };
  return titles[status] || status;
}

function getDefaultDescription(status) {
  const descriptions = {
    'scheduled': 'Your gift has been scheduled for delivery',
    'processing': 'Your gift is being prepared for delivery',
    'packaged': 'Gift has been beautifully packaged',
    'shipped': 'Your gift has been dispatched for delivery',
    'out_for_delivery': 'Your gift is on its way to the recipient',
    'delivered': 'Gift delivered to recipient successfully',
    'cancelled': 'Order has been cancelled'
  };
  return descriptions[status] || 'Status update';
}

function isStepCompleted(stepStatus, currentStatus) {
  const statusOrder = ['scheduled', 'processing', 'packaged', 'shipped', 'out_for_delivery', 'delivered'];
  const currentIndex = statusOrder.indexOf(currentStatus);
  const stepIndex = statusOrder.indexOf(stepStatus);
  
  if (currentIndex === -1 || stepIndex === -1) return false;
  return stepIndex <= currentIndex;
}

function getTimestampForStep(index, stepStatus, currentStatus) {
  const isCompleted = isStepCompleted(stepStatus, currentStatus);
  if (!isCompleted) return 'Pending';
  
  const now = new Date();
  const hoursBack = (5 - index) * 2; // 2 hours per step
  const baseDate = new Date(now.getTime() - (hoursBack * 60 * 60 * 1000));
  
  return baseDate.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}