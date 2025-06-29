import { X } from "lucide-react";

interface ManageAutosavingsProps {
  onClose: () => void;
  onAddToken: () => void;
  onRemoveToken: () => void;
  onDeactivateSafe: () => void;
}

export default function ManageAutosavings({
  onClose,
  onAddToken,
  onRemoveToken,
  onDeactivateSafe,
}: ManageAutosavingsProps) {
  console.log("ManageAutosavings component rendered");

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-transparent z-50">
      <div
        className="absolute inset-0 bg-black/80"
        onClick={(e) => {
          console.log("Overlay clicked");
          e.stopPropagation();
          onClose();
        }}></div>
      <div className="relative w-full max-w-md rounded-lg border border-[#FFFFFF21] p-3 bg-[#17171C] text-white shadow-lg">
        <div className="flex items-center justify-between p-4 pb-2">
          <h2 className="text-lg font-medium">Manage autosavings</h2>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="rounded-full p-1 bg-white "
            aria-label="Close">
            <X className="h-4 w-4 text-black" />
          </button>
        </div>

        <div className="p-4">
          <button
            className="flex w-full items-center justify-between rounded-md bg-[#272727B2] p-4 text-left  mb-3  -700"
            onClick={(e) => {
              e.stopPropagation();
              onAddToken();
            }}>
            <span>Add token to safe</span>
            <img src="/assets/arrow-down.svg" alt="close" className="w-4 h-4" />
          </button>

          <button
            className="flex w-full items-center justify-between rounded-md bg-[#272727B2] p-4 text-left  mb-3  -700"
            onClick={(e) => {
              console.log("Remove token button clicked");
              e.stopPropagation();
              onRemoveToken();
            }}>
            <span>Remove token from safe</span>
            <img src="/assets/arrow-down.svg" alt="close" className="w-4 h-4" />
          </button>

          <button
            className="flex w-full items-center justify-between rounded-md bg-[#272727B2] p-4 text-left  mb-2  -700"
            onClick={(e) => {
              console.log("Deactivate safe button clicked");
              e.stopPropagation();
              onDeactivateSafe();
            }}>
            <span>Deactivate safe</span>
            <img src="/assets/arrow-down.svg" alt="close" className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
