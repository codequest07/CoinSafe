import { useState } from "react";
import ClaimAssets from "../Modals/ClaimAssets";

const ClaimCard = ({
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
  text: string;
}) => {
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const openclaimModal = () => setIsClaimModalOpen(true);
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
        <div className="flex justify-end gap-2">
          <button
            onClick={openclaimModal}
            className="rounded-[100px] px-8 py-[8px] bg-[#3F3F3F99] h-[40px] text-sm text-[#F1F1F1]">
            Claim all
          </button>
          {/* <button className="rounded-[100px] px-8 py-[8px] bg-[#FFFFFFE5] h-[40px] text-sm text-[#010104]">Save</button> */}
        </div>
      </div>

      <ClaimAssets
        isDepositModalOpen={isClaimModalOpen}
        setIsDepositModalOpen={setIsClaimModalOpen}
        onBack={() => {}}
      />
    </div>
  );
};

export default ClaimCard;
