import { ethers } from "ethers";
import * as dotenv from "dotenv";
dotenv.config();
import coinsafeAbi from "../abi/CoinsafeABI.json";

const provider = new ethers.JsonRpcProvider(process.env.LISK_RPC_URL);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
const contractAddress = process.env.CONTRACT_ADDRESS!;
const contract = new ethers.Contract(contractAddress, coinsafeAbi, signer);

// Nonce management
let currentNonce: number | null = null;
let nonceLock = false;

async function getCurrentNonce(): Promise<number> {
  if (nonceLock) {
    // Wait for lock to be released
    while (nonceLock) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  nonceLock = true;
  try {
    const nonce = await provider.getTransactionCount(signer.address, "pending");
    console.log(`🔢 [getCurrentNonce] Current nonce: ${nonce}`);
    currentNonce = nonce;
    return nonce;
  } finally {
    nonceLock = false;
  }
}

async function incrementNonce(): Promise<void> {
  if (currentNonce !== null) {
    currentNonce++;
    console.log(`🔢 [incrementNonce] Incremented nonce to: ${currentNonce}`);
  }
}

async function resetNonce(): Promise<void> {
  currentNonce = null;
  console.log(`🔢 [resetNonce] Reset nonce tracking`);
}

// Export function to reset nonce from batch processor
export async function resetNonceTracking(): Promise<void> {
  await resetNonce();
}

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

export async function getAllAutomatedSavingsUsers(): Promise<string[]> {
  console.log(
    "🔍 [getAllAutomatedSavingsUsers] Querying all automated savings users from events..."
  );
  try {
    // Query the AutomatedPlanCreated events to get all users who have created automated savings plans
    const filter = contract.filters.AutomatedPlanCreated();
    const events = await contract.queryFilter(filter);

    console.log(
      `📊 [getAllAutomatedSavingsUsers] Found ${events.length} AutomatedPlanCreated events`
    );

    // Extract unique user addresses from the events
    const allUsers = new Set<string>();

    for (const event of events) {
      if ("args" in event && event.args && event.args.user) {
        allUsers.add(event.args.user);
        console.log(
          `👤 [getAllAutomatedSavingsUsers] User from event: ${event.args.user}`
        );
      }
    }

    const uniqueUsers = Array.from(allUsers);
    console.log(
      `✅ [getAllAutomatedSavingsUsers] Retrieved ${uniqueUsers.length} unique automated savings users from events`
    );

    return uniqueUsers;
  } catch (error) {
    console.error("❌ [getAllAutomatedSavingsUsers] Error:", error);
    throw error;
  }
}

export async function getAutomatedSavingsUserDetails(
  userAddress: string
): Promise<any> {
  console.log(
    `🔍 [getAutomatedSavingsUserDetails] Getting details for user: ${userAddress}`
  );
  try {
    const plan = await contract.automatedSavingsPlans(userAddress);
    console.log(
      `✅ [getAutomatedSavingsUserDetails] Retrieved plan for user: ${userAddress}`
    );

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
  } catch (error) {
    console.error(
      `❌ [getAutomatedSavingsUserDetails] Error for user ${userAddress}:`,
      error
    );
    throw error;
  }
}

export async function getAutomatedSavingsDetails(
  userAddress: string
): Promise<any> {
  console.log(
    `🔍 [getAutomatedSavingsDetails] Getting details for user: ${userAddress}`
  );
  try {
    const details = await contract.getAutomatedSafeForUser(userAddress);
    console.log(
      `✅ [getAutomatedSavingsDetails] Retrieved details for user: ${userAddress}`
    );
    return details;
  } catch (error) {
    console.error(
      `❌ [getAutomatedSavingsDetails] Error for user ${userAddress}:`,
      error
    );
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

  const maxRetries = 3;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      console.log(
        `🔗 [executeBatch] Attempt ${
          retryCount + 1
        }/${maxRetries} - About to call getAndExecuteAutomatedSavingsPlansDue...`
      );

      // Get current nonce
      const nonce = await getCurrentNonce();
      console.log(`🔢 [executeBatch] Using nonce: ${nonce}`);

      // Check signer balance again before transaction
      const signerBalance = await provider.getBalance(signer.address);
      console.log(
        `💰 [executeBatch] Signer balance: ${ethers.formatEther(
          signerBalance
        )} ETH`
      );

      // Call the contract function with the correct parameters and explicit nonce
      const tx = await contract.getAndExecuteAutomatedSavingsPlansDue(
        startIndex,
        count,
        {
          nonce: nonce,
        }
      );
      console.log(`🔗 [executeBatch] Transaction sent: ${tx.hash}`);

      // Increment nonce for next transaction
      await incrementNonce();

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

      console.log("✅ [executeBatch] Batch execution completed successfully");

      // The function returns arrays, so we can extract them from the transaction result
      // Note: Since the event only gives us counts, we'll return empty arrays but log the counts
      return {
        dueAddresses: [],
        skippedAddresses: [],
      };
    } catch (error) {
      retryCount++;
      const errorMessage = (error as Error).message;

      console.error(
        `❌ [executeBatch] Error during batch execution (attempt ${retryCount}/${maxRetries}):`,
        error
      );
      console.log("🔍 [executeBatch] Error details:", {
        message: errorMessage,
        stack: (error as Error).stack,
      });

      // Check if it's a nonce-related error
      if (
        errorMessage.includes("nonce") ||
        errorMessage.includes("NONCE_EXPIRED")
      ) {
        console.log(
          "🔄 [executeBatch] Nonce error detected, resetting nonce and retrying..."
        );
        await resetNonce();

        if (retryCount < maxRetries) {
          console.log(`⏳ [executeBatch] Waiting 2 seconds before retry...`);
          await new Promise((resolve) => setTimeout(resolve, 2000));
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
}
