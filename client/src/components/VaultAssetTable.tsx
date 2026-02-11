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
import { publicClient } from "@/lib/client";
import { useTokenPrices } from "@/lib/price-service";
import { useEffect, useMemo, useState } from "react";
import SavingOption from "./Modals/SavingOption";
import MemoMoney from "@/icons/Money";
import ThirdwebConnectButton from "./ThirdwebConnectButton";
import { Check, X } from "lucide-react";
import { CoinsafeDiamondContract } from "@/lib/contract";
import { useActiveAccount } from "thirdweb/react";
import { getTokenDecimals, tokenData } from "@/lib/utils";
import { FormattedSafeDetails } from "@/hooks/useGetSafeById";
import { useRecoilState } from "recoil";
import { balancesState } from "@/store/atoms/balance";
import { useNavigate } from "react-router-dom";

interface VaultAssetTableProps {
  safeDetails?: FormattedSafeDetails;
  type?: "emergency" | "target" | "automated";
}

export default function VaultAssetTable({
  safeDetails,
  type,
}: VaultAssetTableProps) {
  const [allAssetData, setAllAssetData] = useState<
    { token: string; balance: string; saved: string; available: string }[]
  >([]);

  const [balances] = useRecoilState(balancesState);

  const availableTokenBalances = useMemo(
    () => balances.available,
    [balances.available],
  );
  const totalTokenBalances = useMemo(() => balances.total, [balances.total]);
  const savedTokenBalances = useMemo(
    () => balances.savings,
    [balances.savings],
  );

  useEffect(() => {
    if (
      safeDetails &&
      safeDetails.tokenAmounts &&
      safeDetails.tokenAmounts.length > 0
    ) {
      const safeAssetsRes = safeDetails.tokenAmounts.map((tokenInfo) => {
        return {
          token: tokenInfo.token,
          balance: tokenInfo.formattedAmount,
          saved: tokenInfo.formattedAmount,
          available: "0",
        };
      });

      setAllAssetData(safeAssetsRes);
      return;
    }

    if (!totalTokenBalances) return;

    const tokens = Object.keys(totalTokenBalances || {});
    if (tokens.length === 0) return;

    const allAssetsRes = tokens
      .filter((token) => {
        const savedAmount = BigInt((savedTokenBalances[token] as bigint) || 0n);
        return savedAmount > 0n;
      })
      .map((token) => {
        return {
          token,
          balance: formatUnits(
            BigInt((savedTokenBalances[token] as bigint) || 0n),
            getTokenDecimals(token),
          ),
          saved: formatUnits(
            BigInt((savedTokenBalances[token] as bigint) || 0n),
            getTokenDecimals(token),
          ),

          available: formatUnits(
            BigInt((availableTokenBalances[token] as bigint) || 0n),
            getTokenDecimals(token),
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
        <VaultAssetTableContent
          assets={allAssetData}
          safeDetails={safeDetails}
          type={type}
        />
      </div>
    </div>
  );
}

function VaultAssetTableContent({
  assets,
  safeDetails,
}: {
  assets: any[];
  safeDetails?: FormattedSafeDetails;
  type?: "emergency" | "target" | "automated";
}) {
  const [isFirstModalOpen, setIsFirstModalOpen] = useState(false);
  const [isSecondModalOpen, setIsSecondModalOpen] = useState(false);
  const [updatedAssets, setUpdatedAssets] = useState<any>([]);
  const navigate = useNavigate();

  const account = useActiveAccount();
  const isConnected = !!account?.address;
  const address = account?.address;

  const hasNonZeroAssets = assets.some(
    (asset) => Number.parseFloat(asset.balance) > 0,
  );

  const uniqueTokenIds = useMemo(() => {
    if (!assets) return [];
    return Array.from(new Set(assets.map((a: any) => a.token))).filter(
      (t) => !!t,
    ) as string[];
  }, [assets]);

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

  // Autosaved status state
  const [autosavedMap, setAutosavedMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!assets || !address) return;
    let mounted = true;

    const fetchAutosaved = async () => {
      try {
        const abi = [
          {
            inputs: [
              { internalType: "address", name: "_user", type: "address" },
              { internalType: "address", name: "_token", type: "address" },
            ],
            name: "isAutosaveEnabledForToken",
            outputs: [{ internalType: "bool", name: "", type: "bool" }],
            stateMutability: "view",
            type: "function",
          },
        ] as const;

        const contractAddress =
          CoinsafeDiamondContract.address as `0x${string}`;

        const calls = assets.map((asset) => ({
          address: contractAddress,
          abi,
          functionName: "isAutosaveEnabledForToken",
          args: [address, asset.token],
        }));

        const results = await publicClient.multicall({
          contracts: calls,
          allowFailure: true, // Allow robust handling
        });

        const map: Record<string, boolean> = {};
        results.forEach((result: any, index: number) => {
          const assetToken = assets[index].token;
          if (result.status === "success") {
            map[assetToken] = result.result as boolean;
          } else {
            console.error(
              "Error checking autosave for",
              assetToken,
              result.error,
            );
            map[assetToken] = false;
          }
        });

        if (mounted) setAutosavedMap(map);
      } catch (err) {
        console.error("Error fetching autosaved status:", err);
      }
    };

    fetchAutosaved();
    return () => {
      mounted = false;
    };
  }, [assets, address]);

  // Derive updatedAssets
  useEffect(() => {
    if (!assets) return;

    const transformedAssets: any[] = assets.map((asset: any) => {
      const price = tokenPriceMap[asset.token] || 0;

      // Helper to calc value
      const calcValue = (amountStr: string) => {
        const amount = Number(amountStr);
        if (isNaN(amount)) return null;
        return (amount * price).toFixed(2);
      };

      const balanceUsd = safeDetails ? null : calcValue(asset.balance);
      const savedUsd = calcValue(asset.saved);

      const isMature = safeDetails
        ? safeDetails.id !== "911" &&
          safeDetails.unlockTime &&
          safeDetails.unlockTime < new Date() &&
          safeDetails.target &&
          safeDetails.target !== "Emergency Safe"
        : false;

      // If no safeDetails (e.g. main vault), check available > 0
      const finalIsMature =
        !safeDetails && Number(asset.available) > 0 ? true : isMature;

      return {
        token: asset.token,
        balance: asset.balance,
        saved: asset.saved,
        available: asset.available,
        balance_usd: balanceUsd,
        saved_usd: savedUsd,
        autosaved: autosavedMap[asset.token] ?? null, // Use fetched autosaved status
        isMature: finalIsMature,
        tokenInfo: tokenData[asset.token] || {
          symbol: "Unknown",
          name: "Token",
          color: "bg-[#440]",
        },
      };
    });

    setUpdatedAssets(transformedAssets);
  }, [assets, tokenPriceMap, autosavedMap, safeDetails]);

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
              onClick={() => setIsFirstModalOpen(true)}
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
                AMOUNT IN SAFE
              </TableHead>
              <TableHead className="text-[#CACACA] font-normal text-sm py-4 px-4">
                AUTOSAVED
              </TableHead>
              <TableHead className="text-[#CACACA] font-normal text-sm py-4 px-4">
                CLAIMABLE AMOUNT
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
                      {safeDetails ? asset.saved : asset.balance}{" "}
                      {asset.tokenInfo.symbol}
                    </p>
                    <p className="text-xs text-gray-400">
                      ≈ $
                      {safeDetails
                        ? asset.saved_usd !== null
                          ? asset.saved_usd
                          : "Loading..."
                        : asset.balance_usd !== null
                          ? asset.balance_usd
                          : "Loading..."}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="py-4 px-4">
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
                  </div>
                </TableCell>
                <TableCell className="py-4 px-4">
                  <div className="flex items-center gap-2 justify-start">
                    {safeDetails?.unlockTime &&
                    safeDetails?.unlockTime < new Date()
                      ? (safeDetails?.totalAmountUSD ?? 0.0)
                      : "—"}
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
    </div>
  );
}
