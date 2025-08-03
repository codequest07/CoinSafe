"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FonbnkController = void 0;
const FonbnkService_1 = require("../services/FonbnkService");
const FonbnkTransactionModel_1 = require("../Models/FonbnkTransactionModel");
class FonbnkController {
    constructor() {
        // Initialize Fonbnk service with configuration from environment variables
        const config = {
            signatureSecret: process.env.FONBNK_SIGNATURE_SECRET || "",
            source: process.env.FONBNK_SOURCE || "",
            environment: (process.env.FONBNK_ENVIRONMENT || "sandbox"),
        };
        this.fonbnkService = new FonbnkService_1.FonbnkService(config);
    }
    /**
     * Create a payment URL for on-ramp
     */
    createPaymentUrl(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { amount, currency = "NGN", country = "NG", walletAddress, redirectUrl, customData, } = req.body;
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
                const params = {
                    amount,
                    currency,
                    country,
                    walletAddress,
                    redirectUrl,
                    customData,
                };
                const paymentUrl = this.fonbnkService.createPaymentUrl(params);
                // Create a transaction record in the database
                const transaction = new FonbnkTransactionModel_1.FonbnkTransactionModel({
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
                yield transaction.save();
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
            }
            catch (error) {
                console.error("Error creating payment URL:", error);
                res.status(500).json({
                    success: false,
                    error: "Failed to create payment URL",
                });
            }
        });
    }
    /**
     * Handle webhook from Fonbnk
     */
    handleWebhook(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const payload = req.body;
                const signature = req.headers["x-fonbnk-signature"];
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
                switch (data === null || data === void 0 ? void 0 : data.status) {
                    case "completed":
                        // Handle successful payment
                        yield this.handleSuccessfulPayment(data);
                        break;
                    case "failed":
                        // Handle failed payment
                        yield this.handleFailedPayment(data);
                        break;
                    case "cancelled":
                        // Handle cancelled payment
                        yield this.handleCancelledPayment(data);
                        break;
                    default:
                        // Handle pending payment
                        yield this.handlePendingPayment(data);
                }
                res.json({
                    success: true,
                    message: "Webhook processed successfully",
                });
            }
            catch (error) {
                console.error("Error processing webhook:", error);
                res.status(500).json({
                    success: false,
                    error: "Failed to process webhook",
                });
            }
        });
    }
    /**
     * Get supported countries
     */
    getSupportedCountries(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const countries = yield this.fonbnkService.getSupportedCountries();
                res.json({
                    success: true,
                    data: countries,
                });
            }
            catch (error) {
                console.error("Error getting supported countries:", error);
                res.status(500).json({
                    success: false,
                    error: "Failed to get supported countries",
                });
            }
        });
    }
    /**
     * Get supported currencies
     */
    getSupportedCurrencies(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const currencies = yield this.fonbnkService.getSupportedCurrencies();
                res.json({
                    success: true,
                    data: currencies,
                });
            }
            catch (error) {
                console.error("Error getting supported currencies:", error);
                res.status(500).json({
                    success: false,
                    error: "Failed to get supported currencies",
                });
            }
        });
    }
    /**
     * Get order status
     */
    getOrderStatus(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { orderId } = req.params;
                if (!orderId) {
                    res.status(400).json({
                        success: false,
                        error: "Order ID is required",
                    });
                    return;
                }
                const orderStatus = yield this.fonbnkService.getOrderStatus(orderId);
                res.json({
                    success: true,
                    data: orderStatus,
                });
            }
            catch (error) {
                console.error("Error getting order status:", error);
                res.status(500).json({
                    success: false,
                    error: "Failed to get order status",
                });
            }
        });
    }
    /**
     * Generate JWT signature for Fonbnk
     */
    generateSignature(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { customData } = req.query;
                // Parse custom data if provided
                let parsedCustomData = {};
                if (customData && typeof customData === "string") {
                    try {
                        parsedCustomData = JSON.parse(customData);
                    }
                    catch (e) {
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
            }
            catch (error) {
                console.error("Error generating signature:", error);
                res.status(500).json({
                    success: false,
                    error: "Failed to generate signature",
                });
            }
        });
    }
    /**
     * Handle successful payment
     */
    handleSuccessfulPayment(data) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("✅ Payment completed:", data);
            try {
                // Update transaction status in database
                yield FonbnkTransactionModel_1.FonbnkTransactionModel.findOneAndUpdate({ orderId: data.orderId }, {
                    status: "completed",
                    transactionId: data.transactionId,
                    updatedAt: new Date(),
                });
                // TODO: Implement your business logic here
                // - Update user's balance
                // - Send confirmation email
                // - Update transaction history
                // - Trigger any other business processes
            }
            catch (error) {
                console.error("Error handling successful payment:", error);
            }
        });
    }
    /**
     * Handle failed payment
     */
    handleFailedPayment(data) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("❌ Payment failed:", data);
            try {
                // Update transaction status in database
                yield FonbnkTransactionModel_1.FonbnkTransactionModel.findOneAndUpdate({ orderId: data.orderId }, {
                    status: "failed",
                    updatedAt: new Date(),
                });
                // TODO: Implement your business logic here
                // - Notify user of failure
                // - Update transaction status
                // - Handle refund if necessary
            }
            catch (error) {
                console.error("Error handling failed payment:", error);
            }
        });
    }
    /**
     * Handle cancelled payment
     */
    handleCancelledPayment(data) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("🚫 Payment cancelled:", data);
            try {
                // Update transaction status in database
                yield FonbnkTransactionModel_1.FonbnkTransactionModel.findOneAndUpdate({ orderId: data.orderId }, {
                    status: "cancelled",
                    updatedAt: new Date(),
                });
                // TODO: Implement your business logic here
                // - Update transaction status
                // - Notify user of cancellation
            }
            catch (error) {
                console.error("Error handling cancelled payment:", error);
            }
        });
    }
    /**
     * Handle pending payment
     */
    handlePendingPayment(data) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("⏳ Payment pending:", data);
            try {
                // Update transaction status in database
                yield FonbnkTransactionModel_1.FonbnkTransactionModel.findOneAndUpdate({ orderId: data.orderId }, {
                    status: "pending",
                    updatedAt: new Date(),
                });
                // TODO: Implement your business logic here
                // - Update transaction status
                // - Send pending notification
            }
            catch (error) {
                console.error("Error handling pending payment:", error);
            }
        });
    }
}
exports.FonbnkController = FonbnkController;
//# sourceMappingURL=FonbnkController.js.map