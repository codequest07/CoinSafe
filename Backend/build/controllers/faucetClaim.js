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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.claimStatus = exports.claimFaucet = void 0;
const ethers_1 = require("ethers");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Validate environment variables
const requiredEnvVars = [
    "FAUCET_ADDRESS",
    "SAFU_TOKEN_ADDRESS",
    "RELAYER_PRIVATE_KEY",
    "LISK_RPC_URL",
];
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        throw new Error(`Missing required environment variable: ${envVar}`);
    }
}
// Initialize provider and wallet
const provider = new ethers_1.ethers.JsonRpcProvider(process.env.LISK_RPC_URL);
const relayerWallet = new ethers_1.ethers.Wallet(process.env.RELAYER_PRIVATE_KEY, provider);
// Contract ABIs
const FAUCET_ABI = [
    "function drip(address) external", // Change from claim to drip
    "function getNextClaimTime(address) view returns (uint256)",
    "function getContractBalances() view returns (uint256,uint256,uint256)",
    "error ClaimTooSoon(uint256 timeRemaining)",
    "error InsufficientFaucetBalance(uint256 faucetBalance, uint256 requestedAmount)",
    "error ZeroAddress()", // Added this error from your contract
];
const TOKEN_ABI = [
    "function balanceOf(address) view returns (uint256)",
    "function transfer(address, uint256) returns (bool)",
];
// Initialize contracts
const faucetContract = new ethers_1.ethers.Contract(process.env.FAUCET_ADDRESS, FAUCET_ABI, relayerWallet);
const safuToken = new ethers_1.ethers.Contract(process.env.SAFU_TOKEN_ADDRESS, TOKEN_ABI, relayerWallet);
const claimFaucet = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Debug incoming request
    console.log("Incoming request headers:", req.headers);
    console.log("Raw request body:", req.body);
    // Validate content type
    if (!req.is("application/json")) {
        console.error("Invalid content type received");
        return res.status(400).json({
            success: false,
            error: "Invalid content type",
            details: "Expected application/json",
        });
    }
    // Validate and clean address
    let { userAddress } = req.body;
    if (!userAddress) {
        console.error("No address provided in request");
        return res.status(400).json({
            success: false,
            error: "Missing address",
            details: "userAddress is required in request body",
        });
    }
    // Clean and validate address
    try {
        userAddress = userAddress.trim();
        userAddress = ethers_1.ethers.getAddress(userAddress); // This validates and converts to checksum
        console.log("Validated address:", userAddress);
    }
    catch (error) {
        console.error("Address validation failed:", error);
        return res.status(400).json({
            success: false,
            error: "Invalid Ethereum address",
            details: `The provided address is invalid: ${userAddress}`,
            debug: {
                original: req.body.userAddress,
                cleaned: userAddress,
                validationError: error instanceof Error ? error.message : String(error),
            },
        });
    }
    try {
        // Check eligibility
        const nextClaimTime = yield faucetContract.getNextClaimTime(userAddress);
        const currentTime = Math.floor(Date.now() / 1000);
        console.log("Claim status check:", {
            userAddress,
            currentTime,
            nextClaimTime: Number(nextClaimTime),
            canClaim: currentTime >= Number(nextClaimTime),
        });
        if (currentTime < Number(nextClaimTime)) {
            return res.status(400).json({
                success: false,
                error: "Claim too soon",
                nextClaimTime: new Date(Number(nextClaimTime) * 1000).toISOString(),
                details: `Next claim available in ${Number(nextClaimTime) - currentTime} seconds`,
            });
        }
        // Check balances
        const [safuBal, lskBal, usdBal] = yield faucetContract.getContractBalances();
        const balances = {
            safu: ethers_1.ethers.formatUnits(safuBal, 18),
            lsk: ethers_1.ethers.formatUnits(lskBal, 18),
            usd: ethers_1.ethers.formatUnits(usdBal, 18),
        };
        console.log("Contract balances:", balances);
        // Execute claim
        const tx = yield faucetContract.drip(userAddress, {
            gasLimit: 300000, // Adjusted for multi-token transfer
        });
        console.log("Transaction submitted:", tx.hash);
        const receipt = yield tx.wait();
        res.json({
            success: true,
            txHash: tx.hash,
            balances,
            details: `Gas used: ${receipt.gasUsed.toString()}`,
        });
    }
    catch (error) {
        console.error("Claim processing failed:", error);
        // Enhanced error handling
        let errorMessage = "Transaction failed";
        let details = "Unknown error";
        let errorData = null;
        if (typeof error === "object" && error !== null) {
            const ethersError = error;
            if (ethersError.data) {
                errorData = ethersError.data;
                errorMessage = decodeFaucetError(ethersError.data);
            }
            else if (ethersError.reason) {
                errorMessage = ethersError.reason;
            }
            details = error instanceof Error ? error.message : JSON.stringify(error);
        }
        res.status(500).json(Object.assign({ success: false, error: errorMessage, details }, (errorData && { errorData })));
    }
});
exports.claimFaucet = claimFaucet;
// Helper function to decode contract errors
function decodeFaucetError(errorData) {
    const errorMap = {
        "0x854f3dd0": "ClaimTooSoon",
        "0x9d0a9a63": "InsufficientFunds",
        "0x5a9e84f8": "ZeroAddress",
    };
    try {
        const errorSig = errorData.slice(0, 10);
        return errorMap[errorSig] || "Unknown contract error";
    }
    catch (_a) {
        return "Undecodable error data";
    }
}
const claimStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userAddress } = req.query;
    // Validate query parameter
    if (!userAddress || typeof userAddress !== "string") {
        return res.status(400).json({
            error: "Invalid request",
            details: "userAddress query parameter is required",
        });
    }
    // Clean and validate address
    try {
        const cleanedAddress = ethers_1.ethers.getAddress(userAddress.trim());
        const [nextClaimTime, [safuBal, lskBal, usdBal]] = yield Promise.all([
            faucetContract.getNextClaimTime(cleanedAddress),
            faucetContract.getContractBalances(),
        ]);
        const currentTime = Math.floor(Date.now() / 1000);
        const isEligible = currentTime >= Number(nextClaimTime);
        res.json({
            eligible: isEligible,
            nextClaimTime: new Date(Number(nextClaimTime) * 1000).toISOString(),
            currentTime: new Date(currentTime * 1000).toISOString(),
            balances: {
                safu: ethers_1.ethers.formatUnits(safuBal, 18),
                lsk: ethers_1.ethers.formatUnits(lskBal, 18),
                usd: ethers_1.ethers.formatUnits(usdBal, 18),
            },
            timeRemaining: isEligible ? 0 : Number(nextClaimTime) - currentTime,
        });
    }
    catch (error) {
        console.error("Status check failed:", error);
        if (error instanceof Error && error.message.includes("invalid address")) {
            return res.status(400).json({
                error: "Invalid address",
                details: "The provided address is not valid",
            });
        }
        res.status(500).json({
            error: "Server error",
            details: "Failed to fetch claim status",
        });
    }
});
exports.claimStatus = claimStatus;
//# sourceMappingURL=faucetClaim.js.map