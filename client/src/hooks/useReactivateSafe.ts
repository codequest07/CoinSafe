import { useCallback, useState } from "react";
import { getContract, prepareContractCall, resolveMethod } from "thirdweb";
import { client, liskSepolia } from "@/lib/config";
import { CoinsafeDiamondContract, facetAbis } from "@/lib/contract";
import { useActiveAccount } from "thirdweb/react";
import { Abi } from "viem";
import { toBigInt } from "ethers";
import { toast } from "./use-toast";
import { useSmartAccountTransactionInterceptorContext } from "./useSmartAccountTransactionInterceptor";

interface SaveState {
  token: string;
  target: string;
  amount: number;
  duration: number;
  typeName: string;
  frequency: number;
}

interface ReactivateTargetSavingsParams {
  // address?: `0x${string}`;
  safeId: number;
  saveState: SaveState;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useReactivateSavingsTarget = ({
  // address,
  safeId,
  saveState,
  onSuccess,
  onError,
}: ReactivateTargetSavingsParams) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { sendTransaction } = useSmartAccountTransactionInterceptorContext();

  const account = useActiveAccount();

  const reactivateTargetSafe = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      try {
        setIsLoading(true);

        const contract = getContract({
          client,
          chain: liskSepolia,
          address: CoinsafeDiamondContract.address,
          abi: facetAbis.targetSavingsFacet as Abi,
        });

        console.log(saveState);

        const transaction = prepareContractCall({
          contract,
          method: resolveMethod("reactivateSafe"),
          params: [
            safeId,
            saveState.token,
            toBigInt(saveState.amount),
            toBigInt(saveState.duration),
          ],
        });

        if (account) {
          await sendTransaction(transaction);

          toast({
            title: "Reactivate Safe successful!",
            className: "bg-[#79E7BA]",
          });
        }

        onSuccess?.();
      } catch (err) {
        let errorMessage = "An unknown error occurred";

        // Handle specific error cases
        if (err instanceof Error) {
          if (err.message.includes("SafeDoesNotExist()")) {
            errorMessage = "Unexpected error, Safe doesn't exist!";
          } else {
            errorMessage = err.message;
          }
        }

        console.error("Error writing data to contract:", err);
        toast({
          title: "Error writing data to contract",
          variant: "destructive",
        });

        const error = new Error(errorMessage);
        setError(error);
        onError?.(error);
      } finally {
        setIsLoading(false);
      }
    },
    [saveState, onSuccess, onError, account, safeId]
  );

  return {
    reactivateTargetSafe,
    isLoading,
    error,
  };
};
