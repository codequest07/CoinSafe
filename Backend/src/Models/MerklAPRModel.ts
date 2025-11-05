import mongoose, { Schema, Document } from "mongoose";

export interface IMerklAPR extends Document {
  opportunityName: string;
  chainId: number;
  tokenSymbol: string;
  tokenName: string;
  tokenAddress: string;
  apr: number;
  timestamp: Date;
  rawData?: any; // Store complete API response for future use
  createdAt?: Date;
  updatedAt?: Date;
}

const MerklAPRSchema: Schema = new Schema(
  {
    opportunityName: {
      type: String,
      required: true,
      index: true, // For efficient querying by opportunity name
    },
    chainId: {
      type: Number,
      required: true,
      index: true, // For efficient querying by chain
    },
    tokenSymbol: {
      type: String,
      required: true,
      index: true, // For efficient querying by token symbol
    },
    tokenName: {
      type: String,
      required: true,
    },
    tokenAddress: {
      type: String,
      required: true,
      index: true, // For efficient querying by token address
    },
    apr: {
      type: Number,
      required: true,
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
      index: true, // For efficient time-based queries
    },
    rawData: {
      type: Schema.Types.Mixed,
      required: false,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Compound indexes for efficient queries
MerklAPRSchema.index({ opportunityName: 1, timestamp: -1 });
MerklAPRSchema.index({ chainId: 1, timestamp: -1 });
MerklAPRSchema.index({ tokenSymbol: 1, timestamp: -1 });
MerklAPRSchema.index({ tokenAddress: 1, timestamp: -1 });
MerklAPRSchema.index({ opportunityName: 1, tokenSymbol: 1, timestamp: -1 });

export default mongoose.model<IMerklAPR>("MerklAPR", MerklAPRSchema);
