import { useState, useEffect, useCallback } from "react";
import { getContract, readContract } from "thirdweb";
import { client, liskMainnet } from "@/lib/config";
import { CoinsafeDiamondContract, facetAbis } from "@/lib/contract";
import { Abi } from "viem";
import { getTokenDecimals } from "@/lib/utils";

/**
 * SwapQuote structure matching the contract
 */
export interface SwapQuote {
  amountIn: bigint;
  expectedAmountOut: bigint;
  minAmountOut: bigint;
  slippageBps: bigint;
}

/**
 * Parameters for fetching a single-hop swap quote
 */
export interface SingleHopQuoteParams {
  tokenIn: string;
  tokenOut: string;
  amountIn: string; // Human-readable amount (e.g., "100.5")
  stable?: boolean; // Whether to use stable pool (default: false)
  slippageBps?: number; // Slippage in basis points (default: 50 = 0.5%)
}

/**
 * Parameters for fetching a multi-hop swap quote
 */
export interface MultiHopQuoteParams {
  tokenIn: string;
  intermediate: string;
  tokenOut: string;
  amountIn: string; // Human-readable amount
  stableAB?: boolean; // First hop stable pool (default: false)
  stableBC?: boolean; // Second hop stable pool (default: false)
  slippageBps?: number; // Slippage in basis points (default: 50 = 0.5%)
}

/**
 * Hook return type
 */
export interface UseSwapQuoteResult {
  quote: SwapQuote | null;
  isLoading: boolean;
  error: Error | null;
  fetchQuote: () => Promise<void>;
}

/**
 * Hook for fetching single-hop swap quotes
 */
export function useSwapQuote(
  params: SingleHopQuoteParams | null
): UseSwapQuoteResult {
  const [quote, setQuote] = useState<SwapQuote | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const contract = getContract({
    client,
    address: CoinsafeDiamondContract.address,
    chain: liskMainnet,
    abi: facetAbis.swapFacet as unknown as Abi,
  });

  const fetchQuote = useCallback(async () => {
    if (!params) {
      setQuote(null);
      return;
    }

    const { tokenIn, tokenOut, amountIn, stable = false, slippageBps = 50 } = params;

    // Validate inputs
    if (!tokenIn || !tokenOut || !amountIn || Number(amountIn) <= 0) {
      setError(new Error("Invalid swap parameters"));
      return;
    }

    if (slippageBps < 0 || slippageBps > 10000) {
      setError(new Error("Slippage must be between 0 and 10000 basis points"));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Convert amount to bigint with proper decimals
      const tokenInDecimals = getTokenDecimals(tokenIn);
      const amountStr = amountIn.toString();
      let amountInBigInt: bigint;

      if (amountStr.includes(".")) {
        const [whole, fraction] = amountStr.split(".");
        const paddedFraction = fraction.padEnd(tokenInDecimals, "0").slice(0, tokenInDecimals);
        amountInBigInt = BigInt(whole + paddedFraction);
      } else {
        amountInBigInt = BigInt(amountStr + "0".repeat(tokenInDecimals));
      }

      // Call the contract's getSwapQuote function
      const result = await readContract({
        contract,
        method:
          "function getSwapQuote(address tokenIn, address tokenOut, uint256 amountIn, bool stable, uint256 slippageBps) external view returns ((uint256 amountIn, uint256 expectedAmountOut, uint256 minAmountOut, uint256 slippageBps) quote)",
        params: [
          tokenIn as `0x${string}`,
          tokenOut as `0x${string}`,
          amountInBigInt,
          stable,
          BigInt(slippageBps),
        ],
      });

      // The result is a tuple, extract it
      const quoteResult = result as SwapQuote;
      setQuote(quoteResult);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to fetch swap quote");
      setError(error);
      console.error("Error fetching swap quote:", err);
      setQuote(null);
    } finally {
      setIsLoading(false);
    }
  }, [params, contract]);

  // Auto-fetch when params change
  useEffect(() => {
    fetchQuote();
  }, [fetchQuote]);

  return {
    quote,
    isLoading,
    error,
    fetchQuote,
  };
}

/**
 * Hook for fetching multi-hop swap quotes
 */
export function useMultiHopSwapQuote(
  params: MultiHopQuoteParams | null
): UseSwapQuoteResult {
  const [quote, setQuote] = useState<SwapQuote | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const contract = getContract({
    client,
    address: CoinsafeDiamondContract.address,
    chain: liskMainnet,
    abi: facetAbis.swapFacet as unknown as Abi,
  });

  const fetchQuote = useCallback(async () => {
    if (!params) {
      setQuote(null);
      return;
    }

    const {
      tokenIn,
      intermediate,
      tokenOut,
      amountIn,
      stableAB = false,
      stableBC = false,
      slippageBps = 50,
    } = params;

    // Validate inputs
    if (!tokenIn || !intermediate || !tokenOut || !amountIn || Number(amountIn) <= 0) {
      setError(new Error("Invalid swap parameters"));
      return;
    }

    if (slippageBps < 0 || slippageBps > 10000) {
      setError(new Error("Slippage must be between 0 and 10000 basis points"));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Convert amount to bigint with proper decimals
      const tokenInDecimals = getTokenDecimals(tokenIn);
      const amountStr = amountIn.toString();
      let amountInBigInt: bigint;

      if (amountStr.includes(".")) {
        const [whole, fraction] = amountStr.split(".");
        const paddedFraction = fraction.padEnd(tokenInDecimals, "0").slice(0, tokenInDecimals);
        amountInBigInt = BigInt(whole + paddedFraction);
      } else {
        amountInBigInt = BigInt(amountStr + "0".repeat(tokenInDecimals));
      }

      // Call the contract's getMultiHopSwapQuote function
      const result = await readContract({
        contract,
        method:
          "function getMultiHopSwapQuote(address tokenIn, address intermediate, address tokenOut, uint256 amountIn, bool stableAB, bool stableBC, uint256 slippageBps) external view returns ((uint256 amountIn, uint256 expectedAmountOut, uint256 minAmountOut, uint256 slippageBps) quote)",
        params: [
          tokenIn as `0x${string}`,
          intermediate as `0x${string}`,
          tokenOut as `0x${string}`,
          amountInBigInt,
          stableAB,
          stableBC,
          BigInt(slippageBps),
        ],
      });

      // The result is a tuple, extract it
      const quoteResult = result as SwapQuote;
      setQuote(quoteResult);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to fetch multi-hop swap quote");
      setError(error);
      console.error("Error fetching multi-hop swap quote:", err);
      setQuote(null);
    } finally {
      setIsLoading(false);
    }
  }, [params, contract]);

  // Auto-fetch when params change
  useEffect(() => {
    fetchQuote();
  }, [fetchQuote]);

  return {
    quote,
    isLoading,
    error,
    fetchQuote,
  };
}
