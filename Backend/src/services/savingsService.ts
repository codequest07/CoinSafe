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
  const tx = await contract.getAndExecuteAutomatedSavingsPlansDue(
    startIndex,
    count
  );
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
      const dueAddresses = decoded.dueAddresses as string[];
      const skippedAddresses = decoded.skippedAddresses as string[];
      return { dueAddresses, skippedAddresses };
    }
  }

  throw new Error("BatchAutomatedSavingsExecuted event not found in logs.");
}
