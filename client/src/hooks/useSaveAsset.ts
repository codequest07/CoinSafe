import { useCallback, useState } from "react";
import { useActiveAccount } from "thirdweb/react";
import {
  getContract,
  prepareContractCall,
  sendAndConfirmTransaction,
} from "thirdweb";
import { liskSepolia } from "@/lib/config";
import { client } from "@/lib/config";
import { toBigInt } from "ethers";
import { toast } from "./use-toast";
import { tokenDecimals } from "@/lib/utils";
import { Abi } from "viem";
// import { liskSepolia } from 'viem/chains';

interface SaveState {
  target: string;
  id: number | null;
  token: string;
  amount: number;
  duration: number;
  typeName: string;
}

interface UseSaveAssetParams {
  address?: `0x${string}`;
  saveState: SaveState;
  coinSafeAddress: `0x${string}`;
  coinSafeAbi: any;
  chainId: number;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

interface UseSaveAssetResult {
  saveAsset: (e: React.FormEvent) => Promise<any>;
  topUpSafe: (id: number, token: string, amount: number) => Promise<any>;
  // isLoading: boolean;
  isPending: boolean;
  error: Error | null;
}

export const useSaveAsset = ({
  address,
  saveState,
  coinSafeAddress,
  coinSafeAbi,
  onSuccess,
  onError,
}: UseSaveAssetParams): UseSaveAssetResult => {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const account = useActiveAccount();

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

  const contract = getContract({
    client,
    chain: liskSepolia,
    address: coinSafeAddress,
    abi: coinSafeAbi as Abi,
  });

  const saveAsset = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      setIsPending(true);

      try {
        const amountWithDecimals = getAmountWithDecimals(
          saveState.amount,
          saveState.token
        );

        const transaction = prepareContractCall({
          contract,
          method:
            "function save(string memory _target, uint256 _id, address _token, uint256 _amount, uint256 _duration)",
          params: [
            saveState.target,
            toBigInt(saveState.id || 0),
            saveState.token,
            amountWithDecimals,
            toBigInt(saveState.duration),
          ], // saveState.token, amountWithDecimals, saveState.duration
        });

        if (account) {
          const { transactionHash } = await sendAndConfirmTransaction({
            transaction,
            account,
          });

          if (!transactionHash) {
            toast({
              title: "Save asset failed",
              variant: "destructive",
            });
          }

          onSuccess?.();
        }
      } catch (error) {
        console.error("Error writing data to contract:", error);
        toast({
          title: "Error writing data to contract",
          variant: "destructive",
        });
        // throw transactionResult;
      } finally {
        setIsPending(false);
      }
    },
    [address, saveState, coinSafeAddress, coinSafeAbi, onSuccess, onError]
  );

  const topUpSafe = useCallback(
    async (id: number, token: string, amount: number) => {
      setError(null);

      if (!id) {
        const error = new Error("Safe ID is required");
        setError(error);
        onError?.(error);
        return;
      }

      if (!token) {
        const error = new Error("Token is required");
        setError(error);
        onError?.(error);
        return;
      }

      if (!amount || amount <= 0) {
        const error = new Error("Amount must be greater than 0");
        setError(error);
        onError?.(error);
        return;
      }

      setIsPending(true);
      try {
        const amountWithDecimals = getAmountWithDecimals(amount, token);

        const transaction = prepareContractCall({
          contract,
          method:
            "function topUpSafe(uint256 _id, address _token, uint256 _amount)",
          params: [toBigInt(id), token, amountWithDecimals],
        });

        const result = await sendAndConfirmTransaction({
          transaction,
          account: account!,
        });

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
    [account, coinSafeAddress, coinSafeAbi, onSuccess, onError]
  );

  return {
    saveAsset,
    topUpSafe,
    isPending,
    error,
  };
};
