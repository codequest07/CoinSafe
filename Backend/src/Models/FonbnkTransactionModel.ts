import mongoose, { Document, Schema } from 'mongoose';

export interface IFonbnkTransaction extends Document {
  orderId: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  amount: number;
  currency: string;
  walletAddress: string;
  transactionId?: string;
  customData?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  userId?: string; // Optional: link to your user system
  redirectUrl?: string;
  country?: string;
}

const FonbnkTransactionSchema = new Schema<IFonbnkTransaction>({
  orderId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    required: true,
    default: 'NGN'
  },
  walletAddress: {
    type: String,
    required: true
  },
  transactionId: {
    type: String,
    sparse: true
  },
  customData: {
    type: Schema.Types.Mixed,
    default: {}
  },
  userId: {
    type: String,
    sparse: true
  },
  redirectUrl: {
    type: String
  },
  country: {
    type: String,
    default: 'NG'
  }
}, {
  timestamps: true
});

// Index for efficient queries
FonbnkTransactionSchema.index({ status: 1, createdAt: -1 });
FonbnkTransactionSchema.index({ walletAddress: 1 });
FonbnkTransactionSchema.index({ userId: 1 });

export const FonbnkTransactionModel = mongoose.model<IFonbnkTransaction>(
  'FonbnkTransaction',
  FonbnkTransactionSchema
); 