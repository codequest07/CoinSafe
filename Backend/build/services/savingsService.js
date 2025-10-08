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
exports.resetNonceTracking = resetNonceTracking;
exports.getDuePlans = getDuePlans;
exports.getAllAutomatedSavingsUsers = getAllAutomatedSavingsUsers;
exports.getAutomatedSavingsUserDetails = getAutomatedSavingsUserDetails;
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
// Nonce management
let currentNonce = null;
let nonceLock = false;
function getCurrentNonce() {
    return __awaiter(this, void 0, void 0, function* () {
        if (nonceLock) {
            // Wait for lock to be released
            while (nonceLock) {
                yield new Promise((resolve) => setTimeout(resolve, 100));
            }
        }
        nonceLock = true;
        try {
            const nonce = yield provider.getTransactionCount(signer.address, "pending");
            console.log(`🔢 [getCurrentNonce] Current nonce: ${nonce}`);
            currentNonce = nonce;
            return nonce;
        }
        finally {
            nonceLock = false;
        }
    });
}
function incrementNonce() {
    return __awaiter(this, void 0, void 0, function* () {
        if (currentNonce !== null) {
            currentNonce++;
            console.log(`🔢 [incrementNonce] Incremented nonce to: ${currentNonce}`);
        }
    });
}
function resetNonce() {
    return __awaiter(this, void 0, void 0, function* () {
        currentNonce = null;
        console.log(`🔢 [resetNonce] Reset nonce tracking`);
    });
}
// Export function to reset nonce from batch processor
function resetNonceTracking() {
    return __awaiter(this, void 0, void 0, function* () {
        yield resetNonce();
    });
}
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
function getAllAutomatedSavingsUsers() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("🔍 [getAllAutomatedSavingsUsers] Querying all automated savings users from events...");
        try {
            // Query the AutomatedPlanCreated events to get all users who have created automated savings plans
            const filter = contract.filters.AutomatedPlanCreated();
            const events = yield contract.queryFilter(filter);
            console.log(`📊 [getAllAutomatedSavingsUsers] Found ${events.length} AutomatedPlanCreated events`);
            // Extract unique user addresses from the events
            const allUsers = new Set();
            for (const event of events) {
                if ("args" in event && event.args && event.args.user) {
                    allUsers.add(event.args.user);
                    console.log(`👤 [getAllAutomatedSavingsUsers] User from event: ${event.args.user}`);
                }
            }
            const uniqueUsers = Array.from(allUsers);
            console.log(`✅ [getAllAutomatedSavingsUsers] Retrieved ${uniqueUsers.length} unique automated savings users from events`);
            return uniqueUsers;
        }
        catch (error) {
            console.error("❌ [getAllAutomatedSavingsUsers] Error:", error);
            throw error;
        }
    });
}
function getAutomatedSavingsUserDetails(userAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`🔍 [getAutomatedSavingsUserDetails] Getting details for user: ${userAddress}`);
        try {
            const plan = yield contract.automatedSavingsPlans(userAddress);
            console.log(`✅ [getAutomatedSavingsUserDetails] Retrieved plan for user: ${userAddress}`);
            return {
                userAddress,
                token: plan.token,
                amount: plan.amount.toString(),
                frequency: plan.frequency.toString(),
                duration: plan.duration.toString(),
                startTime: plan.startTime.toString(),
                unlockTime: plan.unlockTime.toString(),
                lastSavingTimestamp: plan.lastSavingTimestamp.toString(),
                nextSavingTimestamp: plan.nextSavingTimestamp.toString(),
            };
        }
        catch (error) {
            console.error(`❌ [getAutomatedSavingsUserDetails] Error for user ${userAddress}:`, error);
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
        const maxRetries = 3;
        let retryCount = 0;
        while (retryCount < maxRetries) {
            try {
                console.log(`🔗 [executeBatch] Attempt ${retryCount + 1}/${maxRetries} - About to call getAndExecuteAutomatedSavingsPlansDue...`);
                // Get current nonce
                const nonce = yield getCurrentNonce();
                console.log(`🔢 [executeBatch] Using nonce: ${nonce}`);
                // Check signer balance again before transaction
                const signerBalance = yield provider.getBalance(signer.address);
                console.log(`💰 [executeBatch] Signer balance: ${ethers_1.ethers.formatEther(signerBalance)} ETH`);
                // Call the contract function with the correct parameters and explicit nonce
                const tx = yield contract.getAndExecuteAutomatedSavingsPlansDue(startIndex, count, {
                    nonce: nonce,
                });
                console.log(`🔗 [executeBatch] Transaction sent: ${tx.hash}`);
                // Increment nonce for next transaction
                yield incrementNonce();
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
                console.log("✅ [executeBatch] Batch execution completed successfully");
                // The function returns arrays, so we can extract them from the transaction result
                // Note: Since the event only gives us counts, we'll return empty arrays but log the counts
                return {
                    dueAddresses: [],
                    skippedAddresses: [],
                };
            }
            catch (error) {
                retryCount++;
                const errorMessage = error.message;
                console.error(`❌ [executeBatch] Error during batch execution (attempt ${retryCount}/${maxRetries}):`, error);
                console.log("🔍 [executeBatch] Error details:", {
                    message: errorMessage,
                    stack: error.stack,
                });
                // Check if it's a nonce-related error
                if (errorMessage.includes("nonce") ||
                    errorMessage.includes("NONCE_EXPIRED")) {
                    console.log("🔄 [executeBatch] Nonce error detected, resetting nonce and retrying...");
                    yield resetNonce();
                    if (retryCount < maxRetries) {
                        console.log(`⏳ [executeBatch] Waiting 2 seconds before retry...`);
                        yield new Promise((resolve) => setTimeout(resolve, 2000));
                        continue;
                    }
                }
                // If it's not a nonce error or we've exhausted retries, throw the error
                if (retryCount >= maxRetries) {
                    console.error("❌ [executeBatch] Max retries exceeded, throwing error");
                    throw error;
                }
            }
        }
        // This should never be reached, but just in case
        throw new Error("Unexpected error in executeBatch");
    });
}
//# sourceMappingURL=savingsService.js.map