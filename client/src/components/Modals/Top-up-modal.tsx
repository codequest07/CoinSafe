import type React from "react";
import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRecoilState } from "recoil";
import { saveAtom } from "@/store/atoms/save";
import { tokens, CoinsafeDiamondContract, facetAbis } from "@/lib/contract";
import AmountInput from "../AmountInput";
import { tokenData } from "@/lib/utils";
import { useBalances } from "@/hooks/useBalances";
import { useActiveAccount } from "thirdweb/react";
import { useTopUpSafe } from "@/hooks/useTopUpSafe";
import SuccessfulTxModal from "./SuccessfulTxModal";
import { useGetSafeById } from "@/hooks/useGetSafeById";
import { Skeleton } from "@/components/ui/skeleton";
import { formatUnits } from "viem";
interface TopUpModalProps {
  onClose: () => void;
  onTopUp?: (amount: number, currency: string) => void;
  safeId: number;
}

export default function TopUpModal({
  onClose,
  onTopUp,
  safeId,
}: TopUpModalProps) {
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedTokenBalance, setSelectedTokenBalance] = useState(0);
  const [saveState, setSaveState] = useRecoilState(saveAtom);
  const [, setDecimals] = useState(1);
  const [validationErrors] = useState<{
    amount?: string;
    token?: string;
    duration?: string;
    transactionPercentage?: string;
    frequency?: string;
  }>({});

  // Fetch safe details
  const { safeDetails, isLoading: isSafeLoading } = useGetSafeById(
    safeId.toString()
  );
  const account = useActiveAccount();
  const address = account?.address;

  const { supportedTokens, AvailableBalance } = useBalances(address as string);

  // Set initial token if safe details are available
  useEffect(() => {
    if (
      safeDetails &&
      safeDetails.tokenAmounts.length > 0 &&
      !saveState.token
    ) {
      // Default to the first token in the safe
      const firstToken = safeDetails.tokenAmounts[0];
      setSaveState((prev) => ({
        ...prev,
        token: firstToken.token,
      }));
    }
  }, [safeDetails, saveState.token, setSaveState]);

  const handleTokenSelect = (value: string) => {
    // SAFU & LSK check
    if (value == tokens.safu || value == tokens.lsk) {
      setDecimals(18);
      // USDT check
    } else if (value == tokens.usdt) {
      setDecimals(6);
    }

    setSaveState((prevState) => ({ ...prevState, token: value }));

    // Update selected token balance
    if (AvailableBalance && value) {
      const tokenBalance = (AvailableBalance[value] as bigint) || 0n;
      const decimals =
        value.toLowerCase() === tokens.usdt.toLowerCase() ? 6 : 18;
      setSelectedTokenBalance(Number(formatUnits(tokenBalance, decimals)));
    }
  };

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const _amount = Number(event.target.value);
    setSaveState((prevState) => ({
      ...prevState,
      amount: _amount,
    }));
  };

  // Update selected token balance when token changes or available balance updates
  useEffect(() => {
    if (AvailableBalance && saveState.token) {
      const tokenBalance = (AvailableBalance[saveState.token] as bigint) || 0n;
      const decimals =
        saveState.token.toLowerCase() === tokens.usdt.toLowerCase() ? 6 : 18;
      setSelectedTokenBalance(Number(formatUnits(tokenBalance, decimals)));
    }
  }, [AvailableBalance, saveState.token]);
  // Initialize the topUpSafe hook
  const { topUpSafe, isPending } = useTopUpSafe({
    address: address as `0x${string}`,
    topUpState: {
      id: safeId,
      token: saveState.token,
      amount: saveState.amount,
    },
    coinSafeAddress: CoinsafeDiamondContract.address as `0x${string}`,
    coinSafeAbi: facetAbis.targetSavingsFacet,
    onSuccess: () => {
      setShowSuccessModal(true);
      // If onTopUp is provided, call it as well
      if (onTopUp) {
        onTopUp(saveState.amount, tokenData[saveState.token]?.symbol || "");
      }
    },
    onError: (error) => {
      console.error("Top-up error:", error);
    },
  });

  const handleTopUp = (e: React.FormEvent) => {
    topUpSafe(e);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1A1A1A] rounded-2xl max-w-xl w-full p-8 relative">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-white text-[20px] font-medium">Top up savings</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2  bg-[#FFFFFF] transition-colors">
            <X className="h-5 w-5 text-black" />
          </button>
        </div>

        <div className="mb-6">
          {isSafeLoading ? (
            <div className="py-4">
              <div className="flex justify-between items-center mb-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-5 w-24 rounded-full" />
              </div>
              <Skeleton className="h-4 w-48 mt-1" />
            </div>
          ) : safeDetails ? (
            <>
              <div className="flex justify-between items-center mb-1">
                <h3 className="text-white text-[20px] font-[400]">
                  {safeDetails.target}
                </h3>
                <span className="bg-[#79E7BA33] text-[#F1F1F1] text-sm px-3 py-1 rounded-full">
                  {safeDetails.isLocked
                    ? safeDetails.unlockTime > new Date()
                      ? `${Math.ceil(
                          (safeDetails.unlockTime.getTime() -
                            new Date().getTime()) /
                            (1000 * 60 * 60 * 24)
                        )} days to unlock`
                      : "Ready to unlock"
                    : "Flexible"}
                </span>
              </div>
              <p className="text-[#F1F1F1] text-[14px]">
                {safeDetails.isLocked
                  ? `Next unlock date: ${safeDetails.nextUnlockDate}`
                  : "Withdraw anytime"}
              </p>
            </>
          ) : (
            <div className="text-white text-center py-4">Safe not found</div>
          )}
        </div>
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

        {/* Wallet balance */}
        <>
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-[300] text-gray-300">
              Wallet balance:{" "}
              <span className="text-gray-400">
                {selectedTokenBalance} {tokenData[saveState.token]?.symbol}
              </span>
            </div>
            <Button
              className="text-sm border-none outline-none bg-transparent hover:bg-transparent text-[#79E7BA] cursor-pointer"
              // onClick={() => setAmount(selectedTokenBalance)}
              onClick={() =>
                setSaveState((prev) => ({
                  ...prev,
                  amount: selectedTokenBalance,
                }))
              }>
              Save all
            </Button>
          </div>
        </>

        <div className="flex justify-between my-5">
          <Button
            onClick={onClose}
            className="px-8 py-3 rounded-full bg-[#2A2A2A] text-white font-medium hover:bg-[#333333] border-0">
            Cancel
          </Button>
          <Button
            onClick={handleTopUp}
            disabled={isPending || !saveState.amount || !saveState.token}
            className="px-8 py-3 rounded-full bg-white text-black font-medium hover:bg-gray-200 border-0 disabled:opacity-50 disabled:cursor-not-allowed">
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Top up"
            )}
          </Button>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <SuccessfulTxModal
          onClose={() => {
            setShowSuccessModal(false);
            onClose();
          }}
          transactionType="top-up"
          amount={saveState.amount}
          token={tokenData[saveState.token]?.symbol || ""}
        />
      )}
    </div>
  );
}
