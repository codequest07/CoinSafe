import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useState } from "react";
import MemoBackIcon from "@/icons/BackIcon";
import MemoRipple from "@/icons/Ripple";
import ApproveDeposit from "./ApproveDeposit";

export default function Deposit({
  isDepositModalOpen,
  setIsDepositModalOpen,
  onBack,
}: {
  isDepositModalOpen: boolean;
  setIsDepositModalOpen: (open: boolean) => void;
  onBack: () => void;
}) {
  const [isThirdModalOpen, setIsThirdModalOpen] = useState(false);

  const openThirdModal = () => {
    setIsThirdModalOpen(true);
    setIsDepositModalOpen(false);
  };

  return (
    <Dialog open={isDepositModalOpen} onOpenChange={setIsDepositModalOpen}>
      <DialogContent className="sm:max-w-[600px] border-0 text-white bg-[#010104]">
        <DialogTitle className="text-white flex items-center space-x-3">
          <MemoBackIcon onClick={onBack} className="w-6 h-6 cursor-pointer" />
          <p>Deposit assets</p>
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
              Deposit assets: <span className="text-gray-400">3000 XRP</span>
            </div>
            <div className="text-sm text-green-400 cursor-pointer">Max</div>
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
              onClick={openThirdModal}
              className="text-black px-8 rounded-[2rem]"
              variant="outline">
              Deposit assets
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
