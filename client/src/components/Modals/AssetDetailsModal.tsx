import { FormattedSafeDetails } from "@/hooks/useGetSafeById";
import { X, Check } from "lucide-react";

interface Asset {
  token: string;
  balance: string | number;
  saved: boolean;
  available: boolean;
  balance_usd: null;
  saved_usd: null;
  autosaved: null;
  isMature: any;
  tokenInfo: {
    symbol: string;
    name: string;
    color: string;
    chain: string;
    image: string;
  };
}

interface AssetDetailsModalProps {
  asset: Asset;
  safeDetails?: FormattedSafeDetails;
  onClose: () => void;
}

export function AssetDetailsModal({
  asset,
  safeDetails,
  onClose,
}: AssetDetailsModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-[#17171C] rounded-xl w-full max-w-sm p-6 text-white">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium">Assets details</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Asset Info */}
        <div className="mb-6 pb-6 border-b border-gray-800">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">
                  <img
                    src={asset.tokenInfo?.image}
                    alt={asset.tokenInfo?.name}
                    className="w-full h-full rounded-full"
                  />
                </span>
              </div>
              <div>
                <p className="text-sm font-medium">{asset.tokenInfo?.name}</p>
                <p className="text-xs text-gray-400">
                  {asset.tokenInfo?.chain}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">
                {asset.balance} {asset?.tokenInfo?.symbol}
              </p>
              <p className="text-xs text-gray-400">
                ≈{" $"}
                {safeDetails
                  ? asset.saved_usd !== null
                    ? asset.saved_usd
                    : "Loading..."
                  : asset.balance_usd !== null
                  ? asset.balance_usd
                  : "Loading..."}
              </p>
            </div>
          </div>
        </div>

        {/* Autosaved Status */}
        <div className="mb-6 flex items-center justify-between">
          <span className="text-sm text-gray-400">Autosaved</span>
          <div className="flex items-center gap-2">
            {asset.autosaved ? (
              <>
                <span className="text-[#48FF91]">Yes</span>
                <div className="w-4 h-4 rounded-full bg-[#48FF91] flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              </>
            ) : (
              <>
                <span className="text-white">No</span>
                <div className="w-4 h-4 rounded-full bg-gray-500 flex items-center justify-center">
                  <X className="w-3 h-3 text-white" />
                </div>
              </>
            )}
            {/* <span className="text-sm font-medium text-emerald-500">Yes</span>
            <Check className="w-5 h-5 text-emerald-500" /> */}
          </div>
        </div>

        {/* Claimable Amount */}
        <div className="mb-6 flex items-center justify-between">
          <span className="text-sm text-gray-400">Claimable amount</span>
          <div className="text-right">
            {/* <p className="text-sm font-medium">0.00234 AVAX</p> */}
            <p className="text-xs text-gray-400">
              {safeDetails?.unlockTime && safeDetails?.unlockTime < new Date()
                ? safeDetails?.totalAmountUSD ?? 0.0
                : "—"}
            </p>
          </div>
        </div>

        {/* Claim Button */}
        <button className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 rounded-full transition-colors">
          Claim
        </button>
      </div>
    </div>
  );
}
