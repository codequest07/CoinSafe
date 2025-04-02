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
exports.claimFaucet = void 0;
const ethers_1 = require("ethers");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const FAUCET_ADDRESS = process.env.FAUCET_ADDRESS;
const TOKEN_ADDRESS = process.env.TOKEN_ADDRESS;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const RPC_URL = process.env.LISK_RPC_URL;
const provider = new ethers_1.ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers_1.ethers.Wallet(PRIVATE_KEY, provider);
const tokenAbi = [
    "function balanceOf(address) view returns (uint256)",
    "function transfer(address, uint256) returns (bool)",
];
const faucetAbi = [
    "function claim()",
    "function getNextClaimTime(address _user) view returns (uint256)",
    "function getContractBalance() view returns (uint256)",
];
const tokenContract = new ethers_1.ethers.Contract(TOKEN_ADDRESS, tokenAbi, wallet);
const faucetContract = new ethers_1.ethers.Contract(FAUCET_ADDRESS, faucetAbi, wallet);
const claimFaucet = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(`🚀 Starting Claim Process...`);
        // ✅ Step 1: Check Wallet Balance
        console.time("Checking Wallet Balance");
        const userBalance = yield tokenContract.balanceOf(wallet.address);
        console.timeEnd("Checking Wallet Balance");
        console.log(`💰 Wallet Balance: ${ethers_1.ethers.formatUnits(userBalance, 18)} SAFU`);
        // ✅ Step 2: Check Faucet Balance
        console.time("Checking Faucet Balance");
        const faucetBalance = yield tokenContract.balanceOf(FAUCET_ADDRESS);
        console.timeEnd("Checking Faucet Balance");
        console.log(`🏦 Faucet Balance: ${ethers_1.ethers.formatUnits(faucetBalance, 18)} SAFU`);
        if (faucetBalance < ethers_1.ethers.parseUnits("70", 18)) {
            return res.status(400).json({
                error: "Faucet does not have enough tokens. Try again later.",
            });
        }
        // ✅ Step 3: Check Next Claim Time
        console.time("Checking Next Claim Time");
        const nextClaimTime = yield faucetContract.getNextClaimTime(wallet.address);
        console.timeEnd("Checking Next Claim Time");
        const currentTime = Math.floor(Date.now() / 1000);
        if (currentTime < Number(nextClaimTime)) {
            return res.status(400).json({
                error: `Claim too soon. Next claim available at: ${new Date(Number(nextClaimTime) * 1000)}`,
            });
        }
        // ✅ Step 4: Send Claim Transaction
        console.log(`⏳ Claiming 70 SAFU...`);
        console.time("Sending Claim Transaction");
        const tx = yield faucetContract.claim();
        console.timeEnd("Sending Claim Transaction");
        // ✅ Step 5: Wait for Transaction Confirmation
        console.time("Waiting for Transaction Confirmation");
        yield tx.wait(1); // Reduced confirmation time
        console.timeEnd("Waiting for Transaction Confirmation");
        console.log(`✅ Claim successful! Transaction: ${tx.hash}`);
        // ✅ Step 6: Check Updated Wallet Balance
        console.time("Checking New Wallet Balance");
        const newBalance = yield tokenContract.balanceOf(wallet.address);
        console.timeEnd("Checking New Wallet Balance");
        console.log(`💰 New Wallet Balance: ${ethers_1.ethers.formatUnits(newBalance, 18)} SAFU`);
        res.json({
            message: "Claim successful!",
            transactionHash: tx.hash,
            newBalance: ethers_1.ethers.formatUnits(newBalance, 18),
        });
    }
    catch (error) {
        console.error(`❌ Claim failed:`, error);
        res.status(500).json({
            error: "Claim failed",
            details: error.reason || error.message,
        });
    }
});
exports.claimFaucet = claimFaucet;
//# sourceMappingURL=faucetClaim.js.map