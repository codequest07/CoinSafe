import { AssetTabs } from "@/components/Asset-tabs";
import ClaimCard from "@/components/Cards/ClaimCard";
import SavingsCard from "@/components/Cards/SavingsCard";
import { Button } from "@/components/ui/button";
import { useGetSafeById } from "@/hooks/useGetSafeById";
import { formatDistanceToNow } from "date-fns";
import { ArrowLeft, Badge, Loader2 } from "lucide-react";
// import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// import { useActiveAccount } from "thirdweb/react";

const EmergencySafe = () => {
  const navigate = useNavigate();
  const { safeDetails, isLoading, isError } = useGetSafeById("911");
  console.log("safeDetails", safeDetails);
//   const account = useActiveAccount();
  //   const isConnected = !!account?.address;
  //   const address = account?.address;

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-5xl mx-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-green-400" />
            <span className="ml-2 text-lg">Loading safe details...</span>
          </div>
        ) : isError ? (
          <div className="text-red-500 text-center py-8">
            Error loading safe details. Please try again.
          </div>
        ) : !safeDetails ? (
          <div className="text-white text-center py-8">
            Safe not found.{" "}
            <Button variant="link" onClick={() => navigate(-1)}>
              Go back
            </Button>
          </div>
        ) : (
          <div className="mb-8">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                onClick={() => navigate(-1)}
              >
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
        )}

        {safeDetails && (
          <div className="flex flex-col gap-4 pr-4 pb-2">
            <div className="flex gap-2">
              <SavingsCard
                title="Savings balance"
                value={safeDetails.totalAmountUSD}
                unit="USD"
                text={<>Total value of all tokens in this safe</>}
                safeId={Number(safeDetails.id)}
              />
              {safeDetails.isLocked && (
                <ClaimCard
                  title="Claimable balance"
                  value={
                    safeDetails.unlockTime < new Date()
                      ? safeDetails.totalAmountUSD
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
};

export default EmergencySafe;
