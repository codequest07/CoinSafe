import { firebaseMessaging } from "../config/firebase";
import * as admin from "firebase-admin";
import User from "../Models/UserModel";
import NotificationModel from "../Models/NotificationModel";

interface SendNotificationOptions {
  title: string;
  body: string;
  type: string;
  data?: Record<string, string>;
  icon?: string;
}

interface SendResult {
  successCount: number;
  failureCount: number;
  totalRecipients: number;
}

export class NotificationService {
  /**
   * Send push notification to all users with valid FCM tokens
   */
  async sendToAll(
    options: SendNotificationOptions,
    sentBy: string = "system"
  ): Promise<SendResult> {
    const users = await User.find({
      fcmToken: { $ne: null, $exists: true },
      notificationsEnabled: true,
    }).select("fcmToken");

    const tokens = users
      .map((u) => u.fcmToken)
      .filter((t): t is string => !!t);

    if (tokens.length === 0) {
      console.log("No users with active FCM tokens to notify");
      return { successCount: 0, failureCount: 0, totalRecipients: 0 };
    }

    return this.sendToTokens(tokens, options, "all", sentBy);
  }

  /**
   * Send push notification to specific users by wallet addresses
   */
  async sendToUsers(
    walletAddresses: string[],
    options: SendNotificationOptions,
    sentBy: string = "system"
  ): Promise<SendResult> {
    const users = await User.find({
      walletAddress: {
        $in: walletAddresses.map((a) => a.toLowerCase()),
      },
      fcmToken: { $ne: null, $exists: true },
      notificationsEnabled: true,
    }).select("fcmToken walletAddress");

    const tokens = users
      .map((u) => u.fcmToken)
      .filter((t): t is string => !!t);

    if (tokens.length === 0) {
      console.log("No matching users with active FCM tokens");
      return { successCount: 0, failureCount: 0, totalRecipients: 0 };
    }

    return this.sendToTokens(
      tokens,
      options,
      "specific",
      sentBy,
      walletAddresses
    );
  }

  /**
   * Send morning reminder to opted-in users
   */
  async sendMorningReminders(): Promise<SendResult> {
    const users = await User.find({
      fcmToken: { $ne: null, $exists: true },
      notificationsEnabled: true,
      "notificationPreferences.morningReminders": true,
    }).select("fcmToken");

    const tokens = users
      .map((u) => u.fcmToken)
      .filter((t): t is string => !!t);

    if (tokens.length === 0) return { successCount: 0, failureCount: 0, totalRecipients: 0 };

    return this.sendToTokens(
      tokens,
      {
        title: "☀️ Good Morning!",
        body: "Start your day right. Check your savings and daily yield!",
        type: "daily_reminder",
      },
      "all",
      "system"
    );
  }

  /**
   * Send evening reminder to opted-in users
   */
  async sendEveningReminders(): Promise<SendResult> {
    const users = await User.find({
      fcmToken: { $ne: null, $exists: true },
      notificationsEnabled: true,
      "notificationPreferences.eveningReminders": true,
    }).select("fcmToken");

    const tokens = users
      .map((u) => u.fcmToken)
      .filter((t): t is string => !!t);

    if (tokens.length === 0) return { successCount: 0, failureCount: 0, totalRecipients: 0 };

    return this.sendToTokens(
      tokens,
      {
        title: "🌙 Evening Check-in",
        body: "Review your savings progress and plan for tomorrow",
        type: "evening_reminder",
      },
      "all",
      "system"
    );
  }

  /**
   * Send weekly summary to opted-in users
   */
  async sendWeeklySummary(): Promise<SendResult> {
    const users = await User.find({
      fcmToken: { $ne: null, $exists: true },
      notificationsEnabled: true,
      "notificationPreferences.weeklyDigest": true,
    }).select("fcmToken");

    const tokens = users
      .map((u) => u.fcmToken)
      .filter((t): t is string => !!t);

    if (tokens.length === 0) return { successCount: 0, failureCount: 0, totalRecipients: 0 };

    return this.sendToTokens(
      tokens,
      {
        title: "📊 Your Weekly Summary",
        body: "Check out your savings performance this week!",
        type: "weekly_summary",
      },
      "all",
      "system"
    );
  }

  /**
   * Send notification to a single user by wallet address
   */
  async sendToSingleUser(
    walletAddress: string,
    options: SendNotificationOptions
  ): Promise<boolean> {
    const user = await User.findOne({
      walletAddress: walletAddress.toLowerCase(),
      fcmToken: { $ne: null },
      notificationsEnabled: true,
    }).select("fcmToken");

    if (!user?.fcmToken) return false;

    try {
      await firebaseMessaging.send({
        notification: { title: options.title, body: options.body },
        data: {
          type: options.type,
          timestamp: Date.now().toString(),
          ...(options.data || {}),
        },
        webpush: {
          fcmOptions: { link: "/" },
          notification: {
            icon: options.icon || "/icon-192.png",
            badge: "/icon-96.png",
          },
        },
        token: user.fcmToken,
      });
      return true;
    } catch (error) {
      console.error("Failed to send notification to user:", error);
      await this.handleInvalidToken(user.fcmToken);
      return false;
    }
  }

  /**
   * Core method: send to an array of FCM tokens and log the result
   */
  private async sendToTokens(
    tokens: string[],
    options: SendNotificationOptions,
    targetAudience: "all" | "specific",
    sentBy: string,
    targetUserIds?: string[]
  ): Promise<SendResult> {
    const notificationRecord = await NotificationModel.create({
      title: options.title,
      body: options.body,
      type: options.type,
      data: options.data,
      targetAudience,
      targetUserIds,
      sentBy,
      totalRecipients: tokens.length,
      status: "sending",
    });

    try {
      const batchSize = 500;
      let totalSuccess = 0;
      let totalFailure = 0;
      const allInvalidTokens: string[] = [];

      for (let i = 0; i < tokens.length; i += batchSize) {
        const batch = tokens.slice(i, i + batchSize);

        const message: admin.messaging.MulticastMessage = {
          notification: { title: options.title, body: options.body },
          data: {
            type: options.type,
            timestamp: Date.now().toString(),
            ...(options.data || {}),
          },
          webpush: {
            fcmOptions: { link: "/" },
            notification: {
              icon: options.icon || "/icon-192.png",
              badge: "/icon-96.png",
              requireInteraction: false,
            },
          },
          tokens: batch,
        };

        const response = await firebaseMessaging.sendEachForMulticast(message);

        const successCount = response.responses.filter(
          (r) => r.success
        ).length;
        const failureCount = response.responses.filter(
          (r) => !r.success
        ).length;

        totalSuccess += successCount;
        totalFailure += failureCount;

        response.responses.forEach((resp, idx) => {
          if (
            !resp.success &&
            (resp.error?.code === "messaging/invalid-registration-token" ||
              resp.error?.code ===
                "messaging/registration-token-not-registered")
          ) {
            allInvalidTokens.push(batch[idx]);
          }
        });
      }

      if (allInvalidTokens.length > 0) {
        await this.cleanupInvalidTokens(allInvalidTokens);
      }

      await NotificationModel.findByIdAndUpdate(notificationRecord._id, {
        successCount: totalSuccess,
        failureCount: totalFailure,
        status: "sent",
        sentAt: new Date(),
      });

      console.log(
        `Notifications sent: ${totalSuccess} success, ${totalFailure} failed`
      );

      return {
        successCount: totalSuccess,
        failureCount: totalFailure,
        totalRecipients: tokens.length,
      };
    } catch (error) {
      console.error("Error sending notifications:", error);

      await NotificationModel.findByIdAndUpdate(notificationRecord._id, {
        status: "failed",
      });

      throw error;
    }
  }

  /**
   * Remove invalid FCM tokens from user records
   */
  private async cleanupInvalidTokens(invalidTokens: string[]): Promise<void> {
    console.log(`Cleaning up ${invalidTokens.length} invalid FCM tokens`);

    await User.updateMany(
      { fcmToken: { $in: invalidTokens } },
      { $set: { fcmToken: null, notificationsEnabled: false } }
    );
  }

  private async handleInvalidToken(token: string): Promise<void> {
    await User.updateOne(
      { fcmToken: token },
      { $set: { fcmToken: null, notificationsEnabled: false } }
    );
  }

  /**
   * Save or update FCM token for a user
   */
  async saveFCMToken(
    walletAddress: string,
    token: string,
    preferences?: Record<string, boolean>
  ): Promise<void> {
    const updateData: Record<string, any> = {
      walletAddress: walletAddress.toLowerCase(),
      fcmToken: token,
      notificationsEnabled: true,
    };

    if (preferences) {
      for (const [key, value] of Object.entries(preferences)) {
        updateData[`notificationPreferences.${key}`] = value;
      }
    }

    await User.findOneAndUpdate(
      { walletAddress: walletAddress.toLowerCase() },
      { $set: updateData },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  /**
   * Update notification preferences for a user
   */
  async updatePreferences(
    walletAddress: string,
    preferences: {
      morningReminders?: boolean;
      eveningReminders?: boolean;
      weeklyDigest?: boolean;
      timezone?: string;
      preferredNotificationHour?: number;
    }
  ): Promise<void> {
    const updateData: Record<string, any> = {};

    if (preferences.morningReminders !== undefined) {
      updateData["notificationPreferences.morningReminders"] =
        preferences.morningReminders;
    }
    if (preferences.eveningReminders !== undefined) {
      updateData["notificationPreferences.eveningReminders"] =
        preferences.eveningReminders;
    }
    if (preferences.weeklyDigest !== undefined) {
      updateData["notificationPreferences.weeklyDigest"] =
        preferences.weeklyDigest;
    }
    if (preferences.timezone) {
      updateData.timezone = preferences.timezone;
    }
    if (preferences.preferredNotificationHour !== undefined) {
      updateData.preferredNotificationHour =
        preferences.preferredNotificationHour;
    }

    await User.findOneAndUpdate(
      { walletAddress: walletAddress.toLowerCase() },
      { $set: updateData }
    );
  }

  /**
   * Disable notifications for a user
   */
  async disableNotifications(walletAddress: string): Promise<void> {
    await User.findOneAndUpdate(
      { walletAddress: walletAddress.toLowerCase() },
      { $set: { fcmToken: null, notificationsEnabled: false } }
    );
  }

  /**
   * Get notification history (for admin dashboard)
   */
  async getNotificationHistory(
    page: number = 1,
    limit: number = 20
  ): Promise<{
    notifications: any[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    const [notifications, total] = await Promise.all([
      NotificationModel.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      NotificationModel.countDocuments(),
    ]);

    return {
      notifications,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get notification stats
   */
  async getStats(): Promise<{
    totalSent: number;
    totalSuccess: number;
    totalFailed: number;
    activeSubscribers: number;
  }> {
    const [stats, activeSubscribers] = await Promise.all([
      NotificationModel.aggregate([
        { $match: { status: "sent" } },
        {
          $group: {
            _id: null,
            totalSent: { $sum: "$totalRecipients" },
            totalSuccess: { $sum: "$successCount" },
            totalFailed: { $sum: "$failureCount" },
          },
        },
      ]),
      User.countDocuments({
        fcmToken: { $ne: null },
        notificationsEnabled: true,
      }),
    ]);

    return {
      totalSent: stats[0]?.totalSent || 0,
      totalSuccess: stats[0]?.totalSuccess || 0,
      totalFailed: stats[0]?.totalFailed || 0,
      activeSubscribers,
    };
  }
}

export const notificationService = new NotificationService();
