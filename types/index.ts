// types/index.ts
export interface User {
  id: string;
  name: string;
  email: string;
  wallet?: Wallet;
  createdAt: Date;
}

export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  virtualAccount?: VirtualAccount;
  transactions: Transaction[];
}

export interface VirtualAccount {
  accountNumber: string;
  bankName: string;
  accountName: string;
}

export interface Transaction {
  id: string;
  userId: string;
  walletId: string;
  type: 'credit' | 'debit';
  amount: number;
  description?: string;
  reference: string;
  status: 'pending' | 'completed' | 'failed';
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface Gift {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: 'electronics' | 'fashion' | 'home' | 'experience' | 'other';
  imageUrl?: string;
  isActive: boolean;
}

export interface ScheduledGift {
  id: string;
  userId: string;
  recipientName: string;
  recipientEmail?: string;
  giftId?: string;
  giftName: string;
  scheduledDate: Date;
  status: 'scheduled' | 'processing' | 'sent' | 'cancelled' | 'failed';
  amount: number;
  transactionId?: string;
}