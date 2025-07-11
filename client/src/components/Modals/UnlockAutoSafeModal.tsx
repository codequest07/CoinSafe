import { useState, useCallback, useEffect } from "react";
import { getTokenDecimals, tokenData } from "@/lib/utils";
import AmountInput from "../AmountInput";
import { useRecoilState } from "recoil";
import { saveAtom } from "@/store/atoms/save";
import { tokens, CoinsafeDiamondContract, facetAbis } from "@/lib/contract";
import { Button } from "../ui/button";
import { LoaderCircle } from "lucide-react";
import { supportedTokensState } from "@/store/atoms/balance";
import MemoBackIcon from "@/icons/BackIcon";
import { Badge } from "../ui/badge";
import { Dialog, DialogContent, DialogTitle, DialogFooter } from "../ui/dialog";
import { Skeleton } from "../ui/skeleton";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
// import { useGetSafeById } from "@/hooks/useGetSafeById";
import { getContract, readContract } from "thirdweb";
import { Abi, formatEther, formatUnits } from "viem";
import { client, liskSepolia } from "@/lib/config";
import { useWithdrawAutomatedSafe } from "@/hooks/useWithdrawAutomatedSafe";
import { format } from "date-fns";
// import { toast } from "@sonner/toast";
// import { Toast } from "../ui/toast";
import ApproveTxModal from "./ApproveTxModal";
import SuccessfulTxModal from "./SuccessfulTxModal";
import { getTokenPrice } from "@/lib";
import { Account } from "thirdweb/wallets";
import { toast } from "sonner";
import { useAutomatedSafeForUser } from "@/hooks/useGetAutomatedSafe";

interface UnlockModalProps {
  onClose?: () => void;
  onUnlock?: () => void;
  safeId?: string;
  account: Account | undefined;
}

export default function UnlockAutoSafeModal({
  onClose,
  onUnlock,
  // safeId = "1",
  account,
}: UnlockModalProps) {
  // Local state for UI
  const [selectedTokenBalance, setSelectedTokenBalance] = useState(0);
  const [, setDecimals] = useState(1);
  const [breakingFeePercentage, setBreakingFeePercentage] =
    useState<number>(15);
  const [breakingFeeAmount, setBreakingFeeAmount] = useState<number>(0);
  const [breakingFeeUsd, setBreakingFeeUsd] = useState<number>(0);
  const [isLoadingFee, setIsLoadingFee] = useState<boolean>(false);
  const [showApproveTxModal, setShowApproveTxModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [acceptEarlyWithdrawalFee, setAcceptEarlyWithdrawalFee] =
    useState(true);

  // Recoil state
  const [saveState, setSaveState] = useRecoilState(saveAtom);
  const [supportedTokens] = useRecoilState(supportedTokensState);

  console.log("Selected token balance", selectedTokenBalance);

  // Hooks
  //   const { safeDetails, isLoading: isSafeLoading } = useGetSafeById(safeId);
  const { details, isLoading: autoSafeIsLoading } = useAutomatedSafeForUser(
    account?.address as `0x${string}`
  );

  console.log("Details:", details);

  const { withdrawFromSafe, isLoading, error } = useWithdrawAutomatedSafe({
    account,
    token: saveState.token as `0x${string}`,
    amount: saveState.amount,
    acceptEarlyWithdrawalFee,
    coinSafeAddress: CoinsafeDiamondContract.address as `0x${string}`,
    toast,
    onSuccess: () => {
      setShowApproveTxModal(false);
      setShowSuccessModal(true);
      setSaveState((prev) => ({ ...prev, token: "", amount: 0 }));
      if (onUnlock) onUnlock();
    },
    onError: (err) => {
      setShowApproveTxModal(false);
      console.error("Withdrawal error:", err);
    },
  });

  // Fetch breaking fee percentage
  const fetchBreakingFeePercentage = useCallback(async () => {
    try {
      setIsLoadingFee(true);
      const contract = getContract({
        client,
        chain: liskSepolia,
        address: CoinsafeDiamondContract.address,
        abi: facetAbis.automatedSavingsFacet as Abi,
      });

      const feePercentage = await readContract({
        contract,
        method:
          "function getprematureWithdrawFeePercentage() external view returns (uint256)",
        params: [],
      });

      const feePercentageNumber = Number(feePercentage) / 100;
      setBreakingFeePercentage(feePercentageNumber);
      console.log(`Breaking fee percentage: ${feePercentageNumber}%`);
      return feePercentageNumber;
    } catch (error) {
      console.error("Error fetching breaking fee percentage:", error);
      return breakingFeePercentage;
    } finally {
      setIsLoadingFee(false);
    }
  }, [breakingFeePercentage]);

  // Calculate breaking fee
  const calculateBreakingFee = useCallback(async () => {
    if (!saveState.amount || !saveState.token) {
      setBreakingFeeAmount(0);
      setBreakingFeeUsd(0);
      return;
    }

    const feeAmount = (saveState.amount * breakingFeePercentage) / 100;
    setBreakingFeeAmount(feeAmount);

    const tokenSymbol = tokenData[saveState.token]?.symbol?.toUpperCase() || "";
    const usdValue = Number(await getTokenPrice(saveState.token, feeAmount));
    setBreakingFeeUsd(usdValue);

    console.log(
      `Breaking fee: ${feeAmount} ${tokenSymbol} (${breakingFeePercentage}% of ${
        saveState.amount
      }) ≈ $${usdValue.toFixed(2)}`
    );
  }, [saveState.amount, saveState.token, breakingFeePercentage]);

  // Fetch breaking fee percentage on mount
  useEffect(() => {
    fetchBreakingFeePercentage();
  }, [fetchBreakingFeePercentage]);

  // Recalculate breaking fee on amount/token change
  useEffect(() => {
    calculateBreakingFee();
  }, [
    saveState.amount,
    saveState.token,
    breakingFeePercentage,
    calculateBreakingFee,
  ]);

  // Update token balance
  useEffect(() => {
    if (details?.tokenDetails) {
      try {
        const tokenInfo = details.tokenDetails.find(
          (t: any) => t?.token?.toLowerCase() === saveState.token?.toLowerCase()
        );

        console.log("TOKEN INFO", tokenInfo);
        console.log("TYPE OF AMOUNT", typeof tokenInfo.amountSaved);

        if (tokenInfo && typeof tokenInfo.amountSaved === "bigint") {
          setSelectedTokenBalance(Number(tokenInfo.amountSaved));
          console.log(
            `Token ${saveState.token} balance in safe: ${tokenInfo.amount} ${tokenInfo.tokenSymbol}`
          );
        } else {
          setSelectedTokenBalance(0);
          console.log(
            `Token ${saveState.token} not found in safe or has invalid amount`
          );
        }
      } catch (error) {
        console.error("Error processing token info:", error);
        setSelectedTokenBalance(0);
      }
    } else {
      setSelectedTokenBalance(0);
      console.log("Safe details or tokenAmounts not available");
    }
  }, [saveState.token, details]);

  const handleTokenSelect = (value: string) => {
    if (!value) {
      console.error("Token value is null or undefined");
      return;
    }

    if (
      value === tokens.safu ||
      value === tokens.lsk ||
      value === tokens.usdt
    ) {
      setDecimals(18);
    } else if (value == tokens.usdc) {
      setDecimals(6);
    }

    setSaveState((prevState) => ({ ...prevState, token: value }));
  };

  const handleAmountChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const _amount = Number(event.target.value);
      setSaveState((prevState) => ({
        ...prevState,
        amount: _amount,
      }));
    },
    [setSaveState]
  );

  return (
    <>
      <Dialog
        open={true}
        onOpenChange={(open) => {
          if (!open && onClose) onClose();
        }}
      >
        <DialogContent className="sm:max-w-[600px] border-1 border-[#FFFFFF21] text-white bg-[#17171C] max-h-[90vh] overflow-y-auto">
          <DialogTitle className="text-white flex items-center space-x-3">
            <MemoBackIcon className="w-6 h-6 cursor-pointer" />
            <p>Unlock savings</p>
          </DialogTitle>
          <form onSubmit={withdrawFromSafe} className="space-y-2">
            <AmountInput
              amount={
                formatUnits(
                  BigInt(saveState.amount),
                  getTokenDecimals(saveState.token)
                ) || ""
              }
              handleAmountChange={handleAmountChange}
              handleTokenSelect={handleTokenSelect}
              saveState={saveState}
              tokens={tokens}
              selectedTokenBalance={selectedTokenBalance}
              validationErrors={{ token: error?.message }}
              supportedTokens={supportedTokens}
            />
            <div className="flex justify-between items-center mb-6">
              <div className="text-sm text-gray-300">
                Saved balance:{" "}
                <span className="text-gray-400">
                  {formatUnits(
                    BigInt(selectedTokenBalance),
                    getTokenDecimals(saveState.token)
                  )}{" "}
                  {tokenData[saveState.token]?.symbol || ""}
                </span>
              </div>
              <button
                className="text-sm text-[#5b8c7b] hover:text-[#79E7BA] transition-colors"
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (selectedTokenBalance > 0) {
                    const maxAmount = selectedTokenBalance;
                    console.log("Max before all that", maxAmount);
                    // const symbol = tokenData[saveState.token]?.symbol;
                    // if (symbol === "USDT" && maxAmount >= 1000000) {
                    //   maxAmount = maxAmount / 1000000;
                    // }
                    console.log("Max after all that", maxAmount);
                    setSaveState((prev) => ({
                      ...prev,
                      amount: maxAmount,
                    }));
                    console.log(`Setting max amount: ${maxAmount}`);
                  } else {
                    // toast.error("No balance to unlock", {
                    //   description: "You don't have any tokens to unlock in this safe",
                    // });
                    toast.error("No balance to unlock");
                  }
                }}
              >
                Max
              </button>
            </div>
            {autoSafeIsLoading ? (
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
            ) : details ? (
              <>
                <div className="space-y-2">
                  <div className="text-sm text-gray-400">
                    Next free unlock date
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="font-medium">
                      {details.unlockTime > new Date()
                        ? format(details.unlockTime, "dd MMM, yyyy • HH:mm")
                        : "Ready to unlock"}
                    </div>
                    {details.unlockTime > new Date() && (
                      <Badge className="bg-[#2a2a2a] text-white hover:bg-[#2a2a2a] rounded-full text-xs py-1">
                        {Math.ceil(
                          (details.unlockTime.getTime() -
                            new Date().getTime()) /
                            (1000 * 60 * 60 * 24)
                        )}{" "}
                        days left
                      </Badge>
                    )}
                  </div>
                </div>

                {details.unlockTime > new Date() && (
                  <>
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
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="acceptFee"
                        checked={acceptEarlyWithdrawalFee}
                        onCheckedChange={(checked) =>
                          setAcceptEarlyWithdrawalFee(!!checked)
                        }
                      />
                      <Label
                        htmlFor="acceptFee"
                        className="text-sm text-gray-400"
                      >
                        Accept early withdrawal fee
                      </Label>
                    </div>
                  </>
                )}
              </>
            ) : null}
            <DialogFooter>
              <Button
                type="button"
                onClick={() => onClose && onClose()}
                className="bg-[#1E1E1E99] px-8 rounded-[2rem] hover:bg-[#1E1E1E99]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !saveState.amount || !saveState.token}
                className="text-black px-8 rounded-[2rem]"
                variant="outline"
              >
                {isLoading ? (
                  <LoaderCircle className="animate-spin mr-2" />
                ) : (
                  "Unlock savings"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ApproveTxModal
        isOpen={showApproveTxModal || isLoading}
        onClose={() => {
          if (!isLoading) setShowApproveTxModal(false);
        }}
        amount={formatEther(BigInt(saveState.amount))}
        token={tokenData[saveState.token]?.symbol || ""}
        text="To Unlock"
      />

      <SuccessfulTxModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          if (onClose) onClose();
        }}
        transactionType="withdraw"
        amount={formatEther(BigInt(saveState.amount))}
        token={tokenData[saveState.token]?.symbol || ""}
        additionalDetails={{
          subText: "Assets will be available in your wallet.",
        }}
      />
    </>
  );
}
