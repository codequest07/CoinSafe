import { useCallback, useState } from "react";
import { getContract, prepareContractCall, sendAndConfirmTransaction } from "thirdweb";
import { client } from "@/lib/config";
import { liskSepolia } from "@/lib/config";
import { Account } from "thirdweb/wallets";
import { tokens } from "@/lib/contract";
import { erc20Abi } from "viem";

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
  // address,
  account,
  token,
  amount,
  coinSafeAddress,
  // coinSafeAbi,
  onSuccess,
  onApprove,
  onError,
  toast,
}: UseDepositAssetParams): DepositAssetResult => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const getTokenDecimals = (token: string): number => {
    const tokenDecimals: Record<string, number> = {
      USDT: 6,
      DEFAULT: 18,
    };

    return tokenDecimals[token] || tokenDecimals.DEFAULT;
  };

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
        });

        const safuContract = getContract({
          client,
          address: tokens.safu,
          chain: liskSepolia,
          abi: erc20Abi,
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

        const decimals = getTokenDecimals(token);
        const amountWithDecimals = BigInt(amount * 10 ** decimals);

        if (account) {
          try {
            const approveTx = prepareContractCall({
              contract: safuContract,
              method: "approve",
              params: [coinSafeAddress, BigInt(amount * 10 ** 18)], // Assuming 18 decimals
            });
            
            onApprove?.();

            await sendAndConfirmTransaction({
              transaction: approveTx,
              account,
            });
          } catch (error) {
            console.error("Approval failed:", error);
            toast({
              title: "Error approving token spend",
              variant: "destructive",
            });
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
          throw new Error("Approve transaction failed");
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
