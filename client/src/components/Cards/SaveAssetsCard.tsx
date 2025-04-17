"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import SavingsTargetInput from "../SavingsTargetInput";
import AmountInput from "../AmountInput";
import { useRecoilState } from "recoil";
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
import { usecreateAutoSavings } from "@/hooks/useCreateAutoSavings";
import { useBalances } from "@/hooks/useBalances";
import { useActiveAccount } from "thirdweb/react";
import savingsFacetAbi from "../../abi/AutomatedSavingsFacet.json";
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
import { useNavigate } from "react-router-dom";
import { formatUnits } from "viem";
import { SafeDetails, useGetSafes } from "@/hooks/useGetSafes";

interface SavingsTarget {
  id: string | number;
  name: string;
  description?: string;
}

// const initialSavingsTargets: SavingsTarget[] = [
//
// ];

export default function SaveAssetsCard() {
  const navigate = useNavigate();
  const [saveType, setSaveType] = useState<"one-time" | "auto">("one-time");
  //   const [amount, setAmount] = useState("0.00");
  //   const [showDropdown, setShowDropdown] = useState(false);

  const [isThirdModalOpen, setIsThirdModalOpen] = useState(false);
  const smartAccount = useActiveAccount();
  const address = smartAccount?.address;
  const { AvailableBalance, supportedTokens } = useBalances(address as string);

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
  const [saveState, setSaveState] = useRecoilState(saveAtom);
  const [selectedTokenBalance, setSelectedTokenBalance] = useState(0);

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
    isLoading: isGetSafesLoading,
    fetchSafes,
    error,
  } = useGetSafes();

  useEffect(() => {
    fetchSafes();
  }, []);

  console.log("Loading?? >>", isGetSafesLoading);
  console.log("SAFES", safes);
  console.log("SAFE FETCH ERROR", error);

  useEffect(() => {
    handleDurationChange(30);
  }, []);

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

    console.log(`Savings duration changed to ${duration} days`);
  };

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

    console.log(
      `Custom date selected: ${format(
        date,
        "dd MMMM yyyy"
      )}, ${daysDiff} days from now`
    );
  };

  // End of duration state code
  const [savingsTargets, _setSavingsTargets] = useState<SafeDetails[]>(safes);
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
      console.log("Created new target:", newTarget);
      //   onCreate({ ...newTarget, id: Date.now().toString() });
      setNewTarget({ name: "", description: "" });
      setIsCreateTargetModalOpen(false);
    }
  };

  const [savingsTargetInput, _setSavingsTargetInput] = useState("");
  const [_selectedSavingsTarget, setSelectedSavingsTarget] =
    useState<SafeDetails | null>(null);
  //   const [nextId, setNextId] = useState(16);

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
      setDecimals(6);
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

  const { createAutoSavings, isLoading: autoSavingsLoading } =
    usecreateAutoSavings({
      address: address as `0x${string}`,
      saveState,
      coinSafeAddress: CoinsafeDiamondContract.address as `0x${string}`,
      // coinSafeAddress: CoinsafeDiamondContract.address as `0x${string}`,
      coinSafeAbi: savingsFacetAbi,
      // coinSafeAbi: savingsFacetAbi.abi,
      chainId: liskSepolia.id,
      onSuccess: () => {
        openThirdModal();
      },
      onError: (error: { message: any }) => {
        toast({
          title: error.message,
          variant: "destructive",
        });
      },
    });

  console.log("SAVE STATE", saveState);
  const { saveAsset, isPending: isLoading } = useSaveAsset({
    address: address as `0x${string}`,
    saveState,
    coinSafeAddress: CoinsafeDiamondContract.address as `0x${string}`,
    coinSafeAbi: targetSavingsFacetAbi,
    chainId: liskSepolia.id,
    onSuccess: () => {
      openThirdModal();
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

  const handleSavingsTargetChange = (targetInput: string) => {
    setSaveState((prev) => ({ ...prev, target: targetInput }));
  };

  const handleSaveAsset = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    if (!validateForm()) {
      return;
    }

    if (saveType === "auto" && selectedOption === "by-frequency") {
      createAutoSavings(event);
      return;
    }

    console.log("What is the event", event);
    saveAsset(event);
  };

  useEffect(() => {
    if (address && saveState.token && AvailableBalance) {
      const tokensData = AvailableBalance;
      if (!tokensData) return;

      console.log("Tokens Data: ", tokensData);

      const tokenBalance = (AvailableBalance[saveState.token] as bigint) || 0n;

      setSelectedTokenBalance(Number(formatUnits(tokenBalance, 18)));
      console.log("token Balance: ", tokenBalance);
    }
  }, [saveState.token, address, AvailableBalance]);

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
            {/* <div className="mb-1">
          <label className="text-sm text-gray-300">Amount</label>
          <div className="mt-1 relative">
            <div className="flex items-center justify-between bg-transparent rounded-[8px] border-[1px] border-[#FFFFFF3D] px-4 py-6">
              <div>
                <input
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-transparent text-base outline-none w-full"
                />
                <div className="text-xs text-gray-300">≈ ₹400.58</div>
              </div>
              <div className="relative">
                <button
                  className="flex items-center gap-1 bg-[#5a5a5a] px-3 py-1.5 rounded-lg"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <Check size={16} className="text-white" />
                  <span>LSK</span>
                </button>
              </div>
            </div>
          </div>
        </div> */}

            {/* Wallet Balance */}
            <div className="flex justify-between items-center mb-6">
              <div className="text-sm text-gray-300">
                Wallet balance:{" "}
                <span className="text-gray-400">
                  {selectedTokenBalance}{" "}
                  {saveState.token == tokens.safu
                    ? "SAFU"
                    : saveState.token === tokens.lsk
                    ? "LSK"
                    : "USDT"}
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
                data={savingsTargets}
                value={saveState.target}
                onChange={handleSavingsTargetChange}
                onSelect={(savingsTarget) =>
                  setSelectedSavingsTarget(savingsTarget)
                }
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

              {selectedOption === "by-frequency" && (
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
                    supportedTokens={supportedTokens}
                  />

                  {/* Wallet balance */}
                  <>
                    {saveState.token && (
                      <div>
                        {saveState.amount > selectedTokenBalance && (
                          <p className="text-red-500 text-[13px] text-right">
                            Amount greater than wallet balance
                          </p>
                        )}
                      </div>
                    )}
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm font-[300] text-gray-300">
                        Wallet balance:{" "}
                        <span className="text-gray-400">
                          {selectedTokenBalance}{" "}
                          {saveState.token == tokens.safu
                            ? "SAFU"
                            : saveState.token === tokens.lsk
                            ? "LSK"
                            : "USDT"}
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

                  {/* savings target section */}
                  <div>
                    {/* <SavingsTargetSelect
                      options={savingsTargets}
                      onSelect={handleSelectTarget}
                      onCreate={handleCreateTarget}
                      className=""
                    /> */}
                    <label className="text-sm text-gray-300">
                      Savings target
                    </label>
                    <SavingsTargetInput
                      data={savingsTargets}
                      value={saveState.target}
                      onChange={handleSavingsTargetChange}
                      onSelect={(savingsTarget) =>
                        setSelectedSavingsTarget(savingsTarget)
                      }
                      onAddItem={handleCreateTarget}
                      setShowAddModal={setIsCreateTargetModalOpen}
                      handleAddItem={() => setIsCreateTargetModalOpen(true)}
                      // label="Search for a city"
                      placeholder="Enter savings target"
                      getItemValue={(savingsTarget) => savingsTarget.target}
                      itemName="savings target"
                      renderItem={(savingsTarget) => (
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {savingsTarget.target}
                          </span>
                          {/* */}
                        </div>
                      )}
                    />
                  </div>

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
                </div>
              )}
            </div>
          </>
        )}

        {selectedOption === "by-frequency" && (
          <>
            <div className="flex justify-end">
              {/* <Button
                        onClick={onClose}
                        className="bg-[#1E1E1E99] px-8 rounded-[2rem] hover:bg-[#1E1E1E99]"
                        type="submit"
                      >
                        Cancel
                      </Button> */}
              <div>
                <Button
                  onClick={handleSaveAsset}
                  className="text-black px-8 rounded-[2rem]"
                  variant="outline"
                  disabled={isLoading || autoSavingsLoading}
                >
                  {isLoading || autoSavingsLoading ? (
                    <LoaderCircle className="animate-spin" />
                  ) : (
                    "Save assets"
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      <SaveSuccessful
        amount={saveState.amount}
        token={
          saveState.token == tokens.safu
            ? "SAFU"
            : saveState.token === tokens.lsk
            ? "LSK"
            : "USDT"
        }
        duration={saveState.duration}
        isOpen={isThirdModalOpen && saveType === "one-time"}
        onClose={() => setIsThirdModalOpen(false)}
      />
      <SuccessfulTxModal
        transactionType="setup-recurring-save"
        amount={saveState.amount}
        token={
          saveState.token == tokens.safu
            ? "SAFU"
            : saveState.token === tokens.lsk
            ? "LSK"
            : "USDT"
        }
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

// {searchTerm && (
//     <div className="absolute top-full left-0 right-0 mt-1 bg-[#1e1e1e] rounded-lg overflow-hidden z-10">
//       <div className="p-4 border-b border-[#333333]">
//         <div className="text-white">Housing</div>
//       </div>
//       <div className="p-4 border-b border-[#333333]">
//         <div className="text-white">Housing accomodation</div>
//       </div>
//       <div className="p-4">
//         <div className="text-white">Housing</div>
//       </div>
//     </div>
//   )}
