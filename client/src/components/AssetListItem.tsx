import { FormattedSafeDetails } from "@/hooks/useGetSafeById";

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

interface AssetsListItemProps {
  asset: Asset;
  safeDetails?: FormattedSafeDetails;
  onClick: () => void;
}

export function AssetsListItem({
  asset,
  safeDetails,
  onClick,
}: AssetsListItemProps) {
  return (
    <button
      onClick={onClick}
      className="w-full px-4 py-4 text-left transition-colors flex items-center justify-between"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-sm">
            <img
              src={asset.tokenInfo?.image}
              alt={asset.tokenInfo.name}
              className="w-full h-full rounded-full"
            />
          </span>
        </div>
        <div>
          <p className="text-sm font-medium text-[#F1F1F1]">
            {asset.tokenInfo.symbol}
          </p>
          <p className="text-xs text-gray-400">{asset.tokenInfo.chain}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium text-[#F1F1F1]">
          {asset.balance} {asset.tokenInfo.symbol}
        </p>
        <p className="text-xs text-[#F1F1F1]">
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
    </button>
  );
}
