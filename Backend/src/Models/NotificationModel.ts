import mongoose, { Document, Schema } from "mongoose";

export interface INotification extends Document {
  title: string;
  body: string;
  type:
    | "admin_broadcast"
    | "admin_targeted"
    | "daily_reminder"
    | "evening_reminder"
    | "weekly_summary"
    | "custom_reminder"
    | "deposit"
    | "withdrawal"
    | "safe_maturing";
  data?: Record<string, string>;
  targetAudience: "all" | "specific";
  targetUserIds?: string[];
  sentBy: string;
  totalRecipients: number;
  successCount: number;
  failureCount: number;
  status: "pending" | "sending" | "sent" | "failed";
  createdAt: Date;
  sentAt?: Date;
}

const NotificationSchema: Schema = new Schema({
  title: { type: String, required: true },
  body: { type: String, required: true },
  type: {
    type: String,
    enum: [
      "admin_broadcast",
      "admin_targeted",
      "daily_reminder",
      "evening_reminder",
      "weekly_summary",
      "custom_reminder",
      "deposit",
      "withdrawal",
      "safe_maturing",
    ],
    required: true,
  },
  data: { type: Schema.Types.Mixed },
  targetAudience: {
    type: String,
    enum: ["all", "specific"],
    default: "all",
  },
  targetUserIds: [{ type: String }],
  sentBy: { type: String, required: true },
  totalRecipients: { type: Number, default: 0 },
  successCount: { type: Number, default: 0 },
  failureCount: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ["pending", "sending", "sent", "failed"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
  sentAt: { type: Date },
});

export default mongoose.model<INotification>(
  "Notification",
  NotificationSchema
);
