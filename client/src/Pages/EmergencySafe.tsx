import { AssetTabs } from "@/components/Asset-tabs";
import TopUpEmergencySafe from "@/components/Modals/TopUpEmegencySafe";
import WithdrawEmergencySafe from "@/components/Modals/WithdrawEmergencySafe";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetSafeById } from "@/hooks/useGetSafeById";
import { ArrowLeft, Badge } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useActiveAccount } from "thirdweb/react";

const EmergencySafe = () => {
  const navigate = useNavigate();
  const {
    safeDetails,
    isLoading: apiLoading,
    isError,
    tokenAmounts,
  } = useGetSafeById("911");
  const account = useActiveAccount();
  const isConnected = !!account?.address;

  const [isLoading, setIsLoading] = useState(true);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

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

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-5xl mx-auto">
        {isLoading ? (
          <div className="mb-8">
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-40" />
                <Skeleton className="h-6 w-32 rounded-full" />
              </div>
            </div>
            <Skeleton className="h-4 w-64 ml-[3.3rem] mt-1" />

            <div className="flex gap-4 pr-4 pb-2 mt-6">
              <div className="flex-1 border-[1px] border-[#FFFFFF17] rounded-[12px] p-6 w-full">
                <div className="flex justify-between items-center pb-4">
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <Skeleton className="h-8 w-40 mb-2" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Skeleton className="h-10 w-24 rounded-full" />
                  </div>
                </div>
              </div>
              <div className="flex-1 border-[1px] border-[#FFFFFF17] rounded-[12px] p-6 w-full">
                <div className="flex justify-between items-center pb-4">
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <Skeleton className="h-8 w-40 mb-2" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Skeleton className="h-10 w-24 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : isError ? (
          <div className="text-red-500 text-center py-8">
            Error loading safe details. Please try again.
          </div>
        ) : !safeDetails && !apiLoading ? (
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
        ) : (
          safeDetails && (
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
          )
        )}

        {safeDetails && !isLoading && (
          <div className="flex gap-4 pr-4 pb-2">
            <div className="flex-1 flex gap-2">
              <div className="border-[1px] border-[#FFFFFF17] rounded-[12px] p-6 w-full">
                <div className="flex justify-between items-center pb-4">
                  <div className="text-[#CACACA] font-light">
                    Savings Balance
                  </div>
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <div>
                      <span className="text-[#F1F1F1] pr-2 text-3xl">
                        {safeDetails?.totalAmountUSD?.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                      <span className="text-[#CACACA] text-xs">USD</span>
                    </div>
                    <div>
                      <div className="pt-2">
                        <p className="text-[#7F7F7F] text-xs">
                          Total value of all tokens in this safe
                        </p>
                      </div>
                    </div>
                  </div>
                  {isConnected && (
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setShowTopUpModal(true)}
                        className="rounded-[100px] px-8 py-[8px] bg-[#FFFFFFE5] h-[40px] text-sm text-[#010104]">
                        Top up
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex-1 border-[1px] border-[#FFFFFF17] rounded-[12px] p-6 w-full">
              <div className="flex justify-between items-center pb-4">
                <div className="text-[#CACACA] font-light">
                  Claimable Balance
                </div>
              </div>

              <div className="flex justify-between items-end">
                <div>
                  <div>
                    <span className="text-[#F1F1F1] pr-2 text-3xl">
                      {safeDetails?.totalAmountUSD?.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                    <span className="text-[#CACACA] text-xs">USD</span>
                  </div>
                  <div>
                    <div className="pt-2">
                      <p className="text-[#7F7F7F] text-xs">
                        Available to withdraw anytime
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowWithdrawModal(true)}
                    className="rounded-[100px] px-8 py-[8px] bg-[#3F3F3F99] h-[40px] text-sm text-[#F1F1F1]">
                    Withdraw
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="py-2 mt-4">
            <Skeleton className="h-10 w-full mb-4" />
            <Skeleton className="h-64 w-full rounded-[12px] border-[1px] border-[#FFFFFF17] p-6" />
          </div>
        ) : (
          safeDetails && (
            <div className="py-2">
              <AssetTabs safeDetails={safeDetails} />
            </div>
          )
        )}
      </div>

      {showTopUpModal && (
        <TopUpEmergencySafe
          onClose={() => setShowTopUpModal(false)}
          onTopUp={() => setShowTopUpModal(false)}
        />
      )}

      {showWithdrawModal && (
        <WithdrawEmergencySafe
          isWithdrawModalOpen={showWithdrawModal}
          setIsWithdrawModalOpen={setShowWithdrawModal}
          AvailableBalance={tokenAmounts}
        />
      )}
    </div>
  );
};

export default EmergencySafe;
