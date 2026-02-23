import { useCallback, useState } from "react";
import { useActiveAccount } from "thirdweb/react";
import { getContract, prepareContractCall } from "thirdweb";
import { client } from "@/lib/config";
import { useChainConfig } from "@/hooks/useChainConfig";
import { Account } from "thirdweb/wallets";
import { parseUnits } from "ethers";
import { getTokenDecimals } from "@/lib/utils";
import { useSmartAccountTransactionInterceptorContext } from "./useSmartAccountTransactionInterceptor";

interface UseWithdrawEmergencySafeParams {
  address?: `0x${string}`;
  account: Account | undefined;
  token?: `0x${string}`;
  amount?: number;
  coinSafeAddress: `0x${string}`;
  chainId?: number;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  toast: any;
}

interface WithdrawEmergencySafeResult {
  withdrawFromEmergencySafe: (e: React.FormEvent) => Promise<any>;
  isLoading: boolean;
  error: Error | null;
}

export const useWithdrawEmergencySafe = ({
  address: providedAddress,
  token,
  amount,
  coinSafeAddress,
  onSuccess,
  onError,
  toast,
}: UseWithdrawEmergencySafeParams): WithdrawEmergencySafeResult => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const account = useActiveAccount();
  const address = account?.address || providedAddress; // Use active account address
  // const account = useActiveAccount();
  // const wallet = useWallet(); // Reference to the wallet (e.g., smart account)
  // const { contract } = useContract({ address: coinSafeAddress, abi: coinSafeAbi });
  const { sendTransaction } = useSmartAccountTransactionInterceptorContext();

  const { chain } = useChainConfig();

  const contract = getContract({
    client,
    chain: chain,
    address: coinSafeAddress,
  });

  const withdrawFromEmergencySafe = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      try {
        setIsLoading(true);
        console.log("Starting emergency safe withdrawal process");

        if (!address) {
          try {
            // await connect(async () => ({
            //   chainId: chain.id,
            //   // Assuming a smart wallet setup; adjust based on your configuration
            //   wallet: wallet || { id: "inApp" }, // Fallback to in-app wallet if none specified
            //   client: config.client, // Assuming config.client contains Thirdweb client
            // }));
          } catch (error) {
            toast.error("Error Connecting Wallet");
            console.log("Error", error);
            throw new Error("Failed to connect wallet: " + error);
          }
        }

        if (!amount) {
          toast.error("Please input a value for amount to Withdraw");
          setIsLoading(false);
          return Promise.reject(new Error("No amount specified"));
        }

        if (!token) {
          toast.error("Please select token to Withdraw");
          setIsLoading(false);
          return Promise.reject(new Error("No token selected"));
        }

        if (!contract) {
          throw new Error("Contract not initialized");
        }

        const decimals: number = getTokenDecimals(token);
        console.log(`Using decimals: ${decimals} for token: ${token}`);

        const transaction = prepareContractCall({
          contract,
          method:
            "function withdrawFromEmergencySafe(address _token, uint256 _amount)",
          params: [token, parseUnits(amount.toString(), decimals)],
        });

        console.log("Transaction prepared:", transaction);

        if (account) {
          const result = await sendTransaction(transaction);

          console.log("Transaction sent successfully:", result);

          // Call onSuccess callback
          onSuccess?.();

          return Promise.resolve(result);
        } else {
          throw new Error("No account connected");
        }
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("An unknown error occurred");
        setError(error);
        onError?.(error);
        console.error("Withdraw asset error:", error);
        return Promise.reject(error);
      } finally {
        setIsLoading(false);
      }
    },
    [
      address,
      token,
      amount,
      onSuccess,
      onError,
      toast,
      contract,
      account,
      sendTransaction,
    ],
  );

  return {
    withdrawFromEmergencySafe,
    isLoading: isLoading,
    error,
  };
};
