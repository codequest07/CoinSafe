import React, { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { addDays, differenceInDays, format, startOfDay } from "date-fns";
import { useExtendSavingsTarget } from "@/hooks/useExtendSavingsTarget";
import { useRecoilState } from "recoil";
import { saveAtom } from "@/store/atoms/save";
import { DurationSelector } from "../DurationSelector";
import { FormattedSafeDetails } from "@/hooks/useGetSafeById";
import AmountInput from "../AmountInput";
import { tokens } from "@/lib/contract";
import { formatUnits } from "viem";
import {
  convertTokenAmountToUsd,
  getTokenDecimals,
  tokenData,
} from "@/lib/utils";
import { balancesState, supportedTokensState } from "@/store/atoms/balance";
import { useReactivateSavingsTarget } from "@/hooks/useReactivateSafe";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "../ui/skeleton";

type ModalType = "with-tokens" | "with-top-up";

type ReactivateModalProps = {
  type: ModalType;
  isOpen: boolean;
  safeId: string;
  details?: FormattedSafeDetails | null | undefined;
  onClose: () => void;
};

const ReactivateModal: React.FC<ReactivateModalProps> = ({
  type,
  isOpen,
  onClose,
  safeId,
  details,
}) => {
  if (!isOpen) return null;

  const [saveState, setSaveState] = useRecoilState(saveAtom);
  const navigate = useNavigate();

  //   Duration state
  const [savingsDuration, setSavingsDuration] = useState(30);
  const [totalUsdValues, setTotalUsdValues] = useState<number[]>([]);

  const [endDate, setEndDate] = useState("");
  const [, setUnlockDate] = useState<Date | null>(null);

  const [isDurationDisabled] = useState(false);

  // Custom date state
  const [customDate, setCustomDate] = useState<Date | undefined>(undefined);
  const [isCustomSelected, setIsCustomSelected] = useState(false);
  const today = startOfDay(new Date());
  const [selectedTokenBalance, setSelectedTokenBalance] = useState(0);
  const [, setDecimals] = useState(1);

  const [balances] = useRecoilState(balancesState);
  const AvailableBalance = useMemo(() => balances?.available || {}, [balances]);
  const [supportedTokens] = useRecoilState(supportedTokensState);

  // Set initial token if safe details are available
  useEffect(() => {
    if (details && details.tokenAmounts.length > 0 && !saveState.token) {
      // Default to the first token in the safe
      const firstToken = details.tokenAmounts[0];
      setSaveState((prev) => ({
        ...prev,
        token: firstToken.token,
      }));
    }
  }, [details, saveState.token, setSaveState]);

  const handleTokenSelect = (value: string) => {
    // SAFU & LSK check
    setDecimals(getTokenDecimals(value));

    setSaveState((prevState) => ({ ...prevState, token: value }));

    // Update selected token balance
    if (AvailableBalance && value) {
      const tokenBalance = (AvailableBalance[value] as bigint) || 0n;
      const decimals =
        value.toLowerCase() === tokens.usdc.toLowerCase() ? 6 : 18;
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
        saveState.token.toLowerCase() === tokens.usdc.toLowerCase() ? 6 : 18;
      setSelectedTokenBalance(Number(formatUnits(tokenBalance, decimals)));
    }
  }, [AvailableBalance, saveState.token]);
  // Handle custom date selection
  const handleCustomDateSelect = (date: Date | undefined) => {
    if (!date) return;

    setCustomDate(date);
    setIsCustomSelected(true);

    const daysDiff = differenceInDays(date, today);
    setSavingsDuration(daysDiff);
    setEndDate(format(date, "dd MMMM yyyy"));
    setUnlockDate(date);

    const durationInSeconds = daysDiff * 24 * 60 * 60;
    setSaveState((prevState) => ({
      ...prevState,
      duration: durationInSeconds,
    }));
  };

  const { extendTargetSafe, isLoading: extending } = useExtendSavingsTarget({
    // address: account?.address as `0x${string}`,
    safeId: Number(safeId),
    saveState,
    onSuccess: () => {
      // closeAllModals();
      console.log("Successful extension");
    },
    onError: (error) => {
      console.error("Extend Safe failed:", error);
      // Handle error, e.g., show a toast notification
    },
  });

  const { reactivateTargetSafe, isLoading: reactivating } =
    useReactivateSavingsTarget({
      // address: account?.address as `0x${string}`,
      safeId: Number(safeId),
      saveState,
      onSuccess: () => {
        // closeAllModals();
        console.log("Successful extension");
      },
      onError: (error) => {
        console.error("Extend Safe failed:", error);
        // Handle error, e.g., show a toast notification
      },
    });

  const savingsDurationOptions = [
    { value: 30, label: "30 days" },
    { value: 60, label: "60 days" },
    { value: 120, label: "120 days" },
  ];

  const calculateEndDate = (days: number) => {
    const currentDate = new Date(
      details?.unlockTime ? Number(details.unlockTime) * 1000 : Date.now()
    );
    const futureDate = addDays(currentDate, days);
    return format(futureDate, "dd MMMM yyyy");
  };

  const [validationErrors] = useState<{
    amount?: string;
    token?: string;
    duration?: string;
    transactionPercentage?: string;
    frequency?: string;
  }>({});

  const handleDurationChange = (duration: number) => {
    setSavingsDuration(duration);
    setEndDate(calculateEndDate(duration));
    setIsCustomSelected(false);

    const durationInSeconds = duration * 24 * 60 * 60;

    setSaveState((prevState) => ({
      ...prevState,
      duration: durationInSeconds,
    }));

    const calculatedUnlockDate = addDays(new Date(), duration);
    setUnlockDate(calculatedUnlockDate);
  };

  const calculateTotalUsdValue = async () => {
    if (!details?.tokenAmounts) return;

    for (const token of details.tokenAmounts) {
      if (!token.amount || token.amount === 0) continue;
      const price = await convertTokenAmountToUsd(
        token.token,
        BigInt(token.amount)
      );
      if (!price) continue;
      setTotalUsdValues((prev) => {
        const newValues = [...prev];
        newValues[details?.tokenAmounts.indexOf(token)] = price;
        return newValues;
      });
    }
  };

  useEffect(() => {
    const fetchUsdValues = async () => {
      await calculateTotalUsdValue();
    };

    // Fetch total value when claimable tokens change
    fetchUsdValues();
  }, [details?.tokenAmounts]);

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center bg-transparent z-50">
        <div
          className="absolute inset-0 bg-black/80"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
        ></div>
        <div className="relative w-full max-w-md rounded-xl bg-[#17171C] text-white shadow-lg p-5 border border-white/15">
          {/* Close Icon */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Tokens Modal */}
          {type === "with-tokens" && (
            <div>
              <h2 className="text-lg font-semibold mb-2">
                Reactivate safe with available tokens
              </h2>
              <p className="text-sm text-gray-400 mb-6">
                <span className="font-medium text-white">
                  {details?.target || "Target Savings"}
                </span>{" "}
                <br />
                Expired on:{" "}
                <span className="text-white">
                  {format(new Date(Number(details?.unlockTime)), "PPP")}
                </span>
              </p>

              <div className="space-y-4 divide-y divide-white/15">
                {details?.tokenAmounts.map((token, index) => (
                  <div key={index} className={`py-2.5`}>
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="flex items-center gap-2">
                          {tokenData[token.token]?.image ? (
                            <div className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center">
                              <img
                                src={tokenData[token.token]?.image}
                                width={30}
                                height={30}
                                className="w-full h-full"
                              />
                            </div>
                          ) : (
                            <div
                              className={`w-7 h-7 rounded-full ${
                                tokenData[token.token].color
                              } flex items-center justify-center text-white font-medium`}
                            >
                              {token.tokenSymbol?.charAt(0)}
                            </div>
                          )}
                          <div className="flex flex-col">
                            <p className="font-medium text-white">
                              {token.tokenSymbol}
                            </p>
                            <p className="text-xs text-gray-400">
                              {tokenData[token.token].chain}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col justify-end items-end">
                        <div className="text-base">
                          {token.formattedAmount} {token.tokenSymbol}
                        </div>
                        <div className="text-sm text-gray-400 flex gap-1 items-center justify-center">
                          ≈ ${totalUsdValues[index] ? totalUsdValues[index]?.toFixed(2) : <Skeleton className="h-6 w-12"/>}
                        </div>

                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <DurationSelector
                  options={savingsDurationOptions}
                  selectedValue={savingsDuration}
                  onChange={handleDurationChange}
                  onCustomDateSelect={handleCustomDateSelect}
                  customDate={customDate}
                  isCustomSelected={isCustomSelected}
                  className="mb-4"
                  isDisabled={isDurationDisabled}
                  label="Duration"
                  unlockDate={endDate}
                />
              </div>

              <div className="mt-8 flex gap-6 justify-end">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                  }}
                  className="rounded-full bg-[#FFFFFF2B]  text-[14px] px-5 py-2.5 text-white "
                >
                  Cancel
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    extendTargetSafe(e);
                  }}
                  disabled={!details || extending}
                  className="disabled:cursor-not-allowed disabled:opacity-70 rounded-full bg-white text-[14px] py-2.5 transition text-black px-6"
                >
                  {extending ? "Reactivating" : "Reactivate"}
                </button>
              </div>
            </div>
          )}

          {/* Top-up Modal */}
          {type === "with-top-up" && (
            <>
              <h2 className="text-lg font-semibold mb-6">Reactivate safe</h2>

              {/* Amount Input */}
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

              <>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-[300] text-gray-300">
                    Wallet balance:{" "}
                    <span className="text-gray-400">
                      {selectedTokenBalance}{" "}
                      {tokenData[saveState.token]?.symbol}
                    </span>
                  </div>
                  {saveState.token &&
                  (selectedTokenBalance == 0 ||
                    (saveState.amount &&
                      saveState.amount > selectedTokenBalance)) ? (
                    <Button
                      variant="link"
                      className="text-[#79E7BA] hover:text-[#79E7BA]/80 p-0"
                      onClick={() => navigate("/deposit")}
                    >
                      Deposit to save
                    </Button>
                  ) : (
                    <Button
                      className="text-sm border-none outline-none bg-transparent hover:bg-transparent text-green-400 cursor-pointer"
                      onClick={() =>
                        setSaveState((prev) => ({
                          ...prev,
                          amount: selectedTokenBalance,
                        }))
                      }
                    >
                      Max
                    </Button>
                  )}
                </div>
              </>

              {/* Savings Target */}
              <div className="mt-6">
                <label className="text-sm text-gray-300 mb-2">
                  Savings target
                </label>
                <input
                  type="text"
                  value={details?.target}
                  disabled={true}
                  className={
                    "opacity-50 cursor-not-allowed w-full px-4 py-2 rounded-[8px] bg-transparent border-[1px] border-[#FFFFFF3D] focus:outline-none focus:ring-2 focus:ring-primary"
                  }
                />
              </div>

              <div className="mt-8">
                <DurationSelector
                  options={savingsDurationOptions}
                  selectedValue={savingsDuration}
                  onChange={handleDurationChange}
                  onCustomDateSelect={handleCustomDateSelect}
                  customDate={customDate}
                  isCustomSelected={isCustomSelected}
                  className="mb-4"
                  isDisabled={isDurationDisabled}
                  label="Duration"
                  unlockDate={endDate}
                />
              </div>

              {/* Unlock Options */}
              <div className="mt-8 flex gap-6 justify-end">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                  }}
                  className="rounded-full bg-[#FFFFFF2B]  text-[14px] px-5 py-2.5 text-white "
                >
                  Cancel
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log("reactivate safeeeeee");
                    reactivateTargetSafe(e);
                  }}
                  disabled={!details || reactivating}
                  className="disabled:cursor-not-allowed disabled:opacity-70 rounded-full bg-white text-[14px] py-2.5 transition text-black px-6"
                >
                  {extending ? "Reactivating" : "Reactivate"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ReactivateModal;
