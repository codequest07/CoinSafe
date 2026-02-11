"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { CardContent } from "./ui/card";
// import { CoinsafeDiamondContract } from "@/lib/contract";
import { useEffect, useState, useMemo } from "react";
import SavingOption from "./Modals/SavingOption";
import MemoMoney from "@/icons/Money";
import ThirdwebConnectButton from "./ThirdwebConnectButton";
import { useTokenPrices } from "@/lib/price-service";
// import { getContract, readContract } from "thirdweb";
// import { client, liskMainnet } from "@/lib/config";
// import { CoinsafeDiamondContract } from "@/lib/contract";
import { useActiveAccount } from "thirdweb/react";
import { tokenData } from "@/lib/utils";
import { FormattedSafeDetails } from "@/hooks/useGetSafeById";
import { useNavigate } from "react-router-dom";
import TopUpModal from "./Modals/Top-up-modal";
import UnlockModal from "./Modals/UnlockModal";
import WithdrawEmergencySafe from "./Modals/WithdrawEmergencySafe";
import TopUpEmergencySafe from "./Modals/TopUpEmegencySafe";

interface AssetTableProps {
  safeDetails?: FormattedSafeDetails;
  isEmergencyPage?: boolean;
}

export default function TargetAssetTable({
  safeDetails,
  isEmergencyPage,
}: AssetTableProps) {
  const [allAssetData, setAllAssetData] = useState<
    { token: string; balance: string; saved: string; available: string }[]
  >([]);

  useEffect(() => {
    // If safeDetails is provided, use the safe-specific token amounts
    if (
      safeDetails &&
      safeDetails.tokenAmounts &&
      safeDetails.tokenAmounts.length > 0
    ) {
      const safeAssetsRes = safeDetails.tokenAmounts.map((tokenInfo) => {
        return {
          token: tokenInfo.token,
          // For a specific safe, the balance is the amount in the safe
          balance: tokenInfo.formattedAmount,
          // For a specific safe, all tokens are "saved" in this safe
          saved: tokenInfo.formattedAmount,
          // For a specific safe, available is 0 as all tokens are locked in the safe
          available: "0",
        };
      });

      setAllAssetData(safeAssetsRes);
      return;
    }
  }, [safeDetails]);

  return (
    <div className="bg-[#1D1D1D73]/40 border border-white/10 text-white p-4 lg:p-5 rounded-lg overflow-hidden w-full">
      <div className="sm:mx-auto">
        <h1 className="text-xl font-semibold mb-4">
          {safeDetails
            ? `Assets in ${
                safeDetails.target ? safeDetails.target : "Auto safe"
              }`
            : "Assets"}
        </h1>
        <AssetTableContent
          assets={allAssetData}
          safeDetails={safeDetails}
          isEmergencyPage={isEmergencyPage}
        />
      </div>
    </div>
  );
}

function AssetTableContent({
  assets,
  safeDetails,
  isEmergencyPage,
}: {
  assets: any[];
  safeDetails?: FormattedSafeDetails;
  isEmergencyPage?: boolean;
}) {
  const [isFirstModalOpen, setIsFirstModalOpen] = useState(false);
  const [isSecondModalOpen, setIsSecondModalOpen] = useState(false);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const navigate = useNavigate();

  const account = useActiveAccount();
  const isConnected = !!account?.address;

  // 1. Get unique token IDs from assets to fetch prices
  const uniqueTokenIds = useMemo(() => {
    return Array.from(new Set(assets.map((a) => a.token))).filter((t) => !!t);
  }, [assets]);

  // 2. Fetch prices using SWR hook
  const priceQueries = useTokenPrices(uniqueTokenIds);

  const tokenPriceMap = useMemo(() => {
    const map: Record<string, number> = {};
    uniqueTokenIds.forEach((id, index) => {
      const query = priceQueries[index];
      if (query.data !== undefined) {
        map[id] = query.data;
      }
    });
    return map;
  }, [uniqueTokenIds, priceQueries]);

  const hasNonZeroAssets = assets.some(
    (asset) => Number.parseFloat(asset.balance) > 0,
  );

  const handleTopUp = () => {
    // Handle top-up logic here
    // console.log("Top up clicked");
    setShowTopUpModal(false);
  };

  // 3. Compute updated assets derived from assets + price map
  const updatedAssets = useMemo(() => {
    return assets.map((asset) => {
      const unitPrice = tokenPriceMap[asset.token] ?? 0;

      // Helper to calc value
      const calcValue = (amountStr: string) => {
        const amount = Number(amountStr);
        if (isNaN(amount)) return null;
        return (amount * unitPrice).toFixed(2);
      };

      const balanceUsd = safeDetails ? null : calcValue(asset.balance);
      const savedUsd = calcValue(asset.saved);

      // Loading state check: provided we have the token ID, query.isLoading could be used
      // But here we just check if unitPrice is present or if query is still loading.
      // For simplicity, if unitPrice is 0 it might mean loading OR 0 value.
      // We can check the specific query loading state if we want strict "Loading..." text.
      // but checking unitPrice presence in map (or map having entry) is safer.
      const isLoadingPrice = tokenPriceMap[asset.token] === undefined;

      return {
        token: asset.token,
        balance: asset.balance,
        saved: asset.saved,
        balance_usd: isLoadingPrice ? null : balanceUsd,
        saved_usd: isLoadingPrice ? null : savedUsd,
        autosaved: null,
        tokenInfo: tokenData[asset.token] || {
          symbol: "Unknown",
          name: "Lisk",
          color: "bg-[#440]",
        },
      };
    });
  }, [assets, tokenPriceMap, safeDetails]);

  if (!assets || assets.length === 0 || !hasNonZeroAssets) {
    return (
      <>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 rounded-full p-6">
            <MemoMoney className="w-20 h-20" />
          </div>
          <h3 className="mb-2 text-sm font-[400] text-white">
            {safeDetails
              ? `No assets found in this safe.`
              : isConnected
                ? "Too much empty space? fill it up with deposits!"
                : "No wallet connected, connect your wallet to get the best of coinsafe"}
          </h3>
          {safeDetails ? (
            <Button
              onClick={() => {
                setShowTopUpModal(true);
                // console.log("clicked");
                // console.log(safeDetails);
              }}
              className="mt-4 bg-[#1E1E1E99] px-8 py-2 rounded-[100px] text-[#F1F1F1] hover:bg-[#2a2a2a]"
            >
              Top Up Safe
            </Button>
          ) : isConnected ? (
            <Button
              className="mt-4 bg-[#1E1E1E99] px-8 py-2 rounded-[100px] text-[#F1F1F1] hover:bg-[#2a2a2a]"
              onClick={() => navigate("/deposit")}
            >
              Deposit
            </Button>
          ) : (
            <ThirdwebConnectButton />
          )}
        </div>
        <SavingOption
          isFirstModalOpen={isFirstModalOpen}
          setIsFirstModalOpen={setIsFirstModalOpen}
          isSecondModalOpen={isSecondModalOpen}
          setIsSecondModalOpen={setIsSecondModalOpen}
        />
        {safeDetails && showTopUpModal && (
          <TopUpModal
            onClose={() => setShowTopUpModal(false)}
            onTopUp={handleTopUp}
            safeId={Number(safeDetails.id)}
          />
        )}
      </>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <CardContent className="p-0">
        <Table className="w-full border-collapse min-w-[600px]">
          <TableHeader className="bg-[#1D1D1D73]/40">
            <TableRow className="border-b border-[#1D1D1D]">
              <TableHead className="text-[#CACACA] font-normal text-sm py-4 px-4">
                TICKER
              </TableHead>
              <TableHead className="text-[#CACACA] font-normal text-sm py-4 px-4">
                AMOUNT
              </TableHead>
              <TableHead className="text-[#CACACA] font-normal text-sm py-4 px-4">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="text-white">
            {updatedAssets.map((asset: any, index: number) => (
              <TableRow key={index} className="border-b border-[#1D1D1D]">
                <TableCell className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    {asset.tokenInfo?.image ? (
                      <div className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center">
                        <img
                          src={asset.tokenInfo?.image}
                          width={30}
                          height={30}
                          className="w-full h-full"
                        />
                      </div>
                    ) : (
                      <div
                        className={`w-7 h-7 rounded-full ${asset.tokenInfo.color} flex items-center justify-center text-white font-medium`}
                      >
                        {asset.tokenInfo.symbol?.charAt(0)}
                      </div>
                    )}
                    <div className="flex flex-col">
                      <p className="font-medium text-white">
                        {asset.tokenInfo.symbol}
                      </p>
                      <p className="text-xs text-gray-400">
                        {asset.tokenInfo.chain}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-4 px-4">
                  <div className="flex flex-col">
                    <p className="text-white">
                      {asset.saved} {asset.tokenInfo.symbol}
                    </p>
                    <p className="text-xs text-gray-400">
                      ≈ $
                      {asset.saved_usd !== null
                        ? asset.saved_usd
                        : "Loading..."}
                    </p>
                  </div>
                </TableCell>

                <TableCell className="py-4 px-4 text-right">
                  <div className="flex justify-end gap-4">
                    <Button
                      variant="link"
                      className="text-[#79E7BA] hover:text-[#79E7BA]/80 p-0"
                      onClick={() => setShowTopUpModal(true)}
                    >
                      Top Up
                    </Button>
                    <Button
                      variant="link"
                      className="text-[#79E7BA] hover:text-[#79E7BA]/80 p-0"
                      onClick={() => setShowUnlockModal(true)}
                    >
                      Unlock
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <SavingOption
        isFirstModalOpen={isFirstModalOpen}
        setIsFirstModalOpen={setIsFirstModalOpen}
        isSecondModalOpen={isSecondModalOpen}
        setIsSecondModalOpen={setIsSecondModalOpen}
      />
      {safeDetails && showTopUpModal && isEmergencyPage ? (
        <TopUpEmergencySafe
          isTopUpModalOpen={showTopUpModal}
          setIsTopUpModalOpen={setShowTopUpModal}
          onClose={() => setShowTopUpModal(false)}
          onTopUp={() => setShowTopUpModal(false)}
        />
      ) : (
        safeDetails &&
        showTopUpModal && (
          <TopUpModal
            onClose={() => setShowTopUpModal(false)}
            onTopUp={handleTopUp}
            safeId={Number(safeDetails.id)}
          />
        )
      )}

      {safeDetails && showUnlockModal && isEmergencyPage ? (
        <WithdrawEmergencySafe
          isWithdrawModalOpen={showUnlockModal}
          setIsWithdrawModalOpen={setShowUnlockModal}
          AvailableBalance={safeDetails.tokenAmounts.reduce(
            (acc, token) => {
              if (token && token.token) acc[token.token] = Number(token.amount);
              return acc;
            },
            {} as Record<string, number>,
          )}
        />
      ) : (
        safeDetails &&
        showUnlockModal && (
          <UnlockModal
            onClose={() => {
              setShowUnlockModal(false);
            }}
            onUnlock={() => {}}
            safeId={safeDetails.id.toString()}
          />
        )
      )}
    </div>
  );
}
