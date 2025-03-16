import { Request, Response } from "express";
import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

const FAUCET_ADDRESS = process.env.FAUCET_ADDRESS!;
const TOKEN_ADDRESS = process.env.TOKEN_ADDRESS!;
const PRIVATE_KEY = process.env.PRIVATE_KEY!;
const RPC_URL = process.env.LISK_RPC_URL!;

const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

const tokenAbi = [
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address, uint256) returns (bool)",
];

const faucetAbi = [
  "function claim()",
  "function getNextClaimTime(address _user) view returns (uint256)",
  "function getContractBalance() view returns (uint256)",
];

const tokenContract = new ethers.Contract(TOKEN_ADDRESS, tokenAbi, wallet);
const faucetContract = new ethers.Contract(FAUCET_ADDRESS, faucetAbi, wallet);

export const claimFaucet = async (req: Request, res: Response) => {
  try {
    console.log(`🚀 Starting Claim Process...`);

    // Checking wallet balance
    const userBalance = await tokenContract.balanceOf(wallet.address);
    console.log(`💰 Wallet Balance: ${ethers.formatUnits(userBalance, 18)} SAFU`);

    // Checking faucet balance
    const faucetBalance = await tokenContract.balanceOf(FAUCET_ADDRESS);
    console.log(`🏦 Faucet Balance: ${ethers.formatUnits(faucetBalance, 18)} SAFU`);

    if (faucetBalance < ethers.parseUnits("70", 18)) {
      return res.status(400).json({ error: "Faucet does not have enough tokens. Try again later." });
    }

    // Checking if the user can claim again
    const nextClaimTime = await faucetContract.getNextClaimTime(wallet.address);
    const currentTime = Math.floor(Date.now() / 1000);
    if (currentTime < Number(nextClaimTime)) {
      return res.status(400).json({
        error: `Claim too soon. Next claim available at: ${new Date(Number(nextClaimTime) * 1000)}`,
      });
    }

    console.log(`⏳ Claiming 70 SAFU...`);
    const tx = await faucetContract.claim();
    await tx.wait();
    console.log(`✅ Claim successful! Transaction: ${tx.hash}`);

    // Checking updated balance
    const newBalance = await tokenContract.balanceOf(wallet.address);
    console.log(`💰 New Wallet Balance: ${ethers.formatUnits(newBalance, 18)} SAFU`);

    res.json({
      message: "Claim successful!",
      transactionHash: tx.hash,
      newBalance: ethers.formatUnits(newBalance, 18),
    });
  } catch (error: any) {
    console.error(`❌ Claim failed:`, error);
    res.status(500).json({
      error: "Claim failed",
      details: error.reason || error.message,
    });
  }
};
