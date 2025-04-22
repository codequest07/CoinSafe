import { useGetScheduledSavings } from "@/hooks/useGetScheduledSavings";
import { useState } from "react";
import { Button } from "./ui/button";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import Deposit from "./Modals/Deposit";
import MemoStory from "@/icons/Story";
import { useNavigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import { saveAtom } from "@/store/atoms/save";
import { tokenData } from "@/lib/utils";

export default function ScheduledSavings() {
  const navigate = useNavigate();
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const { scheduledSavings, isLoading, error } = useGetScheduledSavings();
  const [, setSaveState] = useRecoilState(saveAtom);

  const openDepositModal = () => setIsDepositModalOpen(true);

  // Navigate to save-assets page with autosave tab selected
  const navigateToSaveAssets = () => {
    // Set the save type to auto in the global state
    setSaveState((prevState) => ({
      ...prevState,
      typeName: "manual",
    }));

    // Navigate to the save-assets page
    navigate("/dashboard/save-assets");
  };

  return (
    <div className="bg-[#1D1D1D73]/40 border border-white/10 text-white p-4 lg:p-5 rounded-lg max-w-lg mx-auto sm:max-w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-base font-[500] sm:text-lg">Scheduled savings</h2>
      </div>
      {scheduledSavings.length > 0 ? (
        scheduledSavings.slice(0, 4).map((saving, index) => (
          <div key={index} className="mb-4">
            <div className="text-[13px] text-white/60 mb-2">
              {format(saving.scheduledDate, "PPP")}
            </div>
            <div key={index} className="flex justify-between items-center mb-4">
              <div className="flex space-x-2 items-center">
                {tokenData[saving.token]?.image ? (
                  <div className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center">
                    <img
                      src={tokenData[saving.token]?.image}
                      width={30}
                      height={30}
                      className="w-full h-full"
                    />
                  </div>
                ) : (
                  <div
                    className={`w-7 h-7 rounded-full ${tokenData[saving.token].color} flex items-center justify-center text-white font-medium`}
                  >
                    {tokenData[saving.token].symbol?.charAt(0)}
                  </div>
                )}
                <div>
                  <div className="text-sm text-gray-400 sm:text-base uppercase">
                    {tokenData[saving.token].symbol}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-[400] text-sm sm:text-base">
                  {Number(saving.amount)?.toFixed(2)}{" "}
                  <span className="text-[13px] opacity-70">{tokenData[saving.token].symbol}</span>
                </div>

                <div className="text-sm text-gray-400 sm:text-base">
                  ≈ ${saving.value}
                </div>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="flex flex-col items-center mt-3 justify-center gap-3">
          {error ? (
            <span className="text-red-500">An unexpected error occured..</span>
          ) : isLoading ? (
            <Loader2 className="w-12 h-12 animate-spin" />
          ) : (
            <div className="flex py-20 flex-col gap-6 items-center text-center justify-center">
              <div className="mb-4 rounded-full">
                <MemoStory className="w-20 h-20" />
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
                  onClick={navigateToSaveAssets}
                  className="rounded-[100px] px-8 py-2  bg-[#FFFFFFE5] hover:bg-[#FFFFFFE5] text-[#010104] text-sm"
                >
                  Save
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
      <Deposit
        isDepositModalOpen={isDepositModalOpen}
        setIsDepositModalOpen={setIsDepositModalOpen}
        onBack={() => {}}
      />
    </div>
  );
}
