import { useSetRecoilState } from "recoil";
import {
  availableBalanceState,
  savingsBalanceState,
  totalBalanceState,
  supportedTokensState,
  balancesState,
  loadingState,
} from "../store/atoms/balance";
import { facetAbis } from "@/lib/contract";
import { useEffect, useMemo } from "react";
import { getValidNumberValue } from "@/lib/utils";
import { convertTokenAmountToUsd } from "@/lib/utils";
import { getContract, readContract } from "thirdweb";
import { client } from "@/lib/config";
import { Abi } from "viem";
import { useChainConfig } from "@/hooks/useChainConfig";
import { useQuery } from "@tanstack/react-query";

export const useBalances = (address: string) => {
  const setAvailableBalance = useSetRecoilState(availableBalanceState);
  const setSavingsBalance = useSetRecoilState(savingsBalanceState);
  const setTotalBalance = useSetRecoilState(totalBalanceState);
  const setSupportedTokens = useSetRecoilState(supportedTokensState);
  const setBalances = useSetRecoilState(balancesState);
  const setLoading = useSetRecoilState(loadingState);

  const { chain, diamondAddress } = useChainConfig();

  const contract = useMemo(
    () =>
      getContract({
        client,
        address: diamondAddress,
        chain: chain,
        abi: facetAbis.fundingFacet as unknown as Abi,
      }),
    [diamondAddress, chain],
  );

  const { data: supportedTokens = [] } = useQuery({
    queryKey: ["supportedTokens", chain.id, diamondAddress],
    queryFn: async () => {
      try {
        const tokens = (await readContract({
          contract,
          method:
            "function getAcceptedTokenAddresses() external view returns (address[] memory)",
          params: [],
        })) as string[];

        if (tokens && tokens.length > 0) {
          const uniqueTokens = Array.from(
            new Set(tokens.map((t) => t.toLowerCase())),
          );
          console.log("Supported tokens:", uniqueTokens);
          return uniqueTokens;
        }
        return [];
      } catch (err) {
        console.error("Error fetching supported tokens:", err);
        return [];
      }
    },
    enabled: !!address && !!chain.id && !!diamondAddress,
  });

  // Stable string key derived from supported tokens to prevent queryKey instability
  const tokenKey = useMemo(() => supportedTokens.join(","), [supportedTokens]);

  useEffect(() => {
    if (supportedTokens.length > 0) {
      setSupportedTokens(supportedTokens);
    }
  }, [supportedTokens, setSupportedTokens]);

  const { data: balancesData, isLoading: isBalancesLoading } = useQuery({
    queryKey: ["balances", address, chain.id, tokenKey],
    queryFn: async () => {
      if (!address || supportedTokens.length === 0) return null;

      const balanceCalls = supportedTokens.flatMap((token) => [
        {
          type: "total",
          contractCall: {
            contract,
            method:
              "function getUserTotalBalance(address user, address token) external view returns (uint256)",
            params: [address, token],
          },
        },
        {
          type: "available",
          contractCall: {
            contract,
            method:
              "function getUserAvailableBalance(address user, address token) external view returns (uint256)",
            params: [address, token],
          },
        },
        {
          type: "savings",
          contractCall: {
            contract,
            method:
              "function getUserSavedBalance(address user, address token) external view returns (uint256)",
            params: [address, token],
          },
        },
      ]);

      const results = await Promise.all(
        balanceCalls.map(({ contractCall }) => readContract(contractCall)),
      );

      const balancesMap = {
        total: [] as bigint[],
        available: [] as bigint[],
        savings: [] as bigint[],
      };

      results.forEach((result, index) => {
        const tokenIndex = Math.floor(index / 3);
        const type = balanceCalls[index].type as keyof typeof balancesMap;
        balancesMap[type][tokenIndex] =
          typeof result === "bigint" ? result : BigInt(0);
      });

      const updatedTokenBalanceMap = supportedTokens.reduce(
        (acc, token, index) => {
          const normalizedToken = token.toLowerCase();
          acc.available[normalizedToken] = balancesMap.available[index];
          acc.total[normalizedToken] = balancesMap.total[index];
          acc.savings[normalizedToken] = balancesMap.savings[index];
          return acc;
        },
        {
          available: {} as Record<string, unknown>,
          total: {} as Record<string, unknown>,
          savings: {} as Record<string, unknown>,
        },
      );

      const usdPromises = supportedTokens.map(async (token, i) => {
        const totalUsdVal = convertTokenAmountToUsd(
          token,
          balancesMap.total[i] || 0n,
        );
        const availableUsdVal = convertTokenAmountToUsd(
          token,
          BigInt(balancesMap.available[i] || 0n),
        );
        const savedUsdVal = convertTokenAmountToUsd(
          token,
          BigInt(balancesMap.savings[i] || 0n),
        );

        return Promise.all([totalUsdVal, availableUsdVal, savedUsdVal]);
      });

      const usdResults = await Promise.all(usdPromises);

      let totalUsd = 0;
      let availableUsd = 0;
      let savedUsd = 0;

      usdResults.forEach(([totalUsdVal, availableUsdVal, savedUsdVal], i) => {
        console.log(`Balance Debug - Token: ${supportedTokens[i]}`);
        console.log(
          `  Raw: Total=${balancesMap.total[i]}, Avail=${balancesMap.available[i]}, Saved=${balancesMap.savings[i]}`,
        );
        console.log(
          `  USD: Total=${totalUsdVal}, Avail=${availableUsdVal}, Saved=${savedUsdVal}`,
        );

        totalUsd += getValidNumberValue(totalUsdVal);
        availableUsd += getValidNumberValue(availableUsdVal);
        savedUsd += getValidNumberValue(savedUsdVal);
      });

      return {
        tokenBalances: updatedTokenBalanceMap,
        usd: {
          total: Number(totalUsd.toFixed(6)),
          available: Number(availableUsd.toFixed(6)),
          savings: Number(savedUsd.toFixed(6)),
        },
      };
    },
    enabled: !!address && supportedTokens.length > 0,
    staleTime: 1000 * 30, // 30 seconds stale time
  });

  useEffect(() => {
    if (balancesData) {
      setBalances(balancesData.tokenBalances);
      setTotalBalance(balancesData.usd.total);
      setAvailableBalance(balancesData.usd.available);
      setSavingsBalance(balancesData.usd.savings);
    }
  }, [
    balancesData,
    setBalances,
    setTotalBalance,
    setAvailableBalance,
    setSavingsBalance,
  ]);

  useEffect(() => {
    setLoading({
      available: isBalancesLoading,
      total: isBalancesLoading,
      savings: isBalancesLoading,
    });
  }, [isBalancesLoading, setLoading]);

  return balancesData;
};
