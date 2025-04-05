import type React from "react";
import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRecoilState } from "recoil";
import { saveAtom } from "@/store/atoms/save";
import { tokens } from "@/lib/contract";
import AmountInput from "../AmountInput";
interface TopUpModalProps {
  onClose: () => void;
  onTopUp: (amount: number, currency: string) => void;
}

export default function TopUpModal({ onClose, onTopUp }: TopUpModalProps) {
  const [amount] = useState("0.00");
  const [currency] = useState("LSK");
  const [selectedTokenBalance, _setSelectedTokenBalance] = useState(0);
  const [saveState, setSaveState] = useRecoilState(saveAtom);
  const [, setDecimals] = useState(1);
  const [validationErrors] = useState<{
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
  const handleTopUp = () => {
    onTopUp(Number.parseFloat(amount), currency);
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
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-white text-[20px] font-[400]">
              Emergency savings
            </h3>
            <span className="bg-[#79E7BA33] text-[#F1F1F1] text-sm px-3 py-1 rounded-full">
              Unlocks every 30 days
            </span>
          </div>
          <p className="text-[#F1F1F1] text-[14px]">
            Next unlock date: 26th December, 2025
          </p>
        </div>
        <AmountInput
          amount={saveState.amount}
          handleAmountChange={handleAmountChange}
          handleTokenSelect={handleTokenSelect}
          saveState={saveState}
          tokens={tokens}
          selectedTokenBalance={selectedTokenBalance}
          validationErrors={validationErrors}
        />

        {/* Wallet balance */}
        <>
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
            className="px-8 py-3 rounded-full bg-white text-black font-medium hover:bg-gray-200 border-0">
            Top up
          </Button>
        </div>
      </div>
    </div>
  );
}
