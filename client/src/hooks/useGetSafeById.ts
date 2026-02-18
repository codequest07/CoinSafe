import { useMemo } from "react";
import { useGetSafes } from "@/hooks/useGetSafes";
import { formatUnits } from "viem";
import { useChainConfig } from "@/hooks/useChainConfig";
import { getTokenDecimals } from "@/lib/token-metadata";
import { useTokenPrices } from "@/lib/price-service";

export interface FormattedSafeDetails {
  id: string;
  target: string;
  feePercentage?: number;
  duration: number;
  startTime: Date;
  unlockTime: Date;
  nextUnlockDate: string;
  tokenAmounts: {
    token: string;
    tokenSymbol: string;
    amount: number;
    formattedAmount: string;
    tokenShares?: bigint;
  }[];
  totalAmountUSD: number;
  isLocked: boolean;
}

export function useGetSafeById(id: string | undefined) {
  const { safes, isLoading, isError, error } = useGetSafes();

  // console.log("All safes from getsafe by id ", safes)
  const { tokens } = useChainConfig();

  // Find the safe with the matching ID
  const safe = useMemo(() => {
    if (!safes || !id) return undefined;
    return safes.find((safe) => safe.id.toString() === id);
  }, [safes, id]);

  // Token address to symbol mapping
  const tokenSymbols: Record<string, string> = useMemo(() => {
    const mapping = Object.entries(tokens).reduce(
      (acc, [symbol, address]) => {
        if (typeof address === "string") {
          acc[address.toLowerCase()] = symbol;
        }
        return acc;
      },
      {} as Record<string, string>,
    );
    return mapping;
  }, [tokens]);

  // Collect token addresses for price fetching
  const tokenAddresses = useMemo(() => {
    if (!safe?.tokenAmounts) return [];
    return safe.tokenAmounts
      .map((t) => t.token)
      .filter((t): t is string => !!t);
  }, [safe]);

  const priceQueries = useTokenPrices(tokenAddresses);

  const priceMap = useMemo(() => {
    const map: Record<string, number> = {};
    tokenAddresses.forEach((addr, idx) => {
      map[addr] = priceQueries[idx].data || 0;
    });
    return map;
  }, [tokenAddresses, priceQueries]);

  // Format date to readable string
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const safeDetails = useMemo<FormattedSafeDetails | null>(() => {
    if (!safe) return null;

    const startTime = new Date(Number(safe.startTime) * 1000);
    const unlockTime = new Date(Number(safe.unlockTime) * 1000);
    const nextUnlockDate = new Date(unlockTime);

    // If the unlock time is in the past, calculate the next unlock date
    if (unlockTime < new Date()) {
      const currentTime = new Date();
      const timeSinceUnlock = currentTime.getTime() - unlockTime.getTime();
      const safeDuration = Number(safe.duration);
      if (safeDuration > 0) {
        const cyclesPassed =
          Math.floor(timeSinceUnlock / safeDuration / 1000) + 1;
        nextUnlockDate.setTime(
          unlockTime.getTime() + cyclesPassed * safeDuration * 1000,
        );
      }
    }

    let totalAmountUSD = 0;

    const aggregatedTokens = new Map<
      string,
      {
        token: string;
        symbol: string;
        amount: bigint;
      }
    >();

    // Aggregate by address to remove duplicates
    safe.tokenAmounts.forEach((token) => {
      if (!token || !token.token) return;

      const tokenAddrLower = token.token.toLowerCase();
      const existing = aggregatedTokens.get(tokenAddrLower);

      const symbol = tokenSymbols[tokenAddrLower] || "Unknown";
      const currentAmount = existing ? existing.amount : 0n;

      aggregatedTokens.set(tokenAddrLower, {
        token: token.token,
        symbol,
        amount: currentAmount + BigInt(token.amount),
      });
    });

    const formattedTokenAmounts = Array.from(aggregatedTokens.values()).map(
      (data) => {
        const tokenDecimals = getTokenDecimals(data.token);
        const formattedValue = Number(formatUnits(data.amount, tokenDecimals));

        const price = priceMap[data.token] || 0;
        totalAmountUSD += formattedValue * price;

        const tokenShares =
          safe.initialShares.find(
            (share) => share.token.toLowerCase() === data.token.toLowerCase(),
          )?.amount || 0n;

        return {
          token: data.token,
          tokenSymbol: data.symbol,
          amount: Number(data.amount),
          formattedAmount: formattedValue.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 6,
          }),
          tokenShares: tokenShares,
        };
      },
    );

    return {
      id: safe.id.toString(),
      target: safe.target,
      duration: Number(safe.duration),
      feePercentage: safe.feePercentage,
      startTime,
      unlockTime,
      nextUnlockDate: formatDate(nextUnlockDate),
      tokenAmounts: formattedTokenAmounts,
      totalAmountUSD,
      isLocked: Number(safe.duration) > 0,
    };
  }, [safe, tokenSymbols, priceMap]);

  return {
    safeDetails,
    tokenAmounts: {}, // Backward compatibility, thought it seems unused in previous code (it was just set but maybe unused)
    isLoading,
    isError,
    error,
  };
}
