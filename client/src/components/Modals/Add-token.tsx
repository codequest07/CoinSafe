import { Loader2, X } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
// import { Badge } from "@/components/ui/badge";
import { useRecoilState } from "recoil";
import { saveAtom } from "@/store/atoms/save";
import { CoinsafeDiamondContract, tokens } from "@/lib/contract";
import { balancesState, supportedTokensState } from "@/store/atoms/balance";
import { tokenData } from "@/lib/utils";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { formatUnits } from "viem";
import { useAddTokenToAutomatedPlan } from "@/hooks/useAddTokenToAutomatedPlan";
import { Account } from "thirdweb/wallets";
import { useActiveAccount } from "thirdweb/react";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import SuccessfulTxModal from "./SuccessfulTxModal";
import { useCreateAutoSavings } from "@/hooks/useCreateAutoSavings";
// interface AddTokenModalProps {
//   onClose: () => void;
// }

interface AddTokenModalProps {
  open: boolean;
  details: any;
  onClose: () => void;
  onSuccess?: () => void;
  account?: Account | undefined;
  coinSafeAddress?: `0x${string}`;
}

export default function AddToken({
  details,
  open,
  onClose,
  onSuccess,
}: AddTokenModalProps) {
  if (!open) return null; // If the modal is not open, return null
  const [saveState, setSaveState] = useRecoilState(saveAtom);
  const [selectedTokenBalance, setSelectedTokenBalance] = useState(0);
  const [supportedTokens] = useRecoilState(supportedTokensState);
  const [balances] = useRecoilState(balancesState);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [autoSafeTokenOptions, setAutoSafeTokenOptions] = useState<string[]>(
    []
  );

  console.log(details, "details in add token modal");

  const smartAccount = useActiveAccount();

  // Get available balances
  const AvailableBalance = useMemo(() => balances?.available || {}, [balances]);

  const { hasCreatedAutoSafe } = useCreateAutoSavings({
    address: smartAccount?.address as `0x${string}`,
    saveState,
  });

  const { addTokenToPlan, isLoading } = useAddTokenToAutomatedPlan({
    account: smartAccount,
    token: saveState.token as `0x${string}`,
    amount: saveState.amount,
    frequency: saveState.frequency,
    coinSafeAddress: CoinsafeDiamondContract.address as `0x${string}`,
    toast: ({ title, variant }) => {
      console.log(`${variant.toUpperCase()}: ${title}`);
      toast({ title, variant });
      // Replace with your preferred toast library (e.g., react-toastify)
    },
    onSuccess: () => {
      console.log("Token added successfully");
      setShowSuccessModal(true);

      setTimeout(() => {
        setShowSuccessModal(false); // Close success modal after 5 seconds
        onSuccess?.();
      }, 5000);
    },
    onError: (err) => {
      console.error("Transaction error:", err);
      toast({
        title: `Transaction failed: ${err.message || "Unknown error"}`,
        variant: "destructive",
      });
    },
  });

  const [validationErrors] = useState<{
    amount?: string;
    token?: string;
    duration?: string;
    transactionPercentage?: string;
    frequency?: string;
  }>({});

  // Initialize token if not set and update token balance
  useEffect(() => {
    // Only fetch autoSafeTokenOptions when supportedTokens change
    async function run() {
      const { tokens } = await hasCreatedAutoSafe(supportedTokens);
      setAutoSafeTokenOptions(tokens);
    }
    run();
  }, [supportedTokens]);

  useEffect(() => {
    // Only set token if not set and options are available
    if (
      !saveState.token &&
      supportedTokens.length > 0 &&
      autoSafeTokenOptions.length > 0
    ) {
      const availableTokens = supportedTokens.filter(
        (token) => !autoSafeTokenOptions.includes(token)
      );
      if (availableTokens.length > 0) {
        setSaveState((prev) => ({
          ...prev,
          token: availableTokens[0],
        }));
      }
    }
    // Only run when token/options change
  }, [saveState.token, supportedTokens, autoSafeTokenOptions, setSaveState]);

  // Update token balance when component mounts or token changes
  useEffect(() => {
    if (saveState.token && AvailableBalance) {
      const tokensData = AvailableBalance;
      if (!tokensData) return;

      const tokenBalance = (AvailableBalance[saveState.token] as bigint) || 0n;

      // Get the correct decimals for the token
      let tokenDecimals = 18;
      if (saveState.token === tokens.usdt) {
        tokenDecimals = 18;
      } else {
        tokenDecimals = 18;
      }

      setSelectedTokenBalance(Number(formatUnits(tokenBalance, tokenDecimals)));
    }
  }, [saveState.token, AvailableBalance]);

  const [frequencies] = useState([
    { value: "86400", label: "Every day" }, // 1 day = 86400 seconds
    { value: "172800", label: "Every 2 days" }, // 2 days = 172800 seconds
    { value: "432000", label: "Every 5 days" }, // 5 days = 432000 seconds
    { value: "604800", label: "Weekly" }, // 1 week = 604800 seconds
    { value: "2592000", label: "Monthly" }, // 1 month = 2592000 seconds (approx. 30 days)
  ]);

  function getFrequencyLabel(value: string) {
    const frequency = frequencies.find(
      (frequency) => frequency.value === value
    );
    return frequency ? frequency.label : undefined; // Return the label or null if not found
  }

  const handleFrequencyChange = (value: string) => {
    const _frequency = Number(value);
    setSaveState((prevState) => ({
      ...prevState,
      frequency: _frequency,
    }));
  };

  const handleTokenSelect = (value: string) => {
    // Update the token in the state
    setSaveState((prevState) => ({ ...prevState, token: value }));
  };

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const _amount = Number(event.target.value);
    setSaveState((prevState) => ({
      ...prevState,
      amount: _amount,
    }));
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-transparent z-50">
      <div
        className="absolute inset-0 bg-black/80"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}></div>
      <div className="relative w-full max-w-md rounded-xl border border-white/15 p-1 bg-[#17171C] text-white shadow-lg">
        <div className="flex items-center justify-between p-4 pb-2">
          <h2 className="text-lg font-medium">Add token to safe</h2>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="rounded-full p-1 bg-white "
            aria-label="Close">
            <X className="h-4 w-4 text-black" />
          </button>
        </div>

        <div className="p-4 space-y-5">
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <span className="text-base font-medium">Auto savings</span>
              {/* <Badge className="bg-[#79E7BA33] rounded-full px-3 py-1 text-xs text-gray-300">
                Unlocks every 30 days
              </Badge> */}
            </div>
            <div className="mt-1 text-sm text-gray-400">
              Next unlock date:{" "}
              {details?.unlockTime
                ? format(new Date(Number(details.unlockTime) * 1000), "PPP")
                : "N/A"}
            </div>
          </div>

          <div className="mb-4">
            <label className="text-sm text-gray-400">Amount</label>
            <div className="flex flex-row-reverse justify-between items-center py-7 px-4 bg-transparent border border-[#FFFFFF3D] rounded-xl relative mt-1">
              <div className="">
                <div className="ml-4">
                  <Select
                    onValueChange={handleTokenSelect}
                    value={saveState.token}>
                    <SelectTrigger className="w-[140px] bg-gray-700 border-0 bg-[#1E1E1E99] text-white rounded-lg z-[9999]">
                      <div className="flex items-center">
                        <SelectValue placeholder="Select Token" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {supportedTokens
                        .filter(
                          (token) => !autoSafeTokenOptions.includes(token)
                        )
                        .map((token) => (
                          <SelectItem value={token} key={token}>
                            {tokenData[token]?.symbol}
                          </SelectItem>
                        ))}
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
                  value={saveState.amount || ""}
                  onChange={handleAmountChange}
                  className="text-2xl text-[#B5B5B5] font-medium bg-transparent text-left w-full outline-none"
                />
              </div>
            </div>
            <div>
              {saveState.amount > selectedTokenBalance && (
                <p className="text-red-500 text-[13px] mt-1 text-right">
                  Amount greater than wallet balance
                </p>
              )}
            </div>
          </div>

          {/* Wallet balance */}
          <>
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-[300] text-gray-300">
                Wallet balance:{" "}
                <span className="text-gray-400">
                  {selectedTokenBalance}{" "}
                  {tokenData[saveState.token]?.symbol || ""}
                </span>
              </div>
              <Button
                className="text-sm border-none outline-none bg-transparent hover:bg-transparent text-[#79E7BA] cursor-pointer"
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

          <div className="mt-8 flex justify-between">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="rounded-full bg-[#FFFFFF2B] px-6 py-2 text-white">
              Cancel
            </button>
            <button
              // onClick={(e) => {

              //   e.stopPropagation();
              //   // Add token logic here
              //   onClose();
              // }}
              onClick={addTokenToPlan}
              disabled={
                isLoading ||
                !saveState.token ||
                !saveState.amount ||
                !saveState.frequency
              }
              className="rounded-full bg-white px-6 py-2 text-black hover:bg-gray-200 disabled:cursor-not-allowed transition-all disabled:opacity-70 flex items-center justify-center">
              {isLoading ? <Loader2 className="animate-spin" /> : "Add token"}
            </button>
          </div>
        </div>
      </div>

      <div></div>

      {/* Successful Transaction modal */}
      {showSuccessModal && (
        <div
          className="modal-container"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
          }}>
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
            isOpen={showSuccessModal}
            onClose={() => setShowSuccessModal(false)}
            additionalDetails={{
              frequency: getFrequencyLabel(saveState.frequency.toString()),
            }}
          />
        </div>
      )}
    </div>
  );
}
