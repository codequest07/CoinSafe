import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import MemoMagicIcon from "@/icons/MagicIcon";

interface SaveSenseRespProps {
  isOpen: boolean;
  onClose: () => void;
  data: { savingsPlan: string } | null;
}

export default function SaveSenseResp({
  isOpen,
  onClose,
  data,
}: SaveSenseRespProps) {
  const formatResponse = (response: { savingsPlan: string }) => {
    try {
      return response.savingsPlan
        .split("\n\n")
        .filter((section) => section.trim() !== "")
        .map((section, index) => (
          <div key={index} className="mb-6 last:mb-0">
            {section.split("\n").map((line, lineIndex) => (
              <p key={lineIndex} className="my-2">
                {line || <br />}
              </p>
            ))}
          </div>
        ));
    } catch (error) {
      console.error("Error formatting response:", error);
      return <p className="text-red-500">Error displaying content</p>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[800px] p-6 border-1 border-[#FFFFFF21] text-white bg-[#17171C] border rounded-[2rem] shadow-lg">
        <div className="flex flex-col h-full">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-sm font-normal">
              <MemoMagicIcon className="h-6 w-6" />
              <p>SaveSense response:</p>
            </CardTitle>
          </CardHeader>

          <CardContent className="text-sm max-h-[60vh] overflow-y-auto flex-1">
            {data ? (
              <div className="p-2 bg-gray-900 rounded-lg">
                {formatResponse(data)}
              </div>
            ) : (
              <p className="text-gray-400">No data available</p>
            )}
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
