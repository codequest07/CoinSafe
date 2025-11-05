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
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const MerklAPRSchema = new mongoose_1.Schema({
    opportunityName: {
        type: String,
        required: true,
        index: true, // For efficient querying by opportunity name
    },
    chainId: {
        type: Number,
        required: true,
        index: true, // For efficient querying by chain
    },
    tokenSymbol: {
        type: String,
        required: true,
        index: true, // For efficient querying by token symbol
    },
    tokenName: {
        type: String,
        required: true,
    },
    tokenAddress: {
        type: String,
        required: true,
        index: true, // For efficient querying by token address
    },
    apr: {
        type: Number,
        required: true,
    },
    timestamp: {
        type: Date,
        required: true,
        default: Date.now,
        index: true, // For efficient time-based queries
    },
    rawData: {
        type: mongoose_1.Schema.Types.Mixed,
        required: false,
    },
}, {
    timestamps: true, // Adds createdAt and updatedAt fields
});
// Compound indexes for efficient queries
MerklAPRSchema.index({ opportunityName: 1, timestamp: -1 });
MerklAPRSchema.index({ chainId: 1, timestamp: -1 });
MerklAPRSchema.index({ tokenSymbol: 1, timestamp: -1 });
MerklAPRSchema.index({ tokenAddress: 1, timestamp: -1 });
MerklAPRSchema.index({ opportunityName: 1, tokenSymbol: 1, timestamp: -1 });
exports.default = mongoose_1.default.model("MerklAPR", MerklAPRSchema);
//# sourceMappingURL=MerklAPRModel.js.map