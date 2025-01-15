import { useRecoilState } from "recoil";
import { useReadContract, useWatchContractEvent } from "wagmi";
import {
  availableBalanceState,
  savingsBalanceState,
  totalBalanceState,
} from "../store/atoms/save";
import { CoinSafeContract, tokens } from "@/lib/contract";
import { formatUnits } from "viem";
import { getLskToUsd, getSafuToUsd, getUsdtToUsd } from "@/lib";
import { useEffect, useState } from "react";
import { getValidNumberValue } from "@/lib/utils";

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

  // Helper function to convert token amounts to USD
  const convertTokenAmountToUsd = async (
    token: string,
    amount: bigint
  ): Promise<number> => {
    switch (token) {
      case tokens.usdt:
        return (await getUsdtToUsd(
          Number(formatUnits(amount, 6))
        )) as Promise<number>;
      case tokens.safu:
        return getSafuToUsd(Number(formatUnits(amount, 18)));
      case tokens.lsk:
        return (await getLskToUsd(
          Number(formatUnits(amount, 18))
        )) as Promise<number>;
      default:
        console.error("Unknown token address:", token);
        return 0;
    }
  };

  // Helper function to update balances based on event type
  const handleBalanceUpdate = (
    eventType: "deposit" | "withdraw" | "save",
    amountInUsd: number,
    setAvailableBalance: (cb: (prev: number) => number) => void,
    setTotalBalance?: (cb: (prev: number) => number) => void,
    setSavingsBalance?: (cb: (prev: number) => number) => void
  ) => {
    switch (eventType) {
      case "deposit":
        setAvailableBalance((prev) => prev + amountInUsd);
        setTotalBalance?.((prev) => prev + amountInUsd);
        break;
      case "withdraw":
        setAvailableBalance((prev) => prev - amountInUsd);
        setTotalBalance?.((prev) => prev - amountInUsd);
        break;
      case "save":
        setAvailableBalance((prev) => prev - amountInUsd);
        setSavingsBalance?.((prev) => prev + amountInUsd);
        break;
    }
  };

  // Main event handler function
  const createEventHandler = (
    eventType: "deposit" | "withdraw" | "save",
    setAvailableBalance: (cb: (prev: number) => number) => void,
    setTotalBalance?: (cb: (prev: number) => number) => void,
    setSavingsBalance?: (cb: (prev: number) => number) => void
  ) => {
    return async (logs: any) => {
      try {
        console.log("New logs!", logs);

        const log = logs[0];
        const { token, amount } = log.args;

        const amountInUsd = await convertTokenAmountToUsd(token, amount);

        if (amountInUsd === 0) return;

        handleBalanceUpdate(
          eventType,
          amountInUsd,
          setAvailableBalance,
          setTotalBalance,
          setSavingsBalance
        );
      } catch (error) {
        console.error(`Error processing ${eventType} logs:`, error);
      }
    };
  };

  // Usage in hooks
  useWatchContractEvent({
    abi: CoinSafeContract.abi.abi,
    address: CoinSafeContract.address as `0x${string}`,
    eventName: "DepositSuccessful",
    onLogs: createEventHandler("deposit", setAvailableBalance, setTotalBalance),
  });

  useWatchContractEvent({
    abi: CoinSafeContract.abi.abi,
    address: CoinSafeContract.address as `0x${string}`,
    eventName: "Withdrawn",
    onLogs: createEventHandler(
      "withdraw",
      setAvailableBalance,
      setTotalBalance
    ),
  });

  useWatchContractEvent({
    abi: CoinSafeContract.abi.abi,
    address: CoinSafeContract.address as `0x${string}`,
    eventName: "SavedSuccessfully",
    onLogs: createEventHandler(
      "save",
      setAvailableBalance,
      undefined,
      setSavingsBalance
    ),
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
    // setAvailableBalance,
    // setSavingsBalance,
    // setTotalBalance,
    isLoading: {
      ...isLoading,
      any: isAnyLoading,
      contract: isContractLoading,
    },
  };
};
