import { useCallback, useState } from "react";
import { getContract, prepareContractCall } from "thirdweb";
import { client } from "@/lib/config";
import { liskMainnet } from "@/lib/config";
import { Account } from "thirdweb/wallets";
import { Abi } from "viem";
import { getTokenDecimals } from "@/lib/utils";
import { facetAbis } from "@/lib/contract";
import { useSmartAccountTransactionInterceptorContext } from "./useSmartAccountTransactionInterceptor";

interface UseAddTokenToAutomatedPlanParams {
  account: Account | undefined;
  token?: `0x${string}`;
  amount?: number;
  frequency?: number; // In seconds
  coinSafeAddress: `0x${string}`;
  onSuccess?: () => void;
  onApprove?: () => void;
  onError?: (error: Error) => void;
  toast: any;
}

interface AddTokenToAutomatedPlanResult {
  addTokenToPlan: (e: React.FormEvent) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
}

export const useAddTokenToAutomatedPlan = ({
  account,
  token,
  amount,
  frequency,
  coinSafeAddress,
  onSuccess,
  onApprove,
  onError,
  toast,
}: UseAddTokenToAutomatedPlanParams): AddTokenToAutomatedPlanResult => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { sendTransaction } = useSmartAccountTransactionInterceptorContext();

  const addTokenToPlan = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setIsLoading(true);

      try {
        // Input validation
        if (!account) {
          toast.error("Please connect your wallet");
          throw new Error("No account connected");
        }
        if (!token) {
          toast.error("Please select a token");
          throw new Error("Token address is required");
        }
        if (!amount || amount <= 0) {
          toast.error("Please enter a valid amount");
          throw new Error("Amount must be greater than zero");
        }
        if (!frequency || frequency <= 0) {
          toast.error("Please enter a valid frequency");
          throw new Error("Frequency must be greater than zero");
        }
        if (frequency > 365 * 24 * 60 * 60) {
          toast.error("Frequency cannot exceed one year");
          throw new Error("Frequency exceeds one year");
        }

        const contract = getContract({
          client,
          chain: liskMainnet,
          address: coinSafeAddress,
          abi: facetAbis.automatedSavingsFacet as Abi,
        });

        // Convert amount to uint256 (considering ERC-20 decimals)
        const decimals = getTokenDecimals(token);
        const amountStr = amount.toString();
        let amountWithDecimals: bigint;

        if (amountStr.includes(".")) {
          const [whole, fraction] = amountStr.split(".");
          const paddedFraction = fraction
            .padEnd(decimals, "0")
            .slice(0, decimals);
          amountWithDecimals = BigInt(whole + paddedFraction);
        } else {
          amountWithDecimals = BigInt(amountStr + "0".repeat(decimals));
        }

        // Call addTokenToAutomatedPlan
        try {
          const addTokenTx = prepareContractCall({
            contract,
            method:
              "function addTokenToAutomatedPlan(address _token, uint256 _amount, uint256 _frequency) external",
            params: [token, amountWithDecimals, BigInt(frequency)],
          });

          await sendTransaction(addTokenTx);

          toast.success("Token added to plan successfully")
          onSuccess?.();
        } catch (txError: any) {
          let errorMsg = "Failed to add token to plan";
          if (txError?.message?.includes("AutomatedSafeDoesNotExist")) {
            errorMsg = "Automated savings plan does not exist";
          } else if (txError?.message?.includes("InvalidTokenAddress")) {
            errorMsg = "Selected token is not accepted by the contract";
          } else if (txError?.message?.includes("TokenAlreadyInPlan")) {
            errorMsg = "Token is already in the plan";
          } else if (txError?.message?.includes("ZeroValueNotAllowed")) {
            errorMsg = "Amount or frequency cannot be zero";
          } else if (txError?.message?.includes("PlanExpired")) {
            errorMsg = "Savings plan has expired";
          }
          toast.error(errorMsg);
          throw new Error(errorMsg);
        }
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("An unknown error occurred");
        setError(error);
        onError?.(error);
        console.error("Add token to plan error:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [
      account,
      token,
      amount,
      frequency,
      coinSafeAddress,
      onSuccess,
      onApprove,
      onError,
      toast,
    ]
  );

  return {
    addTokenToPlan,
    isLoading,
    error,
  };
};
