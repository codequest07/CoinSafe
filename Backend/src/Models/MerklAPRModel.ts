import mongoose, { Schema, Document } from "mongoose";

export interface IMerklAPR extends Document {
  opportunityName: string;
  chainId: number;
  apr: number;
  timestamp: Date;
  rawData?: any; // Store complete API response for future use
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

// Compound index for efficient queries by opportunity and time range
MerklAPRSchema.index({ opportunityName: 1, timestamp: -1 });

// Compound index for queries by chain and time range
MerklAPRSchema.index({ chainId: 1, timestamp: -1 });

export default mongoose.model<IMerklAPR>("MerklAPR", MerklAPRSchema);
