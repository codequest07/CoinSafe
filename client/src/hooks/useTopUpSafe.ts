import { useCallback, useState } from "react";
import { useActiveAccount } from "thirdweb/react";
import { getContract, prepareContractCall, sendTransaction } from "thirdweb";
import { client, liskSepolia } from "@/lib/config";
import { toBigInt } from "ethers";
import { toast } from "./use-toast";

interface TopUpState {
  id: number;
  token: string;
  amount: number;
}

interface UseTopUpSafeParams {
  address?: `0x${string}`;
  topUpState: TopUpState;
  coinSafeAddress: `0x${string}`;
  coinSafeAbi: any;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

interface UseTopUpSafeResult {
  topUpSafe: (e: React.FormEvent) => Promise<any>;
  isPending: boolean;
  error: Error | null;
}

type TokenDecimals = {
  [key: string]: number;
};

export const useTopUpSafe = ({
  //address,
  topUpState,
  coinSafeAddress,
  coinSafeAbi,
  onSuccess,
  onError,
}: UseTopUpSafeParams): UseTopUpSafeResult => {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const account = useActiveAccount();

  const tokenDecimals: TokenDecimals = {
    USDT: 6,
    DEFAULT: 18,
  };

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

      if (!topUpState.id) {
        const error = new Error("Safe ID is required");
        setError(error);
        onError?.(error);
        return;
      }

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
          chain: liskSepolia,
          address: coinSafeAddress,
        });

        const amountWithDecimals = getAmountWithDecimals(
          topUpState.amount,
          topUpState.token
        );

        const transaction = prepareContractCall({
          contract,
          method:
            "function topUpSafe(uint256 _id, address _token, uint256 _amount)",
          params: [
            toBigInt(topUpState.id),
            topUpState.token,
            amountWithDecimals,
          ],
        });

        const result = await sendTransaction({
          transaction,
          account: account!,
        });

        toast({
          title: "Top-up successful!",
          variant: "default",
        });

        onSuccess?.();
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
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
    [account, topUpState, coinSafeAddress, coinSafeAbi, onSuccess, onError]
  );

  return {
    topUpSafe,
    isPending,
    error,
  };
};
