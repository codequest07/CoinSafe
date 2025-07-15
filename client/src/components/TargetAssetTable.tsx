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
import { formatUnits } from "viem";
// import { CoinsafeDiamondContract } from "@/lib/contract";
import { useEffect, useMemo, useState } from "react";
import SavingOption from "./Modals/SavingOption";
import MemoMoney from "@/icons/Money";
import ThirdwebConnectButton from "./ThirdwebConnectButton";
import { getTokenPrice } from "@/lib";
// import { getContract, readContract } from "thirdweb";
// import { client, liskSepolia } from "@/lib/config";
// import { CoinsafeDiamondContract } from "@/lib/contract";
import { useActiveAccount } from "thirdweb/react";
import { getTokenDecimals, tokenData } from "@/lib/utils";
import { FormattedSafeDetails } from "@/hooks/useGetSafeById";
import { useRecoilState } from "recoil";
import { balancesState } from "@/store/atoms/balance";
import { useNavigate } from "react-router-dom";
import TopUpModal from "./Modals/Top-up-modal";

interface AssetTableProps {
  safeDetails?: FormattedSafeDetails;
}

export default function TargetAssetTable({ safeDetails }: AssetTableProps) {
  const [allAssetData, setAllAssetData] = useState<
    { token: string; balance: string; saved: string; available: string }[]
  >([]);

  const [balances] = useRecoilState(balancesState);

  const availableTokenBalances = useMemo(
    () => balances.available,
    [balances.available]
  );
  const totalTokenBalances = useMemo(() => balances.total, [balances.total]);
  const savedTokenBalances = useMemo(
    () => balances.savings,
    [balances.savings]
  );

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

    // If no safeDetails or using global view, use the global balances
    if (!totalTokenBalances) return;

    const tokens = Object.keys(totalTokenBalances || {});
    if (tokens.length === 0) return;

    const allAssetsRes = tokens.map((token) => {
      return {
        token,
        balance: formatUnits(
          BigInt((totalTokenBalances[token] as bigint) || 0),
          getTokenDecimals(token)
        ),
        saved: formatUnits(
          BigInt((savedTokenBalances[token] as bigint) || 0),
          getTokenDecimals(token)
        ),
        available: formatUnits(
          BigInt((availableTokenBalances[token] as bigint) || 0),
          getTokenDecimals(token)
        ),
      };
    });

    setAllAssetData(allAssetsRes);
  }, [
    availableTokenBalances,
    totalTokenBalances,
    savedTokenBalances,
    safeDetails,
  ]);

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
        <AssetTableContent assets={allAssetData} safeDetails={safeDetails} />
      </div>
    </div>
  );
}

function AssetTableContent({
  assets,
  safeDetails,
}: {
  assets: any[];
  safeDetails?: FormattedSafeDetails;
}) {
  const [isFirstModalOpen, setIsFirstModalOpen] = useState(false);
  const [isSecondModalOpen, setIsSecondModalOpen] = useState(false);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [updatedAssets, setUpdatedAssets] = useState<any>([]);
  const navigate = useNavigate();

  const account = useActiveAccount();
  const isConnected = !!account?.address;
  const address = account?.address;

  const hasNonZeroAssets = assets.some(
    (asset) => Number.parseFloat(asset.balance) > 0
  );

  const handleTopUp = () => {
    // Handle top-up logic here
    console.log("Top up clicked");
    setShowTopUpModal(false);
  };

  useEffect(() => {
    if (!assets || !address) return;

    async function updateAssets(assets: any[]) {
      try {
        const transformedAssets: any[] = assets.map((asset: any) => ({
          token: asset.token,
          balance: asset.balance,
          saved: asset.saved,
          balance_usd: null, // Placeholder for loading state
          saved_usd: null, // Placeholder for loading state
          autosaved: null, // Placeholder for loading state
          tokenInfo: tokenData[asset.token] || {
            symbol: "Unknown",
            name: "Lisk",
            color: "bg-[#440]",
          },
        }));

        setUpdatedAssets(transformedAssets);

        // Fetch additional data asynchronously
        assets.forEach(async (asset: any, index: number) => {
          try {
            // For safe-specific view, we only need the saved USD value
            // For global view, we need both balance and saved USD values
            const balanceUsd = safeDetails
              ? null
              : await getTokenPrice(asset.token, Number(asset.balance));

            const savedUsd = await getTokenPrice(
              asset.token,
              Number(asset.saved)
            );

            setUpdatedAssets((prev: any) => {
              const updated = [...prev];
              updated[index] = {
                ...updated[index],
                balance_usd: balanceUsd,
                saved_usd: savedUsd,
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

    if (address && assets.length > 0) updateAssets(assets);
  }, [assets, address, safeDetails]);

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
              onClick={() => setShowTopUpModal(true)}
              className="mt-4 bg-[#1E1E1E99] px-8 py-2 rounded-[100px] text-[#F1F1F1] hover:bg-[#2a2a2a]">
              Top Up Safe
            </Button>
          ) : isConnected ? (
            <Button
              className="mt-4 bg-[#1E1E1E99] px-8 py-2 rounded-[100px] text-[#F1F1F1] hover:bg-[#2a2a2a]"
              onClick={() => navigate("/dashboard/deposit")}>
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
        {safeDetails && (
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
    <div className="w-full">
      <CardContent className="p-0">
        <Table className="w-full ga-8 border-collapse">
          <TableHeader className="bg-[#1D1D1D73]/40">
            <TableRow className="border-b border-[#1D1D1D]">
              <TableHead className="text-[#CACACA] font-normal text-sm py-4 px-4">
                TICKER
              </TableHead>

              <TableHead className="text-[#CACACA] font-normal text-sm py-4 px-4">
                AMOUNT
              </TableHead>

              <TableHead className="text-[#CACACA] font-normal uppercase text-sm py-4 px-4">
                Estimated Yield on savings
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
                        className={`w-7 h-7 rounded-full ${asset.tokenInfo.color} flex items-center justify-center text-white font-medium`}>
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
                      {asset.balance} {asset.tokenInfo.symbol}
                    </p>
                    <p className="text-xs text-gray-400">
                      ≈ $
                      {asset.balance_usd !== null
                        ? asset.balance_usd
                        : "Loading..."}
                    </p>
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
                      onClick={() => setShowTopUpModal(true)}>
                      Top Up
                    </Button>
                    <Button
                      variant="link"
                      className="text-[#79E7BA] hover:text-[#79E7BA]/80 p-0"
                      onClick={() => navigate("/dashboard/deposit")}>
                      Withdraw
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
      {safeDetails && showTopUpModal && (
        <TopUpModal
          onClose={() => setShowTopUpModal(false)}
          onTopUp={handleTopUp}
          safeId={Number(safeDetails.id)}
        />
      )}
    </div>
  );
}
