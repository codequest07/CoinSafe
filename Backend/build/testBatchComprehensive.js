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
const savingsService_1 = require("./services/savingsService");
const ethers_1 = require("ethers");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const provider = new ethers_1.ethers.JsonRpcProvider(process.env.LISK_RPC_URL);
const signer = new ethers_1.ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contractAddress = process.env.CONTRACT_ADDRESS;
function testContractConnection() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("🔗 Testing contract connection...");
        try {
            const balance = yield provider.getBalance(contractAddress);
            console.log("✅ Contract balance:", ethers_1.ethers.formatEther(balance), "ETH");
            const signerBalance = yield provider.getBalance(signer.address);
            console.log("✅ Signer balance:", ethers_1.ethers.formatEther(signerBalance), "ETH");
            return true;
        }
        catch (error) {
            console.error("❌ Contract connection failed:", error);
            return false;
        }
    });
}
function testGetDuePlans() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("\n📋 Testing getDuePlans()...");
        try {
            const plans = yield (0, savingsService_1.getDuePlans)();
            console.log("✅ Due plans found:", plans.length);
            if (plans.length > 0) {
                console.log("   Sample addresses:", plans.slice(0, 3));
            }
            return plans;
        }
        catch (error) {
            console.error("❌ getDuePlans() failed:", error);
            return [];
        }
    });
}
function testBatchExecution(plans) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("\n🚀 Testing batch execution...");
        if (plans.length === 0) {
            console.log("⚠️ No plans to execute - skipping batch test");
            return;
        }
        try {
            const batchSize = Math.min(plans.length, 5); // Test with smaller batch
            console.log(`   Testing with batch size: ${batchSize}`);
            const result = yield (0, savingsService_1.executeBatch)(0, batchSize);
            console.log("✅ Batch execution successful:");
            console.log("   Note: The contract event only provides execution counts, not specific addresses");
            console.log("   Successful executions: (see console log above for count)");
            console.log("   Skipped executions: (see console log above for count)");
            // The result arrays will be empty since the event doesn't provide addresses
            if (result.dueAddresses.length > 0) {
                console.log("   Successful addresses:", result.dueAddresses);
            }
            if (result.skippedAddresses.length > 0) {
                console.log("   Skipped addresses:", result.skippedAddresses);
            }
        }
        catch (error) {
            console.error("❌ Batch execution failed:", error);
        }
    });
}
function testEnvironmentVariables() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("\n🔧 Testing environment variables...");
        const required = ["LISK_RPC_URL", "PRIVATE_KEY", "CONTRACT_ADDRESS"];
        for (const varName of required) {
            const value = process.env[varName];
            if (value) {
                console.log(`✅ ${varName}: ${varName === "PRIVATE_KEY" ? "***" + value.slice(-4) : value}`);
            }
            else {
                console.log(`❌ ${varName}: NOT SET`);
            }
        }
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("🧪 Starting comprehensive savings service test...\n");
        // Test environment variables
        yield testEnvironmentVariables();
        // Test contract connection
        const connectionOk = yield testContractConnection();
        if (!connectionOk) {
            console.log("\n❌ Cannot proceed without contract connection");
            return;
        }
        // Test getting due plans
        const plans = yield testGetDuePlans();
        // Test batch execution (if there are plans)
        yield testBatchExecution(plans);
        console.log("\n✅ Comprehensive test completed!");
    });
}
main().catch(console.error);
//# sourceMappingURL=testBatchComprehensive.js.map