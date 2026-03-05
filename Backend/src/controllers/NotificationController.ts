import { Request, Response } from "express";
import { notificationService } from "../services/notificationService";

export class NotificationController {
  /**
   * POST /api/notifications/send
   * Admin endpoint to send push notification to all users or specific users
   */
  async sendNotification(req: Request, res: Response) {
    try {
      const { title, body, type, data, targetAudience, walletAddresses } =
        req.body;

      if (!title || !body) {
        return res.status(400).json({
          success: false,
          error: "title and body are required",
        });
      }

      const options = {
        title,
        body,
        type: type || "admin_broadcast",
        data,
      };

      let result;

      if (targetAudience === "specific" && walletAddresses?.length > 0) {
        result = await notificationService.sendToUsers(
          walletAddresses,
          options,
          "admin"
        );
      } else {
        result = await notificationService.sendToAll(options, "admin");
      }

      return res.json({
        success: true,
        message: "Notification sent successfully",
        data: result,
      });
    } catch (error) {
      console.error("Error sending notification:", error);
      return res.status(500).json({
        success: false,
        error: (error as Error).message,
      });
    }
  }

  /**
   * POST /api/notifications/save-token
   * Save FCM token for a user
   */
  async saveToken(req: Request, res: Response) {
    try {
      const { walletAddress, token, preferences } = req.body;

      if (!walletAddress || !token) {
        return res.status(400).json({
          success: false,
          error: "walletAddress and token are required",
        });
      }

      await notificationService.saveFCMToken(
        walletAddress,
        token,
        preferences
      );

      return res.json({
        success: true,
        message: "FCM token saved successfully",
      });
    } catch (error) {
      console.error("Error saving FCM token:", error);
      return res.status(500).json({
        success: false,
        error: (error as Error).message,
      });
    }
  }

  /**
   * PUT /api/notifications/preferences
   * Update notification preferences for a user
   */
  async updatePreferences(req: Request, res: Response) {
    try {
      const { walletAddress } = req.params;
      const preferences = req.body;

      if (!walletAddress) {
        return res.status(400).json({
          success: false,
          error: "walletAddress is required",
        });
      }

      await notificationService.updatePreferences(walletAddress, preferences);

      return res.json({
        success: true,
        message: "Preferences updated successfully",
      });
    } catch (error) {
      console.error("Error updating preferences:", error);
      return res.status(500).json({
        success: false,
        error: (error as Error).message,
      });
    }
  }

  /**
   * DELETE /api/notifications/unsubscribe
   * Disable notifications for a user
   */
  async unsubscribe(req: Request, res: Response) {
    try {
      const { walletAddress } = req.body;

      if (!walletAddress) {
        return res.status(400).json({
          success: false,
          error: "walletAddress is required",
        });
      }

      await notificationService.disableNotifications(walletAddress);

      return res.json({
        success: true,
        message: "Notifications disabled",
      });
    } catch (error) {
      console.error("Error unsubscribing:", error);
      return res.status(500).json({
        success: false,
        error: (error as Error).message,
      });
    }
  }

  /**
   * GET /api/notifications/history
   * Get notification history (admin)
   */
  async getHistory(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await notificationService.getNotificationHistory(
        page,
        limit
      );

      return res.json({ success: true, data: result });
    } catch (error) {
      console.error("Error fetching notification history:", error);
      return res.status(500).json({
        success: false,
        error: (error as Error).message,
      });
    }
  }

  /**
   * GET /api/notifications/stats
   * Get notification stats (admin)
   */
  async getStats(req: Request, res: Response) {
    try {
      const stats = await notificationService.getStats();
      return res.json({ success: true, data: stats });
    } catch (error) {
      console.error("Error fetching notification stats:", error);
      return res.status(500).json({
        success: false,
        error: (error as Error).message,
      });
    }
  }

  /**
   * POST /api/notifications/test
   * Send a test notification to a specific wallet address
   */
  async sendTestNotification(req: Request, res: Response) {
    try {
      const { walletAddress } = req.body;

      if (!walletAddress) {
        return res.status(400).json({
          success: false,
          error: "walletAddress is required",
        });
      }

      const sent = await notificationService.sendToSingleUser(walletAddress, {
        title: "🔔 Test Notification",
        body: "This is a test notification from CoinSafe!",
        type: "admin_targeted",
      });

      return res.json({
        success: sent,
        message: sent
          ? "Test notification sent"
          : "Failed to send - user may not have notifications enabled",
      });
    } catch (error) {
      console.error("Error sending test notification:", error);
      return res.status(500).json({
        success: false,
        error: (error as Error).message,
      });
    }
  }

  /**
   * POST /api/notifications/trigger/morning
   * Manually trigger morning reminders
   */
  async triggerMorningReminders(req: Request, res: Response) {
    try {
      const result = await notificationService.sendMorningReminders();
      return res.json({
        success: true,
        message: "Morning reminders sent",
        data: result,
      });
    } catch (error) {
      console.error("Error triggering morning reminders:", error);
      return res.status(500).json({
        success: false,
        error: (error as Error).message,
      });
    }
  }

  /**
   * POST /api/notifications/trigger/evening
   * Manually trigger evening reminders
   */
  async triggerEveningReminders(req: Request, res: Response) {
    try {
      const result = await notificationService.sendEveningReminders();
      return res.json({
        success: true,
        message: "Evening reminders sent",
        data: result,
      });
    } catch (error) {
      console.error("Error triggering evening reminders:", error);
      return res.status(500).json({
        success: false,
        error: (error as Error).message,
      });
    }
  }

  /**
   * POST /api/notifications/trigger/weekly
   * Manually trigger weekly summary
   */
  async triggerWeeklySummary(req: Request, res: Response) {
    try {
      const result = await notificationService.sendWeeklySummary();
      return res.json({
        success: true,
        message: "Weekly summary sent",
        data: result,
      });
    } catch (error) {
      console.error("Error triggering weekly summary:", error);
      return res.status(500).json({
        success: false,
        error: (error as Error).message,
      });
    }
  }
}
