import MemoDanger from "@/icons/Danger";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";

type Props = {
  open: boolean;
  onClose: () => void;
  onSwap: () => void;
};

const UsdtWarningModal = ({ open, onClose, onSwap }: Props) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[520px] bg-[#17171C] border border-[#FFFFFF21] text-white text-center rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col items-center text-center space-y-6">
          <MemoDanger className="w-20 h-20 text-[#FFA448]" />
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-[18px] font-[500] text-center">
              Please read!
            </DialogTitle>
            <DialogDescription className="text-[14px] text-center text-[#B5B5B5] leading-relaxed">
              We noticed you just deposited USDT. While you can still save in
              USDT, saving in USDT0 allows you to earn our savings rewards. We
              recommend swapping your USDT to USDT0 to enjoy these benefits. We
              are working hard to ensure you can save and earn in USDT in the
              nearest future!
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Button
              onClick={onClose}
              variant="secondary"
              className="w-full bg-[#FFFFFF2B] hover:bg-[#FFFFFF2B] text-white rounded-full py-3">
              No, thanks
            </Button>
            <Button
              onClick={onSwap}
              className="w-full bg-[#FFFFFFE5] hover:bg-[#FFFFFFCC] text-[#010104] rounded-full py-3">
              Start swapping
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UsdtWarningModal;
