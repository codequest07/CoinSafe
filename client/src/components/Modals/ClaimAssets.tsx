import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import MemoAvax from "@/icons/Avax";
import { ClaimAssetsData } from "@/lib/data";
import UnlockSavings from "./UnlockSavings";

export default function ClaimAssets({
  isDepositModalOpen,
  setIsDepositModalOpen,
}: {
  isDepositModalOpen: boolean;
  setIsDepositModalOpen: (open: boolean) => void;
  onBack: () => void;
}) {
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);

  const openUnlockModal = () => {
    setIsUnlockModalOpen(true);
    setIsDepositModalOpen(false);
  };

  return (
    <Dialog open={isDepositModalOpen} onOpenChange={setIsDepositModalOpen}>
      <DialogContent className="sm:max-w-[600px] border-0 text-white bg-[#010104]">
        <DialogTitle className="text-white flex items-center">
          <p>Claim all assets</p>
        </DialogTitle>
        {ClaimAssetsData.map((items, index) => (
          <div
            key={index}
            className="bg-black border-b border-[#FFFFFF17] text-white p-3 rounded-lg">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <MemoAvax className="w-8 h-8" />
                  <div className="flex items-center flex-col">
                    <span className="font-[400] text-base">{items.token}</span>
                    <span className="font-[400] text-sm">{items.network}</span>
                  </div>
                </div>
                <div className="flex flex-col items-start justify-start">
                  <span className="text-base font-[500]">{items.amount}</span>
                  <span className="text-xs">{items.percentage}</span>
                </div>
                <Button
                  onClick={openUnlockModal} // Call function to open UnlockSavings
                  variant="link"
                  className="text-[#79E7BA] text-base hover:text-[#79E7BA] ">
                  {items.status}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </DialogContent>

      {/* Unlock Savings Modal */}
      <UnlockSavings
        isDepositModalOpen={isUnlockModalOpen}
        setIsDepositModalOpen={setIsUnlockModalOpen} // Control the UnlockSavings modal state
      />
    </Dialog>
  );
}
