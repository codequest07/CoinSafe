import { useState, useEffect, useCallback, useMemo } from "react";
import { getContract, readContract } from "thirdweb";
import { client } from "@/lib/config";
import { facetAbis } from "@/lib/contract";
import { Abi } from "viem";
import { getTokenDecimals } from "@/lib/utils";
import { useChainConfig } from "@/hooks/useChainConfig";

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
  params: SingleHopQuoteParams | null,
): UseSwapQuoteResult {
  const [quote, setQuote] = useState<SwapQuote | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { chain, diamondAddress } = useChainConfig();

  const contract = useMemo(
    () =>
      getContract({
        client,
        address: diamondAddress,
        chain: chain,
        abi: facetAbis.swapFacet as unknown as Abi,
      }),
    [chain, diamondAddress],
  );

  const fetchQuote = useCallback(async () => {
    if (!params) {
      setQuote(null);
      return;
    }

    const { tokenIn, tokenOut, amountIn, stable, slippageBps = 50 } = params;

    // Validate inputs
    if (!tokenIn || !tokenOut || !amountIn || Number(amountIn) <= 0) {
      // setError(new Error("Invalid swap parameters"));
      // Silent fail/reset for incomplete inputs
      setQuote(null);
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
        const paddedFraction = fraction
          .padEnd(tokenInDecimals, "0")
          .slice(0, tokenInDecimals);
        amountInBigInt = BigInt(whole + paddedFraction);
      } else {
        amountInBigInt = BigInt(amountStr + "0".repeat(tokenInDecimals));
      }

      const fetchRate = async (isStable: boolean) => {
        return (await readContract({
          contract,
          method:
            "function getSwapQuote(address tokenIn, address tokenOut, uint256 amountIn, bool stable, uint256 slippageBps) external view returns ((uint256 amountIn, uint256 expectedAmountOut, uint256 minAmountOut, uint256 slippageBps) quote)",
          params: [
            tokenIn as `0x${string}`,
            tokenOut as `0x${string}`,
            amountInBigInt,
            isStable,
            BigInt(slippageBps),
          ],
        })) as SwapQuote;
      };

      let quoteResult: SwapQuote | null = null;
      let lastError: unknown;

      // Logic:
      // 1. If stable is explicitly provided, use it.
      // 2. If not provided, try stable=false (volatile) first.
      // 3. If that fails, try stable=true (stable).

      try {
        const useStable = stable ?? false;
        quoteResult = await fetchRate(useStable);
      } catch (err) {
        lastError = err;
        // If stable was NOT explicitly set, try the other option
        if (stable === undefined) {
          try {
            console.log("Failed to fetch volatile quote, trying stable...");
            quoteResult = await fetchRate(true);
            lastError = null; // Clear error if this succeeds
          } catch (retryErr) {
            console.error("Failed to fetch stable quote as well:", retryErr);
            lastError = retryErr;
          }
        }
      }

      if (quoteResult) {
        setQuote(quoteResult);
      } else {
        throw lastError || new Error("Failed to fetch quote");
      }
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to fetch swap quote");
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
  params: MultiHopQuoteParams | null,
): UseSwapQuoteResult {
  const [quote, setQuote] = useState<SwapQuote | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { chain, diamondAddress } = useChainConfig();

  const contract = useMemo(
    () =>
      getContract({
        client,
        address: diamondAddress,
        chain: chain,
        abi: facetAbis.swapFacet as unknown as Abi,
      }),
    [chain, diamondAddress],
  );

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
    if (
      !tokenIn ||
      !intermediate ||
      !tokenOut ||
      !amountIn ||
      Number(amountIn) <= 0
    ) {
      // Silent reset
      setQuote(null);
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
        const paddedFraction = fraction
          .padEnd(tokenInDecimals, "0")
          .slice(0, tokenInDecimals);
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
      const error =
        err instanceof Error
          ? err
          : new Error("Failed to fetch multi-hop swap quote");
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
