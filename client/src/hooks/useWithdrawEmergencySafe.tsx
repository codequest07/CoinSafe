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
import { parseUnits } from "ethers";
import { getTokenDecimals } from "@/lib/utils";
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
  onApprove?: () => void;
  onError?: (error: Error) => void;
  toast: (props: { title: string; variant: "default" | "destructive" }) => void;
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
  coinSafeAbi,
  onSuccess,
  onApprove,
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
          return Promise.reject(new Error("No amount specified"));
        }

        if (!token) {
          toast({
            title: "Please select token to Withdraw",
            variant: "destructive",
          });
          setIsLoading(false);
          return Promise.reject(new Error("No token selected"));
        }

        if (!contract) {
          throw new Error("Contract not initialized");
        }

        const decimals: number = getTokenDecimals(token);
        console.log(`Using decimals: ${decimals} for token: ${token}`);

        // Prepare the contract call for withdrawFromPool
        // Call onApprove callback to show the approval modal
        onApprove?.();

        const transaction = prepareContractCall({
          contract,
          method:
            "function withdrawFromEmergencySafe(address _token, uint256 _amount)",
          params: [token, parseUnits(amount.toString(), decimals)],
        });

        console.log("Transaction prepared:", transaction);

        if (account) {
          const result = await sendTransaction({
            transaction,
            account,
          });

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
    withdrawFromEmergencySafe,
    isLoading: isLoading || writeLoading,
    error,
  };
};
