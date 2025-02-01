import { useRecoilState } from "recoil";
import { useReadContract } from "wagmi";
import {
  availableBalanceState,
  savingsBalanceState,
  totalBalanceState,
} from "../store/atoms/save";
import { CoinSafeContract } from "@/lib/contract";
import { useEffect, useState } from "react";
import { getValidNumberValue } from "@/lib/utils";
import { convertTokenAmountToUsd } from "@/lib/utils";

export const useBalances = (address: string) => {
  const [availableBalance, setAvailableBalance] = useRecoilState(
    availableBalanceState
  );
  const [savingsBalance, setSavingsBalance] =
    useRecoilState(savingsBalanceState);
  const [totalBalance, setTotalBalance] = useRecoilState(totalBalanceState);

  // Loading states
  const [isLoading, setIsLoading] = useState({
    available: false,
    total: false,
    savings: false,
  });

  const TotalBalance = useReadContract({
    abi: CoinSafeContract.abi.abi,
    address: CoinSafeContract.address as `0x${string}`,
    functionName: "getUserBalances",
    args: [address],
  });

  const SavingsBalances = useReadContract({
    abi: CoinSafeContract.abi.abi,
    address: CoinSafeContract.address as `0x${string}`,
    functionName: "getUserSavings",
    args: [address],
  });

  const AvailableBalance = useReadContract({
    abi: CoinSafeContract.abi.abi,
    address: CoinSafeContract.address as `0x${string}`,
    functionName: "getAvailableBalances",
    args: [address],
  });

  // Process available balances
  const processAvailableBalances = async (data: any[]) => {
    setIsLoading((prev) => ({ ...prev, available: true }));
    try {
      const tokenAddresses = data[0];
      const tokenBalances = data[1];
      let totalUsdValue = 0;

      for (let i = 0; i < tokenAddresses.length; i++) {
        const usdValue = await convertTokenAmountToUsd(
          tokenAddresses[i],
          tokenBalances[i]
        );
        totalUsdValue += getValidNumberValue(usdValue);
      }

      setAvailableBalance(totalUsdValue);
    } catch (error) {
      console.error("Error processing available balances:", error);
    } finally {
      setIsLoading((prev) => ({ ...prev, available: false }));
    }
  };

  // Process total balances
  const processTotalBalances = async (data: any[]) => {
    setIsLoading((prev) => ({ ...prev, total: true }));
    try {
      const tokenAddresses = data[0];
      const tokenBalances = data[1];
      let totalUsdValue = 0;

      for (let i = 0; i < tokenAddresses.length; i++) {
        const usdValue = await convertTokenAmountToUsd(
          tokenAddresses[i],
          tokenBalances[i]
        );
        totalUsdValue += getValidNumberValue(usdValue);
      }

      setTotalBalance(totalUsdValue);
    } catch (error) {
      console.error("Error processing total balances:", error);
    } finally {
      setIsLoading((prev) => ({ ...prev, total: false }));
    }
  };

  // Process savings balances
  const processSavingsBalances = async (savingsData: any[]) => {
    setIsLoading((prev) => ({ ...prev, savings: true }));
    try {
      let totalUsdValue = 0;

      for (const plan of savingsData) {
        const usdValue = await convertTokenAmountToUsd(plan.token, plan.amount);
        totalUsdValue += getValidNumberValue(usdValue);
      }

      setSavingsBalance(totalUsdValue);
    } catch (error) {
      console.error("Error processing savings balances:", error);
    } finally {
      setIsLoading((prev) => ({ ...prev, savings: false }));
    }
  };

  useEffect(() => {
    async function processBalances() {
      if (AvailableBalance.data && Array.isArray(AvailableBalance.data)) {
        await processAvailableBalances(AvailableBalance.data);
      }

      if (TotalBalance.data && Array.isArray(TotalBalance.data)) {
        await processTotalBalances(TotalBalance.data);
      }

      if (SavingsBalances.data) {
        await processSavingsBalances(SavingsBalances.data as any[]);
      }
    }

    processBalances();
  }, [AvailableBalance.data, TotalBalance.data, SavingsBalances.data]);

  const isAnyLoading =
    isLoading.available || isLoading.total || isLoading.savings;
  const isContractLoading =
    AvailableBalance.isLoading ||
    TotalBalance.isLoading ||
    SavingsBalances.isLoading;

  return {
    availableBalance,
    savingsBalance,
    totalBalance,
    AvailableBalance,
    TotalBalance,
    SavingsBalances,
    isLoading: {
      ...isLoading,
      any: isAnyLoading,
      contract: isContractLoading,
    },
  };
};
