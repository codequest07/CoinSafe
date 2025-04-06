import { useGetScheduledSavings } from "@/hooks/useGetScheduledSavings";
import { useState } from "react";
import SavingOption from "./Modals/SavingOption";
import { Button } from "./ui/button";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import Deposit from "./Modals/Deposit";
import MemoStory from "@/icons/Story";

export default function ScheduledSavings() {
  const [isFirstModalOpen, setIsFirstModalOpen] = useState(false);
  const [isSecondModalOpen, setIsSecondModalOpen] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const { scheduledSavings, isLoading, error } = useGetScheduledSavings();

  const openFirstModal = () => setIsFirstModalOpen(true);
  const openDepositModal = () => setIsDepositModalOpen(true);

  return (
    <div className="bg-[#1D1D1D73]/40 border border-white/10 text-white p-4 lg:p-5 rounded-lg max-w-lg mx-auto sm:max-w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-base font-[500] sm:text-lg">Scheduled savings</h2>
      </div>
      {scheduledSavings.length > 0 ? (
        scheduledSavings.slice(0, 3).map((saving, index) => (
          <div key={index} className="mb-2">
            <div className="text-sm mb-1 sm:text-base">
              {format(saving.scheduledDate, "yyyy-MM-dd")}
            </div>
            <div key={index} className="flex justify-between items-center mb-4">
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
        ))
      ) : (
        <div className="flex flex-col items-center mt-3 justify-center gap-3">
          {isLoading ? (
            <Loader2 className="w-12 h-12 animate-spin" />
          ) : error ? (
            <span className="text-red-500">
              An unexpected error occured..
            </span>
          ) : (
            <div className="flex py-20 flex-col gap-6 items-center text-center justify-center">
              <div className="mb-4 rounded-full">
                <MemoStory className="w-20 h-20"/>
              </div>
              <p className="text-sm">
                This space is yours to litter with scheduled savings as you wish
              </p>
              <div className="flex gap-5">
                <Button
                  onClick={openDepositModal}
                  className="rounded-[100px] px-8 py-2 bg-[#1E1E1E99] text-[#F1F1F1] hover:bg-[#2a2a2a] text-sm"
                >
                  Deposit
                </Button>
                <Button
                  onClick={openFirstModal}
                  className="rounded-[100px] px-8 py-2  bg-[#FFFFFFE5] hover:bg-[#FFFFFFE5] text-[#010104] text-sm"
                >
                  Save
                </Button>

              </div>
              {/* SavingOption Modal */}
              <SavingOption
                isFirstModalOpen={isFirstModalOpen}
                setIsFirstModalOpen={setIsFirstModalOpen}
                isSecondModalOpen={isSecondModalOpen}
                setIsSecondModalOpen={setIsSecondModalOpen}
                tab="autosave"
              />
            </div>
          )}
        </div>
      )}
      {/* <AllScheduledSavings
        scheduledSavings={scheduledSavings}
        isModalOpen={openAllScheduledSavings}
        setisModalOpen={setOpenAllScheduledSavings}
        onBack={() => setOpenAllScheduledSavings(false)}
      /> */}
      <Deposit
        isDepositModalOpen={isDepositModalOpen}
        setIsDepositModalOpen={setIsDepositModalOpen}
        onBack={() => {}}
      />
    </div>
  );
}
