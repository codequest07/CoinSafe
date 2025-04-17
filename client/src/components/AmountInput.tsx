// import React from 'react'
import { useRef } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { tokenData } from "@/lib/utils";
import MemoRipple from "@/icons/Ripple";

interface ISaveState {
  target: string;
  token: string;
  amount: number;
  duration: number;
  typeName: string;
  transactionPercentage: number;
  frequency: number;
}

interface IAmountInput {
  amount: number | string;
  handleTokenSelect: (value: string) => void;
  handleAmountChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  saveState: ISaveState;
  selectedTokenBalance: any;
  tokens: any;
  validationErrors: any;
  supportedTokens: string[];
}

const AmountInput = ({
  amount,
  handleTokenSelect,
  handleAmountChange,
  saveState,
  selectedTokenBalance,
  validationErrors,
  supportedTokens,
}: IAmountInput) => {
  // number input stuff
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFocus = () => {
    if (inputRef.current) {
      inputRef.current.select();
    }
  };

  return (
    <div className="mb-1">
      <label className="text-sm text-gray-400">Amount</label>

      <div className="mt-1 relative">
        <div className="flex items-center justify-between bg-transparent rounded-[8px] border-[1px] border-[#FFFFFF3D] px-4 py-6">
          <div>
            <input
              type="number"
              value={amount === 0 ? "" : amount}
              onChange={handleAmountChange}
              ref={inputRef}
              onFocus={handleFocus}
              placeholder="0.00"
              className="bg-transparent text-[#B5B5B5] text-base outline-none w-full"
            />
            {/* <div className="text-xs text-gray-300">≈ 400.58</div> */}
          </div>
          <div className="relative">
            <Select onValueChange={handleTokenSelect} value={saveState.token}>
              <SelectTrigger className="w-[140px] bg-gray-700 border-[1px] border-[#FFFFFF21] bg-[#1E1E1E99] text-white rounded-lg">
                <div className="flex items-center">
                  <MemoRipple className="mr-2" />
                  <SelectValue placeholder="Select Token" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {supportedTokens.map((token) => (
                  <SelectItem value={token}>
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
        {/* error message section */}
        <div>
          {saveState.amount > selectedTokenBalance && (
            <p className="text-red-500 text-[13px] mt-1 text-right">
              Insufficient Funds        
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AmountInput;
