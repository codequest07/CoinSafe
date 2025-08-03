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
import { useEffect, useMemo, useState } from "react";
import SavingOption from "./Modals/SavingOption";
import MemoMoney from "@/icons/Money";
import ThirdwebConnectButton from "./ThirdwebConnectButton";
import { Check, X } from "lucide-react";
import { getTokenPrice } from "@/lib";
import { getContract, readContract } from "thirdweb";
import { client, liskMainnet } from "@/lib/config";
import { CoinsafeDiamondContract } from "@/lib/contract";
import { useActiveAccount } from "thirdweb/react";
import { getTokenDecimals, tokenData } from "@/lib/utils";
import { FormattedSafeDetails } from "@/hooks/useGetSafeById";
import { useRecoilState } from "recoil";
import { balancesState } from "@/store/atoms/balance";
import { useNavigate } from "react-router-dom";

async function checkIsTokenAutoSaved(
  userAddress: `0x${string}`,
  tokenAddress: string
) {
  const contract = getContract({
    client,
    address: CoinsafeDiamondContract.address,
    chain: liskMainnet,
  });

  const balance = await readContract({
    contract: contract,
    method:
      "function isAutosaveEnabledForToken(address _user, address _token) external view returns (bool)",
    params: [userAddress, tokenAddress],
  });
  return balance;
}

interface VaultAssetTableProps {
  safeDetails?: FormattedSafeDetails;
}

export default function VaultAssetTable({ safeDetails }: VaultAssetTableProps) {
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
            getTokenDecimals(token)
          ),
          saved: formatUnits(
            BigInt((savedTokenBalances[token] as bigint) || 0n),
            getTokenDecimals(token)
          ),

          available: formatUnits(
            BigInt((availableTokenBalances[token] as bigint) || 0n),
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
        <VaultAssetTableContent
          assets={allAssetData}
          safeDetails={safeDetails}
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
}) {
  const [isFirstModalOpen, setIsFirstModalOpen] = useState(false);
  const [isSecondModalOpen, setIsSecondModalOpen] = useState(false);
  const [updatedAssets, setUpdatedAssets] = useState<any>([]);
  const navigate = useNavigate();

  const account = useActiveAccount();
  const isConnected = !!account?.address;
  const address = account?.address;

  const hasNonZeroAssets = assets.some(
    (asset) => Number.parseFloat(asset.balance) > 0
  );

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
          tokenInfo: tokenData[asset.token] || {
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
              Number(asset.saved)
            );

            const autosaved = await checkIsTokenAutoSaved(
              address! as `0x${string}`,
              asset.token
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
              onClick={() => navigate("/dashboard/deposit")}
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
    <div className="w-full">
      <CardContent className="p-0">
        <Table className="w-full border-collapse">
          <TableHeader className="bg-[#1D1D1D73]/40">
            <TableRow className="border-b border-[#1D1D1D]">
              <TableHead className="text-[#CACACA] font-normal text-sm py-4 px-4">
                TICKER
              </TableHead>
              <TableHead className="text-[#CACACA] font-normal text-sm py-4 px-4">
                AMOUNT
              </TableHead>
              <TableHead className="text-[#CACACA] font-normal text-sm py-4 px-4">
                AUTOSAVED
              </TableHead>
              <TableHead className="text-[#CACACA] font-normal text-sm py-4 px-4">
                CLAIMABLE AMOUNT
              </TableHead>
              {/* Actions column header - temporarily commented out
              <TableHead className="text-[#CACACA] font-normal text-sm py-4 px-4">
                <span className="sr-only">Actions</span>
              </TableHead>
              */}
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
                  {Number(asset.available) > 0 && asset.isMature ? (
                    <div className="flex flex-col">
                      <p className="text-white">
                        {asset.available} {asset.tokenInfo.symbol}
                      </p>
                      <p className="text-xs text-gray-400">
                        ≈ $
                        {asset.balance_usd !== null
                          ? asset.balance_usd
                          : "Loading..."}
                      </p>
                    </div>
                  ) : (
                    <div className="text-center">-</div>
                  )}
                </TableCell>
                {/* Claim button cell - temporarily commented out
                <TableCell className="py-4 px-4 text-right">
                  {Number(asset.available) > 0 && asset.isMature ? (
                    <Button
                      variant="link"
                      className="text-[#79E7BA] hover:text-[#79E7BA]/80 p-0"
                      onClick={() => navigate("/dashboard/claim")}>
                      Claim
                    </Button>
                  ) : null}
                </TableCell>
                */}
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
