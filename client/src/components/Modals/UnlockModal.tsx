import { useState, useCallback, useEffect } from "react";
import { getTokenDecimals, tokenData } from "@/lib/utils";
import AmountInput from "../AmountInput";
import { useRecoilState } from "recoil";
import { saveAtom } from "@/store/atoms/save";
import { tokens, CoinsafeDiamondContract, facetAbis } from "@/lib/contract";
import { Button } from "../ui/button";
import { LoaderCircle, X } from "lucide-react";
import { unlockStateAtom, UnlockState } from "@/store/atoms/unlock";
import { supportedTokensState } from "@/store/atoms/balance";
import { Badge } from "../ui/badge";
// import { Dialog, DialogContent, DialogFooter, DialogTitle } from "../ui/dialog";

import { Skeleton } from "../ui/skeleton";

import { useGetSafeById } from "@/hooks/useGetSafeById";
import { getContract, readContract } from "thirdweb";
import { Abi } from "viem";
import { client, liskMainnet } from "@/lib/config";
import { useUnlockSafe } from "@/hooks/useUnlockSafe";

import { format } from "date-fns";
import { toast } from "sonner";
import ApproveTxModal from "./ApproveTxModal";
import SuccessfulTxModal from "./SuccessfulTxModal";
import { getTokenPrice } from "@/lib";
import MemoInformationIcon from "@/icons/Information";

interface UnlockModalProps {
  onClose?: () => void;
  onUnlock?: () => void;
  safeId?: string;
}

export default function UnlockModal({
  onClose,
  onUnlock,
  safeId = "1",
}: UnlockModalProps) {
  // Local state for UI
  const [selectedTokenBalance, setSelectedTokenBalance] = useState(0);
  const [, setDecimals] = useState(1);
  const [breakingFeePercentage, setBreakingFeePercentage] =
    useState<number>(15); // Default 15% (1500 basis points)
  const [breakingFeeAmount, setBreakingFeeAmount] = useState<number>(0);
  const [breakingFeeUsd, setBreakingFeeUsd] = useState<number>(0);
  const [isLoadingFee, setIsLoadingFee] = useState<boolean>(false);
  const [showApproveTxModal, setShowApproveTxModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Recoil state
  const [saveState, setSaveState] = useRecoilState(saveAtom);
  const [, setUnlockState] = useRecoilState(unlockStateAtom);
  const [supportedTokens] = useRecoilState(supportedTokensState);

  // Hooks
  const { safeDetails, isLoading: isSafeLoading } = useGetSafeById(safeId);

  // Set up the useUnlockSafe hook
  const { unlockSafe, isPending } = useUnlockSafe({
    coinSafeAddress: CoinsafeDiamondContract.address as `0x${string}`,
    coinSafeAbi: facetAbis.targetSavingsFacet,
    onSuccess: () => {
      // Hide the approval modal and show the success modal
      setShowApproveTxModal(false);
      setShowSuccessModal(true);

      // Call the onUnlock callback if provided
      if (onUnlock) {
        onUnlock();
      }
    },
    onError: (error) => {
      // Hide the approval modal
      setShowApproveTxModal(false);

      // Show error toast
      toast.error(`Error: ${error.message}`);
    },
  });

  // Validation state
  const [validationErrors] = useState<{
    amount?: string;
    token?: string;
  }>({});

  // Fetch the breaking fee percentage from the contract
  const fetchBreakingFeePercentage = useCallback(async () => {
    try {
      setIsLoadingFee(true);
      const contract = getContract({
        client,
        chain: liskMainnet,
        address: CoinsafeDiamondContract.address,
        abi: facetAbis.targetSavingsFacet as Abi,
      });

      // Call the contract method to get the premature withdrawal fee percentage
      const feePercentage = await readContract({
        contract,
        method:
          "function getprematureWithdrawFeePercentage() external view returns (uint256)",
        params: [],
      });

      // Convert from basis points (e.g., 1500 = 15%) to percentage
      const feePercentageNumber = Number(feePercentage) / 100;
      setBreakingFeePercentage(feePercentageNumber);
      console.log(`Breaking fee percentage: ${feePercentageNumber}%`);
      return feePercentageNumber;
    } catch (error) {
      console.error("Error fetching breaking fee percentage:", error);
      // Use default value if there's an error
      return breakingFeePercentage;
    } finally {
      setIsLoadingFee(false);
    }
  }, [breakingFeePercentage]);

  // Calculate the breaking fee based on the amount and token
  const calculateBreakingFee = useCallback(() => {
    const run = async () => {
      if (!saveState.amount || !saveState.token) {
        setBreakingFeeAmount(0);
        setBreakingFeeUsd(0);
        return;
      }

      // Calculate fee amount based on the percentage
      const feeAmount = (saveState.amount * breakingFeePercentage) / 100;
      setBreakingFeeAmount(feeAmount);

      // Example: Fetch real-time rate (simulate async)
      const tokenSymbol =
        tokenData[saveState.token]?.symbol?.toUpperCase() || "";

      const usdValue = Number(await getTokenPrice(saveState.token, feeAmount));
      setBreakingFeeUsd(usdValue);

      console.log(
        `Breaking fee: ${feeAmount} ${tokenSymbol} (${breakingFeePercentage}% of ${
          saveState.amount
        }) ≈ $${usdValue.toFixed(2)}`,
      );
    };

    run(); // call the async function
  }, [saveState.amount, saveState.token, breakingFeePercentage, tokenData]);

  // Fetch breaking fee percentage when component mounts
  useEffect(() => {
    fetchBreakingFeePercentage();
  }, [fetchBreakingFeePercentage]);

  // Recalculate breaking fee when amount or token changes
  useEffect(() => {
    calculateBreakingFee();
  }, [
    saveState.amount,
    saveState.token,
    breakingFeePercentage,
    calculateBreakingFee,
  ]);

  // Initialize unlockState when safe details are loaded
  useEffect(() => {
    if (safeDetails) {
      setUnlockState((prevState) => ({
        ...prevState,
        safeId: Number(safeId),
        acceptEarlyWithdrawalFee: true,
      }));
    }
  }, [safeDetails, safeId, setUnlockState]);

  const handleTokenSelect = (value: string) => {
    if (!value) {
      console.error("Token value is null or undefined");
      return;
    }

    setDecimals(getTokenDecimals(value));

    // Update the token in both states to ensure synchronization
    setSaveState((prevState) => ({ ...prevState, token: value }));
    setUnlockState((prevState: UnlockState) => ({
      ...prevState,
      token: value,
    }));

    // Get the token balance from safeDetails with null checks
    if (safeDetails?.tokenAmounts && Array.isArray(safeDetails.tokenAmounts)) {
      try {
        const tokenInfo = safeDetails.tokenAmounts.find(
          (t) => t?.token?.toLowerCase() === value?.toLowerCase(),
        );

        if (tokenInfo && typeof tokenInfo.amount === "number") {
          setSelectedTokenBalance(Number(tokenInfo.formattedAmount));
          console.log(
            `Token ${value} balance in safe: ${tokenInfo.amount} ${tokenInfo.tokenSymbol}`,
          );
        } else {
          setSelectedTokenBalance(0);
          console.log(`Token ${value} not found in safe or has invalid amount`);
        }
      } catch (error) {
        console.error("Error processing token info:", error);
        setSelectedTokenBalance(0);
      }
    } else {
      setSelectedTokenBalance(0);
      console.log("Safe details or tokenAmounts not available");
    }
  };

  // Handle amount change
  const handleAmountChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const _amount = Number(event.target.value);
      // Update both states to ensure synchronization
      setSaveState((prevState) => ({
        ...prevState,
        amount: _amount,
      }));
      setUnlockState((prevState: UnlockState) => ({
        ...prevState,
        amount: _amount,
      }));
    },
    [setSaveState, setUnlockState],
  );

  const validateAndSyncState = async () => {
    // Validate current states
    console.log("Current states before sync:", {
      saveState: {
        amount: saveState.amount,
        token: saveState.token,
      },
      safeId,
    });

    // Ensure states are properly synchronized
    return new Promise((resolve) => {
      setUnlockState((prevState: UnlockState) => {
        const updatedState: UnlockState = {
          ...prevState,
          safeId: Number(safeId),
          token: saveState.token,
          amount: saveState.amount,
          acceptEarlyWithdrawalFee: true,
        };
        console.log("Synced unlock state:", updatedState);
        resolve(updatedState);
        return updatedState;
      });
    });
  };

  const handleUnlockClick = useCallback(async () => {
    try {
      // Validate input
      if (!saveState.amount || saveState.amount <= 0) {
        toast.error("Please enter a valid amount to unlock");
        return;
      }

      if (!saveState.token) {
        toast.error("Please select a token to unlock");
        return;
      }

      // Ensure states are synchronized before proceeding
      await validateAndSyncState();

      // Call unlockSafe
      await unlockSafe({
        preventDefault: () => {}, // Mock preventDefault method
        target: document.createElement("form"), // Mock target
      } as unknown as React.FormEvent);
    } catch (error) {
      console.error("Unlock process failed:", error);
      toast.error(
        "An error occurred during the unlock process. Please try again.",
      );
    }
  }, [safeId, saveState.amount, saveState.token, setUnlockState, unlockSafe]);

  return (
    <>
      <div className="fixed inset-0 bg-opacity-60 flex items-center justify-center z-50 p-4 sm:p-6 md:p-8 backdrop-blur-sm">
        <div className="fixed inset-0 flex items-center justify-center bg-transparent z-50">
          <div
            className="absolute inset-0 bg-black/80"
            onClick={(e) => {
              e.stopPropagation();
            }}
          ></div>
          <div className="relative w-full max-w-lg rounded-xl bg-[#17171C] text-white shadow-lg p-5 border border-white/15">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-[500]">Unlock savings</h2>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // handleApproval(false);
                  if (onClose) onClose();
                }}
                className="rounded-full p-1 bg-white "
                aria-label="Close"
              >
                <X className="h-4 w-4 text-black" />
              </button>
            </div>

            {safeDetails && safeDetails.unlockTime > new Date() && (
              <div className="bg-[#FFA3481A] p-4 rounded-lg mt-4 flex flex-col items-center justify-center gap-2">
                <MemoInformationIcon className="w-6 h-6" />
                <p className="text-[#FFA448] text-center text-sm">
                  Unlocking this safe before its maturity date will lead to the
                  loss of all accumulated interest and savings reward.
                </p>
              </div>
            )}

            <div className="space-y-2 mt-8">
              <AmountInput
                amount={saveState.amount}
                handleAmountChange={handleAmountChange}
                handleTokenSelect={handleTokenSelect}
                saveState={saveState}
                tokens={tokens}
                selectedTokenBalance={selectedTokenBalance}
                validationErrors={validationErrors}
                supportedTokens={supportedTokens}
              />
            </div>
            <div className="flex justify-between items-center mb-6">
              <div className="text-sm text-gray-300">
                Saved balance:{" "}
                <span className="text-gray-400">
                  {selectedTokenBalance} {tokenData[saveState.token]?.symbol}
                </span>
              </div>
              <button
                className="text-sm text-[#79E7BA] transition-colors"
                onClick={() => {
                  if (selectedTokenBalance > 0) {
                    // Get normalized balance for Max button
                    let maxAmount = selectedTokenBalance;
                    const symbol = tokenData[saveState.token]?.symbol;

                    // If it's USDT and the value is very large, normalize it
                    if (symbol === "USDT" && maxAmount >= 1000000) {
                      maxAmount = maxAmount / 1000000;
                    }

                    // Update both states to ensure synchronization
                    setSaveState((prev) => ({
                      ...prev,
                      amount: maxAmount,
                    }));
                    setUnlockState((prev) => ({
                      ...prev,
                      amount: maxAmount,
                    }));

                    console.log(`Setting max amount: ${maxAmount}`);
                  } else {
                    toast.error("No balance to unlock", {
                      description:
                        "You don't have any tokens to unlock in this safe",
                    });
                  }
                }}
              >
                Max
              </button>
            </div>

            {isSafeLoading ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-6 w-24 rounded-full" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <div className="flex justify-between items-center">
                    <div>
                      <Skeleton className="h-6 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
              </div>
            ) : safeDetails ? (
              <>
                <div className="space-y-2">
                  <div className="text-sm text-gray-400">
                    Next free unlock date
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="font-medium">
                      {safeDetails.unlockTime > new Date()
                        ? format(safeDetails.unlockTime, "dd MMM, yyyy • HH:mm")
                        : "Ready to unlock"}
                    </div>
                    {safeDetails.unlockTime > new Date() && (
                      <Badge className="bg-[#2a2a2a] text-white hover:bg-[#2a2a2a] rounded-full text-xs py-1">
                        {Math.ceil(
                          (safeDetails.unlockTime.getTime() -
                            new Date().getTime()) /
                            (1000 * 60 * 60 * 24),
                        )}{" "}
                        days left
                      </Badge>
                    )}
                  </div>
                </div>

                {safeDetails.unlockTime > new Date() && (
                  <div className="space-y-2">
                    <div className="text-sm text-gray-400">Breaking fee</div>
                    <div className="flex justify-between items-center">
                      <div>
                        {isLoadingFee ? (
                          <Skeleton className="h-6 w-32" />
                        ) : (
                          <div className="font-medium">
                            {breakingFeeAmount.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 6,
                            })}{" "}
                            {tokenData[saveState.token]?.symbol || ""}
                          </div>
                        )}
                        <div className="text-xs text-gray-400">
                          {breakingFeePercentage}% of unlocked amount
                        </div>
                      </div>
                      <div className="text-sm text-gray-400">
                        ≈ $
                        {breakingFeeUsd.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : null}

            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 justify-end gap-3 items-center mt-5 ">
              <Button
                onClick={() => onClose && onClose()}
                className="bg-[#1E1E1E99] px-8 py-3 sm:py-2 rounded-[2rem] hover:bg-[#1E1E1E99] w-full sm:w-auto text-sm sm:text-base"
                type="submit"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUnlockClick}
                className="text-black px-8 py-3 sm:py-2 rounded-[2rem] w-full sm:w-auto text-sm sm:text-base bg-white hover:bg-gray-100"
                variant="outline"
                disabled={isPending || !saveState.amount || !saveState.token}
              >
                {isPending ? (
                  <>
                    <LoaderCircle className="animate-spin mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                    Processing...
                  </>
                ) : (
                  "Unlock savings"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
      {/* Approval Transaction Modal */}
      <ApproveTxModal
        isOpen={showApproveTxModal}
        onClose={() => {
          // If we're not in the middle of a transaction, close the modal
          if (!isPending) {
            setShowApproveTxModal(false);
          }
        }}
        amount={saveState.amount}
        token={tokenData[saveState.token]?.symbol || ""}
        text="To Unlock"
      />

      {/* Success Modal */}
      <SuccessfulTxModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          // Close the main modal when the success modal is closed
          if (onClose) {
            onClose();
          }
        }}
        transactionType="withdraw"
        amount={saveState.amount}
        token={tokenData[saveState.token]?.symbol || ""}
        additionalDetails={{
          subText: "Assets will be available in your wallet.",
        }}
      />
    </>
  );
}
