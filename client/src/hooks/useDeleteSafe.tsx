import { useCallback, useState } from "react";
import { getContract, prepareContractCall, resolveMethod } from "thirdweb";
import { client, liskMainnet } from "@/lib/config";
import { CoinsafeDiamondContract, facetAbis } from "@/lib/contract";
import { useActiveAccount } from "thirdweb/react";
import { Abi } from "viem";
import { toast } from "./use-toast";
import { useSmartAccountTransactionInterceptorContext } from "./useSmartAccountTransactionInterceptor";

// interface SaveState {
//   token: string;
//   target: string;
//   amount: number;
//   duration: number;
//   typeName: string;
//   frequency: number;
// }

interface DeleteSafeParams {
  id?: number;
  //   saveState: SaveState;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useDeleteSafe = ({ id, onSuccess, onError }: DeleteSafeParams) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { sendTransaction } = useSmartAccountTransactionInterceptorContext();

  const account = useActiveAccount();

  const deleteSafe = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      try {
        setIsLoading(true);

        const contract = getContract({
          client,
          chain: liskMainnet,
          address: CoinsafeDiamondContract.address,
          abi: facetAbis.targetSavingsFacet as Abi,
        });

        const transaction = prepareContractCall({
          contract,
          method: resolveMethod("deleteSafe"),
          params: [id],
        });

        if (account) {
          await sendTransaction(transaction);

          toast({
            title: "Delete safe successful!",
            className: "bg-[#79E7BA]",
          });
        }

        onSuccess?.();
      } catch (err) {
        let errorMessage = "An unknown error occurred";

        // Handle specific error cases
        if (err instanceof Error) {
          if (err.message.includes("Plan is Archived")) {
            errorMessage =
              "Automated savings plan is archived. Please create a new one.";
          } else if (err.message.includes("DurationTooShort()")) {
            errorMessage = "Duration is too short, choose a longer timeline!";
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
    [onSuccess, onError, account, id]
  );

  return {
    deleteSafe,
    isLoading,
    error,
  };
};
