import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  walletAddress: string;
  email: string;
  emailVerified: boolean;
  twitterHandle?: string;
  discordHandle?: string;
  verificationToken?: string;
  verificationTokenExpires?: Date;
  verificationCode?: string;
  verificationCodeExpires?: Date;
  fcmToken?: string;
  notificationsEnabled: boolean;
  notificationPreferences: {
    deposit: boolean;
    withdrawal: boolean;
    safeMaturing: boolean;
    morningReminders: boolean;
    eveningReminders: boolean;
    weeklyDigest: boolean;
  };
  timezone?: string;
  preferredNotificationHour?: number;
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
  verificationCode: { type: String },
  verificationCodeExpires: { type: Date },
  fcmToken: { type: String, default: null },
  notificationsEnabled: { type: Boolean, default: false },
  notificationPreferences: {
    deposit: { type: Boolean, default: true },
    withdrawal: { type: Boolean, default: true },
    safeMaturing: { type: Boolean, default: true },
    morningReminders: { type: Boolean, default: true },
    eveningReminders: { type: Boolean, default: true },
    weeklyDigest: { type: Boolean, default: true },
  },
  timezone: { type: String, default: "America/New_York" },
  preferredNotificationHour: { type: Number, default: 8 },
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
