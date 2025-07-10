import { useCallback, useState } from "react";
import { getContract, prepareContractCall } from "thirdweb";
import { client } from "@/lib/config";
import { liskSepolia } from "@/lib/config";
import { Account } from "thirdweb/wallets";
import { Abi } from "viem";
import { facetAbis } from "@/lib/contract";
import { useSmartAccountTransactionInterceptorContext } from "./useSmartAccountTransactionInterceptor";

interface UseRemoveTokenFromAutomatedPlanParams {
  account: Account | undefined;
  token?: `0x${string}`;
  coinSafeAddress: `0x${string}`;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  toast: (props: { title: string; variant: "default" | "destructive" }) => void;
}

interface RemoveTokenFromAutomatedPlanResult {
  removeTokenFromPlan: (e: React.FormEvent) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
}

export const useRemoveTokenFromAutomatedPlan = ({
  account,
  token,
  coinSafeAddress,
  onSuccess,
  onError,
  toast,
}: UseRemoveTokenFromAutomatedPlanParams): RemoveTokenFromAutomatedPlanResult => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { sendTransaction } = useSmartAccountTransactionInterceptorContext();

  const removeTokenFromPlan = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setIsLoading(true);

      try {
        // Input validation
        if (!account) {
          toast({
            title: "Please connect your wallet",
            variant: "destructive",
          });
          throw new Error("No account connected");
        }
        if (!token) {
          toast({
            title: "Please select a token to remove",
            variant: "destructive",
          });
          throw new Error("Token address is required");
        }

        const contract = getContract({
          client,
          chain: liskSepolia,
          address: coinSafeAddress,
          abi: facetAbis.automatedSavingsFacet as Abi,
        });

        // Call removeTokenFromAutomatedPlan
        try {
          const removeTokenTx = prepareContractCall({
            contract,
            method:
              "function removeTokenFromAutomatedPlan(address _token) external",
            params: [token],
          });

          await sendTransaction(removeTokenTx);

          toast({
            title: "Token removed from plan successfully",
            variant: "default",
          });
          onSuccess?.();
        } catch (txError: any) {
          let errorMsg = "Failed to remove token from plan";
          if (txError?.message?.includes("TokenNotInPlan")) {
            errorMsg = "Selected token is not in the savings plan";
          }
          toast({ title: errorMsg, variant: "destructive" });
          throw new Error(errorMsg);
        }
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("An unknown error occurred");
        setError(error);
        onError?.(error);
        console.error("Remove token from plan error:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [account, token, coinSafeAddress, onSuccess, onError, toast]
  );

  return {
    removeTokenFromPlan,
    isLoading,
    error,
  };
};
