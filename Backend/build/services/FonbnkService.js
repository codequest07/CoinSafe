"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.FonbnkService = void 0;
const jwt = __importStar(require("jsonwebtoken"));
const uuid_1 = require("uuid");
class FonbnkService {
    constructor(config) {
        this.config = config;
        this.baseUrl =
            config.environment === "sandbox"
                ? "https://sandbox-pay.fonbnk.com"
                : "https://pay.fonbnk.com";
    }
    /**
     * Generate a JWT signature for Fonbnk payment URL
     */
    generateSignature(customData) {
        const payload = Object.assign({ uid: (0, uuid_1.v4)() }, customData);
        return jwt.sign(payload, this.config.signatureSecret, {
            algorithm: "HS256",
        });
    }
    /**
     * Create a payment URL for on-ramp
     */
    createPaymentUrl(params = {}) {
        const signature = this.generateSignature(params.customData);
        const urlParams = new URLSearchParams(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({ source: this.config.source, signature: signature }, (params.amount && { amount: params.amount.toString() })), (params.currency && { currency: params.currency })), (params.country && { country: params.country })), (params.walletAddress && { walletAddress: params.walletAddress })), (params.redirectUrl && { redirectUrl: params.redirectUrl })));
        return `${this.baseUrl}/?${urlParams.toString()}`;
    }
    /**
     * Verify webhook signature
     */
    verifyWebhookSignature(payload, signature) {
        try {
            const decoded = jwt.verify(signature, this.config.signatureSecret, {
                algorithms: ["HS256"],
            });
            return true;
        }
        catch (error) {
            console.error("Webhook signature verification failed:", error);
            return false;
        }
    }
    /**
     * Process webhook payload
     */
    processWebhook(payload, signature) {
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
    getSupportedCountries() {
        return __awaiter(this, void 0, void 0, function* () {
            // This would typically call Fonbnk's API
            // For now, returning common supported countries
            return ["NG", "KE", "GH", "ZA", "UG", "TZ"];
        });
    }
    /**
     * Get supported currencies
     */
    getSupportedCurrencies() {
        return __awaiter(this, void 0, void 0, function* () {
            // This would typically call Fonbnk's API
            // For now, returning common supported currencies
            return ["NGN", "KES", "GHS", "USD", "EUR"];
        });
    }
    /**
     * Get order status (if you have order ID)
     */
    getOrderStatus(orderId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // This would call Fonbnk's merchant API
                // For now, returning a mock response
                return {
                    orderId,
                    status: "pending",
                    timestamp: new Date().toISOString(),
                };
            }
            catch (error) {
                throw new Error(`Failed to get order status: ${error}`);
            }
        });
    }
}
exports.FonbnkService = FonbnkService;
//# sourceMappingURL=FonbnkService.js.map