/**
 * APR API utilities for fetching signed APR data from the backend
 * Used for claim, claimAll, and withdrawSavings operations
 */

const BACKEND_BASE_URL = "https://api.coinsafe.network/api";

/**
 * Response type from the signed APR endpoint
 */
export interface SignedAprResponse {
  success: boolean;
  data: {
    tokenAddress: string;
    aprBasisPoints: number;
    nonce: number;
    signature: string;
    signer: string;
    aprPercent: number;
  };
}

/**
 * Parsed APR data ready for contract calls
 */
export interface AprData {
  avgAPR: bigint;
  aprNonce: bigint;
  aprSignature: `0x${string}`;
}

/**
 * Fetches signed APR data for a specific token
 *
 * @param tokenAddress - The token address to get APR for
 * @param chainId - Optional chain ID (defaults to 1135 for Lisk mainnet)
 * @returns Promise with APR data for contract calls
 *
 * @example
 * ```ts
 * const aprData = await getSignedApr("0x...");
 * // Use in contract call:
 * // withdrawSavings(safeId, tokenAddress, amount, acceptFee, aprData.avgAPR, aprData.aprNonce, aprData.aprSignature)
 * ```
 */
export async function getSignedApr(
  tokenAddress: string,
  chainId: number = 1135,
): Promise<AprData> {
  try {
    const url = new URL(`${BACKEND_BASE_URL}/merkl/apr/signed`);
    url.searchParams.set("tokenAddress", tokenAddress);
    url.searchParams.set("chainId", chainId.toString());

    const response = await fetch(url.toString());

    // console.log("APR RESPONSE", response);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch signed APR: ${response.status} ${response.statusText}`,
      );
    }

    const result: SignedAprResponse = await response.json();

    if (!result.success || !result.data) {
      throw new Error("Invalid response from APR endpoint");
    }

    return {
      avgAPR: BigInt(result.data.aprBasisPoints),
      aprNonce: BigInt(result.data.nonce),
      aprSignature: result.data.signature as `0x${string}`,
    };
  } catch (error) {
    console.error("Error fetching signed APR:", error);
    throw error;
  }
}

/**
 * Fetches signed APR data for claimAll operations (no specific token)
 * Uses the zero address as the token address
 *
 * @param chainId - Optional chain ID (defaults to 1135 for Lisk mainnet)
 * @returns Promise with APR data for contract calls
 *
 * @example
 * ```ts
 * const aprData = await getSignedAprForClaimAll();
 * // Use in contract call:
 * // claimAll(safeId, aprData.avgAPR, aprData.aprNonce, aprData.aprSignature)
 * ```
 */
export async function getSignedAprForClaimAll(
  chainId: number = 1135,
): Promise<AprData> {
  try {
    const url = new URL(`${BACKEND_BASE_URL}/merkl/apr/signed`);
    // For claimAll, use zero address or omit tokenAddress
    url.searchParams.set(
      "tokenAddress",
      "0x0000000000000000000000000000000000000000",
    );
    url.searchParams.set("chainId", chainId.toString());

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(
        `Failed to fetch signed APR for claimAll: ${response.status} ${response.statusText}`,
      );
    }

    const result: SignedAprResponse = await response.json();

    if (!result.success || !result.data) {
      throw new Error("Invalid response from APR endpoint");
    }

    return {
      avgAPR: BigInt(result.data.aprBasisPoints),
      aprNonce: BigInt(result.data.nonce),
      aprSignature: result.data.signature as `0x${string}`,
    };
  } catch (error) {
    console.error("Error fetching signed APR for claimAll:", error);
    throw error;
  }
}
