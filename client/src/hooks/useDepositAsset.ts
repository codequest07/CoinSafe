import { useCallback, useState } from "react";
import { useWriteContract, useConnect } from "wagmi";
import { waitForTransactionReceipt } from "@wagmi/core";
import { injected } from "wagmi/connectors";
import { erc20Abi } from "viem";
import { liskSepolia } from "viem/chains";
import { config } from "@/lib/config";

interface UseDepositAssetParams {
  address?: `0x${string}`;
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

      try {
        setIsLoading(true);

        if (!address) {
          try {
            await connectAsync({
              chainId: liskSepolia.id,
              connector: injected(),
            });
          } catch (error) {
            toast({
              title: "Error Connecting Wallet",
              variant: "destructive",
            });
            console.log("Error", error);
            throw new Error("Failed to connect wallet: " + error);
          }
        }

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

        // Approve token
        const approveResponse = await writeContractAsync({
          chainId: liskSepolia.id,
          address: token as `0x${string}`,
          functionName: "approve",
          abi: erc20Abi,
          args: [coinSafeAddress, amountWithDecimals],
        });

        if (!approveResponse) {
          toast({
            title: "Error approving token spend",
            variant: "destructive",
          });
          throw new Error("Approve transaction failed");
        }

        const approveReceipt = await waitForTransactionReceipt(config, {
          hash: approveResponse,
        });

        if (approveReceipt.status !== "success") {
          toast({
            title: "Error approving token spend",
            variant: "destructive",
          });
          throw new Error("Approve transaction was not successful");
        } else {
          // Deposit
          const depositResponse = await writeContractAsync({
            chainId: liskSepolia.id,
            address: coinSafeAddress as `0x${string}`,
            functionName: "depositToPool",
            abi: coinSafeAbi,
            args: [amountWithDecimals, token],
          });

          if (!depositResponse) {
            throw new Error("Deposit transaction failed");
          }

          const depositReceipt = await waitForTransactionReceipt(config, {
            hash: depositResponse,
          });

          if (depositReceipt.status !== "success") {
            toast({
              title: "Error depositing token",
              variant: "destructive",
            });
            throw new Error("Deposit transaction was not successful");
          }

          onSuccess?.();
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
      address,
      token,
      amount,
      coinSafeAddress,
      coinSafeAbi,
      onSuccess,
      onError,
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
