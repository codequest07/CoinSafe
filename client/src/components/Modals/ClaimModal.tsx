import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LoaderCircle } from "lucide-react";
import { useActiveAccount } from "thirdweb/react";
import { useClaimAsset } from "@/hooks/useClaimAsset";
import { CoinsafeDiamondContract, facetAbis } from "@/lib/contract";
import { toast } from "@/hooks/use-toast";
import { convertTokenAmountToUsd, tokenData } from "@/lib/utils";
import MemoBackIcon from "@/icons/BackIcon";
import ApproveTxModal from "./ApproveTxModal";
import SuccessfulTxModal from "./SuccessfulTxModal";
import { useGetSafeById } from "@/hooks/useGetSafeById";
import { Skeleton } from "../ui/skeleton";

interface ClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  safeId: string;
  tokenAddress?: string; // Optional - if provided, claim specific token, otherwise claim all
}

export default function ClaimModal({
  isOpen,
  onClose,
  safeId,
  tokenAddress,
}: ClaimModalProps) {
  // State
  const [showApproveTxModal, setShowApproveTxModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [totalUsdValue, setTotalUsdValue] = useState(0);
  const [totalUsdValues, setTotalUsdValues] = useState<number[]>([]);
  const [selectedToken, setSelectedToken] = useState<string | undefined>(
    tokenAddress
  );
  const [claimableTokens, setClaimableTokens] = useState<
    Array<{ token: string; amount: number; symbol: string }>
  >([]);

  // Hooks
  const account = useActiveAccount();
  const { safeDetails, isLoading: isSafeLoading } = useGetSafeById(safeId);

  // Determine if this is a target saving
  const isTargetSaving =
    safeDetails?.target && safeDetails.target !== "Emergency Safe";

  // Set up the useClaimAsset hook
  const { claimAsset, claimAllAssets, isLoading } = useClaimAsset({
    account,
    safeId: Number(safeId),
    token: selectedToken as `0x${string}`,
    coinSafeAddress: CoinsafeDiamondContract.address as `0x${string}`,
    // Use the correct ABI based on the safe type
    coinSafeAbi: isTargetSaving
      ? facetAbis.targetSavingsFacet
      : facetAbis.emergencySavingsFacet,
    onSuccess: () => {
      // Hide the approval modal and show the success modal
      setShowApproveTxModal(false);
      setShowSuccessModal(true);
    },
    onError: (error) => {
      // Hide the approval modal
      setShowApproveTxModal(false);

      // Show error toast
      toast({
        title: `Error: ${error.message}`,
        variant: "destructive",
      });
    },
    toast,
  });

  // Load claimable tokens when safe details are available
  useEffect(() => {
    if (safeDetails && safeDetails.tokenAmounts) {
      const tokens = safeDetails.tokenAmounts
        .filter((token) => {
          // Convert BigInt to number if needed for comparison
          const amount =
            typeof token.amount === "bigint"
              ? Number(token.amount)
              : Number(token.amount);
          return amount > 0;
        })
        .map((token) => ({
          token: token.token,
          // Convert BigInt to number if needed
          amount:
            typeof token.amount === "bigint"
              ? Number(token.amount)
              : Number(token.amount),
          symbol: tokenData[token.token]?.symbol || "Unknown",
        }));

      setClaimableTokens(tokens);

      // If no token is selected and we have tokens, select the first one
      if (!selectedToken && tokens.length > 0) {
        setSelectedToken(tokens[0].token);
      }
    }
  }, [safeDetails, selectedToken]);

  // Check if the safe is matured
  const isSafeMatured = safeDetails
    ? BigInt(Math.floor(Date.now() / 1000)) >=
      BigInt(Math.floor(safeDetails.unlockTime.getTime() / 1000))
    : false;

  // Handle claim button click
  const handleClaim = async () => {
    // Check if this is an Emergency Safe
    if (safeDetails?.id?.toString() === "911") {
      toast({
        title: "Emergency Safe",
        description: "Please use the Emergency Safe withdrawal option instead.",
        variant: "destructive",
      });

      // Redirect to Emergency Safe page
      window.location.href = "/emergency-safe";
      return;
    }

    // For Target Savings, check if it's matured
    if (!isSafeMatured) {
      toast({
        title: "Safe has not matured yet",
        description: "You cannot claim tokens from a safe that hasn't matured.",
        variant: "destructive",
      });
      return;
    }

    // Check if this is a target saving
    if (!isTargetSaving) {
      toast({
        title: "Not a Target Saving",
        description:
          "This safe is not a target saving and cannot be claimed this way.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Show the approval modal
      setShowApproveTxModal(true);

      // If a specific token is selected, claim that token, otherwise claim all
      if (selectedToken) {
        await claimAsset({
          preventDefault: () => {},
          target: document.createElement("form"),
        } as unknown as React.FormEvent);
      } else {
        await claimAllAssets({
          preventDefault: () => {},
          target: document.createElement("form"),
        } as unknown as React.FormEvent);
      }
    } catch (error) {
      console.error("Claim process failed:", error);
      toast({
        title: "Error",
        description:
          "An error occurred during the claim process. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Calculate total claimable amount in USD
  const calculateTotalUsdValue = async () => {
    let total = 0;
    for (const token of claimableTokens) {
      if (!token.amount || token.amount === 0) continue;
      const price = await convertTokenAmountToUsd(
        token.token,
        BigInt(token.amount)
      );
      if (!price) continue;
      setTotalUsdValues((prev) => {
        const newValues = [...prev];
        newValues[claimableTokens.indexOf(token)] = price;
        return newValues;
      });
      total += price;
    }
    return total;
  };

  useEffect(() => {
    const fetchTotalValue = async () => {
      const totalValue = await calculateTotalUsdValue();
      setTotalUsdValue(totalValue);
    };

    // Fetch total value when claimable tokens change
    fetchTotalValue();
  }, [claimableTokens]);

  // Get the selected token details
  const selectedTokenDetails = claimableTokens.find(
    (t) => t.token === selectedToken
  );

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px] border-1 border-[#FFFFFF21] text-white bg-[#17171C] max-h-[90vh] overflow-y-auto">
          <DialogTitle className="text-white flex items-center space-x-3">
            <MemoBackIcon
              className="w-6 h-6 cursor-pointer"
              onClick={onClose}
            />
            <p>Claim matured savings</p>
          </DialogTitle>

          {isSafeLoading ? (
            <div className="space-y-4 p-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : (
            <div className="p-4">
              {!isSafeMatured ? (
                <div className="bg-amber-900/20 text-amber-400 p-4 rounded-lg mb-4">
                  This safe has not matured yet. You can only claim tokens after
                  the maturity date.
                </div>
              ) : safeDetails?.id?.toString() === "911" ? (
                <div className="bg-red-900/20 text-red-400 p-4 rounded-lg mb-4">
                  This is an Emergency Safe. Please use the Emergency Safe
                  withdrawal option instead.
                </div>
              ) : !isTargetSaving ? (
                <div className="bg-red-900/20 text-red-400 p-4 rounded-lg mb-4">
                  This safe is not a Target Saving and cannot be claimed this
                  way.
                </div>
              ) : claimableTokens.length === 0 ? (
                <div className="bg-gray-800/20 text-gray-400 p-4 rounded-lg mb-4">
                  No tokens available to claim from this safe.
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-2">
                      Claimable Tokens
                    </h3>
                    <div className="space-y-3">
                      {claimableTokens.map((token, index) => (
                        <div
                          key={index}
                          className={`p-3 rounded-lg border ${
                            selectedToken === token.token
                              ? "border-green-500"
                              : "border-gray-700"
                          } cursor-pointer`}
                          onClick={() => setSelectedToken(token.token)}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium">{token.symbol}</div>
                              <div className="text-sm text-gray-400">
                                {Number(token.amount).toLocaleString(
                                  undefined,
                                  {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 6,
                                  }
                                )}
                              </div>
                            </div>
                            <div className="text-sm text-gray-400">
                              ≈ $
                              {totalUsdValues[index].toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center mb-4">
                    <div className="text-sm text-gray-400">Total value</div>
                    <div className="font-medium">
                      ≈ $
                      {totalUsdValue.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm text-gray-400">Claim method</div>
                    <div className="flex space-x-2">
                      <Button
                        variant={selectedToken ? "outline" : "default"}
                        size="sm"
                        className={`rounded-full ${
                          !selectedToken
                            ? "bg-green-600 hover:bg-green-700"
                            : "bg-transparent"
                        }`}
                        onClick={() => setSelectedToken(undefined)}
                      >
                        Claim all
                      </Button>
                      <Button
                        variant={selectedToken ? "default" : "outline"}
                        size="sm"
                        className={`rounded-full ${
                          selectedToken
                            ? "bg-green-600 hover:bg-green-700"
                            : "bg-transparent"
                        }`}
                        onClick={() => {
                          if (claimableTokens.length > 0 && !selectedToken) {
                            setSelectedToken(claimableTokens[0].token);
                          }
                        }}
                      >
                        Claim specific
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              onClick={onClose}
              className="bg-[#1E1E1E99] px-8 rounded-[2rem] hover:bg-[#1E1E1E99]"
              type="button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleClaim}
              className="text-black px-8 rounded-[2rem]"
              variant="outline"
              disabled={
                isLoading ||
                !isSafeMatured ||
                claimableTokens.length === 0 ||
                safeDetails?.id?.toString() === "911" ||
                !isTargetSaving
              }
            >
              {isLoading ? (
                <LoaderCircle className="animate-spin mr-2" />
              ) : (
                "Claim"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approval Transaction Modal */}
      <ApproveTxModal
        isOpen={showApproveTxModal}
        onClose={() => {
          if (!isLoading) {
            setShowApproveTxModal(false);
          }
        }}
        amount={selectedTokenDetails?.amount || 0}
        token={selectedTokenDetails?.symbol || "tokens"}
        text={selectedToken ? "To Claim" : "To Claim All"}
      />

      {/* Success Modal */}
      <SuccessfulTxModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          onClose();
        }}
        transactionType="claim"
        amount={selectedTokenDetails?.amount || 0}
        token={selectedTokenDetails?.symbol || "tokens"}
        additionalDetails={{
          subText: "Assets will be available in your wallet.",
        }}
      />
    </>
  );
}
