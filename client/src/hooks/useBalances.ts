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
      const fundingFacetContract = getContract({
        client,
        address: CoinsafeDiamondContract.address,
        chain: liskSepolia,
        abi: facetAbis.fundingFacet as unknown as Abi,
      });
      const supportedTokens = (await readContract({
        contract: fundingFacetContract,
        method:
          "function getAcceptedTokenAddresses() external view returns (address[] memory)",
        params: [],
      })) as string[];

      setSupportedTokens(supportedTokens);
    }

    fetchSupportedTokens();
  }, [address]);

  useEffect(() => {
    if (!address || !supportedTokens) return;

    async function fetchBalances() {
      try {
        setIsLoading((prev) => ({
          ...prev,
          available: true,
          total: true,
          savings: true,
        }));

        const totalCalls = supportedTokens.map((token) => ({
          contract,
          method:
            "function getUserTotalBalance(address user, address token) external view returns (uint256)",
          params: [address, token],
        }));

        const availableCalls = supportedTokens.map((token) => ({
          contract,
          method:
            "function getUserAvailableBalance(address user, address token) external view returns (uint256)",
          params: [address, token],
        }));

        const savedCalls = supportedTokens.map((token) => ({
          contract,
          method:
            "function getUserSavedBalance(address user, address token) external view returns (uint256)",
          params: [address, token],
        }));

        // Execute all calls concurrently
        const [totalResults, availableResults, savedResults] =
          await Promise.all([
            Promise.all(totalCalls.map((call) => readContract(call))),
            Promise.all(availableCalls.map((call) => readContract(call))),
            Promise.all(savedCalls.map((call) => readContract(call))),
          ]);

        setBalances({
          available: availableResults,
          total: totalResults,
          savings: savedResults,
        });

        let totalUsd = 0;
        let availableUsd = 0;
        let savedUsd = 0;

        for (let i = 0; i < supportedTokens.length; i++) {
          const token = supportedTokens[i];
          const total = totalResults[i] || 0n;
          const available = availableResults[i] || 0n;
          const saved = savedResults[i] || 0n;

          const totalUsdVal = await convertTokenAmountToUsd(
            token,
            BigInt(total as unknown as number)
          );
          const availableUsdVal = await convertTokenAmountToUsd(
            token,
            BigInt(available as unknown as number)
          );
          const savedUsdVal = await convertTokenAmountToUsd(
            token,
            BigInt(saved as unknown as number)
          );

          totalUsd += getValidNumberValue(totalUsdVal);
          availableUsd += getValidNumberValue(availableUsdVal);
          savedUsd += getValidNumberValue(savedUsdVal);
        }

        setTotalBalance(totalUsd);
        setAvailableBalance(availableUsd);
        setSavingsBalance(savedUsd);
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
  };
};
