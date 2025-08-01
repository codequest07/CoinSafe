import { AssetTabs } from "@/components/Asset-tabs";
// import { ExecuteAutomatedSavingsButton } from "@/components/ExecuteAutomatedSavingsButton";
import AddToken from "@/components/Modals/Add-token";
import DeactivateSafeModal from "@/components/Modals/Deactivate-safe-modal";
import ManageAutosavings from "@/components/Modals/Manage-autosavings";
import RemoveTokenModal from "@/components/Modals/Remove-token-modal";
import UnlockAutoSafeModal from "@/components/Modals/UnlockAutoSafeModal";
// import UnlockModal from "@/components/Modals/UnlockModal";
// import WithdrawEmergencySafe from "@/components/Modals/WithdrawEmergencySafe";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useClaimableBalanceAutomatedSafe } from "@/hooks/useClaimableBalanceAutomatedSafe";
import { useClaimAllAutoSafe } from "@/hooks/useClaimAllAutoSafe";
import { useAutomatedSafeForUser } from "@/hooks/useGetAutomatedSafe";
import { useGetAutomatedSavingsDuePlans } from "@/hooks/useGetAutomatedSavingsDuePlans";
import { useGetSafeById } from "@/hooks/useGetSafeById";
import { formatUnits } from "ethers";
import { ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useActiveAccount } from "thirdweb/react";
import { toast } from "sonner";
import { CoinsafeDiamondContract } from "@/lib/contract";
import ExtendSafeModal from "@/components/Modals/extend-safe-modal";
import { convertTokenAmountToUsd, getTokenDecimals } from "@/lib/utils";
import { savingsBalanceState } from "@/store/atoms/balance";
import { useRecoilState } from "recoil";

const AutoSave = () => {
  const navigate = useNavigate();
  const {
    // safeDetails,
    isLoading: apiLoading,
    isError,
    // tokenAmounts,
  } = useGetSafeById("911");
  const account = useActiveAccount();

  const [isLoading, setIsLoading] = useState(true);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showManageAutosavings, setShowManageAutosavings] = useState(false);
  const [showAddTokenModal, setShowAddTokenModal] = useState(false);
  const [showRemoveTokenModal, setShowRemoveTokenModal] = useState(false);
  const [showDeactivateSafeModal, setShowDeactivateSafeModal] = useState(false);
  const [showExtendSafeModal, setShowExtendSafeModal] = useState(false);

  const userAddress = account?.address;

  const {
    balances,
    // isLoading: isBalanceLoading,
    // error,
    // refetch,
  } = useClaimableBalanceAutomatedSafe();
  // console.log("first render balances:", balances);
  // console.log("first render isBalanceLoading:", isBalanceLoading);
  // console.log("first render error:", error);
  // console.log("first render refetch:", refetch);

  // Function to open the autosavings modal
  const openManageAutosavings = () => {
    console.log("Opening manage autosavings modal");
    setShowManageAutosavings(true);
    console.log("showManageAutosavings set to:", true);
  };

  // Functions to handle navigation between modals
  const handleAddToken = () => {
    console.log("handleAddToken called");
    setShowManageAutosavings(false);
    setShowAddTokenModal(true);
    console.log("showAddTokenModal set to:", true);
  };

  const handleRemoveToken = () => {
    console.log("handleRemoveToken called");
    setShowManageAutosavings(false);
    setShowRemoveTokenModal(true);
    console.log("showRemoveTokenModal set to:", true);
  };

  const handleDeactivateSafe = () => {
    console.log("handleDeactivateSafe called");
    setShowManageAutosavings(false);
    setShowDeactivateSafeModal(true);
    console.log("showDeactivateSafeModal set to:", true);
  };

  const handleExtendSafe = () => {
    console.log("handleExtendSafe called");
    setShowManageAutosavings(false);
    setShowExtendSafeModal(true);
    console.log("showExtendSafeModal set to:", true);
  };

  // Function to close all modals
  const closeAllModals = () => {
    console.log("Closing all modals");
    setShowManageAutosavings(false);
    setShowAddTokenModal(false);
    setShowRemoveTokenModal(false);
    setShowDeactivateSafeModal(false);
    setShowExtendSafeModal(false);
  };

  // Function to go back to the main autosavings modal
  const backToManageAutosavings = () => {
    setShowManageAutosavings(true);
    setShowAddTokenModal(false);
    setShowRemoveTokenModal(false);
    setShowDeactivateSafeModal(false);
    setShowExtendSafeModal(false);
  };

  // const { safes, isLoading, isError, fetchSafes } = useGetSafes();
  const {
    details,
    isLoading: autoSafeIsLoading,
    refetch,
  } = useAutomatedSafeForUser(userAddress as `0x${string}`);
  const { duePlanDetails } = useGetAutomatedSavingsDuePlans();
  const [savingsBalance] = useRecoilState(savingsBalanceState);

  const {
    claimAllAutoSafe,
    isLoading: claimAllIsLoading,
    error: claimAllError,
  } = useClaimAllAutoSafe({
    account,
    coinSafeAddress: CoinsafeDiamondContract.address as `0x${string}`,
    toast,
    onSuccess: () => {
      console.log("Successfully claimed autosafe");
    },
    onError: (err) => {
      console.error("claim error:", err);
    },
  });

  const [totalUsdValue, setTotalUsdValue] = useState<string>("0.00");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTotalUsdValue = async () => {
      if (!details?.tokenDetails || details.tokenDetails.length === 0) {
        setTotalUsdValue("0.00");
        setError(null);
        return;
      }

      try {
        // Convert each token's amountSaved to USD and sum
        const usdValues = await Promise.all(
          details.tokenDetails.map(async (item: any) => {
            try {
              const usdValue = await convertTokenAmountToUsd(
                item.token,
                item.amountSaved
              );
              return usdValue;
            } catch (err) {
              console.error(`Error for token ${item.token}:`, err);
              return 0; // Return 0 for failed conversions
            }
          })
        );

        // Sum all USD values
        const totalUsd = usdValues.reduce((sum, value) => sum + value, 0);
        setTotalUsdValue(totalUsd.toFixed(2));
        setError(null);
      } catch (err) {
        console.error("Error converting tokens to USD:", err);
        setTotalUsdValue("0.00");
        setError("Failed to load USD value");
      }
    };

    fetchTotalUsdValue();
  }, [details]);

  // useEffect(() => {
  //   const fetchTotalUsdValue = async () => {
  //     console.log("IN FETCHTOTALUSD", details?.tokenDetails);
  //     if (!details?.tokenDetails) {
  //       setTotalUsdValue("0.00");
  //       setError(null);
  //       return;
  //     }

  //     try {
  //       // Calculate total amountSaved across all tokens
  //       const totalAmountSaved = details.tokenDetails.reduce(
  //         (total: bigint, obj: any) => total + obj.amountSaved,
  //         0n
  //       );

  //       console.log("TOTAL AMOUNT SAVED", totalAmountSaved);

  //       // Assuming the first token's type is representative for conversion
  //       // If tokens have different types, you may need a different approach
  //       const representativeToken = details.tokenDetails[0]?.token;
  //       if (!representativeToken) {
  //         throw new Error("No tokens available for conversion");
  //       }

  //       // Convert the total amount to USD
  //       const usdValue = await convertTokenAmountToUsd(
  //         representativeToken,
  //         totalAmountSaved
  //       );

  //       setTotalUsdValue(usdValue.toFixed(2));
  //       setError(null);
  //     } catch (err) {
  //       console.error("Error converting total to USD:", err);
  //       setTotalUsdValue("0.00");
  //       setError("Failed to load USD value");
  //     }
  //   };

  //   fetchTotalUsdValue();
  // }, [details]);

  useEffect(() => {
    console.log("Claim Error", claimAllError);
  }, [claimAllError]);

  console.log("Due plans details:", duePlanDetails);

  // Update loading state when API loading state changes or details is set
  useEffect(() => {
    if (!apiLoading && (details !== undefined || isError)) {
      // Add a small delay to ensure smooth transition
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 500);

      return () => clearTimeout(timer);
    } else {
      setIsLoading(true);
    }
  }, [apiLoading, details, isError]);

  // Log when modal states change
  useEffect(() => {
    console.log(
      "showManageAutosavings state changed to:",
      showManageAutosavings
    );
  }, [showManageAutosavings]);

  useEffect(() => {
    console.log("showAddTokenModal state changed to:", showAddTokenModal);
  }, [showAddTokenModal]);

  useEffect(() => {
    console.log("showRemoveTokenModal state changed to:", showRemoveTokenModal);
  }, [showRemoveTokenModal]);

  useEffect(() => {
    console.log(
      "showDeactivateSafeModal state changed to:",
      showDeactivateSafeModal
    );
  }, [showDeactivateSafeModal]);

  // Log component lifecycle
  useEffect(() => {
    console.log("AutoSave component mounted");

    return () => {
      console.log("AutoSave component unmounted");
    };
  }, []);

  // const seconds = safeDetails?.duration;
  // const milliseconds = Number(seconds) * 1000;
  // const date = new Date(milliseconds);

  // function formatDuration(milliseconds: any) {
  //   const duration = Number(milliseconds);
  //   if (isNaN(duration)) return "Invalid duration";

  //   const seconds = Math.floor(duration / 1000) % 60;
  //   const minutes = Math.floor(duration / (1000 * 60)) % 60;
  //   const hours = Math.floor(duration / (1000 * 60 * 60)) % 24;
  //   const days = Math.floor(duration / (1000 * 60 * 60 * 24));

  //   const parts = [];
  //   if (days) parts.push(`${days} day${days > 1 ? "s" : ""}`);
  //   if (hours) parts.push(`${hours} hour${hours > 1 ? "s" : ""}`);
  //   if (minutes) parts.push(`${minutes} minute${minutes > 1 ? "s" : ""}`);
  //   if (seconds || !parts.length)
  //     parts.push(`${seconds} second${seconds !== 1 ? "s" : ""}`);

  //   return parts.join(", ");
  // }

  // function formatDate(timestamp: any) {
  //   const ms = Number(timestamp); // Convert BigInt to Number
  //   if (isNaN(ms)) return "Invalid duration";

  //   const now = new Date("2025-05-17T22:55:00+01:00"); // Current date: May 17, 2025, 10:55 PM WAT
  //   const futureDate = new Date(now.getTime() + ms);

  //   return futureDate.toLocaleString("en-US", {
  //     year: "numeric",
  //     month: "long",
  //     day: "numeric",
  //     hour: "numeric",
  //     minute: "2-digit",
  //     second: "2-digit",
  //     hour12: true,
  //   });
  // }

  useEffect(() => {
    refetch();
  }, [savingsBalance]);

  return (
    <div className="min-h-screen bg-black text-white p-2 lg:p-6">
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
        ) : !details && !isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-white text-center">
              Safe not found.{" "}
              <Button variant="link" onClick={() => navigate(-1)}>
                Go back
              </Button>
            </div>
          </div>
        ) : (
          details && (
            <div className="mb-8">
              <div className="flex items-center gap-2 lg:gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  onClick={() => navigate(-1)}
                >
                  <ArrowLeft className="h-6 w-6" />
                </Button>
                <div className="flex items-center gap-2 w-full justify-between">
                  <h1 className="text-base lg:text-2xl">Auto Savings</h1>
                  {/* formattedDate = unlockDate.toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                  }); */}

                  {/* <Badge className="bg-[#79E7BA33] inline-block px-2 py-2 rounded-[2rem] text-xs">
                    <div>{`${details.unlockTime}`}</div>
                  </Badge> */}
                  {/* {Number(details.unlockTime) * 1000 > Date.now()
                      ? `${Math.ceil(
                          (Number(details.unlockTime) * 1000 - Date.now()) /
                            (1000 * 60 * 60 * 24)
                        )} days till unlock`
                      : "Ready to unlock"} */}
                  <div className="bg-[#79E7BA33] inline-block px-2 py-2 rounded-[2rem] text-xs">
                    {Number(details.unlockTime) * 1000 > Date.now()
                      ? `${Math.ceil(
                          (Number(details.unlockTime) * 1000 - Date.now()) /
                            (1000 * 60 * 60 * 24)
                        )} days till unlock`
                      : "Ready to unlock"}
                  </div>
                </div>
              </div>
              {/* <p className="text-base my-1 ml-[3.3rem] text-gray-300">
              {safeDetails.isLocked
                ? `Next unlock date: ${safeDetails.nextUnlockDate}`
                : "Withdraw anytime"}
            </p> */}
            </div>
          )
        )}

        {details && !isLoading && (
          <div className="flex flex-col lg:flex-row gap-4 pr-0 lg:pr-4 pb-2">
            <div className="flex-1 flex  gap-2">
              <div className="border-[1px] border-[#FFFFFF17] rounded-[12px] p-6 w-full">
                <div className="flex justify-between items-center pb-4">
                  <div className="text-[#CACACA] font-light">
                    Savings Balance
                  </div>
                </div>
                <div className="flex flex-col justify-between items-start lg:items-end">
                  <div>
                    <div>
                      <span className="text-[#F1F1F1] pr-2 text-3xl">
                        {/* {Number(
                          formatUnits(
                            details?.tokenDetails?.reduce(
                              (total: any, obj: any) => total + obj.amountSaved,
                              0n
                            ),
                            getTokenDecimals(
                              details?.tokenDetails[0]?.token || ""
                            )
                          )
                        ).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })} */}
                        {totalUsdValue}
                        {error && error}
                      </span>
                      <span className="text-[#CACACA] text-xs">USD</span>
                    </div>
                    <div>
                      <div className="py-2">
                        <p className="text-[#7F7F7F] text-xs">
                          sum of all balances
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setShowWithdrawModal(true)}
                      className="rounded-[100px] px-8 py-[8px] bg-[#3F3F3F99] h-[40px] text-sm text-[#F1F1F1]"
                    >
                      Unlock
                    </button>
                    <button
                      onClick={(e) => {
                        console.log("Manage button clicked");
                        e.stopPropagation(); // Prevent event bubbling
                        openManageAutosavings();
                      }}
                      className="rounded-[100px] px-8 py-[8px] bg-[#FFFFFFE5] h-[40px] text-sm text-[#010104]"
                    >
                      Manage
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 border-[1px] border-[#FFFFFF17] rounded-[12px] p-6 w-full">
              <div className="flex justify-between items-center pb-4">
                <div className="text-[#CACACA] font-light">
                  Claimable Balance
                </div>
              </div>

              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end">
                <div>
                  <div>
                    <span className="text-[#F1F1F1] pr-2 text-3xl">
                      {/* {safeDetails?.totalAmountUSD?.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })} */}
                      {Number(
                        formatUnits(
                          balances?.reduce(
                            (total: any, obj: any) => total + obj?.amount,
                            0n
                          ),
                          balances && balances.length > 0
                            ? getTokenDecimals(balances[0]?.token || "")
                            : 18 // fallback to 18 decimals if no balances
                        )
                      ).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                    <span className="text-[#CACACA] text-xs">USD</span>
                  </div>
                  <div>
                    <div className="py-2">
                      <p className="text-[#7F7F7F] text-xs">
                        Available to withdraw anytime
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={claimAllAutoSafe}
                    className="rounded-[100px] px-8 py-[8px] bg-[#3F3F3F99] h-[40px] text-sm text-[#F1F1F1]"
                    disabled={
                      Number(
                        formatUnits(
                          balances?.reduce(
                            (total: any, obj: any) => total + obj?.amount,
                            0n
                          ),
                          balances && balances.length > 0
                            ? getTokenDecimals(balances[0]?.token || "")
                            : 18 // fallback to 18 decimals if no balances
                        )
                      ) == 0 || claimAllIsLoading
                    }
                  >
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
          details && (
            <div className="py-2">
              <AssetTabs safeDetails={details} isLoading={autoSafeIsLoading} />
            </div>
          )
        )}
      </div>

      {/* <div>
        <div className="flex-1 border-[1px] border-[#FFFFFF17] rounded-[12px] p-6 w-full">
          <div className="flex justify-between items-center pb-4"></div>

          <div className="flex justify-between items-end mb-4">
            <div>
              <div>
                Duration: <span>{formatDuration(details?.duration)}</span>
              </div>

              <div>
                Start Time: <span>{formatDate(details?.startTime)}</span>
              </div>

              <div>
                Unlock Time: <span>{formatDate(details?.unlockTime)}</span>
              </div>
            </div>
          </div>

          {details?.tokenDetails?.map((token: any, idx: number) => (
            <div className="flex justify-between items-end" key={idx}>
              <div>
                <div>
                  Token: <span>{tokenSymbol[token.token]}</span>
                </div>
                <div>
                  Frequency: <span>{formatDuration(token?.frequency)}</span>
                </div>

                <div>
                  Amount Saved:{" "}
                  <span>
                    {Number(
                      formatUnits(
                        token.amountSaved, // Assuming this is in wei
                        18
                      )
                    ).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>

                <div>
                  Amount To Save:{" "}
                  <span>
                    {Number(
                      formatUnits(
                        token.amountToSave, // Assuming this is in wei
                        18
                      )
                    ).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="py-2">
        <div className="flex-1 border-[1px] border-[#FFFFFF17] rounded-[12px] p-6 w-full">
          <div className="flex flex-col justify-between items-center pb-4">
            <div className="text-white font-semibold">Addresses</div>
            {duePlanDetails?.map((plan: any, idx: number) => (
              <div key={idx} className="text-[#CACACA] font-light">
                {plan}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <ExecuteAutomatedSavingsButton />
      </div> */}

      {/* Render the appropriate modal based on state */}
      {(() => {
        console.log(
          "Rendering modal section, showManageAutosavings:",
          showManageAutosavings
        );
        return null;
      })()}

      {showManageAutosavings && (
        <div
          className="modal-container"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
          }}
        >
          {(() => {
            console.log("About to render ManageAutosavings component");
            return null;
          })()}
          <ManageAutosavings
            onClose={closeAllModals}
            onAddToken={handleAddToken}
            onRemoveToken={handleRemoveToken}
            onDeactivateSafe={handleDeactivateSafe}
            onExtendSafe={handleExtendSafe}
          />
        </div>
      )}

      {/* Add Token Modal */}
      {(() => {
        console.log(
          "Rendering AddTokenModal section, showAddTokenModal:",
          showAddTokenModal
        );
        return null;
      })()}

      <AddToken
        details={details}
        open={showAddTokenModal}
        onClose={backToManageAutosavings}
        onSuccess={closeAllModals}
      />

      {/* Remove Token Modal */}
      {(() => {
        console.log(
          "Rendering RemoveTokenModal section, showRemoveTokenModal:",
          showRemoveTokenModal
        );
        return null;
      })()}

      <RemoveTokenModal
        onClose={backToManageAutosavings}
        open={showRemoveTokenModal}
        closeAllModals={closeAllModals}
      />

      {/* Deactivate Safe Modal */}
      {(() => {
        console.log(
          "Rendering DeactivateSafeModal section, showDeactivateSafeModal:",
          showDeactivateSafeModal
        );
        return null;
      })()}

      {showDeactivateSafeModal && (
        <div
          className="modal-container"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
          }}
        >
          {(() => {
            console.log("About to render DeactivateSafeModal component");
            return null;
          })()}
          <DeactivateSafeModal
            // details={details}
            onClose={backToManageAutosavings}
          />
        </div>
      )}

      {/* Extend Safe Modal */}
      {(() => {
        console.log(
          "Rendering ExtendSafeModal section, showExtendSafeModal:",
          showExtendSafeModal
        );
        return null;
      })()}

      {showExtendSafeModal && (
        <div
          className="modal-container"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
          }}
        >
          {(() => {
            console.log("About to render DeactivateSafeModal component");
            return null;
          })()}
          <ExtendSafeModal
            details={details}
            onClose={backToManageAutosavings}
            closeAllModals={closeAllModals}
          />
        </div>
      )}

      {showWithdrawModal && (
        // <WithdrawEmergencySafe
        //   isWithdrawModalOpen={showWithdrawModal}
        //   setIsWithdrawModalOpen={setShowWithdrawModal}
        //   AvailableBalance={tokenAmounts}
        // />
        // <UnlockModal onClose={() => setShowWithdrawModal(false)} />
        <UnlockAutoSafeModal
          account={account}
          onClose={() => setShowWithdrawModal(false)}
        />
      )}
    </div>
  );
};

export default AutoSave;
