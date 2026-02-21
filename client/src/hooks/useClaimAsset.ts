import { useCallback, useState } from "react";
import { useActiveAccount } from "thirdweb/react";
import { getContract, prepareContractCall } from "thirdweb";
import { client } from "@/lib/config";
import { useChainConfig } from "@/hooks/useChainConfig";
import { Account } from "thirdweb/wallets";
import { toBigInt } from "ethers";
import { useSmartAccountTransactionInterceptorContext } from "./useSmartAccountTransactionInterceptor";
import { getSignedApr, getSignedAprForClaimAll } from "@/lib/apr-api";

interface UseClaimAssetParams {
  address?: `0x${string}`;
  account: Account | undefined;
  safeId: number;
  token?: `0x${string}`; // Optional for claimAll
  coinSafeAddress: `0x${string}`;
  coinSafeAbi: any;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  toast: any;
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

  const activeAccount = useActiveAccount();
  const { sendTransaction } = useSmartAccountTransactionInterceptorContext();
  const address = activeAccount?.address || providedAddress;
  const { chain } = useChainConfig();

  // Initialize contract
  const contract = getContract({
    client,
    chain: chain,
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
            "Token address is required for claiming a specific token",
          );
        }

        if (!safeId || safeId <= 0) {
          throw new Error("Invalid safe ID");
        }

        console.log(`Claiming token ${token} from safe #${safeId}`);

        // Fetch signed APR data from the backend
        console.log("Fetching signed APR data for token:", token);
        const aprData = await getSignedApr(token);
        console.log("APR data received:", {
          avgAPR: aprData.avgAPR.toString(),
          aprNonce: aprData.aprNonce.toString(),
          signatureLength: aprData.aprSignature.length,
        });

        // Prepare the contract call for claim with new signature:
        // function claim(uint256 _safeId, address _tokenAddress, uint256 _avgAPR, uint256 _aprNonce, bytes memory _aprSignature) external nonReentrant
        const transaction = prepareContractCall({
          contract,
          method:
            "function claim(uint256 _safeId, address _tokenAddress, uint256 _avgAPR, uint256 _aprNonce, bytes memory _aprSignature) external",
          params: [
            toBigInt(safeId),
            token,
            aprData.avgAPR,
            aprData.aprNonce,
            aprData.aprSignature,
          ],
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
          toast.error("Safe has not matured yet");
        } else if (errorObj.message.includes("InvalidSafeId")) {
          toast.error("Invalid safe ID");
        } else if (errorObj.message.includes("ZeroValueNotAllowed")) {
          toast.error("No tokens to claim");
        } else if (errorObj.message.includes("Failed to fetch signed APR")) {
          toast.error("Failed to fetch APR data. Please try again.");
        } else {
          toast.error(`Claim failed: ${errorObj.message}`);
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
      onSuccess,
      onError,
      toast,
      contract,
      account,
      sendTransaction,
    ],
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

        // Fetch signed APR data for claimAll (no specific token)
        console.log("Fetching signed APR data for claimAll");
        const aprData = await getSignedAprForClaimAll();
        console.log("APR data received for claimAll:", {
          avgAPR: aprData.avgAPR.toString(),
          aprNonce: aprData.aprNonce.toString(),
          signatureLength: aprData.aprSignature.length,
        });

        // Prepare the contract call for claimAll with new signature:
        // function claimAll(uint256 _safeId, uint256 _avgAPR, uint256 _aprNonce, bytes memory _aprSignature) external nonReentrant
        const transaction = prepareContractCall({
          contract,
          method:
            "function claimAll(uint256 _safeId, uint256 _avgAPR, uint256 _aprNonce, bytes memory _aprSignature) external",
          params: [
            toBigInt(safeId),
            aprData.avgAPR,
            aprData.aprNonce,
            aprData.aprSignature,
          ],
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
          toast.error("Safe has not matured yet");
        } else if (errorObj.message.includes("InvalidSafeId")) {
          toast.error("Invalid safe ID");
        } else if (errorObj.message.includes("Failed to fetch signed APR")) {
          toast.error("Failed to fetch APR data. Please try again.");
        } else {
          toast.error(`Claim failed: ${errorObj.message}`);
        }
        console.error("Claim all assets error:", errorObj);
      } finally {
        setIsLoading(false);
      }
    },
    [
      address,
      safeId,
      onSuccess,
      onError,
      toast,
      contract,
      account,
      sendTransaction,
    ],
  );

  return {
    claimAsset,
    claimAllAssets,
    isLoading,
    error,
  };
};
