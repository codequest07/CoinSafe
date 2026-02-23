"use client";

import { useEffect, useState } from "react";
import { AssetsListItem } from "./AssetListItem";
import { AssetDetailsModal } from "./Modals/AssetDetailsModal";
import { FormattedSafeDetails } from "@/hooks/useGetSafeById";
// import { useNavigate } from "react-router-dom";
import { useActiveAccount } from "thirdweb/react";
import { tokenData } from "@/lib/utils";
import { getTokenPrice } from "@/lib";
import { getContract, readContract } from "thirdweb";
import { client } from "@/lib/config";
import { useChainConfig } from "@/hooks/useChainConfig";

async function checkIsTokenAutoSaved(
  userAddress: `0x${string}`,
  tokenAddress: string,
  chain: any,
  diamondAddress: string,
) {
  const contract = getContract({
    client,
    address: diamondAddress,
    chain: chain,
  });

  const balance = await readContract({
    contract: contract,
    method:
      "function isAutosaveEnabledForToken(address _user, address _token) external view returns (bool)",
    params: [userAddress, tokenAddress],
  });
  return balance;
}

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

// const MOCK_ASSETS: Asset[] = [
//   {
//     id: "1",
//     name: "AVAX",
//     network: "Avalanche",
//     amount: 5.9483,
//     price: "$ 5.00",
//     icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect fill="%23FF0000" width="48" height="48" rx="10"/><text x="24" y="32" fontSize="24" fontWeight="bold" fill="white" textAnchor="middle">A</text></svg>',
//   },
//   {
//     id: "2",
//     name: "AVAX",
//     network: "Avalanche",
//     amount: 5.9483,
//     price: "$ 5.00",
//     icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect fill="%23FF0000" width="48" height="48" rx="10"/><text x="24" y="32" fontSize="24" fontWeight="bold" fill="white" textAnchor="middle">A</text></svg>',
//   },
//   {
//     id: "3",
//     name: "AVAX",
//     network: "Avalanche",
//     amount: 5.9483,
//     price: "$ 5.00",
//     icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect fill="%23FF0000" width="48" height="48" rx="10"/><text x="24" y="32" fontSize="24" fontWeight="bold" fill="white" textAnchor="middle">A</text></svg>',
//   },
//   {
//     id: "4",
//     name: "AVAX",
//     network: "Avalanche",
//     amount: 5.9483,
//     price: "$ 5.00",
//     icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect fill="%23FF0000" width="48" height="48" rx="10"/><text x="24" y="32" fontSize="24" fontWeight="bold" fill="white" textAnchor="middle">A</text></svg>',
//   },
//   {
//     id: "5",
//     name: "AVAX",
//     network: "Avalanche",
//     amount: 5.9483,
//     price: "$ 5.00",
//     icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect fill="%23FF0000" width="48" height="48" rx="10"/><text x="24" y="32" fontSize="24" fontWeight="bold" fill="white" textAnchor="middle">A</text></svg>',
//   },
// ];

export default function MobileAssetTable({
  assets,
  safeDetails,
}: {
  assets: any[];
  safeDetails?: FormattedSafeDetails;
  type?: "emergency" | "target" | "automated";
}) {
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  //   const [isFirstModalOpen, setIsFirstModalOpen] = useState(false);
  //   const [isSecondModalOpen, setIsSecondModalOpen] = useState(false);
  const [updatedAssets, setUpdatedAssets] = useState<any>([]);
  //   const navigate = useNavigate();

  const account = useActiveAccount();
  //   const isConnected = !!account?.address;
  const address = account?.address;
  const { chain, diamondAddress } = useChainConfig();

  //   const hasNonZeroAssets = assets.some(
  //     (asset) => Number.parseFloat(asset.balance) > 0
  //   );

  useEffect(() => {
    if (!assets || !address) return;

    async function updateAssets(assets: any[]) {
      try {
        const transformedAssets: any[] = assets.map((asset: any) => ({
          token: asset.token,
          balance: asset.balance,
          saved: asset.saved,
          available: asset.available,
          balance_usd: null,
          saved_usd: null,
          autosaved: null,
          isMature: safeDetails
            ? safeDetails.id !== "911" &&
              safeDetails.unlockTime &&
              safeDetails.unlockTime < new Date() &&
              safeDetails.target &&
              safeDetails.target !== "Emergency Safe"
            : false,
          tokenInfo: tokenData[asset.token.toLowerCase()] || {
            symbol: "Unknown",
            name: "Token",
            color: "bg-[#440]",
          },
        }));

        setUpdatedAssets(transformedAssets);

        assets.forEach(async (asset: any, index: number) => {
          try {
            const balanceUsd = safeDetails
              ? null
              : await getTokenPrice(asset.token, Number(asset.balance));

            const savedUsd = await getTokenPrice(
              asset.token,
              Number(asset.saved),
            );

            const autosaved = await checkIsTokenAutoSaved(
              address! as `0x${string}`,
              asset.token,
              chain,
              diamondAddress,
            );

            let isMature = transformedAssets[index].isMature;

            if (!safeDetails && Number(asset.available) > 0) {
              isMature = true;
            }

            setUpdatedAssets((prev: any) => {
              const updated = [...prev];
              updated[index] = {
                ...updated[index],
                balance_usd: balanceUsd,
                saved_usd: savedUsd,
                autosaved,
                isMature,
              };
              return updated;
            });
          } catch {
            // Silent error handling
          }
        });
      } catch {
        // Silent error handling
      }
    }

    updateAssets(assets);
  }, [assets, address, safeDetails]);

  return (
    <div className="bg-[#1D1D1D73]/40">
      <div className="mx-auto max-w-md">
        <div className="bg-[#1D1D1D73]/40 rounded-lg overflow-hidden">
          {updatedAssets.map((asset: any, index: number) => (
            <div key={index}>
              <AssetsListItem
                asset={asset}
                onClick={() => setSelectedAsset(asset)}
              />
              {index < updatedAssets.length - 1 && (
                <div className="h-px bg-gray-200" />
              )}
            </div>
          ))}
        </div>
      </div>

      {selectedAsset && (
        <AssetDetailsModal
          asset={selectedAsset}
          safeDetails={safeDetails}
          onClose={() => setSelectedAsset(null)}
        />
      )}
    </div>
  );
}
