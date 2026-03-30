// app/api/wallet/balance/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth-options";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(request) {
  try {
    console.log('💰 Wallet balance API called');
    
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await connectDB();
    
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    
    console.log('✅ User found, wallet balance:', user.walletBalance);
    
    return NextResponse.json({
      success: true,
      balance: user.walletBalance || 0,
      currency: 'NGN'
    });
    
  } catch (error) {
    console.error('Wallet balance API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}