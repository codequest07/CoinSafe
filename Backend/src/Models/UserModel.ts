import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  walletAddress: string;
  emailAddress?: string;
  isEmailVerified: boolean;
  twitter?: {
    id: string;
    username: string;
    accessToken: string;
    refreshToken: string;
  };
  discord?: {
    id: string;
    username: string;
    accessToken: string;
    refreshToken: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    walletAddress: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    emailAddress: {
      type: String,
      unique: true, 
      sparse: true, // Allows multiple documents to have null emailAddress
      lowercase: true,
      trim: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    twitter: {
      id: { type: String },
      username: { type: String },
      accessToken: { type: String },
      refreshToken: { type: String },
    },
    discord: {
      id: { type: String },
      username: { type: String },
      accessToken: { type: String },
      refreshToken: { type: String },
    },
  },
  {
    timestamps: true,
  }
);

// Create and export the Mongoose model
const User = mongoose.model<IUser>("User", UserSchema);

export default User;
