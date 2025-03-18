import { useCallback, useState } from "react";
import { getContract, prepareContractCall, sendTransaction } from "thirdweb";
import { client } from "@/lib/config";
import { liskSepolia } from "@/lib/config";
import { Account } from "thirdweb/wallets";

interface UseWithdrawAssetParams {
  address?: `0x${string}`;
  account: Account | undefined;
  token?: `0x${string}`;
  amount?: number;
  coinSafeAddress: `0x${string}`;
  coinSafeAbi: any;
  chainId?: number;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  toast: (props: { title: string; variant: "default" | "destructive" }) => void;
}

interface WithdrawAssetResult {
  withdrawAsset: (e: React.FormEvent) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
}

export const useWithdrawAsset = ({
  // address,
  account,
  token,
  amount,
  coinSafeAddress,
  // coinSafeAbi,
  onSuccess,
  onError,
  toast,
}: UseWithdrawAssetParams): WithdrawAssetResult => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const getTokenDecimals = (token: string): number => {
    const tokenDecimals: Record<string, number> = {
      USDT: 6,
      DEFAULT: 18,
    };

    return tokenDecimals[token] || tokenDecimals.DEFAULT;
  };

  const withdrawAsset = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      try {
        setIsLoading(true);

        if (!amount) {
          toast({
            title: "Please input a value for amount to Withdraw",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        if (!token) {
          toast({
            title: "Please select token to Withdraw",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        const decimals = getTokenDecimals(token);
        const amountWithDecimals = BigInt(amount * 10 ** decimals);

        const contract = getContract({
          client,
          chain: liskSepolia,
          address: coinSafeAddress,
        });

        if (account) {
          setIsLoading(true);
          try {
            const WithdrawTx = prepareContractCall({
              contract,
              method:
                "function withdrawFromPool(address _token, uint256 _amount,) external",
              params: [token as `0x${string}`, amountWithDecimals],
            });

            await sendTransaction({
              transaction: WithdrawTx,
              account,
            });

            onSuccess?.();
          } catch (error) {
            console.error("Withdraw failed:", error);
            toast({
              title: `Withdraw failed:", ${error}`,
              variant: "destructive",
            });
            throw new Error("Withdraw transaction was not successful");
          } finally {
            setIsLoading(false);
          }

          // const approveResponse = await getApprovalForTransaction({
          //   transaction: transaction,
          //   account, // the connected account
          // });

          // console.log("APPROVE RES", approveResponse)

          // if (approveResponse) {
          //   await sendAndConfirmTransaction({
          //     transaction: approveResponse,
          //     account,
          //   })
          // }

          // Once approved, you can finally perform the buy transaction
          // await sendAndConfirmTransaction({
          //   transaction: transaction,
          //   account,
          // });
          // if (!approveResponse) {
          //   toast({
          //     title: "Error approving token spend",
          //     variant: "destructive",
          //   });
          //   throw new Error("Approve transaction failed");
          // }

          // sendTransaction(transaction)
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
        console.error("Withdraw asset error:", error);
      } finally {
        setIsLoading(false);
      }

      //     // Withdraw
      //     const WithdrawResponse = await writeContractAsync({
      //       chainId: liskSepolia.id,
      //       address: coinSafeAddress as `0x${string}`,
      //       functionName: "withdrawFromPool",
      //       abi: coinSafeAbi,
      //       args: [token, amountWithDecimals],
      //     });

      //     if (!WithdrawResponse) {
      //       throw new Error("Withdraw transaction failed");
      //     }

      //     const WithdrawReceipt = await waitForTransactionReceipt(config, {
      //       hash: WithdrawResponse,
      //     });

      //     if (WithdrawReceipt.status !== "success") {
      //       toast({
      //         title: "Error Withdrawing token",
      //         variant: "destructive",
      //       });
      //       throw new Error("Withdraw transaction was not successful");
      //     }

      //     onSuccess?.();
      //   } catch (err) {
      //     const error =
      //       err instanceof Error ? err : new Error("An unknown error occurred");
      //     setError(error);
      //     onError?.(error);
      //     console.error("Withdraw asset error:", error);
      //   } finally {
      //     setIsLoading(false);
      //   }
    },
    [
      // address,
      account,
      token,
      amount,
      coinSafeAddress,
      // coinSafeAbi,
      // onSuccess,
      onError,
      toast,
    ]
  );

  return {
    withdrawAsset,
    isLoading,
    error,
  };
};
