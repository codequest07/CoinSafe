import { useCallback, useState } from "react";
import { getContract, prepareContractCall } from "thirdweb";
import { client } from "@/lib/config";
import { useChainConfig } from "@/hooks/useChainConfig";
import { toBigInt } from "ethers";
import { toast } from "sonner";
import { tokenDecimals } from "@/lib/utils";
import { useSmartAccountTransactionInterceptorContext } from "./useSmartAccountTransactionInterceptor";

interface TopUpState {
  token: string;
  amount: number;
}

interface UseTopUpEmergencySafeParams {
  address?: `0x${string}`;
  topUpState: TopUpState;
  coinSafeAddress: `0x${string}`;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

interface UseTopUpEmergencySafeResult {
  topUpSafe: (e: React.FormEvent) => Promise<any>;
  isPending: boolean;
  error: Error | null;
}

export const useTopUpEmergencySafe = ({
  //address,
  topUpState,
  coinSafeAddress,
  onSuccess,
  onError,
}: UseTopUpEmergencySafeParams): UseTopUpEmergencySafeResult => {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { sendTransaction } = useSmartAccountTransactionInterceptorContext();
  const { chain } = useChainConfig();

  const getAmountWithDecimals = (amount: number, token: string): bigint => {
    const decimals = tokenDecimals[token] || tokenDecimals.DEFAULT;

    // Handle the conversion more safely to avoid overflow
    // First convert to string with the correct number of decimal places
    const amountStr = amount.toString();

    // Check if the amount has a decimal point
    if (amountStr.includes(".")) {
      const [whole, fraction] = amountStr.split(".");
      const paddedFraction = fraction.padEnd(decimals, "0").slice(0, decimals);
      return toBigInt(whole + paddedFraction);
    } else {
      // If no decimal point, just add zeros
      return toBigInt(amountStr + "0".repeat(decimals));
    }
  };

  const topUpSafe = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      if (!topUpState.token) {
        const error = new Error("Token is required");
        setError(error);
        onError?.(error);
        return;
      }

      if (!topUpState.amount || topUpState.amount <= 0) {
        const error = new Error("Amount must be greater than 0");
        setError(error);
        onError?.(error);
        return;
      }

      setIsPending(true);
      try {
        const contract = getContract({
          client,
          chain: chain,
          address: coinSafeAddress,
        });

        const amountWithDecimals = getAmountWithDecimals(
          topUpState.amount,
          topUpState.token,
        );

        const transaction = prepareContractCall({
          contract,
          method:
            "function saveToEmergencySafe(address _token, uint256 _amount)",
          params: [topUpState.token, amountWithDecimals],
        });

        const result = await sendTransaction(transaction);

        toast.success("Top-up successful!");

        onSuccess?.();
        return result;
      } catch (error: any) {
        setError(error);

        toast.error(`Error: ${error.message}`);

        onError?.(error);
        throw error;
      } finally {
        setIsPending(false);
      }
    },
    [topUpState, coinSafeAddress, onSuccess, onError, chain, sendTransaction],
  );

  return {
    topUpSafe,
    isPending,
    error,
  };
};
