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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDuePlans = getDuePlans;
exports.getAutomatedSavingsDetails = getAutomatedSavingsDetails;
exports.executeBatch = executeBatch;
const ethers_1 = require("ethers");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const CoinsafeABI_json_1 = __importDefault(require("../abi/CoinsafeABI.json"));
const provider = new ethers_1.ethers.JsonRpcProvider(process.env.LISK_RPC_URL);
const signer = new ethers_1.ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contractAddress = process.env.CONTRACT_ADDRESS;
const contract = new ethers_1.ethers.Contract(contractAddress, CoinsafeABI_json_1.default, signer);
function getDuePlans() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("🔍 [getDuePlans] Checking for due plans...");
        try {
            const plans = yield contract.getAutomatedSavingsDuePlans();
            console.log(`✅ [getDuePlans] Found ${plans.length} due plans`);
            if (plans.length > 0) {
                console.log("📋 [getDuePlans] Due plan addresses:", plans);
            }
            return plans;
        }
        catch (error) {
            console.error("❌ [getDuePlans] Error:", error);
            throw error;
        }
    });
}
function getAutomatedSavingsDetails(userAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`🔍 [getAutomatedSavingsDetails] Getting details for user: ${userAddress}`);
        try {
            const details = yield contract.getAutomatedSafeForUser(userAddress);
            console.log(`✅ [getAutomatedSavingsDetails] Retrieved details for user: ${userAddress}`);
            return details;
        }
        catch (error) {
            console.error(`❌ [getAutomatedSavingsDetails] Error for user ${userAddress}:`, error);
            throw error;
        }
    });
}
function executeBatch(startIndex, count) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("🚀 [executeBatch] Starting batch execution...");
        console.log(`📊 [executeBatch] Parameters: startIndex=${startIndex}, count=${count}`);
        // Check signer balance
        try {
            const signerBalance = yield provider.getBalance(signer.address);
            console.log(`💰 [executeBatch] Signer balance: ${ethers_1.ethers.formatEther(signerBalance)} ETH`);
            if (signerBalance === BigInt(0)) {
                console.error("❌ [executeBatch] Signer has no ETH for gas fees!");
                throw new Error("Insufficient ETH for gas fees");
            }
        }
        catch (error) {
            console.error("❌ [executeBatch] Error checking signer balance:", error);
        }
        // Check contract balance
        try {
            const contractBalance = yield provider.getBalance(contractAddress);
            console.log(`🏦 [executeBatch] Contract balance: ${ethers_1.ethers.formatEther(contractBalance)} ETH`);
        }
        catch (error) {
            console.error("❌ [executeBatch] Error checking contract balance:", error);
        }
        try {
            console.log("🔗 [executeBatch] About to call getAndExecuteAutomatedSavingsPlansDue...");
            // Check signer balance again before transaction
            const signerBalance = yield provider.getBalance(signer.address);
            console.log(`💰 [executeBatch] Signer balance: ${ethers_1.ethers.formatEther(signerBalance)} ETH`);
            // Call the contract function with the correct parameters
            const tx = yield contract.getAndExecuteAutomatedSavingsPlansDue(startIndex, count);
            console.log(`🔗 [executeBatch] Transaction sent: ${tx.hash}`);
            // Wait for transaction to be mined
            console.log("⏳ [executeBatch] Waiting for transaction to be mined...");
            const receipt = yield tx.wait();
            console.log(`✅ [executeBatch] Transaction mined in block ${receipt === null || receipt === void 0 ? void 0 : receipt.blockNumber}`);
            // Look for the BatchAutomatedSavingsExecuted event
            let eventFound = false;
            if (receipt === null || receipt === void 0 ? void 0 : receipt.logs) {
                for (const log of receipt.logs) {
                    try {
                        const parsedLog = contract.interface.parseLog(log);
                        if ((parsedLog === null || parsedLog === void 0 ? void 0 : parsedLog.name) === "BatchAutomatedSavingsExecuted") {
                            console.log("📊 [executeBatch] BatchAutomatedSavingsExecuted event found:");
                            console.log(`   Executed count: ${parsedLog.args.executedCount}`);
                            console.log(`   Skipped count: ${parsedLog.args.skippedCount}`);
                            eventFound = true;
                            break;
                        }
                    }
                    catch (error) {
                        // Log parsing failed, continue to next log
                    }
                }
            }
            if (!eventFound) {
                console.warn("⚠️ [executeBatch] BatchAutomatedSavingsExecuted event not found in logs");
                console.log("📋 [executeBatch] Available logs:", receipt.logs.map((log) => ({
                    address: log.address,
                    topics: log.topics,
                    data: log.data,
                })));
            }
            // Return the result from the transaction
            const result = yield tx.wait();
            console.log("✅ [executeBatch] Batch execution completed successfully");
            // The function returns arrays, so we can extract them from the transaction result
            // Note: Since the event only gives us counts, we'll return empty arrays but log the counts
            return {
                dueAddresses: [],
                skippedAddresses: [],
            };
        }
        catch (error) {
            console.error("❌ [executeBatch] Error during batch execution:", error);
            console.log("🔍 [executeBatch] Error details:", {
                message: error.message,
                stack: error.stack,
            });
            throw error;
        }
    });
}
//# sourceMappingURL=savingsService.js.map