// import { Button } from "@/components/ui/button";
// import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { convertFrequency, getTokenDecimals, tokenData } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { formatUnits } from "viem";
import { getContract, readContract } from "thirdweb";
import { client } from "@/lib/config";
import { useActiveAccount } from "thirdweb/react";
import { useChainConfig } from "@/hooks/useChainConfig";
import { useTokenPrices } from "@/lib/price-service";
import { useMemo } from "react";
// import { useClaimableBalanceAutomatedSafe } from "@/hooks/useClaimableBalanceAutomatedSafe";

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

interface AssetData {
  id: string;
  ticker: string;
  icon: string;
  autosaveDetails: {
    amount: string;
    period: string;
  };
  amount: string;
  yieldOnSavings: {
    amount: string;
    period: string;
  };
  claimableAmount: {
    amount: string;
    value?: string;
  };
  actions: string[];
}

// interface AssetsTableProps {
//   assets: AssetData[];
// }

export interface ITokenDetails {
  amountSaved: bigint;
  amountToSave: bigint;
  frequency: bigint;
  token: string;
  amountSavedInUSD?: bigint | number;
}

export default function AutoSavedAssetTable({
  assets = defaultAssets,
  isLoading = false,
}: any) {
  // State for USD values and errors, keyed by token address
  // const [usdValues, setUsdValues] = useState<{ [key: string]: string }>({});
  // const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const account = useActiveAccount();
  const address = account?.address;
  const { chain, diamondAddress } = useChainConfig();

  const [tokenDetails, setTokenDetails] = useState<ITokenDetails[]>([]);

  // --- Price Fetching Integration ---
  const uniqueTokenAddresses = useMemo(() => {
    if (!assets?.tokenDetails) return [];
    const tokens = new Set<string>();
    assets.tokenDetails.forEach((asset: any) => tokens.add(asset.token));
    return Array.from(tokens);
  }, [assets]);

  const priceQueries = useTokenPrices(uniqueTokenAddresses);

  const priceMap = useMemo(() => {
    const map: Record<string, number> = {};
    uniqueTokenAddresses.forEach((addr, idx) => {
      map[addr] = priceQueries[idx].data || 0;
    });
    return map;
  }, [uniqueTokenAddresses, priceQueries]);

  useEffect(() => {
    const fetchAutosaveStatus = async () => {
      const _tokenDetails = [];
      if (assets?.tokenDetails) {
        for (const asset of assets.tokenDetails) {
          const autosaved = await checkIsTokenAutoSaved(
            address! as `0x${string}`,
            asset.token,
            chain,
            diamondAddress,
          );
          _tokenDetails.push({ ...asset, autosaved });
        }
      }
      setTokenDetails(_tokenDetails);
    };
    if (address) {
      fetchAutosaveStatus();
    }
  }, [assets, address, chain, diamondAddress]); // Re-run if assets change

  return (
    <div className="w-full overflow-x-auto">
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
              IN VAULT
            </TableHead>
            {/* <TableHead className="text-[#CACACA] font-normal text-sm py-4 px-4">
              AUTOSAVED
            </TableHead> */}
            <TableHead className="text-[#CACACA] font-normal text-sm py-4 px-4">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tokenDetails.map((asset: any, index: any) => (
            <TableRow
              key={asset.token}
              className={`border-gray-600 hover:bg-[#1D1D1D73]/20 ${
                index === assets.length - 1 ? "border-b-0" : ""
              }`}
            >
              {/* Ticker */}
              <TableCell className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold rounded-full">
                      <img
                        src={`${tokenData[asset?.token?.toLowerCase()]?.image}`}
                        className="rounded-full"
                      />
                    </span>
                  </div>
                  <div>
                    {/* <div className="text-white font-medium">
                          <img src={`${tokenData[asset?.token?.toLowerCase()].image}`} />
                        </div> */}
                    <div className="text-gray-400 text-sm">
                      {tokenData[asset?.token?.toLowerCase()]?.symbol}
                    </div>
                  </div>
                </div>
              </TableCell>

              {/* Autosave Details */}
              <TableCell className="px-6 py-4">
                <div className="text-white">
                  {isLoading ? (
                    <Loader2 />
                  ) : (
                    `${
                      formatUnits(
                        asset.amountToSave,
                        getTokenDecimals(asset.token),
                      ) +
                      " " +
                      tokenData[asset?.token?.toLowerCase()]?.symbol
                    }`
                  )}
                </div>
                <div className="text-gray-400 text-sm">
                  {convertFrequency(Number(asset.frequency))}
                </div>
              </TableCell>

              {/* Amount */}
              <TableCell className="px-6 py-4">
                <div className="flex flex-col">
                  <p className="text-white">
                    {formatUnits(
                      asset.amountSaved,
                      getTokenDecimals(asset.token),
                    )}{" "}
                    {tokenData[asset?.token?.toLowerCase()]?.symbol}
                  </p>
                  <p className="text-xs text-gray-400">
                    ≈ $
                    {(() => {
                      const price = priceMap[asset.token] || 0;
                      const decimals = getTokenDecimals(asset.token);
                      const val =
                        Number(formatUnits(asset.amountSaved, decimals)) *
                        price;
                      return val.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      });
                    })()}
                  </p>
                </div>
                <div className="text-white">
                  {/* {`$${asset.amountSaved}`} */}
                  {/* {formatUnits(asset.amountSaved, getTokenDecimals(asset.token)) +
                        " " +
                        tokenData[asset?.token?.toLowerCase()].symbol} */}
                  {/* {`${await getTokenPrice(
                        asset.token,
                        Number(asset.amountSaved)
                      )}`} */}
                </div>
                {/* <div className="text-gray-400 text-sm">
                      {asset.amount.split(" ").slice(1).join(" ")}
                    </div> */}
              </TableCell>

              {/* Autosaved 
              <TableCell className="px-6 py-4">
                {/* {asset.claimableAmount.amount === "-" ? (
                      <div className="text-white">-</div>
                    ) : (
                      <>
                        <div className="text-white">
                          {asset.claimableAmount.amount}
                        </div>
                        {asset.claimableAmount.value && (
                          <div className="text-gray-400 text-sm">
                            {asset.claimableAmount.value}
                          </div>
                        )}
                      </>
                    )}
                <div className="flex items-center gap-1">
                  <span className="text-[#48FF91]">Yes</span>
                      <div className="w-4 h-4 rounded-full bg-[#48FF91] flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
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
              </TableCell> */}

              {/* Actions */}
              {/* <TableCell className="px-6 py-4">
                    <div className="flex gap-2 justify-end">
                      {asset.actions.map((action, actionIndex) => (
                        <Button
                          key={actionIndex}
                          variant="ghost"
                          size="sm"
                          className="text-green-400 hover:text-green-300 hover:bg-gray-600 px-2 py-1 h-auto text-xs"
                        >
                          {action}
                        </Button>
                      ))}
                    </div>
                  </TableCell> */}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// Default data for demonstration
const defaultAssets: AssetData[] = [
  {
    id: "1",
    ticker: "AVAX",
    icon: "A",
    autosaveDetails: {
      amount: "0.00234 AVAX",
      period: "per week",
    },
    amount: "0.00234 AVAX ≈ $5.00",
    yieldOnSavings: {
      amount: "+0.00234 AVAX",
      period: "5 day yield",
    },
    claimableAmount: {
      amount: "0.00234 AVAX",
      value: "≈ $5.00",
    },
    actions: ["Claim", "Cancel autosave", "Withdraw"],
  },
  {
    id: "2",
    ticker: "XRP",
    icon: "X",
    autosaveDetails: {
      amount: "0.00234 AVAX",
      period: "per month",
    },
    amount: "0.00234 XRP ≈ $5.00",
    yieldOnSavings: {
      amount: "+0.00234 AVAX",
      period: "5 day yield",
    },
    claimableAmount: {
      amount: "-",
    },
    actions: ["Cancel autosave", "Withdraw"],
  },
  {
    id: "3",
    ticker: "AVAX",
    icon: "A",
    autosaveDetails: {
      amount: "0.00234 AVAX",
      period: "per day",
    },
    amount: "0.00234 AVAX ≈ $5.00",
    yieldOnSavings: {
      amount: "+0.00234 AVAX",
      period: "5 day yield",
    },
    claimableAmount: {
      amount: "-",
    },
    actions: ["Cancel autosave", "Withdraw"],
  },
];
