import { ethers } from "ethers";
import * as dotenv from "dotenv";
dotenv.config();
import coinsafeAbi from "../abi/CoinsafeABI.json";

const provider = new ethers.JsonRpcProvider(process.env.LISK_RPC_URL);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
const contractAddress = process.env.CONTRACT_ADDRESS!;
const contract = new ethers.Contract(contractAddress, coinsafeAbi, signer);

export async function getDuePlans(): Promise<string[]> {
  return await contract.getAutomatedSavingsDuePlans();
}

export async function executeBatch(
  startIndex: number,
  count: number
): Promise<{ dueAddresses: string[]; skippedAddresses: string[] }> {
  // The contract function doesn't take parameters, so we call it without them
  const tx = await contract.getAndExecuteAutomatedSavingsPlansDue();
  const receipt = await tx.wait();

  // Find the BatchAutomatedSavingsExecuted event
  const eventFragment = contract.interface.getEvent(
    "BatchAutomatedSavingsExecuted"
  );
  if (!eventFragment) {
    throw new Error("BatchAutomatedSavingsExecuted event fragment not found.");
  }
  const eventTopic = ethers.id(eventFragment.format());

  for (const log of receipt.logs) {
    if (log.topics[0] === eventTopic) {
      const decoded = contract.interface.decodeEventLog(
        eventFragment,
        log.data,
        log.topics
      );
      // The event only contains counts, not arrays
      const executedCount = decoded.executedCount as number;
      const skippedCount = decoded.skippedCount as number;

      // Since we can't get the actual addresses from the event, we'll return empty arrays
      // but include the counts in the response for debugging
      console.log(
        `Batch executed: ${executedCount} successful, ${skippedCount} skipped`
      );

      return {
        dueAddresses: [], // We can't get the actual addresses from the event
        skippedAddresses: [], // We can't get the actual addresses from the event
      };
    }
  }

  throw new Error("BatchAutomatedSavingsExecuted event not found in logs.");
}
