import { useState, useCallback, useEffect } from "react";
import { tokenData } from "@/lib/utils";
import AmountInput from "../AmountInput";
import { useRecoilState } from "recoil";
import { saveAtom } from "@/store/atoms/save";
import { tokens, CoinsafeDiamondContract, facetAbis } from "@/lib/contract";
import { Button } from "../ui/button";
import { LoaderCircle } from "lucide-react";
import { unlockStateAtom, UnlockState } from "@/store/atoms/unlock";
import { supportedTokensState } from "@/store/atoms/balance";
import MemoBackIcon from "@/icons/BackIcon";
import { Badge } from "../ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "../ui/dialog";

import { Skeleton } from "../ui/skeleton";

import { useGetSafeById } from "@/hooks/useGetSafeById";
import { getContract, readContract } from "thirdweb";
import { Abi } from "viem";
import { client, liskSepolia } from "@/lib/config";
import { useUnlockSafe } from "@/hooks/useUnlockSafe";

import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";
import ApproveTxModal from "./ApproveTxModal";
import SuccessfulTxModal from "./SuccessfulTxModal";

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
      toast({
        title: `Error: ${error.message}`,
        variant: "destructive",
      });
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
        chain: liskSepolia,
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
    if (!saveState.amount || !saveState.token) {
      setBreakingFeeAmount(0);
      setBreakingFeeUsd(0);
      return;
    }

    // Calculate fee amount based on the percentage
    const feeAmount = (saveState.amount * breakingFeePercentage) / 100;
    setBreakingFeeAmount(feeAmount);

    // Calculate USD value based on token rates
    // Simple conversion rates (in a real app, you'd use an API)
    const tokenSymbol = tokenData[saveState.token]?.symbol?.toUpperCase() || "";
    const rate =
      tokenSymbol === "SAFU"
        ? 0.339
        : tokenSymbol === "LSK"
        ? 1.25
        : tokenSymbol === "USDT"
        ? 1
        : 0;

    const usdValue = feeAmount * rate;
    setBreakingFeeUsd(usdValue);

    console.log(
      `Breaking fee: ${feeAmount} ${tokenSymbol} (${breakingFeePercentage}% of ${
        saveState.amount
      }) ≈ $${usdValue.toFixed(2)}`
    );
  }, [saveState.amount, saveState.token, breakingFeePercentage]);

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

    // SAFU & LSK check
    if (value == tokens.safu || value == tokens.lsk) {
      setDecimals(18);
    } else if (value == tokens.usdt) {
      setDecimals(6);
    }

    // Update the token in both states to ensure synchronization
    setSaveState((prevState) => ({ ...prevState, token: value }));
    setUnlockState((prevState: UnlockState) => ({ ...prevState, token: value }));

    // Get the token balance from safeDetails with null checks
    if (safeDetails?.tokenAmounts && Array.isArray(safeDetails.tokenAmounts)) {
      try {
        const tokenInfo = safeDetails.tokenAmounts.find(
          (t) => t?.token?.toLowerCase() === value?.toLowerCase()
        );

        if (tokenInfo && typeof tokenInfo.amount === "number") {
          setSelectedTokenBalance(tokenInfo.amount);
          console.log(
            `Token ${value} balance in safe: ${tokenInfo.amount} ${tokenInfo.tokenSymbol}`
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
    [setSaveState, setUnlockState]
  );

  const validateAndSyncState = async () => {
    // Validate current states
    console.log("Current states before sync:", {
      saveState: {
        amount: saveState.amount,
        token: saveState.token
      },
      safeId
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
        toast({
          title: "Error",
          description: "Please enter a valid amount to unlock",
          variant: "destructive",
        });
        return;
      }

      if (!saveState.token) {
        toast({
          title: "Error",
          description: "Please select a token to unlock",
          variant: "destructive",
        });
        return;
      }

      // Ensure states are synchronized before proceeding
      await validateAndSyncState();
      
      // Show the approval modal
      setShowApproveTxModal(true);

      // Call unlockSafe
      await unlockSafe({
        preventDefault: () => {}, // Mock preventDefault method
        target: document.createElement("form"), // Mock target
      } as unknown as React.FormEvent);
    } catch (error) {
      console.error("Unlock process failed:", error);
      toast({
        title: "Error",
        description: "An error occurred during the unlock process. Please try again.",
        variant: "destructive",
      });
    }
  }, [safeId, saveState.amount, saveState.token, setUnlockState, unlockSafe]);

  return (
    <>
      <Dialog
        open={true}
        onOpenChange={(open) => {
          if (!open && onClose) {
            onClose();
          }
        }}>
        <DialogContent className="sm:max-w-[600px] border-1 border-[#FFFFFF21] text-white bg-[#17171C] max-h-[90vh] overflow-y-auto">
          <DialogTitle className="text-white flex items-center space-x-3">
            <MemoBackIcon className="w-6 h-6 cursor-pointer" />
            <p>Unlock savings</p>
          </DialogTitle>
          <div className="space-y-2">
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
                {(() => {
                  // Normalize the balance display directly here
                  let displayBalance = selectedTokenBalance;
                  const symbol = tokenData[saveState.token]?.symbol;

                  // If it's USDT and the value is very large, normalize it
                  if (symbol === "USDT" && displayBalance >= 1000000) {
                    displayBalance = displayBalance / 1000000;
                  }

                  return displayBalance.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  });
                })()}{" "}
                {tokenData[saveState.token]?.symbol}
              </span>
            </div>
            <button
              className="text-sm text-[#5b8c7b] hover:text-[#79E7BA] transition-colors"
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
                  toast({
                    title: "No balance to unlock",
                    description:
                      "You don't have any tokens to unlock in this safe",
                    variant: "destructive",
                  });
                }
              }}>
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
                          (1000 * 60 * 60 * 24)
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

          <DialogFooter>
            <Button
              onClick={() => onClose && onClose()}
              className="bg-[#1E1E1E99] px-8 rounded-[2rem] hover:bg-[#1E1E1E99]"
              type="submit">
              Cancel
            </Button>
            <div>
              <Button
                onClick={handleUnlockClick}
                className="text-black px-8 rounded-[2rem]"
                variant="outline"
                disabled={isPending || !saveState.amount || !saveState.token}>
                {isPending ? (
                  <LoaderCircle className="animate-spin mr-2" />
                ) : (
                  "Unlock savings"
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
