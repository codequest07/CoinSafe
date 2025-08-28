import { useState } from "react";
import { cn } from "@/lib/utils";
import VaultAssetTable from "./VaultAssetTable";
// import TransactionHistory from "./TransactionHistory";
import { FormattedSafeDetails } from "@/hooks/useGetSafeById";
import { useLocation } from "react-router-dom";
import AutoSavedAssetTable from "./AutoSavedAssetTable";
import TargetAssetTable from "./TargetAssetTable";

interface AssetTabsProps {
  safeDetails?: FormattedSafeDetails;
  isLoading?: boolean;
}

export function AssetTabs({ safeDetails, isLoading }: AssetTabsProps) {
  const [activeTab, setActiveTab] = useState<"assets" | "savings">("assets");
  const location = useLocation();
  const isVaultPage = location.pathname === "/vault";
  const isAutoSafePage = location.pathname === "/vault/auto-safe";

  return (
    <div className="w-full mx-auto">
      <div className="flex w-full mx-auto border-b border-[#FFFFFF21] bg-black text-white overflow-x-auto">
        <button
          onClick={() => setActiveTab("assets")}
          className={cn(
            "px-4 py-2 text-sm font-medium transition-colors flex-shrink-0",
            activeTab === "assets"
              ? "border-b-2 border-[#79E7BA]"
              : "text-gray-400 hover:text-gray-200"
          )}>
          Assets
        </button>
        <button
          onClick={() => setActiveTab("savings")}
          className={cn(
            "px-4 py-2 text-sm font-medium transition-colors flex-shrink-0",
            activeTab === "savings"
              ? "border-b-2 border-[#79E7BA]"
              : "text-gray-400 hover:text-gray-200"
          )}>
          Savings history
        </button>
      </div>

      <div className="py-2 bg-black text-white">
        {activeTab === "assets" ? (
          isVaultPage ? (
            <VaultAssetTable safeDetails={safeDetails} />
          ) : isAutoSafePage ? (
            <AutoSavedAssetTable assets={safeDetails} isLoading={isLoading} />
          ) : (
            <TargetAssetTable safeDetails={safeDetails} />
          )
        ) : (
          <div className="p-4">
            <h3 className="text-lg font-medium">Savings history</h3>
            {/* Transaction history temporarily removed */}
            <div className="flex flex-col items-center justify-center py-10">
              <div className="animate-pulse flex flex-col items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="64"
                  height="64"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-gray-400 mb-4 animate-bounce">
                  <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path>
                  <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path>
                  <path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path>
                </svg>
                <p className="text-gray-400 text-lg font-medium">
                  Transaction history is currently unavailable
                </p>
                <p className="text-gray-500 mt-2 text-sm">
                  We're working on bringing this feature back soon!
                </p>
              </div>
            </div>
            {/* <TransactionHistory safeId={safeDetails?.id} /> */}
          </div>
        )}
      </div>
    </div>
  );
}
