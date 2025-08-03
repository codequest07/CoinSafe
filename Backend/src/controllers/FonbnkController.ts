import { Request, Response } from "express";
import {
  FonbnkService,
  PaymentUrlParams,
  WebhookPayload,
} from "../services/FonbnkService";
import {
  FonbnkTransactionModel,
  IFonbnkTransaction,
} from "../Models/FonbnkTransactionModel";

export class FonbnkController {
  private fonbnkService: FonbnkService;

  constructor() {
    // Initialize Fonbnk service with configuration from environment variables
    const config = {
      signatureSecret: process.env.FONBNK_SIGNATURE_SECRET || "",
      source: process.env.FONBNK_SOURCE || "",
      environment: (process.env.FONBNK_ENVIRONMENT || "sandbox") as
        | "sandbox"
        | "production",
    };

    this.fonbnkService = new FonbnkService(config);
  }

  /**
   * Create a payment URL for on-ramp
   */
  async createPaymentUrl(req: Request, res: Response): Promise<void> {
    try {
      const {
        amount,
        currency = "NGN",
        country = "NG",
        walletAddress,
        redirectUrl,
        customData,
      } = req.body;

      // Validate required parameters
      if (!amount || amount <= 0) {
        res.status(400).json({
          success: false,
          error: "Amount is required and must be greater than 0",
        });
        return;
      }

      if (!walletAddress) {
        res.status(400).json({
          success: false,
          error: "Wallet address is required",
        });
        return;
      }

      const params: PaymentUrlParams = {
        amount,
        currency,
        country,
        walletAddress,
        redirectUrl,
        customData,
      };

      const paymentUrl = this.fonbnkService.createPaymentUrl(params);

      // Create a transaction record in the database
      const transaction = new FonbnkTransactionModel({
        orderId: `order_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`,
        status: "pending",
        amount,
        currency,
        walletAddress,
        country,
        redirectUrl,
        customData,
        userId: req.body.userId, // Optional: if you have user authentication
      });

      await transaction.save();

      res.json({
        success: true,
        data: {
          paymentUrl,
          orderId: transaction.orderId,
          amount,
          currency,
          country,
          walletAddress,
        },
      });
    } catch (error) {
      console.error("Error creating payment URL:", error);
      res.status(500).json({
        success: false,
        error: "Failed to create payment URL",
      });
    }
  }

  /**
   * Handle webhook from Fonbnk
   */
  async handleWebhook(req: Request, res: Response): Promise<void> {
    try {
      const payload = req.body as WebhookPayload;
      const signature = req.headers["x-fonbnk-signature"] as string;

      if (!signature) {
        res.status(400).json({
          success: false,
          error: "Missing webhook signature",
        });
        return;
      }

      const result = this.fonbnkService.processWebhook(payload, signature);

      if (!result.isValid) {
        res.status(400).json({
          success: false,
          error: result.error,
        });
        return;
      }

      // Process the webhook data based on status
      const { data } = result;

      switch (data?.status) {
        case "completed":
          // Handle successful payment
          await this.handleSuccessfulPayment(data);
          break;
        case "failed":
          // Handle failed payment
          await this.handleFailedPayment(data);
          break;
        case "cancelled":
          // Handle cancelled payment
          await this.handleCancelledPayment(data);
          break;
        default:
          // Handle pending payment
          await this.handlePendingPayment(data);
      }

      res.json({
        success: true,
        message: "Webhook processed successfully",
      });
    } catch (error) {
      console.error("Error processing webhook:", error);
      res.status(500).json({
        success: false,
        error: "Failed to process webhook",
      });
    }
  }

  /**
   * Get supported countries
   */
  async getSupportedCountries(req: Request, res: Response): Promise<void> {
    try {
      const countries = await this.fonbnkService.getSupportedCountries();

      res.json({
        success: true,
        data: countries,
      });
    } catch (error) {
      console.error("Error getting supported countries:", error);
      res.status(500).json({
        success: false,
        error: "Failed to get supported countries",
      });
    }
  }

  /**
   * Get supported currencies
   */
  async getSupportedCurrencies(req: Request, res: Response): Promise<void> {
    try {
      const currencies = await this.fonbnkService.getSupportedCurrencies();

      res.json({
        success: true,
        data: currencies,
      });
    } catch (error) {
      console.error("Error getting supported currencies:", error);
      res.status(500).json({
        success: false,
        error: "Failed to get supported currencies",
      });
    }
  }

  /**
   * Get order status
   */
  async getOrderStatus(req: Request, res: Response): Promise<void> {
    try {
      const { orderId } = req.params;

      if (!orderId) {
        res.status(400).json({
          success: false,
          error: "Order ID is required",
        });
        return;
      }

      const orderStatus = await this.fonbnkService.getOrderStatus(orderId);

      res.json({
        success: true,
        data: orderStatus,
      });
    } catch (error) {
      console.error("Error getting order status:", error);
      res.status(500).json({
        success: false,
        error: "Failed to get order status",
      });
    }
  }

  /**
   * Generate JWT signature for Fonbnk
   */
  async generateSignature(req: Request, res: Response): Promise<void> {
    try {
      const { customData } = req.query;

      // Parse custom data if provided
      let parsedCustomData: Record<string, any> = {};
      if (customData && typeof customData === "string") {
        try {
          parsedCustomData = JSON.parse(customData);
        } catch (e) {
          console.warn("Invalid custom data format:", customData);
        }
      }

      // Generate signature using the service
      const signature = this.fonbnkService.generateSignature(parsedCustomData);

      res.json({
        success: true,
        data: {
          signature,
          timestamp: new Date().toISOString(),
          customData: parsedCustomData,
        },
      });
    } catch (error) {
      console.error("Error generating signature:", error);
      res.status(500).json({
        success: false,
        error: "Failed to generate signature",
      });
    }
  }

  /**
   * Handle successful payment
   */
  private async handleSuccessfulPayment(data: WebhookPayload): Promise<void> {
    console.log("✅ Payment completed:", data);

    try {
      // Update transaction status in database
      await FonbnkTransactionModel.findOneAndUpdate(
        { orderId: data.orderId },
        {
          status: "completed",
          transactionId: data.transactionId,
          updatedAt: new Date(),
        }
      );

      // TODO: Implement your business logic here
      // - Update user's balance
      // - Send confirmation email
      // - Update transaction history
      // - Trigger any other business processes
    } catch (error) {
      console.error("Error handling successful payment:", error);
    }
  }

  /**
   * Handle failed payment
   */
  private async handleFailedPayment(data: WebhookPayload): Promise<void> {
    console.log("❌ Payment failed:", data);

    try {
      // Update transaction status in database
      await FonbnkTransactionModel.findOneAndUpdate(
        { orderId: data.orderId },
        {
          status: "failed",
          updatedAt: new Date(),
        }
      );

      // TODO: Implement your business logic here
      // - Notify user of failure
      // - Update transaction status
      // - Handle refund if necessary
    } catch (error) {
      console.error("Error handling failed payment:", error);
    }
  }

  /**
   * Handle cancelled payment
   */
  private async handleCancelledPayment(data: WebhookPayload): Promise<void> {
    console.log("🚫 Payment cancelled:", data);

    try {
      // Update transaction status in database
      await FonbnkTransactionModel.findOneAndUpdate(
        { orderId: data.orderId },
        {
          status: "cancelled",
          updatedAt: new Date(),
        }
      );

      // TODO: Implement your business logic here
      // - Update transaction status
      // - Notify user of cancellation
    } catch (error) {
      console.error("Error handling cancelled payment:", error);
    }
  }

  /**
   * Handle pending payment
   */
  private async handlePendingPayment(data: WebhookPayload): Promise<void> {
    console.log("⏳ Payment pending:", data);

    try {
      // Update transaction status in database
      await FonbnkTransactionModel.findOneAndUpdate(
        { orderId: data.orderId },
        {
          status: "pending",
          updatedAt: new Date(),
        }
      );

      // TODO: Implement your business logic here
      // - Update transaction status
      // - Send pending notification
    } catch (error) {
      console.error("Error handling pending payment:", error);
    }
  }
}
