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
import { useEffect, useMemo, useState } from "react";
import SavingOption from "./Modals/SavingOption";
import MemoMoney from "@/icons/Money";
import ThirdwebConnectButton from "./ThirdwebConnectButton";
import { getTokenPrice } from "@/lib";
// import { getContract, readContract } from "thirdweb";
// import { client, liskMainnet } from "@/lib/config";
// import { CoinsafeDiamondContract } from "@/lib/contract";
import { useActiveAccount } from "thirdweb/react";
import { getTokenDecimals, getUserTokenYield, tokenData } from "@/lib/utils";
import { useChainConfig } from "@/hooks/useChainConfig";

import { FormattedSafeDetails } from "@/hooks/useGetSafeById";
import { useRecoilState } from "recoil";
import { balancesState } from "@/store/atoms/balance";
import { useNavigate } from "react-router-dom";
import TopUpModal from "./Modals/Top-up-modal";
import UnlockModal from "./Modals/UnlockModal";
import { formatUnits } from "viem";
import { saveAtom } from "@/store/atoms/save";
import TopUpEmergencySafe from "./Modals/TopUpEmegencySafe";
import WithdrawEmergencySafe from "./Modals/WithdrawEmergencySafe";

interface AssetTableProps {
  safeDetails?: FormattedSafeDetails;
  isEmergencyPage?: boolean;
}

export default function TargetAssetTable({
  safeDetails,
  isEmergencyPage: _isEmergencyPage,
}: AssetTableProps) {
  const [allAssetData, setAllAssetData] = useState<
    { token: string; balance: string; yield?: string }[]
  >([]);

  const [balances] = useRecoilState(balancesState);
  const { chain, diamondAddress } = useChainConfig();

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
    const fetchSafeAssets = async () => {
      if (
        safeDetails &&
        safeDetails.tokenAmounts &&
        safeDetails.tokenAmounts.length > 0
      ) {
        // console.log("SafeDetails from target assets table", safeDetails);

        const safeAssetsRes = await Promise.all(
          safeDetails.tokenAmounts.map(async (tokenInfo) => {
            let effectiveYield: bigint | null = null;

            // Yield calculations now use the active chain and diamond address.
            if (
              safeDetails.id !== "911" &&
              typeof safeDetails.target === "string" &&
              safeDetails.target !== "Emergency Safe"
            ) {
              try {
                effectiveYield = await getUserTokenYield(
                  tokenInfo.token,
                  safeDetails.feePercentage!,
                  tokenInfo.tokenShares!,
                  BigInt(tokenInfo.amount)!,
                  chain,
                  diamondAddress,
                );
              } catch (error) {
                console.error("Error fetching token yield:", error);
                effectiveYield = null;
              }
            }

            return {
              token: tokenInfo.token,
              // For a specific safe, the balance is the amount in the safe
              balance: tokenInfo.formattedAmount,
              saved: tokenInfo.formattedAmount,
              yield:
                effectiveYield && effectiveYield > 0n
                  ? formatUnits(
                      effectiveYield,
                      getTokenDecimals(tokenInfo.token),
                    )
                  : "0",
            };
          }),
        );

        setAllAssetData(safeAssetsRes);
      }
    };

    fetchSafeAssets();
  }, [
    availableTokenBalances,
    totalTokenBalances,
    savedTokenBalances,
    safeDetails,
    chain,
    diamondAddress,
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
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [showTopUpEmergencyModal, setShowTopUpEmergencyModal] = useState(false);
  const [showWithdrawEmergencyModal, setShowWithdrawEmergencyModal] =
    useState(false);
  const [selectedToken, setSelectedToken] = useState<string | undefined>();
  const [updatedAssets, setUpdatedAssets] = useState<any>([]);
  const [, setSaveState] = useRecoilState(saveAtom);

  const navigate = useNavigate();
  // console.log("ASSETS FPR TARGET", assets);
  const account = useActiveAccount();
  const isConnected = !!account?.address;
  const address = account?.address;

  const hasNonZeroAssets = assets.some(
    (asset) => Number.parseFloat(asset.balance) > 0,
  );

  const handleTopUp = () => {
    // Handle top-up logic here
    console.log("Top up clicked");
    setShowTopUpModal(false);
  };

  useEffect(() => {
    if (!assets || !address) return;

    let isMounted = true;

    async function updateAssets(assets: any[]) {
      try {
        const transformedAssets: any[] = assets.map((asset: any) => ({
          token: asset.token,
          balance: asset.balance,
          saved: asset.saved,
          yield: asset.yield,
          balance_usd: null, // Placeholder for loading state
          saved_usd: null, // Placeholder for loading state
          autosaved: null, // Placeholder for loading state
          yield_usd: null,
          tokenInfo: tokenData[asset?.token?.toLowerCase()] || {
            symbol: "Unknown",
            name: "Lisk",
            color: "bg-[#440]",
          },
        }));

        if (isMounted) {
          setUpdatedAssets(transformedAssets);
        }

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
              Number(asset.saved),
            );

            const yieldUsd = await getTokenPrice(
              asset.token,
              Number(asset.yield),
            );

            if (isMounted) {
              setUpdatedAssets((prev: any) => {
                // Determine if we should update based on current state length
                // This prevents out-of-bounds updates if the asset list has changed
                if (index >= prev.length) return prev;

                // Compare token to ensure we are updating the correct asset
                // This handles cases where list order might have changed (unlikely with index but good safety)
                if (prev[index].token !== asset.token) return prev;

                const updated = [...prev];
                updated[index] = {
                  ...updated[index],
                  balance_usd: balanceUsd,
                  saved_usd: savedUsd,
                  yield_usd: yieldUsd,
                };
                return updated;
              });
            }
          } catch {
            // Silent error handling
          }
        });
      } catch {
        // Silent error handling
      }
    }

    if (address && assets.length > 0) updateAssets(assets);

    return () => {
      isMounted = false;
    };
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
              onClick={() => {
                setShowTopUpModal(true);
                console.log("clicked");
                console.log(safeDetails);
              }}
              className="mt-4 bg-[#1E1E1E99] px-8 py-2 rounded-[100px] text-[#F1F1F1] hover:bg-[#2a2a2a]">
              Top Up Safe
            </Button>
          ) : isConnected ? (
            <Button
              className="mt-4 bg-[#1E1E1E99] px-8 py-2 rounded-[100px] text-[#F1F1F1] hover:bg-[#2a2a2a]"
              onClick={() => navigate("/deposit")}>
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
                YIELD ON SAVINGS
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
                      {asset.saved} {asset.tokenInfo.symbol}
                    </p>
                    <p className="text-xs text-gray-400">
                      ≈ ${asset.saved !== null ? asset.saved_usd : "Loading..."}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="p-4 text-[#79E7BA] hover:text-[#79E7BA]/80">
                  <div className="flex flex-col">
                    <p className="">
                      {asset?.yield > 0 ? (
                        <>
                          +{" "}
                          {(() => {
                            const y = Number(asset?.yield);
                            const precision =
                              y >= 1 ? 2 : y >= 0.01 ? 3 : y >= 0.001 ? 4 : 5;
                            return Number(y.toFixed(precision));
                          })()}{" "}
                        </>
                      ) : (
                        "0.00"
                      )}{" "}
                      {asset.tokenInfo.symbol}
                    </p>
                    <p className="text-xs">
                      ≈ $
                      {asset.yield_usd !== null
                        ? asset.yield_usd > 0
                          ? asset?.yield_usd
                          : "0.00"
                        : "Loading..."}
                    </p>
                  </div>
                </TableCell>

                <TableCell className="py-4 px-4 text-right">
                  <div className="flex justify-end gap-4">
                    <Button
                      variant="link"
                      className="text-[#79E7BA] hover:text-[#79E7BA]/80 p-0"
                      onClick={() => {
                        setSaveState((prevState) => ({
                          ...prevState,
                          token: asset.token,
                        }));
                        if (
                          safeDetails?.id &&
                          BigInt(safeDetails.id) === 911n
                        ) {
                          setShowTopUpEmergencyModal(true);
                        } else {
                          setShowTopUpModal(true);
                        }
                      }}>
                      Top Up
                    </Button>
                    <Button
                      variant="link"
                      className="text-[#79E7BA] hover:text-[#79E7BA]/80 p-0"
                      onClick={() => {
                        setSelectedToken(asset.token);
                        if (
                          safeDetails?.id &&
                          BigInt(safeDetails.id) === 911n
                        ) {
                          setShowWithdrawEmergencyModal(true);
                        } else {
                          setShowUnlockModal(true);
                        }
                      }}>
                      {safeDetails?.id && BigInt(safeDetails.id) === 911n
                        ? "Withdraw"
                        : "Unlock"}
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

      {showTopUpEmergencyModal && (
        <TopUpEmergencySafe
          isTopUpModalOpen={showTopUpEmergencyModal}
          setIsTopUpModalOpen={setShowTopUpEmergencyModal}
          onClose={() => setShowTopUpEmergencyModal(false)}
        />
      )}

      {safeDetails && showUnlockModal && (
        <UnlockModal
          onClose={() => {
            setShowUnlockModal(false);
            setSelectedToken(undefined);
          }}
          onUnlock={() => {}}
          safeId={safeDetails?.id?.toString()}
          initialToken={selectedToken}
        />
      )}

      {showWithdrawEmergencyModal && (
        <WithdrawEmergencySafe
          isWithdrawModalOpen={showWithdrawEmergencyModal}
          setIsWithdrawModalOpen={setShowWithdrawEmergencyModal}
          AvailableBalance={safeDetails?.tokenAmounts.reduce(
            (acc: any, token: any) => {
              if (token && token.token) acc[token.token] = token.amount;
              return acc;
            },
            {} as Record<string, unknown>,
          )}
        />
      )}
    </div>
  );
}
