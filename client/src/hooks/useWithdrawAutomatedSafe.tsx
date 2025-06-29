import { useCallback, useState } from "react";
import {
  getContract,
  prepareContractCall,
  sendAndConfirmTransaction,
} from "thirdweb";
import { client } from "@/lib/config";
import { liskSepolia } from "@/lib/config";
import { Account } from "thirdweb/wallets";
import { Abi } from "viem";
import { getTokenDecimals } from "@/lib/utils";
import { facetAbis } from "@/lib/contract";

interface UseWithdrawAutomatedSafeParams {
  account: Account | undefined;
  token?: `0x${string}`;
  amount?: number;
  acceptEarlyWithdrawalFee: boolean;
  coinSafeAddress: `0x${string}`;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  toast: any;
}

interface WithdrawAutomatedSafeResult {
  withdrawFromSafe: (e: React.FormEvent) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
}

export const useWithdrawAutomatedSafe = ({
  account,
  token,
  amount,
  acceptEarlyWithdrawalFee,
  coinSafeAddress,
  onSuccess,
  onError,
  toast,
}: UseWithdrawAutomatedSafeParams): WithdrawAutomatedSafeResult => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const withdrawFromSafe = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setIsLoading(true);

      try {
        // Input validation
        if (!account) {
          //   toast({
          //     title: "Please connect your wallet",
          //     variant: "destructive",
          //   });
          toast.error("Please connect your wallet");
          throw new Error("No account connected");
        }
        if (!token) {
          //   toast({ title: "Please select a token", variant: "destructive" });
          toast.error("Please select a token");
          throw new Error("Token address is required");
        }
        if (!amount || amount <= 0) {
          //   toast({
          //     title: "Please enter a valid amount",
          //     variant: "destructive",
          //   });
          toast.error("Please enter a valid amount");
          throw new Error("Amount must be greater than zero");
        }

        const contract = getContract({
          client,
          chain: liskSepolia,
          address: coinSafeAddress,
          abi: facetAbis.automatedSavingsFacet as Abi,
        });

        // Convert amount to uint256 with token decimals
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

        // Call withdrawAutomatedSafe
        try {
          const withdrawTx = prepareContractCall({
            contract,
            method:
              "function withdrawAutomatedSafe(address _tokenAddress, uint256 _amount, bool _acceptEarlyWithdrawalFee) external",
            params: [token, amountWithDecimals, acceptEarlyWithdrawalFee],
          });

          await sendAndConfirmTransaction({
            transaction: withdrawTx,
            account,
          });

          toast({ title: "Withdrawal successful", variant: "default" });
          onSuccess?.();
        } catch (txError: any) {
          let errorMsg = "Failed to withdraw from savings plan";
          if (txError?.message?.includes("PlanDoesNotExist")) {
            errorMsg = "Automated savings plan does not exist";
          } else if (txError?.message?.includes("InsufficientFunds")) {
            errorMsg = "Insufficient balance in savings plan";
          } else if (txError?.message?.includes("ZeroValueNotAllowed")) {
            errorMsg = "Amount cannot be zero";
          } else if (txError?.message?.includes("InvalidWithdrawal")) {
            errorMsg = "Early withdrawal requires accepting the fee";
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
    [
      account,
      token,
      amount,
      acceptEarlyWithdrawalFee,
      coinSafeAddress,
      onSuccess,
      onError,
      toast,
    ]
  );

  return {
    withdrawFromSafe,
    isLoading,
    error,
  };
};
