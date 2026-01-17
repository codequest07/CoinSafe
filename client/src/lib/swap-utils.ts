/**
 * Utility functions for swap operations
 */

import { formatUnits } from "viem";

/**
 * Convert percentage to basis points
 * @param percentage - Percentage value (e.g., 0.5 for 0.5%)
 * @returns Basis points (e.g., 50 for 0.5%)
 */
export function calculateSlippageBps(percentage: number): number {
  return Math.round(percentage * 100);
}

/**
 * Calculate minimum amount out based on expected output and slippage
 * @param expectedOut - Expected output amount
 * @param slippageBps - Slippage in basis points (e.g., 50 = 0.5%)
 * @returns Minimum amount out after applying slippage
 */
export function calculateMinAmountOut(
  expectedOut: bigint,
  slippageBps: number
): bigint {
  if (slippageBps > 10000) {
    throw new Error("Slippage cannot exceed 100%");
  }
  // Calculate: expectedOut * (10000 - slippageBps) / 10000
  return (expectedOut * BigInt(10000 - slippageBps)) / BigInt(10000);
}

/**
 * Format swap quote for display
 */
export interface FormattedQuote {
  amountIn: string;
  expectedAmountOut: string;
  minAmountOut: string;
  slippagePercentage: string;
}

/**
 * Format a SwapQuote for display purposes
 * @param quote - The swap quote from the contract
 * @param tokenInDecimals - Decimals for input token
 * @param tokenOutDecimals - Decimals for output token
 * @returns Formatted quote with human-readable strings
 */
export function formatSwapQuote(
  quote: {
    amountIn: bigint;
    expectedAmountOut: bigint;
    minAmountOut: bigint;
    slippageBps: bigint;
  },
  tokenInDecimals: number,
  tokenOutDecimals: number
): FormattedQuote {
  // Use ES module import at top-level; don't use require here.
  // Assume "formatUnits" is already imported from "viem" elsewhere in the file.
  
  return {
    amountIn: formatUnits(quote.amountIn, tokenInDecimals),
    expectedAmountOut: formatUnits(quote.expectedAmountOut, tokenOutDecimals),
    minAmountOut: formatUnits(quote.minAmountOut, tokenOutDecimals),
    slippagePercentage: ((Number(quote.slippageBps) / 100).toFixed(2)),
  };
}

/**
 * Calculate deadline timestamp (current time + buffer in minutes)
 * @param bufferMinutes - Minutes to add to current time (default: 20)
 * @returns Unix timestamp deadline
 */
export function calculateDeadline(bufferMinutes: number = 20): bigint {
  const now = Math.floor(Date.now() / 1000);
  return BigInt(now + bufferMinutes * 60);
}

/**
 * Determine if a swap route should be single-hop or multi-hop
 * This is a simple implementation - in production, you might want to
 * check if a direct pool exists first
 * @param tokenIn - Input token address
 * @param tokenOut - Output token address
 * @param intermediate - Optional intermediate token address
 * @returns 'single' for single-hop, 'multi' for multi-hop
 */
export function determineSwapRoute(
  tokenIn: string,
  tokenOut: string,
  intermediate?: string
): "single" | "multi" {
  // If intermediate token is provided, use multi-hop
  if (intermediate && intermediate !== tokenIn && intermediate !== tokenOut) {
    return "multi";
  }
  // Default to single-hop (can be enhanced to check for pool existence)
  return "single";
}
