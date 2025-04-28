"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Loader2, LoaderCircle } from "lucide-react";
import { cn, tokenData } from "@/lib/utils";
import SavingsTargetInput from "../SavingsTargetInput";
import AmountInput from "../AmountInput";
import { useRecoilState, useResetRecoilState } from "recoil";
import { saveAtom } from "@/store/atoms/save";
import { CoinsafeDiamondContract, tokens } from "@/lib/contract";
import { DurationSelector } from "../DurationSelector";
import { format, addDays, differenceInDays, startOfDay } from "date-fns";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useCreateAutoSavings } from "@/hooks/useCreateAutoSavings";
import { useActiveAccount } from "thirdweb/react";
import targetSavingsFacetAbi from "../../abi/TargetSavingsFacet.json";
import { liskSepolia } from "@/lib/config";
import { toast } from "@/hooks/use-toast";
import { useSaveAsset } from "@/hooks/useSaveAsset";
import SuccessfulTxModal from "../Modals/SuccessfulTxModal";
import SaveSuccessful from "../Modals/SaveSuccessful";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Link, useNavigate } from "react-router-dom";
import { formatUnits } from "viem";
import { SafeDetails, useGetSafes } from "@/hooks/useGetSafes";
import { balancesState, supportedTokensState } from "@/store/atoms/balance";

interface SavingsTarget {
  id: string | number;
  name: string;
  description?: string;
}

export default function SaveAssetsCard() {
  const navigate = useNavigate();
  const [saveState, setSaveState] = useRecoilState(saveAtom);
  const resetSaveState = useResetRecoilState(saveAtom);

  const initialSaveType = saveState.typeName === "manual" ? "auto" : "one-time";
  const [saveType, setSaveType] = useState<"one-time" | "auto">(
    initialSaveType
  );

  useEffect(() => {
    if (saveState.typeName === "manual") {
      setSaveState((prevState) => ({
        ...prevState,
        typeName: "",
      }));
    }
  }, [saveState.typeName, setSaveState]);

  const [isThirdModalOpen, setIsThirdModalOpen] = useState(false);
  const smartAccount = useActiveAccount();
  const address = smartAccount?.address;
  const [supportedTokens] = useRecoilState(supportedTokensState);
  const [balances] = useRecoilState(balancesState);
  const AvailableBalance = useMemo(() => balances?.available || {}, [balances]);

  function getFrequencyLabel(value: string) {
    const frequency = frequencies.find(
      (frequency) => frequency.value === value
    );
    return frequency ? frequency.label : undefined;
  }

  const [frequencies] = useState([
    { value: "86400", label: "Every day" }, // 1 day = 86400 seconds
    { value: "172800", label: "Every 2 days" }, // 2 days = 172800 seconds
    { value: "432000", label: "Every 5 days" }, // 5 days = 432000 seconds
    { value: "604800", label: "Weekly" }, // 1 week = 604800 seconds
    { value: "2592000", label: "Monthly" }, // 1 month = 2592000 seconds (approx. 30 days)
  ]);

  const [, setDecimals] = useState(1);
  const [selectedTokenBalance, setSelectedTokenBalance] = useState(0);
  const [checkingAutoSafe, setCheckingAutoSafe] = useState(false);
  const [hasAutoSafe, setHasAutoSafe] = useState(false);
  const [autoSafeTokenOptions, setAutoSafeTokenOptions] =
    useState(supportedTokens);

  //   Duration state
  const [savingsDuration, setSavingsDuration] = useState(30);
  const [endDate, setEndDate] = useState("");
  const [, setUnlockDate] = useState<Date | null>(null);
  const [, _setSelectedDate] = useState<Date | undefined>(undefined);

  // Custom date state
  const [customDate, setCustomDate] = useState<Date | undefined>(undefined);
  const [isCustomSelected, setIsCustomSelected] = useState(false);
  const today = startOfDay(new Date());

  const savingsDurationOptions = [
    { value: 30, label: "30 days" },
    { value: 60, label: "60 days" },
    { value: 120, label: "120 days" },
  ];

  const {
    safes,
    // isLoading: isGetSafesLoading,
    // fetchSafes,
    // error,
  } = useGetSafes();

  // useEffect(() => {
  //   fetchSafes();
  // }, []);

  // console.log("Loading?? >>", isGetSafesLoading);
  // console.log("SAFES", safes);
  // console.log("SAFE FETCH ERROR", error);

  const calculateEndDate = (days: number) => {
    const currentDate = new Date();
    const futureDate = addDays(currentDate, days);
    return format(futureDate, "dd MMMM yyyy");
  };

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

    // console.log(`Savings duration changed to ${duration} days`);
  };

  // Initialize with default duration
  useEffect(() => {
    handleDurationChange(30);
  }, []);

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

    // console.log(
    //   `Custom date selected: ${format(
    //     date,
    //     "dd MMMM yyyy"
    //   )}, ${daysDiff} days from now`
    // );
  };

  // End of duration state code
  const [, _setSavingsTargets] = useState<SafeDetails[]>(safes);
  //   const handleCreateTarget = (newTarget: SavingsTarget) => {
  //     setSavingsTargets((prev) => [...prev, newTarget]);
  //     console.log("Created new target:", newTarget);
  //   };
  const [isCreateTargetModalOpen, setIsCreateTargetModalOpen] = useState(false);
  const [newTarget, setNewTarget] = useState<Omit<SavingsTarget, "id">>({
    name: "",
    description: "",
  });

  const handleCreateTarget = () => {
    if (newTarget.name || savingsTargetInput) {
      //   setSavingsTargets((prev) => ({
      //     ...prev,
      //     newTarget,
      //     id: Date.now().toString(),
      //   }));
      // console.log("Created new target:", newTarget);
      //   onCreate({ ...newTarget, id: Date.now().toString() });
      setNewTarget({ name: "", description: "" });
      setIsCreateTargetModalOpen(false);
    }
  };

  const [savingsTargetInput, _setSavingsTargetInput] = useState("");
  const [_selectedSavingsTarget, setSelectedSavingsTarget] =
    useState<SafeDetails | null>(null);
  //   const [nextId, setNextId] = useState(16);

  // console.log("SELECTED SAVINGS TARGET", selectedSavingsTarget);

  // const handleSavingsTargetSelect = (savingsTarget: SafeDetails) => {
  //   setSelectedSavingsTarget(savingsTarget);

  //   if (selectedSavingsTarget) {
  //     setSaveState((prevState) => ({
  //       ...prevState,
  //       id: Number(selectedSavingsTarget.id),
  //       target: selectedSavingsTarget.target,
  //     }));

  //     console.log("In here in savings target select");
  //     console.log("savings target", selectedSavingsTarget);
  //     console.log("New save state", saveState);
  //   }
  // };

  const [selectedOption, setSelectedOption] = useState("by-frequency");
  const [validationErrors, setValidationErrors] = useState<{
    amount?: string;
    token?: string;
    duration?: string;
    transactionPercentage?: string;
    frequency?: string;
  }>({});

  const handleTokenSelect = (value: string) => {
    // SAFU & LSK check
    if (value == tokens.safu || value == tokens.lsk) {
      setDecimals(18);
      // USDT check
    } else if (value == tokens.usdt) {
      setDecimals(18);
    }

    setSaveState((prevState) => ({ ...prevState, token: value }));
  };

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const _amount = Number(event.target.value);
    setSaveState((prevState) => ({
      ...prevState,
      amount: _amount,
    }));
  };

  const handleFrequencyChange = (value: string) => {
    const _frequency = Number(value);
    setSaveState((prevState) => ({
      ...prevState,
      frequency: _frequency,
    }));
  };

  //   Save asset functionality
  const openThirdModal = () => {
    setIsThirdModalOpen(true);
    // onClose();
  };

  const {
    createAutoSavings,
    addTokenToAutoSafe,
    hasCreatedAutoSafe,
    isLoading: autoSavingsLoading,
  } = useCreateAutoSavings({
    address: address as `0x${string}`,
    saveState,
    onSuccess: () => {
      openThirdModal();
      setTimeout(() => {
        resetSaveState();
      }, 4000);
    },
    onError: (error: { message: any }) => {
      toast({
        title: error.message,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    console.log("SAVE STATE", saveState);
  }, [saveState]);

  const { saveAsset, isPending: isLoading } = useSaveAsset({
    address: address as `0x${string}`,
    saveState,
    coinSafeAddress: CoinsafeDiamondContract.address as `0x${string}`,
    coinSafeAbi: targetSavingsFacetAbi,
    chainId: liskSepolia.id,
    onSuccess: () => {
      openThirdModal();

      // add a little delay so that the modal can display the correct amount and duration
      setTimeout(() => {
        resetSaveState();
      }, 4000);
    },
    onError: (error: { message: any }) => {
      toast({
        title: error.message,
        variant: "destructive",
      });
    },
  });

  const validateForm = () => {
    const errors: typeof validationErrors = {};

    // Common validations for both one-time and autosave
    if (!saveState.amount || saveState.amount <= 0) {
      errors.amount = "Please enter a valid amount";
    }

    if (!saveState.token) {
      errors.token = "Please select a token";
    }

    if (!saveState.duration || saveState.duration <= 0) {
      errors.duration = "Please enter a valid duration";
    }

    // Specific validations based on autosave option
    if (saveType === "auto") {
      if (selectedOption === "per-tranaction") {
        // Validation for per transaction saving
        if (
          !saveState.transactionPercentage ||
          saveState.transactionPercentage <= 0
        ) {
          errors.transactionPercentage = "Please enter a valid percentage";
        }
      } else if (selectedOption === "by-frequency") {
        // Validation for personalized frequency saving
        if (!saveState.frequency) {
          errors.frequency = "Please select a saving frequency";
        }
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // const handleSavingsTargetChange = (targetInput: string) => {
  //   setSaveState((prev) => ({ ...prev, target: targetInput, id: 0 }));
  // };
  // Handle input change for savings target
  const handleSavingsTargetChange = (value: string) => {
    // Update saveState with the raw input value to allow typing
    setSaveState((prevState) => ({
      ...prevState,
      target: value,
    }));

    // Find matching SafeDetails (case-insensitive)
    const matchingSafe = safes.find(
      (safe) => safe.target.toLowerCase() === value.trim().toLowerCase()
    );

    // Update selectedSavingsTarget
    setSelectedSavingsTarget(matchingSafe || null);

    // Update saveState with matching details if found
    if (matchingSafe) {
      setSaveState((prevState) => ({
        ...prevState,
        id: Number(matchingSafe.id),
        target: matchingSafe.target,
      }));
    }

    // Log for debugging
    console.log("Input value:", value);
    console.log("Matching Safe:", matchingSafe);
    console.log("Selected Savings Target:", matchingSafe || null);
    console.log("Save State:", { ...saveState, target: value });
  };

  const handleSaveAsset = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    if (address)
      if (!validateForm()) {
        return;
      }

    if (saveType === "auto" && selectedOption === "by-frequency") {
      if (hasAutoSafe) {
        return addTokenToAutoSafe(event);
      }
      createAutoSavings(event);
      return;
    }

    saveAsset(event);
  };

  useEffect(() => {
    if (address && saveState.token && AvailableBalance) {
      const tokensData = AvailableBalance;
      if (!tokensData) return;

      // console.log("Tokens Data: ", tokensData);

      const tokenBalance = (AvailableBalance[saveState.token] as bigint) || 0n;

      setSelectedTokenBalance(Number(formatUnits(tokenBalance, 18)));
      // console.log("token Balance: ", tokenBalance);
    }
  }, [saveState.token, address, AvailableBalance]);

  useEffect(() => {
    async function run() {
      setCheckingAutoSafe(true);
      try {
        const { hasAutoSafe, tokens } = await hasCreatedAutoSafe(
          supportedTokens
        );
        console.log("Has AutoSafe::", hasAutoSafe, "Tokens::", tokens);
        setHasAutoSafe(hasAutoSafe);
        setAutoSafeTokenOptions(tokens);
      } catch (error) {
        console.error(error);
      } finally {
        setCheckingAutoSafe(false);
      }
    }
    run();
  }, [supportedTokens]);

  return (
    <div className="flex justify-center min-h-fit bg-[#010104] p-4">
      <div className="w-full max-w-[600px] rounded-xl border-[1px] border-[#FFFFFF21] bg-[#1D1D1D73] p-6 text-white">
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <button className="rounded-full" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-medium">Save assets</h1>
        </div>

        {/* Toggle */}
        <div className="flex rounded-full bg-[#5a5a5a] border-2 border-[#5a5a5a] p-0 mb-6">
          <button
            onClick={() => setSaveType("one-time")}
            className={cn(
              "flex-1 py-1 px-4 text-sm rounded-full text-center transition-colors",
              saveType === "one-time"
                ? "bg-[#79E7BA33] text-white"
                : "text-gray-300"
            )}
          >
            One-time save
          </button>
          <button
            onClick={() => setSaveType("auto")}
            className={cn(
              "flex-1 py-1 text-sm px-4 rounded-full text-center transition-colors",
              saveType === "auto"
                ? "bg-[#79E7BA33] text-white"
                : "text-gray-300"
            )}
          >
            Autosave
          </button>
        </div>

        {saveType === "one-time" && (
          <>
            {/* Amount */}
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

            {/* Wallet Balance */}
            <div className="flex justify-between items-center mb-6">
              <div className="text-sm text-gray-300">
                Wallet balance:{" "}
                <span className="text-gray-400">
                  {selectedTokenBalance} {tokenData[saveState.token]?.symbol}
                </span>
              </div>
              <button
                className="text-sm text-[#5b8c7b]"
                onClick={() =>
                  setSaveState((prev) => ({
                    ...prev,
                    amount: selectedTokenBalance,
                  }))
                }
              >
                Save all
              </button>
            </div>

            <div className="border-t border-[#6a6a6a] my-4"></div>

            {/* Savings Target */}
            <div className="mb-2">
              <label className="text-sm text-gray-300">Savings target</label>
              <SavingsTargetInput
                data={safes}
                value={saveState.target}
                onChange={handleSavingsTargetChange}
                onSelect={(savingsTarget) => {
                  setSelectedSavingsTarget(savingsTarget);
                  // console.log("SAVINGS TARGET IN THE SELECT", savingsTarget);
                  setSaveState((prevState) => ({
                    ...prevState,
                    id: Number(savingsTarget.id),
                    target: savingsTarget.target,
                    duration: Number(savingsTarget.duration),
                  }));

                  // console.log("In here in savings target select");
                  // console.log("savings target", selectedSavingsTarget);
                  // console.log("New save state", saveState);
                }}
                onAddItem={handleCreateTarget}
                setShowAddModal={setIsCreateTargetModalOpen}
                handleAddItem={() => setIsCreateTargetModalOpen(true)}
                // label="Search for a city"
                placeholder="Enter savings target"
                getItemValue={(savingsTarget) => savingsTarget.target}
                itemName="savings target"
                renderItem={(savingsTarget) => (
                  <div className="flex flex-col">
                    <span className="font-medium">{savingsTarget.target}</span>
                    {/* */}
                  </div>
                )}
              />
              {/* <div className="relative mt-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#6a6a6a] rounded-lg p-4 outline-none"
              placeholder="Search target"
            />


          </div> */}
            </div>

            {/* Duration section */}
            <div className="py-4">
              <DurationSelector
                options={savingsDurationOptions}
                selectedValue={savingsDuration}
                onChange={handleDurationChange}
                onCustomDateSelect={handleCustomDateSelect}
                customDate={customDate}
                isCustomSelected={isCustomSelected}
                className="mb-4"
              />

              <div className="py-4">
                <p className="text-[12px] font-semibold text-[#CACACA]">
                  Unlocks on <span className="text-[#CACACA]">{endDate}</span>
                </p>
              </div>
            </div>
          </>
        )}

        {saveType === "auto" && (
          <>
            {/* Autosave Tab section */}
            <div className="space-y-4 py-4">
              <div className="py-4 pb-6 border-b-[1px] border-[#FFFFFF21]">
                <p className="font-[200] text-base">Choose savings method</p>
                <div className="flex gap-2">
                  <Label
                    htmlFor="by-frequency"
                    className={`w-full flex items-center gap-2 rounded-md border-0 px-4 py-3 h-24 bg-[#131313B2] text-gray-400 ${
                      selectedOption === "by-frequency"
                        ? "bg-[#3F3F3F99] border-[1px] border-[#FFFFFF29]"
                        : ""
                    }`}
                  >
                    {/* }`}
                            > */}
                    <div>
                      <div className="flex gap-2">
                        <input
                          type="radio"
                          id="by-frequency"
                          name="savingOption"
                          value="by-frequency"
                          checked={selectedOption === "by-frequency"}
                          onChange={() => setSelectedOption("by-frequency")}
                          className="appearance-none h-4 w-4 border-2 border-gray-400 rounded-full checked:bg-[#79E7BA] checked:border-[#79E7BA] focus:outline-none"
                        />

                        <div className="font-medium mb-1 text-white">
                          By frequency
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-[400] text-[#C7C7D1]">
                          save a fixed amount by frequency
                        </p>
                      </div>
                    </div>
                  </Label>
                  <Label
                    htmlFor="per-transaction"
                    className={`w-full flex flex-col items-start justify-center gap-2 rounded-md border-0 px-4 py-3 h-24 bg-[#131313B2] text-gray-400 ${
                      selectedOption === "per-transaction"
                        ? "bg-[#3F3F3F99] border-[1px] border-[#FFFFFF29]"
                        : ""
                    }`}
                  >
                    {/* }`}
                            > */}
                    <div>
                      <div className="flex gap-2">
                        <input
                          type="radio"
                          id="per-transaction"
                          name="savingOption"
                          value="per-transaction"
                          checked={selectedOption === "per-transaction"}
                          onChange={() => setSelectedOption("per-transaction")}
                          className="appearance-none h-4 w-4 border-2 border-gray-400 rounded-full checked:bg-[#79E7BA] checked:border-[#79E7BA] focus:outline-none"
                        />

                        <div className="font-medium mb-1 text-white">
                          Spend and save
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-[400] text-[#C7C7D1]">
                          Save a percentage of every transaction
                        </p>
                      </div>
                    </div>
                  </Label>
                </div>
              </div>

              {/* Conditionally Rendered Content */}
              {selectedOption === "per-transaction" && (
                <div className="flex flex-col items-center justify-center space-y-4 py-2 text-white">
                  {/* <MemoComingSoonIcon className="w-[70%] h-[55vh] text-white" /> */}
                  <img src="/assets/coming-soon-orb.png" alt="coming soon" />
                  <h1 className="text-3xl font-bold my-2 text-white leading-tight">
                    We’re in the kitchen!
                  </h1>
                  <p className="text-center max-w-md text-muted-foreground">
                    We’re in the kitchen, putting the final touches on this
                    feature. We’ll let you know as soon as it’s ready! Continue
                    saving for now.
                  </p>
                </div>
              )}

              {selectedOption === "by-frequency" &&
                (checkingAutoSafe ? (
                  <div className="flex w-full items-center justify-center p-4">
                    <Loader2 className="w-12 h-12 animate-spin " />
                  </div>
                ) : supportedTokens.filter(
                    (token) => !autoSafeTokenOptions.includes(token)
                  ).length < 1 ? (
                  <div className="p-4 flex flex-col items-center justify-center text-center gap-5">
                    <h4 className="text-2xl ">You're all set up</h4>
                    <p className="">
                      You have successfully set up your your automated savings
                      plan and added automated savings plans for all our
                      supported tokens.
                    </p>
                    <Link to={""}>
                      <Button
                        variant="link"
                        className="text-[#79E7BA] hover:text-[#79E7BA]/80 p-0"
                      >
                        View your Automated Safe here
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div>
                    {/* <label htmlFor="amount" className="text-sm text-gray-400">
                    Amount
                  </label> */}
                    <AmountInput
                      amount={saveState.amount}
                      handleAmountChange={handleAmountChange}
                      handleTokenSelect={handleTokenSelect}
                      saveState={saveState}
                      tokens={tokens}
                      selectedTokenBalance={selectedTokenBalance}
                      validationErrors={validationErrors}
                      supportedTokens={
                        hasAutoSafe
                          ? supportedTokens.filter(
                              (token) => !autoSafeTokenOptions.includes(token)
                            )
                          : supportedTokens
                      }
                    />

                    {/* Wallet balance */}
                    <>
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-sm font-[300] text-gray-300">
                          Wallet balance:{" "}
                          <span className="text-gray-400">
                            {selectedTokenBalance}{" "}
                            {tokenData[saveState.token]?.symbol}
                          </span>
                        </div>
                        <Button
                          className="text-sm border-none outline-none bg-transparent hover:bg-transparent text-green-400 cursor-pointer"
                          // onClick={() => setAmount(selectedTokenBalance)}
                          onClick={() =>
                            setSaveState((prev) => ({
                              ...prev,
                              amount: selectedTokenBalance,
                            }))
                          }
                        >
                          {/* }
                                  > */}
                          Max
                        </Button>
                      </div>
                    </>

                    <div className="space-y-4 py-2 text-white">
                      <Label htmlFor="frequencyAmount">Frequency</Label>
                      <Select onValueChange={handleFrequencyChange}>
                        <SelectTrigger className="w-full bg-gray-700 border bg-transparent text-white rounded-lg">
                          <SelectValue placeholder="Select Frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          {frequencies.map((freq) => (
                            <SelectItem key={freq.value} value={freq.value}>
                              {freq.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {validationErrors.frequency && (
                        <p className="text-red-500 text-sm mt-1">
                          {validationErrors.frequency}
                        </p>
                      )}
                    </div>

                    {!hasAutoSafe && (
                      <div className="py-4">
                        <DurationSelector
                          options={savingsDurationOptions}
                          selectedValue={savingsDuration}
                          onChange={handleDurationChange}
                          onCustomDateSelect={handleCustomDateSelect}
                          customDate={customDate}
                          isCustomSelected={isCustomSelected}
                          className="mb-4"
                        />

                        <div className="py-4">
                          <p className="text-[12px] font-semibold text-[#CACACA]">
                            Unlocks on{" "}
                            <span className="text-[#CACACA]">{endDate}</span>
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </>
        )}

        {selectedOption === "by-frequency" && saveType !== "one-time" &&
          (supportedTokens.filter(
            (token) => !autoSafeTokenOptions.includes(token)
          ).length < 1 ? (
            <></>
          ) : (
            <>
              <div className="flex justify-end">
                <div>
                  <Button
                    onClick={handleSaveAsset}
                    className="text-black px-8 rounded-[2rem]"
                    variant="outline"
                    disabled={isLoading || autoSavingsLoading}
                  >
                    {isLoading || autoSavingsLoading ? (
                      <LoaderCircle className="animate-spin" />
                    ) : hasAutoSafe ? (
                      "Add token to safe"
                    ) : (
                      "Save assets"
                    )}
                  </Button>
                </div>
              </div>
            </>
          ))}

        {saveType === "one-time" && (
          <div className="flex justify-end">
            <div>
              <Button
                onClick={handleSaveAsset}
                className="text-black px-8 rounded-[2rem]"
                variant="outline"
                disabled={isLoading}
              >
                {isLoading ? (
                  <LoaderCircle className="animate-spin" />
                ) : (
                  "Save assets"
                )}
              </Button>
            </div>
          </div>
        )}
      </div>

      <SaveSuccessful
        amount={saveState.amount}
        token={tokenData[saveState.token]?.symbol}
        duration={saveState.duration}
        isOpen={isThirdModalOpen && saveType === "one-time"}
        onClose={() => setIsThirdModalOpen(false)}
      />
      <SuccessfulTxModal
        transactionType="setup-recurring-save"
        amount={saveState.amount}
        token={tokenData[saveState.token]?.symbol}
        isOpen={
          isThirdModalOpen &&
          saveType === "auto" &&
          selectedOption === "by-frequency"
        }
        onClose={() => setIsThirdModalOpen(false)}
        additionalDetails={{
          frequency: getFrequencyLabel(saveState.frequency.toString()),
        }}
      />

      <Dialog
        open={isCreateTargetModalOpen}
        onOpenChange={setIsCreateTargetModalOpen}
      >
        <DialogContent className="bg-[#17171C] text-[#F1F1F1] border-[#FFFFFF21]">
          <DialogHeader>
            <DialogTitle>Create Custom Target</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="target-name">Name of target</Label>
              <Input
                id="target-name"
                value={newTarget.name || savingsTargetInput}
                onChange={(e) =>
                  setNewTarget((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Enter target name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="target-description">Description (optional)</Label>
              <Textarea
                id="target-description"
                value={newTarget.description}
                onChange={(e) =>
                  setNewTarget((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Enter target description"
                className="bg-[#17171C]"
              />
            </div>
          </div>
          <DialogFooter>
            <div className="flex justify-between w-full">
              <Button
                variant="outline"
                onClick={() => setIsCreateTargetModalOpen(false)}
                className="bg-[#FFFFFF2B] border-[#FFFFFF2B] rounded-[100px] text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateTarget}
                className="rounded-[100px] bg-white text-[#010104] hover:text-white"
              >
                Create Target
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
