import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import ClaimCard from "./Cards/ClaimCard";
import { AssetTabs } from "./Asset-tabs";
import { Badge } from "./ui/badge";
import SavingsCard from "./Cards/SavingsCard";
import { useGetSafeById } from "@/hooks/useGetSafeById";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function SavingsDetail() {
  const navigate = useNavigate();
  const { id } = useParams();

  const { safeDetails, isLoading: apiLoading, isError } = useGetSafeById(id);
  const [isLoading, setIsLoading] = useState(true);

  // Update loading state when API loading state changes or safeDetails is set
  useEffect(() => {
    if (!apiLoading && (safeDetails !== null || isError)) {
      // Add a small delay to ensure smooth transition
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 500);

      return () => clearTimeout(timer);
    } else {
      setIsLoading(true);
    }
  }, [apiLoading, safeDetails, isError]);

  console.log(
    "safeDetails",
    safeDetails,
    "isLoading",
    isLoading,
    "apiLoading",
    apiLoading
  );

  // Log detailed information about the safe details
  useEffect(() => {
    if (safeDetails) {
      console.log("Safe ID:", safeDetails.id);
      console.log("Target:", safeDetails.target);
      console.log("Is Locked:", safeDetails.isLocked);
      console.log("Token Amounts:", safeDetails.tokenAmounts);
      console.log("Total Amount USD:", safeDetails.totalAmountUSD);

      // Log each token amount in detail
      safeDetails.tokenAmounts.forEach((token, index) => {
        console.log(`Token ${index + 1}:`);
        console.log(`  Symbol: ${token.tokenSymbol}`);
        console.log(`  Amount: ${token.amount}`);
        console.log(`  Formatted Amount: ${token.formattedAmount}`);
      });
    }
  }, [safeDetails]);

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-5xl mx-auto">
        {isLoading ? (
          <div className="space-y-6 p-4">
            {/* Skeleton for the header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-6 w-32" />
              </div>
              <Skeleton className="h-6 w-20" />
            </div>

            {/* Skeleton for the cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-40 w-full rounded-[12px] border-[1px] border-[#FFFFFF17] p-6" />
              <Skeleton className="h-40 w-full rounded-[12px] border-[1px] border-[#FFFFFF17] p-6" />
            </div>

            {/* Skeleton for the tabs */}
            <div className="space-y-4">
              <div className="flex space-x-2">
                <Skeleton className="h-10 w-24 rounded-[12px]" />
                <Skeleton className="h-10 w-24 rounded-[12px]" />
              </div>
              <Skeleton className="h-60 w-full rounded-[12px] border-[1px] border-[#FFFFFF17] p-6" />
            </div>
          </div>
        ) : isError ? (
          <div className="text-red-500 text-center py-8">
            Error loading safe details. Please try again.
          </div>
        ) : safeDetails ? (
          <div className="mb-8">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                onClick={() => navigate(-1)}>
                <ArrowLeft className="h-6 w-6" />
              </Button>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl">{safeDetails.target}</h1>
                <Badge className="bg-[#79E7BA33] inline-block px-2 py-2 rounded-[2rem] text-xs">
                  {safeDetails.isLocked
                    ? safeDetails.unlockTime > new Date()
                      ? `${Math.ceil(
                          (safeDetails.unlockTime.getTime() -
                            new Date().getTime()) /
                            (1000 * 60 * 60 * 24)
                        )} days till unlock`
                      : "Ready to unlock"
                    : "Flexible"}
                </Badge>
              </div>
            </div>
            <p className="text-base my-1 ml-[3.3rem] text-gray-300">
              {safeDetails.isLocked
                ? `Next unlock date: ${safeDetails.nextUnlockDate}`
                : "Withdraw anytime"}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <img
              src="/assets/not-found.gif"
              alt="Safe not found"
              className="w-full max-w-md h-auto mb-6"
            />
            <div className="text-white text-center">
              Safe not found.{" "}
              <Button variant="link" onClick={() => navigate(-1)}>
                Go back
              </Button>
            </div>
          </div>
        )}

        {safeDetails && (
          <div className="flex flex-col gap-4 pr-4 pb-2">
            <div className="flex gap-2">
              <SavingsCard
                title="Savings balance"
                value={safeDetails.totalAmountUSD ?? 0.0}
                unit="USD"
                text={<>Total value of all tokens in this safe</>}
                safeId={Number(safeDetails.id)}
              />
              {safeDetails.isLocked && (
                <ClaimCard
                  title="Claimable balance"
                  value={
                    safeDetails.unlockTime < new Date()
                      ? safeDetails.totalAmountUSD ?? 0.0
                      : 0.0
                  }
                  unit="USD"
                  text={
                    safeDetails.unlockTime < new Date()
                      ? "Available to withdraw now"
                      : `Available in ${formatDistanceToNow(
                          safeDetails.unlockTime
                        )}`
                  }
                />
              )}
            </div>
          </div>
        )}

        {safeDetails && (
          <div className="py-2">
            <AssetTabs safeDetails={safeDetails} />
          </div>
        )}
      </div>
    </div>
  );
}
