import { useCallback, useState } from "react";
import {
  getContract,
  prepareContractCall,
  sendAndConfirmTransaction,
} from "thirdweb";
import { client } from "@/lib/config";
import { liskSepolia } from "@/lib/config";
import { Account } from "thirdweb/wallets";
import { erc20Abi, Abi } from "viem";
import { getTokenDecimals } from "@/lib/utils";
import { facetAbis } from "@/lib/contract";

interface UseDepositAssetParams {
  address?: `0x${string}`;
  account: Account | undefined;
  token?: `0x${string}`;
  amount?: number;
  coinSafeAddress: `0x${string}`;
  coinSafeAbi: any;
  chainId?: number;
  onSuccess?: () => void;
  onApprove?: () => void;
  onError?: (error: Error) => void;
  toast: (props: { title: string; variant: "default" | "destructive" }) => void;
}

interface DepositAssetResult {
  depositAsset: (e: React.FormEvent) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
}

export const useDepositAsset = ({
  account,
  token,
  amount,
  coinSafeAddress,
  onSuccess,
  onApprove,
  onError,
  toast,
}: UseDepositAssetParams): DepositAssetResult => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const depositAsset = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      setIsLoading(true);
      try {
        const contract = getContract({
          client,
          chain: liskSepolia,
          address: coinSafeAddress,
          abi: facetAbis.fundingFacet as Abi,
        });

        if (!amount) {
          toast({
            title: "Please input a value for amount to deposit",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        if (!token) {
          toast({
            title: "Please select token to deposit",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        const tokenContract = getContract({
          client,
          address: token,
          chain: liskSepolia,
          abi: erc20Abi,
        });

        const decimals = getTokenDecimals(token);

        // Handle the conversion more safely to avoid overflow
        // First convert to string with the correct number of decimal places
        const amountStr = amount.toString();
        let amountWithDecimals: bigint;

        // Check if the amount has a decimal point
        if (amountStr.includes(".")) {
          const [whole, fraction] = amountStr.split(".");
          const paddedFraction = fraction
            .padEnd(decimals, "0")
            .slice(0, decimals);
          amountWithDecimals = BigInt(whole + paddedFraction);
        } else {
          // If no decimal point, just add zeros
          amountWithDecimals = BigInt(amountStr + "0".repeat(decimals));
        }

        if (account) {
          try {
            const approveTx = prepareContractCall({
              contract: tokenContract,
              method: "approve",
              params: [coinSafeAddress, amountWithDecimals], // Use the same amount with decimals
            });

            onApprove?.();

            await sendAndConfirmTransaction({
              transaction: approveTx,
              account,
            });
          } catch (error: any) {
            console.error("Approval failed:", error);
            throw new Error(
              `Approve token spend transaction failed: ${error?.message ?? error}`
            );
          } finally {
            setIsLoading(false);
          }

          setIsLoading(true);
          try {
            const depositTx = prepareContractCall({
              contract,
              method:
                "function depositToPool(uint256 _amount, address _token) external",
              params: [amountWithDecimals, token as `0x${string}`],
            });

            await sendAndConfirmTransaction({
              transaction: depositTx,
              account,
            });

            onSuccess?.();
          } catch (error) {
            console.error("Deposit failed:", error);
            toast({
              title: `Deposit failed:", ${error}`,
              variant: "destructive",
            });
            onError?.(error as Error);
          } finally {
            setIsLoading(false);
          }
        } else {
          toast({
            title: "No account. Connect an account",
            variant: "destructive",
          });
          throw new Error(`Approve transaction failed: ${error?.message}`);
        }
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("An unknown error occurred");
        setError(error);
        onError?.(error);
        console.error("Deposit asset error:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [
      // address,
      account,
      token,
      amount,
      coinSafeAddress,
      onSuccess,
      onError,
      // isPending,
      // transactionResult,
      // transactionError,
      toast,
    ]
  );

  return {
    depositAsset,
    isLoading,
    error,
  };
};
