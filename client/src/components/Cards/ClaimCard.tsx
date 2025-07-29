import { useState, useEffect } from "react";
import ClaimAssets from "../Modals/ClaimAssets";
import { useGetSafes } from "@/hooks/useGetSafes";
import { toast } from "@/hooks/use-toast";

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
  const { safes, isLoading } = useGetSafes();
  const [hasMaturedSafes, setHasMaturedSafes] = useState(false);

  // Check if there are any matured safes
  useEffect(() => {
    if (!safes || safes.length === 0) return;

    // Function to convert timestamp to Date
    const convertTimestampToDate = (timestamp: bigint) => {
      // Convert from seconds to milliseconds
      return new Date(Number(timestamp) * 1000);
    };

    // Check for matured target savings
    const maturedSafes = safes.filter((safe) => {
      // Skip Emergency Safe (id 911n)
      if (safe.id === 911n) return false;

      // Skip safes with invalid or missing unlockTime
      if (!safe.unlockTime) return false;

      // Convert the unlockTime to a Date object
      const unlockDate = convertTimestampToDate(safe.unlockTime);

      // Skip safes with invalid dates (like 1970-01-01)
      const minValidDate = new Date(2020, 0, 1); // Jan 1, 2020
      if (unlockDate < minValidDate) return false;

      // Check if it's a Target Saving
      const isTargetSaving = safe.target && safe.target !== "Emergency Safe";

      // Check if it has matured and has tokens to claim
      const isMatured = unlockDate <= new Date();
      const hasTokens =
        safe.tokenAmounts &&
        safe.tokenAmounts.some((token) => token.amount > 0);

      return isTargetSaving && isMatured && hasTokens;
    });

    setHasMaturedSafes(maturedSafes.length > 0);
  }, [safes]);

  const openclaimModal = () => {
    if (isLoading) {
      toast({
        title: "Loading safes",
        description: "Please wait while we load your safes.",
        variant: "default",
      });
      return;
    }

    if (!hasMaturedSafes) {
      toast({
        title: "No matured safes",
        description: "You don't have any matured safes to claim.",
        variant: "destructive",
      });
      return;
    }

    setIsClaimModalOpen(true);
  };
  return (
    <div className="border-[1px] border-[#FFFFFF17] rounded-[12px] p-6 w-full">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center pb-4">
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

      <div className="flex flex-col gap-4 lg:gap-0 lg:flex-row justify-between items-start lg:items-end">
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
            disabled={isLoading || !hasMaturedSafes}
            className={`rounded-[100px] px-8 py-[8px] h-[40px] text-sm ${
              isLoading || !hasMaturedSafes
                ? "bg-[#3F3F3F50] text-[#F1F1F150] cursor-not-allowed"
                : "bg-[#3F3F3F99] text-[#F1F1F1] hover:bg-[#4F4F4F99]"
            }`}
          >
            {isLoading ? "Loading..." : "Claim all"}
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
