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
  private merklService: MerklService;
  private contractAddresses: string[];

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

    // Use Merkl-specific environment variable (with fallback to CONTRACT_ADDRESS for backward compatibility)
    const merklContractAddressesEnv =
      process.env.MERKL_CONTRACT_ADDRESSES ||
      process.env.MERKL_CONTRACT_ADDRESS ||
      process.env.CONTRACT_ADDRESS; // Fallback for backward compatibility

    if (!merklContractAddressesEnv) {
      throw new Error(
        "MERKL_CONTRACT_ADDRESSES, MERKL_CONTRACT_ADDRESS, or CONTRACT_ADDRESS must be set"
      );
    }

    // Parse comma-separated addresses or use single address
    this.contractAddresses = merklContractAddressesEnv
      .split(",")
      .map((addr) => addr.trim())
      .filter((addr) => addr.length > 0);

    this.merklService = new MerklService();
  }

  /**
   * Verify a Merkle proof locally using the provided root
   * This matches OpenZeppelin's MerkleProof.verify() logic
   * @param leaf - The Merkle leaf (hash of the data)
   * @param proof - Array of proof elements (sibling hashes)
   * @param root - The Merkle root to verify against
   * @returns true if the proof is valid
   */
  private verifyMerkleProof(
    leaf: string,
    proof: string[],
    root: string
  ): boolean {
    try {
      // Normalize to ensure proper hex format
      let computedHash = ethers.getBytes(leaf);

      for (const proofElement of proof) {
        const proofBytes = ethers.getBytes(proofElement);

        // Compare bytes32 values to determine order (left vs right)
        // If computedHash <= proofElement, hash(computedHash, proofElement)
        // Otherwise, hash(proofElement, computedHash)
        const computedBigInt = BigInt(ethers.hexlify(computedHash));
        const proofBigInt = BigInt(ethers.hexlify(proofBytes));

        if (computedBigInt <= proofBigInt) {
          // Left leaf, right proof
          computedHash = ethers.getBytes(
            ethers.keccak256(ethers.concat([computedHash, proofBytes]))
          );
        } else {
          // Right leaf, left proof
          computedHash = ethers.getBytes(
            ethers.keccak256(ethers.concat([proofBytes, computedHash]))
          );
        }
      }

      const finalHash = ethers.hexlify(computedHash).toLowerCase();
      const rootNormalized = root.toLowerCase();

      return finalHash === rootNormalized;
    } catch (error) {
      console.error("Error verifying Merkle proof:", error);
      return false;
    }
  }

  /**
   * Query the Merkle root from the Merkl distributor contract
   * @param distributorAddress - The distributor contract address
   * @returns The Merkle root bytes32 value, or null if query fails
   */
  private async getDistributorMerkleRoot(
    distributorAddress: string
  ): Promise<string | null> {
    try {
      // Most Merkle distributor contracts have a merkleRoot() view function
      // Try to call it using a minimal ABI
      const minimalAbi = [
        "function merkleRoot() external view returns (bytes32)",
      ];
      const distributorContract = new ethers.Contract(
        distributorAddress,
        minimalAbi,
        this.provider
      );
      const root = await distributorContract.merkleRoot();
      return root;
    } catch (error) {
      console.warn(
        `⚠️ Could not query Merkle root from distributor ${distributorAddress}:`,
        error
      );
      return null;
    }
  }

  /**
   * Decode error selector to get the actual error name
   * @param errorData - The error data from the transaction (includes selector)
   * @returns The decoded error name or the original error data if decoding fails
   */
  private decodeErrorSelector(errorData: string): string {
    try {
      if (
        !errorData ||
        typeof errorData !== "string" ||
        !errorData.startsWith("0x")
      ) {
        return errorData;
      }

      // Error selectors are the first 4 bytes (10 hex chars including 0x)
      const errorSelector = errorData.substring(0, 10).toLowerCase();

      // Get all errors from the ABI
      const errors = coinsafeAbi.filter((item: any) => item.type === "error");

      // Calculate selector for each error and match
      for (const error of errors) {
        // Build error signature: ErrorName(param1Type,param2Type,...)
        const paramTypes =
          error.inputs?.map((i: any) => i.type).join(",") || "";
        const errorSignature = `${error.name}(${paramTypes})`;

        // Calculate keccak256 hash and take first 4 bytes
        const calculatedSelector = ethers
          .id(errorSignature)
          .substring(0, 10)
          .toLowerCase();

        if (calculatedSelector === errorSelector) {
          // If error has parameters, try to decode them
          if (
            error.inputs &&
            error.inputs.length > 0 &&
            errorData.length > 10
          ) {
            try {
              const iface = new ethers.Interface(coinsafeAbi);
              const decoded = iface.decodeErrorResult(error.name, errorData);
              return `${error.name}(${decoded.join(", ")})`;
            } catch (decodeErr) {
              // If decoding params fails, just return the error name
              return error.name;
            }
          }
          return error.name;
        }
      }

      return `Unknown error (${errorSelector})`;
    } catch (err) {
      console.error("Error decoding error selector:", err);
      return errorData;
    }
  }

  /**
   * Claim Merkl rewards for a specific contract address
   * Note: This uses a Diamond pattern - the contractAddress should be the Diamond proxy address.
   * The Diamond will route the function call to the correct facet (OwnerControlFacet).
   */
  async claimRewardsForContract(contractAddress: string): Promise<ClaimResult> {
    try {
      console.log(
        `🔍 Fetching claimable rewards from Merkl for Diamond: ${contractAddress}...`
      );

      // Fetch claimable rewards for the contract address
      // API returns: { rewards: [...], chain: {...} } or array of such objects
      // Documentation: https://docs.merkl.xyz/integrate-merkl/app#claiming-user-rewards
      const claimableData = await this.merklService.fetchClaimableRewards(
        contractAddress,
        1135 // Lisk chain ID
      );

      if (
        !claimableData ||
        (Array.isArray(claimableData) && claimableData.length === 0)
      ) {
        console.log(`ℹ️ No claimable rewards found for ${contractAddress}`);
        return {
          success: true,
          message: `No claimable rewards found for ${contractAddress}`,
          claimedTokens: [],
          claimedAmounts: [],
        };
      }

      // Prepare data for contract call
      const users: string[] = [];
      const tokens: string[] = [];
      const amounts: bigint[] = [];
      const proofs: string[][] = [];
      let merklApiRoot: string | null = null; // Store Merkle root from API

      // Log the FULL raw response structure for debugging
      console.log(
        `📋 Full Merkl API response structure:`,
        JSON.stringify(claimableData, null, 2)
      );

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

        console.log(
          `📋 Processing ${rewards.length} reward(s) for chain ${
            chainData.chain?.id || "unknown"
          }`
        );

        for (const reward of rewards) {
          // Log the reward structure to see what fields are available
          console.log(
            `📋 Reward structure:`,
            JSON.stringify(
              {
                token: reward.token?.address,
                symbol: reward.token?.symbol,
                amount: reward.amount,
                claimed: reward.claimed,
                recipient: reward.recipient,
                user: reward.user,
                root: reward.root,
                distributionChainId: reward.distributionChainId,
                campaignId: reward.campaignId,
                hasProofs: !!reward.proofs,
                proofType: Array.isArray(reward.proofs)
                  ? "array"
                  : typeof reward.proofs,
              },
              null,
              2
            )
          );

          // Extract and log the Merkle root from the API response
          if (reward.root) {
            if (!merklApiRoot) {
              merklApiRoot = reward.root;
              console.log(`📋 Merkle Root from Merkl API: ${merklApiRoot}`);
              console.log(
                `   💡 This root should match the distributor contract's Merkle root for the proof to be valid.`
              );
            }
          }

          // Check if distributionChainId matches the chain we're on
          if (
            reward.distributionChainId &&
            reward.distributionChainId !== 1135
          ) {
            console.warn(
              `⚠️ WARNING: Reward has distributionChainId=${reward.distributionChainId} but we're on chain 1135. This might cause proof validation to fail.`
            );
          }
          // Calculate claimable amount: amount - claimed
          // According to docs: claimable = amount - claimed
          const totalAmount = BigInt(reward.amount || "0");
          const claimedAmount = BigInt(reward.claimed || "0");
          const claimableAmount = totalAmount - claimedAmount;

          // CRITICAL: The Merkle proof is generated for the TOTAL amount, not the claimable amount
          // The distributor contract will verify the proof against the total amount in the leaf
          // and then only transfer the remaining (claimable) balance
          // Reference: The Forge script uses the total amount for the proof

          // Only process if there's something to claim
          if (claimableAmount > BigInt(0) && reward.token && reward.proofs) {
            // CRITICAL: The proof from Merkl API is generated for reward.recipient (or reward.user)
            // We MUST use the recipient address (normalized) to match the proof
            // The distributor contract will verify the proof against the Merkle root using this address
            let userAddress: string;

            // Priority: reward.recipient > reward.user > contractAddress
            const recipientAddress = reward.recipient || reward.user;

            if (recipientAddress) {
              // Normalize the address (checksum format)
              userAddress = ethers.getAddress(recipientAddress);

              // Verify it matches contractAddress (case-insensitive)
              const recipientLower = recipientAddress.toLowerCase();
              const contractAddressLower = contractAddress.toLowerCase();

              if (recipientLower !== contractAddressLower) {
                console.warn(
                  `⚠️ WARNING: Reward recipient (${recipientAddress}) doesn't match contract address (${contractAddress})!`
                );
                console.warn(
                  `   The proof is for ${recipientAddress}, but contract address is ${contractAddress}.`
                );
                console.warn(
                  `   Using recipient address (${userAddress}) to match the proof.`
                );
              } else {
                console.log(
                  `✅ Recipient address matches contract: ${userAddress} === ${contractAddress}`
                );
              }
            } else {
              // Fallback to contractAddress if neither recipient nor user is provided
              console.warn(
                `⚠️ WARNING: reward.recipient and reward.user are not provided in API response. Using contractAddress: ${contractAddress}`
              );
              userAddress = ethers.getAddress(contractAddress);
            }

            console.log(
              `📋 Reward details:`,
              JSON.stringify(
                {
                  userAddress: userAddress,
                  recipient: reward.recipient,
                  rewardUser: reward.user,
                  merkleRoot: reward.root,
                  addressesMatch: recipientAddress
                    ? recipientAddress.toLowerCase() ===
                      contractAddress.toLowerCase()
                    : "unknown",
                  token: reward.token.address,
                  tokenSymbol: reward.token.symbol,
                  totalAmount: totalAmount.toString(),
                  claimedAmount: claimedAmount.toString(),
                  claimableAmount: claimableAmount.toString(),
                  distributionChainId: reward.distributionChainId,
                  campaignId: reward.campaignId,
                  proofCount: Array.isArray(reward.proofs)
                    ? reward.proofs.length
                    : reward.proofs
                    ? 1
                    : 0,
                },
                null,
                2
              )
            );

            // IMPORTANT: If distributionChainId doesn't match, the proof might be for a different chain
            // The contract's Merkle root might be for a different distribution
            if (
              reward.distributionChainId &&
              reward.distributionChainId !== 1135
            ) {
              console.error(
                `❌ CRITICAL: Reward distributionChainId (${reward.distributionChainId}) doesn't match current chain (1135). The proof will likely fail validation.`
              );
            }

            users.push(userAddress);
            tokens.push(reward.token.address);
            // CRITICAL FIX: Use totalAmount for the proof, not claimableAmount
            // The Merkle proof is generated for the total amount in the distribution
            // The distributor contract tracks claimed amounts and only transfers the remaining balance
            amounts.push(totalAmount);

            console.log(
              `📦 Found claimable reward for ${userAddress}: ${
                reward.token.symbol
              } - ${claimableAmount.toString()} (Total: ${totalAmount.toString()}, Claimed: ${claimedAmount.toString()}), Proofs: ${
                Array.isArray(reward.proofs)
                  ? reward.proofs.length
                  : reward.proofs
                  ? 1
                  : 0
              }`
            );
            if (Array.isArray(reward.proofs) && reward.proofs.length > 0) {
              console.log(
                `   Proof details: first=${reward.proofs[0].substring(
                  0,
                  20
                )}..., last=${reward.proofs[reward.proofs.length - 1].substring(
                  0,
                  20
                )}...`
              );
            }

            // Proofs should be an array of bytes32 (Merkle proof)
            // Convert string proofs to proper format if needed
            let proofArray: string[] = [];
            if (Array.isArray(reward.proofs)) {
              proofArray = reward.proofs.map((proof: any, index: number) => {
                // Ensure proof is a valid hex string (bytes32 = 32 bytes = 64 hex chars)
                if (typeof proof === "string") {
                  // Remove 0x prefix if present
                  let cleanProof = proof.startsWith("0x")
                    ? proof.slice(2).toLowerCase()
                    : proof.toLowerCase();

                  // Validate it's hex
                  if (!/^[0-9a-f]+$/.test(cleanProof)) {
                    throw new Error(
                      `Invalid hex in proof[${index}] for token ${reward.token.address}`
                    );
                  }

                  // Pad or truncate to exactly 64 hex characters (32 bytes)
                  if (cleanProof.length < 64) {
                    cleanProof = cleanProof.padEnd(64, "0");
                  } else if (cleanProof.length > 64) {
                    cleanProof = cleanProof.substring(0, 64);
                  }

                  return "0x" + cleanProof;
                } else if (typeof proof === "object" && proof !== null) {
                  // If it's already a bytes32 object, convert to hex string
                  return ethers.hexlify(ethers.zeroPadValue(proof, 32));
                }
                return proof;
              });
            } else if (reward.proofs) {
              // Single proof, convert to array
              const proof = reward.proofs;
              if (typeof proof === "string") {
                let cleanProof = proof.startsWith("0x")
                  ? proof.slice(2).toLowerCase()
                  : proof.toLowerCase();

                // Validate hex
                if (!/^[0-9a-f]+$/.test(cleanProof)) {
                  throw new Error(
                    `Invalid hex in proof for token ${reward.token.address}`
                  );
                }

                // Pad or truncate to exactly 64 hex characters
                if (cleanProof.length < 64) {
                  cleanProof = cleanProof.padEnd(64, "0");
                } else if (cleanProof.length > 64) {
                  cleanProof = cleanProof.substring(0, 64);
                }

                proofArray = ["0x" + cleanProof];
              } else if (typeof proof === "object" && proof !== null) {
                proofArray = [ethers.hexlify(ethers.zeroPadValue(proof, 32))];
              } else {
                proofArray = [proof];
              }
            }

            // Validate all proofs are exactly 32 bytes (66 chars with 0x)
            for (let i = 0; i < proofArray.length; i++) {
              const proof = proofArray[i];
              if (typeof proof !== "string" || !proof.startsWith("0x")) {
                throw new Error(
                  `Proof[${i}] is not a valid hex string for token ${reward.token.address}`
                );
              }
              const proofBytes = proof.slice(2);
              if (proofBytes.length !== 64) {
                throw new Error(
                  `Proof[${i}] is not exactly 32 bytes (got ${
                    proofBytes.length / 2
                  } bytes) for token ${reward.token.address}`
                );
              }
            }

            if (proofArray.length === 0) {
              console.warn(
                `⚠️ Skipping reward: invalid proof format for token ${reward.token.address}`
              );
              continue;
            }

            proofs.push(proofArray);
          }
        }
      }

      if (users.length === 0) {
        console.log(`ℹ️ No valid rewards to claim for ${contractAddress}`);
        return {
          success: true,
          message: `No valid rewards to claim for ${contractAddress}`,
          claimedTokens: [],
          claimedAmounts: [],
        };
      }

      // Validate arrays have matching lengths
      if (
        users.length !== tokens.length ||
        users.length !== amounts.length ||
        users.length !== proofs.length
      ) {
        throw new Error(
          `Array length mismatch: users=${users.length}, tokens=${tokens.length}, amounts=${amounts.length}, proofs=${proofs.length}`
        );
      }

      console.log(
        `📦 Preparing to claim ${users.length} reward(s) for ${contractAddress}...`
      );
      console.log(`   Signer: ${this.signer.address}`);
      console.log(`   Contract (Diamond): ${contractAddress}`);

      // Query the Merkle root from the distributor contract for debugging
      const MERKLE_DISTRIBUTOR = "0x3Ef3D8bA38EBe18DB133cEc108f4D14CE00Dd9Ae"; // Lisk mainnet
      console.log(
        `\n🔍 Querying Merkle root from distributor contract: ${MERKLE_DISTRIBUTOR}`
      );
      const distributorRoot = await this.getDistributorMerkleRoot(
        MERKLE_DISTRIBUTOR
      );
      if (distributorRoot) {
        console.log(`   📋 Distributor Merkle Root: ${distributorRoot}`);
        if (merklApiRoot) {
          if (distributorRoot.toLowerCase() === merklApiRoot.toLowerCase()) {
            console.log(
              `   ✅ Roots match! The distributor root matches Merkl's API root.`
            );
          } else {
            console.error(
              `   ❌ ROOT MISMATCH! Distributor root (${distributorRoot}) doesn't match Merkl API root (${merklApiRoot})`
            );
            console.error(
              `   💡 This is why proofs are failing! Contact Merkl support to update the distributor contract's root.`
            );
          }
        } else {
          console.log(
            `   💡 Could not compare roots (Merkl API root not available in response)`
          );
        }
      } else {
        console.log(
          `   ⚠️  Could not query Merkle root (contract may not expose merkleRoot() function)`
        );
        if (merklApiRoot) {
          console.log(
            `   📋 Merkl API root: ${merklApiRoot} (use this to verify with Merkl support)`
          );
        }
      }

      // Log detailed information for each reward being claimed
      for (let i = 0; i < users.length; i++) {
        console.log(`\n   Reward[${i}]:`);
        console.log(`     User: ${users[i]}`);
        console.log(`     Token: ${tokens[i]}`);
        console.log(`     Amount (TOTAL for proof): ${amounts[i].toString()}`);
        console.log(
          `     💡 Note: Proof uses TOTAL amount, contract handles claimable portion`
        );
        console.log(`     Proof count: ${proofs[i].length}`);
        console.log(
          `     Proof elements: ${proofs[i]
            .map(
              (p, idx) =>
                `[${idx}]=${p.substring(0, 20)}... (${p.length} chars)`
            )
            .join(", ")}`
        );

        // Validate proof format
        for (let j = 0; j < proofs[i].length; j++) {
          const proof = proofs[i][j];
          if (proof.length !== 66) {
            console.error(
              `     ⚠️ WARNING: Proof[${i}][${j}] has invalid length: ${proof.length} (expected 66)`
            );
          }
        }

        // Compute expected Merkle leaf using common patterns
        // This helps debug if the contract uses a different leaf construction
        const userAddr = ethers.getAddress(users[i]); // Normalize address
        const tokenAddr = ethers.getAddress(tokens[i]); // Normalize address
        const amount = amounts[i];

        // Pattern 1: keccak256(abi.encodePacked(user, token, amount))
        const leaf1 = ethers.keccak256(
          ethers.solidityPacked(
            ["address", "address", "uint256"],
            [userAddr, tokenAddr, amount]
          )
        );

        // Pattern 2: keccak256(abi.encode(user, token, amount))
        const leaf2 = ethers.keccak256(
          ethers.AbiCoder.defaultAbiCoder().encode(
            ["address", "address", "uint256"],
            [userAddr, tokenAddr, amount]
          )
        );

        console.log(`\n     🔍 Expected Merkle Leaf (for debugging):`);
        console.log(`        Pattern 1 (abi.encodePacked): ${leaf1}`);
        console.log(`        Pattern 2 (abi.encode): ${leaf2}`);

        // Verify proof locally using the Merkle root from API
        if (merklApiRoot) {
          console.log(
            `\n     ✅ Verifying proof locally against Merkl API root...`
          );
          const proof1Valid = this.verifyMerkleProof(
            leaf1,
            proofs[i],
            merklApiRoot
          );
          const proof2Valid = this.verifyMerkleProof(
            leaf2,
            proofs[i],
            merklApiRoot
          );

          if (proof1Valid) {
            console.log(
              `        ✅ Pattern 1 (abi.encodePacked) VERIFIED! Proof is valid.`
            );
            console.log(
              `        💡 This confirms our data is correct. The issue is the distributor contract's root.`
            );
          } else if (proof2Valid) {
            console.log(
              `        ✅ Pattern 2 (abi.encode) VERIFIED! Proof is valid.`
            );
            console.log(
              `        💡 This confirms our data is correct. The issue is the distributor contract's root.`
            );
          } else {
            console.error(
              `        ❌ Neither pattern verified! This suggests:`
            );
            console.error(`           - The leaf construction is different`);
            console.error(
              `           - Or the proof/root from API is incorrect`
            );
            console.error(
              `           - Or there's additional data in the leaf (e.g., campaignId)`
            );
          }
        } else {
          console.log(
            `        ⚠️  Could not verify proof (Merkle root not available from API)`
          );
        }
      }

      // Create contract instance for the Diamond proxy
      // In Diamond pattern, we call functions on the Diamond, which routes to facets
      const contract = new ethers.Contract(
        contractAddress,
        coinsafeAbi,
        this.signer
      );

      // Verify the function exists in the contract interface
      // Note: In Diamond pattern, the function selector will be used to route to the facet
      if (!contract.claimMerklRewards) {
        throw new Error(
          `Function 'claimMerklRewards' not found in contract ABI. Make sure you're using the Diamond proxy address: ${contractAddress}`
        );
      }

      console.log(
        `✅ Function 'claimMerklRewards' found - will be routed by Diamond to OwnerControlFacet`
      );

      // Log the function interface for debugging
      try {
        const iface = contract.interface;
        const functionFragment = iface.getFunction("claimMerklRewards");
        console.log(
          `   Function signature: ${functionFragment.format("full")}`
        );
      } catch (err) {
        console.warn("⚠️ Could not get function interface:", err);
      }

      // Try to estimate gas first to catch errors early
      let gasEstimate: bigint;
      try {
        gasEstimate = await contract.claimMerklRewards.estimateGas(
          users,
          tokens,
          amounts,
          proofs
        );
        console.log(`   Estimated gas: ${gasEstimate.toString()}`);
      } catch (estimateError: any) {
        console.error("❌ Gas estimation failed:", estimateError);

        // Log detailed error information
        console.error("Estimation error details:", {
          message: estimateError.message,
          reason: estimateError.reason,
          data: estimateError.data,
          code: estimateError.code,
        });

        // Try to decode the error
        let decodedError = "Unknown error";
        if (estimateError.data) {
          decodedError = this.decodeErrorSelector(estimateError.data);
          console.error(`   Decoded error: ${decodedError}`);
        } else if (estimateError.reason) {
          decodedError = estimateError.reason;
        }

        // Provide detailed guidance for InvalidProof error
        if (decodedError === "InvalidProof") {
          const MERKLE_DISTRIBUTOR =
            "0x3Ef3D8bA38EBe18DB133cEc108f4D14CE00Dd9Ae";
          console.error(`
❌ InvalidProof Error (0x09bde339) - Merkle proof verification failed

📋 What We're Sending:
   - User Address: ${users[0] || "N/A"}
   - Token Address: ${tokens[0] || "N/A"}
   - Amount: ${amounts[0]?.toString() || "N/A"}
   - Proof Count: ${proofs[0]?.length || 0} proof(s)
   - Distributor Contract: ${MERKLE_DISTRIBUTOR}

🔍 Root Cause:
   The distributor contract (${MERKLE_DISTRIBUTOR}) is an EXTERNAL contract 
   controlled by Merkl. The InvalidProof error means the Merkle root in that 
   contract doesn't match Merkl's current distribution tree.

💡 SOLUTION (Most Likely):
   This is a MERKL-SIDE issue. The distributor contract needs to have its Merkle 
   root updated by Merkl support to match their current distribution.

📞 Action Required:
   1. Contact Merkl support (support@merkl.xyz or their Discord)
   2. Provide them with:
      - Distributor contract: ${MERKLE_DISTRIBUTOR}
      - Chain ID: 1135 (Lisk)
      - Issue: Merkle root mismatch causing InvalidProof errors
      - Request: Update the Merkle root in the distributor contract

🔧 Alternative Causes (Less Likely):
   1. Leaf construction mismatch - distributor uses different encoding
   2. Data mismatch - addresses/amounts don't match proof
   3. Proof format issue - proofs need different formatting

   If Merkl confirms the root is correct, check:
   - Leaf construction pattern in distributor contract source
   - Verify all addresses are checksummed correctly
   - Verify amounts match exactly (no rounding)
          `);
        }

        // Try to extract revert reason
        if (estimateError.reason) {
          throw new Error(
            `Gas estimation failed: ${decodedError} (${estimateError.reason})`
          );
        }
        if (estimateError.data) {
          throw new Error(
            `Gas estimation failed: ${decodedError} (${estimateError.data})`
          );
        }
        throw new Error(`Gas estimation failed: ${decodedError}`);
      }

      // Encode the function call manually to verify it works
      // This also gives us the function selector for Diamond routing
      let encodedData: string;
      let functionSelector: string;
      try {
        const iface = contract.interface;
        encodedData = iface.encodeFunctionData("claimMerklRewards", [
          users,
          tokens,
          amounts,
          proofs,
        ]);
        functionSelector = encodedData.substring(0, 10); // First 4 bytes (8 hex chars + 0x)
        console.log(`   Function selector: ${functionSelector}`);
        console.log(`   Encoded data length: ${encodedData.length} bytes`);
        console.log(
          `   Encoded data (first 100 chars): ${encodedData.substring(
            0,
            100
          )}...`
        );

        // Verify the encoded data is not empty
        if (!encodedData || encodedData.length < 10) {
          throw new Error("Encoded function data is empty or invalid");
        }
      } catch (encodeError: any) {
        console.error("❌ Failed to encode function call:", encodeError);
        throw new Error(
          `Failed to encode function call: ${encodeError.message}`
        );
      }

      // Call the smart contract with explicit gas limit based on estimate
      const gasLimit = gasEstimate + gasEstimate / BigInt(10); // Add 10% buffer
      console.log(`   Using gas limit: ${gasLimit.toString()}`);

      const tx = await contract.claimMerklRewards(
        users,
        tokens,
        amounts,
        proofs,
        {
          gasLimit: gasLimit,
        }
      );

      console.log(
        `⏳ Transaction submitted for ${contractAddress}: ${tx.hash}`
      );
      const receipt = await tx.wait();

      console.log(
        `✅ Rewards claimed successfully for ${contractAddress}! Tx: ${
          tx.hash
        }, Gas used: ${receipt.gasUsed.toString()}`
      );

      return {
        success: true,
        txHash: tx.hash,
        claimedTokens: tokens,
        claimedAmounts: amounts.map((a) => a.toString()),
        message: `Successfully claimed ${users.length} reward(s) for ${contractAddress}`,
      };
    } catch (error: any) {
      console.error(
        `❌ Error claiming Merkl rewards for ${contractAddress}:`,
        error
      );

      // Extract detailed error information
      let errorMessage = "Unknown error";
      let revertReason = null;

      if (error.reason) {
        errorMessage = error.reason;
        revertReason = error.reason;
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Try to extract revert reason from transaction receipt
      if (error.receipt && error.receipt.status === 0) {
        errorMessage = "Transaction reverted";
      }

      // Try to decode revert reason from error data
      if (error.data) {
        try {
          // First try to decode as a custom error
          const decodedError = this.decodeErrorSelector(error.data);
          if (
            decodedError &&
            !decodedError.startsWith("0x") &&
            decodedError !== error.data
          ) {
            revertReason = decodedError;
            errorMessage = `Revert reason: ${decodedError}`;
          } else if (
            typeof error.data === "string" &&
            error.data.startsWith("0x")
          ) {
            // Try to decode as a standard revert reason (string message)
            try {
              const dataWithoutSelector = "0x" + error.data.slice(10);
              const abiCoder = ethers.AbiCoder.defaultAbiCoder();
              const decoded = abiCoder.decode(["string"], dataWithoutSelector);
              revertReason = decoded[0];
              errorMessage = `Revert reason: ${revertReason}`;
            } catch (stringDecodeError) {
              // If string decoding fails, use the custom error we decoded
              if (decodedError && decodedError !== error.data) {
                revertReason = decodedError;
                errorMessage = `Revert reason: ${decodedError}`;
              }
            }
          }
        } catch (decodeError) {
          // If decoding fails, use the raw data
          console.error("Could not decode revert reason:", decodeError);
        }
      }

      // Log detailed error information
      console.error("Error details:", {
        message: error.message,
        reason: error.reason,
        data: error.data,
        receipt: error.receipt
          ? {
              status: error.receipt.status,
              gasUsed: error.receipt.gasUsed?.toString(),
            }
          : null,
      });

      return {
        success: false,
        error: `Failed to claim rewards for ${contractAddress}: ${errorMessage}${
          revertReason ? ` (${revertReason})` : ""
        }`,
      };
    }
  }

  /**
   * Claim Merkl rewards for all configured contract addresses
   */
  async claimRewards(): Promise<ClaimResult> {
    const results: ClaimResult[] = [];
    const allClaimedTokens: string[] = [];
    const allClaimedAmounts: string[] = [];
    let hasSuccess = false;
    let hasFailure = false;
    const errors: string[] = [];

    console.log(
      `🔄 Processing ${this.contractAddresses.length} contract address(es)...`
    );

    for (const contractAddress of this.contractAddresses) {
      console.log(`\n📋 Processing contract: ${contractAddress}`);
      const result = await this.claimRewardsForContract(contractAddress);
      results.push(result);

      if (result.success) {
        hasSuccess = true;
        if (result.claimedTokens && result.claimedTokens.length > 0) {
          allClaimedTokens.push(...result.claimedTokens);
          allClaimedAmounts.push(...result.claimedAmounts);
        }
      } else {
        hasFailure = true;
        if (result.error) {
          errors.push(result.error);
        }
      }
    }

    // Return aggregated result
    if (hasFailure && !hasSuccess) {
      return {
        success: false,
        error: `All claims failed: ${errors.join("; ")}`,
      };
    }

    return {
      success: true,
      claimedTokens: allClaimedTokens,
      claimedAmounts: allClaimedAmounts,
      message: `Processed ${this.contractAddresses.length} contract(s). ${
        hasFailure ? "Some claims failed. " : ""
      }${allClaimedTokens.length} reward(s) claimed.`,
    };
  }
}
