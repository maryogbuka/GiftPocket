// app/api/scheduled-gifts/route.js
// This is the API route for fetching scheduled gifts by customer email

import { NextResponse } from 'next/server';
import { getScheduledGiftsByEmail } from '../../../lib/scheduledGifts';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email parameter is required' },
        { status: 400 }
      );
    }

    const gifts = await getScheduledGiftsByEmail(email);
    
    return NextResponse.json({
      success: true,
      gifts: gifts
    });
    
  } catch (error) {
    console.error('Error fetching scheduled gifts:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}