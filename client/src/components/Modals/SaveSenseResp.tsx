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
  data: string | null;
}) {
  const formatResponse = (response: string | null) => {
    if (!response) return null;

    const sections = response.split("\n\n");
    return sections.map((section, index) => (
      <p key={index} className="mb-4">
        {section.split("\n").map((line, lineIndex) => (
          <span key={lineIndex}>
            {line}
            {lineIndex < section.split("\n").length - 1 && <br />}
          </span>
        ))}
      </p>
    ));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[800px] p-6 border-[#FFFFFF17] bg-black text-white border rounded-[2rem] shadow-lg">
        <div className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-sm font-normal">
              <MemoMagicIcon className="h-6 w-6" />
              <p>SaveSense response:</p>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm max-h-[60vh] overflow-y-auto">
            {data ? formatResponse(data) : <p>No data available</p>}
          </CardContent>
          <CardFooter className="justify-end space-x-4 mt-4">
            <Button
              onClick={onClose}
              className="text-white bg-[#1E1E1E99] rounded-[2rem] hover:bg-[#1E1E1E99]">
              Close
            </Button>
          </CardFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
