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
import MemoCheckIcon from "@/icons/CheckIcon";
import MemoXmarkIcon from "@/icons/XmarkIcon";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAccount, useReadContract } from "wagmi";
import { formatEther } from "viem";
import { CoinSafeContract } from "@/lib/contract";
import { useEffect, useState } from "react";
import SavingOption from "./Modals/SavingOption";
import Deposit from "./Modals/Deposit";
import MemoMoney from "@/icons/Money";

export default function AssetTable() {
  const [assetData, setAssetData] = useState([]);
  const { address } = useAccount();

  const { data: TokenBalances } = useReadContract({
    abi: CoinSafeContract.abi.abi,
    address: CoinSafeContract.address as `0x${string}`,
    functionName: "getUserBalances",
    args: [address],
  });

  const { data: LiquidTokenBalances } = useReadContract({
    abi: CoinSafeContract.abi.abi,
    address: CoinSafeContract.address as `0x${string}`,
    functionName: "getAvailableBalances",
    args: [address],
  });

  const { data: SavedTokenBalances } = useReadContract({
    abi: CoinSafeContract.abi.abi,
    address: CoinSafeContract.address as `0x${string}`,
    functionName: "getUserSavings",
    args: [address],
  });

  const assets: any = TokenBalances || [];

  useEffect(() => {
    if (assets.length === 0) return;
    const result = assets[0]?.map((key: any, index: string | number) => ({
      token: key,
      balance: formatEther(assets[1][index]),
    }));
    setAssetData(result);
  }, [assets]);

  return (
    <div className="bg-[#010104] border border-[#13131373] overflow-hidden p-4 rounded-[2rem] text-white w-full">
      <div className="sm:mx-auto">
        <h1 className="text-xl font-semibold mb-4">Assets</h1>
        <Tabs defaultValue="all-assets" className="w-full">
          <TabsList className="sm:flex space-x-4 hidden bg-[#1E1E1E99] rounded-[2rem] p-2 mb-4">
            <TabsTrigger
              value="all-assets"
              className="text-white px-4 py-2 rounded-full">
              All assets
            </TabsTrigger>
            <TabsTrigger
              value="liquid-assets"
              className="text-white px-4 py-2 rounded-full">
              Liquid assets
            </TabsTrigger>
            <TabsTrigger
              value="staked-assets"
              className="text-white px-4 py-2 rounded-full">
              Staked assets
            </TabsTrigger>
            <TabsTrigger
              value="saved-assets"
              className="text-white px-4 py-2 rounded-full">
              Saved assets
            </TabsTrigger>
          </TabsList>
          <TabsContent value="all-assets">
            <AssetTableContent assets={allAssetData} />
          </TabsContent>
          <TabsContent value="liquid-assets">
          <AssetTableContent assets={liquidAssetData} />
          </TabsContent>
          <TabsContent value="staked-assets">
            <AssetTableContent assets={[]} />
          </TabsContent>
          <TabsContent value="saved-assets">
            <AssetTableContent assets={savedAssetData} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function AssetTableContent({ assets }: { assets: any[] }) {
  const [isFirstModalOpen, setIsFirstModalOpen] = useState(false);
  const [isSecondModalOpen, setIsSecondModalOpen] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);

  const openDepositModal = () => {
    setIsDepositModalOpen(true);
  };

  const tokenData = {
    "0xBb88E6126FdcD4ae6b9e3038a2255D66645AEA7a": "SAFU",
    "0x8a21CF9Ba08Ae709D64Cb25AfAA951183EC9FF6D": "LSK",
    "0xd26be7331edd458c7afa6d8b7fcb7a9e1bb68909": "USDT",
    "0xd26Be7331EDd458c7Afa6D8B7fcB7a9e1Bb68909": "USDT",
  } as any;

  const hasNonZeroAssets = assets.some(
    (asset) => parseFloat(asset.balance) > 0
  );

  if (!assets || assets.length === 0 || !hasNonZeroAssets) {
    return (
      <>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-6 rounded-full p-6">
            <MemoMoney className="w-16 h-16" />
          </div>
          <h3 className="mb-2 text-sm font-[400] text-white">
            Too much empty space? fill it up with deposits!
          </h3>
          <Button
            onClick={openDepositModal}
            className="mt-4 bg-[#1E1E1E99] rounded-[2rem] text-[#F1F1F1] hover:bg-[#2a2a2a]">
            Deposit
          </Button>
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
    <div className="bg-[#010104] w-full p-4 rounded-lg">
      <CardContent>
        <Table className="w-full">
          <TableHeader className="bg-[#1E1E1E99] text-[#CACACA]">
            <TableRow className="w-full">
              <TableHead className="w-1/3">Ticker</TableHead>
              <TableHead className="w-1/3">Amount</TableHead>
              <TableHead className="hidden md:table-cell w-1/3">
                Autosaved
              </TableHead>
              <TableHead className="hidden sm:table-cell w-1/3">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="text-[#F1F1F1] w-full">
            {assets.map((asset, index) => (
              <TableRow
                key={index}
                className="w-full flex flex-col sm:table-row">
                <TableCell className="w-full sm:w-1/3">
                  <div className="flex items-center space-x-4">
                    <div className="flex flex-col">
                      <p className="font-[400] text-base">
                        {tokenData[asset.token]}
                      </p>
                      <span className="font-[400] text-xs">{asset.name}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="w-full sm:w-1/3">
                  <div className="flex flex-col">
                    <p>{asset.balance}</p>
                    <span className="text-xs">{asset.value}</span>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell w-1/3">
                  <div className="flex items-center">
                    <span className="mr-2">
                      {asset.autosaved ? "Yes" : "No"}
                    </span>
                    {asset.autosaved ? (
                      <MemoCheckIcon className="text-green-500 w-5 h-5" />
                    ) : (
                      <MemoXmarkIcon className="text-red-500 w-5 h-5" />
                    )}
                  </div>
                </TableCell>
                <TableCell className="flex justify-start space-x-6 sm:justify-end w-full sm:w-2/3">
                  <Button
                    variant="link"
                    className="text-[#79E7BA]"
                    onClick={() => setIsDepositModalOpen(true)}>
                    Deposit
                  </Button>
                  <Button
                    variant="link"
                    className="text-[#79E7BA]"
                    onClick={() => setIsFirstModalOpen(true)}>
                    Save
                  </Button>
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
