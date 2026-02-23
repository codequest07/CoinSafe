import { useState, useCallback, useEffect, useRef } from "react";
import { tokenData } from "@/lib/utils";

import { useRecoilState } from "recoil";
import { saveAtom } from "@/store/atoms/save";
import { facetAbis } from "@/lib/contract";
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
import { client } from "@/lib/config";
import { useChainConfig } from "@/hooks/useChainConfig";
import { useUnlockSafe } from "@/hooks/useUnlockSafe";

import { format } from "date-fns";
import { toast } from "sonner";
import ApproveTxModal from "./ApproveTxModal";
import SuccessfulTxModal from "./SuccessfulTxModal";
import { getTokenPrice } from "@/lib";
import MemoInformationIcon from "@/icons/Information";
import AmountInput from "../AmountInput";

interface UnlockModalProps {
  onClose?: () => void;
  onUnlock?: () => void;
  safeId?: string;
  initialToken?: string;
}

export default function UnlockModal({
  onClose,
  onUnlock,
  safeId = "1",
  initialToken,
}: UnlockModalProps) {
  // Local state for UI
  const [selectedTokenBalance, setSelectedTokenBalance] = useState(0);
  const [breakingFeePercentage, setBreakingFeePercentage] =
    useState<number>(15);
  const [breakingFeeAmount, setBreakingFeeAmount] = useState<number>(0);
  const [breakingFeeUsd, setBreakingFeeUsd] = useState<number>(0);
  const [isLoadingFee, setIsLoadingFee] = useState<boolean>(false);
  const [showApproveTxModal, setShowApproveTxModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [validationErrors] = useState<{ amount?: string; token?: string }>({});

  // Recoil state
  const [saveState, setSaveState] = useRecoilState(saveAtom);
  const [, setUnlockState] = useRecoilState(unlockStateAtom);
  const [supportedTokens] = useRecoilState(supportedTokensState);

  // Hooks
  const { safeDetails, isLoading: isSafeLoading } = useGetSafeById(safeId);
  const { chain, diamondAddress } = useChainConfig();

  // Set up the useUnlockSafe hook
  const { unlockSafe, isPending } = useUnlockSafe({
    coinSafeAddress: diamondAddress as `0x${string}`,
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

  // Remove duplicate validationErrors block — already declared above
  // Fetch breaking fee once on mount (or when chain/address changes)
  useEffect(() => {
    let cancelled = false;
    const fetchFee = async () => {
      try {
        setIsLoadingFee(true);
        const contract = getContract({
          client,
          chain,
          address: diamondAddress,
          abi: facetAbis.targetSavingsFacet as Abi,
        });
        const raw = await readContract({
          contract,
          method:
            "function getprematureWithdrawFeePercentage() external view returns (uint256)",
          params: [],
        });
        if (!cancelled) setBreakingFeePercentage(Number(raw) / 100);
      } catch {
        // keep default 15%
      } finally {
        if (!cancelled) setIsLoadingFee(false);
      }
    };
    fetchFee();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chain.id, diamondAddress]);

  // Recalculate breaking fee whenever amount, token, or fee % changes
  useEffect(() => {
    if (!saveState.amount || !saveState.token) {
      setBreakingFeeAmount(0);
      setBreakingFeeUsd(0);
      return;
    }
    const feeAmount = (saveState.amount * breakingFeePercentage) / 100;
    setBreakingFeeAmount(feeAmount);
    let cancelled = false;
    getTokenPrice(saveState.token, feeAmount).then((usd) => {
      if (!cancelled) setBreakingFeeUsd(Number(usd));
    });
    return () => {
      cancelled = true;
    };
  }, [saveState.amount, saveState.token, breakingFeePercentage]);

  // Ref to ensure we only auto-select the default token once (prevents infinite loop)
  const tokenInitializedRef = useRef(false);
  // Mirror of the current token as a ref — so effects can read it without becoming reactive to it
  const currentTokenRef = useRef<string>(initialToken ?? "");

  // Sync token refs when handleTokenSelect runs (called imperatively, not from an effect)
  // currentTokenRef will be kept up to date by handleTokenSelect below.

  // One-time effect: seed token from initialToken prop on mount, then sync balance when safeDetails loads.
  // Only depends on `safeDetails` — never on saveState.token — to avoid write→read loops.
  useEffect(() => {
    // Step 1: If we have an initialToken and haven't initialized yet, seed Recoil state
    if (!tokenInitializedRef.current && initialToken) {
      tokenInitializedRef.current = true;
      currentTokenRef.current = initialToken;
      setSaveState((prev) => ({ ...prev, token: initialToken }));
      // Also seed safeId immediately so unlockSafe's closure captures it before the user clicks
      setUnlockState((prev: UnlockState) => ({
        ...prev,
        token: initialToken,
        safeId: Number(safeId),
        acceptEarlyWithdrawalFee: true,
      }));
    }

    // Step 2: Sync balance for current token once safeDetails is available
    if (!safeDetails?.tokenAmounts || !Array.isArray(safeDetails.tokenAmounts))
      return;

    const tokenAmounts = safeDetails.tokenAmounts;
    const currentToken = currentTokenRef.current?.toLowerCase();

    if (currentToken) {
      const tokenInfo = tokenAmounts.find(
        (t) => t?.token?.toLowerCase() === currentToken,
      );
      if (tokenInfo != null && typeof tokenInfo.amount === "number") {
        setSelectedTokenBalance(Number(tokenInfo.formattedAmount));
      } else {
        setSelectedTokenBalance(0);
      }
      return;
    }

    // Step 3: No token yet — pick the first token in the safe (only once)
    if (tokenInitializedRef.current) return;
    const first = tokenAmounts[0];
    if (first?.token) {
      tokenInitializedRef.current = true;
      currentTokenRef.current = first.token;
      setSelectedTokenBalance(Number(first.formattedAmount));
      setSaveState((prev) => ({ ...prev, token: first.token }));
      setUnlockState((prev: UnlockState) => ({
        ...prev,
        token: first.token,
        safeId: Number(safeId),
        acceptEarlyWithdrawalFee: true,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeDetails]);

  const handleTokenSelect = (value: string) => {
    if (!value) return;
    currentTokenRef.current = value;
    setSaveState((prev) => ({ ...prev, token: value }));
    // Keep safeId in sync whenever token changes
    setUnlockState((prev: UnlockState) => ({
      ...prev,
      token: value,
      safeId: Number(safeId),
      acceptEarlyWithdrawalFee: true,
    }));
    const tokenInfo = safeDetails?.tokenAmounts?.find(
      (t) => t?.token?.toLowerCase() === value.toLowerCase(),
    );
    setSelectedTokenBalance(
      tokenInfo && typeof tokenInfo.amount === "number"
        ? Number(tokenInfo.formattedAmount)
        : 0,
    );
  };

  // Handle amount change
  const handleAmountChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const amount = Number(event.target.value);
      setSaveState((prev) => ({ ...prev, amount }));
      setUnlockState((prev: UnlockState) => ({ ...prev, amount }));
    },
    [setSaveState, setUnlockState],
  );

  // Sync unlock atom before submitting
  const validateAndSyncState = useCallback(() => {
    setUnlockState((prev: UnlockState) => ({
      ...prev,
      safeId: Number(safeId),
      token: saveState.token,
      amount: saveState.amount,
      acceptEarlyWithdrawalFee: true,
    }));
  }, [saveState.amount, saveState.token, safeId, setUnlockState]);

  const handleUnlockClick = useCallback(async () => {
    if (!saveState.amount || saveState.amount <= 0) {
      toast.error("Please enter a valid amount to unlock");
      return;
    }
    if (!saveState.token) {
      toast.error("Please select a token to unlock");
      return;
    }
    try {
      validateAndSyncState();
      await unlockSafe(
        {
          preventDefault: () => {},
          target: document.createElement("form"),
        } as unknown as React.FormEvent,
        {
          safeId: Number(safeId),
          token: saveState.token,
          amount: saveState.amount,
          acceptEarlyWithdrawalFee: true,
        },
      );
    } catch (error) {
      console.error("Unlock process failed:", error);
      toast.error(
        "An error occurred during the unlock process. Please try again.",
      );
    }
  }, [
    saveState.amount,
    saveState.token,
    safeId,
    validateAndSyncState,
    unlockSafe,
  ]);

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
                selectedTokenBalance={selectedTokenBalance}
                validationErrors={validationErrors}
                supportedTokens={supportedTokens}
              />
            </div>
            <div className="flex justify-between items-center mb-6">
              <div className="text-sm text-gray-300">
                Saved balance:{" "}
                <span className="text-gray-400">
                  {selectedTokenBalance} {tokenData[saveState?.token?.toLowerCase()]?.symbol}
                </span>
              </div>
              <button
                className="text-sm text-[#79E7BA] transition-colors"
                onClick={() => {
                  if (selectedTokenBalance > 0) {
                    // Get normalized balance for Max button
                    let maxAmount = selectedTokenBalance;
                    const symbol = tokenData[saveState?.token?.toLowerCase()]?.symbol;

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
                            {tokenData[saveState?.token?.toLowerCase()]?.symbol || ""}
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
        token={tokenData[saveState?.token?.toLowerCase()]?.symbol || ""}
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
        token={tokenData[saveState?.token?.toLowerCase()]?.symbol || ""}
        additionalDetails={{
          subText: "Assets will be available in your wallet.",
        }}
      />
    </>
  );
}
