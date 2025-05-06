import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import MemoLogo2 from "@/icons/Logo2";
import { useEffect } from "react";

export default function ApproveTxModal({
  amount,
  token,
  text,
  isOpen,
  onClose,
  disableAutoClose = false,
}: {
  amount: number | string;
  text: string;
  token: string;
  isOpen: boolean;
  onClose: () => void;
  disableAutoClose?: boolean;
}) {
  useEffect(() => {
    if (isOpen && !disableAutoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000); // Close modal after 5 seconds

      return () => clearTimeout(timer); // Cleanup timer on unmount
    }
  }, [isOpen, onClose, disableAutoClose]);
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[390px] sm:max-w-[500px] p-6 border-1 border-[#FFFFFF21] text-white bg-[#17171C] rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <DialogTitle className="text-lg font-semibold">
            Approve Transaction
          </DialogTitle>
        </div>

        <div className="flex flex-col items-center space-y-4">
          {/* Logo */}

          <MemoLogo2 className="w-[17rem] h-28" />

          {/* Description */}
          <p className="text-center text-lg font-bold">
            {text}{" "}
            <span className="text-[#20FFAF] font-semibold">
              {amount} {token}
            </span>
          </p>

          {/* Subtext  */}
          <p className="text-center text-sm text-gray-400">
            You'll need to review and confirm this transaction through your
            wallet using a smart contract
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
