import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import MemoMagicIcon from "@/icons/MagicIcon";

export default function SaveSenseResp({
  isOpen,
  onClose,
  data,
}: {
  isOpen: boolean;
  onClose: () => void;
  data: any;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[800px] p-6 border-[#FFFFFF17] bg-black text-white border rounded-[2rem] shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <div className="">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-sm font-normal">
                <MemoMagicIcon className=" h-6 w-6" />
                <p>SaveSense response:</p>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <p className="mb-4">{data}</p>
            </CardContent>
            <CardFooter className="justify-end space-x-4">
              <Button
                onClick={onClose}
                className="text-white bg-[#1E1E1E99] rounded-[2rem] hover:bg-[#1E1E1E99]">
                Close
              </Button>
              <Button
                variant="outline"
                className="text-[#010104] bg-[#FFFFFFE5] rounded-[2rem] border-white hover:bg-[#FFFFFFE5]">
                Regenerate
              </Button>
            </CardFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
