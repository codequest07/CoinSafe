import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
// import MemoAvax from "@/icons/Avax";
import { ScheduledSaving } from "@/hooks/useGetScheduledSavings";
import { format } from "date-fns";

export default function AllScheduledSavings({
  isModalOpen,
  setisModalOpen,
  scheduledSavings,
}: {
  isModalOpen: boolean;
  setisModalOpen: (open: boolean) => void;
  onBack: () => void;
  scheduledSavings: ScheduledSaving[];
}) {
  return (
    <Dialog open={isModalOpen} onOpenChange={setisModalOpen}>
      <DialogContent className="max-w-[390px] sm:max-w-[600px] border-0 text-white bg-[#010104]">
        <DialogTitle className="text-white flex items-center mb-4">
          <p>All Scheduled Savings ({scheduledSavings?.length || 0})</p>
        </DialogTitle>
        <div className="overflow-y-scroll max-h-[380px] pr-3">
          {scheduledSavings.map((saving, index) => (
            <div key={index} className="">
              <div className="text-sm mb-2 sm:text-base">
                {format(saving.scheduledDate, "yyyy-MM-dd")}
              </div>
              <div
                key={index}
                className="flex justify-between items-center mb-4"
              >
                <div className="flex space-x-2 items-center">
                  {/* <MemoUsdc className="w-6 h-6 sm:w-8 sm:h-8" /> */}
                  <div>
                    {/* <div className="font-[400] text-sm sm:text-base">
                   {.symbol}
                 </div> */}
                    <div className="text-sm text-gray-400 sm:text-base uppercase">
                      {saving.token}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-[400] text-sm sm:text-base">
                    {saving.amount}{" "}
                    <span className="text-sm opacity-70">{saving.token}</span>
                  </div>
                  {saving.token === "safu" && (
                    <div className="text-sm text-gray-400 sm:text-base">
                      ≈ ${saving.value}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
