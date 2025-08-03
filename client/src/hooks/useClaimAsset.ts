import { useCallback, useState } from "react";
import { useActiveAccount, useConnect } from "thirdweb/react";
import { getContract, prepareContractCall } from "thirdweb";
import { client, liskMainnet } from "@/lib/config";
import { Account } from "thirdweb/wallets";
import { toBigInt } from "ethers";
import { useSmartAccountTransactionInterceptorContext } from "./useSmartAccountTransactionInterceptor";

interface UseClaimAssetParams {
  address?: `0x${string}`;
  account: Account | undefined;
  safeId: number;
  token?: `0x${string}`; // Optional for claimAll
  coinSafeAddress: `0x${string}`;
  coinSafeAbi: any;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  toast: (props: { title: string; variant: "default" | "destructive" }) => void;
}

interface ClaimAssetResult {
  claimAsset: (e: React.FormEvent) => Promise<void>;
  claimAllAssets: (e: React.FormEvent) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
}

export const useClaimAsset = ({
  address: providedAddress,
  account,
  safeId,
  token,
  coinSafeAddress,
  coinSafeAbi,
  onSuccess,
  onError,
  toast,
}: UseClaimAssetParams): ClaimAssetResult => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { connect } = useConnect();
  const activeAccount = useActiveAccount();
  const { sendTransaction } = useSmartAccountTransactionInterceptorContext();
  const address = activeAccount?.address || providedAddress;

  // Initialize contract
  const contract = getContract({
    client,
    chain: liskMainnet,
    address: coinSafeAddress,
    abi: coinSafeAbi,
  });

  // Claim a specific token from a safe
  const claimAsset = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setIsLoading(true);

      try {
        if (!address) {
          throw new Error("No wallet address available");
        }

        if (!token) {
          throw new Error(
            "Token address is required for claiming a specific token"
          );
        }

        if (!safeId || safeId <= 0) {
          throw new Error("Invalid safe ID");
        }

        console.log(`Claiming token ${token} from safe #${safeId}`);

        // Prepare the contract call for claim
        const transaction = prepareContractCall({
          contract,
          method:
            "function claim(uint256 _safeId, address _tokenAddress) external",
          params: [toBigInt(safeId), token],
        });

        if (account) {
          await sendTransaction(transaction);
        } else {
          throw new Error("No account connected");
        }

        // Success is handled by the onSuccess callback, which will show SuccessfulTxModal
        onSuccess?.();
      } catch (err) {
        const errorObj =
          err instanceof Error ? err : new Error("An unknown error occurred");
        setError(errorObj);
        onError?.(errorObj);

        // Check for specific error types
        if (errorObj.message.includes("SafeNotMatured")) {
          toast({
            title: "Safe has not matured yet",
            variant: "destructive",
          });
        } else if (errorObj.message.includes("InvalidSafeId")) {
          toast({
            title: "Invalid safe ID",
            variant: "destructive",
          });
        } else if (errorObj.message.includes("ZeroValueNotAllowed")) {
          toast({
            title: "No tokens to claim",
            variant: "destructive",
          });
        } else {
          toast({
            title: `Claim failed: ${errorObj.message}`,
            variant: "destructive",
          });
        }

        console.error("Claim asset error:", errorObj);
      } finally {
        setIsLoading(false);
      }
    },
    [
      address,
      token,
      safeId,
      coinSafeAddress,
      coinSafeAbi,
      onSuccess,
      onError,
      toast,
      connect,
      contract,
      account,
    ]
  );

  // Claim all tokens from a safe
  const claimAllAssets = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setIsLoading(true);

      try {
        if (!address) {
          throw new Error("No wallet address available");
        }

        if (!safeId || safeId <= 0) {
          throw new Error("Invalid safe ID");
        }

        console.log(`Claiming all tokens from safe #${safeId}`);

        // Prepare the contract call for claimAll
        const transaction = prepareContractCall({
          contract,
          method: "function claimAll(uint256 _safeId) external",
          params: [toBigInt(safeId)],
        });

        if (account) {
          await sendTransaction(transaction);
        } else {
          throw new Error("No account connected");
        }

        // Success is handled by the onSuccess callback, which will show SuccessfulTxModal
        onSuccess?.();
      } catch (err) {
        const errorObj =
          err instanceof Error ? err : new Error("An unknown error occurred");
        setError(errorObj);
        onError?.(errorObj);

        // Check for specific error types
        if (errorObj.message.includes("SafeNotMatured")) {
          toast({
            title: "Safe has not matured yet",
            variant: "destructive",
          });
        } else if (errorObj.message.includes("InvalidSafeId")) {
          toast({
            title: "Invalid safe ID",
            variant: "destructive",
          });
        } else {
          toast({
            title: `Claim failed: ${errorObj.message}`,
            variant: "destructive",
          });
        }

        console.error("Claim all assets error:", errorObj);
      } finally {
        setIsLoading(false);
      }
    },
    [
      address,
      safeId,
      coinSafeAddress,
      coinSafeAbi,
      onSuccess,
      onError,
      toast,
      connect,
      contract,
      account,
    ]
  );

  return {
    claimAsset,
    claimAllAssets,
    isLoading,
    error,
  };
};
