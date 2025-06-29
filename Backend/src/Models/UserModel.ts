import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  walletAddress: string;
  email: string;
  emailVerified: boolean;
  twitterHandle?: string;
  discordHandle?: string;
  verificationToken?: string;
  verificationTokenExpires?: Date;
  notificationPreferences: {
    deposit: boolean;
    withdrawal: boolean;
    safeMaturing: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  walletAddress: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  emailVerified: { type: Boolean, default: false },
  twitterHandle: { type: String, trim: true },
  discordHandle: { type: String, trim: true },
  verificationToken: { type: String },
  verificationTokenExpires: { type: Date },
  notificationPreferences: {
    deposit: { type: Boolean, default: true },
    withdrawal: { type: Boolean, default: true },
    safeMaturing: { type: Boolean, default: true },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Update `updatedAt` on save
UserSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

// For `findOneAndUpdate` or `updateOne`
UserSchema.pre(["findOneAndUpdate", "updateOne"], function (next) {
  this.set({ updatedAt: new Date() });
  next();
});

export default mongoose.model<IUser>("User", UserSchema);
