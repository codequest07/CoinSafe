// import React from 'react'
import { useRef } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

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
}

const AmountInput = ({
  amount,
  handleTokenSelect,
  handleAmountChange,
  saveState,
  selectedTokenBalance,
  tokens,
  validationErrors,
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
              value={amount}
              onChange={handleAmountChange}
              ref={inputRef}
              onFocus={handleFocus}
              className="bg-transparent text-base outline-none w-full"
            />
            {/* <div className="text-xs text-gray-300">≈ 400.58</div> */}
          </div>
          <div className="relative">
            <Select onValueChange={handleTokenSelect} value={saveState.token}>
              <SelectTrigger className="w-[140px] bg-gray-700 border-[1px] border-[#FFFFFF21] bg-[#1E1E1E99] text-white rounded-lg">
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
        {/* error message section */}
        <div>
          {saveState.amount > selectedTokenBalance && (
            <p className="text-red-500 text-[13px] mt-1 text-right">
              Amount greater than wallet balance
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AmountInput;

{
  /* <div className="space-y-2 pb-6 border-b-[1px] border-b-[#FFFFFF21]"> */
}

// <div className="flex flex-row-reverse justify-between items-center py-7 px-4 bg-transparent border border-[#FFFFFF3D] rounded-xl relative">
//   <div className="">
//     <div className="ml-4">
//       {/* select input was here */}
//       {validationErrors.token && (
//         <p className="text-red-500 text-sm mt-1">
//           {validationErrors.token}
//         </p>
//       )}
//     </div>
//   </div>
//   <div className="flex flex-col items-center">
//     <input
//       type="number"
//       value={saveState.amount}
//       onChange={handleAmountChange}
//       className="text-2xl text-[#B5B5B5] font-medium bg-transparent text-left w-full outline-none"
//       placeholder="Enter amount"
//     />
//   </div>
// </div>

{
  /* wallet balance section */
}
{
  /* <div className="flex justify-between text-sm">
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

                    Save all
                  </Button>
                </div> */
}
{
  /* </div> */
}
