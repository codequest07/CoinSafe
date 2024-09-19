import { Dialog, DialogContent } from "@/components/ui/dialog";
import MemoLogo2 from "@/icons/Logo2";

export default function Loading({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[500px] p-6 border-[#FFFFFF17] bg-black text-white rounded-lg shadow-lg">
        <div className=" h-[200px]  rounded-2xl p-8 flex flex-col">
          <div className="flex items-center justify-center">
            <MemoLogo2 className="w-80 h-20 text-[#20FFAF]" />
          </div>
          <div className="flex flex-col items-center text-center">
            <h2 className="text-white text-xl font-[500] mb-2">
              SaveSense is ransacking your history...
            </h2>
            <p className="text-gray-400 text-sm">
              Please be patient while I assess your transactions
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
