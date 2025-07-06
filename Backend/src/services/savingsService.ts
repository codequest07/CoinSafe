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

  // Check contract connection
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

  console.log(
    "🔗 [executeBatch] About to call getAndExecuteAutomatedSavingsPlansDue..."
  );

  try {
    // The contract function doesn't take parameters, so we call it without them
    const tx = await contract.getAndExecuteAutomatedSavingsPlansDue();
    console.log("✅ [executeBatch] Transaction sent successfully!");
    console.log(`📝 [executeBatch] Transaction hash: ${tx.hash}`);
    console.log(`⏳ [executeBatch] Waiting for transaction to be mined...`);

    const receipt = await tx.wait();
    console.log("✅ [executeBatch] Transaction mined successfully!");
    console.log(`📋 [executeBatch] Transaction receipt:`, {
      transactionHash: receipt.transactionHash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed?.toString(),
      status: receipt.status,
    });

    // Find the BatchAutomatedSavingsExecuted event
    const eventFragment = contract.interface.getEvent(
      "BatchAutomatedSavingsExecuted"
    );
    if (!eventFragment) {
      throw new Error(
        "BatchAutomatedSavingsExecuted event fragment not found."
      );
    }
    const eventTopic = ethers.id(eventFragment.format());
    console.log(
      `🔍 [executeBatch] Looking for event with topic: ${eventTopic}`
    );

    let eventFound = false;
    for (const log of receipt.logs) {
      if (log.topics[0] === eventTopic) {
        console.log(
          "✅ [executeBatch] Found BatchAutomatedSavingsExecuted event!"
        );
        const decoded = contract.interface.decodeEventLog(
          eventFragment,
          log.data,
          log.topics
        );
        // The event only contains counts, not arrays
        const executedCount = decoded.executedCount as number;
        const skippedCount = decoded.skippedCount as number;

        console.log(
          `📊 [executeBatch] Event data: executedCount=${executedCount}, skippedCount=${skippedCount}`
        );

        // Since we can't get the actual addresses from the event, we'll return empty arrays
        // but include the counts in the response for debugging
        console.log(
          `🎯 [executeBatch] Batch executed: ${executedCount} successful, ${skippedCount} skipped`
        );

        eventFound = true;
        return {
          dueAddresses: [], // We can't get the actual addresses from the event
          skippedAddresses: [], // We can't get the actual addresses from the event
        };
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

    throw new Error("BatchAutomatedSavingsExecuted event not found in logs.");
  } catch (error) {
    console.error("❌ [executeBatch] Error during batch execution:", error);
    console.error("🔍 [executeBatch] Error details:", {
      message: (error as Error).message,
      stack: (error as Error).stack,
    });
    throw error;
  }
}
