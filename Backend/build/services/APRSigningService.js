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
exports.APRSigningService = void 0;
const ethers_1 = require("ethers");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
/**
 * Service for signing APR data using EIP-712 signatures
 */
class APRSigningService {
    constructor() {
        const privateKey = process.env.APR_SIGNER_PRIVATE_KEY ||
            process.env.PRIVATE_KEY ||
            process.env.WALLET_PRIVATE_KEY;
        if (!privateKey) {
            throw new Error("APR_SIGNER_PRIVATE_KEY, PRIVATE_KEY, or WALLET_PRIVATE_KEY must be set in environment variables");
        }
        this.signer = new ethers_1.ethers.Wallet(privateKey);
        const chainId = parseInt(process.env.CHAIN_ID || "1135"); // Default to Lisk
        const verifyingContract = process.env.APR_ORACLE_CONTRACT_ADDRESS || undefined;
        this.domain = {
            name: "CoinSafe APR Oracle",
            version: "1",
            chainId: chainId,
            verifyingContract: verifyingContract,
        };
    }
    /**
     * Get the signer address (public key)
     */
    getSignerAddress() {
        return this.signer.address;
    }
    /**
     * Generate EIP-712 signature for APR data
     * @param aprData - APR data to sign
     * @returns Signature string (0x...)
     */
    signAPRData(aprData) {
        return __awaiter(this, void 0, void 0, function* () {
            // EIP-712 types definition
            const types = {
                APRData: [
                    { name: "tokenSymbol", type: "string" },
                    { name: "tokenAddress", type: "address" },
                    { name: "chainId", type: "uint256" },
                    { name: "aprBasisPoints", type: "uint256" },
                    { name: "timestamp", type: "uint256" },
                    { name: "opportunityName", type: "string" },
                    { name: "nonce", type: "uint256" },
                ],
            };
            // Generate signature
            const signature = yield this.signer.signTypedData(this.domain, types, {
                tokenSymbol: aprData.tokenSymbol,
                tokenAddress: aprData.tokenAddress,
                chainId: aprData.chainId,
                aprBasisPoints: aprData.aprBasisPoints,
                timestamp: aprData.timestamp,
                opportunityName: aprData.opportunityName,
                nonce: aprData.nonce,
            });
            return signature;
        });
    }
    /**
     * Sign APR data with automatic nonce generation
     * @param tokenSymbol - Token symbol (e.g., "LSK", "USDC")
     * @param tokenAddress - Token contract address
     * @param chainId - Chain ID
     * @param apr - APR as percentage (e.g., 12.5 for 12.5%)
     * @param timestamp - Unix timestamp in seconds (defaults to now)
     * @param opportunityName - Opportunity name
     * @param nonce - Optional nonce (defaults to timestamp * 1000 + random)
     * @returns Object with signature and signer address
     */
    signAPR(tokenSymbol, tokenAddress, chainId, apr, timestamp, opportunityName, nonce) {
        return __awaiter(this, void 0, void 0, function* () {
            // Convert timestamp to unix seconds
            const timestampSeconds = timestamp instanceof Date
                ? Math.floor(timestamp.getTime() / 1000)
                : timestamp;
            // Generate nonce if not provided (timestamp in milliseconds + random)
            const finalNonce = nonce ||
                Math.floor(timestampSeconds * 1000) + Math.floor(Math.random() * 1000);
            // Convert APR percentage to basis points (multiply by 10000)
            const aprBasisPoints = Math.round(apr * 10000);
            const aprData = {
                tokenSymbol,
                tokenAddress,
                chainId,
                aprBasisPoints,
                timestamp: timestampSeconds,
                opportunityName,
                nonce: finalNonce,
            };
            const signature = yield this.signAPRData(aprData);
            return {
                signature,
                signer: this.getSignerAddress(),
                nonce: finalNonce,
                aprBasisPoints,
            };
        });
    }
    /**
     * Verify an APR signature (for testing purposes)
     * @param aprData - APR data
     * @param signature - Signature to verify
     * @returns true if signature is valid
     */
    verifySignature(aprData, signature) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const types = {
                    APRData: [
                        { name: "tokenSymbol", type: "string" },
                        { name: "tokenAddress", type: "address" },
                        { name: "chainId", type: "uint256" },
                        { name: "aprBasisPoints", type: "uint256" },
                        { name: "timestamp", type: "uint256" },
                        { name: "opportunityName", type: "string" },
                        { name: "nonce", type: "uint256" },
                    ],
                };
                const recoveredAddress = ethers_1.ethers.verifyTypedData(this.domain, types, {
                    tokenSymbol: aprData.tokenSymbol,
                    tokenAddress: aprData.tokenAddress,
                    chainId: aprData.chainId,
                    aprBasisPoints: aprData.aprBasisPoints,
                    timestamp: aprData.timestamp,
                    opportunityName: aprData.opportunityName,
                    nonce: aprData.nonce,
                }, signature);
                return (recoveredAddress.toLowerCase() === this.signer.address.toLowerCase());
            }
            catch (error) {
                console.error("Error verifying signature:", error);
                return false;
            }
        });
    }
}
exports.APRSigningService = APRSigningService;
//# sourceMappingURL=APRSigningService.js.map