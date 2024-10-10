import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import MemoLogo2 from "@/icons/Logo2";

export default function SaveSuccessful({
  amount,
  duration,
  token,
  isOpen,
  onClose,
}: {
  amount: number | string;
  duration: number;
  token: string;
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[500px] p-6 bg-black text-white rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <DialogTitle className="text-lg font-semibold">
            Save transaction Successful
          </DialogTitle>
        </div>

        <div className="flex flex-col items-center space-y-4">
          {/* Logo */}

          <MemoLogo2 className="w-[17rem] h-28" />

          {/* Description */}
          <p className="text-center text-lg">
            You saved{" "}
            <span className="text-[#20FFAF] font-semibold">{amount} {token}</span> 
            {" "}
            for {(duration || 0) / (24*60*60)} days.
          </p>

          <p className="text-center text-sm text-gray-400">
            Save Transaction successful🥳💃
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
