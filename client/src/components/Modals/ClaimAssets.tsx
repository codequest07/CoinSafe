import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import MemoAvax from "@/icons/Avax";
import { useGetSafes } from "@/hooks/useGetSafes";
import { convertTokenAmountToUsd, tokenData } from "@/lib/utils";
import { Skeleton } from "../ui/skeleton";
import ClaimModal from "./ClaimModal";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";

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
  const [usdValues, setUsdValues] = useState<Record<string, number>>({});
  const { safes, isLoading, fetchSafes } = useGetSafes();

  // Convert bigint timestamp to Date object
  const convertTimestampToDate = (timestamp: bigint): Date => {
    // Convert from seconds to milliseconds
    return new Date(Number(timestamp) * 1000);
  };

  // Filter safes that have matured (unlockTime <= current time) and are Target Savings
  const maturedSafes = safes.filter((safe) => {
    // Skip Emergency Safe (id 911n)
    if (safe.id === 911n) {
      console.log("Skipping Emergency Safe with ID 911n");
      return false;
    }

    // Skip safes with invalid or missing unlockTime
    if (!safe.unlockTime) {
      console.log(`Safe ${safe.id} has no unlockTime, skipping`);
      return false;
    }

    // Convert the unlockTime to a Date object
    const unlockDate = convertTimestampToDate(safe.unlockTime);

    // Skip safes with invalid dates (like 1970-01-01)
    const minValidDate = new Date(2020, 0, 1); // Jan 1, 2020
    if (unlockDate < minValidDate) {
      console.log(`Safe ${safe.id} has invalid date: ${unlockDate}, skipping`);
      return false;
    }

    // Check if it's a Target Saving (has a target property)
    const isTargetSaving = safe.target && safe.target !== "Emergency Safe";

    // Check if it has matured and has tokens to claim
    const isMatured = unlockDate <= new Date();
    const hasTokens =
      safe.tokenAmounts && safe.tokenAmounts.some((token) => token.amount > 0);

    console.log(
      `Safe ${
        safe.id
      }: isTargetSaving=${isTargetSaving}, isMatured=${isMatured}, hasTokens=${hasTokens}, unlockDate=${unlockDate.toISOString()}`
    );

    return isTargetSaving && isMatured && hasTokens;
  });

  // Fetch safes when component mounts
  useEffect(() => {
    fetchSafes();
  }, []);

  const openClaimModal = (safeId: string) => {
    // Find the safe by ID
    const safe = safes.find((safe) => safe.id.toString() === safeId);

    if (!safe) {
      console.error(`Safe with ID ${safeId} not found`);
      return;
    }

    // Check if this is an Emergency Safe
    if (safe.id === 911n) {
      // Show a toast notification that Emergency Safe has a different withdrawal process
      toast({
        title: "Emergency Safe",
        description: "Please use the Emergency Safe withdrawal option instead.",
        variant: "destructive",
      });

      // Redirect to Emergency Safe page
      window.location.href = "/emergency-safe";
      return;
    }

    // Skip safes with invalid or missing unlockTime
    if (!safe.unlockTime) {
      console.error(`Safe ${safe.id} has no unlockTime`);
      toast({
        title: "Invalid Safe",
        description: "This safe has no maturity date.",
        variant: "destructive",
      });
      return;
    }

    // Convert the unlockTime to a Date object
    const unlockDate = convertTimestampToDate(safe.unlockTime);

    // Skip safes with invalid dates (like 1970-01-01)
    const minValidDate = new Date(2020, 0, 1); // Jan 1, 2020
    if (unlockDate < minValidDate) {
      console.error(`Safe ${safe.id} has invalid date: ${unlockDate}`);
      toast({
        title: "Invalid Safe",
        description: "This safe has an invalid maturity date.",
        variant: "destructive",
      });
      return;
    }

    // Check if the safe has matured
    const isMatured = unlockDate <= new Date();

    if (!isMatured) {
      // Show a toast notification that the safe hasn't matured yet
      toast({
        title: "Safe not matured",
        description: `This safe will mature on ${format(
          unlockDate,
          "dd MMM yyyy"
        )}`,
        variant: "destructive",
      });
      return;
    }

    // Check if it's a Target Saving
    const isTargetSaving = safe.target && safe.target !== "Emergency Safe";

    if (!isTargetSaving) {
      // Show a toast notification that this is not a target saving
      toast({
        title: "Not a Target Saving",
        description: "Only Target Savings can be claimed this way.",
        variant: "destructive",
      });
      return;
    }

    // Check if the safe has tokens to claim
    const hasTokens =
      safe.tokenAmounts && safe.tokenAmounts.some((token) => token.amount > 0);

    if (!hasTokens) {
      toast({
        title: "No tokens to claim",
        description: "This safe has no tokens available to claim.",
        variant: "destructive",
      });
      return;
    }

    // Proceed with opening the claim modal
    setSelectedSafeId(safeId);
    setIsClaimModalOpen(true);
    setIsDepositModalOpen(false);
  };

  // Calculate total USD value for a safe
  const calculateTotalUsdValue = async (safe: any) => {
    return safe.tokenAmounts.reduce(async (total: number, token: any) => {
      // Skip tokens with zero or invalid amounts
      if (!token.amount || token.amount === 0) return total;

      // Calculate USD value for each token
      const price = await convertTokenAmountToUsd(token.token, token.amount);
      if (!price) return total;
      return total + price;
    }, 0);
  };

  useEffect(() => {
    const fetchUsdValues = async () => {
      const values: Record<string, number> = {};

      for (const safe of maturedSafes) {
        const usdValue = await calculateTotalUsdValue(safe);
        values[safe.id.toString()] = usdValue;
      }

      setUsdValues(values);
    };

    if (maturedSafes.length > 0) {
      fetchUsdValues();
    }
  }, [maturedSafes]);

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
            const totalUsdValue = usdValues[safe.id.toString()] ?? 0;
            const tokenSymbols = safe.tokenAmounts
              .filter((token: any) => token.amount > 0)
              .map((token: any) => tokenData[token.token]?.symbol || "Unknown")
              .join(", ");

            // Check if the safe is matured
            const unlockDate = convertTimestampToDate(safe.unlockTime);
            const isMatured = unlockDate <= new Date();

            // Check if it's a Target Saving
            const isTargetSaving =
              safe.target && safe.target !== "Emergency Safe";

            // Determine if this safe is claimable
            const isClaimable = isMatured && isTargetSaving;

            return (
              <div
                key={index}
                className="bg-black border-b border-[#FFFFFF17] text-white p-3 rounded-lg"
              >
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
                      className={`text-base ${
                        isClaimable
                          ? "text-[#79E7BA] hover:text-[#79E7BA]"
                          : "text-gray-400 cursor-not-allowed"
                      }`}
                      disabled={!isClaimable}
                    >
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
