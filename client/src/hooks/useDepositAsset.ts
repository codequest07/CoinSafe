import { useCallback, useState } from "react";
import { useWriteContract, useConnect } from "wagmi";
import { waitForTransactionReceipt } from "@wagmi/core";
import { getContract, prepareContractCall, sendTransaction } from "thirdweb";
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
  onError?: (error: Error) => void;
  toast: (props: { title: string; variant: "default" | "destructive" }) => void;
}

interface DepositAssetResult {
  depositAsset: (e: React.FormEvent) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
}

export const useDepositAsset = ({
  address,
  account,
  token,
  amount,
  coinSafeAddress,
  coinSafeAbi,
  onSuccess,
  onError,
  toast,
}: UseDepositAssetParams): DepositAssetResult => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { connectAsync } = useConnect();
  const { writeContractAsync } = useWriteContract();

  // const { mutate: sendTransaction, isPending, data: transactionResult, error: transactionError } = useSendTransaction();

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
        // setIsLoading(true);
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

        console.log("SAFU", safuContract);

        // if (!address) {
        //   try {
        //     await connectAsync({
        //       chainId: liskSepolia.id,
        //       connector: injected(),
        //     });
        //   } catch (error) {
        //     toast({
        //       title: "Error Connecting Wallet",
        //       variant: "destructive",
        //     });
        //     console.log("Error", error);
        //     throw new Error("Failed to connect wallet: " + error);
        //   }
        // }

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

            const { transactionHash } = await sendTransaction({
              transaction: approveTx,
              account,
            });

            alert(`Approval successful! Tx Hash: ${transactionHash}`);
          } catch (error) {
            console.error("Approval failed:", error);
            alert("Approval failed. Check the console for details.");
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

            const { transactionHash } = await sendTransaction({
              transaction: depositTx,
              account,
            });

            alert(`Deposit successful! Tx Hash: ${transactionHash}`);
            toast({
              title: `Deposit successful! Tx Hash: ${transactionHash}`,
              variant: "default",
            });
          } catch (error) {
            console.error("Deposit failed:", error);
            toast({
              title: `Deposit failed:", ${error}`,
              variant: "destructive",
            });
            alert("Deposit failed. Check the console for details.");
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

        // const approveReceipt = await waitForTransactionReceipt(config, {
        //   hash: approveResponse,
        // });

        // console.log(approveReceipt);
        // if (
        //   approveReceipt.status === "success" &&
        //   approveReceipt.transactionIndex === 1
        // ) {
        //   // Deposit
        //   console.log(
        //     "Approval Transaction successful, proceeding with deposit"
        //   );

        //   // Delay function using Promise
        //   const delay = (ms: number) =>
        //     new Promise((resolve) => setTimeout(resolve, ms));

        //   // Wait for a delay before proceeding
        //   await delay(3000);

        //   const depositResponse = await writeContractAsync({
        //     chainId: liskSepolia.id,
        //     address: coinSafeAddress as `0x${string}`,
        //     functionName: "depositToPool",
        //     abi: coinSafeAbi,
        //     args: [amountWithDecimals, token as `0x${string}`],
        //   });

        //   if (!depositResponse) {
        //     throw new Error("Deposit transaction failed");
        //   }

        //   const depositReceipt = await waitForTransactionReceipt(config, {
        //     hash: depositResponse,
        //   });

        //   if (depositReceipt.status !== "success") {
        //     toast({
        //       title: "Error depositing token",
        //       variant: "destructive",
        //     });
        //     throw new Error("Deposit transaction was not successful");
        //   }

        //   onSuccess?.();
        // } else {
        //   toast({
        //     title: "Error approving token spend",
        //     variant: "destructive",
        //   });
        //   throw new Error("Approve transaction was not successful");
        // }
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
      address,
      account,
      token,
      amount,
      coinSafeAddress,
      coinSafeAbi,
      onSuccess,
      onError,
      // isPending,
      // transactionResult,
      // transactionError,
      toast,
      connectAsync,
      writeContractAsync,
      waitForTransactionReceipt,
    ]
  );

  return {
    depositAsset,
    isLoading,
    error,
  };
};
