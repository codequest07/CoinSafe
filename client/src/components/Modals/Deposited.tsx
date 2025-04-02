import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
// import MemoLogo2 from "@/icons/Logo2";

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
      <DialogContent
        className="max-w-[360px] sm:max-w-[400px] p-6 border-1 border-[#FFFFFF21] text-white bg-[#17171C] rounded-lg shadow-lg"
        noX={true}
      >
        <DialogTitle className="text-center">
          Deposit Transaction Successful
        </DialogTitle>

        <div className="flex flex-col items-center space-y-4">
          {/* Logo */}

          <img src="/assets/empty-wallet-tick.png" className="w-24 h-24" />

          {/* Description */}
          <p className="text-center text-lg">
            You deposited{" "}
            <span className="text-[#20FFAF] font-semibold">
              {amount} {token}
            </span>
          </p>

          <p className="text-center text-sm text-gray-400">
            Assets will be available in your wallet
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
