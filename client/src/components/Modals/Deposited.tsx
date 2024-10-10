import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import MemoLogo2 from "@/icons/Logo2";

export default function Deposited({
  amount,
  token,
  isOpen,
  onClose,
}: {
  amount: number | string;
  token: string;
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[500px] p-6 bg-black text-white rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <DialogTitle className="text-lg font-semibold">
            Deposit transaction Succesful
          </DialogTitle>
        </div>

        <div className="flex flex-col items-center space-y-4">
          {/* Logo */}

          <MemoLogo2 className="w-[17rem] h-28" />

          {/* Description */}
          <p className="text-center text-lg">
            You deposited{" "}
            <span className="text-[#20FFAF] font-semibold">{amount} {token}</span>
          </p>

          <p className="text-center text-sm text-gray-400">
            Transaction successful🥳💃
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
