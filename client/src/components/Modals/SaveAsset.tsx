import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
// import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import MemoBackIcon from "@/icons/BackIcon";
// import MemoRipple from "@/icons/Ripple";
// import MemoCalenderIcon from "@/icons/CalenderIcon";
// import { Calendar } from "@/components/ui/calendar"; // Line 20: Added Shadcn Calendar
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover"; // Line 24: Added Popover for calendar
import { format, addDays } from "date-fns";

import { liskSepolia } from "viem/chains";

import { CoinsafeDiamondContract, tokens } from "@/lib/contract";
// import coinSafeAbi from "../../abi/coinsafe.json";
import savingsFacetAbi from "../../abi/SavingsFacet.json";
import { useRecoilState } from "recoil";
import { saveAtom } from "@/store/atoms/save";
// import { config } from "@/lib/config";
import SaveSuccessful from "./SaveSuccessful";
import { LoaderCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useSaveAsset } from "@/hooks/useSaveAsset";
import { usecreateAutoSavings } from "@/hooks/useCreateAutoSavings";
import SuccessfulTxModal from "./SuccessfulTxModal";
import { useBalances } from "@/hooks/useBalances";
import { formatUnits } from "viem";
import { SavingsTargetSelect } from "../SavingsTarget";
// import { DurationSelector } from "../DurationSelector";
import { useActiveAccount } from "thirdweb/react";
// import MemoComingSoonIcon from "@/icons/ComingSoonIcon";

interface SavingsTarget {
  id: string;
  name: string;
  description?: string;
}

export default function SaveAsset({
  isOpen,
  onClose,
  onBack,
  tab,
}: {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  tab?: string;
}) {
  const [frequencies] = useState([
    { value: "86400", label: "Every day" }, // 1 day = 86400 seconds
    { value: "172800", label: "Every 2 days" }, // 2 days = 172800 seconds
    { value: "432000", label: "Every 5 days" }, // 5 days = 432000 seconds
    { value: "604800", label: "Weekly" }, // 1 week = 604800 seconds
    { value: "2592000", label: "Monthly" }, // 1 month = 2592000 seconds (approx. 30 days)
  ]);
  // const [, setSelectedDate] = useState<Date | undefined>(undefined);
  // // const [daysInput, setDaysInput] = useState<number | string>("");
  // const [, setUnlockDate] = useState<Date | null>(null);
  // const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState(tab || "one-time");
  const smartAccount = useActiveAccount();
  const address = smartAccount?.address;

  // console.log("Smart Account", smartAccount);

  // const [token, setToken] = useState("");
  const [selectedTokenBalance, setSelectedTokenBalance] = useState(0);
  const { AvailableBalance } = useBalances(address as string);

  function getFrequencyLabel(value: string) {
    const frequency = frequencies.find(
      (frequency) => frequency.value === value
    );
    return frequency ? frequency.label : undefined; // Return the label or null if not found
  }

  const [selectedOption, setSelectedOption] = useState("by-frequency");
  const [validationErrors, setValidationErrors] = useState<{
    amount?: string;
    token?: string;
    duration?: string;
    transactionPercentage?: string;
    frequency?: string;
  }>({});
  const [savingsTargets, setSavingsTargets] = useState<SavingsTarget[]>([
    { id: "1", name: "Growing up", description: "investment ipsum" },
    { id: "2", name: "Vacation", description: "save for annual vacation" },
  ]);

  // const savingsDurationOptions = [
  //   { value: 30, label: "30 days" },
  //   { value: 60, label: "60 days" },
  //   { value: 120, label: "120 days" },
  // ];

  const [savingsDuration, _] = useState(30);
  const [endDate, setEndDate] = useState("");

  const calculateEndDate = (days: number) => {
    const currentDate = new Date();
    const futureDate = addDays(currentDate, days);
    return format(futureDate, "dd MMMM yyyy");
  };

  useEffect(() => {
    setEndDate(calculateEndDate(savingsDuration));
  }, [savingsDuration, calculateEndDate]);

  // const handleDurationChange = (duration: number) => {
  //   setSavingsDuration(duration);
  //   setEndDate(calculateEndDate(duration));

  //   const durationInSeconds = duration * 24 * 60 * 60;

  //   setSaveState((prevState) => ({
  //     ...prevState,
  //     duration: durationInSeconds,
  //   }));

  //   const calculatedUnlockDate = addDays(new Date(), duration);

  //   setUnlockDate(calculatedUnlockDate);
  //   setSelectedDate(calculatedUnlockDate);
  //   console.log(`Savings duration changed to ${duration} days`);
  // };

  const [, setSelectedTarget] = useState<SavingsTarget | null>(null);

  const handleSelectTarget = (target: SavingsTarget) => {
    setSelectedTarget(target);
    console.log("Selected target:", target);
  };

  const handleCreateTarget = (newTarget: SavingsTarget) => {
    setSavingsTargets((prev) => [...prev, newTarget]);
    console.log("Created new target:", newTarget);
  };

  // LINE 37-60: Comprehensive validation function
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
    if (currentTab === "autosave") {
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

  const [isThirdModalOpen, setIsThirdModalOpen] = useState(false);
  // to multiply the amount based on selected token's decimals
  const [, setDecimals] = useState(1);
  const [saveState, setSaveState] = useRecoilState(saveAtom);

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

  const handleTabChange = (value: string) => {
    console.log("Tab switched to: ", value);
    setCurrentTab(value);
  };

  const { saveAsset, isPending: isLoading } = useSaveAsset({
    address: address as `0x${string}`,
    saveState,
    coinSafeAddress: CoinsafeDiamondContract.address as `0x${string}`,
    coinSafeAbi: savingsFacetAbi,
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

  const handleSaveAsset = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    if (!validateForm()) {
      return;
    }

    if (currentTab === "autosave" && selectedOption === "by-frequency") {
      createAutoSavings(event);
      return;
    }

    saveAsset(event);
  };

  const openThirdModal = () => {
    setIsThirdModalOpen(true);
    onClose();
  };

  useEffect(() => {
    if (address && saveState.token && AvailableBalance) {
      const tokensData = AvailableBalance;
      if (!tokensData) return;

      const tokenBalance =
        tokensData[0]
          .map((address: string, index: number) => ({
            address,
            balance: tokensData[1][index],
          }))
          .find(
            (item: any) =>
              item.address.toLowerCase() === saveState.token.toLowerCase()
          )?.balance || 0n;

      setSelectedTokenBalance(Number(formatUnits(tokenBalance, 18)));
    }
  }, [saveState.token, address, AvailableBalance]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] border-1 border-[#FFFFFF21] text-white bg-[#17171C] max-h-[90vh] overflow-y-auto">
        <DialogTitle className="text-white flex items-center space-x-3">
          <MemoBackIcon onClick={onBack} className="w-6 h-6 cursor-pointer" />
          <p>Save your assets</p>
        </DialogTitle>
        <Tabs
          defaultValue={tab || "one-time"}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <TabsList className="sm:flex space-x-4 text-center justify-between bg-[#1E1E1E99] rounded-[2rem] p-2 mb-4">
            <TabsTrigger
              value="one-time"
              className="flex justify-center rounded-2xl items-center flex-1"
            >
              One-time Save
            </TabsTrigger>
            <TabsTrigger
              value="autosave"
              className="flex justify-center rounded-2xl items-center flex-1"
            >
              Autosave
            </TabsTrigger>
          </TabsList>

          {/* One-time tab content section */}
          <TabsContent value="one-time">
            <div className="p-8 text-gray-700">
              {/* Amount Section */}
              <div className="space-y-2 pb-6 border-b-[1px] border-b-[#FFFFFF21]">
                <label className="text-sm text-gray-400">Amount</label>
                <div className="flex flex-row-reverse justify-between items-center py-7 px-4 bg-transparent border border-[#FFFFFF3D] rounded-xl relative">
                  {/* absolute top-2 right-2  */}
                  <div className="">
                    <div className="ml-4">
                      <Select
                        onValueChange={handleTokenSelect}
                        value={saveState.token}
                      >
                        <SelectTrigger className="w-[140px] bg-gray-700 border-0 bg-[#1E1E1E99] text-white rounded-lg">
                          <div className="flex items-center">
                            {/* <MemoRipple className="mr-2" /> */}
                            <SelectValue placeholder="Select Token" />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={tokens.usdt}>
                            <div className="flex items-center space-x-2">
                              <p>USDT</p>
                            </div>
                          </SelectItem>
                          <SelectItem value={tokens.lsk}>LSK</SelectItem>
                          {/* 0xe4923e889a875eae8c164ac1592b57b5684ed90e - new from Ite */}
                          {/* 0xcf300d5a3d0fc71865a7c92bbc11d6b79c4d1480 - current */}
                          <SelectItem value={tokens.safu}>SAFU</SelectItem>
                        </SelectContent>
                      </Select>
                      {validationErrors.token && (
                        <p className="text-red-500 text-sm mt-1">
                          {validationErrors.token}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-center">
                    <input
                      type="number"
                      value={saveState.amount}
                      onChange={handleAmountChange}
                      className="text-2xl text-[#B5B5B5] font-medium bg-transparent text-left w-full outline-none"
                      placeholder="Enter amount"
                    />
                    {/* <div className="text-sm text-gray-400 mt-1">≈ $400.56</div> */}
                    {/* <div className="text-sm text-gray-400 mt-1">≈ $400.56</div> */}
                  </div>
                </div>
                <div>
                  {saveState.amount > selectedTokenBalance && (
                    <p className="text-red-500 text-[13px] mt-1 text-right">
                      Amount greater than wallet balance
                    </p>
                  )}
                </div>
                <div className="flex justify-between text-sm">
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
                    onClick={() =>
                      setSaveState((prev) => ({
                        ...prev,
                        amount: selectedTokenBalance,
                      }))
                    }
                    variant="link"
                    className="h-auto p-0 text-[#4FFFB0] hover:text-[#4FFFB0]/90"
                  >
                    {/* className="h-auto p-0 text-[#4FFFB0] hover:text-[#4FFFB0]/90"
                  > */}
                    Save all
                  </Button>
                </div>
              </div>

              {/* savings target section */}
              <div className="py-4">
                <SavingsTargetSelect
                  options={savingsTargets}
                  onSelect={handleSelectTarget}
                  onCreate={handleCreateTarget}
                  className="text-white"
                />
              </div>

              <div className="py-4">
                {/* <DurationSelector
                  options={savingsDurationOptions}
                  selectedValue={savingsDuration}
                  onChange={handleDurationChange}
                  className="mb-4"
                /> */}

                <div className="py-4">
                  <p className="text-[12px] font-semibold text-[#CACACA]">
                    Unlocks on <span className="text-[#CACACA]">{endDate}</span>
                  </p>
                </div>
              </div>

              {/* Duration Section */}
              {/* <div className="space-y-4 py-6 text-white">
                <div className="space-y-2 relative">
                  <Label htmlFor="duration">Duration</Label>
                  <div className="relative flex items-center">
                    <Input
                      id="duration"
                      type="number"
                      name="duration"
                      placeholder="Enter days"
                      value={daysInput}
                      onChange={handleDurationChange}
                      className="pl-3 pr-10 flex-grow"
                    />
                    <Popover
                      open={isCalendarOpen}
                      onOpenChange={setIsCalendarOpen}
                    >
                      onOpenChange={setIsCalendarOpen}
                    >
                      <PopoverTrigger asChild>
                        <span onClick={() => setIsCalendarOpen(true)}>
                          <MemoCalenderIcon className="absolute right-1 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
                        </span>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={handleDateSelect}
                          initialFocus
                          disabled={(date) => date < new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div> */}

              {/* Unlock Date Section */}
              {/* <div className="text-sm text-gray-300">
                {unlockDate
                  ? `Unlocks on ${format(unlockDate, "dd MMM, yyyy")}`
                  : "Enter duration to see unlock date"}
              </div> */}
            </div>
          </TabsContent>

          {/* Autosave Tab Content section */}
          <TabsContent value="autosave">
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
                  {/* <Label htmlFor="transactionPercentage">
                    {"Save on every transaction (percentage)"}
                  </Label>
                  <Input
                    id="transactionPercentage"
                    type="number"
                    placeholder="20 %"
                    className="pl-3 pr-4"
                    value={saveState.transactionPercentage || ""}
                    onChange={(e) => {
                      setSaveState((prev) => ({
                        ...prev,
                        transactionPercentage: Number(e.target.value),
                      }));
                    }}
                  />
                  {validationErrors.transactionPercentage && (
                    <p className="text-red-500 text-sm mt-1">
                      {validationErrors.transactionPercentage}
                    </p>
                  )} */}
                </div>
              )}

              {selectedOption === "by-frequency" && (
                <div>
                  <label htmlFor="amount" className="text-sm text-gray-400">
                    Amount
                  </label>
                  <div className="flex items-center justify-between mb-6 border-[1px] border-[#FFFFFF3D] rounded-[8px] py-6 px-4">
                    <div className="flex-1">
                      {/* <label htmlFor="amount" className="text-sm text-gray-400">
                        Amount
                      </label> */}
                      <div className="flex flex-col items-center justify-center">
                        <input
                          type="number"
                          id="amount"
                          placeholder="0"
                          value={saveState.amount || 0} // Line 183: Added fallback
                          onChange={handleAmountChange}
                          className="bg-transparent text-xl font-light text-gray-200 border-none focus:outline-none text-left w-full"
                        />
                        {/* <div className="text-xs text-gray-400 text-center">
                        {/* <div className="text-xs text-gray-400 text-center">
                          ≈ $400.56
                        </div> */}
                        {/* </div> */}
                      </div>
                      {validationErrors.amount && (
                        <p className="text-red-500 text-sm mt-1">
                          {validationErrors.amount}
                        </p>
                      )}
                    </div>
                    <div className="ml-4">
                      <Select
                        onValueChange={handleTokenSelect}
                        value={saveState.token}
                      >
                        <SelectTrigger className="w-[140px] bg-gray-700 border-0 bg-[#1E1E1E99] text-white rounded-lg">
                          <div className="flex items-center">
                            {/* <MemoRipple className="mr-2" /> */}
                            <SelectValue placeholder="Select Token" />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={tokens.usdt}>
                            <div className="flex items-center space-x-2">
                              <p>USDT</p>
                            </div>
                          </SelectItem>
                          <SelectItem value={tokens.lsk}>LSK</SelectItem>
                          <SelectItem value={tokens.safu}>SAFU</SelectItem>
                        </SelectContent>
                      </Select>
                      {validationErrors.token && (
                        <p className="text-red-500 text-sm mt-1">
                          {validationErrors.token}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Wallet balance */}
                  {saveState.token && (
                    <>
                      <div>
                        {saveState.amount > selectedTokenBalance && (
                          <p className="text-red-500 text-[13px] text-right">
                            Amount greater than wallet balance
                          </p>
                        )}
                      </div>
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
                  )}

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
                    <SavingsTargetSelect
                      options={savingsTargets}
                      onSelect={handleSelectTarget}
                      onCreate={handleCreateTarget}
                      className=""
                    />
                  </div>

                  <div className="py-4">
                    {/* <DurationSelector
                      options={savingsDurationOptions}
                      selectedValue={savingsDuration}
                      onChange={handleDurationChange}
                      className="mb-4"
                    /> */}

                    <div className="py-4">
                      <p className="text-[12px] font-semibold text-[#CACACA]">
                        Unlocks on{" "}
                        <span className="text-[#CACACA]">{endDate}</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Common Duration Section */}
              {/* <div className="space-y-2 relative">
                <Label htmlFor="duration">Duration</Label>
                <div className="relative flex items-center">
                  <Input
                    id="duration"
                    type="number"
                    name="duration"
                    placeholder="Enter days"
                    value={daysInput}
                    onChange={handleDurationChange}
                    className="pl-3 pr-10 flex-grow"
                  />
                  <Popover
                    open={isCalendarOpen}
                    onOpenChange={setIsCalendarOpen}
                  >
                    onOpenChange={setIsCalendarOpen}
                  >
                    <PopoverTrigger asChild>
                      <span onClick={() => setIsCalendarOpen(true)}>
                        <MemoCalenderIcon className="absolute right-1 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
                      </span>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleDateSelect}
                        initialFocus
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="text-sm text-gray-300">
                  {unlockDate
                    ? `Unlocks on ${format(unlockDate, "dd MMM, yyyy")}`
                    : "Enter duration to see unlock date"}
                </div>
              </div> */}
            </div>
          </TabsContent>
        </Tabs>

        {selectedOption === "by-frequency" && (
          <>
            <DialogFooter>
              <Button
                onClick={onClose}
                className="bg-[#1E1E1E99] px-8 rounded-[2rem] hover:bg-[#1E1E1E99]"
                type="submit"
              >
                Cancel
              </Button>
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
            </DialogFooter>
          </>
        )}
      </DialogContent>
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
        isOpen={isThirdModalOpen && currentTab === "one-time"}
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
          currentTab === "autosave" &&
          selectedOption === "by-frequency"
        }
        onClose={() => setIsThirdModalOpen(false)}
        additionalDetails={{
          frequency: getFrequencyLabel(saveState.frequency.toString()),
        }}
      />
    </Dialog>
  );
}
