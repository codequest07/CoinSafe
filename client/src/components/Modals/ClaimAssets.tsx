import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import {
  convertTokenAmountToUsd,
  getTokenDecimals,
  tokenData,
} from "@/lib/utils";
import { Skeleton } from "../ui/skeleton";
import { LoaderCircle } from "lucide-react";
import { useSmartAccountTransactionInterceptorContext } from "@/hooks/useSmartAccountTransactionInterceptor";
import { Abi, formatUnits } from "viem";
import { getContract, prepareContractCall } from "thirdweb";
import { client, liskMainnet } from "@/lib/config";
import { CoinsafeDiamondContract, facetAbis } from "@/lib/contract";
import { toast } from "sonner";
import { getSignedApr, getSignedAprForClaimAll } from "@/lib/apr-api";

interface Token {
  token: string;
  amount: bigint;
}

interface SafeDetails {
  id: number;
  tokenAmounts: Token[];
}

export default function ClaimAssets({
  isModalOpen,
  setIsModalOpen,
  safeDetails,
}: {
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  safeDetails: SafeDetails;
}) {
  const [usdValues, setUsdValues] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const { sendTransaction } = useSmartAccountTransactionInterceptorContext();

  useEffect(() => {
    setLoading(true);
    const fetchUsdValues = async () => {
      const values: Record<string, number> = {};

      for (const token of safeDetails.tokenAmounts) {
        const usdValue = await convertTokenAmountToUsd(
          token.token,
          token.amount,
        );
        values[token.token] = usdValue;
      }

      setUsdValues(values);
      setLoading(false);
    };

    fetchUsdValues();
  }, [safeDetails]);

  const handleClaimSingle = async (token: string) => {
    setClaiming(true);
    try {
      const contract = getContract({
        client: client,
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
        toast.error("Claim asset failed");
      }
      toast.success(`Redeemed ${tokenData[token]?.symbol} successfully`);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error claiming token:", error);
      if (
        error instanceof Error &&
        error.message.includes("Failed to fetch signed APR")
      ) {
        toast.error("Failed to fetch APR data. Please try again.");
      }
    } finally {
      setClaiming(false);
    }
  };

  const handleClaimAll = async () => {
    setClaiming(true);
    try {
      const contract = getContract({
        client: client,
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
        toast.error("Claim all tokens failed");
      }
      toast.success("Claimed all tokens successfully");
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error claiming all tokens:", error);
      if (
        error instanceof Error &&
        error.message.includes("Failed to fetch signed APR")
      ) {
        toast.error("Failed to fetch APR data. Please try again.");
      }
    } finally {
      setClaiming(false);
    }
  };

  if (!safeDetails) {
    return (
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-[390px] sm:max-w-[600px] border-0 text-white bg-[#010104]">
          <DialogTitle className="text-white flex items-center">
            Claim matured assets
          </DialogTitle>
          <div className="text-center text-gray-400">
            Unable to load safe details. Please try again later.
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogContent className="w-full max-w-md rounded-xl bg-[#17171C] text-white shadow-lg p-5 border border-white/15">
        <DialogTitle className="text-white flex items-center text-4xl">
          Claim matured assets
        </DialogTitle>

        {loading || !safeDetails ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-black border-b border-[#FFFFFF17] p-3 rounded-lg"
              >
                <div className="flex justify-between items-center">
                  <Skeleton className="h-12 w-24" />
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : safeDetails.tokenAmounts.length === 0 ? (
          <div className="bg-black border-b border-[#FFFFFF17] text-white p-6 rounded-lg text-center">
            <p className="text-gray-400">
              No matured savings available to claim.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Your savings will appear here when they mature.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/20">
            {safeDetails?.tokenAmounts?.map((token: Token, index: number) => (
              <div key={index} className="text-white/80 p-3">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      {tokenData[token.token]?.image ? (
                        <div className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center">
                          <img
                            src={tokenData[token.token]?.image}
                            width={30}
                            height={30}
                            className="w-full h-full"
                          />
                        </div>
                      ) : (
                        <div
                          className={`w-7 h-7 rounded-full ${
                            tokenData[token.token]?.color
                          } flex items-center justify-center font-medium`}
                        >
                          {tokenData[token.token]?.symbol?.charAt(0)}
                        </div>
                      )}
                      <div className="flex flex-col">
                        <p className="font-medium">
                          {tokenData[token.token]?.symbol}
                        </p>
                        <p className="text-xs text-gray-400">
                          {tokenData[token.token]?.chain}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="flex flex-col">
                        <p className="">
                          {formatUnits(
                            token.amount,
                            getTokenDecimals(token.token),
                          )}{" "}
                          {tokenData[token.token]?.symbol}
                        </p>
                      </div>
                      <div className="flex flex-col">
                        <p className="text-sm">
                          {usdValues[token.token] !== undefined
                            ? `≈ $ ${usdValues[token.token].toFixed(2)}`
                            : "Loading..."}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleClaimSingle(token.token)}
                      disabled={claiming}
                      variant="link"
                      className="text-sm text-[#79E7BA] hover:text-[#79E7BA]"
                    >
                      Claim
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="flex justify-between mt-4">
          <Button
            onClick={() => setIsModalOpen(false)}
            className="px-10 rounded-[2rem] sm:w-auto text-[#F1F1F1] bg-[#3F3F3F99] hover:bg-[#3F3F3F99]"
            disabled={claiming}
          >
            Cancel
          </Button>
          <Button
            onClick={handleClaimAll}
            className="text-black px-8 rounded-[2rem]"
            variant="outline"
            disabled={claiming}
          >
            {claiming ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              "Claim all assets"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
