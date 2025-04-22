import { useCallback, useState } from "react"
import { getContract, prepareContractCall, resolveMethod, sendAndConfirmTransaction } from "thirdweb";
import { client, liskSepolia } from "@/lib/config";
import { toBigInt } from "ethers";
import { useActiveAccount } from "thirdweb/react";
import { toast } from "./use-toast";
import { CoinsafeDiamondContract, facetAbis } from "@/lib/contract";
import { Abi } from "viem";

interface SaveState {
  token: string;
  target: string;
  amount: number;
  duration: number;
  typeName: string;
  frequency: number;
}

interface CreateAutoSavingsParams {
  address?: `0x${string}`;
  saveState: SaveState;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

interface CreateAutoSavingsResult {
  createAutoSavings: (e: React.FormEvent) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
}

type TokenDecimals = {
  [key: string]: number;
};

export const useCreateAutoSavings = ({
  address,
  saveState,
  onSuccess,
  onError,
}: CreateAutoSavingsParams): CreateAutoSavingsResult => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const account = useActiveAccount();

  const tokenDecimals: TokenDecimals = {
    USDT: 18,
    DEFAULT: 18,
  };

  const getAmountWithDecimals = (amount: number, token: string): bigint => {
    const decimals = tokenDecimals[token] || tokenDecimals.DEFAULT;
    return BigInt(amount * 10 ** decimals);
  };

  const createAutoSavings = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      try {        
        setIsLoading(true);

        const contract = getContract({
          client,
          chain: liskSepolia,
          address: CoinsafeDiamondContract.address,
          abi: facetAbis.automatedSavingsFacet as Abi,
        });

        // Calculate amount with appropriate decimals
        const amountWithDecimals = getAmountWithDecimals(
          saveState.amount,
          saveState.token
        );

        const transaction = prepareContractCall({
          contract,
          method: resolveMethod("createAutomatedSavingsPlan"),
          params: [
            saveState.token,
            amountWithDecimals,
            toBigInt(saveState.frequency),
            toBigInt(saveState.duration),
          ],
        });

        if (account) {
          await sendAndConfirmTransaction({
            transaction,
            account,
          });

          toast({
            title: "Save successful! Tx Hash",
            className: "bg-[#79E7BA]",
          });
        }

        onSuccess?.();
      } catch (err) {
        let errorMessage = "An unknown error occurred";

        // Handle specific error cases
        if (err instanceof Error) {
          if (err.message.includes("InsufficientFunds()")) {
            errorMessage =
              "Insufficient funds. Please deposit enough to be able to save.";
          } else if (
            err.message.includes("userAutomatedPlanExistsAlreadyExists()")
          ) {
            errorMessage =
              "You have created an automated savings plan already!";
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
    [
      address,
      saveState,
      onSuccess,
      onError,
    ]
  );

  return {
    createAutoSavings,
    isLoading,
    error,
  };
};
