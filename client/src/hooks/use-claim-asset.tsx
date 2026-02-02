import { useCallback } from "react";
import { useSmartAccountTransactionInterceptor } from "./useSmartAccountTransactionInterceptor";
import { getContract, prepareContractCall } from "thirdweb";
import { client, liskMainnet } from "@/lib/config";
import { CoinsafeDiamondContract, facetAbis } from "@/lib/contract";
import { toast } from "sonner";
import { Abi } from "viem";
import { getSignedApr, getSignedAprForClaimAll } from "@/lib/apr-api";

type ClaimSingle = (assetId: string) => Promise<void>;
type ClaimAll = () => Promise<void>;

type UseClaimAssetDeps = {
  safeDetails: { id: number | string | bigint };
  setClaiming: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function useClaimAsset({
  safeDetails,
  setClaiming,
}: UseClaimAssetDeps): {
  handleClaimSingle: ClaimSingle;
  handleClaimAll: ClaimAll;
} {
  const { sendTransaction } = useSmartAccountTransactionInterceptor();

  const handleClaimSingle: ClaimSingle = useCallback(
    async (token: string) => {
      setClaiming(true);
      try {
        const contract = getContract({
          client,
          chain: liskMainnet,
          address: CoinsafeDiamondContract.address,
          abi: facetAbis.targetSavingsFacet as Abi,
        });

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
        const claimTx = prepareContractCall({
          contract,
          method:
            "function claim(uint256 _safeId, address _tokenAddress, uint256 _avgAPR, uint256 _aprNonce, bytes memory _aprSignature) external",
          params: [
            BigInt(safeDetails.id),
            token,
            aprData.avgAPR,
            aprData.aprNonce,
            aprData.aprSignature,
          ],
        });

        const { transactionHash } = await sendTransaction(claimTx);

        if (!transactionHash) {
          toast?.error("Claim asset failed");
        }
      } catch (error) {
        console.error("Error claiming token:", error);
        if (
          error instanceof Error &&
          error.message.includes("Failed to fetch signed APR")
        ) {
          toast?.error("Failed to fetch APR data. Please try again.");
        }
      } finally {
        setClaiming(false);
      }
    },
    [
      client,
      safeDetails?.id,
      setClaiming,
      toast,
      facetAbis,
      CoinsafeDiamondContract,
      liskMainnet,
      getContract,
      prepareContractCall,
      sendTransaction,
    ],
  );

  const handleClaimAll: ClaimAll = useCallback(async () => {
    setClaiming(true);
    try {
      const contract = getContract({
        client,
        chain: liskMainnet,
        address: CoinsafeDiamondContract.address,
        abi: facetAbis.targetSavingsFacet as Abi,
      });

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
      const claimAllTx = prepareContractCall({
        contract,
        method:
          "function claimAll(uint256 _safeId, uint256 _avgAPR, uint256 _aprNonce, bytes memory _aprSignature) external",
        params: [
          BigInt(safeDetails.id),
          aprData.avgAPR,
          aprData.aprNonce,
          aprData.aprSignature,
        ],
      });

      const { transactionHash } = await sendTransaction(claimAllTx);

      if (!transactionHash) {
        toast?.error("Claim all tokens failed");
      }
    } catch (error) {
      console.error("Error claiming all tokens:", error);
      if (
        error instanceof Error &&
        error.message.includes("Failed to fetch signed APR")
      ) {
        toast?.error("Failed to fetch APR data. Please try again.");
      }
    } finally {
      setClaiming(false);
    }
  }, [
    client,
    safeDetails?.id,
    setClaiming,
    toast,
    facetAbis,
    CoinsafeDiamondContract,
    liskMainnet,
    getContract,
    prepareContractCall,
    sendTransaction,
  ]);

  return { handleClaimSingle, handleClaimAll };
}
