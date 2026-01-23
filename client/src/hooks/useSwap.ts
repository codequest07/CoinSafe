import { useCallback, useState } from "react";
import { getContract, prepareContractCall } from "thirdweb";
import { client, liskMainnet } from "@/lib/config";
import { CoinsafeDiamondContract, facetAbis } from "@/lib/contract";
import { Account } from "thirdweb/wallets";
import { Abi } from "viem";
import { getTokenDecimals } from "@/lib/utils";
import { useSmartAccountTransactionInterceptorContext } from "./useSmartAccountTransactionInterceptor";
import { calculateDeadline } from "@/lib/swap-utils";

/**
 * Parameters for executing a swap
 */
export interface SwapParams {
  tokenIn: string;
  tokenOut: string;
  amountIn: string; // Human-readable amount (e.g., "100.5")
  amountOutMin: bigint; // Minimum output amount (from quote)
  deadline?: bigint; // Optional deadline (auto-calculated if not provided)
  intermediate?: string; // Optional intermediate token for multi-hop
}

/**
 * Options for the swap hook
 */
export interface UseSwapOptions {
  account: Account | undefined;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  toast?: any; // Toast notification system
}

/**
 * Return type for useSwap hook
 */
export interface UseSwapResult {
  swap: (params: SwapParams) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook for executing swaps (both single-hop and multi-hop)
 *
 * @example
 * ```tsx
 * const { swap, isLoading, error } = useSwap({
 *   account,
 *   onSuccess: () => toast.success("Swap successful!"),
 *   onError: (err) => toast.error(err.message),
 *   toast,
 * });
 *
 * // Execute swap
 * await swap({
 *   tokenIn: "0x...",
 *   tokenOut: "0x...",
 *   amountIn: "100.5",
 *   amountOutMin: quote.minAmountOut,
 * });
 * ```
 */
export function useSwap({
  account,
  onSuccess,
  onError,
  toast,
}: UseSwapOptions): UseSwapResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { sendTransaction } = useSmartAccountTransactionInterceptorContext();

  const swap = useCallback(
    async (params: SwapParams) => {
      const {
        tokenIn,
        tokenOut,
        amountIn,
        amountOutMin,
        deadline,
        intermediate,
      } = params;

      // Validate inputs
      if (!account) {
        const err = new Error("No account connected");
        setError(err);
        toast?.error("Please connect your wallet");
        onError?.(err);
        return;
      }

      if (!tokenIn || !tokenOut || !amountIn || Number(amountIn) <= 0) {
        const err = new Error("Invalid swap parameters");
        setError(err);
        toast?.error("Invalid swap parameters");
        onError?.(err);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const contract = getContract({
          client,
          chain: liskMainnet,
          address: CoinsafeDiamondContract.address,
          abi: facetAbis.swapFacet as unknown as Abi,
        });

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

        // Calculate deadline if not provided (default: 20 minutes from now)
        const swapDeadline = deadline || calculateDeadline(20);

        // Determine if this is a single-hop or multi-hop swap
        const isMultiHop =
          !!intermediate &&
          intermediate !== tokenIn &&
          intermediate !== tokenOut;

        let swapTx;

        if (isMultiHop) {
          // Multi-hop swap
          swapTx = prepareContractCall({
            contract,
            method:
              "function swapMultiHop(address tokenIn, address intermediate, address tokenOut, uint256 amountIn, uint256 amountOutMin, uint256 deadline) external returns (uint256 amountOut)",
            params: [
              tokenIn as `0x${string}`,
              intermediate as `0x${string}`,
              tokenOut as `0x${string}`,
              amountInBigInt,
              amountOutMin,
              swapDeadline,
            ],
          });
        } else {
          // Single-hop swap
          swapTx = prepareContractCall({
            contract,
            method:
              "function swapFromBalance(address tokenIn, address tokenOut, uint256 amountIn, uint256 amountOutMin, uint256 deadline) external returns (uint256 amountOut)",
            params: [
              tokenIn as `0x${string}`,
              tokenOut as `0x${string}`,
              amountInBigInt,
              amountOutMin,
              swapDeadline,
            ],
          });
        }

        // Execute the transaction
        const result = await sendTransaction(swapTx);

        if (result?.transactionHash) {
          toast?.success(
            `Swap successful! Transaction: ${result.transactionHash.slice(0, 10)}...`,
          );
          onSuccess?.();
        } else {
          throw new Error("Swap transaction failed - no transaction hash");
        }
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Swap failed: " + String(err));
        setError(error);
        console.error("Swap error:", err);

        // Provide user-friendly error messages
        let errorMessage = "Swap failed";
        if (error.message.includes("InsufficientFunds")) {
          errorMessage = "Insufficient balance for swap";
        } else if (error.message.includes("InsufficientOutputAmount")) {
          errorMessage =
            "Slippage tolerance exceeded. Try increasing slippage.";
        } else if (error.message.includes("Deadline")) {
          errorMessage = "Transaction deadline exceeded. Please try again.";
        } else if (error.message.includes("InvalidTokenAddress")) {
          errorMessage = "Invalid token address";
        } else {
          errorMessage = error.message;
        }

        toast?.error(errorMessage);
        onError?.(error);
      } finally {
        setIsLoading(false);
      }
    },
    [account, sendTransaction, onSuccess, onError, toast],
  );

  return {
    swap,
    isLoading,
    error,
  };
}
