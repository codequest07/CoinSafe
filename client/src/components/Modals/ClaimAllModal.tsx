import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import {
  convertTokenAmountToUsd,
  getTokenDecimals,
  tokenData,
  getSafeLSKRewards,
} from "@/lib/utils";
import { getLskToUsd } from "@/lib";
import { Skeleton } from "../ui/skeleton";
import { LoaderCircle, X } from "lucide-react";
import { useActiveAccount } from "thirdweb/react";
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

export default function ClaimAllModal({
  isOpen,
  onClose,
  safeDetails,
}: {
  isOpen: boolean;
  onClose: () => void;
  safeDetails: SafeDetails | null;
}) {
  const [usdValues, setUsdValues] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [totalLsk, setTotalLsk] = useState<string | null>(null);
  const [totalLskUsd, setTotalLskUsd] = useState<number | null>(null);
  const account = useActiveAccount();
  const { sendTransaction } = useSmartAccountTransactionInterceptorContext();

  useEffect(() => {
    if (!isOpen || !safeDetails) return;
    setLoading(true);
    const fetchUsdValues = async () => {
      const values: Record<string, number> = {};
      for (const token of safeDetails.tokenAmounts) {
        const usdValue = await convertTokenAmountToUsd(token.token, token.amount);
        values[token.token] = usdValue;
      }
      setUsdValues(values);
      setLoading(false);
    };
    fetchUsdValues();
  }, [isOpen, safeDetails]);

  useEffect(() => {
    if (!isOpen || !safeDetails?.id || !account) return;
    const fetchLskRewards = async () => {
      try {
        const lsk = await getSafeLSKRewards(safeDetails.id.toString(), account);
        setTotalLsk(lsk);
        const usd = await getLskToUsd(Number(lsk));
        setTotalLskUsd(usd);
      } catch {
        setTotalLsk(null);
        setTotalLskUsd(null);
      }
    };
    fetchLskRewards();
  }, [isOpen, safeDetails?.id, account]);

  const handleClaimSingle = async (token: string) => {
    if (!safeDetails) return;
    setClaiming(true);
    try {
      const contract = getContract({
        client,
        chain: liskMainnet,
        address: CoinsafeDiamondContract.address,
        abi: facetAbis.targetSavingsFacet as Abi,
      });
      const aprData = await getSignedApr(token);
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
      if (!transactionHash) toast.error("Claim asset failed");
      else {
        toast.success(`Redeemed ${tokenData[token]?.symbol} successfully`);
        onClose();
      }
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
    if (!safeDetails) return;
    setClaiming(true);
    try {
      const contract = getContract({
        client,
        chain: liskMainnet,
        address: CoinsafeDiamondContract.address,
        abi: facetAbis.targetSavingsFacet as Abi,
      });
      const aprData = await getSignedAprForClaimAll();
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
      if (!transactionHash) toast.error("Claim all tokens failed");
      else {
        toast.success("Claimed all tokens successfully");
        onClose();
      }
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
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-[390px] sm:max-w-[480px] border-0 text-white bg-[#17171C] rounded-xl">
          <h2 className="text-lg font-semibold text-white">Claim all assets</h2>
          <p className="text-gray-400 text-sm">Unable to load safe details. Please try again later.</p>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        size="md"
        noX
        className="max-w-[390px] sm:max-w-[480px] w-full rounded-xl bg-[#17171C] text-white shadow-lg p-0 border border-white/15 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 pb-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">Claim all assets</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 bg-white text-black hover:bg-gray-200 transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable asset list */}
        <div className="max-h-[min(50vh,320px)] overflow-y-auto">
          {loading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 py-3 border-b border-white/10">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <Skeleton className="h-8 w-24" />
                </div>
              ))}
            </div>
          ) : safeDetails.tokenAmounts.length === 0 ? (
            <div className="p-6 text-center text-gray-400 text-sm">
              No matured savings available to claim.
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {safeDetails.tokenAmounts.map((tokenEntry, index) => (
                <div
                  key={`${tokenEntry.token}-${index}`}
                  className="flex items-center gap-3 px-5 py-3"
                >
                  {/* Asset icon */}
                  <div className="flex-shrink-0">
                    {tokenData[tokenEntry.token]?.image ? (
                      <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center bg-white/5">
                        <img
                          src={tokenData[tokenEntry.token]?.image}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center font-semibold text-sm ${
                          tokenData[tokenEntry.token]?.color || "bg-white/10"
                        }`}
                      >
                        {tokenData[tokenEntry.token]?.symbol?.charAt(0) || "?"}
                      </div>
                    )}
                  </div>
                  {/* Asset name + network */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">
                      {tokenData[tokenEntry.token]?.symbol ?? "Unknown"}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {tokenData[tokenEntry.token]?.chain ?? "—"}
                    </p>
                  </div>
                  {/* Amount + USD */}
                  <div className="flex flex-col items-end flex-shrink-0">
                    <p className="font-medium text-white text-sm">
                      {formatUnits(
                        tokenEntry.amount,
                        getTokenDecimals(tokenEntry.token)
                      )}{" "}
                      {tokenData[tokenEntry.token]?.symbol}
                    </p>
                    <p className="text-xs text-gray-400">
                      {usdValues[tokenEntry.token] !== undefined
                        ? `≈ $${usdValues[tokenEntry.token].toFixed(2)}`
                        : "…"}
                    </p>
                  </div>
                  {/* Claim button */}
                  <Button
                    onClick={() => handleClaimSingle(tokenEntry.token)}
                    disabled={claiming}
                    variant="ghost"
                    className="text-[#79E7BA] hover:text-[#79E7BA] hover:bg-[#79E7BA]/10 p-2 h-auto font-medium text-sm"
                  >
                    Claim
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Total rewards from savings */}
        <div className="px-5 py-4 border-t border-white/10 bg-black/20">
          <p className="text-xs text-gray-400 mb-1">Total rewards from savings</p>
          <div className="flex items-center justify-between">
            <span className="font-medium text-white">
              {totalLsk != null
                ? Number(totalLsk).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 5,
                  })
                : "—"}{" "}
              LSK
            </span>
            <span className="font-medium text-white">
              {totalLskUsd != null ? `≈ $${totalLskUsd.toFixed(2)}` : "—"}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-5 pt-0">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 rounded-full h-11 text-gray-200 bg-white/10 border-white/20 hover:bg-white/15"
            disabled={claiming}
          >
            Cancel
          </Button>
          <Button
            onClick={handleClaimAll}
            className="flex-1 rounded-full h-11 bg-gray-900 text-white hover:bg-gray-800 border-0"
            disabled={claiming || safeDetails.tokenAmounts.length === 0}
          >
            {claiming ? (
              <LoaderCircle className="h-5 w-5 animate-spin" />
            ) : (
              "One click claim"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
