import { useCallback, useState } from "react";
import { useActiveAccount } from "thirdweb/react";
import { getContract, prepareContractCall } from "thirdweb";
import { client, liskMainnet } from "@/lib/config";
import { toBigInt } from "ethers";
import { toast } from "./use-toast";
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
  const account = useActiveAccount();
  const { sendTransaction } = useSmartAccountTransactionInterceptorContext();

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
          chain: liskMainnet,
          address: coinSafeAddress,
        });

        const amountWithDecimals = getAmountWithDecimals(
          topUpState.amount,
          topUpState.token
        );

        const transaction = prepareContractCall({
          contract,
          method:
            "function saveToEmergencySafe(address _token, uint256 _amount)",
          params: [topUpState.token, amountWithDecimals],
        });

        const result = await sendTransaction(transaction);

        toast({
          title: "Top-up successful!",
          variant: "default",
        });

        onSuccess?.();
        return result;
      } catch (error: any) {
        setError(error);

        toast({
          title: `Error: ${error.message}`,
          variant: "destructive",
        });

        onError?.(error);
        throw error;
      } finally {
        setIsPending(false);
      }
    },
    [account, topUpState, coinSafeAddress, onSuccess, onError]
  );

  return {
    topUpSafe,
    isPending,
    error,
  };
};
