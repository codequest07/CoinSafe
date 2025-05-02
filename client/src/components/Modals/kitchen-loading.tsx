import { Dialog, DialogContent } from "@/components/ui/dialog";
import MemoComingSoonIcon from "@/icons/ComingSoonIcon";

interface KitchenLoadingProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function KitchenLoading({
  isOpen,
  onClose,
}: KitchenLoadingProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[500px] p-5 border-1 border-[#FFFFFF21] text-white bg-[#17171C] rounded-lg shadow-lg">
        <div className="dark:bg-[#000000]">
          <div className="flex w-full flex-col items-center justify-center gap-2">
            <MemoComingSoonIcon className="w-[30%] h-[20vh] text-white" />
            <h1 className="text-2xl font-bold my-2 text-white leading-tight">
              We’re in the kitchen!
            </h1>
            <p className="text-center text-muted-foreground">
              We’re in the kitchen, putting the final touches on this feature.
              We’ll let you know as soon as it’s ready! Continue saving for now.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
