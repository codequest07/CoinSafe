import { useCallback } from "react";
import { useSmartAccountTransactionInterceptor } from "./useSmartAccountTransactionInterceptor";
import { getContract, prepareContractCall } from "thirdweb";
import { client, liskMainnet } from "@/lib/config";
import { CoinsafeDiamondContract, facetAbis } from "@/lib/contract";
import { toast } from "sonner";
import { Abi } from "viem";

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

        const claimTx = prepareContractCall({
          contract,
          method:
            "function claim(uint256 _safeId, address _tokenAddress) external",
          params: [BigInt(safeDetails.id), token],
        });

        const { transactionHash } = await sendTransaction(claimTx);

        if (!transactionHash) {
          toast?.error("Claim asset failed");
        }
      } catch (error) {
        console.error("Error claiming token:", error);
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
    ]
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

      const claimAllTx = prepareContractCall({
        contract,
        method: "function claimAll(uint256 _safeId) external",
        params: [BigInt(safeDetails.id)],
      });

      const { transactionHash } = await sendTransaction(claimAllTx);

      if (!transactionHash) {
        toast?.error("Claim all tokens failed");
      }
    } catch (error) {
      console.error("Error claiming all tokens:", error);
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
