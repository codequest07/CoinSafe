import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import MemoLogo2 from "@/icons/Logo2";

export default function ApproveTransaction({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[500px] p-6 bg-black text-white rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <DialogTitle className="text-lg font-semibold">
            Approve transaction
          </DialogTitle>
        </div>

        <div className="flex flex-col items-center space-y-4">
          {/* Logo */}

          <MemoLogo2 className="w-[17rem] h-28" />

          {/* Description */}
          <p className="text-center text-lg">
            Auto save <span className="text-[#20FFAF] font-semibold">20%</span>{" "}
            on every transaction
          </p>

          <p className="text-center text-sm text-gray-400">
            You'll need to review and confirm this edit through your wallet
            using a smart contract
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
