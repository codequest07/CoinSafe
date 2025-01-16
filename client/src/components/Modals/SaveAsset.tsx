import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
import MemoCalenderIcon from "@/icons/CalenderIcon";
import { Calendar } from "@/components/ui/calendar"; // Line 20: Added Shadcn Calendar
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"; // Line 24: Added Popover for calendar
import { format, differenceInDays, addDays } from "date-fns";

import { useAccount } from "wagmi";
// import { waitForTransactionReceipt } from "@wagmi/core";
import { liskSepolia } from "viem/chains";
// import { injected } from "wagmi/connectors";
import { CoinSafeContract, tokens } from "@/lib/contract";
import coinSafeAbi from "../../abi/coinsafe.json";
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
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [daysInput, setDaysInput] = useState<number | string>("");
  const [unlockDate, setUnlockDate] = useState<Date | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState(tab || "one-time");
  const { address } = useAccount();

  // const [token, setToken] = useState("");
  const [selectedTokenBalance, setSelectedTokenBalance] = useState(0);
  const { AvailableBalance } = useBalances(address as string);

  function getFrequencyLabel(value: string) {
    const frequency = frequencies.find(
      (frequency) => frequency.value === value
    );
    return frequency ? frequency.label : undefined; // Return the label or null if not found
  }

  // Line 50-64: New handler for calendar date selection
  const handleDateSelect = (selectedDay: Date | undefined) => {
    if (selectedDay) {
      setSelectedDate(selectedDay);

      // Calculate days difference from today
      const days = differenceInDays(selectedDay, new Date());

      // Update days input and set unlock date
      setDaysInput(days);

      // Calculate duration in seconds for smart contract
      const durationInSeconds = days * 24 * 60 * 60;

      setSaveState((prevState) => ({
        ...prevState,
        duration: durationInSeconds,
      }));

      setUnlockDate(selectedDay);

      // Close calendar popover
      setIsCalendarOpen(false);
    }
  };

  const handleDurationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const days = Number(event.target.value);
    setDaysInput(days);

    const calculatedUnlockDate = addDays(new Date(), days);
    const durationInSeconds = days * 24 * 60 * 60;

    setSaveState((prevState) => ({
      ...prevState,
      duration: durationInSeconds,
    }));

    setUnlockDate(calculatedUnlockDate);
    setSelectedDate(calculatedUnlockDate);
  };

  const [selectedOption, setSelectedOption] = useState("by-frequency");
  const [validationErrors, setValidationErrors] = useState<{
    amount?: string;
    token?: string;
    duration?: string;
    transactionPercentage?: string;
    frequency?: string;
  }>({});

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
      if (selectedOption === "per-transaction") {
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
  // const { address } = useAccount();

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let _amount = Number(event.target.value);
    setSaveState((prevState) => ({
      ...prevState,
      amount: _amount,
    }));
  };

  const handleFrequencyChange = (value: string) => {
    let _frequency = Number(value);
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

  const { saveAsset, isLoading } = useSaveAsset({
    address,
    saveState,
    coinSafeAddress: CoinSafeContract.address as `0x${string}`,
    coinSafeAbi: coinSafeAbi.abi,
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
      address,
      saveState,
      coinSafeAddress: CoinSafeContract.address as `0x${string}`,
      coinSafeAbi: coinSafeAbi.abi,
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
    if (address && saveState.token && AvailableBalance?.data) {
      const tokensData = AvailableBalance?.data as any[];
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
  }, [saveState.token, address, AvailableBalance?.data]);

  useEffect(() => {
    if (address && saveState.token && AvailableBalance?.data) {
      const tokensData = AvailableBalance?.data as any[];
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
  }, [saveState.token, address, AvailableBalance?.data]);

  useEffect(() => {
      if (address && saveState.token && AvailableBalance?.data) {
        const tokensData = AvailableBalance?.data as any[];
        if (!tokensData) return;
  
        const tokenBalance =
          tokensData[0]
            .map((address: string, index: number) => ({
              address,
              balance: tokensData[1][index],
            }))
            .find((item: any) => item.address.toLowerCase() === saveState.token.toLowerCase())
            ?.balance || 0n;
  
        setSelectedTokenBalance(Number(formatUnits(tokenBalance, 18)));
      }
    }, [saveState.token, address, AvailableBalance?.data]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] border-0 text-white bg-[#09090B]">
        <DialogTitle className="text-white flex items-center space-x-3">
          <MemoBackIcon onClick={onBack} className="w-6 h-6 cursor-pointer" />
          <p>Save your assets</p>
        </DialogTitle>
        <Tabs
          defaultValue={tab || "one-time"}
          onValueChange={handleTabChange}
          className="w-full">
          <TabsList className="sm:flex space-x-4 text-center justify-between bg-[#1E1E1E99] rounded-[2rem] p-2 mb-4">
            <TabsTrigger
              value="one-time"
              className="flex justify-center rounded-2xl items-center flex-1">
              One-time Save
            </TabsTrigger>
            <TabsTrigger
              value="autosave"
              className="flex justify-center rounded-2xl items-center flex-1">
              Autosave
            </TabsTrigger>
          </TabsList>
          <TabsContent value="one-time">
            <div className="p-8 text-gray-700">
              {/* Amount Section */}
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Amount</label>
                <div className="p-4 bg-transparent border border-[#FFFFFF3D] rounded-xl relative">
                  <div className="absolute top-2 right-2">
                    <div className="ml-4">
                      <Select onValueChange={handleTokenSelect}>
                        <SelectTrigger className="w-[140px] bg-gray-700 border-0 bg-[#1E1E1E99] text-white rounded-lg">
                          <div className="flex items-center">
                            {/* <MemoRipple className="mr-2" /> */}
                            <SelectValue placeholder="Select Token" />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0xd26be7331edd458c7afa6d8b7fcb7a9e1bb68909">
                            <div className="flex items-center space-x-2">
                              <p>USDT</p>
                            </div>
                          </SelectItem>
                          <SelectItem value="0x8a21CF9Ba08Ae709D64Cb25AfAA951183EC9FF6D">
                            LSK
                          </SelectItem>
                          <SelectItem value="0xBb88E6126FdcD4ae6b9e3038a2255D66645AEA7a">
                            SAFU
                          </SelectItem>
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
                      type="text"
                      value={saveState.amount}
                      onChange={handleAmountChange}
                      className="text-2xl font-medium bg-transparent text-center w-full outline-none"
                      placeholder="Enter amount"
                    />
                    <div className="text-sm text-gray-400 mt-1">≈ $400.56</div>
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <div>
                      {saveState.amount > selectedTokenBalance && (
                        <p className="text-red-500 text-[13px] text-right">
                          Amount greater than wallet balance
                        </p>
                      )}
                    </div>
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
                  </div>
                  <Button
                    onClick={() =>
                      setSaveState((prev) => ({
                        ...prev,
                        amount: selectedTokenBalance,
                      }))
                    }
                    variant="link"
                    className="h-auto p-0 text-[#4FFFB0] hover:text-[#4FFFB0]/90">
                    Save all
                  </Button>
                </div>
              <div className="text-sm text-green-400 cursor-pointer">
                  Save all
                </div> */}
              </div>

              {/* Duration Section */}
              <div className="space-y-4 py-6 text-white">
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
                      onOpenChange={setIsCalendarOpen}>
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
              </div>

              {/* Unlock Date Section */}
              <div className="text-sm text-gray-300">
                {unlockDate
                  ? `Unlocks on ${format(unlockDate, "dd MMM, yyyy")}`
                  : "Enter duration to see unlock date"}
              </div>
            </div>
          </TabsContent>
          <TabsContent value="autosave">
            <div className="space-y-4 py-4">
              <p className="font-[200] text-base">Choose savings method</p>
              <div className="flex gap-2">
                {/* <Label
                  htmlFor="per-transaction"
                  className="flex items-center gap-2 rounded-md border-0 px-4 py-3 h-24 bg-[#131313B2] text-gray-400">
                  <input
                    type="radio"
                    id="per-transaction"
                    name="savingOption"
                    value="per-transaction"
                    checked={selectedOption === "by-spend&save"}
                    onChange={() => setSelectedOption("per-transaction")}
                    className="appearance-none h-4 w-4 border-2 border-gray-400 rounded-full checked:bg-[#79E7BA] checked:border-[#79E7BA] focus:outline-none"
                  />
                  <div className="flex-1 ml-3">
                    <div className="font-medium mb-1">Spend and save</div>
                    <p className="text-xs font-[400] text-muted-foreground">
                      save a percentage of every transaction
                    </p>
                  </div>
                </Label> */}
                <Label
                  htmlFor="per-transaction"
                  className="flex items-center gap-2 rounded-md border-0 px-4 py-3 h-24 bg-[#131313B2] text-gray-400">
                  <input
                    type="radio"
                    id="per-transaction"
                    name="savingOption"
                    value="per-transaction"
                    checked={selectedOption === "per-transaction"}
                    onChange={() => setSelectedOption("per-transaction")}
                    className="appearance-none h-4 w-4 border-2 border-gray-400 rounded-full checked:bg-[#79E7BA] checked:border-[#79E7BA] focus:outline-none"
                  />
                  <div className="flex-1 ml-3">
                    <div className="font-medium mb-1">Spend and save</div>
                    <p className="text-xs font-[400] text-white">
                    save a percentage of every transaction
                    </p>
                  </div>
                </Label>
                <Label
                  htmlFor="by-frequency"
                  className="flex items-center gap-2 rounded-md border-0 px-4 py-3 h-24 bg-[#131313B2] text-gray-400">
                  <input
                    type="radio"
                    id="by-frequency"
                    name="savingOption"
                    value="by-frequency"
                    checked={selectedOption === "by-frequency"}
                    onChange={() => setSelectedOption("by-frequency")}
                    className="appearance-none h-4 w-4 border-2 border-gray-400 rounded-full checked:bg-[#79E7BA] checked:border-[#79E7BA] focus:outline-none"
                  />
                  <div className="flex-1 ml-3">
                    <div className="font-medium mb-1">By frequency</div>
                    <p className="text-xs font-[400] text-white">
                      Save a fixed amount by frequency
                    </p>
                  </div>
                </Label>
              </div>

              {/* Conditionally Rendered Content */}
              {selectedOption === "per-transaction" && (
                <div className="space-y-4 py-2 text-white">
                  <Label htmlFor="transactionPercentage">
                    Save on every transaction (percentage)
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
                  )}
                </div>
              )}

              {selectedOption === "by-spend&save" && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex-1">
                      <label htmlFor="amount" className="text-sm text-gray-400">
                        Amount
                      </label>
                      <div className="flex flex-col items-center justify-center">
                        <input
                          type="text"
                          id="amount"
                          placeholder="345,000.67 XRP"
                          value={saveState.amount || ""} // Line 183: Added fallback
                          onChange={handleAmountChange}
                          className="bg-transparent text-base font-light text-gray-200 border-none focus:outline-none text-center w-full"
                        />
                        {/* <div className="text-xs text-gray-400 text-center">
                          ≈ $400.56
                        </div> */}
                      </div>
                      {validationErrors.amount && (
                        <p className="text-red-500 text-sm mt-1">
                          {validationErrors.amount}
                        </p>
                      )}
                    </div>
                    <div className="ml-4">
                      <Select onValueChange={handleTokenSelect}>
                        <SelectTrigger className="w-[140px] bg-gray-700 border-0 bg-[#1E1E1E99] text-white rounded-lg">
                          <div className="flex items-center">
                            {/* <MemoRipple className="mr-2" /> */}
                            <SelectValue placeholder="Select Token" />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0xd26be7331edd458c7afa6d8b7fcb7a9e1bb68909">
                            <div className="flex items-center space-x-2">
                              <p>USDT</p>
                            </div>
                          </SelectItem>
                          <SelectItem value="0x8a21CF9Ba08Ae709D64Cb25AfAA951183EC9FF6D">
                            LSK
                          </SelectItem>
                          <SelectItem value="0xBb88E6126FdcD4ae6b9e3038a2255D66645AEA7a">
                            SAFU
                          </SelectItem>
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
                          }>
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
                </div>
              )}
              {selectedOption === "by-frequency" && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex-1">
                      <label htmlFor="amount" className="text-sm text-gray-400">
                        Amount
                      </label>
                      <div className="flex flex-col items-center justify-center">
                        <input
                          type="text"
                          id="amount"
                          placeholder="345,000.67 XRP"
                          value={saveState.amount || ""} // Line 183: Added fallback
                          onChange={handleAmountChange}
                          className="bg-transparent text-base font-light text-gray-200 border-none focus:outline-none text-center w-full"
                        />
                        {/* <div className="text-xs text-gray-400 text-center">
                          ≈ $400.56
                        </div> */}
                      </div>
                      {validationErrors.amount && (
                        <p className="text-red-500 text-sm mt-1">
                          {validationErrors.amount}
                        </p>
                      )}
                    </div>
                    <div className="ml-4">
                      <Select onValueChange={handleTokenSelect}>
                        <SelectTrigger className="w-[140px] bg-gray-700 border-0 bg-[#1E1E1E99] text-white rounded-lg">
                          <div className="flex items-center">
                            {/* <MemoRipple className="mr-2" /> */}
                            <SelectValue placeholder="Select Token" />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0xd26be7331edd458c7afa6d8b7fcb7a9e1bb68909">
                            <div className="flex items-center space-x-2">
                              <p>USDT</p>
                            </div>
                          </SelectItem>
                          <SelectItem value="0x8a21CF9Ba08Ae709D64Cb25AfAA951183EC9FF6D">
                            LSK
                          </SelectItem>
                          <SelectItem value="0xBb88E6126FdcD4ae6b9e3038a2255D66645AEA7a">
                            SAFU
                          </SelectItem>
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
                          }>
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
                </div>
              )}

              {/* Common Duration Section */}
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
                    onOpenChange={setIsCalendarOpen}>
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
              </div>
            </div>
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <Button
            onClick={onClose}
            className="bg-[#1E1E1E99] px-8 rounded-[2rem] hover:bg-[#1E1E1E99]"
            type="submit">
            Cancel
          </Button>
          <div>
            <Button
              onClick={handleSaveAsset}
              className="text-black px-8 rounded-[2rem]"
              variant="outline"
              disabled={isLoading || autoSavingsLoading}>
              {isLoading || autoSavingsLoading ? (
                <LoaderCircle className="animate-spin" />
              ) : (
                "Save assets"
              )}
            </Button>
          </div>
        </DialogFooter>
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