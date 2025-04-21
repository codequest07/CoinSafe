import { useState } from "react";
import { cn } from "@/lib/utils";
import AssetTable from "./AssetTable";
import TransactionHistory from "./TransactionHistory";
import { FormattedSafeDetails } from "@/hooks/useGetSafeById";

interface AssetTabsProps {
  safeDetails?: FormattedSafeDetails;
}

export function AssetTabs({ safeDetails }: AssetTabsProps) {
  const [activeTab, setActiveTab] = useState<"assets" | "savings">("assets");

  return (
    <div className="w-full max-w-[98%] mx-auto">
      <div className="flex  max-w-[100%] mx-auto border-b border-[#FFFFFF21] bg-black text-white">
        <button
          onClick={() => setActiveTab("assets")}
          className={cn(
            "px-4 py-2 text-sm font-medium transition-colors",
            activeTab === "assets"
              ? "border-b-2 border-[#79E7BA]"
              : "text-gray-400 hover:text-gray-200"
          )}>
          Assets
        </button>
        <button
          onClick={() => setActiveTab("savings")}
          className={cn(
            "px-4 py-2 text-sm font-medium transition-colors",
            activeTab === "savings"
              ? "border-b-2 border-[#79E7BA]"
              : "text-gray-400 hover:text-gray-200"
          )}>
          Savings history
        </button>
      </div>

      <div className="py-2 bg-black text-white">
        {activeTab === "assets" ? (
          <AssetTable safeDetails={safeDetails} />
        ) : (
          <div className="p-4">
            <h3 className="text-lg font-medium">Savings history</h3>
            <TransactionHistory safeId={safeDetails?.id} />
          </div>
        )}
      </div>
    </div>
  );
}
