import { useState } from "react";
import { cn } from "@/lib/utils";
import AssetTable from "./AssetTable";
import VaultAssetTable from "./VaultAssetTable";
// import TransactionHistory from "./TransactionHistory";
import { FormattedSafeDetails } from "@/hooks/useGetSafeById";
import { useLocation } from "react-router-dom";

interface AssetTabsProps {
  safeDetails?: FormattedSafeDetails;
}

export function AssetTabs({ safeDetails }: AssetTabsProps) {
  const [activeTab, setActiveTab] = useState<"assets" | "savings">("assets");
  const location = useLocation();
  const isVaultPage = location.pathname === "/dashboard/vault";

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
          isVaultPage ? (
            <VaultAssetTable safeDetails={safeDetails} />
          ) : (
            <AssetTable safeDetails={safeDetails} />
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
