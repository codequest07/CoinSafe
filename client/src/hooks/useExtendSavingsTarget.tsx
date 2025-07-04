import { useCallback, useState } from "react";
import {
  getContract,
  prepareContractCall,
  resolveMethod,
  sendAndConfirmTransaction,
} from "thirdweb";
import { client, liskSepolia } from "@/lib/config";
import { CoinsafeDiamondContract, facetAbis } from "@/lib/contract";
import { useActiveAccount } from "thirdweb/react";
import { Abi } from "viem";
import { toBigInt } from "ethers";
import { toast } from "./use-toast";

interface SaveState {
  token: string;
  target: string;
  amount: number;
  duration: number;
  typeName: string;
  frequency: number;
}

interface ExtendTargetSavingsParams {
  // address?: `0x${string}`;
  safeId: number;
  saveState: SaveState;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useExtendSavingsTarget = ({
  // address,
  safeId,
  saveState,
  onSuccess,
  onError,
}: ExtendTargetSavingsParams) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const account = useActiveAccount();

  const extendTargetSafe = useCallback(
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

        const transaction = prepareContractCall({
          contract,
          method: resolveMethod("extendSafeDuration"),
          params: [safeId, toBigInt(saveState.duration)],
        });

        if (account) {
          await sendAndConfirmTransaction({
            transaction,
            account,
          });

          toast({
            title: "Extend Automated plan successful!",
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
    [saveState, onSuccess, onError, account, safeId]
  );

  return {
    extendTargetSafe,
    isLoading,
    error,
  };
};
