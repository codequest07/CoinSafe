import { useSetRecoilState } from "recoil";
import {
  availableBalanceState,
  savingsBalanceState,
  totalBalanceState,
  supportedTokensState,
  balancesState,
  loadingState,
} from "../store/atoms/balance";
import { CoinsafeDiamondContract, facetAbis } from "@/lib/contract";
import { useEffect } from "react";
import { getValidNumberValue } from "@/lib/utils";
import { convertTokenAmountToUsd } from "@/lib/utils";
import { getContract, readContract } from "thirdweb";
import { liskSepolia } from "@/lib/config";
import { client } from "@/lib/config";
import { Abi } from "viem";

export const useBalances = (address: string) => {
  const setAvailableBalance = useSetRecoilState(availableBalanceState);
  const setSavingsBalance = useSetRecoilState(savingsBalanceState);
  const setTotalBalance = useSetRecoilState(totalBalanceState);
  const setSupportedTokens = useSetRecoilState(supportedTokensState);
  const setBalances = useSetRecoilState(balancesState);
  const setLoading = useSetRecoilState(loadingState);

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
  }, [address, setSupportedTokens]);

  useEffect(() => {
    if (!address) return;

    async function fetchBalances() {
      try {
        setLoading({
          available: true,
          total: true,
          savings: true,
        });

        const supportedTokens = await readContract({
          contract,
          method:
            "function getAcceptedTokenAddresses() external view returns (address[] memory)",
          params: [],
        });

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
          balancesMap[type][tokenIndex] =
            typeof result === "bigint" ? result : BigInt(0);
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
          }
        );

        setBalances(updatedTokenBalanceMap);

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
        setLoading({
          available: false,
          total: false,
          savings: false,
        });
      }
    }

    fetchBalances();
  }, [
    address,
    setBalances,
    setAvailableBalance,
    setSavingsBalance,
    setTotalBalance,
    setLoading,
    contract,
  ]);
};
