import { useCallback, useState } from "react";
import { getContract, prepareContractCall } from "thirdweb";
import { client } from "@/lib/config";
import { liskSepolia } from "@/lib/config";
import { Account } from "thirdweb/wallets";
import { Abi } from "viem";
// import { getTokenDecimals } from "@/lib/utils";
import { facetAbis } from "@/lib/contract";
import { useSmartAccountTransactionInterceptorContext } from "./useSmartAccountTransactionInterceptor";

interface UseClaimAllAutomatedSafeParams {
  account: Account | undefined;
  coinSafeAddress: `0x${string}`;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  toast: any;
}

interface ClaimAllAutomatedSafeResult {
  claimAllAutoSafe: (e: React.FormEvent) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
}

export const useClaimAllAutoSafe = ({
  account,
  coinSafeAddress,
  onSuccess,
  onError,
  toast,
}: UseClaimAllAutomatedSafeParams): ClaimAllAutomatedSafeResult => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { sendTransaction } = useSmartAccountTransactionInterceptorContext();

  const claimAllAutoSafe = useCallback(
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
        // if (!token) {
        //   //   toast({ title: "Please select a token", variant: "destructive" });
        //   toast.error("Please select a token");
        //   throw new Error("Token address is required");
        // }

        const contract = getContract({
          client,
          chain: liskSepolia,
          address: coinSafeAddress,
          abi: facetAbis.automatedSavingsFacet as Abi,
        });

        // Call claimAllAutomatedSafe
        try {
          const claimAllTx = prepareContractCall({
            contract,
            method: "function claimAllAutomatedSafe() external",
            params: [],
          });

          await sendTransaction(claimAllTx);

          toast({ title: "Claim all successful", variant: "default" });
          onSuccess?.();
        } catch (txError: any) {
          let errorMsg = "Failed to claim from savings plan";
          if (txError?.message?.includes("PlanDoesNotExist")) {
            errorMsg = "Automated savings plan does not exist";
          } else if (txError?.message?.includes("InsufficientFunds")) {
            errorMsg = "Insufficient balance in savings plan";
          } else if (txError?.message?.includes("ZeroValueNotAllowed")) {
            errorMsg = "Amount cannot be zero";
          }
          toast({ title: errorMsg, variant: "destructive" });
          throw new Error(errorMsg);
        }
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("An unknown error occurred");
        setError(error);
        onError?.(error);
        console.error("Withdraw from safe error:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [account, coinSafeAddress, onSuccess, onError, toast]
  );

  return {
    claimAllAutoSafe,
    isLoading,
    error,
  };
};
