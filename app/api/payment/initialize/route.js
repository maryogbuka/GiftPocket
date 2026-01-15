import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import flutterwaveService from '@/services/flutterwave';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { amount, description, metadata } = body;
    
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid amount' },
        { status: 400 }
      );
    }
    
    // Initialize payment
    const payment = await flutterwaveService.initializePayment({
      amount,
      description: description || 'GiftPocket Payment',
      email: session.user.email,
      name: session.user.name,
      userId: session.user.id,
      ...metadata,
    });
    
    if (!payment.success) {
      return NextResponse.json(
        { success: false, message: payment.error },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Payment initialized',
      data: {
        link: payment.data.data.link,
        txRef: payment.txRef,
      },
    });
    
  } catch (error) {
    console.error('Payment initialization error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}