import { useState } from "react";
import { ReactNode } from "react";
import SavingOption from "../Modals/SavingOption";
import { useActiveAccount } from "thirdweb/react";

const VaultCard = ({
  title,
  icon,
  value,
  unit,
  badge,
  emphasize,
  text,
}: {
  title: string;
  icon?: any;
  value: number;
  unit: string;
  badge?: string;
  emphasize?: string;
  text?: ReactNode;
}) => {
  const [isFirstModalOpen, setIsFirstModalOpen] = useState(false);
  const [isSecondModalOpen, setIsSecondModalOpen] = useState(false);
  const account = useActiveAccount();
  const isConnected = !!account?.address;

  const openFirstModal = () => setIsFirstModalOpen(true);
  return (
    <div className="border-[1px] border-[#FFFFFF17] rounded-[12px] p-6 w-full">
      <div className="flex justify-between items-center pb-4">
        <div className="text-[#CACACA] font-light">{title}</div>
        <div>
          {icon ? (
            <div>{icon}</div>
          ) : (
            badge && (
              <div className="text-[#F1F1F1] rounded-[10px] bg-[#79E7BA17] px-2 py-1 text-xs">
                {badge}
              </div>
            )
          )}
        </div>
      </div>

      <div className="flex justify-between items-end">
        <div>
          <div>
            <span className="text-[#F1F1F1] pr-2 text-3xl">
              {value.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[#CACACA] text-xs">{unit}</span>
          </div>
          <div>
            <div className="pt-2">
              <p className="text-[#7F7F7F] text-xs">
                <span className="text-[#79E7BA] underline">{emphasize} </span>
                {text}
              </p>
            </div>
          </div>
        </div>
        {isConnected && (
          <div className="flex justify-end gap-2">
            {/* <button className="rounded-[100px] px-8 py-[8px] bg-[#1E1E1E99] h-[40px] text-sm text-[#F1F1F1]">
              Unlock
            </button> */}
            <button
              onClick={openFirstModal}
              className="rounded-[100px] px-8 py-[8px] bg-[#FFFFFFE5] h-[40px] text-sm text-[#010104]">
              Save
            </button>
          </div>
        )}
      </div>
      <SavingOption
        isFirstModalOpen={isFirstModalOpen}
        setIsFirstModalOpen={setIsFirstModalOpen}
        isSecondModalOpen={isSecondModalOpen}
        setIsSecondModalOpen={setIsSecondModalOpen}
      />
    </div>
  );
};

export default VaultCard;
