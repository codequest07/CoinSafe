import { ethers } from "ethers";
import * as dotenv from "dotenv";

dotenv.config();

/**
 * EIP-712 typed data structure for APR data
 */
export interface APRData {
  tokenSymbol: string;
  tokenAddress: string;
  chainId: number;
  aprBasisPoints: number; // APR * 10000 (e.g., 12.5% = 125000)
  timestamp: number; // Unix timestamp in seconds
  opportunityName: string;
  nonce: number; // Unique nonce to prevent replay attacks
}

/**
 * Service for signing APR data using EIP-712 signatures
 */
export class APRSigningService {
  private signer: ethers.Wallet;
  private domain: {
    name: string;
    version: string;
    chainId: number;
    verifyingContract?: string;
  };

  constructor() {
    const privateKey =
      process.env.APR_SIGNER_PRIVATE_KEY ||
      process.env.PRIVATE_KEY ||
      process.env.WALLET_PRIVATE_KEY;

    if (!privateKey) {
      throw new Error(
        "APR_SIGNER_PRIVATE_KEY, PRIVATE_KEY, or WALLET_PRIVATE_KEY must be set in environment variables"
      );
    }

    this.signer = new ethers.Wallet(privateKey);

    const chainId = parseInt(process.env.CHAIN_ID || "1135"); // Default to Lisk
    const verifyingContract =
      process.env.APR_ORACLE_CONTRACT_ADDRESS || undefined;

    this.domain = {
      name: "CoinSafe APR Oracle",
      version: "1",
      chainId: chainId,
      verifyingContract: verifyingContract,
    };
  }

  /**
   * Get the signer address (public key)
   */
  getSignerAddress(): string {
    return this.signer.address;
  }

  /**
   * Generate EIP-712 signature for APR data
   * @param aprData - APR data to sign
   * @returns Signature string (0x...)
   */
  async signAPRData(aprData: APRData): Promise<string> {
    // EIP-712 types definition
    const types = {
      APRData: [
        { name: "tokenSymbol", type: "string" },
        { name: "tokenAddress", type: "address" },
        { name: "chainId", type: "uint256" },
        { name: "aprBasisPoints", type: "uint256" },
        { name: "timestamp", type: "uint256" },
        { name: "opportunityName", type: "string" },
        { name: "nonce", type: "uint256" },
      ],
    };

    // Generate signature
    const signature = await this.signer.signTypedData(this.domain, types, {
      tokenSymbol: aprData.tokenSymbol,
      tokenAddress: aprData.tokenAddress,
      chainId: aprData.chainId,
      aprBasisPoints: aprData.aprBasisPoints,
      timestamp: aprData.timestamp,
      opportunityName: aprData.opportunityName,
      nonce: aprData.nonce,
    });

    return signature;
  }

  /**
   * Sign APR data with automatic nonce generation
   * @param tokenSymbol - Token symbol (e.g., "LSK", "USDC")
   * @param tokenAddress - Token contract address
   * @param chainId - Chain ID
   * @param apr - APR as percentage (e.g., 12.5 for 12.5%)
   * @param timestamp - Unix timestamp in seconds (defaults to now)
   * @param opportunityName - Opportunity name
   * @param nonce - Optional nonce (defaults to timestamp * 1000 + random)
   * @returns Object with signature and signer address
   */
  async signAPR(
    tokenSymbol: string,
    tokenAddress: string,
    chainId: number,
    apr: number,
    timestamp: number | Date,
    opportunityName: string,
    nonce?: number
  ): Promise<{
    signature: string;
    signer: string;
    nonce: number;
    aprBasisPoints: number;
  }> {
    // Convert timestamp to unix seconds
    const timestampSeconds =
      timestamp instanceof Date
        ? Math.floor(timestamp.getTime() / 1000)
        : timestamp;

    // Generate nonce if not provided (timestamp in milliseconds + random)
    const finalNonce =
      nonce ||
      Math.floor(timestampSeconds * 1000) + Math.floor(Math.random() * 1000);

    // Convert APR percentage to basis points (multiply by 10000)
    const aprBasisPoints = Math.round(apr * 10000);

    const aprData: APRData = {
      tokenSymbol,
      tokenAddress,
      chainId,
      aprBasisPoints,
      timestamp: timestampSeconds,
      opportunityName,
      nonce: finalNonce,
    };

    const signature = await this.signAPRData(aprData);

    return {
      signature,
      signer: this.getSignerAddress(),
      nonce: finalNonce,
      aprBasisPoints,
    };
  }

  /**
   * Verify an APR signature (for testing purposes)
   * @param aprData - APR data
   * @param signature - Signature to verify
   * @returns true if signature is valid
   */
  async verifySignature(aprData: APRData, signature: string): Promise<boolean> {
    try {
      const types = {
        APRData: [
          { name: "tokenSymbol", type: "string" },
          { name: "tokenAddress", type: "address" },
          { name: "chainId", type: "uint256" },
          { name: "aprBasisPoints", type: "uint256" },
          { name: "timestamp", type: "uint256" },
          { name: "opportunityName", type: "string" },
          { name: "nonce", type: "uint256" },
        ],
      };

      const recoveredAddress = ethers.verifyTypedData(
        this.domain,
        types,
        {
          tokenSymbol: aprData.tokenSymbol,
          tokenAddress: aprData.tokenAddress,
          chainId: aprData.chainId,
          aprBasisPoints: aprData.aprBasisPoints,
          timestamp: aprData.timestamp,
          opportunityName: aprData.opportunityName,
          nonce: aprData.nonce,
        },
        signature
      );

      return (
        recoveredAddress.toLowerCase() === this.signer.address.toLowerCase()
      );
    } catch (error) {
      console.error("Error verifying signature:", error);
      return false;
    }
  }
}
