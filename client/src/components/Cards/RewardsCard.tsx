import { getSafeLSKRewards } from "@/lib/utils";
import { useEffect, useState } from "react";
import { ReactNode } from "react";
import { useActiveAccount } from "thirdweb/react";
import { useChainConfig } from "@/hooks/useChainConfig";

const RewardsCard = ({
  title,
  campaign,
  icon,
  badge,
  emphasize,
  text,
  safeId,
}: {
  title: string;
  campaign?: string;
  icon?: any;
  badge?: string;
  emphasize?: string;
  text?: ReactNode;
  safeId?: number;
}) => {
  const [value, setValue] = useState(0.0);
  const account = useActiveAccount();
  const { chain, diamondAddress } = useChainConfig();

  useEffect(() => {
    async function run() {
      if (!safeId) return;
      const reward = await getSafeLSKRewards(
        safeId.toString(),
        account,
        chain,
        diamondAddress,
      );

      setValue(Number(reward));

      console.log("Some reward", reward);
    }
    run();
  }, [safeId, account, chain, diamondAddress]);

  return (
    <div className="border-[1px] border-[#FFFFFF17] rounded-[12px] p-6 w-full">
      <div className="flex justify-between items-start lg:items-center pb-4">
        <div className="text-[#CACACA] font-light flex items-center justify-between w-full">
          <span>{title}</span>
          <div className="text-[#F1F1F1] rounded-full bg-[#79E7BA]/20 px-2 py-1 text-xs">
            {campaign} campaign
          </div>
        </div>
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

      <div className="flex flex-col lg:flex-row justify-between items-start gap-3 lg:gap-0 lg:items-end">
        <div>
          <div>
            <span className="text-[#F1F1F1] pr-2 text-3xl">
              {value.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[#CACACA] text-xs">LSK</span>
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
      </div>
    </div>
  );
};

export default RewardsCard;
