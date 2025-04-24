import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import MemoAvax from "@/icons/Avax";
import { useGetSafes } from "@/hooks/useGetSafes";
import { tokenData } from "@/lib/utils";
import { Skeleton } from "../ui/skeleton";
import ClaimModal from "./ClaimModal";
import { format } from "date-fns";

export default function ClaimAssets({
  isDepositModalOpen,
  setIsDepositModalOpen,
}: {
  isDepositModalOpen: boolean;
  setIsDepositModalOpen: (open: boolean) => void;
  onBack: () => void;
}) {
  const [selectedSafeId, setSelectedSafeId] = useState<string>("");
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const { safes, isLoading, fetchSafes } = useGetSafes();

  // Convert bigint timestamp to Date object
  const convertTimestampToDate = (timestamp: bigint): Date => {
    // Convert from seconds to milliseconds
    return new Date(Number(timestamp) * 1000);
  };

  // Filter safes that have matured (unlockTime <= current time)
  const maturedSafes = safes.filter((safe) => {
    // Convert the unlockTime to a Date object
    const unlockDate = convertTimestampToDate(safe.unlockTime);
    return (
      unlockDate <= new Date() &&
      safe.tokenAmounts.some((token) => token.amount > 0)
    );
  });

  // Fetch safes when component mounts
  useEffect(() => {
    fetchSafes();
  }, [fetchSafes]);

  const openClaimModal = (safeId: string) => {
    setSelectedSafeId(safeId);
    setIsClaimModalOpen(true);
    setIsDepositModalOpen(false);
  };

  // Calculate USD value for a token amount
  const calculateUsdValue = (amount: any, tokenAddress: string) => {
    // Convert BigInt to number if needed
    const amountAsNumber =
      typeof amount === "bigint" ? Number(amount) : Number(amount);

    const symbol = tokenData[tokenAddress]?.symbol?.toUpperCase() || "";
    const rate =
      symbol === "SAFU"
        ? 0.339
        : symbol === "LSK"
        ? 1.25
        : symbol === "USDT"
        ? 1
        : 0;

    return amountAsNumber * rate;
  };

  // Calculate total USD value for a safe
  const calculateTotalUsdValue = (safe: any) => {
    return safe.tokenAmounts.reduce((total: number, token: any) => {
      // Skip tokens with zero or invalid amounts
      if (!token.amount || token.amount === 0) return total;

      return total + calculateUsdValue(token.amount, token.token);
    }, 0);
  };

  return (
    <Dialog open={isDepositModalOpen} onOpenChange={setIsDepositModalOpen}>
      <DialogContent className="max-w-[390px] sm:max-w-[600px] border-0 text-white bg-[#010104]">
        <DialogTitle className="text-white flex items-center">
          <p>Claim matured assets</p>
        </DialogTitle>

        {isLoading ? (
          // Loading state
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-black border-b border-[#FFFFFF17] p-3 rounded-lg">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-12 w-24" />
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : maturedSafes.length === 0 ? (
          // No matured safes
          <div className="bg-black border-b border-[#FFFFFF17] text-white p-6 rounded-lg text-center">
            <p className="text-gray-400">
              No matured savings available to claim.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Your savings will appear here when they mature.
            </p>
          </div>
        ) : (
          // List of matured safes
          maturedSafes.map((safe, index) => {
            const totalUsdValue = calculateTotalUsdValue(safe);
            const tokenSymbols = safe.tokenAmounts
              .filter((token: any) => token.amount > 0)
              .map((token: any) => tokenData[token.token]?.symbol || "Unknown")
              .join(", ");

            return (
              <div
                key={index}
                className="bg-black border-b border-[#FFFFFF17] text-white p-3 rounded-lg">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <MemoAvax className="w-8 h-8" />
                      <div className="flex flex-col">
                        <span className="font-[400] text-base">
                          {safe.target || "Savings"}
                        </span>
                        <span className="font-[300] text-xs text-gray-400">
                          Matured:{" "}
                          {format(
                            convertTimestampToDate(safe.unlockTime),
                            "dd MMM yyyy"
                          )}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-base font-[500]">
                        {tokenSymbols}
                      </span>
                      <span className="text-xs text-gray-400">
                        ≈ $
                        {totalUsdValue.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                    <Button
                      onClick={() => openClaimModal(safe.id.toString())}
                      variant="link"
                      className="text-[#79E7BA] text-base hover:text-[#79E7BA]">
                      Claim
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </DialogContent>

      {/* Claim Modal */}
      {selectedSafeId && (
        <ClaimModal
          isOpen={isClaimModalOpen}
          onClose={() => {
            setIsClaimModalOpen(false);
            setIsDepositModalOpen(true);
          }}
          safeId={selectedSafeId}
        />
      )}
    </Dialog>
  );
}
