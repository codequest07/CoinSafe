import { ethers } from "ethers";
import * as dotenv from "dotenv";
dotenv.config();
import coinsafeAbi from "../abi/CoinsafeABI.json";

const provider = new ethers.JsonRpcProvider(process.env.LISK_RPC_URL);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
const contractAddress = process.env.CONTRACT_ADDRESS!;
const contract = new ethers.Contract(contractAddress, coinsafeAbi, signer);

export async function getDuePlans(): Promise<string[]> {
  console.log("🔍 [getDuePlans] Checking for due plans...");
  try {
    const plans = await contract.getAutomatedSavingsDuePlans();
    console.log(`✅ [getDuePlans] Found ${plans.length} due plans`);
    if (plans.length > 0) {
      console.log("📋 [getDuePlans] Due plan addresses:", plans);
    }
    return plans;
  } catch (error) {
    console.error("❌ [getDuePlans] Error:", error);
    throw error;
  }
}

export async function executeBatch(
  startIndex: number,
  count: number
): Promise<{ dueAddresses: string[]; skippedAddresses: string[] }> {
  console.log("🚀 [executeBatch] Starting batch execution...");
  console.log(
    `📊 [executeBatch] Parameters: startIndex=${startIndex}, count=${count}`
  );

  // Check signer balance
  try {
    const signerBalance = await provider.getBalance(signer.address);
    console.log(
      `💰 [executeBatch] Signer balance: ${ethers.formatEther(
        signerBalance
      )} ETH`
    );

    if (signerBalance === BigInt(0)) {
      console.error("❌ [executeBatch] Signer has no ETH for gas fees!");
      throw new Error("Insufficient ETH for gas fees");
    }
  } catch (error) {
    console.error("❌ [executeBatch] Error checking signer balance:", error);
  }

  // Check contract balance
  try {
    const contractBalance = await provider.getBalance(contractAddress);
    console.log(
      `🏦 [executeBatch] Contract balance: ${ethers.formatEther(
        contractBalance
      )} ETH`
    );
  } catch (error) {
    console.error("❌ [executeBatch] Error checking contract balance:", error);
  }

  try {
    console.log(
      "🔗 [executeBatch] About to call getAndExecuteAutomatedSavingsPlansDue..."
    );

    // Check signer balance again before transaction
    const signerBalance = await provider.getBalance(signer.address);
    console.log(
      `💰 [executeBatch] Signer balance: ${ethers.formatEther(
        signerBalance
      )} ETH`
    );

    // Call the contract function with the correct parameters
    const tx = await contract.getAndExecuteAutomatedSavingsPlansDue(
      startIndex,
      count
    );
    console.log(`🔗 [executeBatch] Transaction sent: ${tx.hash}`);

    // Wait for transaction to be mined
    console.log("⏳ [executeBatch] Waiting for transaction to be mined...");
    const receipt = await tx.wait();
    console.log(
      `✅ [executeBatch] Transaction mined in block ${receipt?.blockNumber}`
    );

    // Look for the BatchAutomatedSavingsExecuted event
    let eventFound = false;
    if (receipt?.logs) {
      for (const log of receipt.logs) {
        try {
          const parsedLog = contract.interface.parseLog(log);
          if (parsedLog?.name === "BatchAutomatedSavingsExecuted") {
            console.log(
              "📊 [executeBatch] BatchAutomatedSavingsExecuted event found:"
            );
            console.log(`   Executed count: ${parsedLog.args.executedCount}`);
            console.log(`   Skipped count: ${parsedLog.args.skippedCount}`);
            eventFound = true;
            break;
          }
        } catch (error) {
          // Log parsing failed, continue to next log
        }
      }
    }

    if (!eventFound) {
      console.warn(
        "⚠️ [executeBatch] BatchAutomatedSavingsExecuted event not found in logs"
      );
      console.log(
        "📋 [executeBatch] Available logs:",
        receipt.logs.map((log: any) => ({
          address: log.address,
          topics: log.topics,
          data: log.data,
        }))
      );
    }

    // Return the result from the transaction
    const result = await tx.wait();
    console.log("✅ [executeBatch] Batch execution completed successfully");

    // The function returns arrays, so we can extract them from the transaction result
    // Note: Since the event only gives us counts, we'll return empty arrays but log the counts
    return {
      dueAddresses: [],
      skippedAddresses: [],
    };
  } catch (error) {
    console.error("❌ [executeBatch] Error during batch execution:", error);
    console.log("🔍 [executeBatch] Error details:", {
      message: (error as Error).message,
      stack: (error as Error).stack,
    });
    throw error;
  }
}
