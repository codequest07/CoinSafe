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
import { formatEther } from "viem";
// import { CoinsafeDiamondContract } from "@/lib/contract";
import { useEffect, useMemo, useState } from "react";
import SavingOption from "./Modals/SavingOption";
import Deposit from "./Modals/Deposit";
import MemoMoney from "@/icons/Money";
import ThirdwebConnectButton from "./ThirdwebConnectButton";
import { useBalances } from "@/hooks/useBalances";
import { Check, X } from "lucide-react";
import { getSafuToUsd } from "@/lib";
import { getContract, readContract } from "thirdweb";
import { client, liskSepolia } from "@/lib/config";
import { CoinsafeDiamondContract } from "@/lib/contract";
import { useActiveAccount } from "thirdweb/react";
import { tokenData } from "@/lib/utils";

async function checkIsTokenAutoSaved(
  userAddress: `0x${string}`,
  tokenAddress: string
) {
  const contract = getContract({
    client,
    address: CoinsafeDiamondContract.address,
    chain: liskSepolia,
  });

  const balance = await readContract({
    contract: contract,
    method:
      "function isAutosaveEnabledForToken(address _user, address _token) external view returns (bool)",
    params: [userAddress, tokenAddress],
  });
  return balance;
}

export default function AssetTable() {
  const [allAssetData, setAllAssetData] = useState<
    { token: string; balance: string; saved: string; available: string }[]
  >([]);
  const account = useActiveAccount();
  const address = account?.address;

  const { AvailableBalance, TotalBalance, SavedBalance } = useBalances(
    address as string
  );

  const availableTokenBalances = useMemo(
    () => AvailableBalance,
    [AvailableBalance]
  );
  const totalTokenBalances = useMemo(() => TotalBalance, [TotalBalance]);
  const savedTokenBalances = useMemo(() => SavedBalance, [SavedBalance]);

  useEffect(() => {
    if (!totalTokenBalances) return;

    const tokens = Object.keys(totalTokenBalances || {});
    if (tokens.length === 0) return;

    const allAssetsRes = tokens.map((token) => {
      return {
        token,
        balance: formatEther(
          BigInt((totalTokenBalances[token] as bigint) || 0)
        ),
        saved: formatEther(BigInt((savedTokenBalances[token] as bigint) || 0)),
        available: formatEther(
          BigInt((availableTokenBalances[token] as bigint) || 0)
        ),
      };
    });

    setAllAssetData(allAssetsRes);
  }, [availableTokenBalances, totalTokenBalances, savedTokenBalances]);

  return (
    <div className="bg-[#1D1D1D73]/40 border border-white/10 text-white p-4 lg:p-5 rounded-lg overflow-hidden w-full">
      <div className="sm:mx-auto">
        <h1 className="text-xl font-semibold mb-4">Assets</h1>
        <AssetTableContent assets={allAssetData} />
      </div>
    </div>
  );
}

function AssetTableContent({ assets }: { assets: any[] }) {
  const [isFirstModalOpen, setIsFirstModalOpen] = useState(false);
  const [isSecondModalOpen, setIsSecondModalOpen] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [updatedAssets, setUpdatedAssets] = useState<any>([]);

  const account = useActiveAccount();
  const isConnected = !!account?.address;
  const address = account?.address;

  const openDepositModal = () => {
    setIsDepositModalOpen(true);
  };

  const hasNonZeroAssets = assets.some(
    (asset) => Number.parseFloat(asset.balance) > 0
  );

  useEffect(() => {
    if (!assets || !address) return;
    console.log("Assets in the assets table sub component", assets);
    

    async function updateAssets(assets: any[]) {
      try {
        const transformedAssets: any[] = await Promise.all(
          assets.map(async (asset: any) => ({
            token: asset.token,
            balance: asset.balance,
            saved: asset.saved,
            balance_usd: await getSafuToUsd(Number(asset.balance)),
            saved_usd: await getSafuToUsd(Number(asset.saved)),
            autosaved: await checkIsTokenAutoSaved(
              address! as `0x${string}`,
              asset.token
            ),
            tokenInfo: tokenData[asset.token] || {
              symbol: "Unknown",
              name: "Lisk",
              color: "bg-[#440]",
            },
          }))
        );

        setUpdatedAssets(transformedAssets);
      } catch (error) {
        console.error("Error updating assets:", error);
      }
    }

    if (address && assets.length > 0) updateAssets(assets);
  }, [assets, address]);

  if (!assets || assets.length === 0 || !hasNonZeroAssets) {
    return (
      <>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 rounded-full p-6">
            <MemoMoney className="w-20 h-20" />
          </div>
          <h3 className="mb-2 text-sm font-[400] text-white">
            {isConnected
              ? "Too much empty space? fill it up with deposits!"
              : "No wallet connected, connect your wallet to get the best of coinsafe"}
          </h3>
          {isConnected ? (
            <Button
              onClick={openDepositModal}
              className="mt-4 bg-[#1E1E1E99] px-8 py-2 rounded-[100px] text-[#F1F1F1] hover:bg-[#2a2a2a]"
            >
              Deposit
            </Button>
          ) : (
            <ThirdwebConnectButton />
          )}
        </div>
        <Deposit
          isDepositModalOpen={isDepositModalOpen}
          setIsDepositModalOpen={setIsDepositModalOpen}
          onBack={() => {}}
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
                IN VAULT
              </TableHead>
              <TableHead className="text-[#CACACA] font-normal text-sm py-4 px-4">
                AUTOSAVED
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
                  {/* THIS LINK BELOW IS GOING TO BE USEFUL FOR FETCHING TOKEN ICON INFO */}
                  {/* https://portal.thirdweb.com/references/typescript/v5/TokenIcon */}
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-full ${asset.tokenInfo.color} flex items-center justify-center text-white font-medium`}
                    >
                      {asset.tokenInfo.symbol?.charAt(0)}
                    </div>
                    {/* <TokenProvider
                      address={asset.token}
                      chain={liskSepolia}
                      client={client}
                    >
                      <TokenIcon loadingComponent={<p>..</p>}/>
                    </TokenProvider> */}
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
                      ≈ ${asset.balance_usd.toFixed(2)}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="py-4 px-4">
                  <div className="flex flex-col">
                    <p className="text-white">
                      {asset.saved} {asset.tokenInfo.symbol}
                    </p>
                    <p className="text-xs text-gray-400">
                      ≈ ${asset.saved_usd.toFixed(2)}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    {asset.autosaved ? (
                      <>
                        <span className="text-[#48FF91]">Yes</span>
                        <div className="w-4 h-4 rounded-full bg-[#48FF91] flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
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
                <TableCell className="py-4 px-4 text-right">
                  <div className="flex justify-end gap-4">
                    <Button
                      variant="link"
                      className="text-[#79E7BA] hover:text-[#79E7BA]/80 p-0"
                      onClick={() => setIsDepositModalOpen(true)}
                    >
                      Deposit
                    </Button>
                    <Button
                      variant="link"
                      className="text-[#79E7BA] hover:text-[#79E7BA]/80 p-0"
                      onClick={() => setIsFirstModalOpen(true)}
                    >
                      Save
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
      <Deposit
        isDepositModalOpen={isDepositModalOpen}
        setIsDepositModalOpen={setIsDepositModalOpen}
        onBack={() => {}}
      />
    </div>
  );
}
