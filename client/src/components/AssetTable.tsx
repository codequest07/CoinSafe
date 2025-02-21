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
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAccount } from "wagmi";
import { formatEther } from "viem";
import { CoinSafeContract } from "@/lib/contract";
import { useEffect, useMemo, useState } from "react";
import SavingOption from "./Modals/SavingOption";
// import { transformAndAccumulateTokenBalances } from "@/lib/utils";
import Deposit from "./Modals/Deposit";
import MemoMoney from "@/icons/Money";
import ThirdwebConnectButton from "./ThirdwebConnectButton";
import { readContract } from "@wagmi/core";
import { config } from "@/lib/config";
import { useBalances } from "@/hooks/useBalances";

async function checkIsTokenAutoSaved(
  userAddress: `0x${string}`,
  tokenAddress: string
) {
  const result = await readContract(config, {
    abi: CoinSafeContract.abi.abi,
    address: CoinSafeContract.address as `0x${string}`,
    functionName: "isTokenAutoSaved",
    args: [userAddress, tokenAddress],
  });
  return result;
}

export default function AssetTable() {
  const [allAssetData, setAllAssetData] = useState([]);
  // const [liquidAssetData, setLiquidAssetData] = useState([]);
  // const [savedAssetData, setSavedAssetData] = useState<any[]>([]);

  // const liquidAssets = allAssets.filter((asset) => asset.liquid);
  // const stakedAssets = allAssets.filter((asset) => asset.staked);
  // const savedAssets = allAssets.filter((asset) => asset.saved);
  const { address } = useAccount();

  const {
    AvailableBalance: LiquidTokenBalances,
    TotalBalance: AllTokenBalances,
    SavingsBalances: SavedTokenBalances,
  } = useBalances(address as string);

  const allAssets: any = useMemo(
    () => AllTokenBalances?.data || [],
    [AllTokenBalances?.data]
  );
  const liquidAssets: any = useMemo(
    () => LiquidTokenBalances?.data || [],
    [LiquidTokenBalances?.data]
  );
  const savedAssets: any = useMemo(
    () => SavedTokenBalances?.data || [],
    [SavedTokenBalances?.data]
  );

  useEffect(() => {
    if (allAssets.length === 0) return;
    // Map through the 2D array to create objects
    const allAssetsRes = allAssets[0]?.map(
      (key: any, index: string | number) => {
        return {
          token: key,
          balance: formatEther(allAssets[1][index]),
        };
      }
    );
    setAllAssetData(allAssetsRes);

    // if (liquidAssets.length === 0) return;
    // Map through the 2D array to create objects
    // const liquidAssetsRes = liquidAssets[0]
    //   ?.map((key: any, index: string | number) => {
    //     if (Number(liquidAssets[1][index]) <= 0) return;
    //     return {
    //       token: key,
    //       balance: formatEther(liquidAssets[1][index]),
    //     };
    //   })
    //   .filter((entry: any) => entry !== undefined);
    // setLiquidAssetData(liquidAssetsRes);

    // if (savedAssets.length === 0) return;
    // // Map through the 2D array to create objects
    // const savedAssetsRes = transformAndAccumulateTokenBalances(savedAssets);

    // setSavedAssetData(savedAssetsRes);
  }, [allAssets, liquidAssets, savedAssets]);

  return (
    <div className="bg-[#010104] border border-[#13131373] overflow-hidden p-4 rounded-[2rem] text-white w-full">
      <div className="sm:mx-auto">
        <h1 className="text-xl font-semibold mb-4">Assets</h1>
        {/* <Tabs defaultValue="all-assets" className="w-full">
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
              value="saved-assets"
              className="text-white px-4 py-2 rounded-full">
              Saved assets
            </TabsTrigger>
          </TabsList> */}
        {/* <TabsContent value="all-assets"> */}
        <AssetTableContent assets={allAssetData} />
        {/* </TabsContent> */}
        {/* <TabsContent value="liquid-assets"> */}
        {/* <AssetTableContent assets={liquidAssetData} /> */}
        {/* </TabsContent> */}
        {/* <TabsContent value="saved-assets"> */}
        {/* <AssetTableContent assets={savedAssetData} /> */}
        {/* </TabsContent> */}
        {/* </Tabs> */}
      </div>
    </div>
  );
}

function AssetTableContent({ assets }: { assets: any[] }) {
  const [isFirstModalOpen, setIsFirstModalOpen] = useState(false);
  const [isSecondModalOpen, setIsSecondModalOpen] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const { isConnected, address } = useAccount();
  const [updatedAssets, setUpdatedAssets] = useState<any>([]);

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

  useEffect(() => {
    async function updateAssets(assets: any[]) {
      try {
        const transformedAssets: any[] = await Promise.all(
          assets.map(async (asset: any) => ({
            token: asset.token,
            balance: asset.balance,
            autosaved: await checkIsTokenAutoSaved(
              address! as `0x${string}`,
              asset.token
            ),
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
          <div className="mb-6 rounded-full p-6">
            <MemoMoney className="w-16 h-16" />
          </div>
          <h3 className="mb-2 text-sm font-[400] text-white">
            {isConnected
              ? "Too much empty space? fill it up with deposits!"
              : "No wallet connected, connect your wallet to get the best of coinsafe"}
          </h3>
          {isConnected ? (
            <Button
              onClick={openDepositModal}
              className="mt-4 bg-[#1E1E1E99] rounded-[2rem] text-[#F1F1F1] hover:bg-[#2a2a2a]"
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
            {updatedAssets.map((asset: any, index: number) => (
              <TableRow
                key={index}
                className="w-full flex flex-col sm:table-row"
              >
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
                    onClick={() => setIsDepositModalOpen(true)}
                  >
                    Deposit
                  </Button>
                  <Button
                    variant="link"
                    className="text-[#79E7BA]"
                    onClick={() => setIsFirstModalOpen(true)}
                  >
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
      <Deposit
        isDepositModalOpen={isDepositModalOpen}
        setIsDepositModalOpen={setIsDepositModalOpen}
        onBack={() => {}}
      />
    </div>
  );
}
