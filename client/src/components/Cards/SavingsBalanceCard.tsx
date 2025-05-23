// import React from "react";

const SavingsBalanceCard = () => {
  return (
    <div>
      <div className="border-[1px] border-[#FFFFFF17] rounded-[12px] p-6 w-full">
        <div className="flex justify-between items-center pb-4">
          <div className="text-[#CACACA] font-light">Savings Balance</div>
          <div>
            {/* {icon ? (
                    <div>{icon}</div>
                  ) : (
                    badge && (
                      <div className="text-[#F1F1F1] rounded-[10px] bg-[#79E7BA17] px-2 py-1 text-xs">
                        {badge}
                      </div>
                    )
                  )} */}
          </div>
        </div>

        <div className="flex justify-between items-end">
          <div>
            <div>
              <span className="text-[#F1F1F1] pr-2 text-3xl">{0.0}</span>
              <span className="text-[#CACACA] text-xs">USD</span>
            </div>
            <div>
              <div className="pt-2">
                <p className="text-[#7F7F7F] text-xs">
                  {/* <span className="text-[#79E7BA] underline">{emphasize} </span> */}
                  sum of all balances
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button className="rounded-[100px] px-8 py-[8px] bg-[#1E1E1E99] h-[40px] text-sm text-[#F1F1F1]">
              Unlock
            </button>
            <button className="rounded-[100px] px-8 py-[8px] bg-[#FFFFFFE5] h-[40px] text-sm text-[#010104]">
              Top up
            </button>
          </div>
        </div>
        {/* <SavingOption
                isFirstModalOpen={isFirstModalOpen}
                setIsFirstModalOpen={setIsFirstModalOpen}
                isSecondModalOpen={isSecondModalOpen}
                setIsSecondModalOpen={setIsSecondModalOpen}
              /> */}
      </div>
    </div>
  );
};

export default SavingsBalanceCard;
