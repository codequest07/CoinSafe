import { X } from "lucide-react";

interface ReactivateModalOptionsProps {
  onClose: () => void;
  onReactivateWithTopUp: () => void;
  onReactivateWithClaimable: () => void;
}

export default function ReactivateModalOptions({
  onClose,
  onReactivateWithTopUp,
  onReactivateWithClaimable,
}: ReactivateModalOptionsProps) {
  console.log("ManageAutosavings component rendered");

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-transparent z-50">
      <div
        className="absolute inset-0 bg-black/80"
        onClick={(e) => {
          console.log("Overlay clicked");
          e.stopPropagation();
          onClose();
        }}
      ></div>
      <div className="relative w-full max-w-md rounded-xl border border-[#FFFFFF21] p-3 bg-[#17171C] text-white shadow-lg">
        <div className="flex items-center justify-between p-4 pb-2">
          <h2 className="text-lg font-medium">Reactivate safe</h2>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="rounded-full p-1 bg-white"
            aria-label="Close"
          >
            <X className="h-4 w-4 text-black" />
          </button>
        </div>

        <div className="p-4">
          <button
            className="flex w-full items-center justify-between rounded-md bg-[#272727B2] p-4 text-left  mb-3  -700"
            onClick={(e) => {
              e.stopPropagation();
              onReactivateWithTopUp();
            }}
          >
            <span>Reactivate with top up</span>
            <img src="/assets/arrow-down.svg" alt="close" className="w-4 h-4" />
          </button>

          <button
            className="w-full rounded-md bg-[#272727B2] p-4 text-left  mb-2  -700"
            onClick={(e) => {
              console.log("Extend safe button clicked");
              e.stopPropagation();
              onReactivateWithClaimable();
            }}
          >
            <div className="flex w-full items-center justify-between">
                <span>Rollover claimable funds</span>
                <img src="/assets/arrow-down.svg" alt="close" className="w-4 h-4" />
            </div>
            <p className="text-[#CACACA] mt-2 text-xs">Resave all of your claimable balance</p>
          </button>
        </div>
      </div>
    </div>
  );
}
