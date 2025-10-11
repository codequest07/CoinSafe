import { useState, useEffect, useMemo } from "react";
import { createPublicClient, http, formatUnits } from "viem";
import { type PublicClient, type Address } from "viem/";
import { parseAbi } from "viem/utils";
import { lisk } from "viem/chains";
import { getChainAddresses, Vault } from "@morpho-org/blue-sdk";
import "@morpho-org/blue-sdk-viem/lib/augment";
import axios, { AxiosError } from "axios";


// ABIs (unchanged from prior)
const METAMORPHO_ABI = parseAbi([
  "function withdrawQueue(uint256) external view returns (bytes32)",
  "function withdrawQueueLength() external view returns (uint256)",
]);

const MORPHO_BLUE_ABI = parseAbi([
  "function market(bytes32 id) external view returns (uint128 totalSupplyAssets, uint128 totalSupplyShares, uint128 totalBorrowAssets, uint128 totalBorrowShares, uint128 lastUpdate, uint128 fee)",
  "function idToMarketParams(bytes32 id) external view returns (address loanToken, address collateralToken, address oracle, address irm, uint256 lltv)",
  "function position(bytes32 id, address user) external view returns (uint256 supplyShares, uint128 borrowShares, uint128 collateral)",
]);

const IRM_ABI = parseAbi([
  "function borrowRateView((address loanToken, address collateralToken, address oracle, address irm, uint256 lltv) marketParams, (uint128 totalSupplyAssets, uint128 totalSupplyShares, uint128 totalBorrowAssets, uint128 totalBorrowShares, uint128 lastUpdate, uint128 fee) market) external view returns (uint256)",
]);

type MarketParams = {
  loanToken: Address;
  collateralToken: Address;
  oracle: Address;
  irm: Address;
  lltv: bigint;
};

type MarketState = {
  totalSupplyAssets: bigint;
  totalSupplyShares: bigint;
  totalBorrowAssets: bigint;
  totalBorrowShares: bigint;
  lastUpdate: bigint;
  fee: bigint;
};

const WAD = 10n ** 18n;
const SECONDS_PER_YEAR = 31536000n;
const VIRTUAL_ASSETS = 1n;
const VIRTUAL_SHARES = 10n ** 6n;

const wMulDown = (x: bigint, y: bigint): bigint => (x * y) / WAD;
const wDivUp = (x: bigint, y: bigint): bigint => (x * WAD + y - 1n) / y;

const wTaylorCompounded = (x: bigint, n: bigint): bigint => {
  const firstTerm = x * n;
  const secondTerm = (firstTerm * firstTerm) / (2n * WAD);
  const thirdTerm = (secondTerm * firstTerm) / (3n * WAD);
  return firstTerm + secondTerm + thirdTerm;
};

const toAssetsDown = (
  shares: bigint,
  totalAssets: bigint,
  totalShares: bigint
): bigint => {
  if (totalShares === 0n) return shares;
  return (
    (shares * (totalAssets + VIRTUAL_ASSETS)) / (totalShares + VIRTUAL_SHARES)
  );
};

function accrueInterests(
  marketState: MarketState,
  borrowRate: bigint,
  blockTimestamp: bigint
): MarketState {
  const elapsed = blockTimestamp - marketState.lastUpdate;
  if (elapsed === 0n || marketState.totalBorrowAssets === 0n)
    return marketState;
  const interest = wMulDown(
    marketState.totalBorrowAssets,
    wTaylorCompounded(borrowRate, elapsed)
  );
  return {
    ...marketState,
    totalSupplyAssets: marketState.totalSupplyAssets + interest,
    totalBorrowAssets: marketState.totalBorrowAssets + interest,
  };
}

// async function getMarketStateAndApy(
//   client: PublicClient,
//   marketId: `0x${string}`,
//   blockTimestamp: bigint,
//   morphoBlueAddress: Address
// ): Promise<{ state: MarketState; apy: bigint }> {
//   const [marketStateResult, marketParamsResult] = await client.multicall({
//     contracts: [
//       { address: morphoBlueAddress, abi: MORPHO_BLUE_ABI, functionName: 'market', args: [marketId] },
//       { address: morphoBlueAddress, abi: MORPHO_BLUE_ABI, functionName: 'idToMarketParams', args: [marketId] },
//     ],
//     allowFailure: false,
//   });

//   const staleMarketState: MarketState = {
//     totalSupplyAssets: marketStateResult[0],
//     totalSupplyShares: marketStateResult[1],
//     totalBorrowAssets: marketStateResult[2],
//     totalBorrowShares: marketStateResult[3],
//     lastUpdate: marketStateResult[4],
//     fee: marketStateResult[5],
//   };

//   const params: MarketParams = {
//     loanToken: marketParamsResult[0],
//     collateralToken: marketParamsResult[1],
//     oracle: marketParamsResult[2],
//     irm: marketParamsResult[3],
//     lltv: marketParamsResult[4],
//   };

//   if (params.irm === '0x0000000000000000000000000000000000000000') {
//     return { state: staleMarketState, apy: 0n };
//   }

//   const borrowRate = await client.readContract({
//     address: params.irm,
//     abi: IRM_ABI,
//     functionName: 'borrowRateView',
//     args: [params, staleMarketState],
//   }) as bigint;

//   const state = accrueInterests(staleMarketState, borrowRate, blockTimestamp);
//   const borrowApy = wTaylorCompounded(borrowRate, SECONDS_PER_YEAR);
//   const utilization = state.totalSupplyAssets > 0n ? wDivUp(state.totalBorrowAssets, state.totalSupplyAssets) : 0n;
//   const apy = wMulDown(wMulDown(borrowApy, utilization), WAD - state.fee);

//   return { state, apy };
// }

// async function calculateVaultApy(
//   client: PublicClient,
//   vaultAddress[tokenAddress]: Address,
//   morphoBlueAddress: Address
// ): Promise<bigint> {
//   const queueLength = await client.readContract({
//     address: vaultAddress[tokenAddress],
//     abi: METAMORPHO_ABI,
//     functionName: 'withdrawQueueLength',
//   }) as bigint;

//   if (queueLength === 0n) return 0n;

//   const calls = Array.from({ length: Number(queueLength) }, (_, i) => ({
//     address: vaultAddress[tokenAddress],
//     abi: METAMORPHO_ABI,
//     functionName: 'withdrawQueue' as const,
//     args: [BigInt(i)],
//   }));

//   const results = await client.multicall({ contracts: calls, allowFailure: false });
//   console.log("RESULTS", results)
//   const withdrawQueue = results.map((result: string) => result as `0x${string}`);

//   const block = await client.getBlock({ blockTag: 'latest' });

//   const marketDataPromises = withdrawQueue.map(async (marketId: any) => {
//     const [{ state, apy }, { 0: supplyShares }] = await Promise.all([
//       getMarketStateAndApy(client, marketId, block.timestamp, morphoBlueAddress),
//       client.readContract({
//         address: morphoBlueAddress,
//         abi: MORPHO_BLUE_ABI,
//         functionName: 'position',
//         args: [marketId, vaultAddress[tokenAddress]],
//       }),
//     ]);
//     const allocation = toAssetsDown(supplyShares as bigint, state.totalSupplyAssets, state.totalSupplyShares);
//     return { supplyApy: apy, allocation };
//   });

//   const marketData = await Promise.all(marketDataPromises);

//   let totalWeightedApy = 0n;
//   let totalAllocation = 0n;

//   // marketData.forEach(({ supplyApy, allocation }:any) => {
//   //   if (allocation > 0n) {
//   //     totalWeightedApy += supplyApy * allocation;
//   //     totalAllocation += allocation;
//   //   }
//   // });

//   marketData.forEach(({ supplyApy, allocation }) => {  // Remove :any to tighten types
//   if (allocation > 0n) {
//     totalWeightedApy = totalWeightedApy + (supplyApy * allocation);
//     totalAllocation = totalAllocation + allocation;
//   }
// });

//   if (totalAllocation === 0n) return 0n;

//   return totalWeightedApy / totalAllocation;
// }

async function calculateVaultApy(
  client: PublicClient,
  vaultAddress: Address,
  morphoBlueAddress: Address
): Promise<bigint> {
  const queueLength = (await client.readContract({
    address: vaultAddress,
    abi: METAMORPHO_ABI,
    functionName: "withdrawQueueLength",
  })) as bigint;

  if (queueLength === 0n) return 0n;

  const queueCalls = Array.from({ length: Number(queueLength) }, (_, i) => ({
    address: vaultAddress,
    abi: METAMORPHO_ABI,
    functionName: "withdrawQueue" as const,
    args: [BigInt(i)],
  }));

  const queueResults = await client.multicall({
    contracts: queueCalls,
    allowFailure: false,
  });
  const withdrawQueue = queueResults.map((result) => result as `0x${string}`); // Removed console.log

  const block = await client.getBlock({ blockTag: "latest" });
  const blockTimestamp = block.timestamp;

  // Batch all market, params, and position calls into one multicall
  const marketCalls: any[] = []; // Type as needed; viem infers
  withdrawQueue.forEach((marketId) => {
    marketCalls.push(
      {
        address: morphoBlueAddress,
        abi: MORPHO_BLUE_ABI,
        functionName: "market",
        args: [marketId],
      },
      {
        address: morphoBlueAddress,
        abi: MORPHO_BLUE_ABI,
        functionName: "idToMarketParams",
        args: [marketId],
      },
      {
        address: morphoBlueAddress,
        abi: MORPHO_BLUE_ABI,
        functionName: "position",
        args: [marketId, vaultAddress],
      }
    );
  });

  const marketResults = await client.multicall({
    contracts: marketCalls,
    allowFailure: false,
  });

  // Parse results: For each market, extract state, params, supplyShares
  const marketData: {
    state: MarketState;
    params: MarketParams;
    supplyShares: bigint;
  }[] = [];
  for (let i = 0; i < withdrawQueue.length; i++) {
    const idx = i * 3;
    const marketResult = marketResults[idx] as [
      bigint,
      bigint,
      bigint,
      bigint,
      bigint,
      bigint
    ]; // Tuple from ABI
    const paramsResult = marketResults[idx + 1] as [
      Address,
      Address,
      Address,
      Address,
      bigint
    ];
    const positionResult = marketResults[idx + 2] as [bigint, bigint, bigint]; // supplyShares, borrowShares, collateral

    const staleMarketState: MarketState = {
      totalSupplyAssets: marketResult[0],
      totalSupplyShares: marketResult[1],
      totalBorrowAssets: marketResult[2],
      totalBorrowShares: marketResult[3],
      lastUpdate: marketResult[4],
      fee: marketResult[5],
    };

    const params: MarketParams = {
      loanToken: paramsResult[0],
      collateralToken: paramsResult[1],
      oracle: paramsResult[2],
      irm: paramsResult[3],
      lltv: paramsResult[4],
    };

    const supplyShares = positionResult[0];

    marketData.push({ state: staleMarketState, params, supplyShares });
  }

  // Batch borrowRateView calls for markets with valid irm
  const borrowCalls: any[] = [];
  marketData.forEach(({ params, state }) => {
    if (params.irm !== "0x0000000000000000000000000000000000000000") {
      borrowCalls.push({
        address: params.irm,
        abi: IRM_ABI,
        functionName: "borrowRateView",
        args: [params, state],
      });
    }
  });

  let borrowRates: bigint[] = [];
  if (borrowCalls.length > 0) {
    const borrowResults = await client.multicall({
      contracts: borrowCalls,
      allowFailure: false,
    });
    borrowRates = borrowResults as bigint[];
  }

  // Now compute per-market data using borrowRates (index matches filtered)
  let borrowRateIdx = 0;
  const processedMarketData = marketData.map(
    ({ state: staleState, params, supplyShares }) => {
      let apy = 0n;
      let state = staleState;

      if (params.irm !== "0x0000000000000000000000000000000000000000") {
        const borrowRate = borrowRates[borrowRateIdx++];
        state = accrueInterests(staleState, borrowRate, blockTimestamp);
        const borrowApy = wTaylorCompounded(borrowRate, SECONDS_PER_YEAR);
        const utilization =
          state.totalSupplyAssets > 0n
            ? wDivUp(state.totalBorrowAssets, state.totalSupplyAssets)
            : 0n;
        apy = wMulDown(wMulDown(borrowApy, utilization), WAD - state.fee);
      }

      const allocation = toAssetsDown(
        supplyShares,
        state.totalSupplyAssets,
        state.totalSupplyShares
      );
      return { supplyApy: apy, allocation };
    }
  );

  let totalWeightedApy = 0n;
  let totalAllocation = 0n;

  processedMarketData.forEach(({ supplyApy, allocation }) => {
    if (allocation > 0n) {
      totalWeightedApy = totalWeightedApy + supplyApy * allocation;
      totalAllocation = totalAllocation + allocation;
    }
  });

  if (totalAllocation === 0n) return 0n;

  return totalWeightedApy / totalAllocation;
}

interface MerklOpportunity {
  identifier: string; // Vault address for matching
  apr: number; // Total APR (native + rewards)
  name: string; // e.g., "Supply to the Re7 USDC vault..."
  tvl: number;
  tokens: Array<{
    name: string;
    symbol: string;
    address: string;
  }>;
}

// NEW: Function to fetch and match Merkl APR for specific vault (efficient: single call, filter by identifier)
async function fetchMerklAprForVault(
  vaultAddress: Address
): Promise<{ totalApr: number | null; opportunity?: MerklOpportunity }> {
  try {
    const params = new URLSearchParams({
      page: "0",
      items: "20",
      name: "lisk",
      chainId: "1135", // Lisk-specific
      // type: 'MORPHOVAULT',
      // status: 'LIVE',
      // action: 'LEND',
      // campaigns: 'true',
      // test: 'false',
      // minimumTvl: '1',
      // maximumTvl: '1',
      // minimumApr: '1',
      // maximumApr: '1',
      // distributionTypes: 'DUTCH_AUCTION', // From sample
      // mainProtocolId: 'morpho',
      // withInvalids: 'false',
      // sort: 'null',
      // order: 'desc',
    });

    // Axios call to Merkl API (add proxy prefix if CORS issues in dev, e.g., 'https://cors-anywhere.herokuapp.com/')
    const response = await axios.get(
      `https://api.merkl.xyz/v4/opportunities/?${params.toString()}`,
      {
        timeout: 5000, // Efficient: short timeout
        headers: { "Content-Type": "application/json" },
      }
    );

    // Filter for matching vault by identifier (address)
    const matchingOpportunity = response.data.find(
      (item: any) =>
        item.identifier.toLowerCase() === vaultAddress.toLowerCase()
    ) as MerklOpportunity | undefined;

    return {
      totalApr: matchingOpportunity?.apr || null,
      opportunity: matchingOpportunity,
    };
  } catch (err) {
    console.warn("Merkl API fetch failed:", (err as AxiosError).message); // Graceful fallback
    return { totalApr: null };
  }
}

export const useVaultApy = (
  tokenAddress: Address,
  morphoBlueAddress: Address
) => {
  // const [apy, setApy] = useState<string>('0.00');
  const [nativeApy, setNativeApy] = useState<string>("0.00"); // RENAMED: Original on-chain native APY
  const [totalApr, setTotalApr] = useState<string | null>(null); // NEW: Total APR from Merkl (native + rewards)
  const [fees, setFees] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const vaultAddress = useMemo(
    () => ({
      "0x05D032ac25d322df992303dCa074EE7392C117b9":
        "0x50cB55BE8cF05480a844642cB979820C847782aE", // usdt0
      "0xF242275d3a6527d877f2c927a82D9b057609cc71":
        "0xD92f564A29992251297980187a6B74FAa3D50699", // usdc
      "0xac485391EB2d7D88253a7F1eF18C37f4242D1A24":
        "0x8258F0c79465c95AFAc325D6aB18797C9DDAcf55", // lsk
    }),
    []
  );
  //   "0x05D032ac25d322df992303dCa074EE7392C117b9": "0x50cB55BE8cF05480a844642cB979820C847782aE", // usdt0
  // "0xF242275d3a6527d877f2c927a82D9b057609cc71": "0xD92f564A29992251297980187a6B74FAa3D50699", // usdc
  // "0xac485391EB2d7D88253a7F1eF18C37f4242D1A24": "0x8258F0c79465c95AFAc325D6aB18797C9DDAcf55", // lsk
  // }

  // useEffect(() => {
  //   if (!vaultAddress[tokenAddress] || vaultAddress[tokenAddress] === '0x...') {
  //     setApy('0.00');
  //     setLoading(false);
  //     return;
  //   }

  //   const fetchApy = async () => {
  //     try {
  //       setLoading(true);
  //       setError(null);

  //       const chainId = 1135;
  //       const config = getChainAddresses(chainId);
  //       if (!config) throw new Error('Lisk unsupported');

  //       const client = createPublicClient({
  //         chain: lisk,
  //         transport: http(),
  //       });

  //       // const morphoBlueAddress = config.morphoBlue as Address;
  //       // const morphoBlueAddress = (config as any).morphoBlue as Address;
  //       const rawApy = await calculateVaultApy(client, vaultAddress[tokenAddress], morphoBlueAddress);
  //       const formattedApy = formatUnits(rawApy, 16);
  //       setApy(formattedApy);
  //     } catch (err) {
  //       setError(err instanceof Error ? err.message : 'Failed to fetch APY');
  //       setApy('N/A');
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchApy();
  // }, [vaultAddress[tokenAddress], morphoBlueAddress]);

  useEffect(() => {
    const vault = vaultAddress[tokenAddress as keyof typeof vaultAddress];
    if (!vault || vault === "0x...") {
      setNativeApy("0.00");
      setTotalApr(null);
      setLoading(false);
      return;
    }

    const fetchApy = async () => {
      try {
        setLoading(true);
        setError(null);

        const chainId = 1135;
        const config = getChainAddresses(chainId);
        if (!config) throw new Error("Lisk unsupported");

        const client = createPublicClient({
          chain: lisk,
          transport: http(), // FIXED: Wrapped URL in options
        });

        // const vault = await Vault.fetch(vaultAddress[tokenAddress] as `0x${string}`, client);
        // console.log("VAULT", vault)

        // NEW: Parallel fetch for Merkl APR (based on vaultAddress[tokenAddress] for token/vault-specific matching)
        const merklPromise = fetchMerklAprForVault(
          vaultAddress[
            tokenAddress as keyof typeof vaultAddress
          ] as `0x${string}`
        );
        const onChainPromise = calculateVaultApy(
          client,
          vault as `0x${string}`,
          morphoBlueAddress
        );

        // Await both in parallel for efficiency
        const [merklData, rawNativeApy] = await Promise.all([
          merklPromise,
          onChainPromise,
        ]);

        console.log("MERKLE DATA", merklData);
        console.log("NATIVE DATA", rawNativeApy);

        // Set native APY (original logic)
        const formattedNativeApy = formatUnits(rawNativeApy, 16);
        setNativeApy(formattedNativeApy);

        // NEW: Set total APR from Merkl if matched (e.g., 12.33% for USDC vault)
        if (merklData.totalApr !== null) {
          setTotalApr(merklData.totalApr.toFixed(2));
        } else {
          setTotalApr(null); // Fallback if no match
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch APY");
        setNativeApy("N/A");
        setTotalApr(null);
      } finally {
        setLoading(false);
      }
    };

    fetchApy();
  }, [tokenAddress, morphoBlueAddress, vaultAddress]);

  useEffect(() => {
    const vault = vaultAddress[tokenAddress as keyof typeof vaultAddress];
    if (!vault || vault === "0x...") {
      setFees(0);
      setLoading(false);
      return;
    }

    const fetchFees = async () => {
      try {
        setLoading(true);
        setError(null);

        const chainId = 1135;
        const config = getChainAddresses(chainId);
        if (!config) throw new Error("Lisk unsupported");

        const client = createPublicClient({
          chain: lisk,
          transport: http(), // FIXED: Wrapped URL in options
        });

        const vault = await Vault.fetch(
          vaultAddress[
            tokenAddress as keyof typeof vaultAddress
          ] as `0x${string}`,
          client
        );
        // console.log("VAULT", vault)

        // Set fees (original logic)
        const formattedFees = formatUnits(vault.fee, 18);
        setFees(Number(formattedFees));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch fees");
        setFees(0);
      } finally {
        setLoading(false);
      }
    };

    fetchFees();
  }, [tokenAddress, vaultAddress, morphoBlueAddress]);

  // return { apy, loading, error };
  // UPDATED: Return both native and total (use totalApr for display if available, else nativeApy)
  return {
    nativeApy,
    totalApr,
    fees,
    loading,
    error
  };
};
