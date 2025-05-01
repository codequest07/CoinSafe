import { useCallback, useState } from "react";
import {
  useSendTransaction,
  useActiveAccount,
  useConnect,
} from "thirdweb/react";
// import { liskSepolia } from 'viem/chains'; // Still used for chain ID reference
import { getContract, prepareContractCall, sendTransaction } from "thirdweb";
import { client, liskSepolia } from "@/lib/config";
import { Account } from "thirdweb/wallets";
// import { toast } from './use-toast';
// import { config } from '@/lib/config'; // Assuming this contains Thirdweb client config

interface UseWithdrawEmergencySafeParams {
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

interface WithdrawEmergencySafeResult {
  withdrawEmergencySafe: (e: React.FormEvent) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
}

export const useWithdrawEmergencySafe = ({
  address: providedAddress,
  token,
  amount,
  coinSafeAddress,
  coinSafeAbi,
  onSuccess,
  onError,
  toast,
}: UseWithdrawEmergencySafeParams): WithdrawEmergencySafeResult => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { connect } = useConnect();
  const account = useActiveAccount();
  const address = account?.address || providedAddress; // Use active account address
  // const account = useActiveAccount();
  // const wallet = useWallet(); // Reference to the wallet (e.g., smart account)
  // const { contract } = useContract({ address: coinSafeAddress, abi: coinSafeAbi });
  const { mutateAsync: writeContractAsync, isPending: writeLoading } =
    useSendTransaction();

  const contract = getContract({
    client,
    chain: liskSepolia,
    address: coinSafeAddress,
  });

  const getTokenDecimals = (token: string): number => {
    const tokenDecimals: Record<string, number> = {
      USDT: 6,
      DEFAULT: 18,
    };

    return tokenDecimals[token] || tokenDecimals.DEFAULT;
  };

  const withdrawEmergencySafe = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      try {
        setIsLoading(true);

        if (!address) {
          try {
            // await connect(async () => ({
            //   chainId: liskSepolia.id,
            //   // Assuming a smart wallet setup; adjust based on your configuration
            //   wallet: wallet || { id: "inApp" }, // Fallback to in-app wallet if none specified
            //   client: config.client, // Assuming config.client contains Thirdweb client
            // }));
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

        if (!contract) {
          throw new Error("Contract not initialized");
        }

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

        // Prepare the contract call for withdrawFromPool
        const transaction = prepareContractCall({
          contract,
          method: "function withdrawFromPool(address token, uint256 amount)",
          params: [token, amountWithDecimals],
        });

        if (account) {
          await sendTransaction({
            transaction,
            account,
          });
        }

        onSuccess?.();
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("An unknown error occurred");
        setError(error);
        onError?.(error);
        console.error("Withdraw asset error:", error);
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
      connect,
      writeContractAsync,
      contract,
    ]
  );

  return {
    withdrawEmergencySafe,
    isLoading: isLoading || writeLoading,
    error,
  };
};
