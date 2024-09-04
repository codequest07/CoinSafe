import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import ApproveDeposit from "./ApproveDeposit";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import MemoRipple from "@/icons/Ripple";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

export default function UnlockSavings({
  isDepositModalOpen,
  setIsDepositModalOpen,
}: {
  isDepositModalOpen: boolean;
  setIsDepositModalOpen: (open: boolean) => void;
}) {
  const [isThirdModalOpen, setIsThirdModalOpen] = useState(false);

  const openThirdModal = () => {
    setIsThirdModalOpen(true); // Open ApproveDeposit modal
    setIsDepositModalOpen(false); // Close current modal
  };

  return (
    <Dialog open={isDepositModalOpen} onOpenChange={setIsDepositModalOpen}>
      <DialogContent className="sm:max-w-[600px] border-0 text-white bg-[#010104]">
        <DialogTitle className="text-white flex items-center">
          <p>Claim all assets</p>
        </DialogTitle>
        <div className="p-8 text-gray-700">
          {/* Amount Section */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex-1">
              <label htmlFor="amount" className="text-sm text-gray-400">
                Amount
              </label>
              <div className="flex flex-col items-center justify-center">
                <input
                  type="text"
                  id="amount"
                  defaultValue="345,000.67 XRP"
                  className="bg-transparent text-base font-light text-gray-200 border-none focus:outline-none text-center w-full"
                />
                <div className="text-xs text-gray-400 text-center">
                  ≈ $400.56
                </div>
              </div>
            </div>
            <div className="ml-4">
              <Select>
                <SelectTrigger className="w-[140px] bg-gray-700 border-0 bg-[#1E1E1E99] text-white rounded-lg">
                  <div className="flex items-center">
                    <MemoRipple className="mr-2" />
                    <SelectValue placeholder="Ripple" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ripple">
                    <div className="flex items-center space-x-2">
                      <p>Ripple</p>
                    </div>
                  </SelectItem>
                  <SelectItem value="bitcoin">Bitcoin</SelectItem>
                  <SelectItem value="ethereum">Ethereum</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Wallet Balance Section */}
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-[300] text-gray-300">
              Saved balance: <span className="text-gray-400">3000 XRP</span>
            </div>
            <div className="text-sm text-green-400 cursor-pointer">
              Unlock all
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex text-gray-400 flex-col justify-between items-start">
              <span className="text-sm font-[400]">Maturity date</span>
              <span className="font-[300] text-xs">25 Sept, 2024 17:00</span>
            </div>

            <Badge className="bg-[#79E7BA17] rounded-[2rem] mt-4">
              6 days left
            </Badge>
          </div>
          <div className="flex items-center my-5 justify-between">
            <div className="flex text-gray-400 flex-col justify-between items-start">
              <span className="text-sm font-[400]">Breaking fee</span>
              <span className="font-[300] text-sm">0.00234 AVAX</span>
              <span className="font-[300] text-xs">1% of unlocked amount</span>
            </div>

            <Badge className="bg-[#79E7BA17] rounded-[2rem] mt-4">
              ≈ $ 5.00
            </Badge>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={() => setIsDepositModalOpen(false)}
            className="bg-[#1E1E1E99] px-8 rounded-[2rem] hover:bg-[#1E1E1E99]"
            type="submit">
            Cancel
          </Button>
          <div>
            <Button
              onClick={openThirdModal} // Call function to open ApproveDeposit modal
              className="text-black px-8 rounded-[2rem]"
              variant="outline">
              Unlock savings
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>

      <ApproveDeposit
        isOpen={isThirdModalOpen}
        onClose={() => setIsThirdModalOpen(false)}
      />
    </Dialog>
  );
}
