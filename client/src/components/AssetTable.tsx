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
// import { CoinSafeContract, CoinsafeDiamondContract } from "@/lib/contract";
import { useEffect, useMemo, useState } from "react";
import SavingOption from "./Modals/SavingOption";
import Deposit from "./Modals/Deposit";
import MemoMoney from "@/icons/Money";
import ThirdwebConnectButton from "./ThirdwebConnectButton";
// import { readContract } from "@wagmi/core";
// import { config } from "@/lib/config";
import { useBalances } from "@/hooks/useBalances";
import { useActiveAccount } from "thirdweb/react";
import { Check, X } from "lucide-react";
import { getSafuToUsd } from "@/lib";

// async function checkIsTokenAutoSaved(
//   userAddress: `0x${string}`,
//   tokenAddress: string
// ) {
//   const result = await readContract(config, {
//     abi: CoinSafeContract.abi.abi,
//     address: CoinsafeDiamondContract.address as `0x${string}`,
//     functionName: "isTokenAutoSaved",
//     args: [userAddress, tokenAddress],
//   });
//   return result;
// }

export default function AssetTable() {
  const [allAssetData, setAllAssetData] = useState([]);
  const account = useActiveAccount();
  const address = account?.address;

  const {
    AvailableBalance: LiquidTokenBalances,
    TotalBalance: AllTokenBalances,
  } = useBalances(address as string);

  const allAssets: any = useMemo(
    () => AllTokenBalances || [],
    [AllTokenBalances]
  );
  const liquidAssets: any = useMemo(
    () => LiquidTokenBalances || [],
    [LiquidTokenBalances]
  );

  useEffect(() => {
    if (allAssets.length === 0) return;
    // Map through the 2D array to create objects
    const allAssetsRes = allAssets[0]?.map(
      (key: any, index: string | number) => {
        return {
          token: key,
          balance: formatEther(allAssets[1][index]),
          saved: formatEther(
            BigInt(allAssets[1][index] - liquidAssets[1][index])
          ),
        };
      }
    );
    console.log(
      "All Assets Ressssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss",
      allAssetsRes
    );
    setAllAssetData(allAssetsRes);
  }, [allAssets, liquidAssets]);

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
    console.log("Assets in the assets table sub component", assets);
    const tokenData = {
      "0xBb88E6126FdcD4ae6b9e3038a2255D66645AEA7a": {
        symbol: "SAFU",
        chain: "Lisk",
        color: "#22c55e",
      },
    } as any;

    async function updateAssets(assets: any[]) {
      try {
        console.log("====================================");
        console.log("updating assetssssssssssssssssss");
        console.log("====================================");
        const transformedAssets: any[] = await Promise.all(
          assets.map(async (asset: any) => ({
            token: asset.token,
            balance: asset.balance,
            saved: asset.saved,
            balance_usd: await getSafuToUsd(Number(asset.balance)),
            saved_usd: await getSafuToUsd(Number(asset.saved)),
            autosaved: true,
            // await checkIsTokenAutoSaved(
            //   address! as `0x${string}`,
            //   asset.token
            // ),
            tokenInfo: tokenData[asset.token] || {
              symbol: "SAFU",
              name: "Lisk",
              color: "#22c55e",
            },
          }))
        );

        console.log("====================================");
        console.log("Transformed assets", transformedAssets);
        console.log("====================================");

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
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full bg-[${asset.tokenInfo.color}] flex items-center justify-center text-white font-medium`}>
                      {asset.tokenInfo.symbol?.charAt(0)}
                    </div>
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
