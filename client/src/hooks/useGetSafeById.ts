import { useState, useEffect, useMemo } from "react";
import { useGetSafes, SafeDetails } from "@/hooks/useGetSafes";
import { formatUnits } from "viem";
import { tokens } from "@/lib/contract";

export interface FormattedSafeDetails {
  id: string;
  target: string;
  duration: number;
  startTime: Date;
  unlockTime: Date;
  nextUnlockDate: string;
  tokenAmounts: {
    token: string;
    tokenSymbol: string;
    amount: number;
    formattedAmount: string;
  }[];
  totalAmountUSD: number;
  isLocked: boolean;
}

export function useGetSafeById(id: string | undefined) {
  const { safes, isLoading, isError, error } = useGetSafes();
  const [safeDetails, setSafeDetails] = useState<FormattedSafeDetails | null>(
    null
  );

  // Token address to symbol mapping
  const tokenSymbols: Record<string, string> = useMemo(() => {
    return Object.entries(tokens).reduce((acc, [symbol, address]) => {
      acc[address.toLowerCase()] = symbol;
      return acc;
    }, {} as Record<string, string>);
  }, []);

  // Format date to readable string
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  useEffect(() => {
    if (!id || !safes || isLoading || isError) return;

    // Find the safe with the matching ID
    const safe = safes.find((safe) => safe.id.toString() === id);

    if (!safe) return;

    // Format the safe data
    const startTime = new Date(Number(safe.startTime) * 1000);
    const unlockTime = new Date(Number(safe.unlockTime) * 1000);

    // Calculate next unlock date based on duration
    const durationInDays = Number(safe.duration) / (24 * 60 * 60);
    const nextUnlockDate = new Date(unlockTime);

    // If the unlock time is in the past, calculate the next unlock date
    if (unlockTime < new Date()) {
      const currentTime = new Date();
      const timeSinceUnlock = currentTime.getTime() - unlockTime.getTime();
      const cyclesPassed =
        Math.floor(timeSinceUnlock / Number(safe.duration) / 1000) + 1;
      nextUnlockDate.setTime(
        unlockTime.getTime() + cyclesPassed * Number(safe.duration) * 1000
      );
    }

    // Format token amounts
    const formattedTokenAmounts = safe.tokenAmounts.map((token) => {
      const tokenAddress = token.token.toLowerCase();
      const symbol = tokenSymbols[tokenAddress] || "Unknown";
      const amount = Number(
        formatUnits(token.amount, symbol === "USDT" ? 6 : 18)
      );

      return {
        token: token.token,
        tokenSymbol: symbol,
        amount,
        formattedAmount: amount.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 6,
        }),
      };
    });

    // Calculate total amount in USD (simplified conversion)
    const totalAmountUSD = formattedTokenAmounts.reduce((sum, token) => {
      // Simple conversion rates (in a real app, you'd use an API)
      const tokenSymbolLower = token.tokenSymbol.toLowerCase();
      const rate =
        tokenSymbolLower === "safu"
          ? 0.339
          : tokenSymbolLower === "lsk"
          ? 1.25
          : tokenSymbolLower === "usdt"
          ? 1
          : 0;

      const usdValue = token.amount * rate;
      console.log(
        `Token: ${token.tokenSymbol} (${tokenSymbolLower}), Amount: ${token.amount}, Rate: ${rate}, USD Value: ${usdValue}`
      );
      return sum + usdValue;
    }, 0);

    setSafeDetails({
      id: safe.id.toString(),
      target: safe.target,
      duration: Number(safe.duration),
      startTime,
      unlockTime,
      nextUnlockDate: formatDate(nextUnlockDate),
      tokenAmounts: formattedTokenAmounts,
      totalAmountUSD,
      isLocked: Number(safe.duration) > 0,
    });
  }, [id, safes, isLoading, isError, tokenSymbols]);

  return {
    safeDetails,
    isLoading,
    isError,
    error,
  };
}
