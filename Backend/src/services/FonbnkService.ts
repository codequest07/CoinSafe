import * as jwt from "jsonwebtoken";
import { v4 as uuid } from "uuid";
import axios from "axios";

export interface FonbnkConfig {
  signatureSecret: string;
  source: string;
  environment: "sandbox" | "production";
}

export interface PaymentUrlParams {
  amount?: number;
  currency?: string;
  country?: string;
  walletAddress?: string;
  redirectUrl?: string;
  customData?: Record<string, any>;
}

export interface WebhookPayload {
  orderId: string;
  status: "pending" | "completed" | "failed" | "cancelled";
  amount: number;
  currency: string;
  transactionId?: string;
  walletAddress?: string;
  customData?: Record<string, any>;
  timestamp: string;
}

export class FonbnkService {
  private config: FonbnkConfig;
  private baseUrl: string;

  constructor(config: FonbnkConfig) {
    this.config = config;
    this.baseUrl =
      config.environment === "sandbox"
        ? "https://sandbox-pay.fonbnk.com"
        : "https://pay.fonbnk.com";
  }

  /**
   * Generate a JWT signature for Fonbnk payment URL
   */
  public generateSignature(customData?: Record<string, any>): string {
    const payload = {
      uid: uuid(),
      ...customData,
    };

    return jwt.sign(payload, this.config.signatureSecret, {
      algorithm: "HS256",
    });
  }

  /**
   * Create a payment URL for on-ramp
   */
  createPaymentUrl(params: PaymentUrlParams = {}): string {
    const signature = this.generateSignature(params.customData);

    const urlParams = new URLSearchParams({
      source: this.config.source,
      signature: signature,
      ...(params.amount && { amount: params.amount.toString() }),
      ...(params.currency && { currency: params.currency }),
      ...(params.country && { country: params.country }),
      ...(params.walletAddress && { walletAddress: params.walletAddress }),
      ...(params.redirectUrl && { redirectUrl: params.redirectUrl }),
    });

    return `${this.baseUrl}/?${urlParams.toString()}`;
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    try {
      const decoded = jwt.verify(signature, this.config.signatureSecret, {
        algorithms: ["HS256"],
      });
      return true;
    } catch (error) {
      console.error("Webhook signature verification failed:", error);
      return false;
    }
  }

  /**
   * Process webhook payload
   */
  processWebhook(
    payload: WebhookPayload,
    signature: string
  ): {
    isValid: boolean;
    data?: WebhookPayload;
    error?: string;
  } {
    // Verify the webhook signature
    if (!this.verifyWebhookSignature(JSON.stringify(payload), signature)) {
      return {
        isValid: false,
        error: "Invalid webhook signature",
      };
    }

    return {
      isValid: true,
      data: payload,
    };
  }

  /**
   * Get supported countries
   */
  async getSupportedCountries(): Promise<string[]> {
    // This would typically call Fonbnk's API
    // For now, returning common supported countries
    return ["NG", "KE", "GH", "ZA", "UG", "TZ"];
  }

  /**
   * Get supported currencies
   */
  async getSupportedCurrencies(): Promise<string[]> {
    // This would typically call Fonbnk's API
    // For now, returning common supported currencies
    return ["NGN", "KES", "GHS", "USD", "EUR"];
  }

  /**
   * Get order status (if you have order ID)
   */
  async getOrderStatus(orderId: string): Promise<any> {
    try {
      // This would call Fonbnk's merchant API
      // For now, returning a mock response
      return {
        orderId,
        status: "pending",
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(`Failed to get order status: ${error}`);
    }
  }
}
