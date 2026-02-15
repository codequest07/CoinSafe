import { useRecoilState, useSetRecoilState } from "recoil";
import {
  availableBalanceState,
  savingsBalanceState,
  totalBalanceState,
  supportedTokensState,
  balancesState,
  loadingState,
} from "../store/atoms/balance";
import { CoinsafeDiamondContract, facetAbis } from "@/lib/contract";
import { useEffect, useMemo } from "react";
import { getTokenDecimals } from "@/lib/utils";
import { getContract, readContract } from "thirdweb";
import { liskMainnet } from "@/lib/config";
import { publicClient } from "@/lib/client";
import { Abi, formatUnits } from "viem";
import { useTokenPrices } from "@/lib/price-service";
import { client } from "@/lib/config";

export const useBalances = (address: string) => {
  const setAvailableBalance = useSetRecoilState(availableBalanceState);
  const setSavingsBalance = useSetRecoilState(savingsBalanceState);
  const setTotalBalance = useSetRecoilState(totalBalanceState);
  const [supportedTokens, setSupportedTokens] =
    useRecoilState(supportedTokensState);
  const [balances, setBalances] = useRecoilState(balancesState);
  const setLoading = useSetRecoilState(loadingState);

  // 1. Fetch prices for supported tokens
  const priceQueries = useTokenPrices(supportedTokens);

  const tokenPriceMap = useMemo(() => {
    const map: Record<string, number> = {};
    supportedTokens.forEach((token, index) => {
      const query = priceQueries[index];
      if (query.data !== undefined) {
        map[token] = query.data;
      }
    });
    return map;
  }, [supportedTokens, priceQueries]);

  // 2. Fetch supported tokens
  useEffect(() => {
    if (!address) return;

    async function fetchSupportedTokens() {
      try {
        const fundingFacetContract = getContract({
          client,
          address: CoinsafeDiamondContract.address,
          chain: liskMainnet,
          abi: facetAbis.fundingFacet as unknown as Abi,
        });

        const tokens = (await readContract({
          contract: fundingFacetContract,
          method:
            "function getAcceptedTokenAddresses() external view returns (address[] memory)",
          params: [],
        })) as string[];

        // Only set tokens if we actually got some from the contract
        if (tokens && tokens.length > 0) {
          setSupportedTokens(tokens);
        }
      } catch (err) {
        console.error("Error fetching supported tokens:", err);
      }
    }

    fetchSupportedTokens();
  }, [address, setSupportedTokens]);

  // 3. Fetch Balances (Contract Calls only)
  useEffect(() => {
    if (!address || supportedTokens.length === 0) return;

    async function fetchBalances() {
      try {
        setLoading({
          available: true,
          total: true,
          savings: true,
        });

        const contractAddress =
          CoinsafeDiamondContract.address as `0x${string}`;
        const abi = [
          {
            inputs: [
              { internalType: "address", name: "user", type: "address" },
              { internalType: "address", name: "token", type: "address" },
            ],
            name: "getUserTotalBalance",
            outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
            stateMutability: "view",
            type: "function",
          },
          {
            inputs: [
              { internalType: "address", name: "user", type: "address" },
              { internalType: "address", name: "token", type: "address" },
            ],
            name: "getUserAvailableBalance",
            outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
            stateMutability: "view",
            type: "function",
          },
          {
            inputs: [
              { internalType: "address", name: "user", type: "address" },
              { internalType: "address", name: "token", type: "address" },
            ],
            name: "getUserSavedBalance",
            outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
            stateMutability: "view",
            type: "function",
          },
        ] as const;

        const calls = supportedTokens.flatMap((token) => [
          {
            address: contractAddress,
            abi,
            functionName: "getUserTotalBalance",
            args: [address, token],
          },
          {
            address: contractAddress,
            abi,
            functionName: "getUserAvailableBalance",
            args: [address, token],
          },
          {
            address: contractAddress,
            abi,
            functionName: "getUserSavedBalance",
            args: [address, token],
          },
        ]);

        const results = await publicClient.multicall({
          contracts: calls,
          allowFailure: false, // Or true if we want to handle partial failures
        });

        const balancesMap = {
          total: [] as bigint[],
          available: [] as bigint[],
          savings: [] as bigint[],
        };

        // Results array order matches calls order: [total, available, savings, total, available, savings, ...]
        results.forEach((result: any, index: any) => {
          const tokenIndex = Math.floor(index / 3);
          const remainder = index % 3;
          // 0 -> total, 1 -> available, 2 -> savings

          const value = typeof result === "bigint" ? result : BigInt(0);

          if (remainder === 0) balancesMap.total[tokenIndex] = value;
          else if (remainder === 1) balancesMap.available[tokenIndex] = value;
          else if (remainder === 2) balancesMap.savings[tokenIndex] = value;
        });

        const updatedTokenBalanceMap = supportedTokens.reduce(
          (acc, token, index) => {
            acc.available[token] = balancesMap.available[index];
            acc.total[token] = balancesMap.total[index];
            acc.savings[token] = balancesMap.savings[index];
            return acc;
          },
          {
            available: {} as Record<string, unknown>,
            total: {} as Record<string, unknown>,
            savings: {} as Record<string, unknown>,
          },
        );

        setBalances(updatedTokenBalanceMap);
      } catch (err) {
        console.error("Error fetching balances:", err);
      } finally {
        setLoading({
          available: false,
          total: false,
          savings: false,
        });
      }
    }

    fetchBalances();
  }, [address, supportedTokens, setBalances, setLoading]);

  // 4. Calculate USD Values using Price Map and Balances
  useEffect(() => {
    if (supportedTokens.length === 0) return;

    let totalUsd = 0;
    let availableUsd = 0;
    let savedUsd = 0;

    supportedTokens.forEach((token) => {
      const price = tokenPriceMap[token] || 0;
      const decimals = getTokenDecimals(token);

      const totalBal =
        (balances.total as Record<string, bigint>)?.[token] || 0n;
      const availableBal =
        (balances.available as Record<string, bigint>)?.[token] || 0n;
      const savedBal =
        (balances.savings as Record<string, bigint>)?.[token] || 0n;

      // Helper to convert bigint balance -> number amount -> usd value
      const getUsd = (bal: bigint) => {
        const amount = Number(formatUnits(bal, decimals));
        return amount * price;
      };

      totalUsd += getUsd(totalBal);
      availableUsd += getUsd(availableBal);
      savedUsd += getUsd(savedBal);
    });

    setTotalBalance(Number(totalUsd.toFixed(2)));
    setAvailableBalance(Number(availableUsd.toFixed(2)));
    setSavingsBalance(Number(savedUsd.toFixed(2)));
  }, [
    balances,
    tokenPriceMap,
    supportedTokens,
    setTotalBalance,
    setAvailableBalance,
    setSavingsBalance,
  ]);
};
