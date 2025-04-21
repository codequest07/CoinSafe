import { useRecoilState } from "recoil";
import {
  availableBalanceState,
  savingsBalanceState,
  totalBalanceState,
} from "../store/atoms/save";
import { CoinsafeDiamondContract, facetAbis } from "@/lib/contract";
import { useEffect, useState } from "react";
import { getValidNumberValue } from "@/lib/utils";
import { convertTokenAmountToUsd } from "@/lib/utils";
import { getContract, readContract } from "thirdweb";
import { liskSepolia } from "@/lib/config";
import { client } from "@/lib/config";
import { Abi } from "viem";

export const useBalances = (address: string) => {
  const [availableBalance, setAvailableBalance] = useRecoilState(
    availableBalanceState
  );
  const [savingsBalance, setSavingsBalance] =
    useRecoilState(savingsBalanceState);
  const [totalBalance, setTotalBalance] = useRecoilState(totalBalanceState);
  const [supportedTokens, setSupportedTokens] = useState<string[]>([]);
  const [loading, setIsLoading] = useState({
    available: false,
    total: false,
    savings: false,
  });
  const [balances, setBalances] = useState<{
    available: unknown[];
    total: unknown[];
    savings: unknown[];
  }>({
    available: [],
    total: [],
    savings: [],
  });

  const contract = getContract({
    client,
    address: CoinsafeDiamondContract.address,
    chain: liskSepolia,
    abi: facetAbis.fundingFacet as unknown as Abi,
  });

  useEffect(() => {
    if (!address) return;

    async function fetchSupportedTokens() {
      try {
        const fundingFacetContract = getContract({
          client,
          address: CoinsafeDiamondContract.address,
          chain: liskSepolia,
          abi: facetAbis.fundingFacet as unknown as Abi,
        });
        const tokens = (await readContract({
          contract: fundingFacetContract,
          method:
            "function getAcceptedTokenAddresses() external view returns (address[] memory)",
          params: [],
        })) as string[];

        setSupportedTokens(tokens);
      } catch (err) {
        console.error("Error fetching supported tokens:", err);
      }
    }

    fetchSupportedTokens();
  }, [address]);

  useEffect(() => {
    if (!address || supportedTokens.length === 0) return;

    async function fetchBalances() {
      try {
        setIsLoading((prev) => ({
          ...prev,
          available: true,
          total: true,
          savings: true,
        }));

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
          balanceCalls.map(({ contractCall }) => readContract(contractCall))
        );

        const balancesMap = {
          total: [] as bigint[],
          available: [] as bigint[],
          savings: [] as bigint[],
        };

        results.forEach((result, index) => {
          const tokenIndex = Math.floor(index / 3);
          const type = balanceCalls[index].type as keyof typeof balancesMap;
          // console.log(result);
          balancesMap[type][tokenIndex] =
            typeof result === "bigint" ? result : BigInt(0);
        });

        setBalances(balancesMap);

        const usdPromises = supportedTokens.map(async (token, i) => {
          const totalUsdVal = convertTokenAmountToUsd(
            token,
            balancesMap.total[i] || 0n
          );
          const availableUsdVal = convertTokenAmountToUsd(
            token,
            BigInt(balancesMap.available[i] || 0n)
          );
          const savedUsdVal = convertTokenAmountToUsd(
            token,
            BigInt(balancesMap.savings[i] || 0n)
          );

          return Promise.all([totalUsdVal, availableUsdVal, savedUsdVal]);
        });

        const usdResults = await Promise.all(usdPromises);

        let totalUsd = 0;
        let availableUsd = 0;
        let savedUsd = 0;

        usdResults.forEach(([totalUsdVal, availableUsdVal, savedUsdVal]) => {
          totalUsd += getValidNumberValue(totalUsdVal);
          availableUsd += getValidNumberValue(availableUsdVal);
          savedUsd += getValidNumberValue(savedUsdVal);
        });

        setTotalBalance(Number(totalUsd.toFixed(2)));
        setAvailableBalance(Number(availableUsd.toFixed(2)));
        setSavingsBalance(Number(savedUsd.toFixed(2)));
      } catch (err) {
        console.error("Error fetching balances:", err);
      } finally {
        setIsLoading((prev) => ({
          ...prev,
          available: false,
          total: false,
          savings: false,
        }));
      }
    }

    fetchBalances();
  }, [address, supportedTokens]);

  // -------------------------------
  // 🧠 Derived mapped balances
  // -------------------------------
  const [tokenBalanceMap, setTokenBalanceMap] = useState<{
    available: Record<string, unknown>;
    total: Record<string, unknown>;
    savings: Record<string, unknown>;
  }>({
    available: {},
    total: {},
    savings: {},
  });

  useEffect(() => {
    const updatedTokenBalanceMap = supportedTokens.reduce(
      (acc, token, index) => {
        acc.available[token] = balances.available[index];
        acc.total[token] = balances.total[index];
        acc.savings[token] = balances.savings[index];
        return acc;
      },
      {
        available: {} as Record<string, unknown>,
        total: {} as Record<string, unknown>,
        savings: {} as Record<string, unknown>,
      }
    );

    setTokenBalanceMap(updatedTokenBalanceMap);
  }, [balances, supportedTokens]);

  return {
    availableBalance,
    savingsBalance,
    totalBalance,
    AvailableBalance: tokenBalanceMap.available,
    TotalBalance: tokenBalanceMap.total,
    SavedBalance: tokenBalanceMap.savings,
    loading,
    supportedTokens,
  };
};
