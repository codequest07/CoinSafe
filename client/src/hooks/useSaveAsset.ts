import { useWriteContract } from "wagmi";
import { useCallback, useState } from "react";
import {
  // useWriteContract,
  useConnect,
} from "wagmi";
import { useActiveAccount } from "thirdweb/react";
import { getContract, prepareContractCall, sendTransaction } from "thirdweb";
import { waitForTransactionReceipt } from "@wagmi/core";
// import { injected } from 'wagmi/connectors';
import { liskSepolia } from "@/lib/config";
import { client } from "@/lib/config";
import { toBigInt } from "ethers";
import { toast } from "./use-toast";
import { tokenDecimals } from "@/lib/utils";
// import { liskSepolia } from 'viem/chains';

interface SaveState {
  target: string;
  id: number;
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

  const { connectAsync } = useConnect();
  const { writeContractAsync } = useWriteContract();

  // const { mutate: sendTransaction, isPending, data: transactionResult, error: transactionError } = useSendTransaction();

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

  const saveAsset = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      setIsPending(true);
      try {
        const contract = getContract({
          client,
          chain: liskSepolia,
          address: coinSafeAddress,
        });

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
            toBigInt(saveState.id),
            saveState.token,
            amountWithDecimals,
            toBigInt(saveState.duration),
          ], // saveState.token, amountWithDecimals, saveState.duration
        });

        // sendTransaction(transaction)

        if (account) {
          const { transactionHash } = await sendTransaction({
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

          // console.log("hash", transactionHash)

          // alert(`Save successful! Tx Hash: ${transactionHash}`);
          // toast({
          //     title: "Save successful! Tx Hash",
          //     className: "bg-[#79E7BA]"
          // });
        }
        //   console.error("Save asset failed:", error);
        //   toast({
        //     title: "Save asset failed",
        //     variant: "destructive"
        // });
        //   alert("Save asset failed. Check the console for details.");

        // console.log("Data from save contract:", transactionResult);
        // return transactionResult;
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

      // try {
      //   // Connect wallet if not connected
      //   if (!address) {
      //     try {
      //       await connectAsync({
      //         chainId: liskSepolia.id,
      //         connector: injected(),
      //       });
      //     } catch (error) {
      //       throw new Error('Failed to connect wallet: ' + (error instanceof Error ? error.message : 'Unknown error'));
      //     }
      //   }

      //   setIsLoading(true);

      //   // Validate inputs
      //   if (!saveState.amount) {
      //     throw new Error('Amount is required');
      //   }

      //   if (!saveState.token) {
      //     throw new Error('Token is required');
      //   }

      //   if (!saveState.duration) {
      //     throw new Error('Duration is required');
      //   }

      //   // Calculate amount with appropriate decimals
      //   const amountWithDecimals = getAmountWithDecimals(saveState.amount, saveState.token);

      //   // Call save function
      //   const saveResponse = await writeContractAsync({
      //     chainId: liskSepolia.id,
      //     address: coinSafeAddress,
      //     functionName: "save",
      //     abi: coinSafeAbi,
      //     args: [saveState.token, amountWithDecimals, saveState.duration],
      //   });

      //   if (!saveResponse) {
      //     throw new Error('Save transaction failed');
      //   }

      //   // Wait for transaction confirmation
      //   const saveReceipt = await waitForTransactionReceipt(config, {
      //     hash: saveResponse,
      //   });

      //   if (saveReceipt.status !== 'success') {
      //     throw new Error('Save transaction was not successful');
      //   }

      //   onSuccess?.();

      // } catch (err) {
      //   let errorMessage = 'An unknown error occurred';

      //   // Handle specific error cases
      //   if (err instanceof Error) {
      //     if (err.message.includes('InsufficientFunds()')) {
      //       errorMessage = 'Insufficient funds. Please deposit enough to be able to save.';
      //     } else {
      //       errorMessage = err.message;
      //     }
      //   }

      //   const error = new Error(errorMessage);
      //   setError(error);
      //   onError?.(error);
      // } finally {
      //   setIsLoading(false);
      // }
    },
    [
      address,
      saveState,
      coinSafeAddress,
      coinSafeAbi,
      onSuccess,
      onError,
      connectAsync,
      writeContractAsync,
      waitForTransactionReceipt,
    ]
  );

  return {
    saveAsset,
    isPending,
    error,
  };
};
