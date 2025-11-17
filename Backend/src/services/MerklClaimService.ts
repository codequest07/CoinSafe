import { ethers } from "ethers";
import * as dotenv from "dotenv";
import { MerklService } from "./MerklService";
import coinsafeAbi from "../abi/CoinsafeABI.json";

dotenv.config();

export interface ClaimResult {
  success: boolean;
  txHash?: string;
  error?: string;
  claimedTokens?: string[];
  claimedAmounts?: string[];
  message?: string;
}

export class MerklClaimService {
  private provider: ethers.Provider;
  private signer: ethers.Wallet;
  private contract: ethers.Contract;
  private merklService: MerklService;
  private contractAddress: string;

  constructor() {
    const rpcUrl = process.env.LISK_RPC_URL || process.env.RPC_URL;
    if (!rpcUrl) {
      throw new Error("LISK_RPC_URL or RPC_URL must be set");
    }

    this.provider = new ethers.JsonRpcProvider(rpcUrl);

    const privateKey =
      process.env.PRIVATE_KEY ||
      process.env.RELAYER_PRIVATE_KEY ||
      process.env.APR_SIGNER_PRIVATE_KEY;
    if (!privateKey) {
      throw new Error(
        "PRIVATE_KEY, RELAYER_PRIVATE_KEY, or APR_SIGNER_PRIVATE_KEY must be set"
      );
    }

    this.signer = new ethers.Wallet(privateKey, this.provider);
    this.contractAddress = process.env.CONTRACT_ADDRESS!;

    if (!this.contractAddress) {
      throw new Error("CONTRACT_ADDRESS must be set");
    }

    this.contract = new ethers.Contract(
      this.contractAddress,
      coinsafeAbi,
      this.signer
    );

    this.merklService = new MerklService();
  }

  /**
   * Claim Merkl rewards for the contract address
   */
  async claimRewards(): Promise<ClaimResult> {
    try {
      console.log(
        `🔍 Fetching claimable rewards from Merkl for ${this.contractAddress}...`
      );

      // Fetch claimable rewards for the contract address
      // API returns: { rewards: [...], chain: {...} } or array of such objects
      // Documentation: https://docs.merkl.xyz/integrate-merkl/app#claiming-user-rewards
      const claimableData = await this.merklService.fetchClaimableRewards(
        this.contractAddress,
        1135 // Lisk chain ID
      );

      if (
        !claimableData ||
        (Array.isArray(claimableData) && claimableData.length === 0)
      ) {
        console.log("ℹ️ No claimable rewards found");
        return {
          success: true,
          message: "No claimable rewards found",
          claimedTokens: [],
          claimedAmounts: [],
        };
      }

      // Prepare data for contract call
      const users: string[] = [];
      const tokens: string[] = [];
      const amounts: bigint[] = [];
      const proofs: string[][] = [];

      // Handle response structure: can be array of chain rewards or single object
      const rewardsData = Array.isArray(claimableData)
        ? claimableData
        : [claimableData];

      // Process each chain's rewards
      for (const chainData of rewardsData) {
        // Skip if not for the correct chain
        if (chainData.chain && chainData.chain.id !== 1135) {
          continue;
        }

        // Process rewards array
        const rewards = chainData.rewards || [];

        for (const reward of rewards) {
          // Calculate claimable amount: amount - claimed
          // According to docs: claimable = amount - claimed
          const totalAmount = BigInt(reward.amount || "0");
          const claimedAmount = BigInt(reward.claimed || "0");
          const claimableAmount = totalAmount - claimedAmount;

          // Only process if there's something to claim
          if (claimableAmount > BigInt(0) && reward.token && reward.proofs) {
            users.push(this.contractAddress);
            tokens.push(reward.token.address);
            amounts.push(claimableAmount);

            // Proofs should be an array of bytes32 (Merkle proof)
            const proofArray = Array.isArray(reward.proofs)
              ? reward.proofs
              : [reward.proofs];
            proofs.push(proofArray);

            console.log(
              `📦 Found claimable reward: ${
                reward.token.symbol || reward.token.address
              } - ${claimableAmount.toString()} (Total: ${totalAmount.toString()}, Claimed: ${claimedAmount.toString()})`
            );
          }
        }
      }

      if (users.length === 0) {
        console.log("ℹ️ No valid rewards to claim after processing");
        return {
          success: true,
          message: "No valid rewards to claim",
          claimedTokens: [],
          claimedAmounts: [],
        };
      }

      console.log(`📦 Preparing to claim ${users.length} reward(s)...`);
      console.log(`   Tokens: ${tokens.join(", ")}`);
      console.log(`   Amounts: ${amounts.map((a) => a.toString()).join(", ")}`);

      // Call the smart contract
      const tx = await this.contract.claimMerklRewards(
        users,
        tokens,
        amounts,
        proofs,
        {
          gasLimit: 1000000, // Adjust based on your needs
        }
      );

      console.log(`⏳ Transaction submitted: ${tx.hash}`);
      const receipt = await tx.wait();

      console.log(
        `✅ Rewards claimed successfully! Tx: ${
          tx.hash
        }, Gas used: ${receipt.gasUsed.toString()}`
      );

      return {
        success: true,
        txHash: tx.hash,
        claimedTokens: tokens,
        claimedAmounts: amounts.map((a) => a.toString()),
        message: `Successfully claimed ${users.length} reward(s)`,
      };
    } catch (error: any) {
      console.error("❌ Error claiming Merkl rewards:", error);

      // Handle specific errors
      let errorMessage = "Unknown error";
      if (error.message) {
        errorMessage = error.message;
      } else if (error.reason) {
        errorMessage = error.reason;
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}
