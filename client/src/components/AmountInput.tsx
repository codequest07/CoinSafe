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

  // Enhanced token select handler that clears amount
  const handleTokenSelectWithClear = (value: string) => {
    // Clear the amount by triggering a change event with empty value
    const clearEvent = {
      target: { value: "" },
    } as React.ChangeEvent<HTMLInputElement>;
    handleAmountChange(clearEvent);

    // Then handle the token selection
    handleTokenSelect(value);
  };

  // Get the selected token info
  const selectedTokenInfo = saveState.token ? tokenData[saveState.token] : null;

  return (
    <div className="mb-4">
      <label className="text-sm text-gray-400">Amount</label>

      <div className="mt-2 relative">
        <div className="flex items-center gap-3 bg-transparent rounded-[8px] border-[1px] border-[#FFFFFF3D] px-4 py-4">
          <div className="flex-1">
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
          <div className="flex-shrink-0">
            <Select
              onValueChange={handleTokenSelectWithClear}
              value={saveState.token}>
              <SelectTrigger className="w-28 h-12 bg-gray-700 border-[1px] border-[#FFFFFF21] bg-[#1E1E1E99] text-white rounded-lg">
                <div className="flex items-center">
                  {saveState.token && selectedTokenInfo?.image ? (
                    <div className="w-4 h-4 rounded-full overflow-hidden flex items-center justify-center mr-2">
                      <img
                        src={selectedTokenInfo.image}
                        width={16}
                        height={16}
                        className="w-full h-full"
                        alt={selectedTokenInfo.symbol}
                      />
                    </div>
                  ) : saveState.token && selectedTokenInfo ? (
                    <div
                      className={`w-4 h-4 rounded-full ${
                        selectedTokenInfo?.color || "bg-gray-600"
                      } flex items-center justify-center text-white text-xs font-medium mr-2`}>
                      {selectedTokenInfo?.symbol?.charAt(0) || "?"}
                    </div>
                  ) : null}
                  {saveState.token ? (
                    <span className="text-white text-sm">
                      {selectedTokenInfo?.symbol}
                    </span>
                  ) : (
                    <SelectValue placeholder="Token" />
                  )}
                </div>
              </SelectTrigger>
              <SelectContent>
                {supportedTokens.map((token) => {
                  const tokenInfo = tokenData[token];
                  return (
                    <SelectItem value={token} key={token}>
                      <div className="flex items-center">
                        {tokenInfo?.image ? (
                          <div className="w-4 h-4 rounded-full overflow-hidden flex items-center justify-center mr-2">
                            <img
                              src={tokenInfo.image}
                              width={16}
                              height={16}
                              className="w-full h-full"
                              alt={tokenInfo.symbol}
                            />
                          </div>
                        ) : (
                          <div
                            className={`w-4 h-4 rounded-full ${
                              tokenInfo?.color || "bg-gray-600"
                            } flex items-center justify-center text-white text-xs font-medium mr-2`}>
                            {tokenInfo?.symbol?.charAt(0) || "?"}
                          </div>
                        )}
                        <span className="text-sm">
                          {tokenInfo?.symbol || token}
                        </span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </div>
        {validationErrors.token && (
          <p className="text-red-500 text-sm mt-1">{validationErrors.token}</p>
        )}
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
