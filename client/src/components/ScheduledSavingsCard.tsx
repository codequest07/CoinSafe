import { useGetScheduledSavings } from "@/hooks/useGetScheduledSavings";
import MemoUsdc from "@/icons/Usdc";
import { tokens } from "@/lib/contract";
// import { savings } from "@/lib/data";
import { useEffect } from "react";
import SaveAsset from "./Modals/SaveAsset";

export default function ScheduledSavings() {
  const { scheduledSavings, isLoading, error } = useGetScheduledSavings();

  useEffect(() => {
    console.log(scheduledSavings, isLoading, error);
  }, [isLoading]);

  return (
    <div className="bg-[#13131340] text-white p-4 rounded-lg max-w-lg mx-auto sm:max-w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-base font-[500] sm:text-lg">Scheduled savings</h2>
        {/* <a href="#" className="text-sm font-[400] text-green-400 sm:text-base">
          View all
        </a> */}
      </div>
      {scheduledSavings.length > 0 ? (
        scheduledSavings.map((saving, index) => (
          <div key={index} className="mb-6">
            <div className="text-sm mb-4 sm:text-base">
              {saving.scheduledDate}
            </div>
            <div key={index} className="flex justify-between items-center mb-4">
              <div className="flex space-x-4 items-center">
                <MemoUsdc className="w-6 h-6 sm:w-8 sm:h-8" />
                <div>
                  {/* <div className="font-[400] text-sm sm:text-base">
                    {.symbol}
                  </div> */}
                  <div className="text-sm text-gray-400 sm:text-base">
                    {saving.token === tokens.lsk
                      ? "LSK"
                      : saving.token === tokens.safu
                      ? "SAFU"
                      : saving.token === tokens.usdt
                      ? "USDT"
                      : "Unsupported"}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-[400] text-sm sm:text-base">
                  {saving.amount}
                  {/* {item.symbol} */}
                </div>
                {/* <div className="text-sm text-gray-400 sm:text-base">
                  ≈ {item.value}
                </div> */}
              </div>
            </div>
          </div>
        ))
      ) : (
        <div>
        <p>You haven't created an automated savings plan yet!</p>
        <p>Create one</p>
        <SaveAsset
          
        />
        </div>
      )}
    </div>
  );
}
